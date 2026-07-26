#!/usr/bin/env node
"use strict";

// Post a release summary to a Slack channel via an incoming webhook.
//
// Source of truth is `releases/v<version>.md` — the same notes attached to the
// GitHub Release — so Slack can never disagree with what shipped.
//
// Usage:
//   node scripts/notify-slack.js                 # version from package.json
//   node scripts/notify-slack.js v2.15.0         # explicit version (tag or bare)
//   node scripts/notify-slack.js --dry-run       # print the payload, send nothing
//
// Environment:
//   SLACK_WEBHOOK_URL  required to actually send. When unset the script prints a
//                      notice and exits 0 — a repo without the secret configured
//                      must not fail its release workflow.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const RELEASES_DIR = path.join(ROOT, "releases");

const REPO_URL = "https://github.com/JuankCadavid/akili-specs";
const NPM_URL = "https://www.npmjs.com/package/akili-specs";

// Slack caps a section block's text at 3000 characters. Stay well under it so a
// long release cannot silently truncate mid-word or get the payload rejected.
const SECTION_CHAR_BUDGET = 2600;
const MAX_BULLETS_PER_SECTION = 12;
// Pre-2.x entries predate the `- **Headline.** body` convention, so the whole
// bullet becomes the headline. Cap it so one legacy entry cannot eat the budget.
const MAX_BULLET_CHARS = 180;

function fail(message) {
  console.error(`notify-slack: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { dryRun: false, version: null };
  for (const arg of argv) {
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg.startsWith("-")) fail(`unknown flag ${arg}`);
    else args.version = arg.replace(/^v/, "");
  }
  return args;
}

function readVersion(explicit) {
  if (explicit) return explicit;
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8"));
  return pkg.version;
}

// Strip the trailing "## Verification" / "## Publish" boilerplate that
// release.js appends — those are instructions for the releaser, not changes.
function extractChangeBody(notes) {
  const withoutHeader = notes.replace(/^#\s+v[\d.]+[^\n]*\n/, "");
  const cutIndex = withoutHeader.search(/^## (Verification|Publish)\s*$/m);
  const body = cutIndex === -1 ? withoutHeader : withoutHeader.slice(0, cutIndex);
  return body.replace(/^Release date:[^\n]*\n/m, "").trim();
}

// The changelog convention is `- **Headline.** elaboration...`. The bold
// lead-in is the digest; the elaboration is what the full notes are for.
function extractSections(body) {
  const sections = [];
  let current = null;

  for (const line of body.split("\n")) {
    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      current = { title: heading[1], bullets: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;

    const bullet = line.match(/^-\s+(.*)$/);
    if (!bullet) continue;

    const text = bullet[1].trim();
    const bold = text.match(/^\*\*(.+?)\*\*/);
    const headline = bold ? bold[1] : text;
    current.bullets.push(stripMarkdown(headline));
  }

  return sections.filter((section) => section.bullets.length > 0);
}

// Slack's mrkdwn is not Markdown. Flatten the constructs the changelog uses so
// they render as plain text rather than stray asterisks and brackets.
function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → label
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/(^|\s)\*(?!\s)(.+?)(?<!\s)\*/g, "$1$2") // italics
    .replace(/`([^`]+)`/g, "`$1`") // inline code survives as-is in mrkdwn
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.:]+$/, "");
}

function truncateBullet(text) {
  if (text.length <= MAX_BULLET_CHARS) return text;
  const clipped = text.slice(0, MAX_BULLET_CHARS);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 60 ? clipped.slice(0, lastSpace) : clipped).replace(/[.,;:—-]+$/, "")}…`;
}

function budgetedBulletList(bullets) {
  const shown = [];
  let used = 0;
  let dropped = 0;

  for (const [index, bullet] of bullets.entries()) {
    const line = `• ${truncateBullet(bullet)}`;
    if (index >= MAX_BULLETS_PER_SECTION || used + line.length + 1 > SECTION_CHAR_BUDGET) {
      dropped = bullets.length - shown.length;
      break;
    }
    shown.push(line);
    used += line.length + 1;
  }

  if (dropped > 0) shown.push(`_…and ${dropped} more — see the full notes_`);
  return shown.join("\n");
}

function buildPayload(version, sections) {
  const releaseUrl = `${REPO_URL}/releases/tag/v${version}`;

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: `🚀 akili-specs v${version}`, emoji: true },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${releaseUrl}|Release v${version}>* is published to <${NPM_URL}|npm>.\n\`npm install -g akili-specs\``,
      },
    },
  ];

  if (sections.length === 0) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: "_No categorized changes found in the release notes._" },
    });
  }

  for (const section of sections) {
    blocks.push({ type: "divider" });
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*${section.title}*\n${budgetedBulletList(section.bullets)}` },
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `<${releaseUrl}|Full release notes> · <${REPO_URL}/blob/master/CHANGELOG.md|Changelog> · <${NPM_URL}|npm>`,
      },
    ],
  });

  // `text` is the notification fallback shown in the sidebar and on mobile push.
  return { text: `akili-specs v${version} released`, blocks };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const version = readVersion(args.version);
  const notesPath = path.join(RELEASES_DIR, `v${version}.md`);

  if (!fs.existsSync(notesPath)) {
    fail(`release notes not found: ${path.relative(ROOT, notesPath)}`);
  }

  const sections = extractSections(extractChangeBody(fs.readFileSync(notesPath, "utf8")));
  const payload = buildPayload(version, sections);

  if (args.dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) {
    console.log("notify-slack: SLACK_WEBHOOK_URL is not set — skipping (this is not an error).");
    return;
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    fail(`Slack returned ${response.status} ${response.statusText}${detail ? ` — ${detail}` : ""}`);
  }

  console.log(`notify-slack: posted v${version} (${sections.length} section(s)).`);
}

main().catch((error) => fail(error.message));

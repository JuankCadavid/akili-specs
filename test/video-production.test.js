"use strict";

// @akili-spec changes/video-deliverable-track — static contract tests for the
// packaged bridge skill `video-production` and the command / governance text
// that routes `Deliverable: video` to it. Each test names the requirement it
// proves (requirements.md FR-4, FR-5, FR-6, FR-8, FR-9, FR-10, §7 NFR-1..4;
// design.md §9, DD-8, DD-10, DD-12, §11 P-5, P-22).
//
// These are text contracts: the shipped artifacts ARE prose an agent follows,
// so each test asserts the rule is stated where the agent reads it (the right
// row / line / section), not merely that a word occurs somewhere.
//
// Falsifier hook: VIDEO_PRODUCTION_TEST_ROOT points the text tests at a
// scratch copy of the repo files so a mutation can be run without touching
// the working tree. Unset, the tests read this checkout.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const ROOT = process.env.VIDEO_PRODUCTION_TEST_ROOT || REPO_ROOT;
const SKILL_DIR = path.join(ROOT, ".claude", "skills", "video-production");
const SKILL_MD = path.join(SKILL_DIR, "SKILL.md");
const RENDER_EVIDENCE = path.join(SKILL_DIR, "references", "render-evidence.md");
const GOVERNANCE = path.join(ROOT, "docs", "skills", "governance.md");
const COMMANDS = path.join(ROOT, ".claude", "commands");
const AKILI_BIN = path.join(REPO_ROOT, "bin", "akili.js");

function read(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

// Minimal YAML frontmatter reader: top-level keys and one level of
// two-space-indented `metadata:` children. Values keep surrounding quotes off.
function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "expected a YAML frontmatter block");
  const top = {};
  const nested = {};
  let parent = null;
  for (const line of match[1].split("\n")) {
    const child = line.match(/^ {2}([A-Za-z0-9_-]+):\s*(.*)$/);
    const root = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    const clean = (v) => v.replace(/^"(.*)"$/, "$1");
    if (root) {
      parent = root[1];
      top[parent] = clean(root[2]);
    } else if (child && parent) {
      nested[parent] = nested[parent] || {};
      nested[parent][child[1]] = clean(child[2]);
    }
  }
  return { top, nested, lineCount: match[0].split("\n").length - 1 };
}

// Lines from a `## Heading` up to (not including) the next heading of the
// same or higher level.
function section(text, heading) {
  const lines = text.split("\n");
  const level = heading.match(/^#+/)[0].length;
  const start = lines.findIndex((l) => l.trim() === heading);
  assert.ok(start >= 0, `expected heading "${heading}"`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const h = lines[i].match(/^(#+)\s/);
    if (h && h[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

// A numbered list item ("N. **…") through the line before the next numbered
// item or the next blank line that is followed by a non-indented line.
function numberedRule(text, n) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`${n}. **`));
  assert.ok(start >= 0, `expected numbered rule ${n}`);
  const out = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\d+\. \*\*/.test(lines[i]) || lines[i].trim() === "") break;
    out.push(lines[i]);
  }
  return out.join(" ").replace(/\s+/g, " ");
}

function countOf(text, needle) {
  return text.split(needle).length - 1;
}

const skillText = () => read(SKILL_MD);
const skillLines = () => skillText().split("\n");

// ---------------------------------------------------------------------------

test("FR-8: frontmatter is the original-authorship variant (name, MIT, author, conditional, inspired-by credits HyperFrames/HeyGen/Apache-2.0; no source/adapted-by)", () => {
  const { top, nested } = frontmatter(skillText());
  assert.equal(top.name, "video-production");
  assert.doesNotMatch(top.name, /^hyperframes-/, "FR-8 BUT: must NOT be named hyperframes-*");
  assert.equal(top.license, "MIT");
  const meta = nested.metadata || {};
  assert.equal(meta.author, "Juan Carlos Cadavid — jcadavid.com");
  assert.equal(meta.binding, "conditional");
  assert.ok(meta["inspired-by"], "expected metadata.inspired-by");
  for (const credit of ["HyperFrames", "HeyGen", "Apache-2.0"]) {
    assert.ok(meta["inspired-by"].includes(credit), `inspired-by must credit ${credit}`);
  }
  for (const key of ["source", "adapted-by"]) {
    assert.ok(!(key in meta) && !(key in top), `original-authorship skill must not carry ${key}`);
  }
});

test("FR-8 BUT: 'HeyGen' appears only on the inspired-by line, install-route lines, and the Attribution section (never presented as a HeyGen product)", () => {
  const text = skillText();
  const lines = text.split("\n");
  const attrStart = lines.findIndex((l) => l.trim() === "## Attribution");
  assert.ok(attrStart >= 0, "expected an Attribution section");
  const offenders = [];
  lines.forEach((line, i) => {
    if (!/heygen/i.test(line)) return;
    const inspired = /^\s+inspired-by:/.test(line);
    const installRoute = /npx skills add heygen-com\//.test(line);
    const attribution = i > attrStart;
    if (!inspired && !installRoute && !attribution) offenders.push(`${i + 1}: ${line}`);
  });
  assert.deepEqual(offenders, [], "HeyGen named outside the allowed sites");
  assert.match(section(text, "## Attribution"), /not a HeyGen product/);
});

test("NFR-3: bridge skill is at most 3 files and at most 20,000 bytes", () => {
  const files = listFiles(SKILL_DIR);
  assert.equal(files.length, 3, `expected exactly 3 files, got ${files.map((f) => path.relative(SKILL_DIR, f)).join(", ")}`);
  const bytes = files.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  assert.ok(bytes <= 20000, `expected ≤ 20000 bytes, got ${bytes}`);
});

test("NFR-2 / DD-8: every instructed `npx hyperframes` subcommand is in the verified set; outward actions are only named on the consent-rule line", () => {
  const allowed = new Set(["check", "snapshot", "render", "preview", "skills update", "skills check"]);
  const outward = /\b(feedback|publish|cloud|lambda|cloudrun)\b|--file-issue/i;
  const seen = new Set();
  const misplaced = [];
  for (const file of listFiles(SKILL_DIR)) {
    const rel = path.relative(SKILL_DIR, file);
    read(file).split("\n").forEach((line, i) => {
      for (const m of line.matchAll(/npx hyperframes ([a-z-]+)(?: ([a-z-]+))?/g)) {
        const sub = m[1] === "skills" ? `skills ${m[2]}` : m[1];
        seen.add(sub);
        assert.ok(allowed.has(sub), `${rel}:${i + 1} instructs unverified subcommand "npx hyperframes ${sub}"`);
      }
      assert.doesNotMatch(
        line,
        /npx hyperframes (feedback|publish|cloud|lambda|cloudrun)\b|npx hyperframes [^`|]*--file-issue/,
        `${rel}:${i + 1} instructs an outward action`
      );
      if (outward.test(line) && !/\*\*Consent rule\.\*\*/.test(line)) misplaced.push(`${rel}:${i + 1}: ${line}`);
    });
  }
  assert.deepEqual(misplaced, [], "outward actions named outside the consent rule");
  for (const sub of ["check", "snapshot", "render"]) assert.ok(seen.has(sub), `expected the skill to instruct ${sub}`);
});

test("FR-5: telemetry off by default and every outward action needs consent each time", () => {
  const privacy = section(skillText(), "## Privacy and outward actions");
  assert.match(privacy, /Prefix every HyperFrames command with `HYPERFRAMES_NO_TELEMETRY=1` unless the user has opted in/);
  const consent = privacy.split("\n").find((l) => /\*\*Consent rule\.\*\*/.test(l));
  assert.ok(consent, "expected the consent rule line");
  for (const name of ["`feedback`", "`--file-issue`", "`publish`", "`cloud`", "`lambda`", "`cloudrun`"]) {
    assert.ok(consent.includes(name), `consent rule must name ${name}`);
  }
  assert.match(consent, /explicit consent \*\*each time\*\*/);
  assert.match(consent, /earlier consent does not carry over/);
  assert.match(consent, /post-render report; under AKILI that suggestion is \*\*off\*\*/, "FR-5 scenario: post-render feedback report is NOT sent");
});

test("FR-4: availability gate accepts standalone and plugin-namespaced router; missing router stops without improvising or installing", () => {
  const gate = section(skillText(), "## Step 0 — Availability gate (before any video work)");
  assert.match(gate, /`hyperframes` \(standalone install\)/);
  assert.match(gate, /plugin-namespaced router such as `\/hyperframes:hyperframes`/);
  const missing = gate.split("\n").find((l) => l.startsWith("| Router missing"));
  assert.ok(missing, "expected a Router missing row");
  assert.match(missing, /\*\*STOP\.\*\*/);
  assert.match(missing, /do not hand-write a video pipeline/i);
  assert.match(missing, /do not copy HyperFrames text into the repo/);
  assert.match(missing, /do not install anything without the user's consent/);
});

test("FR-4 / DD-10 (P-24): agent install route is project-scoped (no -g); `skills update` is labelled global and consent-gated", () => {
  const lines = skillLines();
  const route = lines.find((l) => l.includes("npx skills add heygen-com/hyperframes --yes"));
  assert.ok(route, "expected the non-interactive core-set route");
  const cmd = route.match(/`(npx skills add heygen-com\/hyperframes --yes[^`]*)`/)[1];
  assert.doesNotMatch(cmd, /(^|\s)(-g|--global)(\s|$)/, "project-scoped route must not carry -g/--global");
  assert.match(cmd, /--skill hyperframes /);
  assert.match(route, /project-scoped/);
  const update = lines.find((l) => l.includes("`npx hyperframes skills update`") && l.startsWith("| Global install"));
  assert.ok(update, "expected the Global install row naming skills update");
  assert.match(update, /\*\*globally\*\*/);
  assert.match(update, /explicit consent/);
});

test("FR-4 (A3, first render): consent row warns of the browser download, home caches and network before any render", () => {
  const row = skillLines().find((l) => l.startsWith("| First render on a machine"));
  assert.ok(row, "expected the First render render-rule row");
  assert.match(row, /Before the first render, draft or delivery/);
  assert.match(row, /headless browser \(~200 MB\) into `~\/\.cache\/hyperframes`/);
  assert.match(row, /`~\/\.hyperframes`/);
  assert.match(row, /needs network/);
  assert.match(row, /render only after the user consents/);
  assert.match(row, /runtime caches, not a skill install/);
});

test("FR-4 (A3, freshness scope): `skills check` is stated as global-only and never certifies a project install", () => {
  const row = skillLines().find((l) => l.startsWith("| `npx hyperframes skills check`"));
  assert.ok(row, "expected the skills check command row");
  assert.match(row, /Reads only the user's global skills directory/);
  assert.match(row, /never certifies a project install/);
  assert.match(row, /`skills-lock\.json`/);
});

test("NFR-4: project-scoped host directories cover Claude Code, OpenCode, Codex, Cursor, Antigravity", () => {
  const lines = skillLines();
  const claude = lines.find((l) => /^\| Claude Code \|/.test(l));
  assert.ok(claude && claude.includes("`.claude/skills`"), "Claude Code → .claude/skills");
  const agents = lines.find((l) => /^\| OpenCode, Codex, Cursor, Antigravity \|/.test(l));
  assert.ok(agents && agents.includes("`.agents/skills`"), "OpenCode/Codex/Cursor/Antigravity → .agents/skills");
});

test("FR-6 / DD-12: duration compared with BOTH target ± tolerance (default ± 0.1 s) and root data-duration; check exit 0 never offsets it", () => {
  const dur = section(read(RENDER_EVIDENCE), "## Duration comparison");
  assert.match(dur, /Compare `format\.duration` from `ffprobe` with \*\*both\*\*/);
  const rows = dur.split("\n").filter((l) => l.startsWith("| ") && !/^\| (Compared with|---)/.test(l));
  assert.equal(rows.length, 2, "expected exactly two comparison rows");
  assert.ok(rows.some((r) => /target duration, within its stated tolerance \(default \*\*± 0\.1 s\*\* when none is stated\)/.test(r)), "target ± tolerance row with default ± 0.1 s");
  assert.ok(rows.some((r) => /root `data-duration`/.test(r)), "root data-duration row");
  assert.match(dur, /Report FAIL citing both values and the tolerance if either comparison fails/);
  assert.match(dur, /A zero exit from `check` never offsets a duration failure/, "FR-6 BUT: must NOT pass because check exited 0");
});

test("NFR-1 / P-22: `Deliverable: video` gates the specify, test and validate blocks (settled enumeration as lower bounds)", () => {
  const expected = { "akili-specify.md": 5, "akili-test.md": 3, "akili-validate.md": 4 };
  for (const [file, min] of Object.entries(expected)) {
    const n = countOf(read(path.join(COMMANDS, file)), "Deliverable: video");
    assert.ok(n >= min, `${file}: expected ≥ ${min} "Deliverable: video", got ${n}`);
  }
});

test("NFR-1 / FR-1 Default: specify Video Mode states an absent Deliverable row means software", () => {
  const block = section(read(path.join(COMMANDS, "akili-specify.md")), "### Video Mode");
  assert.match(block, /When the proposal's Document Control says `Deliverable: video`/);
  assert.match(block, /An absent `Deliverable` row means `software`: Video Mode does not apply and nothing below changes/);
});

test("FR-9 (amended): governance rule 4 uses load-direct and exempts illustrative / Skill Map-builder mentions", () => {
  const rule4 = numberedRule(read(GOVERNANCE), 4);
  assert.match(rule4, /load-direct/);
  assert.match(rule4, /only when \(a\) the spec records a `Deliverable` selector/);
  assert.match(rule4, /\(b\) that skill's own availability gate runs first/);
  assert.match(rule4, /Illustrative and Skill Map-builder mentions/);
  assert.match(rule4, /direct no load and are not restricted/);
});

test("FR-9 (amended): governance rule 2 no longer states the unconditional 'every command must still work without it'", () => {
  const rule2 = numberedRule(read(GOVERNANCE), 2);
  assert.doesNotMatch(rule2, /every command must still work without it/i);
  assert.match(rule2, /every command still runs without it/);
  assert.match(rule2, /a spec whose `Deliverable` selects an environment-provided skill stops at that skill's availability gate/);
});

test("FR-10 / P-5: `install --tool all --dry-run` lists video-production for every tool target and writes nothing", () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "akili-video-"));
  try {
    const result = spawnSync(process.execPath, [AKILI_BIN, "install", "--tool", "all", "--dry-run"], {
      encoding: "utf8",
      env: {
        ...process.env,
        HOME: home,
        USERPROFILE: home,
        CODEX_HOME: path.join(home, ".codex"),
        CURSOR_CONFIG_DIR: path.join(home, ".cursor"),
        NO_COLOR: "1",
      },
    });
    assert.equal(result.status, 0, `dry-run failed:\n${result.stderr}`);
    const out = result.stdout.replace(/\x1b\[[0-9;]*m/g, "");
    const blocks = out.split(/\n(?=(?:CLAUDE|OPENCODE|ANTIGRAVITY|CODEX|CURSOR) target:)/).slice(1);
    const tools = blocks.map((b) => b.match(/^(\w+) target:/)[1]);
    assert.deepEqual(tools, ["CLAUDE", "OPENCODE", "ANTIGRAVITY", "CODEX", "CURSOR"]);
    for (const block of blocks) {
      const tool = block.match(/^(\w+)/)[1];
      assert.match(block, /would install \S+[\\/]skills[\\/]video-production\b/, `${tool} dry-run does not list video-production`);
    }
    assert.match(out, /dry-run: no files were written/);
    assert.deepEqual(fs.readdirSync(home), [], "dry-run must write nothing into HOME");
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

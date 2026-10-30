#!/usr/bin/env node
// @akili-spec changes/impeccable-hardening (T1)
//
// Maintainer-only (not shipped: package.json "files" is an explicit list).
// Vendors the `.claude/skills/impeccable/` build of a LOCAL upstream checkout
// (https://github.com/pbakaus/impeccable) into this repo. It never fetches:
// the maintainer provides the checkout. Imports no network module.
//
//   node scripts/sync-impeccable.js --from <checkout> --commit <sha>
//
// The only modification to an upstream file is the AKILI `metadata` block
// inserted as the last frontmatter key of SKILL.md (design.md 5.2).

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const TARGET = path.join(ROOT, ".claude", "skills", "impeccable");
const SOURCE_URL = "https://github.com/pbakaus/impeccable";
const BUILD = ".claude/skills/impeccable/";

function fail(message) {
  console.error(`sync-impeccable: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--from" || a === "--commit") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) fail(`${a} requires a value`);
      args[a.slice(2)] = value;
      i += 1;
    } else if (a.startsWith("--from=")) {
      args.from = a.slice(7);
    } else if (a.startsWith("--commit=")) {
      args.commit = a.slice(9);
    } else {
      fail(`unknown argument: ${a}`);
    }
  }
  return args;
}

function git(cwd, gitArgs) {
  return execFileSync("git", gitArgs, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function listFiles(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, base, out);
    else if (entry.isFile()) out.push(path.relative(base, full).split(path.sep).join("/"));
    else fail(`unsupported entry (not a regular file): ${full}`);
  }
  return out;
}

// The vendored file list comes from what upstream TRACKS at HEAD, never from
// the directory on disk: upstream git-ignores the engine binary
// (`scripts/bin/`), `scripts/config.json` and `.impeccable/hook.cache.json`,
// and a plain `git status --porcelain` cannot see ignored files.
function trackedBuildFiles(from) {
  const out = execFileSync("git", ["ls-files", "-z", "-s", "--", BUILD], {
    cwd: from,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const files = [];
  for (const rec of out.split("\0").filter(Boolean)) {
    const m = rec.match(/^(\d{6}) [0-9a-f]+ \d\t(.+)$/);
    if (!m) fail(`unparseable git ls-files record: ${rec}`);
    if (m[1] === "120000" || m[1] === "160000") fail(`unsupported tracked entry (symlink/submodule): ${m[2]}`);
    files.push(m[2].slice(BUILD.length));
  }
  return files;
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function sizeOf(dir) {
  if (!fs.existsSync(dir)) return 0;
  return listFiles(dir).reduce((n, f) => n + fs.statSync(path.join(dir, f)).size, 0);
}

function readOldPin() {
  const p = path.join(TARGET, "UPSTREAM.md");
  if (!fs.existsSync(p)) return { commit: "(none)", count: 0 };
  const text = fs.readFileSync(p, "utf8");
  const m = text.match(/\|\s*Commit\s*\|\s*`?([0-9a-f]{7,40})`?\s*\|/i);
  const count = (text.match(/^[0-9a-f]{64} {2}\S/gm) || []).length;
  return { commit: m ? m[1] : "(unknown)", count };
}

// Splits SKILL.md into the frontmatter body lines and the closing fence offset.
function frontmatterEnd(text) {
  if (!text.startsWith("---\n")) fail("upstream SKILL.md does not start with a frontmatter fence");
  const close = text.indexOf("\n---\n", 3);
  if (close === -1) fail("upstream SKILL.md frontmatter has no closing fence");
  return close + 1; // offset of the closing `---` line
}

function frontmatterValue(text, key) {
  const end = frontmatterEnd(text);
  const m = text.slice(0, end).match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
}

function metadataBlock(short) {
  return [
    "metadata:",
    "  author: Paul Bakaus",
    `  source: ${SOURCE_URL} (${short}, .claude build)`,
    "  adapted-by: Juan Carlos Cadavid — jcadavid.com",
    "  adapted-for: AKILI-SPECS (vendored verbatim; see UPSTREAM.md)",
    "  binding: conditional",
    "",
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.from) fail("--from <upstream checkout> is required");
  if (!args.commit) fail("--commit <sha> is required");
  const from = path.resolve(args.from);
  if (!fs.existsSync(from) || !fs.statSync(from).isDirectory()) fail(`--from is not a directory: ${from}`);

  let head;
  try {
    head = git(from, ["rev-parse", "HEAD"]);
    if (git(from, ["status", "--porcelain"]) !== "") {
      fail(`upstream checkout is dirty (uncommitted or untracked changes): ${from}`);
    }
  } catch (e) {
    if (e.status === undefined) throw e;
    fail(`not a usable git checkout: ${from}`);
  }
  const wanted = args.commit.toLowerCase();
  if (!/^[0-9a-f]{7,40}$/.test(wanted) || !head.startsWith(wanted)) {
    fail(`--commit ${args.commit} is not the checkout HEAD (${head})`);
  }

  const srcBuild = path.join(from, ".claude", "skills", "impeccable");
  if (!fs.existsSync(srcBuild) || !fs.statSync(srcBuild).isDirectory()) {
    fail(`upstream checkout has no ${BUILD}`);
  }
  const srcLicense = path.join(from, "LICENSE");
  const srcNotice = path.join(from, "NOTICE.md");
  for (const f of [srcLicense, srcNotice, path.join(srcBuild, "SKILL.md"), path.join(srcBuild, "scripts", "VERSION")]) {
    if (!fs.existsSync(f)) fail(`upstream checkout is missing ${path.relative(from, f)}`);
  }

  // Refuse the engine binary (and any other ignored/untracked build content) explicitly.
  const binDir = path.join(srcBuild, "scripts", "bin");
  if (fs.existsSync(binDir)) {
    fail(`upstream checkout has ${BUILD}scripts/bin/ (the engine binary is never vendored, DD-2): remove it from ${from}`);
  }
  let buildState;
  try {
    buildState = git(from, ["status", "--porcelain", "--ignored", "--", BUILD]);
  } catch (e) {
    if (e.status === undefined) throw e;
    fail(`could not read the build state of: ${from}`);
  }
  if (buildState !== "") {
    fail(`upstream ${BUILD} has untracked, modified or ignored content (git status --porcelain --ignored):\n${buildState}`);
  }

  const short = head.slice(0, 7);
  const files = trackedBuildFiles(from).sort();
  if (files.some((f) => f === "scripts/bin" || f.startsWith("scripts/bin/"))) {
    fail(`upstream tracks files under ${BUILD}scripts/bin/; the engine binary is never vendored (DD-2)`);
  }
  if (files.length === 0) fail(`upstream tracks no files under ${BUILD}`);
  const skillUpstream = fs.readFileSync(path.join(srcBuild, "SKILL.md"), "utf8");
  if (/^metadata:/m.test(skillUpstream.slice(0, frontmatterEnd(skillUpstream)))) {
    fail("upstream SKILL.md already has a metadata key; the hash-restore property (DD-3) would break");
  }
  const skillVersion = frontmatterValue(skillUpstream, "version");
  if (!skillVersion) fail("upstream SKILL.md frontmatter has no version");
  const engineVersion = fs.readFileSync(path.join(srcBuild, "scripts", "VERSION"), "utf8").trim();

  const old = readOldPin();
  const oldSize = sizeOf(TARGET);

  fs.rmSync(TARGET, { recursive: true, force: true });
  const lines = [];
  for (const rel of files) {
    const bytes = fs.readFileSync(path.join(srcBuild, rel));
    lines.push(`${sha256(bytes)}  ${rel}`);
    const dest = path.join(TARGET, ...rel.split("/"));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    let out = bytes;
    if (rel === "SKILL.md") {
      const end = frontmatterEnd(skillUpstream);
      out = Buffer.from(skillUpstream.slice(0, end) + metadataBlock(short) + skillUpstream.slice(end), "utf8");
    }
    fs.writeFileSync(dest, out);
    fs.chmodSync(dest, fs.statSync(path.join(srcBuild, rel)).mode & 0o777);
  }

  fs.copyFileSync(srcLicense, path.join(TARGET, "LICENSE"));

  const notice = fs.readFileSync(srcNotice);
  const akiliNotice = [
    "",
    "",
    "---",
    "",
    "## AKILI-SPECS modification statement",
    "",
    `This folder is vendored from ${SOURCE_URL} at commit ${head} (skill ${skillVersion}, engine ${engineVersion}).`,
    "",
    "The only modification is the frontmatter block in `SKILL.md`: a `metadata` key is added as the last frontmatter key, with `author`, `source`, `adapted-by`, `adapted-for` and `binding`. No other file is modified; see `UPSTREAM.md` for the per-file checksums.",
    "",
    "AKILI-SPECS is not affiliated with the Impeccable project.",
    "",
  ].join("\n");
  const noticeBase = notice.toString("utf8").replace(/\n*$/, "");
  fs.writeFileSync(path.join(TARGET, "NOTICE"), noticeBase + akiliNotice, "utf8");

  const vendored = new Date();
  const date = `${vendored.getFullYear()}-${String(vendored.getMonth() + 1).padStart(2, "0")}-${String(vendored.getDate()).padStart(2, "0")}`;
  const upstreamMd = [
    "# Upstream pin",
    "",
    "| Field | Value |",
    "|---|---|",
    `| Source | ${SOURCE_URL} |`,
    `| Build | \`${BUILD}\` |`,
    `| Commit | ${head} |`,
    `| Skill version | ${skillVersion} |`,
    `| Engine version | ${engineVersion} |`,
    `| Vendored | ${date} |`,
    "| Synced by | `scripts/sync-impeccable.js` |",
    "",
    "## Modification",
    "",
    "`SKILL.md`: AKILI `metadata` block inserted before the closing frontmatter fence; no other file modified.",
    "",
    "## Checksums",
    "",
    "`sha256  path`, one line per upstream file; the `SKILL.md` hash is of the upstream bytes.",
    "",
    "```text",
    ...lines,
    "```",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(TARGET, "UPSTREAM.md"), upstreamMd, "utf8");

  const newSize = sizeOf(TARGET);
  const sign = (n) => (n >= 0 ? `+${n}` : `${n}`);
  console.log(`Pin: ${old.commit} -> ${head}`);
  console.log(`Files: ${old.count} -> ${files.length} (${sign(files.length - old.count)})`);
  console.log(`Size: ${oldSize} -> ${newSize} bytes (${sign(newSize - oldSize)})`);
  console.log("Reminder: update CHANGELOG.md and the counts tests (install-cursor, akili-marketing-docs, doctor-codex fixture, docs-overview).");
}

main();

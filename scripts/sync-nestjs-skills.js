#!/usr/bin/env node
// @akili-spec changes/nestjs-official-skills (T1)
//
// Maintainer-only (not shipped: package.json "files" is an explicit list, P-6).
// Vendors the six official NestJS skills from a LOCAL checkout of
// https://github.com/nestjs/agent-skills into .claude/skills/<name>/. It never
// fetches anything (NFR-2): the maintainer provides the checkout and the npm
// shasum.
//
// Maintainer steps, before running:
//   1. In the upstream clone: `git checkout <tag>` (the commit must be HEAD).
//   2. `npm view @nestjs/skills@<version> dist.shasum` -> the 40-hex argument.
//   3. node scripts/sync-nestjs-skills.js --from <checkout> --commit <sha-or-tag> --npm-shasum <40-hex>
//
// Every byte is read from git objects (`git cat-file blob`), never from the
// working tree, so autocrlf / eol attributes cannot change a hash. All six
// folders are built under <repo>/.nestjs-sync/staging/ (gitignored, outside
// .claude/), then swapped in as ONE transaction that rolls back on any failure.
//
// Test-only seams (not user features): NESTJS_SYNC_ROOT redirects the AKILI
// repo root; NESTJS_SYNC_FAIL_RENAME_AT=<n> fails the n-th rename of step 6(b).

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = process.env.NESTJS_SYNC_ROOT ? path.resolve(process.env.NESTJS_SYNC_ROOT) : path.resolve(__dirname, "..");
const SKILLS = path.join(ROOT, ".claude", "skills");
const WORK = path.join(ROOT, ".nestjs-sync");
const STAGING = path.join(WORK, "staging");
const ASIDE = path.join(WORK, "aside");
const NAMES = ["nestjs", "nestjs-feature", "nestjs-auth", "nestjs-data", "nestjs-testing", "nestjs-production"];
const SOURCE_URL = "https://github.com/nestjs/agent-skills";
const PROVENANCE = ["LICENSE", "NOTICE", "UPSTREAM.md"];

class Refusal extends Error {}

function fail(message) {
  throw new Refusal(message);
}

function parseArgs(argv) {
  const args = {};
  const keys = ["from", "commit", "npm-shasum"];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const eq = a.match(/^--([a-z-]+)=(.*)$/);
    if (eq && keys.includes(eq[1])) {
      args[eq[1]] = eq[2];
    } else if (a.startsWith("--") && keys.includes(a.slice(2))) {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) fail(`${a} requires a value`);
      args[a.slice(2)] = value;
      i += 1;
    } else {
      fail(`unknown argument: ${a}`);
    }
  }
  return args;
}

function gitBuf(cwd, gitArgs) {
  return execFileSync("git", gitArgs, { cwd, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024 });
}

function git(cwd, gitArgs) {
  return gitBuf(cwd, gitArgs).toString("utf8").trim();
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function frontmatterEnd(text, label) {
  if (!text.startsWith("---\n")) fail(`${label} does not start with a frontmatter fence`);
  const close = text.indexOf("\n---\n", 3);
  if (close === -1) fail(`${label} frontmatter has no closing fence`);
  return close + 1; // offset of the closing `---` line
}

function metadataBlock(short, version) {
  return [
    "metadata:",
    "  author: Kamil Mysliwiec (NestJS)",
    `  source: ${SOURCE_URL} (${short}, v${version})`,
    "  adapted-by: Juan Carlos Cadavid — jcadavid.com",
    "  adapted-for: AKILI-SPECS (vendored verbatim; see UPSTREAM.md)",
    "  binding: stack",
    "",
  ].join("\n");
}

function parseChecksums(text) {
  const map = new Map();
  for (const m of text.matchAll(/^([0-9a-f]{64}) {2}(\S.*)$/gm)) map.set(m[2], m[1]);
  return map;
}

// Steps 2-3: validate the checkout and build the in-memory inventory.
function inventory(args) {
  const from = path.resolve(args.from);
  if (!fs.existsSync(from) || !fs.statSync(from).isDirectory()) fail(`--from is not a directory: ${from}`);
  if (!/^[0-9a-f]{40}$/.test(args["npm-shasum"])) fail("--npm-shasum must be 40 lowercase hex characters");
  if (args.commit.startsWith("-")) fail(`--commit is not a valid revision: ${args.commit}`);

  let head;
  let wanted;
  try {
    head = git(from, ["rev-parse", "--verify", "HEAD^{commit}"]);
    wanted = git(from, ["rev-parse", "--verify", `${args.commit}^{commit}`]);
  } catch (e) {
    if (e.status === undefined) throw e;
    fail(`not a usable git checkout, or --commit does not resolve: ${from}`);
  }
  if (wanted !== head) fail(`--commit ${args.commit} (${wanted}) is not the checkout HEAD (${head}); run git checkout first`);
  const dirty = git(from, ["status", "--porcelain", "--ignored", "--", "skills", "LICENSE"]);
  if (dirty !== "") fail(`upstream checkout is dirty (uncommitted, untracked or ignored content):\n${dirty}`);

  let version;
  let license;
  try {
    version = JSON.parse(gitBuf(from, ["show", `${head}:package.json`]).toString("utf8")).version;
    license = gitBuf(from, ["show", `${head}:LICENSE`]);
  } catch (e) {
    if (e.status === undefined && !(e instanceof SyntaxError)) throw e;
    fail("upstream package.json or LICENSE is missing or unreadable at the commit");
  }
  if (!version || typeof version !== "string") fail("upstream package.json has no version");
  const copyright = license.toString("utf8").split("\n").find((l) => /^\s*copyright\b/i.test(l));
  if (!copyright) fail("upstream LICENSE has no copyright line");

  const folders = [];
  for (const name of NAMES) {
    const prefix = `skills/${name}/`;
    const out = gitBuf(from, ["ls-tree", "-r", "-z", head, "--", prefix]).toString("utf8");
    const files = [];
    for (const rec of out.split("\0").filter(Boolean)) {
      const m = rec.match(/^(\d{6}) (\w+) ([0-9a-f]{40})\t(.+)$/);
      if (!m) fail(`unparseable git ls-tree record: ${rec}`);
      if (m[1] === "120000" || m[1] === "160000" || m[2] !== "blob") fail(`unsupported tracked entry (symlink/submodule): ${m[4]}`);
      const rel = m[4].slice(prefix.length);
      if (PROVENANCE.includes(rel)) fail(`upstream ${prefix} already has ${rel}, which AKILI writes`);
      files.push({ rel, mode: m[1], object: m[3] });
    }
    if (files.length === 0) fail(`upstream has no files under ${prefix} (folder missing or empty): ${name}`);
    files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
    const skill = files.find((f) => f.rel === "SKILL.md");
    if (!skill) fail(`upstream ${prefix} has no SKILL.md`);
    const skillText = gitBuf(from, ["cat-file", "blob", skill.object]).toString("utf8");
    const end = frontmatterEnd(skillText, `upstream ${prefix}SKILL.md`);
    if (/^metadata:/m.test(skillText.slice(0, end))) {
      fail(`upstream ${prefix}SKILL.md already has a metadata key; the hash-restore property (DD-3) would break`);
    }
    folders.push({ name, files, skillText, skillEnd: end });
  }
  return { from, head, version, license, copyright: copyright.trim(), folders };
}

function modeBits(mode) {
  return mode === "100755" ? 0o755 : 0o644;
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Step 4: build all six folders under staging; returns per-folder checksum maps
// and the bytes needed for the diff.
function stage(inv, npmShasum) {
  const short = inv.head.slice(0, 7);
  const tag = `v${inv.version}`;
  const date = dateStamp();
  const staged = [];
  for (const folder of inv.folders) {
    const dir = path.join(STAGING, folder.name);
    const sums = new Map();
    const contents = new Map();
    for (const f of folder.files) {
      const bytes = gitBuf(inv.from, ["cat-file", "blob", f.object]);
      sums.set(f.rel, sha256(bytes));
      contents.set(f.rel, bytes);
      let out = bytes;
      if (f.rel === "SKILL.md") {
        out = Buffer.from(
          folder.skillText.slice(0, folder.skillEnd) + metadataBlock(short, inv.version) + folder.skillText.slice(folder.skillEnd),
          "utf8"
        );
      }
      const dest = path.join(dir, ...f.rel.split("/"));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, out);
      fs.chmodSync(dest, modeBits(f.mode));
    }
    fs.writeFileSync(path.join(dir, "LICENSE"), inv.license);
    fs.writeFileSync(
      path.join(dir, "NOTICE"),
      [
        `Vendored from ${SOURCE_URL} at ${inv.head} (${tag}), path skills/${folder.name}/.`,
        "",
        inv.copyright,
        "Licensed under the MIT License; the upstream LICENSE is reproduced unaltered in this folder.",
        "",
        "## AKILI-SPECS modification statement",
        "",
        "The only modification is the frontmatter block in `SKILL.md`: a `metadata` key is added as the last frontmatter key, with `author`, `source`, `adapted-by`, `adapted-for` and `binding`. No other file is modified; see `UPSTREAM.md` for the per-file checksums.",
        "",
        "AKILI-SPECS is not affiliated with the NestJS project.",
        "",
      ].join("\n"),
      "utf8"
    );
    const lines = [...sums].map(([rel, h]) => `${h}  ${rel}`);
    fs.writeFileSync(
      path.join(dir, "UPSTREAM.md"),
      [
        "# Upstream pin",
        "",
        "| Field | Value |",
        "|---|---|",
        `| Source | ${SOURCE_URL} |`,
        `| Path | \`skills/${folder.name}/\` |`,
        `| Commit | ${inv.head} |`,
        `| Tag | ${tag} |`,
        `| npm version | ${inv.version} |`,
        `| npm shasum | ${npmShasum} |`,
        `| Vendored | ${date} |`,
        "| Synced by | `scripts/sync-nestjs-skills.js` |",
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
      ].join("\n"),
      "utf8"
    );
    staged.push({ name: folder.name, sums, contents });
  }
  return staged;
}

// Step 5: per-file diff summary against the current pin.
function printDiff(staged) {
  const summaries = [];
  const observe = [];
  for (const s of staged) {
    const cur = path.join(SKILLS, s.name, "UPSTREAM.md");
    if (!fs.existsSync(cur)) {
      summaries.push(`${s.name}: new folder (${s.sums.size} files)`);
      continue;
    }
    const old = parseChecksums(fs.readFileSync(cur, "utf8"));
    const added = [];
    const removed = [];
    const changed = [];
    for (const [rel, h] of s.sums) {
      if (!old.has(rel)) added.push(rel);
      else if (old.get(rel) !== h) changed.push(rel);
    }
    for (const rel of old.keys()) if (!s.sums.has(rel)) removed.push(rel);
    for (const rel of [...added, ...changed]) {
      if (/observe/i.test(s.contents.get(rel).toString("utf8"))) observe.push(`OBSERVE: ${s.name}/${rel} changed and contains "observe"; read it first`);
    }
    const part = (label, list) => (list.length ? `${label}: ${list.join(", ")}` : "");
    const body = [part("added", added), part("removed", removed), part("changed", changed)].filter(Boolean).join("; ");
    summaries.push(`${s.name}: ${body || "(no changes)"}`);
  }
  for (const line of observe) console.log(line);
  for (const line of summaries) console.log(line);
}

let renameCount = 0;
function renameB(src, dst) {
  renameCount += 1;
  if (process.env.NESTJS_SYNC_FAIL_RENAME_AT && Number(process.env.NESTJS_SYNC_FAIL_RENAME_AT) === renameCount) {
    throw new Error(`injected rename failure at step 6(b) rename #${renameCount}`);
  }
  fs.renameSync(src, dst);
}

// Step 6: one transaction. (a) current folders aside, (b) staged folders in,
// (c) delete .nestjs-sync/ only after all six succeed.
function swap() {
  fs.mkdirSync(ASIDE, { recursive: true });
  fs.mkdirSync(SKILLS, { recursive: true });
  const asideDone = [];
  const inDone = [];
  try {
    for (const name of NAMES) {
      const cur = path.join(SKILLS, name);
      if (fs.existsSync(cur)) {
        fs.renameSync(cur, path.join(ASIDE, name));
        asideDone.push(name);
      }
    }
    for (const name of NAMES) {
      renameB(path.join(STAGING, name), path.join(SKILLS, name));
      inDone.push(name);
    }
  } catch (e) {
    const problems = [];
    for (const name of [...inDone].reverse()) {
      try {
        fs.rmSync(path.join(SKILLS, name), { recursive: true, force: true });
      } catch (err) {
        problems.push(`could not remove ${name}: ${err.message}`);
      }
    }
    let restored = 0;
    for (const name of [...asideDone].reverse()) {
      try {
        fs.renameSync(path.join(ASIDE, name), path.join(SKILLS, name));
        restored += 1;
      } catch (err) {
        problems.push(`could not restore ${name}: ${err.message}`);
      }
    }
    if (problems.length > 0) {
      fail(`swap failed (${e.message}) and rollback was incomplete; .nestjs-sync/aside/ keeps the old folders:\n${problems.join("\n")}`);
    }
    fs.rmSync(WORK, { recursive: true, force: true });
    fail(`swap failed (${e.message}); rolled back: removed ${inDone.length} new folder(s), restored ${restored} old folder(s)`);
  }
  fs.rmSync(WORK, { recursive: true, force: true });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const k of ["from", "commit", "npm-shasum"]) if (!args[k]) fail(`--${k} is required`);
  const inv = inventory(args);
  if (fs.existsSync(WORK)) fail(`leftover ${WORK} from an earlier run; inspect it (aside/ may hold old folders), then remove it`);

  const oldCount = NAMES.reduce((n, name) => {
    const p = path.join(SKILLS, name, "UPSTREAM.md");
    return n + (fs.existsSync(p) ? parseChecksums(fs.readFileSync(p, "utf8")).size : 0);
  }, 0);

  let staged;
  try {
    staged = stage(inv, args["npm-shasum"]);
  } catch (e) {
    fs.rmSync(WORK, { recursive: true, force: true });
    throw e;
  }
  printDiff(staged);
  swap();

  const total = staged.reduce((n, s) => n + s.sums.size, 0);
  console.log(`Pin: ${inv.head} (v${inv.version}); upstream files ${oldCount} -> ${total}`);
  console.log("Reminder: update SKILL_FILE_EXPECTED (test/install-cursor.test.js), the count tests and fixture, docs/cli.md and CHANGELOG.md.");
}

try {
  main();
} catch (e) {
  if (e instanceof Refusal) {
    console.error(`sync-nestjs-skills: ${e.message}`);
    process.exit(1);
  }
  console.error(`sync-nestjs-skills: unexpected error: ${e && e.stack ? e.stack : e}`);
  process.exit(1);
}

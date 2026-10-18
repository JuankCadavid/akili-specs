"use strict";

// @akili-spec changes/archify-diagrams
//
// Static-conformance and install tests for the packaged `diagram-design`
// skill (Mermaid-first diagram slots with an optional Archify interactive
// view). Expected values are read from the approved spec
// (docs/specs/changes/archify-diagrams/requirements.md, design.md §5.2/§5.3/§6)
// wherever the spec states them as data (FR-2's slot table), and quoted from
// it otherwise.
//
// The install test drives the real CLI as a subprocess with every target
// passed as an explicit --*-target flag AND HOME/USERPROFILE/CODEX_HOME/
// CURSOR_CONFIG_DIR pinned to a fresh mkdtempSync scratch home -- the
// test/install-cursor.test.js isolation pattern; the real HOME is never
// touched.
//
// Coverage by requirement:
//   FR-1  frontmatter (original-authorship variant, BUT no adapted-by/
//         adapted-for/source) and "No Archify file ships" (skill dir file
//         list + npm pack --dry-run --json file list)
//   FR-2  slot catalog: one row per FR-2 table row, both TRD C4 rows `always`
//   FR-4  link-line template + browser-check suffix (design.md §5.2), paths,
//         receipt .gitignore patterns (wording only; behaviour = T7 evidence)
//   FR-7  guard-rail bullets inside the body's Guard-Rails section; DD-5
//         negative (no Archify CLI flag anywhere in the skill dir)
//   FR-8  command wiring at the exact steps, conditional; BUT no command file
//         (all of .claude/commands/) names archify; /akili-archive Step 3
//         unchanged vs the merge-base; views-documentation keeps Mermaid
//   FR-9  governance / skills README / skill doc / README / cli.md / CHANGELOG
//   FR-10 install lands both files byte-identical in every host skills root;
//         `akili list` names the skill; pack growth bound
//   NFR-1 size, NFR-3 host roots only in SKILL.md §4, NFR-4 no network verbs,
//         NFR-5 no `model:` key
//
// Falsifiability seams (test-only, inert unless set; used to record mutation
// evidence, never set in CI):
//   DD_MUTATE_COMMANDS_DIR  -- enumerate this directory instead of
//                              .claude/commands/ for the FR-8 BUT test
//   DD_MUTATE_EXPECT        -- an extra skill-relative file the install test
//                              must find in every installed root

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const AKILI_BIN = path.join(REPO_ROOT, "bin", "akili.js");
const SKILL_DIR = path.join(REPO_ROOT, ".claude", "skills", "diagram-design");
const SKILL_MD = path.join(SKILL_DIR, "SKILL.md");
const CATALOG_MD = path.join(SKILL_DIR, "references", "slot-catalog.md");
const COMMANDS_DIR = path.join(REPO_ROOT, ".claude", "commands");
const SPEC_DIR = path.join(REPO_ROOT, "docs", "specs", "changes", "archify-diagrams");

const read = (p) => fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const sha256 = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

// Minimal copies of the test/install-cursor.test.js helpers.
function mkHome(t, prefix) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

function scratchEnv(home) {
  return Object.assign({}, process.env, {
    HOME: home,
    USERPROFILE: home,
    CODEX_HOME: path.join(home, ".codex-env-unused"),
    CURSOR_CONFIG_DIR: path.join(home, ".cursor-env-unused"),
  });
}

function runAkili(args, opts) {
  const result = spawnSync(process.execPath, [AKILI_BIN, ...args], { encoding: "utf8", ...opts });
  return {
    status: result.status,
    stdout: stripAnsi(result.stdout || ""),
    stderr: stripAnsi(result.stderr || ""),
  };
}

function listFiles(dir, base) {
  base = base || dir;
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out.sort();
}

function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(m, "expected SKILL.md to open with a --- frontmatter block");
  return { fm: m[1], body: m[2] };
}

// Text from the heading matching `startRe` up to (not including) the next
// heading of the same or higher level.
function section(text, startRe) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => startRe.test(l));
  assert.notEqual(start, -1, `expected a heading matching ${startRe}`);
  const level = lines[start].match(/^(#+)/)[1].length;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const h = lines[i].match(/^(#+)\s/);
    if (h && h[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

function tableRows(text) {
  return text
    .split("\n")
    .filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l))
    .slice(1) // header
    .map((l) =>
      l
        .replace(/^\|/, "")
        .replace(/\|\s*$/, "")
        .split("|")
        .map((c) => c.trim())
    );
}

function gitMergeBase() {
  const r = spawnSync("git", ["merge-base", "master", "HEAD"], { cwd: REPO_ROOT, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

// ---------------------------------------------------------------------------
// FR-1
// ---------------------------------------------------------------------------

test("@akili-spec changes/archify-diagrams FR-1 (frontmatter matches the original-authorship variant; BUT no adapted-by/adapted-for/source)", () => {
  const { fm } = splitFrontmatter(read(SKILL_MD));
  assert.match(fm, /^name: diagram-design$/m);
  assert.match(fm, /^description: ".*Trigger: .*diagram.*"$/m, "expected a trigger-keyword description");
  assert.match(fm, /^license: MIT$/m);
  assert.match(fm, /^metadata:$/m);
  assert.match(fm, /^ {2}author: Juan Carlos Cadavid — jcadavid\.com$/m);
  assert.match(fm, /^ {2}binding: conditional$/m);
  assert.match(fm, /^ {2}version: "?\d+(\.\d+)*"?$/m);
  const inspired = fm.match(/^ {2}inspired-by: (.*)$/m);
  assert.ok(inspired, "expected metadata.inspired-by");
  for (const needle of ["Archify", "tt-a1i", "MIT", "https://github.com/tt-a1i/archify", "C4", "Mermaid"]) {
    assert.ok(inspired[1].includes(needle), `expected inspired-by to name ${needle}; got: ${inspired[1]}`);
  }
  // BUT clause: no upstream file is adapted.
  for (const key of ["adapted-by", "adapted-for", "source"]) {
    assert.doesNotMatch(fm, new RegExp(`^\\s*${key}:`, "m"), `frontmatter must NOT carry ${key}:`);
  }
});

test("@akili-spec changes/archify-diagrams FR-1 (No Archify file ships: skill dir holds only AKILI files; npm pack file list has zero Archify artifacts)", () => {
  assert.deepEqual(listFiles(SKILL_DIR), ["SKILL.md", "references/slot-catalog.md"]);

  const r = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts", "--offline"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  assert.equal(r.status, 0, `npm pack --dry-run --json failed:\n${r.stderr}`);
  const pack = JSON.parse(r.stdout.slice(r.stdout.indexOf("[")));
  const files = pack[0].files.map((f) => f.path);
  assert.ok(files.includes(".claude/skills/diagram-design/SKILL.md"), "expected the skill in the tarball");
  assert.ok(files.includes(".claude/skills/diagram-design/references/slot-catalog.md"));
  const archifyArtifact = /archify\.mjs|renderers\/|\.schema\.json|brand-marks|THIRD_PARTY/i;
  assert.deepEqual(files.filter((p) => archifyArtifact.test(p)), [], "expected zero Archify artifacts in the tarball");

  // FR-10: pack growth <= 20 KB unpacked -- bounded by the files this change
  // adds (the skill dir + its doc page); edits to existing docs are small.
  const added = pack[0].files
    .filter((f) => /^\.claude\/skills\/diagram-design\/|^docs\/skills\/diagram-design\.md$/.test(f.path))
    .reduce((n, f) => n + f.size, 0);
  assert.ok(added <= 20 * 1024, `expected added package files <= 20 KB; got ${added} B`);
});

// ---------------------------------------------------------------------------
// FR-2
// ---------------------------------------------------------------------------

test("@akili-spec changes/archify-diagrams FR-2 (slot catalog has a row per FR-2 slot; both TRD C4 rows `always`)", () => {
  const reqTable = tableRows(
    section(read(path.join(SPEC_DIR, "requirements.md")), /^### FR-2:/).split("#### Scenario")[0]
  );
  assert.equal(reqTable.length, 10, "expected the FR-2 table to name 10 slots");

  const catalog = read(CATALOG_MD);
  const rows = tableRows(section(catalog, /^## Slots$/));
  assert.equal(rows.length, 10, `expected exactly 10 catalog rows; got ${rows.length}`);
  for (const row of rows) {
    assert.equal(row.length, 6, `expected 6 columns (doc·section, slot, condition, Archify type, Mermaid type, question); row: ${row}`);
    for (const cell of row) assert.notEqual(cell, "", `expected no empty cell; row: ${row}`);
  }

  const norm = (s) => s.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
  for (const [doc, sect, slot, cond] of reqTable) {
    const hit = rows.find(
      ([docSect, cSlot, cCond]) =>
        docSect === `${doc} · ${sect}` && norm(cSlot).startsWith(norm(slot)) && cCond === cond
    );
    assert.ok(hit, `expected a catalog row for FR-2 slot "${slot}" (${doc} · ${sect}, condition "${cond}")`);
  }

  for (const id of ["trd-c4-context", "trd-c4-container"]) {
    const row = rows.find((r) => r[1].includes(`\`${id}\``));
    assert.ok(row, `expected a catalog row with id ${id}`);
    assert.equal(row[2], "always", `expected ${id} condition to be "always"`);
  }

  // BUT clause (instruction level): a false condition leaves nothing behind.
  assert.match(catalog, /a false condition leaves nothing in the document/);
  assert.match(
    read(SKILL_MD),
    /A slot whose condition is false leaves nothing in the document: no empty block, no placeholder, no note\./
  );
});

// ---------------------------------------------------------------------------
// FR-4 (wording only; behaviour is T7 evidence)
// ---------------------------------------------------------------------------

test("@akili-spec changes/archify-diagrams FR-4 (exact link-line template and browser-check suffix, design.md §5.2)", () => {
  const skill = read(SKILL_MD);
  const design = read(path.join(SPEC_DIR, "design.md"));
  const template = "`Interactive view: [<slot title>](<relative path>.html) — rendered with Archify (tt-a1i, MIT)`";
  const suffix = "` · browser check not run`";
  assert.ok(design.includes(template) && design.includes(suffix), "expected design.md §5.2 to state the template (spec anchor)");
  assert.ok(skill.includes(template), "expected SKILL.md to carry the §5.2 link-line template byte-exact");
  assert.ok(skill.includes(`append ${suffix}`), "expected SKILL.md to append the browser-check suffix");
  assert.ok(skill.includes("`docs/diagrams/<slot-id>.json` and `.html`"));
  assert.ok(skill.includes("`docs/specs/<spec-path>/diagrams/<slot-id>.json` and `.html`"));
  assert.match(skill, /never timestamped copies/);
  for (const receipt of ["*.finalize.json", "*.finalize-summary.json", "*.delivery.json", "*.browser-check.json"]) {
    assert.ok(skill.includes(`\`${receipt}\``), `expected receipt pattern ${receipt}`);
  }
});

// ---------------------------------------------------------------------------
// FR-7
// ---------------------------------------------------------------------------

test("@akili-spec changes/archify-diagrams FR-7 (guard-rails in the body; DD-5 no Archify CLI flag in the skill dir)", () => {
  const { body } = splitFrontmatter(read(SKILL_MD));
  const rails = section(body, /^## \d+\. Guard-Rails$/);
  const required = [
    /^- Never offer Archify's explainer mode\.$/m,
    /^- Never write an `\[archify explainer: …\]` line into any rules file\.$/m,
    /^- Never install, update, snooze, or ignore Archify updates on your own initiative\.$/m,
    /^- Relay an Archify update notice at most once per command run, as information only\.$/m,
    /^- Use no third-party brand marks unless the user asks for them\.$/m,
    /^- Never state an Archify command or flag in AKILI text; delegate them to Archify's own `SKILL\.md`/m,
    /^- Never alter the user's Archify configuration or environment variables\.$/m,
  ];
  for (const re of required) assert.match(rails, re, `expected guard-rail ${re} under the Guard-Rails section`);

  const flag = /--quality|--json|--repo-root|--out-dir|finalize /;
  for (const rel of listFiles(SKILL_DIR)) {
    assert.doesNotMatch(read(path.join(SKILL_DIR, rel)), flag, `${rel} must NOT state an Archify CLI flag`);
  }
});

// ---------------------------------------------------------------------------
// FR-8
// ---------------------------------------------------------------------------

test("@akili-spec changes/archify-diagrams FR-8 (wiring: one conditional line at each step that writes a slot)", () => {
  const constitution = read(path.join(COMMANDS_DIR, "akili-constitution.md"));
  const ddLines = constitution.split("\n").filter((l) => l.includes("diagram-design"));
  assert.equal(ddLines.length, 3, `expected exactly 3 diagram-design lines in akili-constitution.md; got ${ddLines.length}`);
  const steps = [
    [/^### Step 3:/, "PRD"],
    [/^### Step 4:/, "UX/UI"],
    [/^### Step 5:/, "TRD"],
  ];
  for (const [re, doc] of steps) {
    const lines = section(constitution, re)
      .split("\n")
      .filter((l) => l.includes("diagram-design"));
    assert.equal(lines.length, 1, `expected one diagram-design line under ${re}`);
    assert.ok(lines[0].includes("whose condition holds"), `expected a conditional line under ${re}: ${lines[0]}`);
    assert.ok(lines[0].includes(`the ${doc} slots`), `expected the ${re} line to name the ${doc} slots`);
  }
  assert.match(section(constitution, /^### Step 5:/), /C4 Context and C4 Container are always filled/);

  const specify = read(path.join(COMMANDS_DIR, "akili-specify.md"));
  assert.equal(specify.split("\n").filter((l) => l.includes("diagram-design")).length, 1);
  const s21 = section(specify, /^#### Step 2\.1/);
  assert.ok(!s21.includes("#### Step 2.2"));
  const specLine = s21.split("\n").find((l) => l.includes("diagram-design"));
  assert.ok(specLine, "expected the diagram-design line between Step 2.1 and Step 2.2");
  assert.match(specLine, /^If the design is architecturally significant/);
  assert.match(specLine, /fill the `design\.md` slots the change alters/);

  const archive = read(path.join(COMMANDS_DIR, "akili-archive.md"));
  assert.equal(archive.split("\n").filter((l) => l.includes("diagram-design")).length, 1);
  const step2 = section(archive, /^### Step 2:/);
  assert.match(step2, /^11\. Diagrams: .*load `diagram-design` only when the spec has a `diagrams\/` folder or slot/m);
  assert.match(step2, /made stale as a follow-up/);
  const step3 = section(archive, /^### Step 3:/);
  assert.doesNotMatch(step3, /diagram/i, "/akili-archive Step 3 must stay diagram-free");

  // AND IT MUST leave Step 3 unchanged (no new pending-item Kind): compare
  // with the merge-base when the history is available.
  const base = gitMergeBase();
  if (base) {
    const r = spawnSync("git", ["show", `${base}:.claude/commands/akili-archive.md`], { cwd: REPO_ROOT, encoding: "utf8" });
    if (r.status === 0) {
      assert.equal(step3, section(r.stdout.replace(/\r\n/g, "\n"), /^### Step 3:/), "expected Step 3 byte-identical to the merge-base");
    }
  }

  // "Never load it outside these steps": no other command names it.
  for (const f of fs.readdirSync(COMMANDS_DIR).filter((n) => n.endsWith(".md"))) {
    if (["akili-constitution.md", "akili-specify.md", "akili-archive.md"].includes(f)) continue;
    assert.ok(!read(path.join(COMMANDS_DIR, f)).includes("diagram-design"), `${f} must NOT load diagram-design`);
  }

  const views = read(path.join(REPO_ROOT, ".claude", "skills", "software-architect", "references", "views-documentation.md"));
  assert.ok(views.includes("Mermaid is the default renderer in AKILI docs."));
  assert.match(views, /`diagram-design` skill owns diagram slots, storage, and the optional interactive view/);
});

test("@akili-spec changes/archify-diagrams FR-8 (BUT no command file under .claude/commands/ names archify -- enumeration-wide)", () => {
  const dir = process.env.DD_MUTATE_COMMANDS_DIR || COMMANDS_DIR;
  const files = fs.readdirSync(dir).filter((n) => n.endsWith(".md"));
  assert.ok(files.length >= 11, `expected the full command set (>= 11 files); got ${files.length} in ${dir}`);
  const offenders = files.filter((f) => /archify/i.test(read(path.join(dir, f))));
  assert.deepEqual(offenders, [], "no command may name archify; it is reached only through diagram-design");
});

// ---------------------------------------------------------------------------
// FR-9
// ---------------------------------------------------------------------------

test("@akili-spec changes/archify-diagrams FR-9 (governance, skills docs, README, cli.md counts, CHANGELOG Unreleased)", () => {
  const gov = read(path.join(REPO_ROOT, "docs", "skills", "governance.md"));
  // Two tables open a row with `conditional`: the binding definitions and the
  // binding -> skills examples table (the one naming `ui-ux-pro-max`).
  const condRow = gov.split("\n").find((l) => /^\| `conditional` \| `ui-ux-pro-max`/.test(l));
  assert.ok(condRow && condRow.includes("`diagram-design`"), "expected diagram-design in the governance conditional row");
  const envPara = gov.split("\n\n").find((p) => p.includes("**Environment-provided skills are referenced, never vendored.**"));
  assert.ok(envPara && envPara.includes("`archify`"), "expected archify named as an environment-provided example");

  assert.ok(fs.existsSync(path.join(REPO_ROOT, "docs", "skills", "diagram-design.md")));
  const readmeRow = read(path.join(REPO_ROOT, "docs", "skills", "README.md"))
    .split("\n")
    .find((l) => l.startsWith("| [`diagram-design`]"));
  assert.ok(readmeRow, "expected a docs/skills/README.md row for diagram-design");
  const cells = readmeRow.split("|").map((c) => c.trim());
  assert.equal(cells[2], "conditional");
  assert.match(cells[3], /Juan Carlos Cadavid/);
  assert.match(cells[5], /\/akili-constitution.*\/akili-specify.*\/akili-archive/);

  const readme = read(path.join(REPO_ROOT, "README.md"));
  assert.ok(readme.includes("npx skills add tt-a1i/archify"));
  assert.match(readme, /Archify\]\(https:\/\/github\.com\/tt-a1i\/archify\) by tt-a1i \(MIT licence\)/);
  assert.match(readme, /never ships or installs it/);

  const cli = read(path.join(REPO_ROOT, "docs", "cli.md"));
  assert.doesNotMatch(cli, /24 packaged/);
  assert.match(cli, /25 packaged skills/);

  const changelog = read(path.join(REPO_ROOT, "CHANGELOG.md"));
  const unreleased = changelog.split(/^## \[Unreleased\]$/m)[1].split(/^## \[/m)[0];
  assert.ok(unreleased.includes("diagram-design"), "expected a [Unreleased] entry naming diagram-design");
});

// ---------------------------------------------------------------------------
// FR-10
// ---------------------------------------------------------------------------

test("@akili-spec changes/archify-diagrams FR-10 (install --tool all lands both files byte-identical in every host skills root)", (t) => {
  const home = mkHome(t, "akili-dd-install-");
  const shared = path.join(home, "shared-skills");
  const targets = {
    claude: path.join(home, "claude-home"),
    opencode: path.join(home, "opencode-home"),
    antigravity: path.join(home, "antigravity-home"),
    codexCursorShared: shared,
  };
  const run = runAkili(
    [
      "install",
      "--tool",
      "all",
      "--claude-target",
      targets.claude,
      "--opencode-target",
      targets.opencode,
      "--antigravity-target",
      targets.antigravity,
      "--codex-target",
      path.join(home, "codex-home"),
      "--codex-skills-target",
      shared,
      "--cursor-target",
      path.join(home, "cursor-home"),
      "--cursor-skills-target",
      shared,
    ],
    { cwd: home, env: scratchEnv(home) }
  );
  assert.equal(run.status, 0, `expected a clean install; stderr:\n${run.stderr}`);

  const expected = ["SKILL.md", "references/slot-catalog.md"];
  if (process.env.DD_MUTATE_EXPECT) expected.push(process.env.DD_MUTATE_EXPECT);

  // A host's skills root = any directory under its target holding a packaged
  // anchor skill (kaizen/SKILL.md). Antigravity has more than one.
  function skillsRoots(dir) {
    const roots = [];
    (function walk(d) {
      if (fs.existsSync(path.join(d, "kaizen", "SKILL.md"))) roots.push(d);
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (e.isDirectory() && e.name !== "kaizen") walk(path.join(d, e.name));
      }
    })(dir);
    return roots;
  }

  for (const [host, dir] of Object.entries(targets)) {
    const roots = skillsRoots(dir);
    assert.ok(roots.length >= 1, `expected at least one skills root for ${host} under ${dir}`);
    for (const root of roots) {
      const dd = path.join(root, "diagram-design");
      for (const rel of expected) {
        const dest = path.join(dd, rel);
        assert.ok(fs.existsSync(dest), `expected ${host}: ${path.relative(home, dest)} to be installed`);
        assert.equal(sha256(dest), sha256(path.join(SKILL_DIR, rel)), `expected ${host}: ${rel} byte-identical to the source`);
      }
      assert.deepEqual(listFiles(dd), ["SKILL.md", "references/slot-catalog.md"], `${host}: no extra file in the installed skill`);
    }
  }
  assert.ok(skillsRoots(targets.antigravity).length >= 1);
});

test("@akili-spec changes/archify-diagrams FR-10 (`akili list` names diagram-design)", () => {
  const r = runAkili(["list"], { cwd: REPO_ROOT });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /diagram-design/);
});

// ---------------------------------------------------------------------------
// NFRs
// ---------------------------------------------------------------------------

test("@akili-spec changes/archify-diagrams NFR-1 (SKILL.md <= 8 KB; skill dir <= 16 KB) and NFR-5 (no model: key)", () => {
  assert.ok(fs.statSync(SKILL_MD).size <= 8192, `SKILL.md is ${fs.statSync(SKILL_MD).size} B`);
  const total = listFiles(SKILL_DIR).reduce((n, rel) => n + fs.statSync(path.join(SKILL_DIR, rel)).size, 0);
  assert.ok(total <= 16 * 1024, `skill dir is ${total} B`);
  for (const rel of listFiles(SKILL_DIR)) {
    assert.doesNotMatch(read(path.join(SKILL_DIR, rel)), /^\s*model:/m, `${rel} must NOT carry a model: key`);
  }
});

test("@akili-spec changes/archify-diagrams NFR-3 (host skill roots only in SKILL.md §4 availability check; none in command lines)", () => {
  const roots = [".claude/skills/", "~/.claude/skills/", ".agents/skills/", "~/.agents/skills/", ".opencode/skills/", "~/.config/opencode/skills/"];
  const { body } = splitFrontmatter(read(SKILL_MD));
  const avail = section(body, /^## 4\. Interactive View$/).split("\n").find((l) => l.startsWith("1. **Availability"));
  assert.ok(avail, "expected the §4 item 1 availability check");
  for (const r of roots) assert.ok(avail.includes(`\`${r}\``), `expected root ${r} in the availability check`);
  const outside = body.replace(avail, "");
  assert.doesNotMatch(outside, /~\/\.claude|~\/\.agents|opencode|\.claude\/skills|\.agents\/skills/, "host roots must appear only in §4.1");
  assert.doesNotMatch(read(CATALOG_MD), /~\/\.claude|~\/\.agents|opencode/);

  const wired = ["akili-constitution.md", "akili-specify.md", "akili-archive.md"].flatMap((f) =>
    read(path.join(COMMANDS_DIR, f))
      .split("\n")
      .filter((l) => l.includes("diagram-design"))
  );
  assert.equal(wired.length, 5);
  for (const l of wired) {
    assert.doesNotMatch(l, /~\/|\.claude\/|\.agents\/|opencode|\.codex|\.cursor|antigravity/i, `host path in wired line: ${l}`);
  }
});

test("@akili-spec changes/archify-diagrams NFR-4 (no install, npx, or fetch from the skill or its wired lines)", () => {
  const net = /\bnpx\b|\bnpm (i|install)\b|\bcurl\b|\bwget\b|\bfetch\b|skills add/i;
  for (const rel of listFiles(SKILL_DIR)) {
    assert.doesNotMatch(read(path.join(SKILL_DIR, rel)), net, `${rel} must NOT run a network action`);
  }
  for (const f of ["akili-constitution.md", "akili-specify.md", "akili-archive.md"]) {
    for (const l of read(path.join(COMMANDS_DIR, f)).split("\n").filter((x) => x.includes("diagram-design"))) {
      assert.doesNotMatch(l, net);
    }
  }
});

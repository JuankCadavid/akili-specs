// Tests for bin/mcp-core.js (catalog, path guard, rendering, paging,
// list_commands, get_command). Expected values come from the approved
// scenarios (FR-1, FR-2), the real npm pack list, and independent re-derivations
// of the file text, never from the code under test.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const core = require("../bin/mcp-core.js");

const REPO_ROOT = path.resolve(__dirname, "..");
const FIXTURE_PKG = path.join(__dirname, "fixtures", "mcp", "pkg");
const PART_MAX = 30000;
const RESULT_MAX = 40000;

const realCore = core.createCore({ packageDir: REPO_ROOT });

function read(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
}

// Independent frontmatter strip: the first `---` block and its line ending.
function stripFrontmatter(text) {
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(text);
  return m ? text.slice(m[0].length) : text;
}

// Runs fn with fs.readFileSync / openSync wrapped to count calls (attempts
// included, so a read that throws still counts).
function withReadSpy(fn) {
  const calls = [];
  const origRead = fs.readFileSync;
  const origOpen = fs.openSync;
  fs.readFileSync = function (...a) {
    calls.push(["readFileSync", String(a[0])]);
    return origRead.apply(this, a);
  };
  fs.openSync = function (...a) {
    calls.push(["openSync", String(a[0])]);
    return origOpen.apply(this, a);
  };
  try {
    fn();
  } finally {
    fs.readFileSync = origRead;
    fs.openSync = origOpen;
  }
  return calls;
}

function tmpCopyOfFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "akili-mcp-core-"));
  fs.cpSync(FIXTURE_PKG, dir, { recursive: true });
  fs.renameSync(path.join(dir, "dot-claude"), path.join(dir, ".claude"));
  return dir;
}

function packFiles() {
  const r = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts", "--offline"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  assert.equal(r.status, 0, `npm pack --dry-run --json failed:\n${r.stderr}`);
  return JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].files.map((f) => f.path);
}

// ---------------------------------------------------------------------------
// FR-1 Catalog equals the tarball
// ---------------------------------------------------------------------------

test("FR-1 catalog keys equal the npm pack entries of the three areas plus the scripts", () => {
  const files = packFiles();
  const expected = files
    .filter((p) => /^\.claude\/(commands|skills|templates)\//.test(p))
    .map((p) => p.slice(".claude/".length))
    .concat(files.filter((p) => p.startsWith("scripts/")))
    .sort();
  assert.ok(expected.length > 250, "the pack list has the shipped content");
  assert.deepEqual(realCore.keys(), expected);
});

test("FR-1 scripts/ keys are exactly the two scripts, and the core list equals RESOURCE_SCRIPTS in bin/akili.js (read as text)", () => {
  const m = /const RESOURCE_SCRIPTS = (\[[^\]]*\]);/.exec(read("bin/akili.js"));
  assert.ok(m, "RESOURCE_SCRIPTS declaration found in bin/akili.js");
  const fromCli = JSON.parse(m[1]);
  assert.deepEqual(core.RESOURCE_SCRIPTS, fromCli);
  assert.deepEqual(
    realCore.keys().filter((k) => k.startsWith("scripts/")),
    ["scripts/gsc_verify.py", "scripts/parse_tests.js"],
  );
});

test("FR-1 akiliVersion equals version in the package's own package.json", () => {
  const version = JSON.parse(read("package.json")).version;
  assert.equal(realCore.akiliVersion, version);
  assert.equal(realCore.callTool("list_commands").akiliVersion, version);
  const fixture = core.createCore({ packageDir: FIXTURE_PKG });
  assert.equal(fixture.akiliVersion, "9.9.9");
});

test("FR-1 the catalog excludes a symlink, a dotfile and any file outside the four areas", (t) => {
  const dir = tmpCopyOfFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const outside = path.join(dir, "outside.txt");
  fs.writeFileSync(outside, "secret\n");
  let symlinks = true;
  try {
    fs.symlinkSync(outside, path.join(dir, ".claude", "commands", "link.md"));
    fs.symlinkSync(path.join(dir, "docs"), path.join(dir, ".claude", "skills", "linkdir"));
    fs.symlinkSync(path.join(dir, "bin", "cli.txt"), path.join(dir, "scripts", "parse_tests.js"));
  } catch (err) {
    symlinks = false;
    console.log(`# symlink assertions skipped: ${err.code} creating symlinks in ${os.tmpdir()}`);
  }
  const keys = core.createCore({ packageDir: dir }).keys();
  assert.deepEqual(keys, [
    "commands/ok.md",
    "scripts/gsc_verify.py",
    "skills/s/SKILL.md",
    "skills/s/references/r.md",
    "templates/t.md",
  ]);
  assert.ok(!keys.some((k) => k.split("/").some((seg) => seg.startsWith("."))), "no dotfile");
  for (const out of ["package.json", "bin/cli.txt", "docs/x.md", "other/x.md", "scripts/other.py"]) {
    assert.ok(!keys.includes(out), `${out} is outside the four areas`);
  }
  if (symlinks) {
    assert.ok(!keys.includes("commands/link.md"), "symlinked file excluded");
    assert.ok(!keys.some((k) => k.startsWith("skills/linkdir")), "symlinked directory excluded");
    assert.ok(!keys.includes("scripts/parse_tests.js"), "symlinked script excluded");
  }
});

test("FR-1 the real catalog holds no symlink and no dotfile", () => {
  for (const key of realCore.keys()) {
    const abs = key.startsWith("scripts/") ? path.join(REPO_ROOT, key) : path.join(REPO_ROOT, ".claude", key);
    assert.ok(!fs.lstatSync(abs).isSymbolicLink(), `${key} is not a symlink`);
    assert.ok(!key.split("/").some((seg) => seg.startsWith(".")), `${key} has no dot segment`);
  }
});

test("FR-1 building the catalog reads file metadata only: the single read is package.json", () => {
  let built;
  const calls = withReadSpy(() => {
    built = core.createCore({ packageDir: REPO_ROOT });
  });
  assert.equal(built.keys().length, realCore.keys().length);
  assert.equal(calls.length, 1, `reads during build: ${JSON.stringify(calls)}`);
  assert.equal(path.basename(calls[0][1]), "package.json");
});

// ---------------------------------------------------------------------------
// FR-1 Keys are the only way in
// ---------------------------------------------------------------------------

const HOSTILE = [
  ["a `..` segment", "../package.json"],
  ["bare `..`", ".."],
  ["a `..` inside a key", "commands/../package.json"],
  ["`%2e%2e`", "%2e%2e"],
  ["`%2e%2e` with a file", "%2e%2e/package.json"],
  ["an absolute path", "/etc/passwd"],
  ["an absolute path into the package", path.join(REPO_ROOT, "package.json")],
  ["a backslash path", "commands\\akili-propose.md"],
  ["a backslash `..`", "..\\package.json"],
  ["a drive letter path", "C:\\Windows\\win.ini"],
  ["a bare drive letter", "C:"],
  ["an empty string", ""],
  ["package.json", "package.json"],
  ["bin/akili.js", "bin/akili.js"],
  ["a `.claude`-prefixed path", ".claude/commands/akili-propose.md"],
  ["a NUL-suffixed key", "commands/akili-propose.md\0"],
];

test("FR-1 each hostile form is not a key: readFile returns null and reads no file", () => {
  const results = [];
  const calls = withReadSpy(() => {
    for (const [, input] of HOSTILE) {
      try {
        results.push(realCore.readFile(input));
      } catch (err) {
        results.push("threw " + err.code); // keep going so the spy assertion below reports every read attempt
      }
    }
  });
  assert.deepEqual(calls, [], "no readFileSync/openSync attempt");
  assert.deepEqual(results, HOSTILE.map(() => null));
  for (const bad of [undefined, null, 5, {}, ["commands/akili-propose.md"]]) {
    assert.equal(realCore.readFile(bad), null);
  }
});

for (const [label, input] of HOSTILE) {
  test(`FR-1 get_command with ${label} returns not_found and reads no file`, () => {
    let result;
    const calls = withReadSpy(() => {
      result = realCore.callTool("get_command", { name: input });
    });
    assert.equal(result.error.code, "not_found");
    assert.deepEqual(calls, [], "no read attempt");
    assert.equal(typeof result.akiliVersion, "string");
    assert.ok(Array.isArray(result.error.valid) && result.error.valid.length === 14, "lists the valid names");
  });
}

// ---------------------------------------------------------------------------
// FR-2 frontmatter
// ---------------------------------------------------------------------------

test("FR-2 parseFrontmatter reads plain, quoted, nested binding, CRLF; absent or unclosed blocks leave the text whole", () => {
  const a = core.parseFrontmatter('---\nname: x\ndescription: "Say \\"hi\\": ok"\nmetadata:\n  author: y\n  binding: core\n---\nBODY\n');
  assert.equal(a.fields.name, "x");
  assert.equal(a.fields.description, 'Say "hi": ok');
  assert.equal(a.binding, "core");
  assert.equal(a.body, "BODY\n");
  const b = core.parseFrontmatter("---\r\nname: x\r\ndescription: plain one\r\n---\r\nB\r\n");
  assert.equal(b.fields.description, "plain one");
  assert.equal(b.binding, null);
  assert.equal(b.body, "B\r\n");
  const c = core.parseFrontmatter("no block here\n---\nname: x\n---\n");
  assert.equal(c.body, "no block here\n---\nname: x\n---\n");
  const d = core.parseFrontmatter("---\nname: x\nnever closed\n");
  assert.equal(d.body, "---\nname: x\nnever closed\n");
  assert.deepEqual(d.fields, {});
  const e = core.parseFrontmatter("---\nname: x\nbinding: top-level-not-nested\n---\n");
  assert.equal(e.binding, null, "binding is read only under metadata:");
});

// ---------------------------------------------------------------------------
// FR-2 Command text rendered
// ---------------------------------------------------------------------------

function joinedText(name, args) {
  const first = realCore.callTool("get_command", Object.assign({ name }, args));
  assert.equal(first.error, undefined, JSON.stringify(first.error));
  let text = first.text;
  for (let p = 2; p <= first.parts; p++) {
    text += realCore.callTool("get_command", Object.assign({ name, part: p }, args)).text;
  }
  return text;
}

test("FR-2 akili-propose with arguments: every $ARGUMENTS replaced, body otherwise the file minus its frontmatter", () => {
  const body = stripFrontmatter(read(".claude/commands/akili-propose.md"));
  const occurrences = body.split("$ARGUMENTS").length - 1;
  assert.ok(occurrences >= 2, "the command has several $ARGUMENTS");
  const text = joinedText("akili-propose", { arguments: "add-remember-me" });
  assert.equal(text, body.replaceAll("$ARGUMENTS", () => "add-remember-me"));
  assert.ok(!text.includes("$ARGUMENTS"));
  assert.equal(text.split("add-remember-me").length - 1, occurrences + (body.split("add-remember-me").length - 1));
});

test("FR-2 akili-propose without arguments: every $ARGUMENTS is the empty string", () => {
  const body = stripFrontmatter(read(".claude/commands/akili-propose.md"));
  const text = joinedText("akili-propose", {});
  assert.equal(text, body.replaceAll("$ARGUMENTS", () => ""));
  assert.ok(!text.includes("$ARGUMENTS"));
  assert.equal(joinedText("akili-propose", { arguments: "" }), text, "empty arguments behave as none");
});

test("FR-2 akili-archive (six $ARGUMENTS): all occurrences are replaced, not only the first", () => {
  const body = stripFrontmatter(read(".claude/commands/akili-archive.md"));
  assert.equal(body.split("$ARGUMENTS").length - 1, 6);
  const text = joinedText("akili-archive", { arguments: "QQ" });
  assert.ok(!text.includes("$ARGUMENTS"));
  assert.equal(text, body.replaceAll("$ARGUMENTS", () => "QQ"));
});

test("FR-2 arguments are inserted literally: $&, $1, $' and backticks are not replacement patterns", () => {
  const body = stripFrontmatter(read(".claude/commands/akili-propose.md"));
  const hostile = "$& $1 $' $` $$";
  assert.equal(joinedText("akili-propose", { arguments: hostile }), body.replaceAll("$ARGUMENTS", () => hostile));
});

test("FR-2 akili-audit (no $ARGUMENTS) with arguments: the body plus one appended `ARGUMENTS:` line; without, unchanged", () => {
  const body = stripFrontmatter(read(".claude/commands/akili-audit.md"));
  assert.ok(!body.includes("$ARGUMENTS"));
  assert.equal(joinedText("akili-audit", {}), body);
  const withArgs = joinedText("akili-audit", { arguments: "src/app" });
  assert.ok(body.endsWith("\n"));
  assert.equal(withArgs, body + "ARGUMENTS: src/app\n");
  assert.equal(withArgs.split("\n").filter((l) => l.startsWith("ARGUMENTS:")).length, 1, "exactly one appended line");
});

test("FR-2 all 14 commands: frontmatter removed and nothing else changed", () => {
  for (const { name } of realCore.callTool("list_commands").commands) {
    const body = stripFrontmatter(read(`.claude/commands/${name}.md`));
    if (body.includes("$ARGUMENTS")) {
      assert.equal(joinedText(name, {}), body.replaceAll("$ARGUMENTS", () => ""), name);
    } else {
      assert.equal(joinedText(name, {}), body, name);
    }
  }
});

test("FR-2 renderCommand appends the ARGUMENTS line after a body that lacks a final newline", () => {
  assert.equal(core.renderCommand("---\nname: x\n---\nno newline", "a b"), "no newline\nARGUMENTS: a b\n");
  assert.equal(core.renderCommand("---\nname: x\n---\nuses $ARGUMENTS twice $ARGUMENTS\n", "Q"), "uses Q twice Q\n");
});

// ---------------------------------------------------------------------------
// FR-2 skills named by a command, and usage
// ---------------------------------------------------------------------------

test("FR-2 skills: backticked names and `<name> skill` phrases, sorted, each once, packaged names only", () => {
  const dir = tmpCopyOfFixture();
  try {
    for (const s of ["a-skill", "b-skill", "c-skill"]) {
      fs.mkdirSync(path.join(dir, ".claude", "skills", s), { recursive: true });
      fs.writeFileSync(path.join(dir, ".claude", "skills", s, "SKILL.md"), `---\nname: ${s}\n---\n`);
    }
    fs.writeFileSync(
      path.join(dir, ".claude", "commands", "ok.md"),
      "---\nname: ok\ndescription: d\n---\nUse `b-skill`. Then the a-skill skill. Again `b-skill` and `ghost-skill`.\nA c-skill alone, and xa-skill skill, and a-skill-more skill.\nArg: $ARGUMENTS\n",
    );
    const c = core.createCore({ packageDir: dir });
    const r = c.callTool("get_command", { name: "ok", arguments: "`c-skill`" });
    assert.deepEqual(r.skills, ["a-skill", "b-skill"], "arguments text never adds a skill");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("FR-2 every command's skills are sorted, unique, and real skill directories", () => {
  const skillDirs = new Set(
    realCore.keys().filter((k) => /^skills\/[^/]+\/SKILL\.md$/.test(k)).map((k) => k.split("/")[1]),
  );
  let named = 0;
  for (const { name } of realCore.callTool("list_commands").commands) {
    const { skills } = realCore.callTool("get_command", { name });
    assert.deepEqual(skills, Array.from(new Set(skills)).sort(), `${name} sorted and unique`);
    for (const s of skills) assert.ok(skillDirs.has(s), `${name}: ${s} is a packaged skill`);
    named += skills.length;
  }
  assert.ok(named > 0, "at least one command names a skill");
  assert.deepEqual(realCore.callTool("get_command", { name: "akili-propose" }).skills, [
    "brainstorming",
    "cognitive-doc-design",
    "product-manager-toolkit",
    "stitch-design",
    "systematic-debugging",
  ]);
});

test("FR-2 usage rides on part 1 only and carries the five obligations", () => {
  const p1 = realCore.callTool("get_command", { name: "akili-constitution" });
  const p2 = realCore.callTool("get_command", { name: "akili-constitution", part: 2 });
  assert.equal(typeof p1.usage, "string");
  assert.equal(p2.usage, undefined);
  assert.ok(!("usage" in p2));
  const lines = p1.usage.split("\n");
  assert.equal(lines.length, 5, "five fixed lines");
  assert.match(lines[0], /Follow the text below exactly/);
  assert.match(lines[1], /get_skill/);
  assert.match(lines[1], /`skills`/);
  assert.ok(lines[2].includes("`akili/scripts/...`") && lines[2].includes("get_file") && lines[2].includes("`scripts/...`"));
  assert.ok(lines[2].includes("`akili/templates/...`") && lines[2].includes("get_template"));
  assert.ok(lines[3].includes("npx -y akili-specs <cli command>") && /Node/.test(lines[3]));
  assert.match(lines[4], /`part`/);
  assert.match(lines[4], /`parts`/);
  assert.equal(realCore.callTool("get_command", { name: "akili-audit" }).usage, p1.usage, "fixed text");
});

// ---------------------------------------------------------------------------
// FR-2 Paging
// ---------------------------------------------------------------------------

test("FR-2 paging sweep over every catalog file: byte-exact rejoin, each part <= 30,000, line-break cuts", () => {
  let multi = 0;
  for (const key of realCore.keys()) {
    const text = realCore.readFile(key);
    const parts = core.splitParts(text);
    assert.equal(parts.join(""), text, `${key} rejoins byte-exact`);
    if (parts.length > 1) multi++;
    parts.forEach((p, i) => {
      assert.ok(p.length <= PART_MAX, `${key} part ${i + 1} is ${p.length} chars`);
      if (i < parts.length - 1) assert.ok(p.endsWith("\n") || !p.includes("\n"), `${key} part ${i + 1} cuts after a line break`);
    });
    for (let n = 1; n <= parts.length; n++) {
      const page = core.pageText(text, n);
      assert.deepEqual([page.part, page.parts, page.text], [n, parts.length, parts[n - 1]]);
    }
  }
  assert.ok(multi >= 10, `several catalog files span parts (${multi})`);
});

test("FR-2 every serialized get_command result of every command and part is <= 40,000 characters", () => {
  let worst = 0;
  for (const { name, parts } of realCore.callTool("list_commands").commands) {
    for (const args of [{}, { arguments: "add-remember-me" }]) {
      const first = realCore.callTool("get_command", Object.assign({ name }, args));
      for (let p = 1; p <= first.parts; p++) {
        const r = realCore.callTool("get_command", Object.assign({ name, part: p }, args));
        const size = JSON.stringify(r).length;
        worst = Math.max(worst, size);
        assert.ok(size <= RESULT_MAX, `${name} part ${p}/${r.parts}: ${size}`);
        assert.ok(r.text.length <= PART_MAX);
      }
      if (!args.arguments) assert.equal(first.parts, parts);
    }
  }
  assert.ok(worst > 20000, "the sweep exercised large parts");
});

test("FR-2 every serialized part of every catalog file, in the envelope the file tools use, is <= 40,000 characters", () => {
  for (const key of realCore.keys()) {
    const text = realCore.readFile(key);
    const n = core.splitParts(text).length;
    for (let p = 1; p <= n; p++) {
      const page = core.pageText(text, p);
      const env = { akiliVersion: realCore.akiliVersion, name: key, path: key, part: page.part, parts: page.parts, text: page.text };
      const size = JSON.stringify(env).length;
      assert.ok(size <= RESULT_MAX, `${key} part ${p}/${n}: ${size}`);
    }
  }
});

test("FR-2 a single line longer than 30,000 is cut at the limit; the parts rejoin", () => {
  const text = "x".repeat(70000) + "\ntail\n";
  const parts = core.splitParts(text);
  assert.deepEqual(parts.map((p) => p.length), [30000, 30000, 10000 + 1 + 5]);
  assert.ok(!parts[0].includes("\n"));
  assert.equal(parts.join(""), text);
});

test("FR-2 a window with a newline cuts just after the last newline in it", () => {
  const text = "a".repeat(29000) + "\n" + "b".repeat(5000) + "\n" + "c".repeat(100);
  const parts = core.splitParts(text);
  assert.equal(parts[0].length, 29001);
  assert.ok(parts[0].endsWith("\n"));
  assert.equal(parts.join(""), text);
  // a newline in the very last position of the window is kept in the window
  const exact = "a".repeat(29999) + "\n" + "tail";
  assert.deepEqual(core.splitParts(exact).map((p) => p.length), [30000, 4]);
});

test("FR-2 a surrogate pair at the boundary is not split", () => {
  const text = "a".repeat(29999) + "\u{1F600}" + "b".repeat(100);
  assert.equal(text.charCodeAt(29999) >= 0xd800 && text.charCodeAt(29999) <= 0xdbff, true, "high surrogate on the boundary");
  const parts = core.splitParts(text);
  assert.equal(parts[0].length, 29999, "cut moved back one unit");
  assert.equal(parts.join(""), text);
  for (const p of parts) {
    assert.ok(!/[\ud800-\udbff]$/.test(p) && !/^[\udc00-\udfff]/.test(p), "no part starts or ends inside a pair");
  }
  // a cut that falls between two whole pairs stays put
  const even = "\u{1F600}".repeat(15000) + "z";
  assert.equal(core.splitParts(even)[0].length, 30000);
});

test("FR-2 empty text is one empty part", () => {
  assert.deepEqual(core.pageText("", 1), { part: 1, parts: 1, text: "" });
});

test("FR-2 part omitted means 1; a part outside 1..parts returns invalid_argument naming parts", () => {
  const dflt = realCore.callTool("get_command", { name: "akili-constitution" });
  const one = realCore.callTool("get_command", { name: "akili-constitution", part: 1 });
  assert.deepEqual(dflt, one);
  assert.equal(dflt.part, 1);
  assert.equal(dflt.parts, 5);
  for (const bad of [0, 6, -1, 100000]) {
    const r = realCore.callTool("get_command", { name: "akili-constitution", part: bad });
    assert.equal(r.error.code, "invalid_argument", `part ${bad}`);
    assert.equal(r.error.parts, 5, `part ${bad} names parts`);
    assert.match(r.error.message, /1 to 5/);
    assert.equal(r.akiliVersion, realCore.akiliVersion);
  }
  const last = realCore.callTool("get_command", { name: "akili-constitution", part: 5 });
  assert.equal(last.part, 5);
  assert.ok(last.text.length > 0);
});

test("FR-2 parts depend on arguments: the paged text is the rendered text", () => {
  const long = "z".repeat(40000);
  const base = realCore.callTool("get_command", { name: "akili-audit" });
  const withArg = realCore.callTool("get_command", { name: "akili-audit", arguments: long });
  assert.equal(base.parts, 1);
  assert.ok(withArg.parts > base.parts, "a long argument adds parts");
  assert.equal(joinedText("akili-audit", { arguments: long }), stripFrontmatter(read(".claude/commands/akili-audit.md")) + "ARGUMENTS: " + long + "\n");
});

// ---------------------------------------------------------------------------
// FR-2 list_commands and get_command
// ---------------------------------------------------------------------------

function independentFrontmatterField(text, key) {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(text.split(/\r?\n---\r?\n/)[0]);
  assert.ok(m, `frontmatter has ${key}`);
  const v = m[1].trim();
  return v.startsWith('"') && v.endsWith('"') ? JSON.parse(v) : v;
}

test("FR-2 list_commands: 14 entries sorted by name, with frontmatter name/description and parts", () => {
  const r = realCore.callTool("list_commands");
  assert.equal(r.akiliVersion, realCore.akiliVersion);
  assert.equal(r.commands.length, 14);
  const names = r.commands.map((c) => c.name);
  assert.deepEqual(names, names.slice().sort());
  const files = fs.readdirSync(path.join(REPO_ROOT, ".claude", "commands")).filter((f) => f.endsWith(".md"));
  assert.deepEqual(names, files.map((f) => f.slice(0, -3)).sort());
  for (const c of r.commands) {
    const text = read(`.claude/commands/${c.name}.md`);
    assert.equal(c.name, independentFrontmatterField(text, "name"));
    assert.equal(c.description, independentFrontmatterField(text, "description"));
    assert.ok(c.description.length > 0);
    assert.deepEqual(Object.keys(c), ["name", "description", "parts"]);
    assert.ok(Number.isInteger(c.parts) && c.parts >= 1);
    assert.ok(c.parts >= Math.ceil(stripFrontmatter(text).length / PART_MAX) - 0, `${c.name} parts cover its length`);
  }
  assert.equal(r.commands.find((c) => c.name === "akili-constitution").parts, 5);
  assert.equal(r.commands.find((c) => c.name === "akili-propose").parts, 1);
});

test("FR-2 get_command result carries name, part, parts, skills, text", () => {
  const r = realCore.callTool("get_command", { name: "akili-audit" });
  assert.deepEqual(Object.keys(r), ["akiliVersion", "name", "part", "parts", "skills", "text", "usage"]);
  assert.equal(r.name, "akili-audit");
  const p2 = realCore.callTool("get_command", { name: "akili-specify", part: 2 });
  assert.deepEqual(Object.keys(p2), ["akiliVersion", "name", "part", "parts", "skills", "text"]);
});

test("FR-2 an unknown command is not_found with the 14 valid names", () => {
  const r = realCore.callTool("get_command", { name: "akili-nope" });
  assert.equal(r.error.code, "not_found");
  assert.equal(r.error.valid.length, 14);
  assert.deepEqual(r.error.valid, r.error.valid.slice().sort());
});

// ---------------------------------------------------------------------------
// FR-2 Errors and the version stamp
// ---------------------------------------------------------------------------

test("FR-2 tool definitions: seven tools, documented input types only, descriptions under 1,000 characters", () => {
  const names = core.TOOL_DEFINITIONS.map((d) => d.name);
  assert.deepEqual(names, ["list_commands", "get_command", "list_skills", "get_skill", "get_template", "get_file", "search"]);
  for (const d of core.TOOL_DEFINITIONS) {
    assert.ok(d.description.length < 1000, d.name);
    assert.equal(d.inputSchema.type, "object");
    for (const [k, prop] of Object.entries(d.inputSchema.properties)) {
      assert.ok(["string", "integer"].includes(prop.type), `${d.name}.${k}`);
      assert.equal(prop.enum, undefined);
    }
    for (const r of d.inputSchema.required || []) assert.ok(r in d.inputSchema.properties);
  }
  assert.ok(Object.isFrozen(core.TOOL_DEFINITIONS));
});

test("FR-2 every result carries akiliVersion; bad inputs return invalid_argument naming the argument, never throw", () => {
  const cases = [
    [["get_command", {}], /name/],
    [["get_command", { name: 5 }], /name/],
    [["get_command", { name: "akili-audit", part: "1" }], /part/],
    [["get_command", { name: "akili-audit", part: 1.5 }], /part/],
    [["get_command", { name: "akili-audit", arguments: 7 }], /arguments/],
    [["get_command", { name: "akili-audit", bogus: 1 }], /bogus/],
    [["get_command", { name: null }], /name/],
    [["get_command", "akili-audit"], /object/],
    [["get_command", [1]], /object/],
    [["list_commands", { extra: true }], /extra/],
    [["get_command", JSON.parse('{"name":"akili-audit","__proto__":{}}')], /__proto__/],
  ];
  for (const [[tool, args], re] of cases) {
    let r;
    assert.doesNotThrow(() => {
      r = realCore.callTool(tool, args);
    });
    assert.equal(r.akiliVersion, realCore.akiliVersion);
    assert.equal(r.error.code, "invalid_argument", JSON.stringify(args));
    assert.match(r.error.message, re);
  }
  assert.equal(realCore.callTool("list_commands", undefined).commands.length, 14);
  assert.equal(realCore.callTool("list_commands", null).commands.length, 14);
});

test("FR-2 unknown tool names return unknown_tool and never throw", () => {
  for (const bad of ["nope", "", "constructor", "__proto__", "target___get_command", 5, null, undefined, {}]) {
    let r;
    assert.doesNotThrow(() => {
      r = realCore.callTool(bad, {});
    });
    assert.equal(r.error.code, "unknown_tool");
    assert.equal(r.akiliVersion, realCore.akiliVersion);
  }
});

test("FR-2 error results carry code from the closed set, and no stack trace or filesystem path", () => {
  const samples = [
    realCore.callTool("get_command", { name: "../package.json" }),
    realCore.callTool("get_command", {}),
    realCore.callTool("get_command", { name: "akili-audit", part: 99 }),
    realCore.callTool("nope", {}),
    realCore.callTool("search", { query: "x" }), // stubbed in T1: internal
  ];
  assert.equal(samples[4].error.code, "internal");
  for (const r of samples) {
    assert.ok(core.ERROR_CODES.includes(r.error.code));
    const s = JSON.stringify(r);
    assert.ok(!s.includes(REPO_ROOT), "no filesystem path");
    assert.ok(!/\bat .*\(.*:\d+:\d+\)/.test(s) && !s.includes("node_modules"), "no stack trace");
  }
});

test("FR-2 a throw inside a handler becomes a generic internal error with no path or message leak", () => {
  const dir = tmpCopyOfFixture();
  try {
    const c = core.createCore({ packageDir: dir });
    fs.rmSync(path.join(dir, ".claude", "commands", "ok.md")); // listed in the catalog, gone from disk
    const r = c.callTool("get_command", { name: "ok" });
    assert.equal(r.error.code, "internal");
    assert.equal(r.error.message, "internal error");
    assert.ok(!JSON.stringify(r).includes(dir), "no filesystem path");
    assert.ok(!JSON.stringify(r).includes("ENOENT"));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// NFR-1 / NFR-5
// ---------------------------------------------------------------------------

test("NFR-1 the core requires only Node built-ins", () => {
  const src = read("bin/mcp-core.js");
  const required = Array.from(src.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)).map((m) => m[1]);
  assert.deepEqual(required.sort(), ["fs", "path"]);
});

test("NFR-5 neither the core nor this test cites the spec folder", () => {
  const needle = ["docs", "specs", "changes", "methodology-mcp"].join("/");
  assert.ok(!read("bin/mcp-core.js").includes(needle));
  assert.ok(!read("test/mcp-core.test.js").includes(needle));
  assert.ok(!read("bin/mcp-core.js").includes("docs/specs"));
});

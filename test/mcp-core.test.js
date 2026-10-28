// Tests for bin/mcp-core.js (catalog, path guard, rendering, paging, the seven
// tools, search, the error envelope). Expected values come from the approved
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
  // Count readFileSync only: on Node 18 readFileSync calls fs.openSync internally, so the
  // spy sees an extra openSync on the same path that is not a second read.
  const reads = calls.filter(([fn]) => fn === "readFileSync");
  assert.equal(reads.length, 1, `reads during build: ${JSON.stringify(calls)}`);
  assert.equal(path.basename(reads[0][1]), "package.json");
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
    realCore.callTool("search", { query: "   " }),
  ];
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
// FR-2 Lists and lookups: list_skills, get_skill, get_template, get_file
// ---------------------------------------------------------------------------

// Independent recursive listing of one skill directory as catalog keys.
function skillKeysOnDisk(dir) {
  const out = [];
  const walk = (abs, rel) => {
    for (const name of fs.readdirSync(abs).sort()) {
      if (name.startsWith(".")) continue;
      const a = path.join(abs, name);
      if (fs.statSync(a).isDirectory()) walk(a, `${rel}/${name}`);
      else out.push(`${rel}/${name}`);
    }
  };
  walk(path.join(REPO_ROOT, ".claude", "skills", dir), `skills/${dir}`);
  return out;
}

function independentBinding(text) {
  const m = /^[ \t]+binding:[ \t]*(\S+)[ \t]*$/m.exec(text.split(/\r?\n---\r?\n/)[0]);
  return m ? m[1].replace(/^"|"$/g, "") : null;
}

test("FR-2 list_skills: one entry per .claude/skills directory, sorted, with frontmatter name, description, binding and catalog-key files", () => {
  const r = realCore.callTool("list_skills");
  assert.equal(r.akiliVersion, realCore.akiliVersion);
  const dirs = fs
    .readdirSync(path.join(REPO_ROOT, ".claude", "skills"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  assert.equal(dirs.length, 29);
  assert.deepEqual(
    r.skills.map((e) => e.name),
    dirs
  );
  for (const e of r.skills) {
    assert.deepEqual(Object.keys(e), ["name", "description", "binding", "files"]);
    const text = read(`.claude/skills/${e.name}/SKILL.md`);
    assert.equal(e.description, independentFrontmatterField(text, "description"));
    assert.equal(e.binding, independentBinding(text), `${e.name} binding`);
    assert.ok(["core", "conditional", "stack"].includes(e.binding), `${e.name}: ${e.binding}`);
    assert.deepEqual(e.files, skillKeysOnDisk(e.name));
    assert.ok(e.files.includes(`skills/${e.name}/SKILL.md`));
    for (const f of e.files) assert.ok(realCore.keys().includes(f), `${f} is a catalog key`);
  }
});

test("FR-2 list_skills: binding is null when the SKILL.md has none", () => {
  const dir = tmpCopyOfFixture();
  try {
    fs.writeFileSync(path.join(dir, ".claude", "skills", "s", "SKILL.md"), "---\nname: s\ndescription: no meta\n---\nbody\n");
    const c = core.createCore({ packageDir: dir });
    assert.deepEqual(c.callTool("list_skills").skills, [
      { name: "s", description: "no meta", binding: null, files: ["skills/s/SKILL.md", "skills/s/references/r.md"] },
    ]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("FR-2 get_skill: SKILL.md by default, another file of the skill when given, text equal to the file", () => {
  const def = realCore.callTool("get_skill", { name: "tdd" });
  assert.deepEqual(Object.keys(def), ["akiliVersion", "name", "file", "part", "parts", "text"]);
  assert.equal(def.name, "tdd");
  assert.equal(def.file, "SKILL.md");
  assert.equal(def.text, read(".claude/skills/tdd/SKILL.md").slice(0, def.text.length));
  assert.equal(def.parts, core.splitParts(read(".claude/skills/tdd/SKILL.md")).length);
  const ref = realCore.callTool("get_skill", { name: "tdd", file: "mocking.md" });
  assert.equal(ref.file, "mocking.md");
  assert.equal(ref.text, read(".claude/skills/tdd/mocking.md"));
});

test("FR-2 get_skill with an unknown file returns not_found and lists that skill's files", () => {
  const r = realCore.callTool("get_skill", { name: "tdd", file: "nope.md" });
  assert.equal(r.error.code, "not_found");
  assert.deepEqual(r.error.files, skillKeysOnDisk("tdd"));
});

test("FR-2 an unknown skill name is not_found with the list of valid names", () => {
  const r = realCore.callTool("get_skill", { name: "no-such-skill" });
  assert.equal(r.error.code, "not_found");
  assert.deepEqual(r.error.valid, realCore.callTool("list_skills").skills.map((e) => e.name));
  assert.equal(r.error.valid.length, 29);
});

const TEMPLATE_TABLE = [
  ["leader", "templates/leader.md"],
  ["implementer", "templates/implementer.md"],
  ["reviewer", "templates/reviewer.md"],
  ["tester", "templates/tester.md"],
  ["model-registry", "templates/model-registry.json"],
  ["model-routing.section", "templates/model-routing.section.md"],
  ["digests", "templates/digests.json"],
];

test("FR-2 get_template accepts the seven names, each mapped to templates/<file>, text equal to the file", () => {
  for (const [name, key] of TEMPLATE_TABLE) {
    const r = realCore.callTool("get_template", { name });
    assert.deepEqual(Object.keys(r), ["akiliVersion", "name", "path", "part", "parts", "text"]);
    assert.equal(r.name, name);
    assert.equal(r.path, key);
    const raw = read(`.claude/${key}`);
    assert.equal(r.parts, core.splitParts(raw).length);
    assert.equal(r.text, core.splitParts(raw)[0]);
  }
});

test("FR-2 get_template accepts exactly those seven: any other spelling is not_found with the seven valid names", () => {
  const valid = TEMPLATE_TABLE.map(([n]) => n);
  for (const bad of ["Leader", "leader.md", "templates/leader.md", "model-routing", "digests.json", "", "../leader", "constructor"]) {
    const r = realCore.callTool("get_template", { name: bad });
    assert.equal(r.error.code, "not_found", bad);
    assert.deepEqual(r.error.valid, valid);
  }
});

test("FR-2 get_file serves every catalog key; non-command text equals the specific tool's text", () => {
  const keys = realCore.keys();
  assert.ok(keys.length > 250);
  for (const key of keys) {
    const r = realCore.callTool("get_file", { path: key });
    assert.deepEqual(Object.keys(r), ["akiliVersion", "path", "part", "parts", "text"]);
    assert.equal(r.path, key);
    if (!key.startsWith("commands/")) assert.equal(r.text, core.splitParts(rawOnDisk(key))[0], key);
  }
  const skill = realCore.callTool("get_skill", { name: "tdd", file: "tests.md" });
  assert.equal(realCore.callTool("get_file", { path: "skills/tdd/tests.md" }).text, skill.text);
  const tmpl = realCore.callTool("get_template", { name: "tester" });
  assert.equal(realCore.callTool("get_file", { path: "templates/tester.md" }).text, tmpl.text);
  assert.equal(realCore.callTool("get_file", { path: "scripts/parse_tests.js" }).text, core.splitParts(read("scripts/parse_tests.js"))[0]);
});

test("FR-2 get_file of a command key returns the text get_command returns with no arguments", () => {
  const viaCommand = realCore.callTool("get_command", { name: "akili-propose" });
  const viaFile = realCore.callTool("get_file", { path: "commands/akili-propose.md" });
  assert.equal(viaFile.text, viaCommand.text);
  assert.equal(viaFile.parts, viaCommand.parts);
});

test("FR-2 get_file of a path that is not a catalog key is not_found", () => {
  for (const bad of ["scripts/other.py", "docs/mcp.md", "templates/", "skills/tdd", "commands/akili-propose"]) {
    assert.equal(realCore.callTool("get_file", { path: bad }).error.code, "not_found", bad);
  }
});

// FR-1 Keys are the only way in, through every tool.
for (const [label, input] of HOSTILE) {
  test(`FR-1 ${label}: get_skill, get_template and get_file answer not_found and read no file`, () => {
    const out = [];
    const calls = withReadSpy(() => {
      out.push(realCore.callTool("get_skill", { name: input }));
      out.push(realCore.callTool("get_skill", { name: "tdd", file: input }));
      out.push(realCore.callTool("get_template", { name: input }));
      out.push(realCore.callTool("get_file", { path: input }));
    });
    assert.deepEqual(calls, [], "no read attempt");
    for (const r of out) {
      assert.equal(r.error.code, "not_found", JSON.stringify(r).slice(0, 120));
      assert.ok(!JSON.stringify(r).includes(REPO_ROOT), "the input is not echoed back as a path");
    }
  });
}

// ---------------------------------------------------------------------------
// FR-2 Search
// ---------------------------------------------------------------------------

// Builds a throwaway package whose search scores are known by hand from the
// design weights (name/path 5, description 3, headings 2, body 1; a token takes
// its highest field weight; a file's score is the sum over distinct query tokens).
function searchFixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "akili-mcp-search-"));
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "f", version: "1.2.3" }));
  for (const [rel, text] of Object.entries(files)) {
    const abs = path.join(dir, ".claude", rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, text);
  }
  return dir;
}

function withFixture(files, fn) {
  const dir = searchFixture(files);
  try {
    return fn(core.createCore({ packageDir: dir }));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("FR-2 search scores: each query token counts its highest field weight once (name/path 5, description 3, heading 2, body 1)", () => {
  withFixture(
    {
      "commands/cmd-one.md": "---\nname: cmd-one\ndescription: zebra herd\n---\n# Zebra rules\nzebra stripes\n",
      "skills/zebra/SKILL.md": "---\nname: zebra\ndescription: nothing\n---\ntext\n",
      "templates/body.md": "plain zebra body\n",
      "templates/head.md": "# Zebra heading\nother\n",
    },
    (c) => {
      const r = c.callTool("search", { query: "zebra" }).results;
      assert.deepEqual(
        r.map((e) => [e.path, e.score]),
        [
          ["skills/zebra/SKILL.md", 5],
          ["commands/cmd-one.md", 3],
          ["templates/head.md", 2],
          ["templates/body.md", 1],
        ]
      );
      // Two distinct tokens add: zebra (3, description) + stripes (1, body) in cmd-one; a repeated token counts once.
      const two = c.callTool("search", { query: "zebra stripes zebra ZEBRA" }).results;
      assert.deepEqual(
        two.map((e) => [e.path, e.score]),
        [
          ["skills/zebra/SKILL.md", 5],
          ["commands/cmd-one.md", 4],
          ["templates/head.md", 2],
          ["templates/body.md", 1],
        ]
      );
    }
  );
});

test("FR-2 search sorts by score, then by key: tied results come back in key order whatever the query order", () => {
  withFixture(
    {
      "templates/zed.md": "red only\n",
      "templates/ace.md": "blue only\n",
      "templates/mid.md": "red blue\n",
    },
    (c) => {
      const r = c.callTool("search", { query: "red blue" }).results;
      assert.deepEqual(
        r.map((e) => [e.path, e.score]),
        [
          ["templates/mid.md", 2],
          ["templates/ace.md", 1],
          ["templates/zed.md", 1],
        ]
      );
    }
  );
});

test("FR-2 search tokens: case-insensitive, split on non-alphanumerics, at least 2 characters, no stemming", () => {
  withFixture(
    {
      "templates/a.md": "Hello-World x tests\n",
      "templates/b.md": "test\n",
    },
    (c) => {
      assert.deepEqual(c.callTool("search", { query: "HELLO" }).results.map((e) => e.path), ["templates/a.md"]);
      assert.deepEqual(c.callTool("search", { query: "world_hello" }).results.map((e) => e.path), ["templates/a.md"]);
      assert.deepEqual(c.callTool("search", { query: "x" }).results, [], "one-character tokens are not indexed");
      assert.deepEqual(c.callTool("search", { query: "test" }).results.map((e) => e.path), ["templates/b.md"], "no stemming");
      assert.deepEqual(c.callTool("search", { query: "zzzqq" }).results, []);
      assert.deepEqual(c.callTool("search", { query: "!!! ???" }).results, []);
    }
  );
});

test("FR-2 search title is the frontmatter name, else the first heading, else the key", () => {
  withFixture(
    {
      "commands/c.md": "---\nname: nice-name\ndescription: d\n---\n# Other heading\nmarker\n",
      "templates/h.md": "intro\n# First heading\n## Second\nmarker\n",
      "templates/n.md": "marker only\n",
    },
    (c) => {
      const byPath = Object.fromEntries(c.callTool("search", { query: "marker" }).results.map((e) => [e.path, e.title]));
      assert.deepEqual(byPath, {
        "commands/c.md": "nice-name",
        "templates/h.md": "First heading",
        "templates/n.md": "templates/n.md",
      });
    }
  );
});

test("FR-2 search snippet: at most 200 characters, around the first match, wherever the match sits", () => {
  const filler = "lorem ipsum dolor sit amet ".repeat(80); // > 2000 chars, none of the query words
  withFixture(
    {
      "templates/start.md": "needleword begins here. " + filler,
      "templates/middle.md": filler + " needleword in the middle " + filler,
      "templates/end.md": filler + " the tail needleword",
      "templates/multi.md": filler + "\n\nline\twith   tabs needleword and\n\nmore " + filler,
    },
    (c) => {
      const r = c.callTool("search", { query: "needleword" }).results;
      assert.equal(r.length, 4);
      for (const e of r) {
        assert.ok(e.snippet.length <= 200, `${e.path}: ${e.snippet.length}`);
        assert.ok(e.snippet.includes("needleword"), `${e.path} snippet holds the match: ${e.snippet}`);
      }
      const first = r.find((e) => e.path === "templates/start.md").snippet;
      assert.ok(first.startsWith("needleword begins here."));
    }
  );
});

test("FR-2 search does not index frontmatter keys as body text: a key word absent from the body and from name/description does not match", () => {
  withFixture(
    {
      "commands/fm.md": "---\nname: fm\ndescription: tidy\nmetadata:\n  binding: core\nlicense: MIT\n---\n# Heading\nplain body words\n",
      "templates/other.md": "plain body words\n",
    },
    (c) => {
      for (const q of ["description", "metadata", "binding", "license"]) {
        assert.deepEqual(c.callTool("search", { query: q }).results, [], `frontmatter key "${q}" must not match`);
      }
      const hit = c.callTool("search", { query: "plain" }).results;
      assert.equal(hit.length, 2);
      for (const e of hit) assert.ok(e.snippet.toLowerCase().includes("plain"), "a body hit's snippet holds the query token");
    }
  );
});

test("FR-2 search snippet shows the first match, not a later one, and falls back to the opening text for a path-only hit", () => {
  withFixture(
    {
      "templates/two.md": "alpha early marker one. " + "pad ".repeat(200) + " marker two late\n",
      "skills/gamma/SKILL.md": "---\nname: delta\ndescription: d\n---\nunrelated text here\n",
    },
    (c) => {
      const two = c.callTool("search", { query: "marker" }).results[0];
      assert.ok(two.snippet.includes("marker one") && !two.snippet.includes("marker two"));
      const g = c.callTool("search", { query: "gamma" }).results[0];
      assert.equal(g.path, "skills/gamma/SKILL.md");
      assert.equal(g.snippet, "unrelated text here");
    }
  );
});

test("FR-2 search snippet quotes the frontmatter description or name when that is where the only text match sits", () => {
  withFixture(
    {
      "skills/desc/SKILL.md": "---\nname: plainname\ndescription: Use when you need to trigger zebrafish handling\n---\n# Opening heading\nnothing relevant in this body\n",
      "skills/nameonly/SKILL.md": "---\nname: quokkaword\ndescription: unrelated summary\n---\nbody without the token\n",
      "templates/headonly.md": "intro text\n# Axolotl heading\nmore text\n",
    },
    (c) => {
      const d = c.callTool("search", { query: "zebrafish" }).results;
      assert.equal(d.length, 1);
      assert.ok(d[0].snippet.toLowerCase().includes("zebrafish"), `description hit snippet: ${d[0].snippet}`);
      assert.ok(d[0].snippet.length <= 200);
      const n = c.callTool("search", { query: "quokkaword" }).results;
      assert.equal(n.length, 1);
      assert.ok(n[0].snippet.toLowerCase().includes("quokkaword"), `name hit snippet: ${n[0].snippet}`);
      const h = c.callTool("search", { query: "axolotl" }).results;
      assert.equal(h.length, 1);
      assert.ok(h[0].snippet.toLowerCase().includes("axolotl"), `heading hit snippet: ${h[0].snippet}`);
    }
  );
});

test("FR-2 search \"regression test\" on the real package: result shape, catalog keys, snippet bound, snippet holds the first matching word", () => {
  const r = realCore.callTool("search", { query: "regression test" });
  assert.equal(r.akiliVersion, realCore.akiliVersion);
  assert.equal(r.results.length, 10, "default limit 10");
  const keys = new Set(realCore.keys());
  for (const e of r.results) {
    assert.deepEqual(Object.keys(e), ["path", "title", "snippet", "score"]);
    assert.ok(keys.has(e.path) && /^(commands|skills|templates)\//.test(e.path), e.path);
    assert.ok(e.snippet.length <= 200);
    assert.ok(Number.isInteger(e.score) && e.score >= 1);
    const raw = realCore.readFile(e.path);
    const body = stripFrontmatter(raw);
    const m = /(?<![\p{L}\p{N}])(regression|test)(?![\p{L}\p{N}])/iu.exec(body);
    if (m) assert.ok(e.snippet.includes(m[0]), `${e.path} snippet should hold ${m[0]}: ${e.snippet}`);
    const fm = /^name:[ \t]*(.+)$/m.exec(raw.split(/\r?\n---\r?\n/)[0]);
    const h = /^#{1,6}\s+(.+?)\s*$/m.exec(body);
    const expectTitle = raw.startsWith("---") && fm ? fm[1].trim().replace(/^"|"$/g, "") : h ? h[1] : e.path;
    assert.equal(e.title, expectTitle, e.path);
  }
  for (let i = 1; i < r.results.length; i++) {
    const a = r.results[i - 1];
    const b = r.results[i];
    assert.ok(a.score > b.score || (a.score === b.score && a.path < b.path), `${a.path}(${a.score}) before ${b.path}(${b.score})`);
  }
});

test("FR-2 search is deterministic: the same query returns the same results, also from a fresh core", () => {
  const a = realCore.callTool("search", { query: "regression test", limit: 20 });
  const b = realCore.callTool("search", { query: "regression test", limit: 20 });
  const c = core.createCore({ packageDir: REPO_ROOT }).callTool("search", { query: "regression test", limit: 20 });
  assert.deepEqual(a, b);
  assert.deepEqual(a, c);
  assert.deepEqual(realCore.callTool("search", { query: "Regression  TEST" }).results.map((e) => e.path), realCore.callTool("search", { query: "regression test" }).results.map((e) => e.path));
});

test("FR-2 search \"akili-propose\" ranks the command named akili-propose first", () => {
  const r = realCore.callTool("search", { query: "akili-propose" }).results[0];
  assert.equal(r.path, "commands/akili-propose.md");
  assert.equal(r.score, 10, "akili (5) + propose (5), name and path");
});

test("FR-2 search limit: default 10, honored below 20, clamped to 20 above it", () => {
  const n = (limit) => realCore.callTool("search", Object.assign({ query: "md" }, limit === undefined ? {} : { limit })).results.length;
  assert.equal(n(undefined), 10);
  assert.equal(n(1), 1);
  assert.equal(n(3), 3);
  assert.equal(n(20), 20);
  assert.equal(n(21), 20);
  assert.equal(n(1000), 20);
});

test("FR-2 search with an empty or whitespace query, or a limit below 1, returns invalid_argument naming the argument", () => {
  for (const q of ["", " ", "   ", "\t\n ", "\u00a0"]) {
    const r = realCore.callTool("search", { query: q });
    assert.equal(r.error.code, "invalid_argument", JSON.stringify(q));
    assert.match(r.error.message, /query/);
  }
  for (const limit of [0, -1, -20]) {
    const r = realCore.callTool("search", { query: "test", limit });
    assert.equal(r.error.code, "invalid_argument");
    assert.match(r.error.message, /limit/);
  }
});

test("FR-2 search reads only catalog files: no read of a path outside the catalog, no external call", () => {
  const fresh = core.createCore({ packageDir: REPO_ROOT });
  const calls = withReadSpy(() => {
    fresh.callTool("search", { query: "regression test" });
  });
  const claude = path.join(REPO_ROOT, ".claude") + path.sep;
  for (const [, file] of calls) assert.ok(file.startsWith(claude), `read ${file}`);
});

// ---------------------------------------------------------------------------
// FR-2 Errors: a table of bad inputs for every tool
// ---------------------------------------------------------------------------

const BAD_INPUTS = [
  // [tool, args, expected code, regex the message must match]
  ["list_commands", { extra: 1 }, "invalid_argument", /extra/],
  ["list_commands", "x", "invalid_argument", /object/],
  ["list_skills", { extra: 1 }, "invalid_argument", /extra/],
  ["list_skills", [], "invalid_argument", /object/],
  ["get_command", { name: 5 }, "invalid_argument", /name/],
  ["get_command", {}, "invalid_argument", /name/],
  ["get_command", { name: "akili-audit", extra: 1 }, "invalid_argument", /extra/],
  ["get_command", { name: "../package.json" }, "not_found", /command/],
  ["get_skill", { name: ["tdd"] }, "invalid_argument", /name/],
  ["get_skill", {}, "invalid_argument", /name/],
  ["get_skill", { name: "tdd", file: 3 }, "invalid_argument", /file/],
  ["get_skill", { name: "tdd", part: "2" }, "invalid_argument", /part/],
  ["get_skill", { name: "tdd", part: 99 }, "invalid_argument", /part/],
  ["get_skill", { name: "tdd", part: 0 }, "invalid_argument", /part/],
  ["get_skill", { name: "tdd", extra: 1 }, "invalid_argument", /extra/],
  ["get_skill", { name: "tdd", file: "../../package.json" }, "not_found", /file/],
  ["get_skill", { name: "/etc/passwd" }, "not_found", /skill/],
  ["get_template", { name: {} }, "invalid_argument", /name/],
  ["get_template", {}, "invalid_argument", /name/],
  ["get_template", { name: "leader", part: 1.5 }, "invalid_argument", /part/],
  ["get_template", { name: "leader", part: 99 }, "invalid_argument", /part/],
  ["get_template", { name: "leader", extra: 1 }, "invalid_argument", /extra/],
  ["get_template", { name: "..\\leader" }, "not_found", /template/],
  ["get_file", { path: 7 }, "invalid_argument", /path/],
  ["get_file", {}, "invalid_argument", /path/],
  ["get_file", { path: null }, "invalid_argument", /path/],
  ["get_file", { path: "scripts/parse_tests.js", part: "1" }, "invalid_argument", /part/],
  ["get_file", { path: "scripts/parse_tests.js", part: 99 }, "invalid_argument", /part/],
  ["get_file", { path: "scripts/parse_tests.js", extra: 1 }, "invalid_argument", /extra/],
  ["get_file", { path: "../package.json" }, "not_found", /path/],
  ["get_file", { path: "/etc/passwd" }, "not_found", /path/],
  ["get_file", { path: path.join(REPO_ROOT, "package.json") }, "not_found", /path/],
  ["get_file", { path: "C:\\Windows\\win.ini" }, "not_found", /path/],
  ["get_file", { path: "" }, "not_found", /path/],
  ["search", { query: 5 }, "invalid_argument", /query/],
  ["search", {}, "invalid_argument", /query/],
  ["search", { query: "  " }, "invalid_argument", /query/],
  ["search", { query: "x", limit: "5" }, "invalid_argument", /limit/],
  ["search", { query: "x", limit: 1.5 }, "invalid_argument", /limit/],
  ["search", { query: "x", limit: 0 }, "invalid_argument", /limit/],
  ["search", { query: "x", extra: 1 }, "invalid_argument", /extra/],
  ["search", null, "invalid_argument", /query/],
];

test("FR-2 bad inputs for every tool: the right code, an envelope with akiliVersion, no throw, no stack trace or absolute path", () => {
  const seenTools = new Set();
  for (const [tool, args, code, re] of BAD_INPUTS) {
    seenTools.add(tool);
    let r;
    assert.doesNotThrow(() => {
      r = realCore.callTool(tool, args);
    }, `${tool} ${JSON.stringify(args)}`);
    assert.equal(r.akiliVersion, realCore.akiliVersion);
    assert.equal(r.error.code, code, `${tool} ${JSON.stringify(args)} -> ${JSON.stringify(r.error)}`);
    assert.match(r.error.message, re, `${tool} ${JSON.stringify(args)}`);
    assert.ok(core.ERROR_CODES.includes(r.error.code));
    assert.deepEqual(Object.keys(r), ["akiliVersion", "error"]);
    const s = JSON.stringify(r);
    assert.ok(!s.includes(REPO_ROOT), "no absolute path");
    assert.ok(!s.includes("/Users/") && !s.includes("\\Users\\"), "no home path");
    assert.ok(!/\n\s+at |\.js:\d+:\d+|node_modules|"stack"/.test(s), "no stack trace");
  }
  assert.deepEqual(Array.from(seenTools).sort(), core.TOOL_DEFINITIONS.map((d) => d.name).sort(), "every tool has rows");
});

test("FR-2 a part outside 1..parts names parts in the hint, for every file-returning tool", () => {
  const calls = [
    ["get_command", { name: "akili-constitution" }],
    ["get_skill", { name: "tdd" }],
    ["get_template", { name: "digests" }],
    ["get_file", { path: "templates/digests.json" }],
  ];
  for (const [tool, args] of calls) {
    const ok = realCore.callTool(tool, args);
    for (const part of [0, -1, ok.parts + 1]) {
      const r = realCore.callTool(tool, Object.assign({}, args, { part }));
      assert.equal(r.error.code, "invalid_argument", `${tool} part ${part}`);
      assert.equal(r.error.parts, ok.parts);
      assert.match(r.error.message, new RegExp(`1 to ${ok.parts}`));
    }
  }
});

test("FR-2 a throw in any tool becomes a generic internal error (handlers other than get_command too)", () => {
  const dir = tmpCopyOfFixture();
  try {
    const c = core.createCore({ packageDir: dir });
    for (const rel of [".claude/skills/s/SKILL.md", ".claude/skills/s/references/r.md", ".claude/templates/t.md"]) fs.rmSync(path.join(dir, rel));
    const calls = [
      ["get_skill", { name: "s" }],
      ["get_skill", { name: "s", file: "references/r.md" }],
      ["get_file", { path: "templates/t.md" }],
      ["list_skills", {}],
      ["search", { query: "anything" }],
    ];
    for (const [tool, args] of calls) {
      const r = c.callTool(tool, args);
      assert.equal(r.error.code, "internal", tool);
      assert.equal(r.error.message, "internal error");
      const s = JSON.stringify(r);
      assert.ok(!s.includes(dir) && !s.includes("ENOENT"), tool);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// FR-2 Paging, re-run through callTool for every file-returning tool
// ---------------------------------------------------------------------------

function rawOnDisk(key) {
  return key.startsWith("scripts/") ? read(key) : read(`.claude/${key}`);
}

// Walks parts 1..parts of one tool call; returns the rejoined text.
function pagedThroughCallTool(tool, args, expectParts) {
  const first = realCore.callTool(tool, Object.assign({}, args, { part: 1 }));
  assert.equal(first.error, undefined, `${tool} ${JSON.stringify(args)}`);
  if (expectParts !== undefined) assert.equal(first.parts, expectParts);
  const texts = [];
  for (let p = 1; p <= first.parts; p++) {
    const r = realCore.callTool(tool, Object.assign({}, args, { part: p }));
    assert.equal(r.part, p);
    assert.equal(r.parts, first.parts);
    assert.ok(r.text.length <= PART_MAX, `${tool} ${JSON.stringify(args)} part ${p}: ${r.text.length}`);
    const size = JSON.stringify(r).length;
    assert.ok(size <= RESULT_MAX, `${tool} ${JSON.stringify(args)} part ${p} serialized: ${size}`);
    if (p < first.parts) assert.ok(r.text.endsWith("\n") || !r.text.includes("\n"), "cuts at a line break");
    texts.push(r.text);
  }
  return texts.join("");
}

test("FR-2 paging sweep through callTool: get_file over every catalog key rejoins byte-exact, parts <= 30,000, results <= 40,000", () => {
  for (const key of realCore.keys()) {
    const expected = key.startsWith("commands/") ? stripFrontmatter(rawOnDisk(key)).split("$ARGUMENTS").join("") : rawOnDisk(key);
    assert.equal(pagedThroughCallTool("get_file", { path: key }), expected, key);
  }
});

test("FR-2 paging sweep through callTool: get_skill over every file of every skill", () => {
  let files = 0;
  for (const { name, files: keys } of realCore.callTool("list_skills").skills) {
    for (const key of keys) {
      files++;
      const file = key.slice(`skills/${name}/`.length);
      assert.equal(pagedThroughCallTool("get_skill", { name, file }), rawOnDisk(key), key);
    }
  }
  assert.ok(files > 60, `swept ${files} skill files`);
});

test("FR-2 paging sweep through callTool: get_template over the seven templates, digests.json spans parts", () => {
  for (const [name, key] of TEMPLATE_TABLE) {
    assert.equal(pagedThroughCallTool("get_template", { name }), rawOnDisk(key), name);
  }
  assert.equal(realCore.callTool("get_template", { name: "digests" }).parts, 16);
});

test("FR-2 paging sweep through callTool: get_command over every command, with and without arguments", () => {
  for (const { name } of realCore.callTool("list_commands").commands) {
    const body = stripFrontmatter(rawOnDisk(`commands/${name}.md`));
    assert.equal(pagedThroughCallTool("get_command", { name }), body.split("$ARGUMENTS").join(""), name);
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

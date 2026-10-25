"use strict";

// @akili-spec changes/akili-review (T1: review schema + validate-review.cjs)
//
// Drives the shipped validator as a subprocess. Expected values are literals
// written from the FR-7 / design 5.2 rules, never read back from the code or
// the schema under test. Every rejection asserts the exit code AND the exact
// `findings[<index>].<field>` the diagnostic names; each bound is probed on both
// sides so a mis-set limit is caught, not just a missing one.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const SKILL_DIR = path.join(REPO_ROOT, ".claude", "skills", "pr-review");
const VALIDATOR = path.join(SKILL_DIR, "validate-review.cjs");
const SCHEMA = path.join(SKILL_DIR, "review-schema.json");
const FIX = path.join(__dirname, "fixtures", "pr-review");
const MANIFEST = path.join(FIX, "manifest.json");

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const fixture = (name) => path.join(FIX, name);

function tmpDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pr-review-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function run(args) {
  return spawnSync(process.execPath, [VALIDATOR, ...args], { encoding: "utf8" });
}

// Writes `doc` (an object, or a raw string) to a temp file and validates it.
function validate(t, doc, extra = []) {
  const file = path.join(tmpDir(t), "findings.json");
  fs.writeFileSync(file, typeof doc === "string" ? doc : JSON.stringify(doc));
  return run([file, ...extra]);
}

// The valid fixture, with finding index 1 (the critical) edited by `edit`.
function withFinding(edit) {
  const doc = readJson(fixture("valid-review.json"));
  edit(doc.findings[1], doc);
  return doc;
}

const WITH_MANIFEST = ["--manifest", MANIFEST];

test("valid document exits 0, with and without a manifest", (t) => {
  assert.equal(validate(t, readJson(fixture("valid-review.json")), WITH_MANIFEST).status, 0);
  assert.equal(validate(t, readJson(fixture("valid-review.json"))).status, 0);
});

// --- FR-7 scenario "Malformed findings" and "Single-judge critical" ---------------

test("scenario Malformed findings: missing evidence names finding 1 and `evidence`", () => {
  const r = run([fixture("malformed-missing-evidence.json"), ...WITH_MANIFEST]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /findings\[1\]\.evidence/);
  assert.doesNotMatch(r.stderr, /findings\[0\]/);
});

test("scenario Malformed findings: confidence 120 names finding 1 and `confidence`", () => {
  const r = run([fixture("malformed-confidence-120.json"), ...WITH_MANIFEST]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /findings\[1\]\.confidence/);
  assert.doesNotMatch(r.stderr, /findings\[0\]/);
});

test("scenario Single-judge critical: {critical, suspect: true} is rejected on `suspect`", () => {
  const r = run([fixture("single-judge-critical.json"), ...WITH_MANIFEST]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /findings\[1\]\.suspect/);
});

// No manifest here on purpose: with one, the file-in-manifest rule would also reject
// these paths and mask a missing `..` / leading-slash / charset check.
test("path traversal fixture ../../etc/passwd is rejected on `file` by the path rule alone", () => {
  const r = run([fixture("path-traversal.json")]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /findings\[1\]\.file/);
});

// --- 5.2 rules, illegal side: each case names the exact field ---------------------

const REJECTED = [
  ["confidence 101", (f) => { f.confidence = 101; }, "confidence"],
  ["confidence -1", (f) => { f.confidence = -1; }, "confidence"],
  ["confidence 85.5 (not an integer)", (f) => { f.confidence = 85.5; }, "confidence"],
  ["confidence as a string", (f) => { f.confidence = "90"; }, "confidence"],
  ["suspect as a string", (f) => { f.suspect = "true"; }, "suspect"],
  ["severity outside the enum", (f) => { f.severity = "blocker"; }, "severity"],
  ["lens outside the six", (f) => { f.lens = "style"; }, "lens"],
  ["side outside the enum", (f) => { f.side = "BOTH"; }, "side"],
  ["id not F-<n>", (f) => { f.id = "X-2"; }, "id"],
  ["id F- with no number", (f) => { f.id = "F-"; }, "id"],
  ["duplicate id", (f) => { f.id = "F-1"; }, "id"],
  ["line_start 0", (f) => { f.line_start = 0; }, "line_start"],
  ["line_end 0", (f) => { f.line_start = 1; f.line_end = 0; }, "line_end"],
  ["line_start after line_end", (f) => { f.line_start = 13; f.line_end = 12; }, "line_start"],
  ["line_start not an integer", (f) => { f.line_start = 1.5; }, "line_start"],
  ["empty evidence", (f) => { f.evidence = ""; }, "evidence"],
  ["evidence of 1201 characters", (f) => { f.evidence = "e".repeat(1201); }, "evidence"],
  ["empty why", (f) => { f.why = ""; }, "why"],
  ["why of 801 characters", (f) => { f.why = "w".repeat(801); }, "why"],
  ["fix of 801 characters", (f) => { f.fix = "x".repeat(801); }, "fix"],
  ["missing why", (f) => { delete f.why; }, "why"],
  ["missing fix (nullable is not optional)", (f) => { delete f.fix; }, "fix"],
  ["unexpected extra property", (f) => { f.fingerprint = "abcdef0123456789"; }, "fingerprint"],
];

// Path-shape rules, judged without a manifest so no other rule can reject them first.
const REJECTED_PATHS = [
  ["file with a space", "src/my file.js"],
  ["file with a backslash", "src\\auth\\session.js"],
  ["file with a shell metacharacter", "src/a;rm.js"],
  ["file with a .. segment", "src/../secrets.js"],
  ["file that is ..", ".."],
  ["file with a leading slash", "/etc/passwd"],
  ["empty file", ""],
];

for (const [name, edit, field] of REJECTED) {
  test(`rejects ${name}`, (t) => {
    const r = validate(t, withFinding(edit), WITH_MANIFEST);
    assert.equal(r.status, 1, r.stderr);
    assert.ok(r.stderr.includes(`findings[1].${field}`), `stderr must name findings[1].${field}: ${r.stderr}`);
  });
}

for (const [name, file] of REJECTED_PATHS) {
  test(`rejects ${name} (no manifest)`, (t) => {
    const r = validate(t, withFinding((f) => { f.file = file; }));
    assert.equal(r.status, 1, r.stderr);
    assert.ok(r.stderr.includes("findings[1].file"), r.stderr);
  });
}

test("rejects a file absent from the manifest", (t) => {
  const r = validate(t, withFinding((f) => { f.file = "src/other.js"; }), WITH_MANIFEST);
  assert.equal(r.status, 1);
  assert.ok(r.stderr.includes("findings[1].file"), r.stderr);
});

// --- 5.2 rules, legal side: the boundary values are accepted ----------------------

const ACCEPTED = [
  ["confidence 100", (f) => { f.confidence = 100; }],
  ["confidence at the threshold (80)", (f) => { f.confidence = 80; }],
  ["line_start equal to line_end", (f) => { f.line_start = 7; f.line_end = 7; }],
  ["evidence of exactly 1200 characters", (f) => { f.evidence = "e".repeat(1200); }],
  ["why of exactly 800 characters", (f) => { f.why = "w".repeat(800); }],
  ["fix of exactly 800 characters", (f) => { f.fix = "x".repeat(800); }],
  ["a suspect warning", (f) => { f.severity = "warning"; f.suspect = true; }],
  ["a non-suspect critical", (f) => { f.severity = "critical"; f.suspect = false; }],
  ["every allowed file character", (f) => { f.file = "lib/util@2/index.ts"; }],
];

for (const [name, edit] of ACCEPTED) {
  test(`accepts ${name}`, (t) => {
    const r = validate(t, withFinding(edit), WITH_MANIFEST);
    assert.equal(r.status, 0, r.stderr);
  });
}

test("confidence below the manifest threshold (79 < 80) is rejected on `confidence`", (t) => {
  const r = validate(t, withFinding((f) => { f.confidence = 79; }), WITH_MANIFEST);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /findings\[1\]\.confidence/);
});

test("--threshold overrides the manifest: 85 passes at 80 but fails at 90", (t) => {
  const doc = readJson(fixture("valid-review.json"));
  doc.findings[1].confidence = 85;
  assert.equal(validate(t, doc, [...WITH_MANIFEST, "--threshold", "80"]).status, 0);
  const r = validate(t, doc, [...WITH_MANIFEST, "--threshold", "90"]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /findings\[1\]\.confidence/);
});

test("--threshold works without a manifest", (t) => {
  const doc = readJson(fixture("valid-review.json"));
  assert.equal(validate(t, doc, ["--threshold", "96"]).status, 1);
});

// --- document-level rules ---------------------------------------------------------

test("tier different from the manifest is rejected on `tier`", (t) => {
  const doc = readJson(fixture("valid-review.json"));
  doc.tier = "lite";
  const r = validate(t, doc, WITH_MANIFEST);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /\n {2}tier:/);
});

test("top_risks: 3 accepted, 4 rejected on `top_risks`", (t) => {
  const doc = readJson(fixture("valid-review.json"));
  doc.top_risks = ["a", "b", "c"];
  assert.equal(validate(t, doc, WITH_MANIFEST).status, 0);
  doc.top_risks = ["a", "b", "c", "d"];
  const r = validate(t, doc, WITH_MANIFEST);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /\n {2}top_risks:/);
});

test("schema_version other than \"1\" is rejected", (t) => {
  const doc = readJson(fixture("valid-review.json"));
  doc.schema_version = "2";
  const r = validate(t, doc);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /\n {2}schema_version:/);
});

test("target.pr may be null, a string is rejected on `target.pr`", (t) => {
  const doc = readJson(fixture("valid-review.json"));
  doc.target.pr = null;
  assert.equal(validate(t, doc).status, 0);
  doc.target.pr = "42";
  const r = validate(t, doc);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /\n {2}target\.pr:/);
});

test("a coverage row with a status outside the enum is named by index and field", (t) => {
  const doc = readJson(fixture("valid-review.json"));
  doc.coverage[0].status = "done";
  const r = validate(t, doc);
  assert.equal(r.status, 1);
  assert.ok(r.stderr.includes("coverage[0].status"), r.stderr);
});

test("every violation is reported, not only the first", (t) => {
  const doc = readJson(fixture("valid-review.json"));
  doc.findings[0].confidence = 120;
  doc.findings[1].evidence = "";
  const r = validate(t, doc, WITH_MANIFEST);
  assert.equal(r.status, 1);
  assert.ok(r.stderr.includes("findings[0].confidence"), r.stderr);
  assert.ok(r.stderr.includes("findings[1].evidence"), r.stderr);
});

test("an empty findings array is valid", (t) => {
  const doc = readJson(fixture("valid-review.json"));
  doc.findings = [];
  assert.equal(validate(t, doc, WITH_MANIFEST).status, 0);
});

// --- exit codes: 1 invalid, 2 usage ------------------------------------------------

test("a document that is not JSON exits 1", (t) => {
  assert.equal(validate(t, "{ not json").status, 1);
});

test("a document whose root is an array exits 1", (t) => {
  assert.equal(validate(t, "[]").status, 1);
});

test("usage errors exit 2: no args, unknown flag, missing file, bad threshold, bad manifest", (t) => {
  const good = fixture("valid-review.json");
  const dir = tmpDir(t);
  const brokenManifest = path.join(dir, "m.json");
  fs.writeFileSync(brokenManifest, "{ nope");
  const cases = {
    "no arguments": [],
    "unknown flag": [good, "--frobnicate"],
    "document file missing": [path.join(dir, "absent.json")],
    "--manifest without a value": [good, "--manifest"],
    "manifest file missing": [good, "--manifest", path.join(dir, "absent.json")],
    "manifest not JSON": [good, "--manifest", brokenManifest],
    "threshold not a number": [good, "--threshold", "high"],
    "threshold above 100": [good, "--threshold", "101"],
    "two documents": [good, good],
  };
  for (const [label, args] of Object.entries(cases)) {
    assert.equal(run(args).status, 2, label);
  }
});

// --- the strict subset and NFR-2, locked on the shipped files ---------------------

test("review-schema.json parses and uses only the strict subset", () => {
  const allowed = new Set(["type", "enum", "properties", "required", "items", "additionalProperties"]);
  const seen = [];
  (function walk(node, where) {
    seen.push(where);
    for (const key of Object.keys(node)) assert.ok(allowed.has(key), `${where}: keyword ${key} is outside the subset`);
    if (node.type === "object" || (Array.isArray(node.type) && node.type.includes("object"))) {
      assert.equal(node.additionalProperties, false, `${where}: additionalProperties must be false`);
      assert.deepEqual([...node.required].sort(), Object.keys(node.properties).sort(), `${where}: every property must be required`);
      for (const [k, v] of Object.entries(node.properties)) walk(v, `${where}.${k}`);
    }
    if (node.items) walk(node.items, `${where}[]`);
  })(readJson(SCHEMA), "$");
  assert.ok(seen.includes("$.findings[]") && seen.includes("$.target") && seen.includes("$.coverage[]"));
});

test("validator uses no O_NOFOLLOW and requires only Node core modules", () => {
  const text = fs.readFileSync(VALIDATOR, "utf8");
  assert.equal((text.match(/O_NOFOLLOW/g) || []).length, 0);
  const core = new Set(require("module").builtinModules);
  for (const m of text.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) {
    assert.ok(core.has(m[1].replace(/^node:/, "")), `non-core require: ${m[1]}`);
  }
});

"use strict";

// @akili-spec changes/akili-review (T1: review schema + validate-review.cjs; T2: post-review.cjs prepare + render)
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

// =====================================================================================
// T2: post-review.cjs `prepare` and `render`
//
// Expected values are literals from FR-4, FR-8, FR-9 and design 5.3 / 7.5, never read
// back from the script. AKILI_POST_REVIEW_UNDER_TEST points the CLI tests at another
// script (used once, for the observed-red run against an echo stub).
// =====================================================================================

const POST = process.env.AKILI_POST_REVIEW_UNDER_TEST || path.join(SKILL_DIR, "post-review.cjs");
const SHA_BASE = "1".repeat(40);
const SHA_HEAD = "2".repeat(40);

function post(args, extra = {}) {
  return spawnSync(process.execPath, [POST, ...args], { encoding: "utf8", ...extra });
}

// Runs `prepare` on a diff given as text (or a fixture path) and returns the parsed manifest.
function prepare(t, diff, extra = [], expectStatus = 0) {
  const dir = tmpDir(t);
  const file = diff.includes("\n") ? path.join(dir, "in.diff") : diff;
  if (diff.includes("\n")) fs.writeFileSync(file, diff);
  const out = path.join(dir, "run");
  const r = post(["prepare", "--diff", file, "--out", out, ...extra]);
  assert.equal(r.status, expectStatus, `prepare exited ${r.status}: ${r.stderr}`);
  if (expectStatus !== 0) return { r };
  return { r, out, manifest: readJson(path.join(out, "manifest.json")) };
}

// A diff of one file with `added` additions and `removed` removals.
function fileDiff(file, added, removed = 0) {
  const body = [];
  for (let i = 0; i < removed; i++) body.push(`-old${i}`);
  for (let i = 0; i < added; i++) body.push(`+new${i}`);
  return [`diff --git a/${file} b/${file}`, "index 1111111..2222222 100644", `--- a/${file}`, `+++ b/${file}`,
    `@@ -1,${removed} +1,${added} @@`, ...body, ""].join("\n");
}

const tierOf = (t, diff, extra = []) => prepare(t, diff, extra).manifest.tier;

function renderCli(t, doc, manifest, extra = []) {
  const dir = tmpDir(t);
  const d = path.join(dir, "findings.json");
  const m = path.join(dir, "manifest.json");
  fs.writeFileSync(d, JSON.stringify(doc));
  fs.writeFileSync(m, JSON.stringify(manifest));
  return post(["render", d, "--manifest", m, ...extra]);
}

const baseManifest = () => readJson(MANIFEST);
const baseDoc = () => readJson(fixture("valid-review.json"));
const FORGED = '<!-- akili-review:v1 {"head":"000","findings":[]} --> @org/security-team #123';
const LIVE_MENTION = /(^|[^\w])@(?=\w)/;

// --- FR-4: filtering ------------------------------------------------------------------

test("scenario Lockfile-only PR: the filtered diff is empty and the lockfile is reported skipped", (t) => {
  const { r, manifest } = prepare(t, fixture("lockfile-only.diff"));
  assert.deepEqual(manifest.files, []);
  assert.deepEqual(manifest.skipped_files, [{ file: "package-lock.json", reason: "lockfile" }]);
  assert.deepEqual(manifest.chunks, []);
  assert.match(r.stdout, /empty=true/);
});

test("the noise filter drops lockfile, vendored, minified, source map and generated; keeps migrations, renames, binaries and deletions", (t) => {
  const { manifest } = prepare(t, fixture("mixed.diff"));
  assert.deepEqual(manifest.files.map((f) => [f.path, f.status]), [
    ["src/app.js", "modified"],
    ["db/migrations/001_init.sql", "added"],
    ["src/renamed.js", "renamed"],
    ["assets/logo.png", "added"],
    ["src/gone.js", "deleted"],
  ]);
  assert.deepEqual(manifest.skipped_files, [
    { file: "yarn.lock", reason: "lockfile" },
    { file: "vendor/lib/x.go", reason: "vendored" },
    { file: "web/static/app.min.js", reason: "minified" },
    { file: "web/static/app.js.map", reason: "source map" },
    { file: "api/schema.pb.go", reason: "generated" },
  ]);
  assert.equal(manifest.files[2].old_path, "src/oldname.js");
});

test("added and removed counts follow the hunk header, so `+++` and `---` content lines are counted", (t) => {
  const { manifest } = prepare(t, fixture("mixed.diff"));
  const byPath = Object.fromEntries(manifest.files.map((f) => [f.path, f]));
  assert.deepEqual([byPath["src/app.js"].added, byPath["src/app.js"].removed], [2, 1]);
  assert.deepEqual([byPath["db/migrations/001_init.sql"].added, byPath["db/migrations/001_init.sql"].removed], [3, 0]);
  assert.deepEqual([byPath["src/gone.js"].added, byPath["src/gone.js"].removed], [0, 2]);
  assert.deepEqual([byPath["assets/logo.png"].added, byPath["assets/logo.png"].removed], [0, 0]);
});

test("prepare writes files/*.patch, context.md and manifest.json; each patch is that file's diff section", (t) => {
  const { out, manifest } = prepare(t, fixture("mixed.diff"));
  assert.ok(fs.existsSync(path.join(out, "context.md")));
  assert.deepEqual(manifest.files.map((f) => f.patch), ["files/0001.patch", "files/0002.patch", "files/0003.patch", "files/0004.patch", "files/0005.patch"]);
  const first = fs.readFileSync(path.join(out, "files/0001.patch"), "utf8");
  assert.equal(first, [
    "diff --git a/src/app.js b/src/app.js", "index 1111111..2222222 100644", "--- a/src/app.js", "+++ b/src/app.js",
    "@@ -1,4 +1,5 @@", " keep", "+++ not a file header, a content line", "--- not a file header either", "+added line", " end", "",
  ].join("\n"));
  assert.match(fs.readFileSync(path.join(out, "context.md"), "utf8"), /db\/migrations\/001_init\.sql/);
});

test("manifest carries the design 5.3 fields and the target from the CLI", (t) => {
  const { manifest } = prepare(t, fixture("small-auth.diff"), ["--repo", "acme/widgets", "--pr", "42", "--base", SHA_BASE, "--head", SHA_HEAD]);
  assert.deepEqual(Object.keys(manifest).sort(), ["chunks", "config_source", "files", "lenses", "recommend_security", "skipped_files", "target", "threshold", "tier"]);
  assert.deepEqual(manifest.target, { kind: "pr", pr: 42, repo: "acme/widgets", base_sha: SHA_BASE, head_sha: SHA_HEAD });
  assert.equal(manifest.threshold, 80);
  assert.equal(manifest.config_source, "default");
});

// --- FR-4: tier -----------------------------------------------------------------------

test("scenario Small but sensitive: 6 lines in src/auth/session.js is `full` and recommends that path", (t) => {
  const { manifest } = prepare(t, fixture("small-auth.diff"));
  assert.equal(manifest.files[0].added + manifest.files[0].removed, 6);
  assert.equal(manifest.tier, "full");
  assert.deepEqual(manifest.recommend_security, ["src/auth/session.js"]);
  assert.deepEqual(manifest.lenses, ["spec", "correctness", "tests", "maintainability", "security"]);
});

test("a 6-line change outside every sensitive path is `trivial` (the sensitive match is what lifts the auth one)", (t) => {
  const { manifest } = prepare(t, fileDiff("src/util/format.js", 5, 1));
  assert.equal(manifest.tier, "trivial");
  assert.deepEqual(manifest.recommend_security, []);
  assert.deepEqual(manifest.lenses, ["spec", "correctness"]);
});

test("tier boundaries: 10 lines trivial, 11 lite, 100 lite, 101 full; 20 files lite, 21 files full", (t) => {
  assert.equal(tierOf(t, fileDiff("src/a.js", 10)), "trivial");
  assert.equal(tierOf(t, fileDiff("src/a.js", 11)), "lite");
  assert.equal(tierOf(t, fileDiff("src/a.js", 100)), "lite");
  assert.equal(tierOf(t, fileDiff("src/a.js", 101)), "full");
  const many = (n) => Array.from({ length: n }, (_, i) => fileDiff(`src/f${i}.js`, 1)).join("");
  assert.equal(tierOf(t, many(20)), "lite");
  assert.equal(tierOf(t, many(21)), "full");
  assert.deepEqual(prepare(t, fileDiff("src/a.js", 11)).manifest.lenses, ["spec", "correctness", "tests"]);
});

test("every default sensitive class lifts a one-line change to `full`", (t) => {
  const paths = ["src/auth/login.js", "lib/crypto/aes.js", "config/secrets.yml", "app/credentials.json", "src/sessions/store.js",
    "src/tokens/refresh.js", "src/ipc/channel.js", "src/deserializer.js", ".github/workflows/ci.yml", "package.json", "services/api/go.mod"];
  for (const p of paths) assert.equal(tierOf(t, fileDiff(p, 1)), "full", p);
  assert.equal(tierOf(t, fileDiff("src/ui/button.js", 1)), "trivial");
});

test("falsifier (c) fixtures: a 6-line src/auth/login.js and a 6-line src/session.js are each `full` on their own glob", (t) => {
  assert.equal(tierOf(t, fileDiff("src/auth/login.js", 5, 1)), "full");
  assert.equal(tierOf(t, fileDiff("src/session.js", 5, 1)), "full");
});

test("FR-4 sessions and tokens are matched by file name, not only by directory", (t) => {
  const named = ["src/session.js", "app/middleware/session.go", "lib/sessionStore.ts", "src/sessions.py", "src/session/store.js", "src/UserSession.ts",
    "src/user-session.js", "src/user_session.rb", "src/app.session.ts", "src/token.js", "src/tokens.ts", "src/refresh-token.js", "src/auth_token.py",
    "src/RefreshToken.java", "src/tokenStore.ts", "src/api.token.ts"];
  for (const p of named) assert.equal(tierOf(t, fileDiff(p, 5, 1)), "full", p);
  for (const p of ["src/obsession.js", "src/expression.js", "src/util/format.js"]) assert.equal(tierOf(t, fileDiff(p, 5, 1)), "trivial", p);
});

test("--tier overrides the derived tier; an unknown tier exits 2", (t) => {
  assert.equal(tierOf(t, fileDiff("src/a.js", 1), ["--tier", "full"]), "full");
  assert.equal(tierOf(t, fileDiff("src/auth/a.js", 1), ["--tier", "lite"]), "lite");
  assert.equal(prepare(t, fileDiff("src/a.js", 1), ["--tier", "huge"], 2).r.status, 2);
});

test("a docs change adds the optional `docs` lens only on `full`", (t) => {
  const diff = fileDiff("src/auth/a.js", 1) + fileDiff("docs/guide.md", 1);
  assert.deepEqual(prepare(t, diff).manifest.lenses.slice(-1), ["docs"]);
});

// --- .akili/review.yml ----------------------------------------------------------------

function withConfig(t, yml, diff = fileDiff("src/a.js", 11), extra = [], status = 0) {
  const cfg = path.join(tmpDir(t), "review.yml");
  fs.writeFileSync(cfg, yml);
  return prepare(t, diff, ["--config", cfg, ...extra], status);
}

test("config: overrides the threshold and the tier limits; records the base-SHA source", (t) => {
  const { manifest } = withConfig(t, "threshold: 90\ntrivial_max_lines: 12\n", fileDiff("src/a.js", 11), ["--base", SHA_BASE]);
  assert.equal(manifest.threshold, 90);
  assert.equal(manifest.tier, "trivial");
  assert.equal(manifest.config_source, `.akili/review.yml@${SHA_BASE}`);
});

test("config: exclude drops a file with its own reason, include keeps a lockfile; both list forms parse", (t) => {
  const diff = fileDiff("src/gen/x.js", 1) + fileDiff("yarn.lock", 1) + fileDiff("src/keep.js", 1);
  const yml = "# comment\nexclude: [\"src/gen/**\", other/**]\ninclude:\n  - yarn.lock   # force-keep\n";
  const { manifest } = withConfig(t, yml, diff);
  assert.deepEqual(manifest.files.map((f) => f.path), ["yarn.lock", "src/keep.js"]);
  assert.deepEqual(manifest.skipped_files, [{ file: "src/gen/x.js", reason: "excluded by .akili/review.yml" }]);
});

test("config: an unknown key is an error naming the key (exit 2); so are bad values, nesting and duplicates", (t) => {
  // the first case is the contract (DD-15: an unknown key is an error); the rest are the same exit-2 path
  for (const [yml, needle] of [
    ["thresold: 90\n", "thresold"], ["threshold: 101\n", "threshold"], ["threshold: high\n", "threshold"],
    ["history: maybe\n", "history"], ["exclude: src/**\n", "exclude"], ["a:\n  b: 1\n", "line 2"],
    ["threshold: 80\nthreshold: 81\n", "duplicate"],
  ]) {
    const { r } = withConfig(t, yml, fileDiff("src/a.js", 1), [], 2);
    assert.ok(r.stderr.includes(needle), `${JSON.stringify(yml)} -> ${r.stderr}`);
  }
});

// --- chunks ---------------------------------------------------------------------------

test("chunks stay under the budget, never split or truncate a file, and every file is in exactly one chunk", (t) => {
  const diff = Array.from({ length: 6 }, (_, i) => fileDiff(`src/f${i}.js`, 40)).join("");
  const { manifest } = withConfig(t, "chunk_tokens: 500\n", diff);
  assert.ok(manifest.chunks.length >= 2);
  const seen = manifest.chunks.flatMap((c) => c.files);
  assert.deepEqual(seen.slice().sort(), manifest.files.map((f) => f.path).sort());
  for (const c of manifest.chunks) assert.ok(c.tokens <= 500 || c.files.length === 1, `${c.id} holds ${c.tokens} tokens in ${c.files.length} files`);
  for (const f of manifest.files) assert.ok(manifest.chunks.some((c) => c.id === f.chunk && c.files.includes(f.path)));
});

test("an oversize file gets a chunk of its own instead of being truncated", (t) => {
  const diff = fileDiff("src/small.js", 1) + fileDiff("src/big.js", 400) + fileDiff("src/small2.js", 1);
  const { manifest, out } = withConfig(t, "chunk_tokens: 200\n", diff);
  const big = manifest.chunks.find((c) => c.files.includes("src/big.js"));
  assert.deepEqual(big.files, ["src/big.js"]);
  const patch = fs.readFileSync(path.join(out, manifest.files.find((f) => f.path === "src/big.js").patch), "utf8");
  assert.equal((patch.match(/^\+new/gm) || []).length, 400);
});

// --- prepare / render usage and offline behaviour -------------------------------------

test("prepare usage errors exit 2: missing flags, bad SHA, bad repo, bad pr, non-diff input, unreadable diff", (t) => {
  const diff = fileDiff("src/a.js", 1);
  const dir = tmpDir(t);
  const f = path.join(dir, "d.diff");
  fs.writeFileSync(f, diff);
  const out = path.join(dir, "o");
  assert.equal(post(["prepare", "--out", out]).status, 2);
  assert.equal(post(["prepare", "--diff", f]).status, 2);
  assert.equal(post(["prepare", "--diff", f, "--out", out, "--head", "abc123"]).status, 2);
  assert.equal(post(["prepare", "--diff", f, "--out", out, "--repo", "no-slash"]).status, 2);
  assert.equal(post(["prepare", "--diff", f, "--out", out, "--pr", "0"]).status, 2);
  assert.equal(post(["prepare", "--diff", f, "--out", out, "--bogus", "1"]).status, 2);
  assert.equal(post(["prepare", "--diff", path.join(dir, "missing.diff"), "--out", out]).status, 2);
  fs.writeFileSync(f, "this is not a diff\n");
  assert.equal(post(["prepare", "--diff", f, "--out", out]).status, 2);
});

test("an empty diff file is a valid empty review, not an error", (t) => {
  const { manifest, r } = prepare(t, "\n");
  assert.deepEqual(manifest.files, []);
  assert.match(r.stdout, /empty=true/);
});

test("dispatcher: no subcommand, an unknown one, and the not-yet-built check-skip and post exit 2 with usage", () => {
  for (const args of [[], ["bogus"], ["check-skip"], ["post"]]) {
    const r = post(args);
    assert.equal(r.status, 2, args.join(" "));
    assert.match(r.stderr, /usage: node post-review\.cjs/);
  }
});

test("prepare and render never call gh or the network (NFR-3)", (t) => {
  const dir = tmpDir(t);
  const marker = path.join(dir, "gh-was-called");
  const bin = path.join(dir, "bin");
  fs.mkdirSync(bin);
  const fake = path.join(bin, process.platform === "win32" ? "gh.cmd" : "gh");
  fs.writeFileSync(fake, process.platform === "win32" ? `@echo called> "${marker}"\r\n` : `#!/bin/sh\necho called > "${marker}"\n`, { mode: 0o755 });
  const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, AKILI_GH_BIN: fake };
  const d = path.join(dir, "in.diff");
  fs.writeFileSync(d, fileDiff("src/auth/a.js", 2));
  assert.equal(post(["prepare", "--diff", d, "--out", path.join(dir, "run")], { env }).status, 0);
  const rr = post(["render", fixture("valid-review.json"), "--manifest", MANIFEST], { env });
  assert.equal(rr.status, 0);
  assert.equal(fs.existsSync(marker), false);
});

// --- FR-9: neutralization --------------------------------------------------------------

const PR = process.env.AKILI_POST_REVIEW_UNDER_TEST ? null : require(POST);

test("scenario Forged marker and mentions: no live HTML comment, no live mention, finding kept", (t) => {
  const doc = baseDoc();
  doc.findings[0].why = '<!-- akili-review:marker {"head":"000"} --> and @org/security-team';
  const r = renderCli(t, doc, baseManifest());
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!r.stdout.includes("<!--"), "no live `<!--` in the output");
  assert.ok(!LIVE_MENTION.test(r.stdout), "no live mention in the output");
  assert.ok(r.stdout.includes("#### F-1"), "the finding is not dropped");
  assert.ok(r.stdout.includes("akili-review:marker"), "the forged text stays visible, defanged");
  assert.ok(!/akili-review:v1/.test(r.stdout), "no marker form is written by render");
});

test("every agent- and manifest-sourced string field is defanged, not only `why`", (t) => {
  const doc = baseDoc();
  const f = doc.findings[0];
  f.evidence = FORGED;
  f.why = FORGED;
  f.fix = FORGED;
  doc.top_risks = [FORGED];
  doc.coverage = [{ spec: FORGED, fr: FORGED, status: "met", evidence: FORGED }];
  doc.unspecified_changes = [FORGED];
  doc.notes = [FORGED];
  const manifest = baseManifest();
  manifest.skipped_files = [{ file: `src/${FORGED}.js`, reason: FORGED }];
  manifest.recommend_security = [`src/${FORGED}.js`, "src/auth/session.js"];
  const r = renderCli(t, doc, manifest);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!r.stdout.includes("<!--"));
  assert.ok(!/<(?!\u200b)/.test(r.stdout), "no bare `<`: prose escapes it, fences follow it with a zero-width space");
  assert.ok(!LIVE_MENTION.test(r.stdout));
  assert.ok(!/#\d/.test(r.stdout), "no live #<n> reference");
  assert.ok(r.stdout.includes("`/akili-security src/auth/session.js --profile quick`"), "an unsafe sensitive path is kept out of the pasteable command");
});

test("neutralize: the escapes, one literal each", () => {
  const n = (s, o) => PR.neutralize(s, o);
  assert.equal(n("<b>x</b>"), "&lt;b&gt;x&lt;/b&gt;");
  assert.equal(n("a & b"), "a &amp; b");
  assert.equal(n("&#64;octocat"), "&amp;#\u200b64;octocat", "an entity cannot decode into a live mention");
  assert.equal(n("hi @octocat and @org/team"), "hi @\u200boctocat and @\u200borg/team");
  assert.equal(n("mail a@ b"), "mail a@ b", "`@` before a space is not a mention");
  assert.equal(n("fixes #123, not # 4"), "fixes #\u200b123, not # 4");
  assert.equal(n("a ````` b"), "a `` b");
  assert.equal(n("a `` b"), "a `` b");
  assert.equal(n("x\u0000y\u202ez"), "xyz", "control and bidi-override characters are stripped");
  assert.equal(n("a\r\nb"), "a\nb");
});

test("neutralize: links and images whose URL is not the repo blob of the head are inert text", () => {
  const ctx = { repo: "acme/widgets", head: SHA_HEAD };
  const n = (s) => PR.neutralize(s, { ctx });
  assert.equal(n("[click](https://evil.example/a)"), "click (`https://evil.example/a`)");
  assert.equal(n("![pixel](https://evil.example/p.png)"), "pixel (`https://evil.example/p.png`)");
  assert.equal(n("[x](javascript:alert(1))").includes("](javascript"), false);
  const good = `https://github.com/acme/widgets/blob/${SHA_HEAD}/src/a.js#L1-L2`;
  assert.equal(n(`[a.js](${good})`), `[a.js](${good})`);
  assert.equal(n(`[a.js](https://github.com/acme/widgets/blob/main/src/a.js)`), "a.js (`https://github.com/acme/widgets/blob/main/src/a.js`)");
  assert.equal(n(`[a.js](https://github.com/acme/widgets/blob/${SHA_HEAD}/../../x)`).includes("]("), false);
  assert.equal(n("[a](https://x.example)").includes("]("), false, "no head in context allows nothing");
  for (const dots of ["%2e%2e", "%2E%2E", ".%2e", "%2e.", "%2e%2e%2f", "%2F"]) {
    const url = `https://github.com/acme/widgets/blob/${SHA_HEAD}/${dots}/%2e%2e/%2e%2e/%2e%2e/evil/repo`;
    assert.equal(n(`[ok](${url})`).includes("]("), false, `${dots} is a dot segment to a browser`);
  }
});

test("neutralize: nested and reference-style links cannot rebuild a live link", () => {
  const n = (s) => PR.neutralize(s, { ctx: { repo: "acme/widgets", head: SHA_HEAD } });
  for (const evil of ["[a [b](https://x.example/1)](https://x.example/2)", "[a][r]\n\n[r]: https://x.example/3", "[a](<https://x.example/4>)", "[a](https://x.example/(5))"]) {
    const out = n(evil);
    assert.ok(!/\]\(/.test(out) && !/\]\[/.test(out) && !/^\[[^\]]+\]:/m.test(out), `${JSON.stringify(evil)} -> ${JSON.stringify(out)}`);
  }
});

test("neutralize: a link reference definition cannot hide in a list item, a quote or another field", (t) => {
  const n = (s) => PR.neutralize(s, { ctx: { repo: "acme/widgets", head: SHA_HEAD } });
  for (const prefix of ["- ", "* ", "+ ", "1. ", "1) ", "> ", "  - ", "- - ", "\t"]) {
    const out = n(`${prefix}[r]: https://evil.example/x\n\nsee [r]`);
    assert.ok(!/\]:/.test(out), `${JSON.stringify(prefix)} -> ${JSON.stringify(out)}`);
  }
  assert.ok(!/\]:/.test(n("[a\\]b]: https://evil.example/x")), "an escaped bracket in the label");
  const doc = baseDoc();
  doc.top_risks = ["- [r]: https://evil.example/x"];
  doc.findings[0].why = "see [r] for details";
  const r = renderCli(t, doc, baseManifest());
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!/\]:/.test(r.stdout), "no definition in the rendered summary");
});

test("neutralize: each field is truncated to its maximum, at the limit and one over", () => {
  for (const [field, max] of [["evidence", 1200], ["why", 800], ["fix", 800]]) {
    assert.equal(PR.FIELD_MAX[field], max);
    assert.equal(PR.neutralize("x".repeat(max), { max }), "x".repeat(max));
    assert.equal(PR.neutralize("x".repeat(max + 1), { max }), `${"x".repeat(max - 1)}\u2026`);
  }
});

test("a path failing the charset renders as an escaped code span, never a link", (t) => {
  const manifest = baseManifest();
  manifest.skipped_files = [{ file: "src/my file<b>`.js", reason: "generated" }];
  const r = renderCli(t, baseDoc(), manifest);
  assert.ok(r.stdout.includes("- `src/my\\u{20}file\\u{3c}b\\u{3e}\\u{60}.js`: generated"), r.stdout);
  assert.ok(!r.stdout.includes("<b>"));
});

test("a finding's file is linked by a full-SHA permalink, and unlinked when the manifest has no repo or head", (t) => {
  const r = renderCli(t, baseDoc(), baseManifest());
  assert.ok(r.stdout.includes(`](https://github.com/acme/widgets/blob/${SHA_HEAD}/src/auth/session.js#L10-L12)`));
  assert.ok(!/blob\/(main|master|HEAD)\//.test(r.stdout));
  const manifest = baseManifest();
  manifest.target = { kind: "staged", pr: null, repo: null, base_sha: null, head_sha: null };
  const r2 = renderCli(t, baseDoc(), manifest);
  assert.equal(r2.status, 0, r2.stderr);
  assert.ok(!r2.stdout.includes("github.com"));
  assert.ok(r2.stdout.includes("`src/auth/session.js:10-12`"));
});

// --- FR-9: redaction --------------------------------------------------------------------

test("secret shapes in evidence and prose are replaced by [redacted]", (t) => {
  const secrets = {
    ghp: `ghp_${"A1b2".repeat(9)}`,
    github_pat: `github_pat_${"a1".repeat(20)}`,
    sk: `sk-${"Z9".repeat(15)}`,
    sk_ant: `sk-ant-${"q7".repeat(15)}`,
    akia: "AKIA" + "ABCDEFGH12345678",
    slack: "xoxb-" + "1234567890-abcdefABCDEF",
    pem: "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA\n-----END RSA PRIVATE KEY-----",
  };
  assert.equal(secrets.ghp.length, 40);
  for (const [name, secret] of Object.entries(secrets)) {
    const doc = baseDoc();
    doc.findings[0].evidence = `+ const k = "${secret}";`;
    doc.findings[0].why = `The literal ${secret} is committed.`;
    const r = renderCli(t, doc, baseManifest());
    assert.equal(r.status, 0, r.stderr);
    const probe = secret.split("\n")[0].replace("-----BEGIN RSA PRIVATE KEY-----", "MIIEowIBAAKCAQEA");
    assert.ok(!r.stdout.includes(probe) && !r.stdout.includes(secret), `${name} leaked`);
    assert.ok(r.stdout.includes("[redacted]"), name);
  }
});

test("redaction runs after control and zero-width stripping, so a split token is still redacted", (t) => {
  const A = "A".repeat(18);
  const B = "B".repeat(18);
  for (const gap of ["\u0001", "\u0007", "\u200b", "\u200c", "\u200d", "\u2060", "\u00ad", "\ufe0f", "\u202e"]) {
    assert.equal(PR.neutralize(`ghp_${A}${gap}${B}`), "[redacted]", JSON.stringify(gap));
    assert.equal(PR.neutralize(`AKIA\u0007ABCDEFGH12345678`, { code: true }), "[redacted]");
  }
  const doc = baseDoc();
  doc.findings[0].evidence = `+ k = "AKIA\u0007ABCDEFGH12345678"`;
  doc.findings[0].why = `ghp_${A}\u200b${B}`;
  const r = renderCli(t, doc, baseManifest());
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!/AKIA|ghp_/.test(r.stdout), r.stdout);
  assert.ok(PR.neutralize("one\u200btwo") === "onetwo", "zero-width characters are not kept");
});

test("the /akili-security command line redacts credential-shaped paths and caps path length", (t) => {
  const manifest = baseManifest();
  manifest.recommend_security = [`src/ghp_${"A".repeat(36)}.js`, `src/${"a".repeat(400)}.js`, "src/auth/session.js"];
  const r = renderCli(t, baseDoc(), manifest);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!r.stdout.includes("ghp_"), "no token-shaped path");
  assert.ok(!r.stdout.includes("a".repeat(301)), "no path longer than the miscellaneous maximum");
  assert.ok(r.stdout.includes("`/akili-security src/auth/session.js --profile quick`"));
});

test("redaction does not eat ordinary text that only resembles a prefix", () => {
  assert.equal(PR.redact("a desk-based task, ghp_short, AKIA123"), "a desk-based task, ghp_short, AKIA123");
});

// --- FR-8 / design 7.5: order, caps, history -------------------------------------------

function positions(text, needles) {
  return needles.map((s) => {
    const i = text.indexOf(s);
    assert.ok(i >= 0, `missing ${JSON.stringify(s)}`);
    return i;
  });
}

test("REVIEW.md follows the design 7.5 order on the full fixture, critical findings first", (t) => {
  const doc = readJson(fixture("full-review.json"));
  const r = renderCli(t, doc, readJson(fixture("manifest-full.json")));
  assert.equal(r.status, 0, r.stderr);
  const at = positions(r.stdout, [
    "## AKILI Review", "**Verdict:** Critical issues found", "**Findings:** 1 critical \u00b7 1 warning \u00b7 1 suggestion",
    "### Top risks", "### Spec coverage", "### Findings", "#### F-1 \u00b7 critical", "#### F-2 \u00b7 warning", "#### F-3 \u00b7 suggestion",
    "### Skipped files", "### Security recommendation", "### Tier, lenses and host mode", "\n---\n_akili-review",
  ]);
  assert.deepEqual(at, at.slice().sort((a, b) => a - b), "sections appear in the 7.5 order");
  assert.ok(r.stdout.includes("`/akili-security src/auth/session.js --profile quick`"));
  assert.ok(r.stdout.includes("- `package-lock.json`: lockfile"));
  assert.ok(r.stdout.includes("**Unspecified changes:** `README.md`"));
  assert.ok(r.stdout.endsWith("advisory: this review never approves or blocks the PR_\n"));
});

test("renderSummary places summary-only (5), fixed (6) and the forced-advisory footer in their 7.5 slots", () => {
  const doc = readJson(fixture("full-review.json"));
  const manifest = readJson(fixture("manifest-full.json"));
  const only = [doc.findings[0]];
  const text = PR.renderSummary(doc, manifest, {
    findings: [doc.findings[2]], findingsHeading: "Inline findings", summaryOnly: only, fixed: ["F-9 in src/old.js"], advisoryForced: true,
  });
  const at = positions(text, [
    "## AKILI Review", "### Top risks", "### Spec coverage", "### Inline findings", "#### F-1", "### Summary-only findings (1)", "#### F-2",
    "### Fixed since last review", "- F-9 in src/old.js", "### Skipped files", "### Security recommendation",
    "### Tier, lenses and host mode", "advisory forced by label",
  ]);
  assert.deepEqual(at, at.slice().sort((a, b) => a - b));
});

test("size caps are the design values", () => {
  assert.equal(PR.SUMMARY_CAP, 60000);
  assert.equal(PR.INLINE_BODY_CAP, 4000);
  assert.equal(PR.INLINE_CAP, 10);
});

test("capText: unchanged at the limit, cut to exactly the limit at limit + 1 (summary 60,000 and inline 4,000)", () => {
  for (const cap of [60000, 4000]) {
    assert.equal(PR.capText("a".repeat(cap), cap), "a".repeat(cap));
    const over = PR.capText("a".repeat(cap + 1), cap);
    assert.equal(over.length, cap);
    assert.ok(over.endsWith("_[truncated to fit the size limit]_"));
  }
});

test("summary cap: output is unchanged at its measured length and shrinks to the limit at limit - 1", () => {
  const doc = readJson(fixture("full-review.json"));
  const manifest = readJson(fixture("manifest-full.json"));
  const full = PR.renderSummary(doc, manifest, { cap: Infinity });
  assert.equal(PR.renderSummary(doc, manifest, { cap: full.length }), full);
  const cut = PR.renderSummary(doc, manifest, { cap: full.length - 1 });
  assert.ok(cut.length <= full.length - 1);
  assert.notEqual(cut, full);
});

test("summary cap: summary-only findings are dropped first, with a count line, and the default cap holds", () => {
  const doc = readJson(fixture("full-review.json"));
  const manifest = readJson(fixture("manifest-full.json"));
  const big = { ...doc.findings[0], evidence: "x".repeat(1200), why: "w".repeat(800), fix: "f".repeat(800) };
  const many = Array.from({ length: 60 }, (_, i) => ({ ...big, id: `F-${i + 10}`, severity: "suggestion" }));
  const text = PR.renderSummary(doc, manifest, { findings: [doc.findings[2]], summaryOnly: many });
  assert.ok(text.length <= 60000, `${text.length}`);
  assert.ok(text.includes("#### F-1 "), "the main finding survives");
  assert.match(text, /_\d+ more summary-only finding\(s\) omitted to fit the size limit\._/);
  assert.ok(text.includes("### Tier, lenses and host mode"), "the sections after the truncated one survive");
});

test("inline body: worst-case text is shrunk under 4,000, keeps the script-written tag, and loses no fence", () => {
  const f = { ...readJson(fixture("valid-review.json")).findings[0], severity: "warning" };
  f.evidence = "<@".repeat(600);
  f.why = "<@".repeat(400);
  f.fix = "<@".repeat(400);
  const fp = "0123456789abcdef";
  const body = PR.renderInlineBody(f, { repo: "acme/widgets", head: SHA_HEAD }, { fp });
  assert.ok(body.length <= 4000, `${body.length}`);
  assert.ok(body.endsWith(`\n\n<!-- akili-review:fp=${fp} sev=warning -->`));
  assert.equal((body.match(/^```/gm) || []).length % 2, 0, "fences are balanced");
  assert.equal(body.split("<!--").length - 1, 1, "the only comment opener is the script's tag");
});

test("inline body: at its measured length it is untouched, one character short it is shortened", () => {
  const f = { ...readJson(fixture("valid-review.json")).findings[0] };
  f.evidence = "e".repeat(1200);
  f.why = "w".repeat(800);
  f.fix = "x".repeat(800);
  const ctx = { repo: "acme/widgets", head: SHA_HEAD };
  const whole = PR.renderInlineBody(f, ctx, { cap: Infinity });
  assert.ok(whole.length < 4000, "the maximum-size fields fit under the real cap when nothing expands");
  assert.equal(PR.renderInlineBody(f, ctx, { cap: whole.length }), whole);
  const short = PR.renderInlineBody(f, ctx, { cap: whole.length - 1 });
  assert.ok(short.length <= whole.length - 1);
  assert.ok(short.includes("Text shortened to fit the comment size limit."));
});

test("inline body: a malformed fingerprint or a suggestion cannot be tagged", () => {
  const f = readJson(fixture("valid-review.json")).findings[0];
  assert.throws(() => PR.renderInlineBody(f, null, { fp: "xyz" }), /fingerprint/);
  assert.throws(() => PR.renderInlineBody({ ...f, severity: "suggestion" }, null, { fp: "0123456789abcdef" }), /inline/);
});

test("--history: verdict, counts, coverage rows and finding rows only; no evidence, why, fix or coverage evidence", (t) => {
  const doc = readJson(fixture("full-review.json"));
  doc.findings[2].evidence = "+EVIDENCE-MARKER";
  doc.findings[2].why = "WHY-MARKER";
  doc.findings[2].fix = "FIX-MARKER";
  doc.coverage[0].evidence = "COVERAGE-EVIDENCE-MARKER";
  const r = renderCli(t, doc, readJson(fixture("manifest-full.json")), ["--history"]);
  assert.equal(r.status, 0, r.stderr);
  for (const needle of ["- Verdict: Critical issues found", "- Findings: 1 critical \u00b7 1 warning \u00b7 1 suggestion",
    "| changes/add-remember-me | FR-1 | met |", "| F-1 | correctness | critical | `src/auth/session.js:10` |", "| F-2 | tests | warning |"]) {
    assert.ok(r.stdout.includes(needle), needle);
  }
  for (const banned of ["EVIDENCE-MARKER", "WHY-MARKER", "FIX-MARKER", "COVERAGE-EVIDENCE-MARKER", "no expiry handling"]) assert.ok(!r.stdout.includes(banned), banned);
});

test("--history: absolute paths and the current user name do not survive", (t) => {
  const doc = readJson(fixture("full-review.json"));
  doc.coverage[0].spec = "/Users/jcadavid/work/docs/specs/changes/x";
  doc.coverage[1].spec = "C:\\Users\\jcadavid\\docs\\spec";
  const r = renderCli(t, doc, readJson(fixture("manifest-full.json")), ["--history"]);
  assert.ok(!/\/Users\/|jcadavid|C:\\/.test(r.stdout), r.stdout);
  assert.ok(r.stdout.includes("[path]"));
  const user = require("os").userInfo().username;
  if (user && user.length >= 4 && /^[\w.-]+$/.test(user)) {
    doc.coverage[0].spec = `owned by ${user}`;
    assert.ok(!renderCli(t, doc, readJson(fixture("manifest-full.json")), ["--history"]).stdout.includes(user));
  }
});

test("scenario Invalid input: render of an invalid document prints the validator error, nothing on stdout, exit 1", () => {
  const r = post(["render", fixture("malformed-confidence-120.json"), "--manifest", MANIFEST]);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, "");
  assert.match(r.stderr, /findings\[1\]\.confidence/);
});

test("render usage errors exit 2: no document, no manifest, extra argument, unknown flag, unreadable document", () => {
  assert.equal(post(["render"]).status, 2);
  assert.equal(post(["render", fixture("valid-review.json")]).status, 2);
  assert.equal(post(["render", fixture("valid-review.json"), "x", "--manifest", MANIFEST]).status, 2);
  assert.equal(post(["render", fixture("valid-review.json"), "--manifest", MANIFEST, "--bogus"]).status, 2);
  assert.equal(post(["render", fixture("missing.json"), "--manifest", MANIFEST]).status, 2);
});

test("post-review.cjs uses no O_NOFOLLOW and requires only Node core modules", () => {
  const text = fs.readFileSync(path.join(SKILL_DIR, "post-review.cjs"), "utf8");
  assert.equal((text.match(/O_NOFOLLOW/g) || []).length, 0);
  assert.ok(text.includes("// @akili-spec changes/akili-review"));
  const core = new Set(require("module").builtinModules);
  for (const m of text.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) {
    assert.ok(core.has(m[1].replace(/^node:/, "")), `non-core require: ${m[1]}`);
  }
});

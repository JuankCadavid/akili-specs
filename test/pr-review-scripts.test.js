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

// =====================================================================================
// T3: check-skip and post, driven against fixtures/pr-review/fake-gh.js through
// AKILI_GH_BIN. PATH is an empty directory, so a call that ignored AKILI_GH_BIN would fail
// loudly instead of reaching a real gh; every test reads the fake's call log and asserts
// request bodies (event, comment lines, marker JSON), never only a call count.
// Expected values are literals from FR-3/FR-9/FR-10/FR-11 and design 5.4/5.5.
// =====================================================================================

const REAL = require(path.join(SKILL_DIR, "post-review.cjs"));
const FAKE_GH = path.join(FIX, "fake-gh.js");
const REPO = "acme/widgets";
const PRN = 42;
const API = `repos/${REPO}`;
const SHA_OLD = "3".repeat(40);
const CI_LOGIN = "github-actions[bot]";
const MARKER_OPEN = "<!-- akili-review:v1";

const mkFinding = (n, over = {}) => ({
  id: `F-${n}`, lens: "correctness", severity: "warning", suspect: false, confidence: 90, file: "src/a.js",
  line_start: n, line_end: n, side: "RIGHT", evidence: `+  line${n}();`, why: `WHY-${n}`, fix: null, ...over,
});
const mkDoc = (findings, over = {}) => ({
  schema_version: "1", target: { kind: "pr", pr: PRN, repo: REPO, base_sha: SHA_BASE, head_sha: SHA_HEAD }, tier: "full",
  host_mode: "parallel", lenses: ["correctness"], top_risks: [], coverage: [], unspecified_changes: [], notes: [], findings, ...over,
});
const mkManifest = (files = ["src/a.js"]) => ({
  target: { kind: "pr", pr: PRN, repo: REPO, base_sha: SHA_BASE, head_sha: SHA_HEAD }, tier: "full", threshold: 80,
  lenses: ["correctness"], files: files.map((p, i) => ({ path: p, status: "modified", added: 1, removed: 0, patch: `files/000${i + 1}.patch`, chunk: "c1" })),
  skipped_files: [], recommend_security: [], chunks: [], config_source: "default",
});
const patchOf = (lines) => `@@ -1,3 +1,${lines} @@\n${Array.from({ length: lines }, (_, i) => `+x${i}`).join("\n")}`;
const FILES_A = [{ filename: "src/a.js", patch: patchOf(40) }];
const fpOf = (f) => REAL.fingerprint(f);
const markerLine = (head, run, entries) => `${MARKER_OPEN} ${JSON.stringify({ head, run, findings: entries })} -->`;
const comment = (id, body, login = CI_LOGIN) => ({ id, user: { login }, body });
const tagBody = (fp, sev) => `rendered text\n\n<!-- akili-review:fp=${fp} sev=${sev} -->`;
const thread = (id, fp, sev, { resolved = false, by = null, author = "github-actions" } = {}) => ({
  id, isResolved: resolved, isOutdated: false, resolvedBy: by ? { login: by } : null,
  comments: { nodes: [{ author: { login: author }, body: tagBody(fp, sev) }] },
});

function routesOf(over = {}) {
  const info = { state: "open", draft: false, merged: false, user: { login: "alice" }, labels: (over.labels || []).map((name) => ({ name })), head: { sha: SHA_HEAD }, ...(over.pr || {}) };
  const prRoute = over.prFail ? { status: 500, body: { message: "boom" } } : { body: info };
  const config = over.config === undefined || over.config === null
    ? { status: 404, body: { message: "Not Found" } }
    : { body: { type: "file", encoding: "base64", content: Buffer.from(over.config).toString("base64") } };
  return [
    { method: "GET", path: `${API}/pulls/${PRN}`, ...prRoute },
    { method: "GET", path: `${API}/contents/.akili/review.yml`, ...config },
    { method: "GET", path: `${API}/issues/${PRN}/comments`, body: over.comments || [] },
    { method: "POST", path: "graphql", contains: "reviewThreads", body: { data: { repository: { pullRequest: { reviewThreads: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: over.threads || [] } } } } } },
    { method: "POST", path: "graphql", contains: "resolveReviewThread", ...(over.resolve || { body: { data: { resolveReviewThread: { thread: { id: "T", isResolved: true } } } } }) },
    { method: "GET", path: `${API}/pulls/${PRN}/files`, body: over.files || FILES_A },
    { method: "POST", path: `${API}/pulls/${PRN}/reviews`, ...(over.review || { body: { id: 1 } }) },
    { method: "POST", path: `${API}/issues/${PRN}/comments`, ...(over.summary || { body: { id: 99 } }) },
    { method: "PATCH", path: `${API}/issues/comments/7`, body: { id: 7 } },
    { method: "GET", path: "user", body: { login: over.viewer || "alice" } },
  ];
}

function ghRun(t, argsOf, over = {}, extraEnv = {}) {
  const dir = tmpDir(t);
  const empty = path.join(dir, "nobin");
  fs.mkdirSync(empty);
  fs.writeFileSync(path.join(dir, "routes.json"), JSON.stringify({ routes: routesOf(over) }));
  const env = { ...process.env, PATH: empty, AKILI_GH_BIN: FAKE_GH, FAKE_GH_LOG: path.join(dir, "calls.jsonl"), FAKE_GH_ROUTES: path.join(dir, "routes.json"), FAKE_GH_STATE: path.join(dir, "state.json"), ...extraEnv };
  const r = post(argsOf(dir), { env });
  const log = path.join(dir, "calls.jsonl");
  const calls = fs.existsSync(log) ? fs.readFileSync(log, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
  for (const c of calls) assert.ok(!c.unexpected, `the fake saw an unexpected call: ${JSON.stringify(c)}`);
  return { r, calls, dir };
}

function postRun(t, doc, { manifest = mkManifest(), args = [], over = {}, extraEnv = {} } = {}) {
  return ghRun(t, (dir) => {
    fs.writeFileSync(path.join(dir, "findings.json"), JSON.stringify(doc));
    fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest));
    return ["post", path.join(dir, "findings.json"), "--manifest", path.join(dir, "manifest.json"), "--repo", REPO, "--pr", String(PRN), "--base", SHA_BASE, "--head", SHA_HEAD, ...args];
  }, over, extraEnv);
}

function skipRun(t, over = {}, args = [], configText = null) {
  return ghRun(t, (dir) => {
    const a = ["check-skip", "--repo", REPO, "--pr", String(PRN), "--head", SHA_HEAD, "--out", path.join(dir, "out"), ...args];
    if (configText !== null) { fs.writeFileSync(path.join(dir, "review.yml"), configText); a.push("--config", path.join(dir, "review.yml")); }
    return a;
  }, over);
}

const isQuery = (c) => c.path === "graphql" && c.body && /^query/.test(c.body.query);
const writesOf = (calls) => calls.filter((c) => c.method !== "GET" && !isQuery(c));
const reviewsOf = (calls) => calls.filter((c) => c.method === "POST" && c.path === `${API}/pulls/${PRN}/reviews`);
const summaryWritesOf = (calls) => calls.filter((c) => c.path === `${API}/issues/${PRN}/comments` && c.method === "POST" || c.method === "PATCH");
const resolvesOf = (calls) => calls.filter((c) => c.path === "graphql" && c.body && /resolveReviewThread/.test(c.body.query));
const tagsOf = (body) => [...body.matchAll(/<!-- akili-review:fp=([0-9a-f]{16}) sev=(critical|warning) -->/g)].map((m) => ({ fp: m[1], sev: m[2] }));
const markerOf = (body) => {
  const all = [...body.matchAll(/<!-- akili-review:v1 (\{.*\}) -->/g)];
  assert.equal(all.length, 1, "exactly one marker in the summary");
  return JSON.parse(all[0][1]);
};
const summaryBody = (calls) => { const w = summaryWritesOf(calls); assert.equal(w.length, 1, "exactly one summary write"); return w[0].body.body; };

// --- fingerprint (design 5.2) ---------------------------------------------------------

test("fingerprint: the first 16 hex of sha256(lens|file|normalized first evidence line), literal from an external sha256", () => {
  // printf '%s' 'correctness|src/auth/session.js|if (token == null) return true;' | shasum -a 256
  const f = { ...readJson(fixture("valid-review.json")).findings[0] };
  assert.equal(REAL.fingerprint(f), "147540294f623014");
  assert.equal(REAL.fingerprint({ ...f, line_start: 99, line_end: 99, why: "reworded", confidence: 70, evidence: "-   if   (token == null) return true;\nsecond line" }), "147540294f623014");
  assert.notEqual(REAL.fingerprint({ ...f, lens: "tests" }), "147540294f623014");
  assert.notEqual(REAL.fingerprint({ ...f, file: "src/auth/other.js" }), "147540294f623014");
});

// --- check-skip (FR-3) ----------------------------------------------------------------

const SKIP_CASES = [
  ["a draft PR", { pr: { draft: true } }, /draft/],
  ["a closed PR", { pr: { state: "closed" } }, /closed/],
  ["a merged PR", { pr: { state: "closed", merged: true } }, /merged/],
  ["a dependabot[bot] author", { pr: { user: { login: "dependabot[bot]" } } }, /bot/],
  ["a renovate[bot] author", { pr: { user: { login: "renovate[bot]" } } }, /bot/],
  ["any other [bot] author", { pr: { user: { login: "some-app[bot]" } } }, /bot/],
  ["the label akili-review:skip", { labels: ["akili-review:skip"] }, /akili-review:skip/],
  ["a trusted marker on the current head", { comments: [comment(7, `body\n${markerLine(SHA_HEAD, 1, [])}`)] }, /already records this head/],
];

for (const [name, over, reason] of SKIP_CASES) {
  test(`check-skip: skips ${name}, writes skipped.json, and writes nothing to the PR`, (t) => {
    const { r, calls, dir } = skipRun(t, over);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /^skip=true reason=/);
    assert.match(r.stdout, reason);
    assert.match(readJson(path.join(dir, "out", "skipped.json")).reason, reason);
    assert.deepEqual(writesOf(calls), []);
    assert.ok(calls.length >= 1, "the fake recorded the reads");
  });
}

test("scenario Re-run on the same head: skip=true from the CI bot's marker, and it must NOT post or edit any comment", (t) => {
  const { r, calls } = skipRun(t, { comments: [comment(7, `summary\n${markerLine(SHA_HEAD, 3, [{ fp: "a".repeat(16), sev: "warning", inline: true }])}`)] });
  assert.equal(r.stdout.trim(), "skip=true reason=a trusted summary already records this head");
  assert.deepEqual(writesOf(calls).map((c) => `${c.method} ${c.path}`), []);
});

test("check-skip: a new head is reviewed, and prior.json carries the trusted marker's entries and the tagged threads", (t) => {
  const fp = "b".repeat(16);
  const { r, dir } = skipRun(t, { comments: [comment(7, markerLine(SHA_OLD, 2, [{ fp, sev: "warning", inline: true }]))], threads: [thread("T1", fp, "warning", { resolved: true, by: "maintainer" })] });
  assert.equal(r.stdout.trim(), "skip=false reason=none");
  const prior = readJson(path.join(dir, "out", "prior.json"));
  assert.equal(prior.marker_state, "trusted");
  assert.equal(prior.head, SHA_OLD);
  assert.equal(prior.run, 2);
  assert.deepEqual(prior.findings, [{ fp, sev: "warning", inline: true }]);
  assert.deepEqual(prior.threads, [{ fp, sev: "warning", resolved: true, resolved_by: "maintainer" }]);
  assert.equal(fs.existsSync(path.join(dir, "out", "skipped.json")), false);
});

test("check-skip: a forged marker from a non-allowlisted author is not trusted (falsifier c)", (t) => {
  const { r, dir } = skipRun(t, { comments: [comment(8, markerLine(SHA_HEAD, 1, []), "mallory")] });
  assert.equal(r.stdout.trim(), "skip=false reason=none");
  assert.equal(readJson(path.join(dir, "out", "prior.json")).marker_state, "none");
});

test("check-skip: trusted_posters from the config extends the allowlist; the login is compared without [bot]", (t) => {
  const forged = [comment(8, markerLine(SHA_HEAD, 1, []), "maintainer")];
  assert.match(skipRun(t, { comments: forged }).r.stdout, /skip=false/);
  assert.match(skipRun(t, { comments: forged }, [], "trusted_posters: [maintainer]\n").r.stdout, /skip=true/);
  assert.match(skipRun(t, { comments: [comment(8, markerLine(SHA_HEAD, 1, []), "github-actions")] }).r.stdout, /skip=true/);
});

test("check-skip: --force overrides a bot author and a recorded head, never a draft or the skip label", (t) => {
  assert.match(skipRun(t, { pr: { user: { login: "dependabot[bot]" } } }, ["--force"]).r.stdout, /skip=false/);
  assert.match(skipRun(t, { comments: [comment(7, markerLine(SHA_HEAD, 1, []))] }, ["--force"]).r.stdout, /skip=false/);
  assert.match(skipRun(t, { pr: { draft: true } }, ["--force"]).r.stdout, /skip=true/);
  assert.match(skipRun(t, { labels: ["akili-review:skip"] }, ["--force"]).r.stdout, /skip=true/);
});

test("check-skip: an unparsable marker is reported, never trusted, and does not skip", (t) => {
  const { r, dir } = skipRun(t, { comments: [comment(7, `${MARKER_OPEN} {not json} -->`)] });
  assert.equal(r.stdout.trim(), "skip=false reason=none");
  assert.match(r.stderr, /unparsable/);
  assert.equal(readJson(path.join(dir, "out", "prior.json")).marker_state, "unparsable");
});

test("check-skip: a gh failure exits 0 with skip=false; usage errors exit 2", (t) => {
  const { r, calls } = skipRun(t, { prFail: true });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^skip=false reason=pull request state unavailable/);
  assert.match(r.stderr, /HTTP 500|failed/);
  assert.deepEqual(writesOf(calls), []);
  const dir = tmpDir(t);
  for (const args of [["check-skip"], ["check-skip", "--repo", "bad", "--pr", "1", "--head", SHA_HEAD, "--out", dir], ["check-skip", "--repo", REPO, "--pr", "0", "--head", SHA_HEAD, "--out", dir], ["check-skip", "--repo", REPO, "--pr", "1", "--head", "abc", "--out", dir]]) {
    assert.equal(post(args).status, 2, args.join(" "));
  }
});

// --- post: the review request (FR-9) --------------------------------------------------

const cappedDoc = () => {
  const findings = [];
  for (let i = 1; i <= 3; i++) findings.push(mkFinding(i, { severity: "critical", confidence: 90 + i })); // C1..C3: 91..93
  for (let i = 4; i <= 12; i++) findings.push(mkFinding(i, { severity: "warning", confidence: 80 + (i - 4) })); // W4..W12: 80..88
  for (let i = 13; i <= 14; i++) findings.push(mkFinding(i, { severity: "suggestion", confidence: 85 }));
  return mkDoc(findings);
};

test("scenario Cap: 14 findings (3 critical, 9 warning, 2 suggestion) post exactly 10 inline, the rest only in the summary", (t) => {
  const { r, calls } = postRun(t, cappedDoc());
  assert.equal(r.status, 0, r.stderr);
  const reviews = reviewsOf(calls);
  assert.equal(reviews.length, 1, "one review");
  const comments = reviews[0].body.comments;
  assert.equal(comments.length, 10);
  // criticals first by confidence, then the 7 highest-confidence warnings (W12..W6)
  assert.deepEqual(comments.map((c) => c.line), [3, 2, 1, 12, 11, 10, 9, 8, 7, 6]);
  assert.deepEqual(comments.map((c) => tagsOf(c.body)[0].sev), ["critical", "critical", "critical", "warning", "warning", "warning", "warning", "warning", "warning", "warning"]);
  const body = summaryBody(calls);
  const [inlinePart, onlyPart] = body.split("### Summary-only findings (4)");
  assert.ok(onlyPart !== undefined, "the summary-only section counts 4");
  for (const id of ["F-4", "F-5", "F-13", "F-14"]) assert.ok(onlyPart.includes(`#### ${id} `), `${id} is summary-only`);
  for (const id of ["F-1", "F-3", "F-6", "F-12"]) assert.ok(inlinePart.includes(`#### ${id} `) && !onlyPart.includes(`#### ${id} `), `${id} is inline`);
  assert.match(body, /4 finding\(s\) are listed in this summary only, not inline \(cap 10/);
});

test("the review is one POST: event is the literal COMMENT, commit_id is --head, and the body keys are exactly these", (t) => {
  const doc = mkDoc([mkFinding(2, { line_end: 4, confidence: 95 })]);
  const { r, calls } = postRun(t, doc);
  assert.equal(r.status, 0, r.stderr);
  const [review] = reviewsOf(calls);
  assert.deepEqual(Object.keys(review.body).sort(), ["body", "comments", "commit_id", "event"]);
  assert.equal(review.body.event, "COMMENT");
  assert.equal(review.body.commit_id, SHA_HEAD);
  assert.equal(typeof review.body.body, "string");
  assert.deepEqual(review.body.comments.map(({ body, ...rest }) => rest), [{ path: "src/a.js", line: 4, side: "RIGHT", start_line: 2, start_side: "RIGHT" }]);
  const fp = fpOf(doc.findings[0]);
  assert.deepEqual(tagsOf(review.body.comments[0].body), [{ fp, sev: "warning" }]);
});

test("a single-line comment carries line and side only, no start_line", (t) => {
  const { calls } = postRun(t, mkDoc([mkFinding(5)]));
  assert.deepEqual(Object.keys(reviewsOf(calls)[0].body.comments[0]).sort(), ["body", "line", "path", "side"]);
});

test("DD-8: no input reaches the review event (a document event is rejected; a manifest or env event is ignored)", (t) => {
  const doc = mkDoc([mkFinding(1)]);
  const rejected = postRun(t, { ...doc, event: "APPROVE" }, { args: ["--fail-on", "critical"] });
  assert.equal(rejected.r.status, 1);
  assert.deepEqual(writesOf(rejected.calls), []);
  assert.match(rejected.r.stderr, /event/);
  const manifest = { ...mkManifest(), event: "APPROVE", review_event: "REQUEST_CHANGES" };
  const { r, calls } = postRun(t, doc, { manifest, extraEnv: { AKILI_REVIEW_EVENT: "APPROVE", REVIEW_EVENT: "APPROVE", INPUT_EVENT: "APPROVE" } });
  assert.equal(r.status, 0, r.stderr);
  const reviews = reviewsOf(calls);
  assert.equal(reviews.length, 1);
  for (const review of reviews) assert.equal(review.body.event, "COMMENT");
  assert.ok(!JSON.stringify(calls).includes("APPROVE") && !JSON.stringify(calls).includes("REQUEST_CHANGES"));
});

test("the summary is a separate issue comment, written after the review, whose marker records head, run and one entry per finding", (t) => {
  const doc = mkDoc([mkFinding(1, { severity: "critical", confidence: 95 }), mkFinding(2), mkFinding(3, { severity: "suggestion" }), mkFinding(4, { suspect: true })]);
  const { calls } = postRun(t, doc);
  const order = calls.filter((c) => c.method === "POST").map((c) => c.path);
  assert.deepEqual(order.filter((p) => p !== "graphql"), [`${API}/pulls/${PRN}/reviews`, `${API}/issues/${PRN}/comments`]);
  const marker = markerOf(summaryBody(calls));
  const fps = doc.findings.map(fpOf);
  assert.deepEqual(marker, { head: SHA_HEAD, run: 1, findings: [
    { fp: fps[0], sev: "critical", inline: true }, { fp: fps[1], sev: "warning", inline: true },
    { fp: fps[3], sev: "warning", inline: false }, { fp: fps[2], sev: "suggestion", inline: false }] });
  assert.ok(summaryBody(calls).trimEnd().endsWith("-->"), "the marker is the last thing in the summary");
});

test("suggestions and suspect warnings never go inline; findings link with a full-SHA permalink", (t) => {
  const doc = mkDoc([mkFinding(3, { severity: "suggestion" }), mkFinding(4, { suspect: true }), mkFinding(5)]);
  const { calls } = postRun(t, doc);
  assert.deepEqual(reviewsOf(calls)[0].body.comments.map((c) => c.line), [5]);
  assert.ok(summaryBody(calls).includes(`https://github.com/${REPO}/blob/${SHA_HEAD}/src/a.js#L3-L3`));
});

test("hunk pre-check: a line outside the hunks, an unknown file, a binary file and a wrong side move to the summary", (t) => {
  const doc = mkDoc([mkFinding(50), mkFinding(2, { file: "src/missing.js" }), mkFinding(3, { file: "img.png" }), mkFinding(4, { side: "LEFT", line_start: 4, line_end: 4 }), mkFinding(6, { line_start: 39, line_end: 41 }), mkFinding(7)]);
  const over = { files: [...FILES_A, { filename: "img.png" }] };
  const { r, calls } = postRun(t, doc, { manifest: mkManifest(["src/a.js", "src/missing.js", "img.png"]), over });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(reviewsOf(calls)[0].body.comments.map((c) => c.line), [7]);
  assert.equal(markerOf(summaryBody(calls)).findings.filter((e) => e.inline).length, 1);
  assert.match(summaryBody(calls), /### Summary-only findings \(5\)/);
});

test("hunk pre-check honours a LEFT hunk: a removed line inside the old span maps, one outside does not", (t) => {
  const files = [{ filename: "src/a.js", patch: "@@ -10,3 +10,1 @@\n-a\n-b\n+c" }];
  const doc = mkDoc([mkFinding(1, { side: "LEFT", line_start: 11, line_end: 11 }), mkFinding(2, { side: "LEFT", line_start: 20, line_end: 20 }), mkFinding(3, { side: "RIGHT", line_start: 11, line_end: 11 })]);
  const { calls } = postRun(t, doc, { over: { files } });
  assert.deepEqual(reviewsOf(calls)[0].body.comments.map((c) => `${c.side}:${c.line}`), ["LEFT:11"]);
});

test("a rejected review (422) is retried once with no inline comments; every finding moves to the summary", (t) => {
  const over = { review: { responses: [{ status: 422, body: { message: "Validation Failed" } }, { status: 200, body: { id: 2 } }] } };
  const { r, calls } = postRun(t, mkDoc([mkFinding(1), mkFinding(2)]), { over });
  assert.equal(r.status, 0, r.stderr);
  const reviews = reviewsOf(calls);
  assert.equal(reviews.length, 2);
  assert.equal(reviews[0].body.comments.length, 2);
  assert.deepEqual(reviews[1].body.comments, []);
  assert.equal(reviews[1].body.event, "COMMENT");
  const body = summaryBody(calls);
  assert.ok(markerOf(body).findings.every((e) => e.inline === false));
  assert.match(body, /### Summary-only findings \(2\)/);
  assert.match(body, /rejected by GitHub/);
});

test("a review rejected twice still posts the summary, and the exit follows --fail-on none", (t) => {
  const over = { review: { status: 422, body: { message: "Validation Failed" } } };
  const { r, calls } = postRun(t, mkDoc([mkFinding(1)]), { over });
  assert.equal(r.status, 0);
  assert.equal(reviewsOf(calls).length, 2);
  assert.equal(summaryWritesOf(calls).length, 1);
});

test("upsert: no trusted summary creates one; a trusted one is edited in place, never a second", (t) => {
  const doc = mkDoc([mkFinding(1)]);
  const fresh = postRun(t, doc);
  assert.deepEqual(summaryWritesOf(fresh.calls).map((c) => `${c.method} ${c.path}`), [`POST ${API}/issues/${PRN}/comments`]);
  const edit = postRun(t, doc, { over: { comments: [comment(7, `old\n${markerLine(SHA_OLD, 4, [])}`)] } });
  assert.deepEqual(summaryWritesOf(edit.calls).map((c) => `${c.method} ${c.path}`), [`PATCH ${API}/issues/comments/7`]);
  assert.equal(markerOf(edit.calls.find((c) => c.method === "PATCH").body.body).run, 5);
});

test("a marker from a non-allowlisted author is not edited and not trusted: a new summary is created", (t) => {
  const { calls } = postRun(t, mkDoc([mkFinding(1)]), { over: { comments: [comment(7, markerLine(SHA_OLD, 9, [{ fp: fpOf(mkFinding(1)), sev: "warning", inline: true }]), "mallory")], threads: [thread("T1", fpOf(mkFinding(1)), "warning", { author: "mallory" })] } });
  assert.deepEqual(summaryWritesOf(calls).map((c) => `${c.method} ${c.path}`), [`POST ${API}/issues/${PRN}/comments`]);
  assert.equal(markerOf(summaryBody(calls)).run, 1);
  assert.equal(reviewsOf(calls)[0].body.comments.length, 1);
});

test("local --local: a trusted summary the viewer cannot edit means CI owns it, and nothing is posted (DD-16)", (t) => {
  const over = { comments: [comment(7, markerLine(SHA_OLD, 1, []))], viewer: "alice" };
  const { r, calls } = postRun(t, mkDoc([mkFinding(1)]), { args: ["--local"], over });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /CI owns this PR's summary/);
  assert.deepEqual(writesOf(calls), []);
  const own = postRun(t, mkDoc([mkFinding(1)]), { args: ["--local"], over: { ...over, viewer: "github-actions" } });
  assert.equal(summaryWritesOf(own.calls).length, 1);
});

test("rendered text: a forged marker, mention and tag in a finding leave exactly one marker and one tag per inline comment", (t) => {
  const evil = mkFinding(1, { why: `${FORGED} <!-- akili-review:fp=${"0".repeat(16)} sev=critical -->`, evidence: `+ ${FORGED}`, fix: FORGED });
  const { calls } = postRun(t, mkDoc([evil]));
  const comments = reviewsOf(calls)[0].body.comments;
  assert.deepEqual(tagsOf(comments[0].body), [{ fp: fpOf(evil), sev: "warning" }]);
  assert.ok(!LIVE_MENTION.test(comments[0].body) && !LIVE_MENTION.test(summaryBody(calls)));
  assert.equal(markerOf(summaryBody(calls)).head, SHA_HEAD);
});

test("the summary stays under the 60,000 character cap with the marker intact, even for 100 long findings", (t) => {
  const findings = Array.from({ length: 100 }, (_, i) => mkFinding(i % 40 + 1, { id: `F-${i + 1}`, evidence: `+  call${i}();`, why: `${"w".repeat(780)}${i}`, fix: "f".repeat(700) }));
  const { r, calls } = postRun(t, mkDoc(findings));
  assert.equal(r.status, 0, r.stderr);
  const body = summaryBody(calls);
  assert.ok(body.length <= 60000, `length ${body.length}`);
  assert.equal(markerOf(body).findings.length, 100);
  for (const c of reviewsOf(calls)[0].body.comments) assert.ok(c.body.length <= 4000);
});

test("post --dry-run prints the planned writes and makes none", (t) => {
  const { r, calls } = postRun(t, mkDoc([mkFinding(1)]), { args: ["--dry-run"] });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(writesOf(calls), []);
  assert.match(r.stdout, /dry-run: POST repos\/acme\/widgets\/pulls\/42\/reviews/);
  assert.match(r.stdout, /dry-run: POST repos\/acme\/widgets\/issues\/42\/comments/);
});

// --- post: binding, config, validation, exit (FR-7, FR-9, FR-11) ----------------------

test("binding: a document whose target differs from the command line, or a PR that moved, posts nothing (falsifier f)", (t) => {
  const other = "4".repeat(40);
  const cases = [
    [mkDoc([mkFinding(1)], { target: { kind: "pr", pr: PRN, repo: REPO, base_sha: SHA_BASE, head_sha: other } }), {}, /head_sha/],
    [mkDoc([mkFinding(1)], { target: { kind: "pr", pr: PRN, repo: "evil/repo", base_sha: SHA_BASE, head_sha: SHA_HEAD } }), {}, /repo/],
    [mkDoc([mkFinding(1)], { target: { kind: "pr", pr: 43, repo: REPO, base_sha: SHA_BASE, head_sha: SHA_HEAD } }), {}, /pr/],
    [mkDoc([mkFinding(1)], { target: { kind: "pr", pr: PRN, repo: REPO, base_sha: other, head_sha: SHA_HEAD } }), {}, /base_sha/],
    [mkDoc([mkFinding(1)], { target: { kind: "pr", pr: PRN, repo: REPO, base_sha: SHA_BASE, head_sha: other } }), { pr: { head: { sha: other } } }, /head_sha|PR head/],
    [mkDoc([mkFinding(1)]), { pr: { head: { sha: other } } }, /PR head/],
  ];
  for (const [doc, over, message] of cases) {
    const { r, calls } = postRun(t, doc, { over, args: ["--fail-on", "critical"] });
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stderr, message);
    assert.deepEqual(writesOf(calls), []);
  }
});

test("config is read from the base SHA through the contents API; its threshold and trusted_posters apply", (t) => {
  const doc = mkDoc([mkFinding(1, { confidence: 85 })]);
  const raised = postRun(t, doc, { over: { config: "threshold: 90\n" }, args: ["--fail-on", "critical"] });
  const get = raised.calls.find((c) => c.path === `${API}/contents/.akili/review.yml`);
  assert.equal(get.method, "GET");
  assert.equal(get.query, `ref=${SHA_BASE}`);
  assert.equal(raised.r.status, 1);
  assert.match(raised.r.stderr, /findings\[0\]\.confidence/);
  assert.deepEqual(writesOf(raised.calls), []);
  const posters = postRun(t, doc, { over: { config: "trusted_posters: [maintainer]\n", comments: [comment(7, markerLine(SHA_OLD, 1, []), "maintainer")] } });
  assert.deepEqual(summaryWritesOf(posters.calls).map((c) => c.method), ["PATCH"]);
  const bad = postRun(t, doc, { over: { config: "bogus_key: 1\n" }, args: ["--fail-on", "warning"] });
  assert.equal(bad.r.status, 1);
  assert.deepEqual(writesOf(bad.calls), []);
});

test("scenario Invalid input: nothing is posted or edited, the validator error is printed, and the exit follows FR-11", (t) => {
  const doc = mkDoc([mkFinding(1), mkFinding(2, { confidence: 120 })]);
  const none = postRun(t, doc);
  assert.equal(none.r.status, 0, "under --fail-on none a validation failure exits 0 (falsifier e)");
  assert.match(none.r.stderr, /findings\[1\]\.confidence/);
  assert.deepEqual(writesOf(none.calls), []);
  for (const failOn of ["critical", "warning"]) {
    const r = postRun(t, doc, { args: ["--fail-on", failOn] });
    assert.equal(r.r.status, 1, failOn);
    assert.match(r.r.stderr, /findings\[1\]\.confidence/);
    assert.deepEqual(writesOf(r.calls), []);
  }
});

test("FR-11 exit table: none never fails; critical on a non-suspect critical; warning on a critical or warning; suspect and suggestions never count", (t) => {
  const crit = mkDoc([mkFinding(1, { severity: "critical" })]);
  const warn = mkDoc([mkFinding(1)]);
  const quiet = mkDoc([mkFinding(1, { suspect: true }), mkFinding(2, { severity: "suggestion" })]);
  const table = [[crit, "none", 0], [crit, "critical", 1], [crit, "warning", 1], [warn, "none", 0], [warn, "critical", 0], [warn, "warning", 1], [quiet, "critical", 0], [quiet, "warning", 0]];
  for (const [doc, failOn, code] of table) {
    const { r, calls } = postRun(t, doc, { args: ["--fail-on", failOn] });
    assert.equal(r.status, code, `${failOn} ${doc.findings.map((f) => f.severity).join()}`);
    assert.equal(summaryWritesOf(calls).length, 1, "the review is posted even when the exit is 1");
  }
  assert.equal(postRun(t, warn, { args: ["--fail-on", "bogus"] }).r.status, 2);
});

test("exit table, binding row: a binding mismatch is a validation failure, so it exits 1 under critical/warning and 0 under none, and prints the failure", (t) => {
  const other = "4".repeat(40);
  const doc = mkDoc([mkFinding(1)], { target: { kind: "pr", pr: PRN, repo: REPO, base_sha: SHA_BASE, head_sha: other } });
  for (const [args, code] of [[["--fail-on", "critical"], 1], [["--fail-on", "warning"], 1], [["--fail-on", "none"], 0], [[], 0]]) {
    const { r, calls } = postRun(t, doc, { args });
    assert.equal(r.status, code, args.join(" "));
    assert.match(r.stderr, /post: failed: .*head_sha/);
    assert.deepEqual(writesOf(calls), []);
  }
});

test("exit table, API row: a GitHub failure while posting exits 1 only when the validated document has a matching non-suspect finding", (t) => {
  const over = { summary: { status: 500, body: { message: "boom" } } };
  const quiet = postRun(t, mkDoc([mkFinding(1)]), { over, args: ["--fail-on", "critical"] });
  assert.equal(quiet.r.status, 0, "no critical: an API failure alone does not fail the run");
  assert.match(quiet.r.stderr, /post: failed: /);
  const crit = postRun(t, mkDoc([mkFinding(1, { severity: "critical" })]), { over, args: ["--fail-on", "critical"] });
  assert.equal(crit.r.status, 1, "a non-suspect critical still fails the run");
  assert.match(crit.r.stderr, /post: failed: /);
  const suspect = postRun(t, mkDoc([mkFinding(1, { suspect: true })]), { over, args: ["--fail-on", "warning"] });
  assert.equal(suspect.r.status, 0, "a suspect warning never counts");
  assert.match(suspect.r.stderr, /post: failed: /);
  const none = postRun(t, mkDoc([mkFinding(1, { severity: "critical" })]), { over, args: ["--fail-on", "none"] });
  assert.equal(none.r.status, 0);
  const forced = postRun(t, mkDoc([mkFinding(1, { severity: "critical" })]), { over: { ...over, labels: ["akili-review:advisory"] }, args: ["--fail-on", "critical"] });
  assert.equal(forced.r.status, 0);
});

test("FR-3 empty filtered diff: a manifest with no files posts nothing and exits 0, whatever --fail-on says, without any gh call", (t) => {
  for (const failOn of ["none", "critical", "warning"]) {
    const { r, calls } = postRun(t, mkDoc([]), { manifest: mkManifest([]), args: ["--fail-on", failOn] });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /skip: the filtered diff is empty \(FR-3\)/);
    assert.deepEqual(writesOf(calls), []);
    assert.deepEqual(calls, [], "not even a read is needed");
  }
});

test("scenario Advisory default: 2 criticals and no --fail-on exit 0 and both are posted inline", (t) => {
  const { r, calls } = postRun(t, mkDoc([mkFinding(1, { severity: "critical" }), mkFinding(2, { severity: "critical" })]));
  assert.equal(r.status, 0);
  assert.deepEqual(reviewsOf(calls)[0].body.comments.map((c) => tagsOf(c.body)[0].sev), ["critical", "critical"]);
});

test("break glass: the label akili-review:advisory forces none, even on a validation failure, and the summary records it", (t) => {
  const label = { labels: ["akili-review:advisory"] };
  const { r, calls } = postRun(t, mkDoc([mkFinding(1, { severity: "critical" })]), { over: label, args: ["--fail-on", "critical"] });
  assert.equal(r.status, 0);
  assert.ok(summaryBody(calls).includes("advisory forced by label"));
  const plain = postRun(t, mkDoc([mkFinding(1, { severity: "critical" })]), { args: ["--fail-on", "critical"] });
  assert.equal(plain.r.status, 1);
  assert.ok(!summaryBody(plain.calls).includes("advisory forced by label"));
  const invalid = postRun(t, mkDoc([mkFinding(1, { confidence: 120 })]), { over: label, args: ["--fail-on", "critical"] });
  assert.equal(invalid.r.status, 0);
});

test("a skipped-run artifact (skipped.json beside the document or the manifest) exits 0 and makes no gh call at all", (t) => {
  const dir = tmpDir(t);
  fs.writeFileSync(path.join(dir, "skipped.json"), JSON.stringify({ reason: "the PR is a draft" }));
  const { r, calls } = ghRun(t, () => ["post", path.join(dir, "findings.json"), "--manifest", path.join(dir, "manifest.json"), "--repo", REPO, "--pr", "42", "--base", SHA_BASE, "--head", SHA_HEAD, "--fail-on", "critical"]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /skipped run, nothing posted \(the PR is a draft\)/);
  assert.deepEqual(calls, []);
});

test("post usage errors exit 2: missing flags, bad SHA, bad repo, no document, extra document", (t) => {
  const base = ["--manifest", MANIFEST, "--repo", REPO, "--pr", "42", "--base", SHA_BASE, "--head", SHA_HEAD];
  assert.equal(post(["post"]).status, 2);
  assert.equal(post(["post", "d.json", "--manifest", MANIFEST]).status, 2);
  assert.equal(post(["post", "d.json", ...base.slice(0, -1), "abc"]).status, 2);
  assert.equal(post(["post", "d.json", "--manifest", MANIFEST, "--repo", "bad", "--pr", "42", "--base", SHA_BASE, "--head", SHA_HEAD]).status, 2);
  assert.equal(post(["post", ...base]).status, 2);
  assert.equal(post(["post", "a.json", "b.json", ...base]).status, 2);
});

// --- FR-10: one fixture per reconcile row ---------------------------------------------

const W = mkFinding(1);
const WFP = fpOf(W);
const priorMarker = (entries) => comment(7, markerLine(SHA_OLD, 1, entries));
const inlineEntry = { fp: WFP, sev: "warning", inline: true };
const postedLines = (calls) => (reviewsOf(calls)[0] ? reviewsOf(calls)[0].body.comments.map((c) => c.line) : []);

test("FR-10 row 1 fixed: inline, thread open, now absent -> listed as fixed and the thread is resolved", (t) => {
  const other = mkFinding(9, { confidence: 99 });
  const { r, calls } = postRun(t, mkDoc([other]), { over: { comments: [priorMarker([inlineEntry])], threads: [thread("THREAD-1", WFP, "warning")] } });
  assert.equal(r.status, 0, r.stderr);
  const resolves = resolvesOf(calls);
  assert.equal(resolves.length, 1);
  assert.deepEqual(resolves[0].body.variables, { threadId: "THREAD-1" });
  assert.ok(summaryBody(calls).includes(`finding ${WFP} (warning) is no longer present`));
  assert.ok(!markerOf(summaryBody(calls)).findings.some((e) => e.fp === WFP), "a fixed finding leaves the marker");
  const last = calls[calls.length - 1];
  assert.equal(last.path, "graphql", "the thread is resolved after the summary is written");
});

test("FR-10 row 1: when the API refuses to resolve, the summary still lists it as fixed", (t) => {
  const { r, calls } = postRun(t, mkDoc([mkFinding(9)]), { over: { comments: [priorMarker([inlineEntry])], threads: [thread("T1", WFP, "warning")], resolve: { status: 403, body: { message: "Forbidden" } } } });
  assert.equal(r.status, 0);
  assert.ok(summaryBody(calls).includes(`finding ${WFP} (warning) is no longer present`));
});

test("FR-10 row 2 unfixed: inline, thread open, still present -> kept open in the summary, not re-posted", (t) => {
  const { calls } = postRun(t, mkDoc([W]), { over: { comments: [priorMarker([inlineEntry])], threads: [thread("T1", WFP, "warning")] } });
  assert.equal(reviewsOf(calls).length, 0);
  assert.equal(resolvesOf(calls).length, 0);
  const body = summaryBody(calls);
  assert.ok(body.split("### Summary-only findings (1)")[1].includes("#### F-1 "));
  assert.ok(body.includes(`Still open from earlier reviews: ${WFP}`));
  assert.deepEqual(markerOf(body).findings, [{ fp: WFP, sev: "warning", inline: true }]);
});

test("FR-10 row 3 open again: thread resolved by the CI bot (GraphQL login without [bot]), still present -> re-posted", (t) => {
  for (const by of ["github-actions", "github-actions[bot]"]) {
    const { calls } = postRun(t, mkDoc([W]), { over: { comments: [priorMarker([inlineEntry])], threads: [thread("T1", WFP, "warning", { resolved: true, by })] } });
    assert.deepEqual(postedLines(calls), [1], by);
  }
});

test("scenario Human resolved / FR-10 row 4 respected: resolved by a maintainer at the same severity -> no new inline, still open in the summary (falsifier d)", (t) => {
  const { r, calls } = postRun(t, mkDoc([W]), { over: { comments: [priorMarker([inlineEntry])], threads: [thread("T1", WFP, "warning", { resolved: true, by: "maintainer" })] } });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(reviewsOf(calls).length, 0);
  const body = summaryBody(calls);
  assert.ok(body.split("### Summary-only findings (1)")[1].includes("#### F-1 "));
  assert.ok(body.includes(`Still open from earlier reviews: ${WFP}`));
});

test("FR-10 row 4: a lower severity than the human saw is also respected", (t) => {
  const down = mkFinding(1, { severity: "suggestion" });
  const entry = { fp: fpOf(down), sev: "warning", inline: true };
  const { calls } = postRun(t, mkDoc([down]), { over: { comments: [priorMarker([entry])], threads: [thread("T1", entry.fp, "warning", { resolved: true, by: "maintainer" })] } });
  assert.equal(reviewsOf(calls).length, 0);
});

test("FR-10 row 5 worse: resolved by a human at warning, now critical -> re-posted", (t) => {
  const worse = mkFinding(1, { severity: "critical" });
  const entry = { fp: fpOf(worse), sev: "warning", inline: true };
  const { calls } = postRun(t, mkDoc([worse]), { over: { comments: [priorMarker([entry])], threads: [thread("T1", entry.fp, "warning", { resolved: true, by: "maintainer" })] } });
  assert.deepEqual(postedLines(calls), [1]);
  assert.deepEqual(tagsOf(reviewsOf(calls)[0].body.comments[0].body), [{ fp: entry.fp, sev: "critical" }]);
});

test("FR-10 row 6 thread not found: the marker says inline but no thread exists -> treated as new and posted", (t) => {
  const { calls } = postRun(t, mkDoc([W]), { over: { comments: [priorMarker([inlineEntry])], threads: [] } });
  assert.deepEqual(postedLines(calls), [1]);
});

test("FR-10 row 7 summary-only: a finding the marker records as not inline is eligible for inline", (t) => {
  const { calls } = postRun(t, mkDoc([W]), { over: { comments: [priorMarker([{ ...inlineEntry, inline: false }])] } });
  assert.deepEqual(postedLines(calls), [1]);
  assert.deepEqual(markerOf(summaryBody(calls)).findings, [{ fp: WFP, sev: "warning", inline: true }]);
});

test("FR-10 row 8 rebuilt from tags: no trusted marker but a tagged open thread from the CI bot -> not duplicated", (t) => {
  const { calls } = postRun(t, mkDoc([W, mkFinding(2)]), { over: { threads: [thread("T1", WFP, "warning")] } });
  assert.deepEqual(postedLines(calls), [2]);
  assert.deepEqual(markerOf(summaryBody(calls)).findings.map((e) => [e.fp, e.inline]), [[WFP, true], [fpOf(mkFinding(2)), true]]);
});

test("FR-10 row 8: a tag from a non-allowlisted author is not trusted", (t) => {
  const { calls } = postRun(t, mkDoc([W]), { over: { threads: [thread("T1", WFP, "warning", { author: "mallory" })] } });
  assert.deepEqual(postedLines(calls), [1]);
});

test("FR-10 row 9 first review: no marker and no tags -> every finding is new; an unparsable marker is reported and not trusted", (t) => {
  const first = postRun(t, mkDoc([W]));
  assert.deepEqual(postedLines(first.calls), [1]);
  assert.equal(markerOf(summaryBody(first.calls)).run, 1);
  const bad = postRun(t, mkDoc([W]), { over: { comments: [comment(7, `${MARKER_OPEN} {"head": nope} -->`)], threads: [thread("T1", WFP, "warning")] } });
  assert.deepEqual(postedLines(bad.calls), [1], "the tags are not used to rebuild state under an unparsable marker");
  assert.deepEqual(summaryWritesOf(bad.calls).map((c) => c.method), ["PATCH"], "the existing summary is still edited, not duplicated");
  assert.match(summaryBody(bad.calls), /could not be parsed and was not trusted/);
  assert.equal(markerOf(summaryBody(bad.calls)).run, 1);
});

test("FR-10 row 10 new: a finding with no history is posted under the cap; a vanished never-inline finding is dropped", (t) => {
  const gone = { fp: "c".repeat(16), sev: "warning", inline: false };
  const { calls } = postRun(t, mkDoc([W]), { over: { comments: [priorMarker([gone])] } });
  assert.deepEqual(postedLines(calls), [1]);
  assert.ok(!summaryBody(calls).includes(gone.fp));
  assert.equal(resolvesOf(calls).length, 0);
});

test("the cap applies to re-posts too: open-again findings compete with new ones by severity, confidence, file and line", (t) => {
  const findings = Array.from({ length: 12 }, (_, i) => mkFinding(i + 1, { confidence: 80 + i }));
  const entries = findings.map((f) => ({ fp: fpOf(f), sev: "warning", inline: true }));
  const threads = findings.map((f, i) => thread(`T${i}`, fpOf(f), "warning", { resolved: true, by: "github-actions" }));
  const { calls } = postRun(t, mkDoc(findings), { over: { comments: [priorMarker(entries)], threads } });
  assert.deepEqual(postedLines(calls), [12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
});

test("NFR-3: every call in this suite went through the fake (the log is non-empty and holds only gh api shapes)", (t) => {
  const { calls } = postRun(t, mkDoc([W]));
  assert.ok(calls.length >= 6);
  assert.ok(calls.every((c) => typeof c.method === "string" && typeof c.path === "string" && !c.path.startsWith("http") && !c.path.startsWith("/")));
});

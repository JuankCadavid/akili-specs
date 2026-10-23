"use strict";

// @akili-spec changes/seo-analytics (/akili-test: text-contract negative constraints)
//
// Independent Tester suite for the optional analytics phase of `/akili-seo`. It pins the
// negative constraints (`BUT it must NOT`) and strict validations (`AND IT MUST`) that
// test/seo-analytics.test.js (the author's tracer bullets) leaves unpinned. Expected
// wordings are literals copied from requirements.md at spec commit cb7dc5f (FR-1, FR-4,
// FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, NFR-6 and the Glossary "Behavior metric"
// row) -- never read from the files under test. Nothing here reads docs/specs/ at runtime.
//
// Every check is scoped to one heading (or one paragraph / bullet inside it), so a clause
// deleted on one surface cannot be masked by the same words elsewhere in the file.
// SEO_ROOT points the suite at a mutated scratch copy to prove each assertion goes red.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = process.env.SEO_ROOT || path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
}

const norm = (s) => s.replace(/\s+/g, " ").trim();

// From the heading line that starts with `prefix` up to the next heading of the same or a
// higher level (or end of file).
function block(text, prefix, label) {
  const start = text.indexOf(`\n${prefix}`);
  assert.ok(start >= 0, `${label}: heading "${prefix}" not found`);
  const level = prefix.match(/^#+/)[0].length;
  const rest = text.slice(start + 1);
  const next = rest.slice(1).search(new RegExp(`\\n#{1,${level}} `));
  return next < 0 ? rest : rest.slice(0, next + 1);
}

// The paragraph or bullet (blank-line or list-item delimited) that starts with `lead`.
function chunk(text, lead, label) {
  const found = chunks(text).find((c) => c.startsWith(lead));
  assert.ok(found, `${label}: no paragraph or bullet starts with "${lead}"`);
  return found;
}

// Paragraphs, list items and table rows, each whitespace-normalized (line-wrap independent).
function chunks(text) {
  return text
    .split(/\n\s*\n|\n(?=\s*[-*|] )|\n(?=\d+\. )/)
    .map((c) => norm(c.replace(/^\s*[-*] /, "")))
    .filter(Boolean);
}

// Clauses: a chunk split at sentence or semicolon boundaries.
function clauses(text) {
  return chunks(text).flatMap((c) => c.split(/(?<=[.;])\s+/));
}

// Strict on purpose: a bare "no" or "not" also appears in affirmative sentences ("a site with no notice violates ...").
const NEGATION = /\b(?:never|do not|don't|must not)\b/i;

// Every clause that mentions `term` must carry a negation: the term may appear only in a
// prohibition, never as an affirmative instruction or verdict.
function assertOnlyNegated(text, term, label) {
  const bad = clauses(text).filter((c) => term.test(c) && !NEGATION.test(c));
  assert.deepEqual(bad, [], `${label}: affirmative use of ${term} outside a prohibition`);
}

const COMMAND = read(".claude/commands/akili-seo.md");
const REF = read(".claude/skills/seo-audit/references/analytics.md");
const SKILL = read(".claude/skills/seo-audit/SKILL.md");
const DOC = read("docs/skills/seo-audit.md");

const cmd = (prefix) => block(COMMAND, prefix, "command");
const ref = (prefix) => block(REF, prefix, "reference");

const P0 = () => cmd("### Phase 0");
const PREREQ = () => cmd("## Prerequisites");
const INVENTORY = () => cmd("## Tool Inventory");
const STEP28 = () => cmd("#### Step 2.8");
const P2B = () => cmd("### Phase 2B");
const P2B_INTRO = () => P2B().split("\n#### ")[0];
const B1 = () => cmd("#### 2B.1");
const B2 = () => cmd("#### 2B.2");
const B3 = () => cmd("#### 2B.3");
const B4 = () => cmd("#### 2B.4");
const P3 = () => cmd("### Phase 3");
const P4 = () => cmd("### Phase 4");
const P5 = () => cmd("### Phase 5");
const CHECKLIST = () => cmd("## Verification Checklist");
const ERRORS = () => cmd("## Error Handling");

const B2_CONSENT = () => chunk(B2(), "**Consent.**", "command 2B.2");
const B2_EVENTS = () => chunk(B2(), "**Conversion events.**", "command 2B.2");
const B2_MASKING = () => chunk(B2(), "**Clarity masking.**", "command 2B.2");
const B1_NOTHING = () => chunk(B1(), "**Nothing detected:**", "command 2B.1");
const B3_CLARITY = () => chunk(B3(), "**Clarity:**", "command 2B.3");

const REF_RULE = () => ref("## 2. The hard rule");
const REF_ACCESS = () => ref("## 3. Access");
const REF_CONSENT = () => ref("### Consent");
const REF_EVENTS = () => ref("### Conversion events");
const REF_MASKING = () => ref("### Clarity masking");
const REF_DATA = () => ref("## 6. Data checklist");
const REF_JOIN = () => ref("## 7. Search → Conversion join");
const REF_DONT = () => ref("## 8. Do not raise");

const DECLINED = "Analytics: not run — declined at Phase 0";

// ================================================================ FR-4

// requirements.md FR-4 "Tag fires before consent": BUT it must NOT assert that the site
// "violates" Ley 1581 or GDPR. A legal verdict word may appear only inside a prohibition.
const VERDICT = /violat|\bcompliant\b|\bunlawful\b|\billegal\b|\bin breach\b/i;

test("FR-4 command 2B.2 Consent forbids \"violates\" and carries no affirmative violation or compliance verdict", () => {
  const c = B2_CONSENT();
  assert.match(c, /never write that a site "violates" a law/, "command consent lost the prohibition on writing that a site \"violates\" a law");
  assertOnlyNegated(c, VERDICT, "command 2B.2 Consent");
  assertOnlyNegated(P2B(), VERDICT, "command Phase 2B");
});

test("FR-4 command 2B.2 Consent writes the signal phrase naming the rule and its tier", () => {
  assert.match(B2_CONSENT(), /"signal inconsistent with the consent requirement under <rule>", naming the rule and its tier/,
    "command consent lost the phrase \"signal inconsistent with the consent requirement under <rule>\" with rule and tier");
});

test("FR-4 reference consent forbids a legal verdict and carries no affirmative violation or compliance verdict", () => {
  assert.match(norm(REF_CONSENT()), /Never write a verdict that the site is unlawful/, "reference consent lost the prohibition on a legal verdict");
  assert.match(norm(REF_CONSENT()), /never issues a "compliant" verdict/, "reference consent lost: the audit never issues a \"compliant\" verdict");
  assertOnlyNegated(REF, VERDICT, "reference (whole file)");
});

test("FR-4 Ley 1581 is never a cookie-banner mandate and applies only where processing involves datos personales (command)", () => {
  const c = B2_CONSENT();
  assert.match(c, /Ley 1581 applies only where the analytics processing involves datos personales \(Art\. 3\(c\)\) and is never a cookie-banner mandate/,
    "command consent lost the datos personales scope or the never-a-cookie-banner-mandate clause on Ley 1581");
  assertOnlyNegated(c, /cookie[- ]banner/i, "command 2B.2 Consent");
});

test("FR-4 Ley 1581 is never a cookie-banner mandate and applies only where processing involves datos personales (reference)", () => {
  const consent = norm(REF_CONSENT());
  assert.match(consent, /Ley 1581 applies to analytics only where the processing involves datos personales \(Art\. 3\(c\)\)/,
    "reference consent table lost the datos personales scope on Ley 1581");
  assert.match(consent, /never cited as a cookie-banner mandate/, "reference consent table lost: never cited as a cookie-banner mandate");
  assert.match(norm(REF_DONT()), /Ley 1581 is never cited as a cookie-banner mandate/, "reference Do not raise lost the cookie-banner-mandate exclusion");
  assertOnlyNegated(REF, /cookie[- ]banner/i, "reference (whole file)");
});

test("FR-4 command 2B.2 Consent records each check as a finding or a pass", () => {
  assert.match(B2_CONSENT(), /Record each consent check as a finding or a pass/,
    "command consent lost the FR-4 opening: record each check as a finding or a pass");
});

// ================================================================ FR-5

// requirements.md FR-5: BUT it must NOT submit a real form with real data; form checks use
// the page's own validation path or are recorded as `not determined`.
test("FR-5 command 2B.2 never submits a real form: own validation path or `not determined`", () => {
  const c = B2_EVENTS();
  assert.match(c, /Never submit a form with real data: use the page's own validation path or record `not determined`/,
    "command conversion events lost the no-real-submission rule with its two alternatives");
  assertOnlyNegated(c, /\bsubmi(?:t|ts|tting|ssion)\b/i, "command 2B.2 Conversion events");
});

test("FR-5 reference never submits a real form: own validation path or `not determined`", () => {
  const r = norm(REF_EVENTS());
  assert.match(r, /Never submit a form with real data\. Use the page's own validation path or record `not determined`/,
    "reference conversion events lost the no-real-submission rule with its two alternatives");
  assertOnlyNegated(REF_EVENTS(), /\bsubmi(?:t|ts|tting)\b/i, "reference Conversion events");
});

// ================================================================ FR-7

// requirements.md FR-7 bullet 2: the masking mode is owner-confirmed (Strict or Balanced) or
// `not determined`; AND IT MUST note that input values are masked in all modes.
test("FR-7 command 2B.2 masking: owner-confirmed Strict or Balanced passes, Relaxed is a finding, else `not determined`", () => {
  const c = B2_MASKING();
  assert.match(c, /owner-confirmed Strict or Balanced passes, owner-confirmed Relaxed is a finding, otherwise `not determined`/,
    "command masking lost the mode rule (Strict/Balanced pass, Relaxed finding, otherwise not determined)");
  assert.match(c, /no API used here exposes/, "command masking lost: the mode is a setting no API used here exposes");
  assert.doesNotMatch(c, /Relaxed (?:passes|is a pass)/i, "command masking lets Relaxed pass");
});

test("FR-7 command 2B.2 masking: input values are masked in all modes, surrounding text is not", () => {
  assert.match(B2_MASKING(), /input values are masked in all modes, surrounding text is not/,
    "command masking lost the note: input values masked in all modes while surrounding text is not");
});

test("FR-7 reference masking: owner-confirmed Strict or Balanced passes, Relaxed is a finding, else `not determined`; inputs masked in all modes", () => {
  const r = norm(REF_MASKING());
  assert.match(r, /Owner-confirmed Strict or Balanced passes; owner-confirmed Relaxed is a finding[^;]*; otherwise `not determined`/,
    "reference masking lost the mode rule (Strict/Balanced pass, Relaxed finding, otherwise not determined)");
  assert.match(r, /masked in all modes, while surrounding text is not/, "reference masking lost the masked-in-all-modes note");
  assert.doesNotMatch(r, /Relaxed (?:passes|is a pass)/i, "reference masking lets Relaxed pass");
});

// ================================================================ FR-8

// requirements.md FR-8: one Low finding only when a conversion action exists; BUT it must NOT
// raise more than one; AND IT MUST NOT raise the finding when no conversion action exists.
test("FR-8 command 2B.1 raises no finding when no conversion action exists (note only)", () => {
  assert.match(B1_NOTHING(), /none when no conversion action exists \(note only\)/,
    "command 2B.1 lost the clause: no finding when no conversion action exists (note only)");
});

test("FR-8 command 2B.1 conditions the single Low finding on a conversion action and caps it at one", () => {
  const c = B1_NOTHING();
  assert.match(c, /When the sampled pages carry a conversion action[^"]*raise exactly one finding, Priority Low: "conversions are not measured"/,
    "command 2B.1 no longer conditions the one Low finding on a conversion action being present");
  assert.match(c, /Never raise more than one for the absence/, "command 2B.1 lost the cap: never more than one finding for the absence");
});

// ================================================================ FR-9

// requirements.md FR-9 "Clarity quota": never more than the documented daily quota (10/day);
// AND IT MUST state the data window next to every Clarity figure.
test("FR-9 command 2B.3 caps Clarity requests within the 10-per-day quota and states the number used", () => {
  const c = B3_CLARITY();
  assert.match(c, /the quota is 10 requests per project per day/, "command 2B.3 lost the documented quota (10 requests per project per day)");
  const m = c.match(/use at most (\d+) requests/);
  assert.ok(m, "command 2B.3 lost the per-run request cap (\"use at most N requests\")");
  assert.ok(Number(m[1]) >= 1 && Number(m[1]) <= 10, `command 2B.3 caps Clarity at ${m[1]} requests; FR-9 forbids exceeding the daily quota of 10`);
  assert.match(c, /state the number used in the report/, "command 2B.3 lost: state the number of requests used in the report");
});

test("FR-9 command 2B.3 states the data window beside every Clarity figure and flags a 1,000-row response as truncated", () => {
  const c = B3_CLARITY();
  assert.match(c, /state the data window next to every figure/, "command 2B.3 lost: state the data window next to every Clarity figure");
  assert.match(c, /report a 1,000-row response as truncated/, "command 2B.3 lost: report a 1,000-row response as truncated");
});

test("FR-9 command Error Handling protects the Clarity quota (no retry on 400; 429 skips for the day)", () => {
  const line = clauses(ERRORS()).join(" ");
  assert.match(line, /Clarity request returns 400[^.]*do not spend the quota retrying/, "Error Handling lost: do not spend the quota retrying a 400");
  assert.match(line, /429: the daily quota is spent; skip the Clarity data audit for the day/, "Error Handling lost: 429 skips the Clarity data audit for the day");
});

test("FR-9 reference budgets Clarity requests within the quota, states the window and truncation", () => {
  const access = norm(REF_ACCESS());
  const m = access.match(/Budget for one run: \*\*(\d+) requests\*\*/);
  assert.ok(m, "reference lost the per-run Clarity request budget");
  assert.ok(Number(m[1]) >= 1 && Number(m[1]) <= 10, `reference budgets ${m[1]} Clarity requests; FR-9 forbids exceeding the daily quota of 10`);
  const data = norm(REF_DATA());
  assert.match(data, /State the window \("last 72 hours"\) next to every Clarity figure/, "reference data checklist lost the data-window rule");
  assert.match(data, /Report a 1,000-row response as truncated/, "reference data checklist lost the truncation rule");
});

// ================================================================ FR-10

// requirements.md FR-10 "Join and caveats": unmatched rows listed, not dropped; AND IT MUST print
// the caveats; BUT it must NOT describe a query as "causing" conversions.
const CAVEATS = [
  [/GSC clicks (?:≠|are not) GA4 sessions/, "GSC clicks are not GA4 sessions"],
  [/consent choices and data thresholds reduce GA4 counts/, "consent choices and data thresholds reduce GA4 counts"],
  [/date ranges and time zones differ/, "date ranges and time zones differ"],
];

test("FR-10 command 2B.4 never describes a query as \"causing\" conversions; wording is \"landing pages reached from these queries\"", () => {
  const b = B4();
  assert.match(norm(b), /never describe a query as "causing" conversions/, "command 2B.4 lost the prohibition on \"causing\"");
  assert.match(norm(b), /"landing pages reached from these queries"/, "command 2B.4 lost the required wording");
  assertOnlyNegated(b, /\bcaus/i, "command 2B.4");
});

test("FR-10 command 2B.4 normalizes URLs, lists unmatched rows and prints the three caveats", () => {
  const b = norm(B4());
  assert.match(b, /Normalize URLs \(host, trailing slash, query string stripped\) before joining and list unmatched rows/,
    "command 2B.4 lost URL normalization or the listing of unmatched rows");
  for (const [re, label] of CAVEATS) assert.match(b, re, `command 2B.4 lost the caveat "${label}"`);
  assertOnlyNegated(B4(), /\bdrop/i, "command 2B.4");
});

test("FR-10 command Phase 3 item 13 carries the caveats and the unmatched rows", () => {
  const item = P3().split("\n").find((l) => l.startsWith("13. "));
  assert.ok(item, "Phase 3 has no item 13");
  assert.match(item, /with its caveats and unmatched rows/, "Phase 3 item 13 lost the caveats or the unmatched rows");
});

test("FR-10 reference join: unmatched rows listed, caveats printed, a query never \"causes\" conversions", () => {
  const j = norm(REF_JOIN());
  assert.match(j, /Unmatched rows\*\* are listed, not dropped silently/, "reference join lost: unmatched rows listed, not dropped silently");
  for (const [re, label] of CAVEATS) assert.match(j, re, `reference join lost the caveat "${label}"`);
  assert.match(j, /"landing pages reached from these queries"/, "reference join lost the required wording");
  assertOnlyNegated(REF_JOIN(), /\bcaus/i, "reference section 7");
});

// ================================================================ FR-6

// requirements.md FR-6: evidence order Data API Search Console metric → owner confirmation →
// `not determined`. A probe error settles nothing, so it falls to owner confirmation first.
test("FR-6 Error Handling: a GSC metric probe error falls back to owner confirmation before `not determined`, never to `not linked`", () => {
  const line = chunks(ERRORS()).find((c) => /Search Console metric/.test(c));
  assert.ok(line, "Error Handling has no entry for a Search Console metric probe error");
  const owner = line.indexOf("owner confirmation");
  const nd = line.indexOf("not determined");
  assert.ok(owner >= 0, "Error Handling GSC probe entry lost the owner-confirmation fallback");
  assert.ok(nd >= 0, "Error Handling GSC probe entry lost the `not determined` end state");
  assert.ok(owner < nd, "Error Handling GSC probe entry records `not determined` before trying owner confirmation");
  assert.match(line, /the probe settles nothing/, "Error Handling GSC probe entry lost: the probe settles nothing");
  assert.doesNotMatch(line, /not linked/, "Error Handling settles `not linked` from a probe error");
});

// ================================================================ FR-11 metric coverage

// requirements.md section 3 Glossary "Behavior metric": GA4 bounce rate, engagement rate,
// session duration, scroll; Clarity heatmaps, recordings, scroll depth, engagement time,
// dead/rage/quickback/error clicks. FR-11: every restating surface covers all of them.
// The click metrics match both "dead clicks" and the slash list "dead/rage/quickback/error clicks".
const clickTerm = (w) => new RegExp(`\\b${w}(?:/[a-z]+)*\\s+clicks?\\b`, "i");
const GLOSSARY_METRICS = [
  ["bounce", /\bbounce\b/i],
  ["engagement rate", /\bengagement rate\b/i],
  ["session duration", /\bsession duration\b/i],
  ["scroll depth", /\bscroll depth\b/i],
  ["heatmaps", /\bheatmaps?\b/i],
  ["recordings", /\brecordings?\b/i],
  ["engagement time", /\bengagement time\b/i],
  ["dead clicks", clickTerm("dead")],
  ["rage clicks", clickTerm("rage")],
  ["quickback clicks", clickTerm("quickback")],
  ["error clicks", clickTerm("error")],
];

const METRIC_SURFACES = {
  "reference section 2": () => chunk(REF_RULE(), "Behavior metrics are:", "reference section 2"),
  "command Step 2.8 Do not raise": () => chunk(STEP28(), "**Do not raise:**", "command Step 2.8"),
  "command Phase 2B Hard rule": () => chunk(P2B(), "**Hard rule.**", "command Phase 2B"),
  "command Verification Checklist": () => {
    const item = chunks(CHECKLIST()).find((c) => /^\[ \]/.test(c) && /behavior metric/i.test(c));
    assert.ok(item, "checklist has no behavior-metric item");
    return item;
  },
  "SKILL.md User Engagement Signals": () => chunk(block(SKILL, "### User Engagement Signals", "SKILL.md"), "Never claim that any behavior metric", "SKILL.md User Engagement Signals"),
  "docs/skills/seo-audit.md Core Rules": () => {
    const item = chunks(block(DOC, "## Core Rules", "docs")).find((c) => /behavior metric/i.test(c));
    assert.ok(item, "docs Core Rules has no behavior-metric bullet");
    return item;
  },
};

for (const [surface, get] of Object.entries(METRIC_SURFACES)) {
  test(`FR-11 metric coverage ${surface} names all 11 Glossary behavior metrics`, () => {
    const text = get();
    const missing = GLOSSARY_METRICS.filter(([, re]) => !re.test(text)).map(([name]) => name);
    assert.deepEqual(missing, [], `${surface} no longer names these Glossary behavior metrics`);
  });
}

// ================================================================ NFR-6

// requirements.md NFR-6: read-only toward GA4, GTM and Clarity (no write scope, no MCP write tools).
test("NFR-6 the Analytics MCP write tool appears only in a prohibition (command and reference)", () => {
  assertOnlyNegated(COMMAND, /create_property_annotation/, "command");
  assertOnlyNegated(REF, /create_property_annotation/, "reference");
  assert.match(norm(REF_ACCESS()), /`create_property_annotation` is its write tool and is never called/,
    "reference Access lost: create_property_annotation is never called");
});

test("NFR-6 `--allow-write` appears only as `without --allow-write` (command and reference)", () => {
  for (const [label, text] of [["command", COMMAND], ["reference", REF]]) {
    const uses = norm(text).match(/.{0,12}`--allow-write`/g) || [];
    assert.ok(uses.length >= 1, `${label} no longer mentions starting the MCP without \`--allow-write\``);
    for (const u of uses) assert.match(u, /without \*{0,2}`--allow-write`$/, `${label} uses \`--allow-write\` outside "without": ${u}`);
  }
});

test("NFR-6 Phase 2B is read-only and its Tool Inventory rows call no write endpoint", () => {
  assert.match(P2B_INTRO(), /Read-only toward GA4, GTM and Clarity/, "Phase 2B lost: read-only toward GA4, GTM and Clarity");
  assert.match(PREREQ(), /never call its write tools/, "Prerequisites lost: never call the Analytics MCP write tools");
  const rows = INVENTORY().split("\n").filter((l) => l.startsWith("| 2B."));
  assert.ok(rows.length >= 4, `Tool Inventory lists ${rows.length} Phase 2B rows; expected 2B.1-2B.4`);
  for (const r of rows) {
    assert.doesNotMatch(r, /\b\w*(?:create|update|delete|patch|insert|submit|write)\w*/i, `Tool Inventory Phase 2B row calls a write endpoint: ${r}`);
  }
});

test("NFR-6 the reference grants read-only scope only and lists a write as do-not-raise", () => {
  assert.match(norm(REF_ACCESS()), /Scope `analytics\.readonly` only/, "reference Access lost the read-only scope");
  for (const [label, text] of [["command", COMMAND], ["reference", REF]]) {
    assert.doesNotMatch(text, /analytics\.edit|analytics\.manage|tagmanager\.edit/, `${label} names a write scope`);
  }
  assert.match(norm(REF_DONT()), /A write to a GA4, GTM or Clarity property/, "reference Do not raise lost the write prohibition");
});

// ================================================================ FR-1

// requirements.md FR-1 "User declines": Phase 2B does not run, the report reads
// `Analytics: not run — declined at Phase 0`, it is not asked again, and Phases 1–5 complete.
test("FR-1 Phase 2B opens gated on the Phase 0 opt-in and never asks again", () => {
  const intro = norm(P2B_INTRO());
  assert.match(intro, /Runs only when the user opted in at Phase 0/, "Phase 2B no longer opens with the Phase 0 opt-in gate");
  assert.match(intro, /when declined, skip this phase and do not ask again/, "Phase 2B lost: when declined, skip and do not ask again");
});

test("FR-1 Phase 0 completes Phases 1–5 without analytics when declined", () => {
  assert.match(norm(P0()), /skip Phase 2B, and complete Phases 1–5 as without it/, "Phase 0 lost: complete Phases 1–5 as without the analytics phase");
});

test("FR-1 Phase 3 sections 11–13 accept the declined string, and each offers a non-finding content option", () => {
  const p3 = P3();
  assert.match(norm(p3), new RegExp(`Sections 11–13 each hold findings, a skip note, or \`${DECLINED}\``),
    "Phase 3 lost: sections 11–13 may hold the declined string");
  for (const n of ["11", "12", "13"]) {
    const item = p3.split("\n").find((l) => l.startsWith(`${n}. `));
    assert.ok(item, `Phase 3 has no item ${n}`);
    assert.match(item, /\bor the skip (?:note|reason)\b/, `Phase 3 item ${n} requires analytics content with no skip alternative`);
  }
});

test("FR-1 Phase 5 names the declined state, and no Phase 3–5 clause requires analytics unconditionally", () => {
  assert.ok(P5().includes(DECLINED), "Phase 5 summary lost the declined state");
  const analytic = /analytics|Phase 2B|Measurement & Compliance|GA4|Clarity/i;
  const mandatory = /\b(?:must|required|requires|always|mandatory)\b/i;
  for (const [label, text] of [["Phase 3", P3()], ["Phase 4", P4()], ["Phase 5", P5()]]) {
    const bad = clauses(text).filter((c) => analytic.test(c) && mandatory.test(c) && !/declined|skip/i.test(c));
    assert.deepEqual(bad, [], `${label} requires analytics with no declined/skip alternative`);
  }
});

"use strict";

// @akili-spec changes/ai-agent-guardrails-evals — Tester suite: content of the
// two new ai-agent-development references (FR-1 guardrails.md, FR-2 evals.md),
// the router/mapping contract (FR-3), binding coherence across every
// restatement (FR-7), the docs/CHANGELOG surfaces (FR-8 first two clauses),
// and NFR-4 (size cap) / NFR-5 (vendor-neutral).
//
// Expected values are inlined literals copied from requirements.md §6–§7 and
// design.md §9.1–9.2 at spec commit be917bb (size cap: ≤ 220 lines and
// ≤ 22,000 bytes per reference). This file never reads the spec folder.
//
// Already covered elsewhere (cited, not duplicated): FR-4/5/6, NFR-1 and the
// FR-8 pins in test/ai-agent-guardrails-evals.test.js; the panel SKILL_CATALOG
// binding in test/akili-panel-flow.test.js / test/akili-panel-catalog.test.js.
//
// Each assertion reads the rule inside the named section or table row, not
// anywhere in the file.
//
// Falsifier hook: AI_AGENT_REFS_TEST_ROOT points the tests at a scratch copy
// of the repo so mutations run without touching the working tree.

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = process.env.AI_AGENT_REFS_TEST_ROOT || path.join(__dirname, "..");
const p = (...parts) => path.join(ROOT, ...parts);
const SKILL_DIR = p(".claude", "skills", "ai-agent-development");
const SKILL_MD = path.join(SKILL_DIR, "SKILL.md");
const GUARDRAILS = path.join(SKILL_DIR, "references", "guardrails.md");
const EVALS = path.join(SKILL_DIR, "references", "evals.md");
const MAPPING = path.join(SKILL_DIR, "references", "akili-spec-mapping.md");

function read(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

// Lines from a heading up to (not including) the next heading of the same or
// higher level.
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

// Text before the first `## ` heading (title, Last verified, scope).
function header(text) {
  const lines = text.split("\n");
  const end = lines.findIndex((l) => /^##\s/.test(l));
  return lines.slice(0, end < 0 ? lines.length : end).join("\n");
}

// Body without the `## Sources` section.
function body(text) {
  const i = text.indexOf("\n## Sources");
  return i < 0 ? text : text.slice(0, i);
}

// The one table row of `sec` whose first cell matches `first`.
function row(sec, first) {
  const hits = sec
    .split("\n")
    .filter((l) => l.trim().startsWith("|"))
    .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()))
    .filter((c) => (first instanceof RegExp ? first.test(c[0]) : c[0] === first));
  assert.equal(hits.length, 1, `expected exactly one row "${first}", found ${hits.length}`);
  return hits[0];
}

function has(text, needle, why) {
  const ok = needle instanceof RegExp ? needle.test(text) : text.includes(needle);
  assert.ok(ok, `${why}: expected ${needle} in: ${text.slice(0, 400)}`);
}

function unvalidated(sec) {
  return sec.split("\n").filter((l) => l.startsWith("> Unvalidated:"));
}

// Every [n] cited in the body resolves to a numbered https entry n in Sources.
function assertCitationsResolve(text, name) {
  const sources = section(text, "## Sources");
  const entries = new Map();
  for (const l of sources.split("\n")) {
    const m = l.match(/^(\d+)\. .*https:\/\//);
    if (m) entries.set(m[1], l);
  }
  const cited = new Set([...body(text).matchAll(/\[(\d+)\]/g)].map((m) => m[1]));
  assert.ok(cited.size > 0, `${name}: expected bracketed citations in the body`);
  for (const n of cited) assert.ok(entries.has(n), `${name}: citation [${n}] has no numbered https entry in ## Sources`);
  assert.match(sources, /20\d\d-\d\d-\d\d/, `${name}: ## Sources must carry a verified date`);
}

function headingOrder(text, headings, name) {
  const lines = text.split("\n").map((l) => l.trim());
  const idx = headings.map((h) => lines.indexOf(h));
  idx.forEach((i, k) => assert.ok(i >= 0, `${name}: missing heading "${headings[k]}"`));
  for (let k = 1; k < idx.length; k++) {
    assert.ok(idx[k] > idx[k - 1], `${name}: "${headings[k]}" must come after "${headings[k - 1]}"`);
  }
}

// =============================================================== FR-1 guardrails.md

const g = () => read(GUARDRAILS);
const LAYERS = [
  "## Layer 1 — Input",
  "## Layer 2 — Output",
  "## Layer 3 — Tool permissions and least privilege",
  "## Layer 4 — Human handoff",
];

test("FR-1 THEN: four layers in order input → output → tool permissions/least privilege → human handoff, inside the design §9.1 section order", () => {
  headingOrder(g(), ["## Defense in depth", ...LAYERS, "## Voice specifics", "## From guide to spec", "## Sources"], "guardrails.md");
});

test("FR-1 THEN: the defense-in-depth summary table lists the four layers in the same order", () => {
  const sec = section(g(), "## Defense in depth");
  const firsts = sec
    .split("\n")
    .filter((l) => /^\| \d /.test(l))
    .map((l) => l.split("|")[1].trim());
  assert.deepEqual(firsts, ["1 Input", "2 Output", "3 Tool permissions", "4 Human handoff"]);
});

test("FR-1 THEN: layer 1 covers prompt injection and PII; layer 2 prohibited claims; layer 3 least privilege; layer 4 handoff", () => {
  const t = g();
  const l1 = section(t, LAYERS[0]);
  has(l1, /injection/i, "layer 1 injection");
  has(l1, /\bPII\b/, "layer 1 PII");
  has(section(t, LAYERS[1]), /prohibited/i, "layer 2 prohibited claims");
  has(section(t, LAYERS[2]), /Least privilege per tool/, "layer 3 least privilege");
  has(section(t, LAYERS[3]), /Caller asks for a person/, "layer 4 handoff trigger");
});

for (const [i, h] of LAYERS.entries()) {
  test(`FR-1 AND: ${h.slice(3)} states what it blocks, where it sits, and carries a phone-agent example`, () => {
    const sec = section(g(), h);
    has(sec, /^\*\*What it blocks:\*\* \S/m, `layer ${i + 1} blocks`);
    has(sec, /^\*\*Where it sits:\*\* \S/m, `layer ${i + 1} where`);
    has(sec, /^\*\*Phone-agent example:\*\* \S/m, `layer ${i + 1} phone example`);
  });
}

test("FR-1 AND: each layer becomes a `BUT it must NOT` clause, a design.md row and a negative case set (From guide to spec)", () => {
  const sec = section(g(), "## From guide to spec");
  for (const layer of ["Input", "Output", "Tool permissions", "Human handoff"]) {
    const c = row(sec, layer);
    assert.equal(c.length, 4, `${layer}: four cells`);
    assert.match(c[1], /^BUT it must NOT /, `${layer}: clause cell starts with BUT it must NOT`);
    assert.ok(c[2].length > 10, `${layer}: design.md row cell non-empty`);
    assert.ok(c[3].length > 5, `${layer}: negative case set cell non-empty`);
  }
});

test("FR-1 AND IT MUST: Defense in depth states no single layer suffices and instructions alone are not a guardrail", () => {
  const sec = section(g(), "## Defense in depth");
  has(sec, "No single layer is sufficient on its own", "no single layer");
  has(sec, "model instructions alone are not a guardrail", "instructions alone");
});

test("FR-1 Voice THEN: caller identity verification before any account-specific disclosure or action", () => {
  const c = row(section(g(), "## Voice specifics"), "Caller identity verification");
  has(c[1], /Before any account-specific disclosure or action/, "verification precedes disclosure");
});

test("FR-1 Voice AND: recording consent before recording or transcribing", () => {
  const c = row(section(g(), "## Voice specifics"), "Recording consent");
  has(c[1], /Before recording or transcribing/, "consent precedes recording");
});

test("FR-1 Voice AND: escalation to a human agent covers triggers, context passed and the no-human fallback", () => {
  const t = g();
  const c = row(section(t, "## Voice specifics"), "Escalation to a human agent");
  has(c[1], /triggers, context and fallback/, "voice row routes to layer 4");
  const l4 = section(t, LAYERS[3]);
  has(l4, /^\| Trigger \| Notes \|/m, "layer 4 trigger table");
  has(l4, /^What the human receives: /m, "context passed");
  has(l4, /^Fallback when no human is available: /m, "fallback");
});

test("FR-1 Voice BUT: requirements are decisions owned by counsel or compliance, each practice names an owner", () => {
  const sec = section(g(), "## Voice specifics");
  has(sec, "the requirement is a decision owned by counsel or compliance", "owner framing");
  for (const practice of ["Caller identity verification", "Recording consent", "Escalation to a human agent"]) {
    has(row(sec, practice)[2], /Owner: (counsel|compliance|operations)/, `${practice} owner`);
  }
});

// Partial automation of the legal-drift clause: a statute/jurisdiction pattern
// over the voice section. A paraphrased rule of law is not caught (accepted gap).
const LEGAL = /\b(statutes?|statutory|laws?|lawful|legally|jurisdictions?|regulations?|GDPR|HIPAA|TCPA|CCPA|CPRA|PCI|wiretap\w*|one-party|two-party|all-party|federal|EU|US|USA|California|Europe)\b/i;

test("FR-1 Voice BUT it must NOT: no statute, rule of law or jurisdiction named in the voice section (pattern grep)", () => {
  const hits = section(g(), "## Voice specifics").split("\n").filter((l) => LEGAL.test(l));
  assert.deepEqual(hits, [], "voice section names a statute or jurisdiction");
});

test("FR-1 Voice AND IT MUST: `> Unvalidated:` on the voice practices (verification, consent, handoff context)", () => {
  const u = unvalidated(section(g(), "## Voice specifics"));
  assert.ok(u.some((l) => /verification/.test(l)), "verification practice unvalidated marker");
  assert.ok(u.some((l) => /consent/.test(l)), "consent practice unvalidated marker");
  assert.ok(u.some((l) => /handoff/.test(l)), "handoff context unvalidated marker");
});

test("FR-1 Voice AND IT MUST: layer 4 thresholds (failure count, keyword list, confidence cut-off) carry `> Unvalidated:`", () => {
  const u = unvalidated(section(g(), LAYERS[3]));
  assert.ok(u.some((l) => /threshold/.test(l)), "layer 4 thresholds unvalidated");
});

test("FR-1 Sources THEN: `Last verified:` date in the header and every [n] resolves to a dated ## Sources entry", () => {
  const t = g();
  has(header(t), /^Last verified: 20\d\d-\d\d-\d\d$/m, "Last verified");
  assertCitationsResolve(t, "guardrails.md");
});

test("FR-1 Sources BUT: vendor pages are examples, not requirements; OWASP labeled a standard (NFR-2)", () => {
  const sources = section(g(), "## Sources");
  has(sources, "Vendor pages appear as examples of a control, never as a requirement", "Sources vendor framing");
  const bedrock = sources.split("\n").find((l) => /Bedrock/.test(l));
  assert.ok(bedrock, "Bedrock entry present");
  has(bedrock, "vendor example", "Bedrock entry labeled vendor example");
  const owasp = sources.split("\n").find((l) => /^\d+\. OWASP/.test(l));
  assert.ok(owasp, "OWASP entry present");
  has(owasp, "(standard:", "OWASP entry labeled standard");
  has(section(g(), LAYERS[0]), /one example of the control, not the requirement/, "layer 1 vendor PII filter framed as example");
});

test("FR-1 Sources AND IT MUST: vendor configuration routes through SKILL.md *Runtime Deferral*, which has a guardrails-config row", () => {
  has(header(g()), /configuring any of them routes through the skill's \*Runtime Deferral\* table/, "header deferral");
  const c = row(section(read(SKILL_MD), "## Runtime Deferral"), /guardrails config/);
  has(c[1], "amazon-bedrock", "guardrails config route");
});

// =============================================================== FR-2 evals.md

const e = () => read(EVALS);

test("FR-2 THEN: lifecycle sections in design §9.2 order — rule, offline, regression, judge, online, voice, no-pass, sources", () => {
  headingOrder(
    e(),
    ["## The rule", "## 1. Offline evals", "## 2. Regression", "## 3. LLM-as-judge", "## 4. Online evals", "## 5. Voice metrics", "## 7. No-pass clauses", "## Sources"],
    "evals.md",
  );
});

test("FR-2 THEN: offline evals run before release", () => {
  has(row(section(e(), "## Decision index"), "Offline")[1], /Before release/, "decision index offline");
  has(section(e(), "## 1. Offline evals"), /before deployment/, "offline section");
});

test("FR-2 THEN: online evals state sampling, metrics, alert threshold and owner", () => {
  const sec = section(e(), "## 4. Online evals");
  for (const part of ["Sampling", "Metrics", "Alert threshold", "Owner"]) assert.ok(row(sec, part)[1].length > 10, `${part} row`);
});

test("FR-2 THEN: regression on every change to prompt, model, tools, guardrails or knowledge, against a recorded baseline", () => {
  const sec = section(e(), "## 2. Regression");
  for (const trig of [/^Prompt edit/, /^Model change/, /^Tool added/, /^Guardrail change/, /^Knowledge change/]) row(sec, trig);
  has(sec, /\*\*Record a baseline\*\*/, "recorded baseline");
  has(sec, /Compare against the baseline/, "baseline comparison");
});

test("FR-2 THEN: LLM-as-judge with rubrics", () => {
  row(section(e(), "## 3. LLM-as-judge"), "Rubric pinned");
});

test("FR-2 AND: voice metrics — latency interval defined (end of caller speech → first agent audio) as percentiles, escalation rate, task completion", () => {
  const sec = section(e(), "## 5. Voice metrics");
  const lat = row(sec, "Response latency");
  has(lat[1], /end of caller speech/, "latency interval start");
  has(lat[1], /first audio the agent emits/, "latency interval end");
  has(lat[2], /Percentiles p50 and p95/, "percentiles");
  assert.ok(row(sec, "Escalation rate")[1].length > 10, "escalation rate defined");
  assert.ok(row(sec, "Task completion")[1].length > 10, "task completion defined");
});

for (const h of ["## 1. Offline evals", "## 2. Regression", "## 3. LLM-as-judge", "## 4. Online evals"]) {
  test(`FR-2 AND: ${h.slice(3)} carries a phone-agent example`, () => {
    has(section(e(), h), /^\*\*Phone agent\.\*\* \S/m, `${h} phone example`);
  });
}

test("FR-2 AND: voice metrics are defined on calls (caller speech, billing question)", () => {
  const sec = section(e(), "## 5. Voice metrics");
  has(sec, /caller's billing question/, "voice phone example");
});

test("FR-2 Expected values THEN: derive from approved requirements.md scenarios", () => {
  has(section(e(), "## The rule"), "Expected values come from the approved `requirements.md` scenarios", "rule");
});

test("FR-2 Expected values BUT it must NOT: never label a case set by running the agent and accepting its output", () => {
  const sec = section(e(), "## The rule");
  has(sec, "never from the agent's own output", "never from output");
  has(sec, "Do not label a case set by running the agent and accepting what it produced", "no self-labeling");
  has(section(e(), "## 1. Offline evals"), /A case the agent fails is a finding, not a label to edit/, "offline practical rule");
});

test("FR-2 Expected values AND IT MUST: guardrails get their own negative case sets with zero tolerated violations", () => {
  const sec = section(e(), "## The rule");
  has(sec, /Guardrails get their own negative case sets/, "own sets");
  has(sec, /tolerated violation count is \*\*zero\*\*/, "zero");
  has(row(section(e(), "## 1. Offline evals"), "Negative (guardrail) set")[2], /Zero violations tolerated/, "offline negative row");
});

test("FR-2 Judge THEN/AND: rubric and judge model pinned; calibrated against human labels before gating", () => {
  const sec = section(e(), "## 3. LLM-as-judge");
  has(row(sec, "Rubric pinned")[1], /versioned artifact/, "rubric pinned");
  has(row(sec, "Judge model pinned")[1], /identifier is recorded/, "judge pinned");
  const cal = row(sec, "Calibrated before gating")[1];
  has(cal, /human-labeled/, "human labels");
  has(cal, /gate nothing until/, "no gating before calibration");
});

test("FR-2 Judge AND IT MUST: a changed judge, rubric or prompt without re-scoring the baseline is a no-pass condition", () => {
  const sec = section(e(), "## 7. No-pass clauses");
  has(sec, /must report \*\*inconclusive\*\*/, "inconclusive framing");
  has(sec, /^- \*\*A changed judge, rubric or prompt without re-scoring the baseline\.\*\*/m, "judge-change no-pass item");
});

test("FR-2 Sources THEN: `Last verified:` date and every [n] resolves to a dated ## Sources entry", () => {
  const t = e();
  has(header(t), /^Last verified: 20\d\d-\d\d-\d\d$/m, "Last verified");
  assertCitationsResolve(t, "evals.md");
});

test("FR-2 Sources AND IT MUST: `> Unvalidated:` on set sizes, thresholds and voice targets, in the section that states them", () => {
  const t = e();
  assert.ok(unvalidated(section(t, "## 1. Offline evals")).some((l) => /set-size/.test(l)), "offline set sizes");
  assert.ok(unvalidated(section(t, "## 2. Regression")).some((l) => /score movement/.test(l)), "regression threshold");
  assert.ok(unvalidated(section(t, "## 3. LLM-as-judge")).some((l) => /agreement level/.test(l)), "judge agreement threshold");
  assert.ok(unvalidated(section(t, "## 4. Online evals")).some((l) => /alert threshold/.test(l)), "online threshold");
  assert.ok(unvalidated(section(t, "## 5. Voice metrics")).some((l) => /latency target/.test(l)), "voice targets");
});

// =============================================================== NFR-4 / NFR-5

for (const [name, file] of [["guardrails.md", GUARDRAILS], ["evals.md", EVALS]]) {
  test(`NFR-4: references/${name} stays within the design cap (≤ 220 lines, ≤ 22,000 bytes)`, () => {
    const raw = fs.readFileSync(file);
    const lines = raw.toString("utf8").split("\n").length - (raw.toString("utf8").endsWith("\n") ? 1 : 0);
    assert.ok(lines <= 220, `${name}: ${lines} lines > 220`);
    assert.ok(raw.length <= 22000, `${name}: ${raw.length} bytes > 22000`);
  });

  test(`NFR-5: references/${name} — every vendor mention outside Sources is a citation or an example, never a requirement`, () => {
    const VENDOR = /\b(Anthropic|Amazon|AWS|Bedrock|LangSmith|LangChain|OpenAI|Azure|Google|Gemini|Claude)\b/;
    const REQUIRE = /\b(must|required?|requires|shall|only)\b[^.]*\b(Anthropic|Amazon|AWS|Bedrock|LangSmith|LangChain|OpenAI|Azure|Google|Gemini|Claude)\b/i;
    const lines = body(read(file)).split("\n").filter((l) => VENDOR.test(l));
    for (const l of lines) {
      assert.ok(/\[\d+\]/.test(l), `${name}: vendor named without a citation: ${l}`);
      assert.ok(!REQUIRE.test(l), `${name}: vendor named as a requirement: ${l}`);
    }
  });
}

// =============================================================== FR-3 router and mapping

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(m, "frontmatter block");
  return m[1];
}

test("FR-3 AND: SKILL.md frontmatter declares `binding: conditional` and a version bumped past 1.0", () => {
  const fm = frontmatter(read(SKILL_MD));
  has(fm, /^ {2}binding: conditional$/m, "binding");
  const v = fm.match(/^ {2}version: "(\d+)\.(\d+)"$/m);
  assert.ok(v, "version field");
  assert.ok(Number(v[1]) > 1 || (Number(v[1]) === 1 && Number(v[2]) > 0), `version ${v[1]}.${v[2]} not bumped past 1.0`);
});

test("FR-3 No restatement THEN: akili-spec-mapping points to guardrails.md (§1) and evals.md (§3)", () => {
  const t = read(MAPPING);
  has(section(t, "## 1. Behaviors and evals → `requirements.md`"), /^For how to build the guardrail layers themselves, read `references\/guardrails\.md`\.$/m, "§1 pointer");
  has(section(t, "## 3. Eval work → `tasks.md`"), /^For the eval lifecycle behind these tasks, read `references\/evals\.md`\.$/m, "§3 pointer");
});

test("FR-3 No restatement BUT it must NOT: akili-spec-mapping does not restate the new references' content", () => {
  const DISTINCT = /Layer [1-4]|least privilege|human handoff|recording consent|identity verification|\bp95\b|\bp50\b|latency|calibrat|alert threshold|sampling|held-out|Defense in depth|prompt injection|\bPII\b|online monitoring|Voice metrics/i;
  const hits = body(read(MAPPING)).split("\n").filter((l) => DISTINCT.test(l));
  assert.deepEqual(hits, [], "mapping restates guardrails/evals guide content");
});

test("FR-3 No restatement: the triage worked example stays as it is (section hash pinned from master 1a09635)", () => {
  const sec = section(read(MAPPING), "## 4. Worked example — support-ticket triage");
  const h = crypto.createHash("sha256").update(sec).digest("hex");
  assert.equal(h, "f1d2e5c96b611810523fd5b64ae78dabf82c0116f73ef5238f301b2abf89a1f8", "worked example changed");
});

// =============================================================== FR-7 governance

const NAME = "`ai-agent-development`";

test("FR-7 THEN: panel test binding list puts ai-agent-development under conditional", () => {
  const t = read(p("test", "akili-panel-flow.test.js"));
  const cond = t.match(/^ {2}conditional: \[([^\]]*)\]/m);
  assert.ok(cond, "SKILL_NAMES.conditional list");
  has(cond[1], "'ai-agent-development'", "conditional list");
  const stack = t.match(/^ {2}stack: \[([^\]]*)\]/m);
  assert.ok(stack && !stack[1].includes("ai-agent-development"), "absent from stack list");
});

test("FR-7 THEN: backend-routing.md expertise card reads (conditional)", () => {
  const sec = section(read(p(".claude", "skills", "software-architect", "references", "backend-routing.md")), "## Expertise cards");
  row(sec, `${NAME} (conditional)`);
  assert.ok(!sec.includes(`${NAME} (stack)`), "no stack card");
});

test("FR-7 THEN: AGENTS.md *Backend Skills* lists it as a conditional skill", () => {
  const sec = section(read(p("AGENTS.md")), "## Backend Skills");
  const line = sec.split("\n").find((l) => l.startsWith(`- ${NAME}`));
  assert.ok(line, "Backend Skills bullet");
  has(line, /^- `ai-agent-development` — conditional skill:/, "conditional");
});

test("FR-7 THEN: governance.md → Current assignment puts it in the conditional row, not the stack row", () => {
  const sec = section(read(p("docs", "skills", "governance.md")), "### Current assignment");
  has(row(sec, "`conditional`")[1], NAME, "conditional row");
  assert.ok(!row(sec, "`stack`")[1].includes("ai-agent-development"), "stack row must not list it");
});

test("FR-7 THEN: docs/overview.md Backend and architecture row reads conditional", () => {
  const sec = section(read(p("docs", "overview.md")), "### Backend and architecture");
  assert.equal(row(sec, /ai-agent-development/)[1], "conditional");
});

test("FR-7 THEN: docs/skills/README.md row reads conditional", () => {
  assert.equal(row(read(p("docs", "skills", "README.md")), /ai-agent-development/)[1], "conditional");
});

test("FR-7 THEN: docs/skills/ai-agent-development.md binding reads conditional", () => {
  has(header(read(p("docs", "skills", "ai-agent-development.md"))), /\*\*Binding:\*\* `conditional`/, "binding line");
});

const CONSTITUTION = () => read(p(".claude", "commands", "akili-constitution.md"));

test("FR-7 AND: /akili-constitution Step 5 loads it through a conditional line, not the stack-skill list", () => {
  const sec = section(CONSTITUTION(), "### Step 5: Create or Enhance the TRD (Technical Requirements Document)");
  has(sec, /^When the product includes an AI agent, load `ai-agent-development`\.$/m, "conditional line");
  assert.ok(!sec.split("\n").some((l) => l.trim() === `- ${NAME}`), "must not be a stack-list bullet");
});

test("FR-7 AND: the skill is not a Step 8D Skill Map candidate", () => {
  const sec = section(CONSTITUTION(), "### Step 8D: Scaffold the Skill Map");
  assert.ok(!sec.includes("ai-agent-development"), "Step 8D names ai-agent-development");
});

test("FR-7 AND: docs/commands/akili-constitution.md stack list excludes it; a separate conditional bullet names it", () => {
  const t = read(p("docs", "commands", "akili-constitution.md"));
  const stack = t.split("\n").filter((l) => l.startsWith("- Stack skills matching the repo"));
  assert.equal(stack.length, 1, "one stack list line");
  assert.ok(!stack[0].includes("ai-agent-development"), "stack list names it");
  has(t, /^- `ai-agent-development` \(Step 5 TRD, `conditional` — loaded only when the product includes an AI agent; not a Skill Map candidate\)$/m, "conditional bullet");
});

test("FR-7 AND: Best Paired Commands names the selector-gated steps in specify, test and validate", () => {
  const sec = section(read(p("docs", "skills", "ai-agent-development.md")), "## Best Paired Commands");
  for (const cmd of ["/akili-specify", "/akili-test", "/akili-validate"]) {
    const line = sec.split("\n").find((l) => l.startsWith(`- \`${cmd}\``));
    assert.ok(line, `${cmd} bullet`);
    has(line, "`AI Agent: yes`", `${cmd} selector`);
  }
});

function shippedMarkdown() {
  const out = [p("AGENTS.md"), p("README.md")];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (f === p("docs", "specs")) continue;
        walk(f);
      } else if (ent.name.endsWith(".md")) out.push(f);
    }
  };
  walk(p(".claude"));
  walk(p("docs"));
  return out.filter((f) => fs.existsSync(f));
}

test("FR-7 BUT it must NOT: no shipped sentence says ai-agent-development reaches agents only through the Skill Map", () => {
  const offenders = [];
  for (const f of shippedMarkdown()) {
    for (const line of read(f).split("\n")) {
      if (!line.includes("ai-agent-development")) continue;
      for (const s of line.split(/(?<=\.)\s+/)) {
        if (/only (through|via|from)[^.]*Skill Map/i.test(s) || /\bstack\b[^.|]*binding|binding[^.|]*`stack`/i.test(s)) {
          offenders.push(`${path.relative(ROOT, f)}: ${s.trim()}`);
        }
      }
    }
  }
  assert.deepEqual(offenders, []);
});

// =============================================================== FR-8 docs + CHANGELOG

test("FR-8 THEN: docs/commands/akili-specify.md Key Rules describes the AI Agent Mode branch", () => {
  const sec = section(read(p("docs", "commands", "akili-specify.md")), "## Key Rules");
  const line = sec.split("\n").find((l) => l.startsWith("- **AI Agent Mode:**"));
  assert.ok(line, "AI Agent Mode bullet");
  has(line, "`AI Agent: yes`", "selector");
  has(line, /\*\*Guardrails\*\*/, "Guardrails section");
});

test("FR-8 THEN: docs/commands/akili-test.md describes the agent eval suite and the Agent Evals output", () => {
  const t = read(p("docs", "commands", "akili-test.md"));
  has(section(t, "## Multi-Agent Harness"), /^\*\*Agent specs:\*\* when `requirements\.md` Document Control has `AI Agent: yes`.*\*\*agent eval suite\*\*/m, "harness");
  has(section(t, "## Outputs"), /^- Agent Evals \(only when `AI Agent: yes`\)/m, "outputs");
});

test("FR-8 THEN: docs/commands/akili-validate.md has an Agent Specs section with the agent eval gate", () => {
  const sec = section(read(p("docs", "commands", "akili-validate.md")), "## Agent Specs");
  has(sec, "`AI Agent: yes`", "selector");
  has(sec, /\*\*agent eval gate\*\*/, "eval gate");
});

// Reads the newest CHANGELOG section, in document order ([Unreleased] first), that carries the entry, so the test survives the release cut (AGENTS.md).
test("FR-8 AND: the newest CHANGELOG section with the entry carries it, consistent with the shipped version and binding", () => {
  const ADDED_LEAD = "- **`ai-agent-development` 1.1 gains `references/guardrails.md` and `references/evals.md`";
  const sec = read(p("CHANGELOG.md")).split(/\n(?=## \[)/).find((s) => s.startsWith("## [") && s.split("\n").some((l) => l.startsWith(ADDED_LEAD))) || "";
  const added = sec.split("\n").find((l) => l.startsWith(ADDED_LEAD));
  assert.ok(added, "Added entry");
  const changed = sec.split("\n").find((l) => l.startsWith("- **`ai-agent-development` is now `conditional`, not `stack`.**"));
  assert.ok(changed, "Changed entry");
  const fm = frontmatter(read(SKILL_MD));
  has(fm, /^ {2}version: "1\.1"$/m, "CHANGELOG says 1.1; SKILL.md must match");
  has(fm, /^ {2}binding: conditional$/m, "CHANGELOG says conditional; SKILL.md must match");
  assert.ok(fs.existsSync(GUARDRAILS) && fs.existsSync(EVALS), "references named in CHANGELOG exist");
});

test("FR-8 BUT: this test file never reads the active spec folder", () => {
  const self = fs.readFileSync(__filename, "utf8");
  assert.ok(!self.includes("docs/" + "specs/changes"), "reads the spec folder");
  assert.ok(!/["'`]specs["'`]\s*,\s*["'`]changes/.test(self), "joins a spec path");
});

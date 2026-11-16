"use strict";

// @akili-spec changes/ai-agent-guardrails-evals — static contract tests for the
// `AI Agent: yes` branch in /akili-specify, /akili-test and /akili-validate and
// for the two packaged references (guardrails.md, evals.md). One assertion
// group per shipped THEN / BUT / AND IT MUST clause of FR-4, FR-5, FR-6, plus
// the FR-8 pins (selector wording, reference presence, `## Sources`,
// `> Unvalidated:` markers) and NFR-1 (every added agent line is conditional
// on `AI Agent: yes`). Design DD-12 (one assertion per clause) and P-3.
//
// These are text contracts: the shipped artifacts ARE prose an agent follows,
// so each test asserts the rule is stated where the agent reads it (the named
// section, numbered item, bullet or table row), not merely that a word occurs
// somewhere in the file. Expected values come from the requirements scenarios.
//
// Falsifier hook: AI_AGENT_EVALS_TEST_ROOT points the tests at a scratch copy
// of the repo files so a mutation can be run without touching the working
// tree. Unset, the tests read this checkout.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const ROOT = process.env.AI_AGENT_EVALS_TEST_ROOT || REPO_ROOT;
const COMMANDS = path.join(ROOT, ".claude", "commands");
const SKILL_DIR = path.join(ROOT, ".claude", "skills", "ai-agent-development");
const SKILL_MD = path.join(SKILL_DIR, "SKILL.md");
const GUARDRAILS = path.join(SKILL_DIR, "references", "guardrails.md");
const EVALS = path.join(SKILL_DIR, "references", "evals.md");

function read(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

const specifyText = () => read(path.join(COMMANDS, "akili-specify.md"));
const testText = () => read(path.join(COMMANDS, "akili-test.md"));
const validateText = () => read(path.join(COMMANDS, "akili-validate.md"));

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

// The one line of `sec` whose trimmed text starts with `prefix`.
function lineStarting(sec, prefix) {
  const hits = sec.split("\n").filter((l) => l.trim().startsWith(prefix));
  assert.equal(hits.length, 1, `expected exactly one line starting "${prefix}", found ${hits.length}`);
  return hits[0].trim();
}

// A numbered list item ("N. **…") through the line before the next item.
function numberedItem(sec, n) {
  const lines = sec.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`${n}. **`));
  assert.ok(start >= 0, `expected numbered item ${n}`);
  const out = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\d+\. \*\*/.test(lines[i]) || lines[i].trim() === "") break;
    out.push(lines[i]);
  }
  return out.join(" ").replace(/\s+/g, " ");
}

function has(line, needle, why) {
  assert.ok(line.includes(needle), `${why}: expected text ${JSON.stringify(needle)} in: ${line}`);
}

const YES = "`AI Agent: yes`";

const AGENT_MODE = "### AI Agent Mode";
const specifyMode = () => section(specifyText(), AGENT_MODE);

// ---------------------------------------------------------------------------
// FR-4 — /akili-specify detects, records and enforces
// ---------------------------------------------------------------------------

test("FR-4 THEN: item 1 records `AI Agent: yes` or `no` as a Document Control row beside Type, on every spec", () => {
  const item = numberedItem(specifyMode(), 1);
  has(item, "`AI Agent: yes` or `AI Agent: no`", "FR-4 THEN values");
  has(item, "`requirements.md` Document Control row beside `Type`", "FR-4 THEN location");
  has(item, "on every spec, never leaving it absent", "FR-4 THEN every spec");
});

test("FR-4 AND: item 1 asks one question and does not guess when the proposal is unclear", () => {
  has(numberedItem(specifyMode(), 1), "ask one question and do not guess", "FR-4 AND ask");
});

test("FR-4 AND IT MUST: item 1 reads an absent row as `no` and an unrecognized value as `no`, reported", () => {
  const item = numberedItem(specifyMode(), 1);
  has(item, "An absent row means `no`", "FR-4 absent row");
  has(item, "an unrecognized value is read as `no` and reported as unrecognized at the next gate", "FR-4 unrecognized value");
});

test("FR-4 AND IT MUST (everywhere): test and validate also read an absent row as `no`", () => {
  const testBullet = lineStarting(
    section(testText(), "### Phase 1: Plan Suites & Delegation (Leader)"),
    `- When \`requirements.md\` Document Control has ${YES}`
  );
  has(testBullet, "An absent row reads as `no`", "akili-test absent row");
  const validateBullet = lineStarting(
    section(validateText(), "### Phase 0: Load Context"),
    `- When \`requirements.md\` Document Control records ${YES}`
  );
  has(validateBullet, "An absent row reads as `no`", "akili-validate absent row");
});

test("FR-4 THEN (agent spec): item 2 loads ai-agent-development with guardrails, evals and akili-spec-mapping references", () => {
  const item = numberedItem(specifyMode(), 2);
  has(item, "**Load** `ai-agent-development` before writing `requirements.md`", "FR-4 load");
  for (const ref of ["references/guardrails.md", "references/evals.md", "references/akili-spec-mapping.md"]) {
    has(item, ref, "FR-4 load references");
  }
});

test("FR-4 AND: item 3 puts a Guardrails section in requirements.md (BUT-it-must-NOT clause, negative case set, zero tolerance, layers or n/a)", () => {
  const item = numberedItem(specifyMode(), 3);
  has(item, "**Guardrails** section", "FR-4 Guardrails section");
  has(item, "one `BUT it must NOT` clause per guardrail", "FR-4 BUT clause");
  has(item, "its own negative case set and zero tolerance", "FR-4 negative case set");
  has(item, "every layer the agent has covered or marked `n/a — <reason>`", "FR-4 layers");
});

test("FR-4 AND: item 3 puts an Evals section in requirements.md (offline case sets, thresholds, regression trigger, rubric)", () => {
  const item = numberedItem(specifyMode(), 3);
  has(item, "**Evals** section", "FR-4 Evals section");
  has(item, "offline case sets, thresholds, the regression trigger, and a rubric for any free-generated output", "FR-4 Evals content");
});

test("FR-4 AND: item 4 puts the eval seam and an online monitoring plan in design.md (metrics, sampling, alert threshold, owner)", () => {
  const item = numberedItem(specifyMode(), 4);
  has(item, "**`design.md`**", "FR-4 design.md");
  has(item, "eval seam", "FR-4 eval seam");
  has(item, "online monitoring plan (metrics, sampling, alert threshold, owner)", "FR-4 monitoring plan");
});

test("FR-4 AND: item 5 puts an eval-gate task in tasks.md (four parts per akili-spec-mapping section 3) and lists the skill on every task", () => {
  const item = numberedItem(specifyMode(), 5);
  has(item, "**`tasks.md`**", "FR-4 tasks.md");
  has(item, "eval-gate task with the four parts named in `akili-spec-mapping.md` section 3", "FR-4 eval-gate task");
  has(item, "every task lists `ai-agent-development` in its skills", "FR-4 every task lists the skill");
});

test("FR-4 BUT: item 6 stops the Phase 1, 2 and 3 gates while any agent item is missing", () => {
  const item = numberedItem(specifyMode(), 6);
  has(item, "**Gates.**", "FR-4 BUT gates");
  has(item, "The Phase 1, 2 and 3 gates do not pass an `AI Agent: yes` spec while any item above is missing", "FR-4 BUT gate text");
});

test("FR-4 THEN (non-agent): the section states items 2-6 apply only when `AI Agent: yes`, and item 1 alone runs on every spec", () => {
  const sec = specifyMode();
  has(sec, "Item 1 runs on every spec and only records the row", "FR-4 non-agent carve-out");
  has(sec, "items 2-6 apply only when `AI Agent: yes`", "FR-4 non-agent conditional");
});

test("FR-4 non-agent: the AI Agent Mode list has no item past 6 (no unconditional extra item)", () => {
  const nums = specifyMode()
    .split("\n")
    .map((l) => l.match(/^(\d+)\. \*\*/))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  assert.ok(Math.max(...nums) <= 6, `unexpected item numbers: ${nums}`);
});

test("FR-4 enforcement: the Verification Checklist row requires the agent artifacts, conditional on `AI Agent: yes`, and no gate passed without them", () => {
  const row = lineStarting(section(specifyText(), "## Verification Checklist"), "- [ ] If `AI Agent: yes`:");
  for (const part of [
    "Guardrails and Evals sections",
    "eval seam and online monitoring plan",
    "eval-gate task",
    "every task lists `ai-agent-development`",
    "no phase gate passed with any of these missing",
  ]) {
    has(row, part, "FR-4 checklist row");
  }
});

test("FR-4 / DD-9: specify Step 2.1 fallback stack-skill list does not name ai-agent-development", () => {
  const sec = section(specifyText(), "#### Step 2.1 — Explore");
  const idx = sec.split("\n").findIndex((l) => l.trim() === "- `nestjs-expert`");
  assert.ok(idx >= 0, "expected the fallback list in Step 2.1");
  const list = [];
  for (const l of sec.split("\n").slice(idx)) {
    if (!l.startsWith("- `")) break;
    list.push(l);
  }
  assert.ok(list.length >= 2, "expected a multi-item fallback list");
  assert.ok(
    !list.some((l) => l.includes("ai-agent-development")),
    `the no-map list must not name ai-agent-development: ${list.join(" | ")}`
  );
});

// ---------------------------------------------------------------------------
// FR-5 — /akili-test runs the evals
// ---------------------------------------------------------------------------

const testPhase1 = () => section(testText(), "### Phase 1: Plan Suites & Delegation (Leader)");
const evalSuiteBullet = () =>
  lineStarting(testPhase1(), `- When \`requirements.md\` Document Control has ${YES}, plan an **agent eval suite**`);
const agentEvalsReportLine = () => lineStarting(section(testText(), "### Phase 4: Generate Test Report (Leader)"), "**Agent Evals (");

test("FR-5 THEN: Phase 1 plans an agent eval suite running the eval-gate task's verification command(s) over offline, regression and guardrail sets", () => {
  const b = evalSuiteBullet();
  has(b, "runs the eval-gate task's verification command(s)", "FR-5 THEN command");
  has(b, "over the offline, regression and guardrail sets", "FR-5 THEN sets");
});

test("FR-5 AND: Phase 4 gives the report an Agent Evals section with the five per-set fields", () => {
  const l = agentEvalsReportLine();
  has(l, "**Agent Evals (`AI Agent: yes` only):**", "FR-5 AND heading");
  has(l, "an **Agent Evals** section", "FR-5 AND section");
  for (const field of [
    "per set (offline, regression, guardrail)",
    "cases in the set",
    "cases scored",
    "the metric against its threshold",
    "guardrail violations",
    "the no-pass status (`clear` or the triggered condition)",
  ]) {
    has(l, field, "FR-5 AND fields");
  }
});

test("FR-5 BUT: exit code 0 is not the gate; the gate is thresholds and a zero guardrail-violation count", () => {
  const b = evalSuiteBullet();
  has(b, "Exit code 0 is not the gate", "FR-5 BUT exit code");
  has(b, "the gate is each set's threshold and a zero guardrail-violation count", "FR-5 BUT gate");
});

test("FR-5 AND: a Tester must not change expected values, thresholds or the rubric; a mismatch is FAIL or PRODUCT_BUG", () => {
  const b = evalSuiteBullet();
  has(b, "A Tester must not change expected values, thresholds or the rubric to make a set pass", "FR-5 AND Tester");
  has(b, "a mismatch is a `FAIL` or a `PRODUCT_BUG`", "FR-5 AND mismatch");
});

test("FR-5 AND IT MUST: online evals are recorded as out of this command's reach, never as run", () => {
  has(evalSuiteBullet(), "Record online evals as out of this command's reach, never as run", "FR-5 online (suite bullet)");
  has(agentEvalsReportLine(), "Online evals are listed as out of reach", "FR-5 online (report)");
});

test("FR-5 No runner: a missing eval runner is the existing No-test-infrastructure STOP, agent specs only, no substitute eval", () => {
  const b = lineStarting(testPhase1(), "- **A missing eval runner is the same STOP**");
  has(b, "(applies only when `AI Agent: yes`)", "FR-5 no-runner condition");
  has(b, "the eval-gate task names no runnable command, or its runner is absent", "FR-5 no-runner trigger");
  has(b, "stop, tell the user, and improvise no substitute eval", "FR-5 no-runner STOP");
});

test("FR-5 non-agent: absent or unrecognized row reads as `no`; the report has no Agent Evals section without `AI Agent: yes`", () => {
  has(evalSuiteBullet(), "An absent row reads as `no`; an unrecognized value reads as `no` and the test report notes it", "FR-5 non-agent suite");
  has(agentEvalsReportLine(), "A spec without `AI Agent: yes` gets no Agent Evals section", "FR-5 non-agent report");
});

test("FR-5: Testing Rules names the agent eval suite as separate from the four software suite types", () => {
  const b = lineStarting(section(testText(), "## Testing Rules"), "- **Performance/load testing is out of scope");
  has(b, "the `AI Agent: yes` agent eval suite are separate", "FR-5 Testing Rules");
});

// ---------------------------------------------------------------------------
// FR-6 — /akili-validate enforces the eval gate
// ---------------------------------------------------------------------------

const validatePhase4 = () => section(validateText(), "### Phase 4: Requirement Coverage Verification");
const gateHeader = "**Agent eval gate (when `requirements.md` records `AI Agent: yes`):**";

function ladderRows() {
  const lines = validatePhase4().split("\n");
  const start = lines.findIndex((l) => l.startsWith(gateHeader));
  assert.ok(start >= 0, "expected the Agent eval gate paragraph in Phase 4");
  const rows = [];
  for (const l of lines.slice(start)) {
    const cells = l.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
    if (cells && !/^-+$/.test(cells[1]) && cells[1] !== "Condition") rows.push({ condition: cells[1], verdict: cells[2] });
  }
  return rows;
}

const LADDER = [
  ["No eval-gate task in `tasks.md`, or no Agent Evals results in `test-report.md`", "**FAIL**"],
  ["Any guardrail violation recorded", "**FAIL**"],
  ["Any threshold missed", "**FAIL**"],
  ["No online monitoring plan in `design.md`", "**FAIL**"],
  ["A no-pass condition triggered", "**BLOCKED**"],
  ["None of the above", "the eval gate passes"],
];

test("FR-6 THEN: the ladder has the six conditions in the required order, applied in order", () => {
  has(lineStarting(validatePhase4(), gateHeader), "Apply, in order:", "FR-6 THEN order");
  assert.deepEqual(
    ladderRows().map((r) => r.condition),
    LADDER.map(([c]) => c)
  );
});

for (const [condition, verdict] of LADDER) {
  test(`FR-6 THEN: ladder row "${condition}" yields ${verdict}`, () => {
    const row = ladderRows().find((r) => r.condition === condition);
    assert.ok(row, `expected ladder row "${condition}"`);
    assert.equal(row.verdict, verdict);
  });
}

test("FR-6 AND: the report records the eval gate's verdict and the row that decided it (Phase 4 and Phase 7)", () => {
  has(
    lineStarting(validatePhase4(), "The report records the eval gate's verdict and the row that decided it."),
    "The report records the eval gate's verdict and the row that decided it",
    "FR-6 AND (Phase 4)"
  );
  const l = lineStarting(section(validateText(), "### Phase 7: Generate Validation Report"), "6. Requirement Coverage");
  has(l, "(when `AI Agent: yes`, the eval gate's verdict and the row that decided it are recorded here, not in a new section)", "FR-6 AND (Phase 7)");
});

test("FR-6 BUT: validate must not report the spec PASS while the eval gate is FAIL or BLOCKED", () => {
  const l = lineStarting(validatePhase4(), "The report records the eval gate's verdict");
  has(l, "Validate MUST NOT report the spec PASS while the eval gate is FAIL or BLOCKED", "FR-6 BUT");
});

test("FR-6 AND IT MUST: a guardrail violation is reported as FAIL whatever the aggregate scores are", () => {
  const l = lineStarting(validatePhase4(), "The report records the eval gate's verdict");
  has(l, "MUST report a guardrail violation as FAIL whatever the aggregate scores are", "FR-6 AND IT MUST");
});

test("FR-6 THEN (non-agent): no eval gate and no eval-gate entry without `AI Agent: yes`, including an absent or unrecognized row", () => {
  const l = lineStarting(validatePhase4(), "The report records the eval gate's verdict");
  has(l, "A spec without `AI Agent: yes` (including an absent or unrecognized row) gets no eval gate and no eval-gate entry", "FR-6 non-agent");
});

test("FR-6: Phase 0 loads ai-agent-development on `AI Agent: yes` and notes an unrecognized value as WARN (spec defect)", () => {
  const b = lineStarting(section(validateText(), "### Phase 0: Load Context"), `- When \`requirements.md\` Document Control records ${YES}`);
  has(b, "load the `ai-agent-development` skill now", "FR-6 load");
  has(b, "an unrecognized value reads as `no` and the report notes it as WARN (spec defect)", "FR-6 WARN");
});

// ---------------------------------------------------------------------------
// NFR-1 — non-agent path untouched: every added agent line is conditional
// ---------------------------------------------------------------------------

// Lines that talk about the agent branch. Table rows are checked through the
// ladder's conditional header; specify's AI Agent Mode section is checked by
// its own intro (item 1 carve-out, items 2-6 conditional).
const AGENT_LINE = /ai-agent-development|AI Agent|agent eval|Agent Evals|eval[- ]gate|eval runner|guardrail/i;

function unconditionalAgentLines(text, { skipSection } = {}) {
  let lines = text.split("\n");
  if (skipSection) {
    const start = lines.findIndex((l) => l.trim() === skipSection);
    assert.ok(start >= 0, `expected heading "${skipSection}"`);
    const level = skipSection.match(/^#+/)[0].length;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      const h = lines[i].match(/^(#+)\s/);
      if (h && h[1].length <= level) {
        end = i;
        break;
      }
    }
    lines = lines.slice(0, start).concat(lines.slice(end));
  }
  return lines.filter((l) => AGENT_LINE.test(l) && !l.trim().startsWith("|") && !l.includes(YES));
}

test("NFR-1: /akili-specify — outside AI Agent Mode, every agent line is conditional on `AI Agent: yes`", () => {
  assert.deepEqual(unconditionalAgentLines(specifyText(), { skipSection: AGENT_MODE }), []);
});

test("NFR-1: /akili-specify — inside AI Agent Mode only item 1 is unconditional, and it only records the row", () => {
  const sec = specifyMode();
  const item1 = numberedItem(sec, 1);
  assert.ok(
    !/ai-agent-development|Guardrails|Evals|eval-gate|monitoring/i.test(item1),
    `item 1 (the NFR-1 carve-out) must only detect and record: ${item1}`
  );
  const intro = sec.split("\n").filter((l) => l.trim() !== "" && !/^\d+\. /.test(l)).join(" ");
  has(intro, "Item 1 runs on every spec and only records the row", "NFR-1 carve-out");
  has(intro, "items 2-6 apply only when `AI Agent: yes`", "NFR-1 conditional");
});

test("NFR-1: /akili-test — every agent line is conditional on `AI Agent: yes`", () => {
  assert.deepEqual(unconditionalAgentLines(testText()), []);
});

test("NFR-1: /akili-validate — every agent line is conditional on `AI Agent: yes`", () => {
  assert.deepEqual(unconditionalAgentLines(validateText()), []);
});

test("NFR-1: /akili-validate — the ladder table sits directly under the `AI Agent: yes` gate header (no table row stands alone)", () => {
  const lines = validatePhase4().split("\n");
  const header = lines.findIndex((l) => l.startsWith(gateHeader));
  const firstRow = lines.findIndex((l, i) => i > header && l.startsWith("|"));
  assert.ok(header >= 0 && firstRow > header);
  assert.deepEqual(
    lines.slice(header + 1, firstRow).filter((l) => l.trim() !== "" && !l.startsWith("|")),
    [],
    "only blank lines may sit between the conditional header and the ladder"
  );
});

// ---------------------------------------------------------------------------
// FR-8 — the two references, their Sources and maturity markers; router rows
// ---------------------------------------------------------------------------

for (const [name, file] of [
  ["guardrails.md", GUARDRAILS],
  ["evals.md", EVALS],
]) {
  test(`FR-8: references/${name} is present and non-empty`, () => {
    assert.ok(fs.existsSync(file), `expected ${file}`);
    assert.ok(read(file).trim().length > 0);
  });

  test(`FR-8 / NFR-2: references/${name} has a ## Sources section of numbered https entries`, () => {
    const body = section(read(file), "## Sources");
    const entries = body.split("\n").filter((l) => /^\d+\. .*https:\/\//.test(l));
    assert.ok(entries.length >= 1, `expected numbered https entries under ## Sources in ${name}`);
  });

  test(`FR-8 / NFR-3: references/${name} carries at least one \`> Unvalidated:\` marker above its Sources`, () => {
    const text = read(file);
    const before = text.slice(0, text.indexOf("\n## Sources"));
    const markers = before.split("\n").filter((l) => l.startsWith("> Unvalidated:"));
    assert.ok(markers.length >= 1, `expected "> Unvalidated:" markers in ${name}`);
  });
}

test("FR-8: SKILL.md router lists guardrails.md and evals.md rows in the References table", () => {
  const sec = section(read(SKILL_MD), "## References — load per task");
  const g = lineStarting(sec, "| `references/guardrails.md` |");
  has(g, "Building guardrails for an agent feature", "router guardrails row");
  const e = lineStarting(sec, "| `references/evals.md` |");
  has(e, "Designing evals for an agent feature", "router evals row");
});

test("FR-8 BUT: this test file never reads the active spec folder", () => {
  const self = fs.readFileSync(__filename, "utf8");
  assert.ok(!self.includes("docs/specs/" + "changes/"), "a shipped test must not reference the active spec path");
});

"use strict";

// @akili-spec changes/video-production-hardening — static contract tests for
// the command, persona and skill text T6–T13 changed (requirements.md FR-6..FR-9,
// FR-11..FR-13, FR-15..FR-17, NFR-1, NFR-6; design.md §8.4, §8.5, DD-4, DD-11).
//
// The shipped artifacts ARE prose an agent follows, so each contract locates
// its section (heading to next heading, code fences skipped) or its bullet /
// paragraph first, then asserts inside it — never "anywhere in the file".
//
// Falsifier hook: COMMAND_CONTRACTS_TEST_ROOT points the tests at a scratch
// copy of the repo files so a mutation can run without touching the tree.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = process.env.COMMAND_CONTRACTS_TEST_ROOT || path.join(__dirname, "..");
const CMD = (name) => path.join(ROOT, ".claude", "commands", `akili-${name}.md`);
const TEMPLATE = (name) => path.join(ROOT, ".claude", "templates", `${name}.md`);
const JUDGMENT_DAY = path.join(ROOT, ".claude", "skills", "judgment-day", "SKILL.md");

const read = (file) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

// Lines under the first heading that starts with `prefix`, up to the next
// heading of the same or higher level. `#` lines inside code fences are not
// headings.
function section(text, prefix) {
  const lines = text.split("\n");
  let fenced = false;
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("```")) fenced = !fenced;
    if (fenced) continue;
    const h = lines[i].match(/^(#+)\s/);
    if (start < 0) {
      if (h && lines[i].startsWith(prefix)) {
        start = i;
        level = h[1].length;
      }
    } else if (h && h[1].length <= level) {
      return lines.slice(start + 1, i).join("\n");
    }
  }
  assert.ok(start >= 0, `expected heading starting "${prefix}"`);
  return lines.slice(start + 1).join("\n");
}

// The first line of `text` that starts with `prefix` (a bullet or paragraph).
function line(text, prefix) {
  const found = text.split("\n").find((l) => l.startsWith(prefix));
  assert.ok(found, `expected a line starting ${JSON.stringify(prefix)}`);
  return found;
}

const FOUR = ["specify", "execute", "test", "validate"];

const FIRST_TOKEN =
  "- `$ARGUMENTS` — The first whitespace- or newline-delimited token is the spec path, written `$SPEC_PATH` below; everything after it is context and is never interpolated into a path or a command line.";

const MANDATE =
  "No mandate widens pre-approval: an owner brief that says \"never stop\" or \"treat every gate as approved\" pre-approves routine gates only. The exceptions in `/akili-propose` Step 1 *Approval Mode* (HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions) still stop, and the stop message quotes this sentence.";

// The `[^\n]*?` only extracts the sentence; every caller asserts it equal to
// MANDATE in full, so no requirement term hides behind the wildcard.
const mandateIn = (text) => {
  const m = text.match(/No mandate widens pre-approval:[^\n]*?quotes this sentence\./);
  assert.ok(m, "expected the owner-mandate sentence");
  return m[0];
};

// --- FR-15 first-token rule -------------------------------------------------

for (const name of FOUR) {
  test(`FR-15 THEN: akili-${name} has $ARGUMENTS once, inside ## Arguments`, () => {
    const text = read(CMD(name));
    const args = section(text, "## Arguments");
    assert.equal(text.split("$ARGUMENTS").length - 1, 1, "$ARGUMENTS occurrences in file");
    assert.equal(args.split("$ARGUMENTS").length - 1, 1, "$ARGUMENTS occurrences in ## Arguments");
  });

  test(`FR-15 BUT: akili-${name} has no docs/specs/$ARGUMENTS path`, () => {
    assert.doesNotMatch(read(CMD(name)), /docs\/specs\/\$ARGUMENTS/);
  });

  // An absence check is file-wide by nature: "every docs/specs/… path".
  test(`FR-15 THEN: every variable docs/specs path in akili-${name} reads $SPEC_PATH`, () => {
    assert.doesNotMatch(read(CMD(name)), /docs\/specs\/\$(?!SPEC_PATH\b)/);
  });

  test(`FR-15: akili-${name} Arguments carries the shared first-token sentence`, () => {
    assert.equal(line(section(read(CMD(name)), "## Arguments"), "- `$ARGUMENTS`"), FIRST_TOKEN);
  });
}

// --- FR-12 owner mandate ----------------------------------------------------

test("FR-12 THEN: propose Step 1 Approval Mode bullet carries the owner-mandate sentence", () => {
  const step1 = section(read(CMD("propose")), "### Step 1: Classify");
  assert.equal(mandateIn(line(step1, "- No mandate widens")), MANDATE);
});

test("FR-12 AND: propose bullet quotes the owner's mandate in Document Control", () => {
  const step1 = section(read(CMD("propose")), "### Step 1: Classify");
  assert.match(line(step1, "- No mandate widens"), /Quote the owner's mandate wording in Document Control beside the `Approval Mode` row\./);
});

test("FR-12 THEN: execute Budget Tripwire bullet carries the identical sentence, tripwire never auto-approved", () => {
  const guard = section(read(CMD("execute")), "#### 2.4");
  const bullet = line(guard, "- **Budget Tripwire:**");
  assert.equal(mandateIn(bullet), MANDATE);
  assert.match(bullet, /The tripwire is never logged `auto-approved`\./);
});

test("FR-12 THEN: execute Step 5 Approval Mode paragraph carries the identical sentence", () => {
  const step5 = section(read(CMD("execute")), "### Step 5");
  const para = line(step5, "**Approval Mode (inherited");
  assert.equal(mandateIn(para), MANDATE);
  assert.match(para, /A tripwire stop is never logged `auto-approved`\./);
});

// --- FR-13 ceiling rung -----------------------------------------------------

test("FR-13 BUT: execute loop pseudo-code names the tier ceiling, no bump and no `max`", () => {
  const step2 = section(read(CMD("execute")), "### Step 2: Execute Task");
  const comment = line(step2, "    # already at the tier ceiling");
  assert.match(comment, /\(xhigh on T2\) before this retry: no bump, no `max` — apply the ceiling rung \(Loop Rules\)/);
});

test("FR-13 THEN: Effort Ceiling bullet escalates with a distinct auditor, T3 at xhigh, both recorded", () => {
  const bullet = line(section(read(CMD("execute")), "#### 2.4"), "- **Effort Ceiling:**");
  assert.match(bullet, /`xhigh` on T2, because `max` is barred on a cheaper tier/);
  assert.match(bullet, /\*\*escalate with a distinct auditor\*\* when a Reviewer model exists that differs from the T3 pick/);
  assert.match(bullet, /and is at least as strong — the registry's frontier escalation pin when the host has one, or cross-host dispatch:/);
  assert.match(bullet, /move the Implementer to T3 at `xhigh` and the Reviewer to that distinct model, and record both/);
  assert.match(bullet, /never route the Reviewer to a weaker model than the escalated Implementer/);
});

test("FR-13 BUT: Effort Ceiling rung fires only at the ceiling, not on the default medium start", () => {
  const bullet = line(section(read(CMD("execute")), "#### 2.4"), "- **Effort Ceiling:**");
  assert.match(bullet, /on the default `medium` start attempt 3 runs at `xhigh` and the rung never fires/);
});

test("FR-13 THEN/BUT/AND: with no distinct Reviewer the rung holds xhigh, never shares a model, ceiling stays 3", () => {
  const bullet = line(section(read(CMD("execute")), "#### 2.4"), "- **Effort Ceiling:**");
  assert.match(bullet, /\*\*Otherwise hold:\*\* keep T2 at `xhigh` as a fresh Implementer spawn carrying the full Attempt History/);
  assert.match(bullet, /never letting Implementer and Reviewer share a model/);
  assert.match(bullet, /record `effort ceiling: held xhigh` in the entry/);
  assert.match(bullet, /The rung never changes the \*\*3-attempt\*\* ceiling\./);
});

test("FR-13: leader template instructions 3 and 4 point at the ceiling rung and the tier ceiling", () => {
  const text = read(TEMPLATE("leader"));
  assert.match(line(text, "   * **You also set the effort per task**"), /On a rework retry, take `\/akili-execute`'s ceiling rung\./);
  assert.match(line(text, "   * Run the loop exactly as"), /effort bumped one level per retry, up to the tier's ceiling/);
});

// --- FR-11 Tester model MUST ------------------------------------------------

test("FR-11 rule text: akili-test tier note says MUST differ and no longer says Prefer", () => {
  const note = line(read(CMD("test")), "> **Recommended model tier:**");
  assert.match(note, /its \*model\* MUST differ from every Implementer model that wrote the code under test/);
  assert.doesNotMatch(note, /[Pp]refer/);
});

test("FR-11 THEN: Tester model rule names the Implementer-model sources and the resolve order", () => {
  const harness = section(read(CMD("test")), "## Multi-Agent Harness");
  const rule = line(harness, "**Tester model rule (MUST, every host, every spawn):**");
  assert.match(rule, /^\*\*Tester model rule \(MUST, every host, every spawn\):\*\* the Tester's model MUST be none of the Implementer models that wrote the code under test\./);
  assert.match(rule, /the registry's T2 pick or the `akili-implementer` wrapper's `model` binding, plus every model escalation recorded in `execution\.md`/);
  assert.match(harness, /^1\. Use the `akili-tester` wrapper when its model is none of the Implementer models\.$/m);
  assert.match(harness, /^2\. Otherwise spawn the Tester on another model the host offers/m);
  assert.match(harness, /^3\. Otherwise use the registry's cross-host dispatch\.$/m);
});

test("FR-11 AND IT MUST: the no-distinct-model stop is never auto-passed under pre-approved", () => {
  const harness = section(read(CMD("test")), "## Multi-Agent Harness");
  const stop = line(harness, "4. Otherwise **stop**");
  assert.match(stop, /^4\. Otherwise \*\*stop\*\* and tell the user no distinct Tester model is available\./);
  assert.match(stop, /This stop is an exception: it is never auto-passed under `pre-approved`, joining the HALT, Pivot, budget tripwire, `FATAL_FAIL`, and `PRODUCT_BUG` exceptions\./);
});

test("FR-11 BUT: Run inline row applies only when the Leader's model is not an Implementer model", () => {
  const harness = section(read(CMD("test")), "## Multi-Agent Harness");
  const row = line(harness, "| Lite depth, or a single trivial suite");
  assert.match(row, /but only when the Leader's own model is not among the Implementer models \(see the \*Tester model rule\*\); otherwise delegate/);
});

test("FR-11 rule text: leader template test-harness item 2 is MUST, not a preference", () => {
  const harness = section(read(TEMPLATE("leader")), "## 🧪 When Orchestrating `/akili-test`");
  const item = line(harness, "2. **author ≠ tester:**");
  assert.match(item, /the Tester's model MUST differ from every Implementer model \(`\/akili-test` names the sources and the stop\)/);
  assert.doesNotMatch(item, /preference/);
});

test("FR-11 rule text: tester template tier note runs on a different model, guaranteed by the Leader", () => {
  const note = line(read(TEMPLATE("tester")), "> **Recommended model tier:**");
  assert.match(note, /The Tester runs on a \*\*model different from the Implementer's\*\*, which the Leader guarantees/);
  assert.doesNotMatch(note, /prefer/);
});

// --- FR-8 video report sections --------------------------------------------

test("FR-8 THEN/BUT/AND: Phase 4 swaps sections 3-6 for the video sections, no n/a software sections, mixed specs keep theirs", () => {
  const phase4 = section(read(CMD("test")), "### Phase 4");
  const para = line(phase4, "**Video deliverable (`Deliverable: video`):**");
  assert.match(para, /sections 3–6 are replaced by \*\*Render Evidence\*\* \(the evidence-set table\), /);
  assert.match(para, /\*\*Final-look pending\*\* \(what only the final look can decide\), /);
  assert.match(para, /\*\*Deferred suspicions\*\* \(a Tester's suspected visual issues, each with timestamp and still path\)\./);
  assert.match(para, /Never carry Backend Unit, Frontend Unit, Integration, or E2E sections marked n\/a\./);
  assert.match(para, /A spec that also has software suites keeps those suites' sections alongside the video ones\./);
});

// --- FR-6 Delivery ----------------------------------------------------------

test("FR-6 Deferred THEN/AND IT MUST/BUT: validate skips the delivery render, keeps the final look, never reports a render", () => {
  const phase6 = section(read(CMD("validate")), "### Phase 6");
  const para = line(phase6, "**Delivery render (when `Deliverable: video`):**");
  assert.match(para, /When `requirements\.md` records `Delivery: deferred`, skip the delivery render but keep the final look in full: it still runs on the draft render and still gates PASS\./);
  assert.match(para, /Record `Delivery: deferred — final look on draft render <path>` in the report, which never states the delivery render ran\./);
});

test("FR-6 Default: validate reads an absent or unrecognized Delivery as render", () => {
  const phase6 = section(read(CMD("validate")), "### Phase 6");
  const para = line(phase6, "**Delivery render (when `Deliverable: video`):**");
  assert.match(para, /^\*\*Delivery render \(when `Deliverable: video`\):\*\* only after the final look is approved, run the local `render --quality delivery`/);
  assert.match(para, /A `Delivery` value other than `render` or `deferred` is read as `render` and reported in the validation report as an unrecognized value; an absent row means `render`\./);
});

test("FR-6 Recorded downstream: propose Step 2 item 1 records Delivery beside Deliverable", () => {
  const step2 = section(read(CMD("propose")), "### Step 2: Write `proposal.md`");
  const item = line(step2, "1. Document Control");
  assert.match(item, /for `Deliverable: video` also `Delivery: render \| deferred`, default `render`, where `deferred` means `\/akili-validate` does the final look on the draft render and does not run the delivery render/);
});

test("FR-6 Recorded downstream: specify Video Mode copies the Delivery row beside Deliverable", () => {
  const mode = section(read(CMD("specify")), "### Video Mode");
  assert.match(line(mode, "- **Copy the `Delivery` row**"), /^- \*\*Copy the `Delivery` row\*\* \(`render \| deferred`\) from the proposal into `requirements\.md` Document Control, beside `Deliverable`, for the same reason: `\/akili-validate` reads it there\. An absent row means `render`\.$/);
});

// --- FR-7 Deliverable Outline ----------------------------------------------

test("FR-7 THEN/BUT: propose Step 2 item 9 names the Outline for video Changes, Bug track keeps its diagnosis", () => {
  const step2 = section(read(CMD("propose")), "### Step 2: Write `proposal.md`");
  const item = line(step2, "9. **Bug Diagnosis**");
  assert.match(item, /\*\*Deliverable Outline\*\* \(Change track with `Deliverable: video`\)/);
  assert.match(item, /\*or\* \*\*Requirement Delta Preview\*\* \(any other Change\)/);
});

test("FR-7 BUT/AND: Deliverable Outline section never carries a delta preview and leaves the Bug track unchanged", () => {
  const outline = section(read(CMD("propose")), "### Deliverable Outline (Change track");
  assert.match(outline, /For a Change with `Deliverable: video`, section 9 is a \*\*Deliverable Outline\*\* in place of the Requirement Delta Preview;/);
  assert.match(outline, /it never also carries an ADDED\/MODIFIED\/REMOVED preview/);
  assert.match(outline, /The Bug track keeps its Bug Diagnosis, unchanged\./);
});

test("FR-7 THEN: Outline defines beats, assets, constraints including Delivery", () => {
  const outline = section(read(CMD("propose")), "### Deliverable Outline (Change track");
  assert.match(outline, /^### Beats\n\| Time \| Content \| Intent \|$/m);
  assert.match(outline, /^### Assets\n\| Asset \| Source \| License \/ Owner \|$/m);
  assert.match(outline, /^### Constraints\n- Duration, format, brand, and delivery \(`Delivery: render \| deferred`, as recorded in Document Control\)\.$/m);
});

test("FR-7 Specify converts: specify Step 1.2 converts the Outline into criteria, no delta to convert", () => {
  const step12 = section(read(CMD("specify")), "#### Step 1.2");
  const para = line(step12, "If the proposal instead carries a **Deliverable Outline**");
  assert.match(para, /beats become acceptance criterion 6 and the beat table, assets become criterion 9 and the evidence plan, constraints become criteria 1–4 and 10 and the `Delivery` row/);
  assert.match(para, /The Outline replaces the Delta, so there is no delta to convert\./);
});

test("FR-7: propose Review Checklist asserts Outline, no delta preview, Delivery recorded", () => {
  const checklist = section(read(CMD("propose")), "## Review Checklist");
  assert.match(line(checklist, "- [ ] For `Deliverable: video` on the Change track"), /section 9 is the Deliverable Outline \(beats, assets, constraints\), with no delta preview; `Delivery` is recorded beside `Deliverable`\./);
});

// --- FR-9 greenfield --------------------------------------------------------

test("FR-9 THEN: Step 3.2 field list lets Red run read predicted — greenfield artifact", () => {
  const step32 = section(read(CMD("specify")), "#### Step 3.2");
  assert.match(line(step32, "- verification fields"), /For a greenfield artifact only, `Red run` may read `predicted — greenfield artifact \(observed in <task>\)`, and that task's Done criteria carry the obligation \(Falsifiability item 8\)/);
});

test("FR-9 AND IT MUST: Falsifiability item 8 requires the red observed and quoted in execution.md", () => {
  const item = line(section(read(CMD("specify")), "#### Step 3.2"), "  8. **Executed, not predicted**");
  assert.match(item, /\*\*Greenfield exception:\*\* when the falsifier's target does not exist at specify time/);
  assert.match(item, /write `predicted — greenfield artifact \(observed in <task>\)` and name the task that creates the artifact\./);
  assert.match(item, /That task's `Red run` field and Done criteria require the red observed and quoted verbatim in its `execution\.md` entry before the task closes \(`\/akili-execute` enforces it, the Reviewer audits the quoted red\)/);
  assert.match(item, /a red that differs from the prediction is recorded as the observed value/);
});

test("FR-9 BUT: the greenfield exception never applies to an existing target", () => {
  const item = line(section(read(CMD("specify")), "#### Step 3.2"), "  8. **Executed, not predicted**");
  assert.match(item, /It never applies to a falsifier whose target exists at specify time\./);
});

test("FR-9: Verification Checklist carries the greenfield clause", () => {
  const checklist = section(read(CMD("specify")), "## Verification Checklist");
  assert.match(line(checklist, "- [ ] Every task carries the four verification fields"), /except a `predicted — greenfield artifact \(observed in <task>\)` entry whose observing task requires the quoted red in `execution\.md`/);
});

// --- FR-12 video multiplier -------------------------------------------------

test("FR-12 Video multiplier THEN/BUT: Step 2.4 multiplies guard code 2-3x for video, software takes no factor", () => {
  const step24 = section(read(CMD("specify")), "#### Step 2.4");
  const para = line(step24, "**Video gate multiplier.**");
  assert.match(para, /When `Deliverable: video`, estimate guard\/gate code \(check scripts, falsifier harnesses, parity tools\) at 2–3× its first estimate and record the factor beside the number in the budget\./);
  assert.match(para, /A `software` spec takes no factor\./);
});

// --- FR-16 literal path / source skip --------------------------------------

test("FR-16 Literal path THEN: a mandated literal path for a bare slug wins and is recorded", () => {
  const args = section(read(CMD("propose")), "## Arguments");
  const bullet = line(args, "- If the first token is a bare kebab-case name");
  assert.match(bullet, /unless the brief mandates a literal path for that bare slug \(e\.g\. `docs\/specs\/<slug>\/`\): the mandated path wins, and Document Control records `Spec Path: <path> — literal path mandated by the brief`\./);
});

test("FR-16 Source supplied THEN: pre-approved skips both questions when the brief names both sources and logs it", () => {
  const step11 = section(read(CMD("propose")), "### Step 1.1");
  const para = line(step11, "**Skip under `pre-approved`, only when the brief supplies the source.**");
  assert.match(para, /when the brief names the requirement source \*\*and\*\* the visual source \(or says there is none\), skip both questions and log in Document Control `source questions skipped — supplied by the brief \(pre-approved mode\)`\./);
});

test("FR-16 Source supplied BUT: never skipped under gated, or when the brief is silent on either source", () => {
  const step11 = section(read(CMD("propose")), "### Step 1.1");
  const para = line(step11, "**Skip under `pre-approved`, only when the brief supplies the source.**");
  assert.match(para, /Never skip them under `gated`, or when the brief is silent on either source\./);
});

// --- FR-17 fixed, not re-judged --------------------------------------------

test("FR-17 THEN/BUT: specify Approval Mode paragraph records Fix only as fixed, not re-judged, never APPROVED, severe still stops", () => {
  const mode = section(read(CMD("specify")), "### Approval Mode (inherited)");
  const para = line(mode, "Read `Approval Mode` from the proposal's Document Control");
  assert.match(para, /A design corrected with \*\*Fix only\*\* \(Step 2\.5\) is never recorded as `JUDGMENT: APPROVED`: `judgment\.md` closes with the annotation `fixed, not re-judged` and the fixed finding IDs, and severe findings still stop under `pre-approved`\./);
});

test("FR-17 THEN: specify Step 2.5 Fix only menu entry closes with fixed, not re-judged", () => {
  const step25 = section(read(CMD("specify")), "#### Step 2.5");
  assert.match(line(step25, "2. **Fix only**"), /`judgment\.md` closes with `fixed, not re-judged` and the fixed finding IDs, never `JUDGMENT: APPROVED`/);
});

test("FR-17 judgment-day: AKILI integration annotates the corrected target, terminal states unchanged", () => {
  const integration = section(read(JUDGMENT_DAY), "## AKILI-SPECS Integration");
  const bullet = line(integration, "- Under AKILI `pre-approved` the review still runs.");
  assert.match(bullet, /closes `judgment\.md` with the AKILI annotation `fixed, not re-judged` plus the fixed finding IDs, never `JUDGMENT: APPROVED`/);
  assert.match(bullet, /this skill's terminal states stay unchanged/);
});

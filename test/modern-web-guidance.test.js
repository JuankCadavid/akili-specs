"use strict";

// @akili-spec changes/modern-web-guidance — static contract tests.
// Section: rules file. One assertion per clause of
// .claude/skills/impeccable-bridge/references/modern-web.md (FR-4, FR-5, FR-6,
// FR-7, FR-10, design §8.1, DD-5..DD-8, DD-14, DD-15, T1 F-2/F-3/F-5).
//
// The rules file is prose an agent follows, so each test reads the SHIPPED file
// and finds the clause inside its named section (by heading text, never by line
// number). Nothing here asserts on a fragment authored in the test.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RULES = path.join(ROOT, ".claude", "skills", "impeccable-bridge", "references", "modern-web.md");

const read = (file) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const rules = () => read(RULES);

// Text under a `## ` heading, up to the next `## ` heading.
function section(text, heading) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.trim() === heading);
  assert.ok(start >= 0, `expected heading "${heading}" in modern-web.md`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

// The table row of `sec` whose first cell is exactly `cell`.
function row(sec, cell) {
  const found = sec.split("\n").find((l) => l.startsWith(`| ${cell} |`));
  assert.ok(found, `expected a table row starting "| ${cell} |"`);
  return found;
}

const SECTIONS = [
  "## Role",
  "## How it is reached",
  "## Gate",
  "## Pin",
  "## Call forms",
  "## Untrusted output",
  "## In a task",
  "## Test and validate reads",
  "## Disclosure",
  "## Audit scan",
  "## Install routes",
  "## Outside this gate",
  "## Attribution",
];

const STATES = [
  ["`missing`", "MWG — not run: skill not installed"],
  ["`node < 22`", "MWG — not run: Node <v> (needs ≥ 22)"],
  ["`consent needed`", null],
  ["`declined`", "MWG — not run: declined"],
  ["`ready`", "MWG — ready: pin <v> (<default\\|skill-map>), telemetry <off\\|on (opted in)>"],
  ["`call failed`", "MWG — not run: call failed (<first stderr line>)"],
];

test("modern-web.md rules file: the 13 sections ship, in order", () => {
  const headings = rules()
    .split("\n")
    .filter((l) => /^## /.test(l));
  assert.deepStrictEqual(headings, SECTIONS);
});

test("modern-web.md rules file (FR-4 Gate): six state heads, each with its report line; every one but ready carries `not run:`", () => {
  const gate = section(rules(), "## Gate");
  for (const [state, line] of STATES) {
    const r = row(gate, state);
    if (line) assert.ok(r.includes("`" + line + "`"), `${state} report line "${line}"`);
    if (state !== "`ready`" && state !== "`consent needed`") assert.ok(r.includes("not run:"), `${state} row carries "not run:"`);
  }
  assert.ok(!row(gate, "`ready`").includes("not run:"), "ready row has no `not run:`");
});

test("modern-web.md rules file (FR-4 Gate): the gate records exactly one state per phase; call failed is the state when a call fails after ready", () => {
  const gate = section(rules(), "## Gate");
  assert.match(gate, /The gate records exactly one state per phase in the phase's report/);
  assert.match(gate, /when a call fails after `ready`, `call failed` is the state recorded/);
  assert.ok(!/recorded exactly once/i.test(gate), "no per-state frequency rewording");
});

test("modern-web.md rules file (design §8.5, FR-10): install routes are printed, never run by AKILI", () => {
  const sec = section(rules(), "## Install routes");
  assert.match(row(sec, "Any"), /printed for the user to run, AKILI never runs it/);
  assert.match(sec, /no other gate state prints them/);
});

test("modern-web.md rules file (DD-5): the five states that are not ready continue", () => {
  const gate = section(rules(), "## Gate");
  for (const state of ["`missing`", "`node < 22`", "`declined`", "`call failed`"]) {
    assert.match(row(gate, state), /continue/i, `${state} continues`);
  }
  // consent needed continues into ready or declined; the section also bars any stop.
  assert.match(row(gate, "`consent needed`"), /`declined`/);
  assert.match(gate, /No state stops, fails or blocks/);
  assert.ok(!/\bstop\b/i.test(["`missing`", "`node < 22`", "`declined`", "`call failed`"].map((s) => row(gate, s)).join("\n")), "no non-ready row says stop");
});

test("modern-web.md rules file (FR-4 BUT): no npx before consent", () => {
  const r = rules();
  assert.match(section(r, "## Gate"), /Probing never calls `npx`, so nothing is fetched before consent/);
  assert.match(section(r, "## Call forms"), /Before consent no `npx` call is made at all/);
  assert.match(section(r, "## Call forms"), /`-y` only after consent/);
});

test("modern-web.md rules file (DD-6): no answer is declined; pre-approved is never consent; consent asked by the user-facing session", () => {
  const gate = section(rules(), "## Gate");
  assert.match(gate, /\*\*No answer is `declined`\.\*\*/);
  assert.match(gate, /\*\*A pre-approved approval mode is never consent\.\*\*/);
  assert.match(gate, /never by a subagent/);
  assert.match(row(gate, "`declined`"), /did not answer/);
});

test("modern-web.md rules file (FR-4 BUT): never fall back to an unpinned call", () => {
  const gate = section(rules(), "## Gate");
  assert.match(row(gate, "`call failed`"), /Never fall back to an unpinned call/);
  assert.match(gate, /\*\*Never fall back to an unpinned call\*\* after a failure/);
});

test("modern-web.md rules file (DD-14): the consent question names the fetch, the size and the Google telemetry AKILI turns off", () => {
  const gate = section(rules(), "## Gate");
  assert.match(gate, /npm fetch of `modern-web-guidance@<pin>` \(about 16\.7 MB unpacked\)/);
  assert.match(gate, /Google usage telemetry \(search queries, guide ids, agent name\), which AKILI turns off with `DISABLE_TELEMETRY=1` unless you opt in/);
});

test("modern-web.md rules file (FR-5, DD-7): default pin 1.0.1, Skill Map override token, precedence over upstream @latest", () => {
  const pin = section(rules(), "## Pin");
  assert.match(row(pin, "AKILI default"), /`1\.0\.1`/);
  assert.match(row(pin, "Project override"), /`pin <x\.y\.z>`.*Skill Map MWG row's \*When to load\* cell/);
  assert.match(row(pin, "Precedence"), /wins over upstream's own `@latest` for \*\*every\*\* AKILI-directed call/);
});

test("modern-web.md rules file (FR-5): pin grammar and the invalid-pin report line", () => {
  const pin = section(rules(), "## Pin");
  assert.match(row(pin, "Grammar"), /`MAJOR\.MINOR\.PATCH`, optionally followed by `-<prerelease>`/);
  const invalid = row(pin, "Invalid value");
  for (const bad of ["range", "`latest`", "`next`", "empty"]) assert.ok(invalid.includes(bad), `invalid pin kind ${bad}`);
  assert.ok(invalid.includes('`MWG — pin "<value>" invalid, using default <v>`'), "invalid-pin report line");
});

test("modern-web.md rules file (FR-5 BUT): the shipped file never contains the unpinned package string", () => {
  assert.ok(!rules().includes("modern-web-guidance@latest"), "no `modern-web-guidance@latest` in the rules file");
});

test("modern-web.md rules file (DD-14, FR-4 MUST): DISABLE_TELEMETRY=1 prefix on every call unless the user opted in", () => {
  const calls = section(rules(), "## Call forms");
  assert.match(row(calls, "`DISABLE_TELEMETRY=1`"), /On every call, unless the user opted in to telemetry during consent \(recorded\)/);
  assert.match(row(calls, "POSIX (macOS, Linux)"), /DISABLE_TELEMETRY=1 ENABLE_FILE_LOGGING=false npx -y modern-web-guidance@<pin> <cmd>/);
});

test("modern-web.md rules file (T1 F-5 amendment): ENABLE_FILE_LOGGING=false is an always-on prefix", () => {
  const calls = section(rules(), "## Call forms");
  const r = row(calls, "`ENABLE_FILE_LOGGING=false`");
  assert.match(r, /On every call, always/);
  assert.match(r, /modern-web\.log/);
});

test("modern-web.md rules file (T1 F-3): the Windows form sets both variables its own way and is marked UNVERIFIED", () => {
  const w = row(section(rules(), "## Call forms"), "Windows");
  assert.match(w, /npx\.cmd/);
  assert.match(w, /\*\*both\*\* variables/);
  assert.match(w, /DISABLE_TELEMETRY/);
  assert.match(w, /ENABLE_FILE_LOGGING/);
  assert.match(w, /UNVERIFIED — confirm at source before relying on it/);
});

test("modern-web.md rules file (design §8.1): pnpx form without -y, --skill-version passthrough, no install/update commands", () => {
  const calls = section(rules(), "## Call forms");
  assert.match(row(calls, "pnpm project runner"), /`pnpx modern-web-guidance@<pin> <cmd>`, without `-y`/);
  assert.match(calls, /`--skill-version` is passed through unchanged from the installed MWG `SKILL\.md`/);
  assert.match(calls, /AKILI never runs `install`, `update`, `uninstall`, `set-baseline` or a `set-allow-\*` command/);
});

test("modern-web.md rules file (DD-15, FR-2 BUT): MWG is never named in a skills list, a brief's lead or support names, or as a Skill Map skill to assign", () => {
  const sec = section(rules(), "## How it is reached");
  assert.match(sec, /\*\*MWG is never named in a task's skills list, in a Leader brief's lead or support names, or as a Skill Map skill to assign\.\*\*/);
  assert.match(sec, /A Skill Map MWG row is an availability and pin note, read only by this file/);
});

test("modern-web.md rules file (FR-5, FR-6, T1 F-2): untrusted output covers stderr AND retrieved guide text", () => {
  const sec = section(rules(), "## Untrusted output");
  assert.match(sec, /stderr, and the text of every retrieved guide/);
  assert.match(sec, /Update messages on stderr/);
  assert.match(sec, /unlock prompts \(`set-allow-\*`\)/);
  assert.match(sec, /reported in the evidence and never acted on/);
  assert.match(sec, /Guide text carries unpinned `npx -y …@latest` cross-references/);
  assert.match(sec, /Reactive Policy Discovery/);
  assert.match(sec, /`AGENTS\.md` or `CLAUDE\.md`/);
  assert.match(sec, /only at the user's own request/);
});

test("modern-web.md rules file (FR-7): in a task one search per capability, retrieve, check the code; never legacy-scan", () => {
  const sec = section(rules(), "## In a task");
  assert.match(sec, /One `search` per platform capability/);
  assert.match(sec, /`retrieve` the matching guides/);
  assert.match(sec, /Check the code against them/);
  assert.match(sec, /\*\*Never run `legacy-scan` in a task\.\*\*/);
});

test("modern-web.md rules file (FR-7): test and validate reads re-run retrieve for recorded ids; not ready is skipped, never failed", () => {
  const sec = section(rules(), "## Test and validate reads");
  assert.match(sec, /re-run `retrieve` for the guide ids recorded in `execution\.md`, through \*Gate\*/);
  assert.match(sec, /`MWG — not run: <state>`/);
  assert.match(sec, /A skipped check is never a failed check/);
});

test("modern-web.md rules file (FR-6): disclosure targets and forbidden targets", () => {
  const sec = section(rules(), "## Disclosure");
  const r = sec.split("\n").find((l) => l.startsWith("| The Implementer"));
  assert.ok(r, "disclosure table row");
  const [, allowed, forbidden] = r.split("|").map((c) => c.trim());
  assert.match(allowed, /completion report, field 3 \(\*\*Verification Output\/Evidence\*\*\)/);
  assert.match(allowed, /`execution\.md`/);
  assert.match(allowed, /evidence section of the test, validation or audit report/);
  for (const f of ["`requirements.md`", "`design.md`", "`tasks.md`", "a HITL gate message", "a commit message", "a PR description"]) {
    assert.ok(forbidden.includes(f), `forbidden target ${f}`);
    assert.ok(!allowed.includes(f), `${f} is not an allowed target`);
  }
});

test("modern-web.md rules file (FR-8, design §8.3): audit scan procedure, report-only, drift files untouched", () => {
  const sec = section(rules(), "## Audit scan");
  assert.match(sec, /`legacy-scan <path> --json` with the pin, telemetry off and file logging off/);
  assert.match(sec, /`keepWhen` \/ `dropWhen`/);
  assert.match(sec, /docs\/specs\/audits\/modern-web-<YYYY-MM-DD>\[-<safe-branch>\]\[-N\]\.md/);
  assert.match(sec, /about 20%/);
  assert.match(sec, /`\/akili-quick` when trivial, `\/akili-propose` when grouped/);
  assert.match(sec, /Upstream's \*Modernize\* step is never run/);
  assert.match(sec, /Findings never become tasks of a running spec/);
  assert.match(sec, /read only `drift-\*\.md`/);
  assert.ok(!/outside `docs\/specs\/audits\/`/.test(sec), "P-22 wording constraint");
});

test("modern-web.md rules file (FR-10): route table rows; Grok Bot absent; Cursor and OpenCode marked unverified", () => {
  const r = rules();
  const sec = section(r, "## Install routes");
  assert.match(row(sec, "Claude Code"), /\/plugin marketplace add GoogleChrome\/modern-web-guidance.*\/plugin install modern-web-guidance@googlechrome.*Verified/);
  assert.match(row(sec, "Codex"), /codex plugin marketplace add GoogleChrome\/modern-web-guidance.*codex plugin add modern-web-guidance@googlechrome.*Verified/);
  assert.match(row(sec, "Antigravity"), /agy plugin install https:\/\/github\.com\/GoogleChrome\/modern-web-guidance.*Verified/);
  for (const host of ["Cursor", "OpenCode"]) {
    assert.match(row(sec, host), /npx skills add GoogleChrome\/modern-web-guidance/);
    assert.match(row(sec, host), /Unverified for this host/);
  }
  assert.match(row(sec, "Any"), /npx modern-web-guidance@<pin> install/);
  assert.ok(!/grok/i.test(sec), "Grok Bot has no route row");
});

test("modern-web.md rules file (design §8.1): role, outside-this-gate and attribution", () => {
  const r = rules();
  assert.match(section(r, "## Role"), /\*\*never a lead\*\*/);
  assert.match(section(r, "## Role"), /ENV-3 native screen, backend task, non-UI task.*not loaded, its gate does not run, its install routes are not printed/);
  assert.match(section(r, "## Outside this gate"), /follows upstream behavior/);
  assert.match(section(r, "## Outside this gate"), /Disclosure \(outside this gate\)/);
  const a = section(r, "## Attribution");
  assert.match(a, /\(MIT\)/);
  assert.match(a, /Google Chrome \(Apache-2\.0/);
  assert.match(a, /not affiliated/);
});

// Table rows of the bridge's `## Roles` section, found by heading.
const BRIDGE_SKILL = path.join(ROOT, ".claude", "skills", "impeccable-bridge", "SKILL.md");
const rolesRow = () => row(section(read(BRIDGE_SKILL), "## Roles"), "`modern-web-guidance` (environment-provided)");

test("bridge entry (FR-2, design §3): the Roles row names modern-web-guidance as environment-provided, supporting, platform implementation for web UI", () => {
  const r = rolesRow();
  assert.match(r, /environment-provided/);
  assert.match(r, /Supporting/);
  assert.match(r, /platform implementation for web UI/);
});

test("bridge entry (FR-2 BUT): the Roles row names references/modern-web.md and says never loaded directly", () => {
  const r = rolesRow();
  assert.match(r, /`references\/modern-web\.md`/);
  assert.match(r, /never loaded directly/);
});

test("bridge entry (design §3): bridge version is 2.2", () => {
  assert.match(read(BRIDGE_SKILL), /^  version: "2\.2"$/m);
});

// ---- matrix (design §8.2, T4): design-routing.md edits, read from the shipped file ----
const MATRIX = path.join(ROOT, ".claude", "skills", "impeccable-bridge", "references", "design-routing.md");
const matrixText = () => read(MATRIX);
// Text under a heading of any level, up to the next heading of the same or a shallower level.
function mdSection(text, heading) {
  const m = new RegExp(`^(#+) ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").exec(text);
  assert.ok(m, `expected heading "${heading}" in design-routing.md`);
  const rest = text.slice(m.index + m[0].length);
  const next = new RegExp(`^#{1,${m[1].length}} `, "m").exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}
const cardMwg = () => row(mdSection(matrixText(), "Expertise cards"), "`modern-web-guidance` (environment-provided)");

test("matrix (FR-3): the card names the capabilities, supports web UI Platform guidance, and must not decide aesthetic, page mode, direction or framework idiom", () => {
  const c = cardMwg();
  for (const t of ["dialog", "popover", "anchor positioning", "container queries", "forms", "accessibility semantics", "Core Web Vitals"]) assert.ok(c.includes(t), `card names ${t}`);
  assert.match(c, /\*Platform guidance\* on web UI build-new, build-within-system and evaluate/);
  const cells = c.split("|").slice(1, -1).map((x) => x.trim());
  assert.equal(cells[3], "The aesthetic, page mode, direction or framework idiom", "must-not list");
  assert.equal(cells[4], "`impeccable-bridge/references/modern-web.md` → *Role*", "evidence");
});

test("matrix (FR-3, P-12): the card's evidence path resolves under .claude/skills/ and its heading exists", () => {
  assert.ok(fs.existsSync(path.join(ROOT, ".claude", "skills", "impeccable-bridge", "references", "modern-web.md")));
  assert.ok(rules().split("\n").includes("## Role"));
});

test("matrix (DD-4): MWG is never a lead: no matrix row cell names it; the Supporting line limits it to web UI cells and bars the skills list", () => {
  const rows = matrixText().split("\n").filter((l) => /^\| \*\*[a-z-]+\*\* \|/.test(l));
  assert.equal(rows.length, 8, "eight matrix rows, unchanged");
  for (const r of rows) assert.ok(!/modern-web|mwg/i.test(r), `no matrix cell names MWG: ${r.slice(0, 40)}`);
  const line = matrixText().split("\n").find((l) => l.startsWith("**Supporting line**"));
  assert.ok(line, "Supporting line present");
  assert.match(line, /`modern-web-guidance` on web UI cells only, when the route says `platform mwg`, reached through \*Platform guidance\* and never as a skills-list name/);
});

test("matrix (FR-3): the route form carries a sixth field naming the pin source, and the field table has Platform per ENV", () => {
  const sec = mdSection(matrixText(), "Design route line");
  const form = /`(Design route: [^`]+)`/.exec(sec)[1];
  assert.equal(form.split("; ").length, 7, "load segment + six fields");
  assert.ok(form.endsWith("; platform <mwg, pin <default|skill-map> | none — <reason>>"), "sixth field, with the pin source");
  const p = row(sec, "Platform");
  assert.match(p, /`mwg, pin default` or `mwg, pin skill-map` for a browser-rendered surface at ENV-0, ENV-1 or ENV-2/);
  assert.match(p, /`none — native` at ENV-3/);
  assert.match(p, /`none — <reason>` otherwise/);
});

test("matrix (DD-16, S-6): Platform guidance is its own section keyed on the route field, not the skill source; ENV-0 still runs it", () => {
  const m = matrixText();
  const pg = mdSection(m, "Platform guidance");
  assert.match(pg, /whatever the skill source/);
  assert.match(pg, /keyed on the route field, never on the skill source/);
  assert.match(pg, /`modern-web\.md` → \*Gate\*, then `modern-web\.md` → \*In a task\*/);
  assert.match(pg, /completion report/);
  // The section is a sibling after Build route, not text inside the skill-source-gated Build route.
  assert.ok(m.indexOf("\n## Platform guidance") > m.indexOf("\n## Build route"), "after Build route");
  const build = mdSection(m, "Build route");
  assert.ok(!build.includes("## Platform guidance"), "not inside Build route");
  assert.ok(build.includes("At ENV-0, *Platform guidance* still runs when the route says `platform mwg`; the `frontend-design` path is otherwise unchanged."), "ENV-0 sentence");
  assert.ok(build.includes("MWG report line"), "completion-report step names the MWG report line");
});

test("matrix (DD-16): in the shipped Build route, Platform guidance is step 4 and runs before the craft-floor read", () => {
  const build = mdSection(matrixText(), "Build route");
  const at = (needle) => {
    const i = build.indexOf(needle);
    assert.ok(i >= 0, `Build route has ${needle}`);
    return i;
  };
  assert.ok(at("4. **Platform guidance**") < at("5. **Craft floor.**"), "platform guidance before craft floor");
  assert.ok(at("5. **Craft floor.**") < at("7. **`polish`"), "craft floor before polish");
  assert.match(build, /4\. \*\*Platform guidance\*\* when the route says `platform mwg` \(section \*Platform guidance\*\)\./);
  assert.match(build, /8\. \*\*Completion report\.\*\*/);
  assert.match(mdSection(matrixText(), "Platform guidance"), /After the playbook load, before the craft-floor read/);
});

test("matrix (FR-6): the Done-criteria clause names the MWG report line and the disclosure", () => {
  const sec = mdSection(matrixText(), "Design route line");
  assert.ok(sec.includes("and, when the route says `platform mwg`, the MWG report line and the disclosure (`modern-web.md` → *Disclosure*)"));
});

// ---- governance (FR-2, DD-1, DD-13, DD-15) ----
const GOV = () => read(path.join(ROOT, "docs", "skills", "governance.md"));
const govRule = (n) => {
  const lines = GOV().split("\n");
  const start = lines.findIndex((l) => l.startsWith(`${n}. **`));
  assert.ok(start >= 0, `expected numbered rule ${n}`);
  const out = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\d+\. \*\*/.test(lines[i]) || lines[i].trim() === "") break;
    out.push(lines[i]);
  }
  return out.join(" ").replace(/\s+/g, " ");
};
const govEnvPara = () => GOV().split("\n\n").find((p) => p.includes("**Environment-provided skills are referenced, never vendored.**"));

test("governance (FR-2, DD-1): the environment-provided paragraph names MWG as Google Chrome, Apache-2.0, referenced and never vendored", () => {
  const p = govEnvPara().replace(/\s+/g, " ");
  assert.match(p, /`modern-web-guidance` \(Modern Web Guidance, Google Chrome, Apache-2\.0: referenced, never vendored/);
});

test("governance (FR-2): rule 4 names the three selectors and the bridge gate", () => {
  const r = govRule(4);
  assert.match(r, /\(1\) a spec's `Deliverable` row/);
  assert.match(r, /\(2\) a web UI task's route field `platform mwg`, including the same spec's `\/akili-test` and `\/akili-validate` reads/);
  assert.match(r, /\(3\) a command mode the user types \(`\/akili-audit modern-web`\)/);
  assert.match(r, /\(b\) that skill's own availability gate runs first, inside a packaged bridge/);
});

test("governance (FR-2): a Deliverable selector stops at the gate; the route and typed-mode selectors continue and report `not run`", () => {
  const r = govRule(4);
  assert.match(r, /a `Deliverable` selector \*\*stops\*\* at the gate/);
  assert.match(r, /a route or typed-mode selector \*\*continues\*\* without the skill and reports `not run`/);
  assert.match(govRule(2), /A route or typed-mode selector never narrows: it continues without the skill/);
});

test("governance (FR-2, DD-15): rule 4 bars an MWG skills-list, brief-name or Skill Map assignment", () => {
  const r = govRule(4);
  assert.match(r, /\*\*never a skills-list name\*\*: it is never named in a task's skills list, in a Leader brief's lead or support names, or as a Skill Map skill to assign or load/);
  assert.match(r, /A Skill Map row for it is an availability and pin note only/);
});

test("governance (FR-2, DD-1): MWG is not admitted to Vendored third-party (verbatim)", () => {
  const gov = GOV();
  const start = gov.indexOf("### Vendored third-party (verbatim)");
  const end = gov.indexOf("### Current assignment");
  assert.ok(start >= 0 && end > start, "vendored section bounds");
  const vendored = gov.slice(start, end);
  assert.doesNotMatch(vendored, /modern-web-guidance|Modern Web Guidance|MWG/);
  assert.match(vendored, /\*\*Current member: `impeccable`\*\*/);
});

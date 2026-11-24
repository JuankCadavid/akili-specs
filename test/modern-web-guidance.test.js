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
  assert.match(sec, /Check the code against them|check the built code against the retrieved guides/);
  assert.match(sec, /\*\*Never run `legacy-scan` in a task\.\*\*/);
});

test("modern-web.md rules file (FR-7, W-1): search and retrieve run before the UI edits, the check of the built code runs after them", () => {
  const sec = section(rules(), "## In a task");
  const at = (re) => {
    const m = re.exec(sec);
    assert.ok(m, `In a task lacks ${re}`);
    return m.index;
  };
  assert.doesNotMatch(sec, /[Cc]heck[^\n]*before the UI edits/, "the guide check must not be ordered before the UI edits");
  assert.ok(at(/One `search` per platform capability/) < at(/`retrieve` the matching guides/), "search before retrieve");
  assert.ok(at(/`retrieve` the matching guides/) < at(/Make the UI edits/), "retrieve before the UI edits");
  assert.ok(at(/Make the UI edits/) < at(/After the UI edits, check the built code against the retrieved guides \(upstream's \*Step 3\*\)/), "check after the UI edits");
  assert.ok(at(/After the UI edits, check the built code/) < at(/Record each guide id in the completion report/), "check before the disclosure");
});

test("matrix (FR-7, W-1): the Build route carries the after-edits guide check, before polish, with step numbering unchanged", () => {
  const build = mdSection(matrixText(), "Build route");
  assert.match(build, /\(section \*Platform guidance\*\): search and retrieve now; after the UI edits and before `polish` \(step 7\), check the built code against the retrieved guides\./);
  const pg = mdSection(matrixText(), "Platform guidance");
  assert.match(pg, /\*\*After the edits\.\*\* Once the UI edits are made and before `polish` \(\*Build route\* step 7\), check the built code against the retrieved guides/);
  assert.doesNotMatch(build + pg, /check the code against them[^.]*before the UI edits/i);
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
  assert.match(build, /4\. \*\*Platform guidance\*\* when the route says `platform mwg` \(section \*Platform guidance\*\)/);
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
  assert.match(vendored, /\*\*Current members:\*\*[\s\S]*- `impeccable` \(/);
});

// ---- specify (T6): the /akili-specify pointer bullet (FR-3, FR-7, FR-2 BUT, DD-15) ----

const SPECIFY_CMD = path.join(ROOT, ".claude", "commands", "akili-specify.md");

// The bullet of the "Preferred UI/UX skill rule:" block that names the platform field.
function specifyPlatformBullet() {
  const text = read(SPECIFY_CMD);
  const start = text.indexOf("Preferred UI/UX skill rule:");
  const end = text.indexOf("#### Step 3.3");
  assert.ok(start >= 0 && end > start, "Preferred UI/UX skill rule block bounds");
  const bullets = text.slice(start, end).split("\n").filter((l) => l.startsWith("- "));
  const hit = bullets.filter((l) => l.includes("`platform`"));
  assert.equal(hit.length, 1, "exactly one bullet names the platform field");
  return hit[0];
}

test("specify (FR-3, FR-7): the bullet points a web UI task's route at design-routing.md -> Design route line", () => {
  const b = specifyPlatformBullet();
  assert.match(b, /web UI task/);
  assert.match(b, /`design-routing\.md` → \*Design route line\*/);
});

test("specify (FR-2 BUT, DD-15): the bullet says modern-web-guidance is never added to a task's skills list", () => {
  assert.match(specifyPlatformBullet(), /`modern-web-guidance` is never added to a task's skills list/);
});

test("specify (NFR-3): the bullet copies no field table row and a non-web spec is unchanged (FR-7)", () => {
  const b = specifyPlatformBullet();
  assert.doesNotMatch(b, /\|/);
  assert.doesNotMatch(b, /mwg, pin (default|skill-map)/);
  assert.match(b, /no web UI task is unchanged in behavior \(no MWG gate/);
});

// ---- test (T7): the /akili-test pointer sentence (FR-7, NFR-3) ----

const TEST_CMD = path.join(ROOT, ".claude", "commands", "akili-test.md");

// Region after the design-detector state table, up to the rule before "## Testing Rules".
function testPointerRegion() {
  const text = read(TEST_CMD);
  const tbl = text.indexOf("| Engine `declined` / `unavailable` |");
  const end = text.indexOf("## Testing Rules");
  assert.ok(tbl >= 0 && end > tbl, "design-detector table and Testing Rules bounds");
  return text.slice(text.indexOf("\n", tbl), end);
}

test("test (FR-7): the sentence follows the table, names modern-web.md -> Test and validate reads and the recorded guide ids", () => {
  const r = testPointerRegion();
  assert.match(r, /When `execution\.md` records MWG guide ids/);
  assert.match(r, /frontend or E2E Tester/);
  assert.match(r, /source for platform assertions/);
  assert.match(r, /`modern-web\.md` → \*Test and validate reads\*/);
});

test("test (FR-7): not ready is recorded, never failed; the sentence copies no gate row and the table keeps five rows", () => {
  const r = testPointerRegion();
  assert.match(r, /other than `ready` is recorded, never failed/);
  assert.doesNotMatch(r, /\|/);
  const text = read(TEST_CMD);
  const rows = text.split("\n").filter((l) => /^\s*\| (Skill source|Engine) /.test(l));
  assert.equal(rows.length, 5);
});

// ---- validate (T8): the /akili-validate pointer sentence (FR-7, NFR-3) ----

const VALIDATE_CMD = path.join(ROOT, ".claude", "commands", "akili-validate.md");

// UI design review paragraph region: from its heading line to the Design Review record paragraph.
function validatePointerRegion() {
  const text = read(VALIDATE_CMD);
  const start = text.indexOf("**UI design review (UI-heavy specs).**");
  const tbl = text.indexOf("| Engine `declined` / `unavailable` |", start);
  const end = text.indexOf("Record in the validation report a **Design Review** section", start);
  assert.ok(start >= 0 && tbl > start && end > tbl, "UI design review bounds");
  return text.slice(text.indexOf("\n", tbl), end);
}

test("validate (FR-7): the sentence follows the table, names modern-web.md -> Test and validate reads and the recorded guide ids", () => {
  const r = validatePointerRegion();
  assert.match(r, /When `execution\.md` records MWG guide ids/);
  assert.match(r, /check the built code against those guides/);
  assert.match(r, /`modern-web\.md` → \*Test and validate reads\*/);
  assert.match(r, /a contradiction is a finding/);
});

test("validate (FR-7): not ready is recorded, never failed on; the sentence copies no gate row and the table keeps five rows", () => {
  const r = validatePointerRegion();
  assert.match(r, /other than `ready` is recorded, never failed on/);
  assert.doesNotMatch(r, /\|/);
  const text = read(VALIDATE_CMD);
  const rows = text.split("\n").filter((l) => /^\s*\| (Skill source|Engine) /.test(l));
  assert.equal(rows.length, 5);
});

// ---- audit (T9): the /akili-audit modern-web mode (FR-8, FR-4, DD-9, P-21..P-23, P-26) ----

const AUDIT_CMD = path.join(ROOT, ".claude", "commands", "akili-audit.md");
const auditText = () => read(AUDIT_CMD);

// Text of the "## Modern Web Mode" section, up to the next rule or heading.
function modernWebMode() {
  const text = auditText();
  const start = text.indexOf("## Modern Web Mode");
  assert.ok(start >= 0, "expected a Modern Web Mode section");
  const end = text.indexOf("\n---\n", start);
  assert.ok(end > start, "Modern Web Mode section end");
  return text.slice(start, end);
}

test("audit (FR-8, P-26): the Usage block lists the mode and the dispatch sentence picks it by its argument", () => {
  const text = auditText();
  const usage = text.slice(text.indexOf("## Usage"), text.indexOf("## Behavior"));
  assert.match(usage, /\/akili-audit modern-web \[<path>\]/);
  assert.match(usage, /With `modern-web` it runs an opt-in, report-only \*\*modern web scan\*\*[^\n]*\(see \*Modern Web Mode\*\)/);
  assert.match(usage, /chosen by the argument and by nothing else: the user typing `modern-web` is the opt-in/);
  // the two existing dispatches are untouched
  assert.match(usage, /With no argument the command runs the spec-to-code \*\*drift audit\*\*/);
  assert.match(usage, /With `design` it runs a \*\*design evaluation\*\*/);
});

test("audit (FR-8, DD-9): the section points at modern-web.md -> Audit scan and copies no procedure row", () => {
  const s = modernWebMode();
  assert.match(s, /`\.claude\/skills\/impeccable-bridge\/references\/modern-web\.md` → \*Audit scan\*/);
  assert.match(s, /single source of the procedure/);
  assert.doesNotMatch(s, /legacy-scan <path> --json/);
  assert.doesNotMatch(s, /keepWhen/);
  assert.doesNotMatch(s, /\|/);
});

test("audit (FR-8): the report path is modern-web-<YYYY-MM-DD>[-<safe-branch>][-N].md under docs/specs/audits/ with the drift suffix rule", () => {
  assert.match(modernWebMode(), /`docs\/specs\/audits\/modern-web-<YYYY-MM-DD>\[-<safe-branch>\]\[-N\]\.md`, with the drift reports' suffix rule/);
});

test("audit (FR-8 BUT): report-only, the report is the only write, no Modernize, findings never become tasks", () => {
  const s = modernWebMode();
  assert.match(s, /report-only/);
  assert.match(s, /the report is the mode's only write, and upstream's \*Modernize\* step is never run/);
  assert.match(s, /Findings never become tasks of a running spec/);
  assert.doesNotMatch(s, /outside `docs\/specs\/audits\/`(?![^\n]*user-directed)/);
});

test("audit (FR-8): findings route to /akili-propose (groups) or /akili-quick (trivial)", () => {
  const s = modernWebMode();
  assert.match(s, /a trivial fix → `\/akili-quick`; a group of related findings → `\/akili-propose`/);
});

test("audit (FR-8, FR-4): not applicable and not ready outcomes are recorded and never fail, stop or block the audit", () => {
  const s = modernWebMode();
  assert.match(s, /not run: <state>/);
  assert.match(s, /no web UI source/);
  assert.match(s, /the audit otherwise behaves as today/);
  assert.match(s, /never fails, stops or blocks the audit/);
});

test("audit (P-23): modern-web-*.md is never a drift report; the drift readers still read only drift-*.md", () => {
  assert.match(modernWebMode(), /A `modern-web-\*\.md` file is never a drift report: the drift \*Reading reports back\* rule reads only `drift-\*\.md`/);
  const text = auditText();
  assert.match(text, /inside\* the `drift-\*\.md` files/);
  const readers = [
    [path.join(ROOT, ".claude", "commands", "akili-archive.md"), /drift-\*\.md/],
    [path.join(ROOT, ".claude", "skills", "kaizen", "SKILL.md"), /drift-\*\.md/],
  ];
  for (const [file, re] of readers) {
    const body = read(file);
    assert.match(body, re, file);
    assert.doesNotMatch(body, /modern-web-\*/, file);
  }
});

test("audit (FR-8, P-21): the checklist carries a modern-web line and the design mode's five-row state table is intact", () => {
  const text = auditText();
  const cl = text.slice(text.indexOf("## Verification Checklist"));
  assert.match(cl, /In \*\*modern-web mode\*\*, confirm instead:[^\n]*`modern-web-\*\.md` path[^\n]*\*Modernize\* was not run/);
  const design = text.slice(text.indexOf("## Design Evaluation Mode"), text.indexOf("## Modern Web Mode"));
  const rows = design.split("\n").filter((l) => /^\s*\| (Skill source|Engine) /.test(l));
  assert.equal(rows.length, 5);
});

// ---- propose (T10): /akili-propose accepts the modern-web report as a source (FR-8, P-23) ----

const PROPOSE_CMD = path.join(ROOT, ".claude", "commands", "akili-propose.md");
const proposeSource = () => {
  const m = read(PROPOSE_CMD).match(/\*\*Design evaluation as a source\.\*\*[^\n]*/);
  assert.ok(m, "Design evaluation as a source paragraph present");
  return m[0];
};

test("propose (FR-8, P-23): the source rule names both design-*.md and modern-web-*.md reports", () => {
  const s = proposeSource();
  assert.match(s, /`docs\/specs\/audits\/design-\*\.md`/);
  assert.match(s, /`docs\/specs\/audits\/modern-web-\*\.md`/);
});

test("propose (FR-8): findings are carried as the Problem table, one row per finding citing the report", () => {
  assert.match(proposeSource(), /carry its findings in scope as the Problem table, one row per finding citing the report/);
});

test("propose (FR-8): design reports keep the P1/P2 rule", () => {
  assert.match(proposeSource(), /For a design report, carry its P1\/P2 findings and leave P3 items out of scope/);
});

test("propose (FR-8): modern-web reports carry kept findings routed to /akili-propose, independent of P-priorities", () => {
  const s = proposeSource();
  const clause = s.slice(s.indexOf("A modern-web report"));
  assert.ok(clause.startsWith("A modern-web report"), "modern-web selection clause present");
  assert.match(clause, /carry each kept finding it routes to `\/akili-propose`/);
  assert.match(clause, /one row per finding citing the report and its guide id/);
  assert.doesNotMatch(clause, /P1|P2|P3/);
});

// ---- constitution (T11): Step 8D writes the MWG Skill Map row and the platform field (FR-9, FR-5, FR-2, P-19) ----

const CONSTITUTION_CMD = path.join(ROOT, ".claude", "commands", "akili-constitution.md");
// Step 8D text is hard-wrapped: collapse whitespace before matching clauses.
const flatText = (s) => s.replace(/\s+/g, " ").trim();
const step8D = () => {
  const t = read(CONSTITUTION_CMD);
  const a = t.indexOf("### Step 8D: Scaffold the Skill Map");
  const b = t.indexOf("### Step 8E", a);
  assert.ok(a >= 0 && b > a, "Step 8D present");
  return t.slice(a, b);
};
const constitutionItem = (n) => {
  const s = step8D();
  const start = s.indexOf(`\n${n}. `);
  assert.ok(start >= 0, `item ${n} present`);
  const next = s.indexOf(`\n${n + 1}. `, start);
  const policy = s.indexOf("\n**Mode-specific policy", start);
  const end = [next, policy].filter((i) => i > start).sort((x, y) => x - y)[0];
  return flatText(s.slice(start, end));
};

test("constitution (FR-9): the MWG row is for a browser-rendered UI project only and is asked first", () => {
  const i3 = constitutionItem(3);
  assert.match(i3, /for a project with a browser-rendered UI only, Modern Web Guidance \(`modern-web-guidance`/);
  assert.match(i3, /never write the MWG row for a project with no web UI/);
  assert.match(i3, /Ask the user before adding one; never infer it from the filesystem/);
});

test("constitution (FR-9, FR-2 BUT, DD-15): the row's When to load says never assigned or loaded directly, and the row is not a skill to assign", () => {
  const i3 = constitutionItem(3);
  assert.match(i3, /whose row is an availability and pin note, never a skill to assign/);
  assert.match(i3, /never assigned or loaded directly; reached through `impeccable-bridge` → `references\/modern-web\.md` when a web UI task's route says `platform mwg`/);
  assert.match(i3, /assert that the skill is installed/);
});

test("constitution (FR-9, FR-5, DD-7): the optional pin token is named in the grammar the rules file reads", () => {
  assert.match(constitutionItem(3), /optional `pin <x\.y\.z>`/);
  // Same token the rules file's *Pin* section reads from the Skill Map row.
  assert.ok(section(rules(), "## Pin").includes("`pin <x.y.z>`"), "rules file Pin section names the same token");
});

test("constitution (FR-2 AND): the gate-stop sentence keeps the Deliverable stop and gains `a platform selector never stops`", () => {
  const i3 = constitutionItem(3);
  assert.match(i3, /`Deliverable: video`\) stops at `video-production`'s availability gate \(a `platform` selector never stops\)/);
});

test("constitution (FR-9, P-19): item 4 carries a platform guidance field after motion library and mockup route, with the matrix pointer last", () => {
  const i4 = constitutionItem(4);
  const pos = ["motion library (", "mockup route (", "platform guidance (", "one line pointing at the matrix by name"].map((f) => i4.indexOf(f));
  assert.ok(pos.every((p) => p >= 0), `all fields present: ${pos}`);
  assert.deepEqual([...pos].sort((a, b) => a - b), pos, "order read from the shipped file");
  assert.match(i4, /platform guidance \(`modern-web-guidance`, environment-provided, pin source `skill-map` when the Skill Map MWG row carries a valid `pin <x\.y\.z>`, `default` otherwise; or `none — <reason>`\)/);
});

test("constitution (FR-5, FR-9): item 4 states the pin source as the grammar's two values, never as the Skill Map row in every case", () => {
  const i4 = constitutionItem(4);
  const field = i4.slice(i4.indexOf("platform guidance ("), i4.indexOf("one line pointing at the matrix by name"));
  assert.match(field, /`default`/);
  assert.match(field, /`skill-map`/);
  assert.doesNotMatch(field, /pin source the Skill Map row/);
  assert.doesNotMatch(field, /\d+\.\d+\.\d+/, "no default version pinned in the scaffold text");
});

test("constitution (DD-15, FR-9): Step 8D items name no stack skill as MWG's carrier and write no file:line pointer", () => {
  const s = step8D();
  assert.doesNotMatch(s, /\.(md|js):\d+/);
  // MWG appears only inside item 3's row note and item 4's field, never in item 2's assignment instruction.
  assert.doesNotMatch(constitutionItem(2), /modern-web-guidance|MWG/);
});

// ---- docs (T12): bridge page, env-tool rows, restatements (FR-11, FR-10 routes, FR-2 AND, DD-10, DD-11, P-10, P-15, P-16, P-23, P-24) ----
// Prose is hard-wrapped in places: every clause is matched on whitespace-collapsed text (flatText).

const BRIDGE_DOC = path.join(ROOT, "docs", "skills", "impeccable-bridge.md");

// Shipped docs: everything under docs/ except docs/specs, plus root guides and the packaged .claude tree.
function shippedFiles() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (p === path.join(ROOT, "docs", "specs") || e.name === "node_modules") continue;
        walk(p);
      } else if (/\.(md|json)$/.test(e.name)) out.push(p);
    }
  };
  walk(path.join(ROOT, "docs"));
  walk(path.join(ROOT, ".claude"));
  for (const f of ["AGENTS.md", "README.md"]) out.push(path.join(ROOT, f));
  return out;
}

// Blank-line-separated blocks of a file, whitespace-collapsed.
const blocks = (file) => read(file).split(/\n\s*\n/).map(flatText);

// The `## Modern Web Guidance (environment-provided)` section, up to the next `## ` heading.
const bridgeMwg = () => flatText(section(read(BRIDGE_DOC), "## Modern Web Guidance (environment-provided)"));
const MWG_NAME = /modern-web-guidance|Modern Web Guidance|\bMWG\b/;

test("docs (FR-11): the bridge page has the MWG section: role, gate, pin and security record", () => {
  const s = bridgeMwg();
  assert.match(s, /supporting skill for the platform implementation of web UI tasks/);
  assert.match(s, /never a lead/);
  assert.match(s, /six states/i);
  assert.match(s, /\*\*No state stops, fails or blocks\*\*/);
  assert.match(s, /default is `1\.0\.1`/);
  assert.match(s, /pin <x\.y\.z>/);
  assert.match(s, /### Security record/);
  assert.match(s, /verdict is `PASS`/);
});

test("docs (FR-11 AND): license Apache-2.0 and Google Chrome appear on the bridge page, the overview row, the cli row and AGENTS.md", () => {
  const overviewRow = flatText(read(path.join(ROOT, "docs", "overview.md")).split("\n").find((l) => l.startsWith("| Modern Web Guidance")) || "");
  const cliRow = flatText(read(path.join(ROOT, "docs", "cli.md")).split("\n").find((l) => l.startsWith("| Environment-provided skills")) || "");
  const agentsLine = flatText(read(path.join(ROOT, "AGENTS.md")).split("\n").find((l) => l.startsWith("- `modern-web-guidance`")) || "");
  for (const [name, text] of [["bridge page", bridgeMwg()], ["overview row", overviewRow], ["cli row", cliRow], ["AGENTS.md line", agentsLine]]) {
    assert.match(text, /Apache-2\.0/, `${name} states Apache-2.0`);
    assert.match(text, /Google Chrome/, `${name} attributes to Google Chrome`);
    assert.doesNotMatch(text, /\bMIT\b/, `${name} never calls MWG MIT`);
  }
});

test("docs (FR-11 BUT, P-10): no shipped doc pairs MWG with Grok Bot or states a Grok route", () => {
  const hits = [];
  for (const f of shippedFiles()) {
    for (const b of blocks(f)) if (MWG_NAME.test(b) && /grok/i.test(b)) hits.push(`${path.relative(ROOT, f)}: ${b.slice(0, 80)}`);
  }
  assert.deepEqual(hits, []);
  assert.doesNotMatch(bridgeMwg(), /grok/i);
});

test("docs (FR-10): the bridge page's install routes are upstream's, pinned form for Any, Cursor and OpenCode unverified", () => {
  const s = bridgeMwg();
  assert.match(s, /\/plugin marketplace add GoogleChrome\/modern-web-guidance`, then `\/plugin install modern-web-guidance@googlechrome`/);
  assert.match(s, /codex plugin marketplace add GoogleChrome\/modern-web-guidance`, then `codex plugin add modern-web-guidance@googlechrome`/);
  assert.match(s, /agy plugin install https:\/\/github\.com\/GoogleChrome\/modern-web-guidance/);
  assert.match(s, /Cursor, OpenCode \| Upstream's generic `npx skills add GoogleChrome\/modern-web-guidance` \| Unverified for these hosts/);
  assert.match(s, /`npx modern-web-guidance@<pin> install`/);
  assert.match(s, /never runs them/);
  assert.match(s, /Which version a plugin route installs is not settled/);
});

test("docs (FR-11 BUT, DD-11, P-15, P-24): eval figures and MDN stewardship appear only in a block that cites the upstream README at v1.0.1 as upstream's own statement", () => {
  const stray = [];
  let seen = 0;
  for (const f of shippedFiles()) {
    for (const b of blocks(f)) {
      if (!/52–60|82–96|\bMDN\b/.test(b)) continue;
      // Only blocks about MWG are in scope: the MDN name is used elsewhere in the repository.
      if (!MWG_NAME.test(b) && !/\b52–60|82–96/.test(b)) continue;
      seen++;
      if (!(/README/.test(b) && /v1\.0\.1/.test(b) && /not verified by AKILI/.test(b))) stray.push(`${path.relative(ROOT, f)}: ${b.slice(0, 90)}`);
    }
  }
  assert.ok(seen >= 1, "the bridge page carries the cited statements");
  assert.deepEqual(stray, []);
});

test("docs (FR-11 BUT): the eval figures are exactly upstream's 52–60% and 82–96%, labelled and never as an AKILI result", () => {
  const b = blocks(BRIDGE_DOC).find((x) => x.startsWith("Cited to the upstream README"));
  assert.ok(b, "the Upstream's own statements paragraph exists");
  assert.match(b, /unguided agents scored 52–60% and guided agents 82–96%/);
  assert.match(b, /stewarded by the Google Chrome, Microsoft Edge, Mozilla Firefox and MDN teams/);
});

test("docs (FR-11, KZ-changes--archify-diagrams-1): no shipped file links the spec path or names an unpinned MWG package", () => {
  const spec = [];
  const unpinned = [];
  for (const f of shippedFiles()) {
    const t = flatText(read(f));
    if (/specs\/changes\/modern-web-guidance/.test(t)) spec.push(path.relative(ROOT, f));
    if (/modern-web-guidance@latest/.test(t)) unpinned.push(path.relative(ROOT, f));
  }
  assert.deepEqual(spec, [], "no shipped file names the spec folder (archive moves it)");
  assert.deepEqual(unpinned, [], "no shipped file names an unpinned MWG package");
});

test("docs (FR-11 BUT): the security record claims nothing beyond the verdict: one version, traced not read, Windows unverified", () => {
  const s = bridgeMwg();
  assert.match(s, /It covers that version only/);
  assert.match(s, /traced from its entry point, not read line by line/);
  assert.match(s, /The Windows call form is unverified/);
  assert.match(s, /no claim here goes beyond this verdict/);
  assert.doesNotMatch(s, /\b(guarantee[sd]?|fully secure|audited line by line)\b/i);
});

test("docs (FR-2 AND, P-16): docs/cli.md env row lists MWG and states the per-selector outcome", () => {
  const rowText = flatText(read(path.join(ROOT, "docs", "cli.md")).split("\n").find((l) => l.startsWith("| Environment-provided skills")) || "");
  assert.match(rowText, /`modern-web-guidance`/);
  assert.match(rowText, /a spec whose `Deliverable` selects one .* stops at that skill's availability gate/);
  assert.match(rowText, /A route or typed-mode selector never stops: .*`platform mwg` route or `\/akili-audit modern-web`.* continues without it and reports `not run`/);
});

test("docs (FR-2 AND, P-16, T11 forward pointer): every restatement of rule 4 gains the per-selector outcome", () => {
  const need = [
    ["docs/flow.md", /a `Deliverable` selector stops at its gate\)\. Modern Web Guidance is environment-provided too, but a web UI task's `platform mwg` route and the typed `\/akili-audit modern-web` mode never stop: they continue without it and report `not run`/],
    ["docs/skills/README.md", /A spec whose `Deliverable` selects one stops at its availability gate; a web UI task's `platform mwg` route or the typed `\/akili-audit modern-web` mode never stops and continues without the skill/],
    ["docs/overview.md", /Nothing stops: the step continues without it and reports `not run`/],
    ["docs/skills/video-production.md", /Modern Web Guidance, also environment-provided, is reached by different selectors \(a web UI route, a typed audit mode\) that never stop/],
    ["AGENTS.md", /\(a `Deliverable` selector stops at its gate\)/],
    ["AGENTS.md", /never in a skills list, never stops a step/],
  ];
  for (const [f, re] of need) assert.match(flatText(read(path.join(ROOT, f))), re, `${f} carries the outcome`);
});

test("docs (FR-2 AND, P-16): AGENTS.md Design Skills names MWG as environment-provided and supporting; Skill Usage line unchanged in shape", () => {
  const ds = flatText(section(read(path.join(ROOT, "AGENTS.md")), "## Design Skills"));
  assert.match(ds, /- `modern-web-guidance` — environment-provided \(Google Chrome, Apache-2\.0\), supporting only/);
  assert.match(ds, /never a lead/);
});

test("docs (P-23): the docs that list audit report kinds name the modern-web kind and keep it out of drift", () => {
  const flow = flatText(read(path.join(ROOT, "docs", "flow.md")));
  assert.match(flow, /\| `docs\/specs\/audits\/modern-web-<YYYY-MM-DD>\[-<safe-branch>\]\[-N\]\.md` \| `\/akili-audit modern-web` \|.*Never a drift source/);
  assert.match(flow, /a `security-\*\.md` index and a `modern-web-\*\.md` report are not drift sources/);
  const cmdPage = flatText(read(path.join(ROOT, "docs", "commands", "akili-audit.md")));
  assert.match(cmdPage, /\/akili-audit modern-web \[<path>\]/);
  assert.match(cmdPage, /a `modern-web-\*\.md` report are not drift reports/);
  assert.match(cmdPage, /opt-in .* and report-only/);
  assert.match(flatText(read(path.join(ROOT, "docs", "commands", "README.md"))), /`modern-web` mode writes `modern-web-<YYYY-MM-DD>\[-<safe-branch>\]\[-N\]\.md`/);
  assert.match(flatText(read(path.join(ROOT, "docs", "overview.md"))), /`\/akili-audit modern-web` is an opt-in, report-only scan/);
});

test("docs (user-approved addition): the akili-audit frontmatter description is one line and names the modern-web mode", () => {
  const fm = /^---\n([\s\S]*?)\n---/.exec(auditText());
  assert.ok(fm, "frontmatter present");
  const descLines = fm[1].split("\n").filter((l) => l.startsWith("description:"));
  assert.equal(descLines.length, 1);
  assert.match(descLines[0], /`design` mode/);
  assert.match(descLines[0], /`modern-web` mode/);
  assert.match(descLines[0], /report-only/);
});

// ---- changelog (T13): the CHANGELOG entry states only what shipped (FR-11 THEN, BUT; DD-11; KZ-002) ----
// Reads the newest section, in document order ([Unreleased] first), that names MWG, so the test survives the release cut.

const CHANGELOG = path.join(ROOT, "CHANGELOG.md");
function changelogMwg() {
  const sections = read(CHANGELOG).split(/\n(?=## \[)/);
  const hit = sections.find((s) => s.startsWith("## [") && MWG_NAME.test(s));
  assert.ok(hit, "a CHANGELOG section names Modern Web Guidance");
  return flatText(hit);
}
const changelogBullet = (lead) => {
  const hit = read(CHANGELOG).split("\n").filter((l) => l.startsWith("- **")).map(flatText).find((l) => MWG_NAME.test(l) && l.includes(lead));
  assert.ok(hit, `expected a CHANGELOG bullet starting with "- **${lead}"`);
  return hit;
};

test("changelog (FR-11 THEN, AND): the entry states Apache-2.0 and Google Chrome and never MIT", () => {
  const s = changelogBullet("Modern Web Guidance (MWG) is admitted");
  assert.match(s, /Google Chrome's platform-implementation skill, licensed Apache-2\.0/);
  assert.match(s, /never vendors, copies or installs it/);
  assert.doesNotMatch(changelogMwg(), /\bMIT\b.{0,40}(MWG|Modern Web|modern-web-guidance)|(MWG|Modern Web|modern-web-guidance).{0,40}\bMIT\b/);
  assert.doesNotMatch(s, /\bMIT\b/);
});

test("changelog (FR-11 BUT, KZ-002): counts and values match the shipped rules file", () => {
  const sec = changelogMwg();
  assert.match(sec, /six-state gate/);
  assert.equal(STATES.length, 6);
  for (const [name] of STATES) assert.ok(sec.includes(name), `the entry names state ${name}`);
  assert.match(sec, /through three selectors/);
  const selectors = section(rules(), "## How it is reached").split("\n").filter((l) => /^[1-3]\. /.test(l));
  assert.equal(selectors.length, 3);
  assert.match(sec, /default pin is `1\.0\.1`/);
  assert.match(rules(), /`1\.0\.1`/);
  assert.match(sec, /`pin <x\.y\.z>` in the Skill Map MWG row/);
  assert.match(sec, /`ENABLE_FILE_LOGGING=false`, and `DISABLE_TELEMETRY=1` unless you opted in/);
  assert.match(sec, /No state stops, fails or blocks/);
  assert.match(sec, /opt-in, report-only scan/);
  assert.match(sec, /Node 22 or newer/);
});

test("changelog (FR-11 BUT, DD-11): no unpinned package, no spec link, no uncited figure or Grok route", () => {
  const sec = changelogMwg();
  assert.doesNotMatch(sec, /modern-web-guidance@latest/);
  assert.doesNotMatch(sec, /specs\/changes\/modern-web-guidance/);
  assert.doesNotMatch(sec, /52–60|82–96/, "eval figures live only in the cited bridge-page paragraph");
  assert.doesNotMatch(sec, /grok/i);
  assert.match(sec, /cites upstream's eval figures and its stewardship claim to the upstream README at `v1\.0\.1`, as upstream's own statements that AKILI has not verified/);
  assert.match(sec, /covers MWG `1\.0\.1` only/);
  assert.match(sec, /The `legacy-scan` bundle was traced from its entry point, not read line by line, and the Windows call form is unverified/);
});

test("changelog (FR-11 BUT): the install-route clause matches the bridge page's route table", () => {
  const sec = changelogMwg();
  assert.match(sec, /verified at the pin for Claude Code, Codex and Antigravity, and unverified for Cursor and OpenCode/);
  const routes = bridgeMwg();
  assert.match(routes, /\| Claude Code \|.*\| Verified at the pin \|/);
  assert.match(routes, /\| Codex \|.*\| Verified at the pin \|/);
  assert.match(routes, /\| Antigravity \|.*\| Verified at the pin \|/);
  assert.match(routes, /\| Cursor, OpenCode \|.*\| Unverified for these hosts \|/);
});

test("changelog (FR-2 AND): the rule 4 entry matches governance rule 4", () => {
  const s = changelogBullet("`docs/skills/governance.md` rule 4 names three selectors");
  assert.match(s, /still stops at that skill's availability gate/);
  assert.match(s, /never stop: they continue without MWG and report `not run`/);
  assert.match(flatText(govRule(4)), /The three selectors are/);
});

// ---- cross-cutting (T14): FR-5 BUT, FR-7 BUT/AND, FR-10 THEN, NFR-1..NFR-4 (design §15, P-14) ----
// File lists come from directory walks or `git ls-files`, never a fixed array.

const { spawnSync } = require("child_process");
const os = require("os");

const commandFiles = () =>
  fs.readdirSync(path.join(ROOT, ".claude", "commands")).filter((n) => n.endsWith(".md")).map((n) => path.join(ROOT, ".claude", "commands", n));

// Every file the package ships: walk the package.json "files" entries (honouring "*"-only "!" negations), no extension filter, plus what npm
// packs on its own: package.json and README / COPYING / LICENSE / LICENCE in the root and each directory above a manifest entry (.claude/README.md).
// Binary files (a NUL byte in the first 8 KB) are skipped; CHANGELOG.md is cut at its first `## [<version>]` heading, keeping [Unreleased] (history is excluded by design §15).
const NPM_OWN = /^(package\.json|(readme|copying|licen[cs]e)(\..*[^~$])?)$/i;

function packedFiles() {
  const manifest = JSON.parse(read(path.join(ROOT, "package.json"))).files;
  const negs = manifest.filter((p) => p.startsWith("!")).map((p) => new RegExp("^" + p.slice(1).replace(/[.+^$()|[\]{}]/g, "\\$&").replace(/\*/g, "[^/]*") + "(/|$)"));
  const out = [];
  const walk = (rel) => {
    if (negs.some((re) => re.test(rel))) return;
    const abs = path.join(ROOT, rel);
    if (fs.statSync(abs).isDirectory()) fs.readdirSync(abs).forEach((n) => walk(rel + "/" + n));
    else out.push(rel);
  };
  const entries = manifest.filter((p) => !p.startsWith("!"));
  entries.forEach(walk);
  const above = new Set(["."]);
  entries.forEach((p) => { for (let d = path.posix.dirname(p); d !== "."; d = path.posix.dirname(d)) above.add(d); });
  above.forEach((d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).forEach((e) => e.isFile() && NPM_OWN.test(e.name) && out.push(d === "." ? e.name : d + "/" + e.name)));
  return [...new Set(out)];
}

function packedText(rel) {
  const buf = fs.readFileSync(path.join(ROOT, rel));
  if (buf.subarray(0, 8192).includes(0)) return "";
  const t = buf.toString("utf8");
  return rel === "CHANGELOG.md" ? t.split(/^## \[(?!Unreleased)/m)[0] : t;
}

test("cross-cutting (FR-5 BUT): no file in the package manifest (docs, skills, commands, templates, code, CI templates) names modern-web-guidance@latest", () => {
  const files = packedFiles();
  assert.ok(files.length > 300, "the manifest walk reaches the whole packed tree");
  assert.ok(files.includes("docs/ci/akili-review.claude.yml") && files.includes(".claude/README.md") && files.includes("package.json"), "non-md and npm-added files are walked");
  assert.ok(!files.some((f) => f.startsWith("docs/specs/")), "docs/specs/ is excluded");
  const hits = files.filter((f) => /modern-web-guidance@latest/.test(packedText(f)));
  assert.deepEqual(hits, []);
});

// Fragments that exist only in the bridge's MWG reference (gate rows, pin rule, call forms) or the matrix card.
const HELD_ONCE = [
  [/^\| `(missing|node < 22|consent needed|declined|ready|call failed)` \|/m, "a gate-table row"],
  [/MWG — (not run|ready)/, "a gate report line"],
  [/DISABLE_TELEMETRY|ENABLE_FILE_LOGGING/, "a call-form prefix"],
  [/modern-web-guidance@|\bnpx\b[^\n]*modern-web/, "a call form"],
  [/\b1\.0\.1\b/, "the default pin"],
  [/^\| `modern-web-guidance` \(environment-provided\)/m, "a matrix or Roles row"],
];

test("cross-cutting (FR-7 BUT, NFR-3): no command copies a gate row, report line, pin rule, call form or matrix row", () => {
  const hits = [];
  for (const f of commandFiles()) {
    const t = read(f);
    for (const [re, what] of HELD_ONCE) if (re.test(t)) hits.push(`${path.basename(f)}: ${what}`);
  }
  assert.deepEqual(hits, []);
});

// A paragraph that names MWG is conditional when it ties the use to web UI, the route field, the typed mode, or recorded guide ids.
const CONDITIONAL = /web UI|`platform mwg`|\/akili-audit modern-web|Modern Web Mode|modern-web mode|records MWG guide ids|Skill Map MWG row|`modern-web-\*\.md`/;

test("cross-cutting (FR-7 AND IT MUST): every command mention of MWG is conditional on web UI, platform mwg, the typed mode or recorded guide ids", () => {
  const unconditional = [];
  let seen = 0;
  for (const f of commandFiles()) {
    for (const b of blocks(f)) {
      if (!(MWG_NAME.test(b) || /modern-web/.test(b))) continue;
      seen++;
      if (!CONDITIONAL.test(b)) unconditional.push(`${path.basename(f)}: ${b.slice(0, 90)}`);
    }
  }
  assert.ok(seen >= 6, "the shipped pointer lines are found");
  assert.deepEqual(unconditional, []);
});

test("cross-cutting (NFR-2): no MWG file is in the repository: the only tracked MWG-named paths are the rules file, this suite and the spec records under docs/specs/", () => {
  const tracked = spawnSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" });
  assert.equal(tracked.status, 0);
  const files = tracked.stdout.split("\n").filter(Boolean);
  assert.ok(files.length > 100);
  const named = files.filter((f) => /modern-web|mwg/i.test(f) && !f.startsWith("docs/specs/"));
  assert.deepEqual(named.sort(), [".claude/skills/impeccable-bridge/references/modern-web.md", "test/modern-web-guidance.test.js"]);
  assert.deepEqual(files.filter((f) => /(^|\/)LICENSE$/.test(f) && /modern-web/i.test(read(path.join(ROOT, f)).slice(0, 400))), []);
});

test("cross-cutting (NFR-1): engines.node stays >=18.0.0 and no test spawns npx or reaches the network (a loopback node:http fixture is not the network)", () => {
  assert.equal(JSON.parse(read(path.join(ROOT, "package.json"))).engines.node, ">=18.0.0");
  const npx = new RegExp("(spawn|exec)\\w*\\(\\s*[\"'`]npx");
  const net = new RegExp("require\\([\"'](node:)?https[\"']\\)|\\bfetch\\(");
  const offenders = [];
  for (const n of fs.readdirSync(__dirname).filter((x) => x.endsWith(".js"))) {
    const t = read(path.join(__dirname, n));
    if (npx.test(t) || net.test(t)) offenders.push(n);
  }
  assert.deepEqual(offenders, []);
});

test("cross-cutting (FR-10 THEN): install --tool all --dry-run on a clean HOME plans skills but no MWG skill or directory (SKILL_FILE_EXPECTED in install-cursor.test.js is the file-level control)", () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "akili-t14-"));
  const env = { ...process.env, HOME: home, USERPROFILE: home, CODEX_HOME: path.join(home, ".codex"), CURSOR_CONFIG_DIR: path.join(home, ".cursor") };
  try {
    const r = spawnSync(process.execPath, [path.join(ROOT, "bin", "akili.js"), "install", "--tool", "all", "--dry-run"], { cwd: ROOT, env, encoding: "utf8" });
    const out = (r.stdout || "").replace(/\x1b\[[0-9;]*m/g, "");
    assert.equal(r.status, 0, r.stderr);
    assert.match(out, /impeccable-bridge/, "the plan lists the bridge skill, so the scan is not inert");
    assert.doesNotMatch(out, /modern-web|mwg/i);
    assert.deepEqual(fs.readdirSync(home), [], "a dry run writes nothing");
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

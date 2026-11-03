"use strict";
// @akili-spec changes/go-backend-routing/backend-skill-routing — Tester coverage (text-contract) for the
// scenarios the author suite (backend-skill-routing.test.js) does not prove. Expected values are inlined
// from requirements.md §6–§8 and the design.md amendments A-3..A-6 as of commit 3f91969; this file never
// reads docs/specs/ at runtime. Scope constraints of the change (NFR-2, NFR-4, FR-9 BUT: files left
// byte-unchanged) are one-time evidence in the spec's test report, not permanent assertions here.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const MATRIX = [".claude", "skills", "software-architect", "references", "backend-routing.md"];
const DESIGN_MATRIX = [".claude", "skills", "impeccable-bridge", "references", "design-routing.md"];
const matrix = () => read(...MATRIX);
const cmd = (n) => read(".claude", "commands", `${n}.md`);
const index = (s, needle) => {
  const i = s.indexOf(needle);
  assert.ok(i >= 0, `missing: ${needle}`);
  return i;
};
const between = (s, from, to) => {
  const a = index(s, from);
  const b = s.indexOf(to, a + from.length);
  assert.ok(b > a, `missing end marker after ${from}: ${to}`);
  return s.slice(a, b);
};
const section = (s, heading) => {
  const m = new RegExp(`^(#+) ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").exec(s);
  assert.ok(m, `missing heading: ${heading}`);
  const rest = s.slice(m.index + m[0].length);
  const next = new RegExp(`^#{1,${m[1].length}} `, "m").exec(rest);
  return next ? rest.slice(0, next.index) : rest;
};
const cells = (row) => row.split("|").slice(1, -1).map((c) => c.trim());
const tableRows = (s, header) => {
  const lines = s.split("\n");
  const start = lines.findIndex((l) => l.trim().startsWith(header));
  assert.ok(start >= 0, `table header present: ${header}`);
  const rows = [];
  for (let i = start + 2; i < lines.length && lines[i].trim().startsWith("|"); i++) rows.push(cells(lines[i].trim()));
  return rows;
};
const h2 = (s) => s.split("\n").filter((l) => /^## /.test(l)).map((l) => l.slice(3).trim());

const CARD_HEADER = "| Skill | Expert at | Supports | Must not decide | Evidence |";
const matrixRows = () => tableRows(section(matrix(), "Matrix"), "| Activity | Context | Lead | Support | Row rule |");
// The one row for (activity, context); fails when absent or duplicated.
const row = (activity, context) => {
  const hits = matrixRows().filter((c) => c[0] === `**${activity}**` && c[1] === context);
  assert.equal(hits.length, 1, `exactly one ${activity} / ${context} row`);
  const [, , lead, support, rule] = hits[0];
  return { lead, support, rule };
};
const card = (name) => {
  const hits = tableRows(matrix(), CARD_HEADER).filter((c) => c[0].startsWith(`\`${name}\``));
  assert.equal(hits.length, 1, `one card for ${name}`);
  const [, expert, supports, mustNot, evidence] = hits[0];
  return { expert, supports, mustNot, evidence };
};
const rules = () => {
  const out = {};
  for (const l of section(matrix(), "Decision rule").split("\n")) {
    const m = /^(\d+)\. (.*)$/.exec(l);
    if (m) out[m[1]] = m[2];
  }
  return out;
};
const specifyRule = () => between(cmd("akili-specify"), "Preferred backend skill rule:", "Preferred UI/UX skill rule:");
const step8D = () => between(cmd("akili-constitution"), "4. **A `### Design routing` block", "\n---\n");
const item4 = (s) => between(s, "4. **A `### Design routing` block", "\n5. **A `### Backend routing`");
// Step 8D text is hard-wrapped: compare clauses with whitespace collapsed.
const flat = (s) => s.replace(/\s+/g, " ").trim();
const item5 = () => flat(between(cmd("akili-constitution"), "5. **A `### Backend routing` block", "**Mode-specific policy"));
// Step 8D's own mode policy (Step 8C has an earlier block with the same heading), one entry per bullet.
const modeBullets = () => {
  const s = cmd("akili-constitution");
  const from = s.slice(index(s, "5. **A `### Backend routing` block"));
  return between(from, "**Mode-specific policy (mirror Step 8B):**", "\n---\n").split(/\n(?=- )/).slice(1).map(flat);
};

// ---------------------------------------------------------------- FR-2

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-2: the matrix opens with the decision rule — method what/why, stack how, one lead, inputs not rules", () => {
  assert.equal(h2(matrix())[0], "Decision rule", "Decision rule is the first section");
  const r = rules();
  assert.deepEqual(Object.keys(r), ["1", "2", "3", "4", "5", "6", "7", "8"], "eight numbered rules");
  assert.equal(r["1"], "**The method skill decides what and why; the stack skill decides how in this language or framework.**");
  assert.ok(r["2"].startsWith("**One lead per activity and context.**"), "rule 2 is one lead per activity");
  assert.ok(r["2"].includes("Supporting skills give inputs, not rules."), "rule 2: supports give inputs, not rules");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-2: Go service with tdd — tdd leads test-first from requirements.md/design.md, golang-pro idiom supports, coverage never overrides", () => {
  const tf = row("test-first", "task lists `tdd`, Leader keeps it");
  assert.equal(tf.lead, "`tdd`");
  for (const idiom of ["table-driven", "`-race`"]) assert.ok(tf.support.includes(idiom), `support carries ${idiom}`);
  assert.ok(tf.support.startsWith("stack skill"), "the stack skill supports, never leads");
  assert.ok(tf.rule.includes("Expected values and seams come from `requirements.md` and `design.md`"), "values and seams from the spec");
  assert.ok(tf.rule.includes("a stack coverage target never overrides them or the Done criteria"), "BUT coverage target never overrides");
  assert.ok(card("golang-pro").mustNot.includes("coverage targets"), "golang-pro card: must not decide coverage targets");
  assert.ok(rules()["8"].includes("`test-first` applies only when the task's skills list `tdd`"), "rule 8: test-first only with tdd");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-2 FR-3: NestJS bug — systematic-debugging leads, Nest DI supports, no fix before root cause", () => {
  const bug = row("bug-diagnosis", "Bug track or any failure");
  assert.equal(bug.lead, "`systematic-debugging`");
  assert.ok(bug.support.includes("Nest DI graph"), "nestjs-expert DI knowledge supports");
  assert.ok(bug.rule.startsWith("No fix before root cause;"), "BUT no fix before root cause");
  assert.ok(bug.rule.includes("a stack skill's root-cause list is a hypothesis, not a diagnosis"), "stack root-cause list is a hypothesis");
  assert.ok(rules()["3"].includes("Bug track sends diagnosis to `bug-diagnosis`"), "rule 3 routes the Bug track");
  assert.ok(card("nestjs-expert").mustNot.includes("debugging method"), "nestjs-expert card: must not decide debugging method");
});

// ---------------------------------------------------------------- FR-3

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-3: not significant — existing design leads, software-architect is not loaded, no new style", () => {
  assert.ok(rules()["3"].includes("The architecturally significant test is `/akili-specify` Step 2.1's"), "rule 3 names the significance test");
  const notSig = matrixRows().filter((c) => /not significant/.test(c[1]));
  assert.equal(notSig.length, 4, "four not-significant rows");
  for (const [act, ctx, lead, support] of notSig) {
    assert.equal(lead, "existing design", `${act} ${ctx}: existing design leads`);
    assert.ok(!`${lead} ${support}`.includes("software-architect"), `${act} ${ctx}: software-architect not loaded`);
  }
  assert.equal(row("architecture", "not significant").rule, "No new style is introduced");
  assert.equal(row("module-design", "not significant").rule, "Follow the nearest existing module");
  assert.ok(row("module-design", "significant").rule.includes("The stack skill adds no pattern the design does not name"), "significant: no stack pattern");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-3: stack absent (other) — method lead stands, support reads none — project conventions", () => {
  const stacks = tableRows(section(matrix(), "Stack table"), "| Stack (Skill Map) |");
  const other = stacks.filter((c) => c[0] === "other");
  assert.equal(other.length, 1, "one other stack row");
  assert.equal(other[0][1], "none — project conventions", "other stack skill");
  const impl = row("implement", "other");
  assert.equal(impl.lead, "existing design", "implement/other: existing design leads");
  assert.equal(impl.support, "none — project conventions", "implement/other support");
  assert.equal(impl.rule, "No skill is recommended for install", "AND no install recommendation");
  for (const [act, ctx, lead] of matrixRows()) {
    if (act === "**implement**") continue;
    assert.ok(!/golang-pro|nestjs-expert|aws-serverless/.test(lead), `${act} ${ctx}: a method lead, not a stack skill`);
  }
  assert.ok(specifyRule().includes("when it has none for the stack, the line says `none — project conventions`"), "specify writes the none support");
});

// ---------------------------------------------------------------- FR-5 / FR-6 expected routes

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-5 FR-6: scenario routes — collision and Go endpoint resolve to the expected leads", () => {
  // FR-5 Collision: nestjs-expert + software-architect on a significant architecture decision.
  const arch = row("architecture", "significant");
  assert.equal(arch.lead, "`software-architect`", "architecture/significant lead");
  assert.ok(arch.support.startsWith("stack skill"), "the stack skill (nestjs-expert) supports");
  assert.ok(arch.rule.includes("The stack skill picks no style, NFR target or ADR"), "stack skill picks no style");
  assert.ok(card("nestjs-expert").mustNot.includes("Architecture decisions"), "nestjs-expert must not decide architecture");
  // FR-6 Backend task entry: Go service adds an endpoint.
  const api = row("api-contract", "any");
  assert.equal(api.lead, "`api-design-principles`", "api-contract lead");
  assert.ok(api.support.includes("Go handlers"), "golang-pro supports the transport");
  assert.ok(api.rule.includes("The stack skill picks no resource model, versioning, status-code or error-body policy"), "stack picks no API policy");
  assert.equal(row("implement", "Go").lead, "`golang-pro`", "implement/Go lead");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-6: the route line form and the skills list ⇔ line equality", () => {
  const line = section(matrix(), "Backend route line");
  assert.ok(line.includes("`Backend route: stack <stack>; <activity> lead <lead> support <support>[; <activity> lead <lead> support <support>]`"), "route line form");
  const fields = tableRows(line, "| Field | Values | Source |").map((c) => c[0]);
  assert.deepEqual(fields, ["Stack", "Activity", "Lead", "Support"], "route line fields");
  assert.ok(line.includes("Its skill list names exactly the backend skills the line names; other skills are unaffected."), "matrix: list ⇔ line");
  const rule = specifyRule();
  assert.ok(rule.includes("every backend task's Scope carries a `Backend route:` line (form in `backend-routing.md` → *Backend route line*)"), "specify: every backend task, pointer by section");
  assert.ok(rule.includes("its skills list names exactly the routed backend skills that line names; other skills are unaffected"), "specify: list ⇔ line");
});

// ---------------------------------------------------------------- FR-7

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-7: Step 8D item 5 — server-side code only, Skill Map support or none, matrix pointer, no rows", () => {
  const t = item5();
  assert.ok(t.startsWith("5. **A `### Backend routing` block under `## Skill Map`, when the project has server-side code**"), "condition: server-side code");
  assert.ok(t.includes("(any stack, packaged skill or not)"), "Django-like stacks get a block");
  assert.ok(t.includes("A project with no server-side code gets no block."), "no backend → no block");
  assert.ok(t.includes("stack(s) with the evidence path"), "stack with evidence");
  assert.ok(t.includes("named only from the Skill Map just built, or `none — project conventions`"), "MUST NOT name an uninstalled skill");
  assert.ok(t.includes("(`software-architect` → `references/backend-routing.md`)"), "points at the matrix by name");
  assert.ok(t.includes("The block holds **no matrix rows**"), "no matrix rows");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-7: Safe Update — a backend bullet after the existing Safe Update bullet preserves the block", () => {
  const bullets = modeBullets();
  assert.equal(bullets.length, 4, "four mode-policy bullets");
  const safe = bullets.filter((l) => l.startsWith("- **Active AKILI-SPECS (Safe Update):**"));
  assert.equal(safe.length, 1, "exactly one Safe Update bullet (the existing one)");
  const backend = bullets.filter((l) => l.includes("`### Backend routing`"));
  assert.equal(backend.length, 1, "one backend policy bullet");
  assert.ok(!backend[0].startsWith("- **Active AKILI-SPECS (Safe Update):**"), "the backend bullet is not a second Safe Update label");
  assert.ok(bullets.indexOf(backend[0]) > bullets.indexOf(safe[0]), "the backend bullet follows the Safe Update bullet");
  assert.ok(backend[0].startsWith("- The `### Backend routing` block follows the same three policies"), "backend bullet opens on the three policies");
  assert.ok(backend[0].includes("preserved and only newly detected evidence proposed (Safe Update)"), "preserved, only new evidence proposed");
  assert.ok(safe[0].includes("never restated matrix rows"), "Safe Update never restates matrix rows");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-7 NFR-4: Design routing and Backend routing are sibling items of Step 8D", () => {
  const s = step8D();
  const d = index(s, "4. **A `### Design routing` block under `## Skill Map`, when the project has UI.**");
  const b = index(s, "5. **A `### Backend routing` block under `## Skill Map`");
  assert.ok(d < b, "item 4 (design) precedes item 5 (backend)");
  assert.ok(item4(s).includes("`impeccable-bridge` → `references/design-routing.md`"), "item 4 keeps its matrix pointer");
  assert.ok(!item4(s).includes("Backend"), "item 4 does not mention backend");
});

// ---------------------------------------------------------------- FR-8

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-8: docs/skills software-architect and governance name the backend matrix", () => {
  const sa = section(read("docs", "skills", "software-architect.md"), "Backend Routing Matrix");
  assert.ok(sa.includes("`references/backend-routing.md`"), "software-architect doc names the file");
  for (const s of ["*Decision rule*", "*Matrix*", "*Expertise cards*", "*Backend route line*"]) assert.ok(sa.includes(s), `names section ${s}`);
  const gov = read("docs", "skills", "governance.md");
  assert.ok(gov.includes("backend (`software-architect` → `references/backend-routing.md`)"), "governance names the backend matrix");
  assert.ok(gov.includes("are each held once") && gov.includes("never a line number, and never copies a row"), "governance: held once, no line pointers");
});

// ---------------------------------------------------------------- FR-9

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-9: Go layering routes to golang-pro project-structure.md", () => {
  const gl = section(matrix(), "Go layering").trim();
  assert.ok(gl.startsWith("Go package layering routes to `golang-pro` → `references/project-structure.md`."), "Go layering route");
  assert.ok(gl.includes("a Go mapping there is a recorded follow-up"), "the Go mapping is deferred");
  assert.ok(row("module-design", "significant").support.includes("Go → `golang-pro` `references/project-structure.md`"), "module-design/significant support carries the layout");
});

// ---------------------------------------------------------------- amendments A-3..A-6

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-2 A-3 A-5: rule 4 names three sources and the row decides between them", () => {
  const r4 = rules()["4"];
  assert.ok(r4.startsWith("**Three named sources may lead** when no skill is loaded for the decision:"), "three named sources");
  const order = ["*existing design*", "*the spec's scenarios*", "*project conventions*"].map((s) => index(r4, s));
  assert.deepEqual([...order].sort((a, b) => a - b), order, "in order: existing design, spec's scenarios, project conventions");
  assert.ok(r4.endsWith("Each row's Lead cell names which one leads; where more than one could apply, the row decides."), "A-5 sentence");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-4 A-6: error-model owns retry, its card cites When to Use This Skill, no backoff anywhere", () => {
  const em = row("error-model", "any");
  assert.equal(em.lead, "`error-handling-patterns`");
  assert.ok(em.rule.includes("recovery (retry, circuit breaker, aggregation, graceful degradation)"), "row names retry");
  const c = card("error-handling-patterns");
  assert.ok(c.expert.includes("retry"), "card names retry");
  assert.ok(c.evidence.includes("`error-handling-patterns/SKILL.md` → *When to Use This Skill*"), "card cites When to Use This Skill");
  const when = section(read(".claude", "skills", "error-handling-patterns", "SKILL.md"), "When to Use This Skill");
  assert.match(when, /\bretry\b/, "the cited section states retry (the card claims nothing its text lacks)");
  assert.doesNotMatch(matrix(), /backoff/i, "backoff appears nowhere in the matrix");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing NFR-1 A-4: the matrix carries no spec-local IDs", () => {
  const ids = matrix().match(/\b(?:DD|KZ|FR|NFR)-\d+\b|\bB-J-?\w*|\b[AP]-\d+\b/g) || [];
  assert.deepEqual(ids, [], `spec IDs in the matrix: ${ids.join(", ")}`);
});

// ---------------------------------------------------------------- NFR-6 / NFR-7

test("@akili-spec changes/go-backend-routing/backend-skill-routing NFR-6: the installer ships the matrix byte-identical to every skills root", (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "akili-backend-routing-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const env = { ...process.env, HOME: home, USERPROFILE: home, CODEX_HOME: path.join(home, ".codex"), CURSOR_CONFIG_DIR: path.join(home, ".cursor"), AKILI_GROKBOT_TARGET: path.join(home, "grok", "workflows") };
  for (const tool of ["all", "grokbot"]) {
    const r = spawnSync(process.execPath, [path.join(ROOT, "bin", "akili.js"), "install", "--tool", tool, "--skills-only"], { env, encoding: "utf8" });
    assert.equal(r.status, 0, `install --tool ${tool}: ${r.stderr}`);
  }
  // Claude, OpenCode, Antigravity, the Codex+Cursor shared root, Grok Bot.
  const roots = [".claude/skills", ".config/opencode/skills", ".gemini/skills", ".agents/skills", "grok/workflows"];
  const installed = roots.map((r) => [r, path.join(home, ...r.split("/"), "software-architect", "references", "backend-routing.md")]);
  for (const [r, p] of installed) assert.ok(fs.existsSync(p), `matrix installed under ${r}`);
  const src = fs.readFileSync(path.join(ROOT, ...MATRIX));
  for (const [r, p] of installed) assert.ok(fs.readFileSync(p).equals(src), `byte-identical under ${r}`);
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing NFR-7: section names and card columns match the Design Routing Matrix", () => {
  const b = matrix();
  const d = read(...DESIGN_MATRIX);
  for (const s of ["Decision rule", "Matrix", "Expertise cards", "Attribution"]) {
    assert.ok(h2(b).includes(s), `backend matrix has ## ${s}`);
    assert.ok(h2(d).includes(s), `design matrix has ## ${s}`);
  }
  assert.equal(h2(b)[0], h2(d)[0], "both open with the same section");
  assert.equal(h2(b).at(-1), "Attribution", "backend ends with Attribution");
  assert.equal(h2(d).at(-1), "Attribution", "design ends with Attribution");
  assert.ok(h2(b).includes("Backend route line") && h2(d).includes("Design route line"), "both carry a <domain> route line section");
  for (const [name, s] of [["backend", b], ["design", d]]) {
    assert.equal(section(s, "Expertise cards").split("\n").filter((l) => l.trim().startsWith("| Skill |"))[0].trim(), CARD_HEADER, `${name} card columns`);
  }
});

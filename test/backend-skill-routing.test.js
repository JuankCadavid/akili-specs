"use strict";
// @akili-spec changes/go-backend-routing/backend-skill-routing — one backend-routing matrix, held once, wired and bounded.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const SKILLS = [".claude", "skills"];
const MATRIX_REL = path.join(".claude", "skills", "software-architect", "references", "backend-routing.md");
const matrix = () => read(MATRIX_REL);
const cmd = (n) => read(".claude", "commands", `${n}.md`);
const index = (s, needle) => {
  const i = s.indexOf(needle);
  assert.ok(i >= 0, `missing: ${needle}`);
  return i;
};
// Text from `from` up to (not including) the first `to` after it.
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
const tableRows = (text, headerStart) => {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith(headerStart));
  assert.ok(start >= 0, `table header present: ${headerStart}`);
  const rows = [];
  for (let i = start + 2; i < lines.length && lines[i].startsWith("|"); i++) rows.push(lines[i]);
  return rows;
};

const NINE = ["software-architect", "api-design-principles", "error-handling-patterns", "tdd", "systematic-debugging", "nestjs-expert", "golang-pro", "aws-serverless", "ai-agent-development"];
const ACTIVITIES = ["architecture", "framework-selection", "module-design", "api-contract", "error-model", "implement", "test-first", "test-suite", "bug-diagnosis", "performance"];

const matrixSection = () => section(matrix(), "Matrix");
const matrixRows = () => matrixSection().split("\n").filter((l) => /^\| \*\*[a-z-]+\*\* \|/.test(l));
const cardRows = () => tableRows(matrix(), "| Skill | Expert at | Supports | Must not decide | Evidence |");
const cardName = (r) => (/^`([a-z-]+)`/.exec(cells(r)[0]) || [])[1];
const stackRows = () => tableRows(section(matrix(), "Stack table"), "| Stack (Skill Map) |");
const specifyRule = () => between(cmd("akili-specify"), "Preferred backend skill rule:", "Preferred UI/UX skill rule:");
const specifyExplore = () => between(cmd("akili-specify"), "#### Step 2.1", "#### Step 2.2");
const item5 = () => between(cmd("akili-constitution"), "5. **A `### Backend routing` block", "**Mode-specific policy");
const leaderItem3 = () => between(read(".claude", "templates", "leader.md"), "3. **Delegation Discipline", "   * **The Implementer defaults");
const agentsBackend = () => section(read("AGENTS.md"), "Backend Skills");

// The shipped-tree walk (as in design-skill-routing.test.js): .claude, docs minus docs/specs, AGENTS.md, README.md.
const sweepFiles = () => {
  const skipDir = path.join("docs", "specs");
  const files = [];
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      const r = path.join(rel, e.name);
      if (e.isDirectory()) {
        if (r !== skipDir) walk(r);
      } else if (e.isFile()) files.push(r);
    }
  };
  walk(".claude");
  walk("docs");
  files.push("README.md", "AGENTS.md");
  assert.ok(files.length > 100, `sweep reached the shipped tree (${files.length} files)`);
  assert.ok(!files.some((f) => f.startsWith(skipDir + path.sep)), "docs/specs is never read");
  return files;
};
const textOf = (f) => {
  const buf = fs.readFileSync(path.join(ROOT, f));
  return buf.includes(0) ? null : buf.toString("utf8").replace(/\r\n/g, "\n");
};

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-1 NFR-1: matrix row and card signatures are held once", () => {
  const rows = matrixRows();
  assert.equal(rows.length, 19, "nineteen matrix rows");
  const cards = cardRows();
  assert.equal(cards.length, 9, "nine cards");
  const sigs = [...rows.map((r) => `| ${cells(r)[0]} | ${cells(r)[1]} |`), ...cards.map((r) => `| ${cells(r)[0]} | ${cells(r)[1]} |`)];
  const m = matrix();
  for (const s of sigs) assert.ok(m.includes(s), `matrix holds ${s}`);
  const hits = [];
  for (const f of sweepFiles()) {
    if (f === MATRIX_REL) continue;
    const t = textOf(f);
    if (t === null) continue;
    for (const s of sigs) if (t.includes(s)) hits.push(`${f}: ${s}`);
  }
  assert.deepEqual(hits, [], `signatures restated outside the matrix:\n${hits.join("\n")}`);
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-1 FR-4 FR-8: the nine backend skills agree across folders, cards, matrix rows and AGENTS.md", () => {
  for (const s of NINE) assert.ok(fs.existsSync(path.join(ROOT, ...SKILLS, s, "SKILL.md")), `skill folder ${s}`);
  assert.deepEqual(cardRows().map(cardName).sort(), [...NINE].sort(), "cards name the nine");
  const rowsText = matrixRows().join("\n");
  for (const s of NINE) assert.ok(rowsText.includes(`\`${s}\``), `${s} is named in a Matrix row`);
  const listed = agentsBackend().split("\n").map((l) => (/^- `([a-z-]+)`/.exec(l) || [])[1]).filter(Boolean);
  assert.deepEqual([...listed].sort(), [...NINE].sort(), "AGENTS.md ## Backend Skills names the nine");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-1 FR-3: ten activities, three significant/not pairs, one implement row per stack", () => {
  const rows = matrixRows().map(cells);
  for (const a of ACTIVITIES) assert.ok(rows.some((c) => c[0] === `**${a}**`), `activity ${a} has a row`);
  assert.deepEqual([...new Set(rows.map((c) => c[0]))].sort(), ACTIVITIES.map((a) => `**${a}**`).sort(), "exactly the ten activities");
  for (const a of ["architecture", "module-design", "performance"]) {
    const ctx = rows.filter((c) => c[0] === `**${a}**`).map((c) => c[1]);
    assert.ok(ctx.includes("significant"), `${a} has a significant row`);
    assert.ok(ctx.includes("not significant"), `${a} has a not significant row`);
  }
  const stacks = stackRows().map((r) => cells(r)[0]);
  assert.equal(stacks.length, 5, "five stacks");
  const implCtx = rows.filter((c) => c[0] === "**implement**").map((c) => c[1]);
  assert.deepEqual([...implCtx].sort(), [...stacks].sort(), "one implement row per stack");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-1 FR-2: every Lead cell holds exactly one lead", () => {
  const NAMED = ["existing design", "the spec's scenarios", "project conventions"];
  const RUNTIME = "the agent's runtime skill";
  for (const r of matrixRows()) {
    const c = cells(r);
    assert.equal(c.length, 5, `five cells in ${c[0]} ${c[1]}`);
    const lead = c[2];
    assert.ok(!/ \+ |,| or |\//.test(lead), `${c[0]} ${c[1]}: no list separator in "${lead}"`);
    const one = /^`[a-z-]+`$/.test(lead) || NAMED.includes(lead) || lead.startsWith(RUNTIME);
    assert.ok(one, `${c[0]} ${c[1]}: one skill or named source, not "${lead}"`);
  }
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-2 FR-3: a stack lead appears only on implement and framework-selection rows", () => {
  const STACK = ["golang-pro", "nestjs-expert", "aws-serverless", "ai-agent-development", "the agent's runtime skill"];
  const ALLOWED = ["**implement**", "**framework-selection**"];
  let seen = 0;
  for (const r of matrixRows()) {
    const c = cells(r);
    if (!STACK.some((s) => c[2].includes(s))) continue;
    seen++;
    assert.ok(ALLOWED.includes(c[0]), `${c[0]} ${c[1]}: stack lead "${c[2]}" on an activity that may not have one`);
  }
  assert.ok(seen >= 5, `stack leads found (${seen})`);
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-4: each card's evidence file and heading resolve", () => {
  const bare = (s) => s.replace(/\*\*/g, "").replace(/`/g, "");
  for (const r of cardRows()) {
    const c = cells(r);
    let file = null;
    for (const p of c[4].split(";").map((x) => x.trim())) {
      const m = /^`([^`]+)` → \*(.+)\*$/.exec(p);
      if (m) file = m[1];
      const heading = (/→ \*(.+)\*$/.exec(p) || [])[1];
      assert.ok(heading && file, `${c[0]}: evidence form in "${p}"`);
      const abs = path.join(ROOT, ...SKILLS, file);
      assert.ok(fs.existsSync(abs), `${c[0]}: file resolves: ${file}`);
      const hs = fs.readFileSync(abs, "utf8").replace(/\r\n/g, "\n").split("\n").filter((l) => /^#{1,6} /.test(l)).map((l) => bare(l.replace(/^#+ /, "").trim()));
      assert.ok(hs.includes(bare(heading)), `${c[0]}: heading "${heading}" exists in ${file}`);
    }
  }
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing NFR-1: no file:line pointers in the matrix, the specify rule, Step 8D item 5 or AGENTS.md", () => {
  const ptr = /\.(md|js):\d+/;
  for (const [name, t] of [["matrix", matrix()], ["specify backend rule", specifyRule()], ["Step 8D item 5", item5()], ["AGENTS.md Backend Skills", agentsBackend()]]) {
    assert.ok(t.length > 200, `${name} non-trivial`);
    assert.doesNotMatch(t, ptr, `${name} holds no line pointer`);
  }
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-5 FR-6 FR-7 FR-9: the matrix is wired into specify, Step 8D, the leader and software-architect", () => {
  const explore = specifyExplore();
  assert.ok(explore.includes("backend-routing.md"), "specify Step 2.1 names the matrix");
  const rule = specifyRule();
  assert.ok(rule.includes("backend-routing.md"), "specify Step 3.2 names the matrix");
  assert.ok(rule.includes("Backend route:"), "specify Step 3.2 names the route line");
  assert.ok(item5().includes("### Backend routing"), "Step 8D names the block");
  const leader = read(".claude", "templates", "leader.md");
  assert.ok(leaderItem3().includes("`software-architect` → `references/backend-routing.md` names"), "leader item 3 resolves a collision from the matrix");
  assert.ok(leader.includes("UI → `impeccable-bridge`"), "leader keeps the UI example");
  const routing = section(read(...SKILLS, "software-architect", "SKILL.md"), "Routing — load the matching reference");
  assert.ok(routing.split("\n").some((l) => l.startsWith("|") && l.includes("`references/backend-routing.md`")), "software-architect Routing has the row");
  assert.ok(matrix().includes("project-structure.md"), "matrix names project-structure.md");
  assert.ok(fs.existsSync(path.join(ROOT, ...SKILLS, "golang-pro", "references", "project-structure.md")), "project-structure.md exists in golang-pro/references");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-6 FR-7: the specify rule and Step 8D item 5 load-direct no binding-stack skill", () => {
  const stack = fs.readdirSync(path.join(ROOT, ...SKILLS), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(ROOT, ...SKILLS, e.name, "SKILL.md")))
    .filter((e) => /^\s*binding: stack\s*$/m.test(read(...SKILLS, e.name, "SKILL.md")))
    .map((e) => e.name);
  for (const s of ["golang-pro", "api-design-principles", "error-handling-patterns"]) assert.ok(stack.includes(s), `${s} is a stack skill`);
  for (const [name, t] of [["specify rule", specifyRule()], ["Step 8D item 5", item5()]]) {
    assert.deepEqual(stack.filter((s) => t.includes(s)), [], `${name} names no stack skill`);
  }
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-5: a task with no Backend route line runs as today", () => {
  assert.ok(leaderItem3().includes("a task with no `Backend route:` line runs as today"), "legacy task clause");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-5: the brief carries only the lead and support names, never the matrix", () => {
  assert.ok(leaderItem3().includes("The brief carries only the lead and support names, never the matrix"), "names-only clause");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-6: test-first appears only when tdd is listed and the switch is a deviation record", () => {
  const leader = leaderItem3();
  assert.ok(leader.includes("`test-first` only when `tdd` is listed, else `test-suite`"), "leader: test-first only with tdd");
  assert.ok(leader.includes("is a deviation, recorded by the one-line reason"), "leader: the switch is a deviation");
  const rule = specifyRule();
  assert.ok(rule.includes("`test-first` appears on the line only when the task lists `tdd`"), "specify: test-first only with tdd");
  assert.ok(rule.includes("is a deviation record in `execution.md`"), "specify: the switch is a deviation record");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-6 FR-5: a missing backend-routing.md means proceed as today and say so once", () => {
  assert.ok(specifyExplore().includes("when that file is absent, proceed as today and say so once"), "specify Step 2.1 absent-file clause");
  assert.ok(leaderItem3().includes("when `backend-routing.md` is absent, proceed as today and say so once"), "leader absent-file clause");
});

test("@akili-spec changes/go-backend-routing/backend-skill-routing FR-3 FR-7: the specify rule, Step 8D item 5 and the Stack table recommend no install", () => {
  for (const [name, t] of [["specify rule", specifyRule()], ["Step 8D item 5", item5()], ["Stack table", section(matrix(), "Stack table")]]) {
    assert.ok(t.length > 100, `${name} non-trivial`);
    assert.doesNotMatch(t, /\binstall/i, `${name} holds no install advice`);
  }
});

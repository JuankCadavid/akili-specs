"use strict";
// @akili-spec changes/design-skill-routing — one design-routing matrix, held once, wired and bounded.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const SKILLS = [".claude", "skills"];
const MATRIX_REL = path.join(".claude", "skills", "impeccable-bridge", "references", "design-routing.md");
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

const EIGHT = ["impeccable", "impeccable-bridge", "ui-ux-pro-max", "frontend-design", "stitch-design", "gsap-animation", "tailwind-design-system", "shadcn-ui"];
const ACTIVITIES = ["foundation", "direction", "mockup", "build-new", "build-within-system", "refine", "motion", "evaluate"];

const matrixRows = () => matrix().split("\n").filter((l) => /^\| \*\*[a-z-]+\*\* \|/.test(l));
const cardRows = () => {
  const lines = matrix().split("\n");
  const start = lines.findIndex((l) => l.startsWith("| Skill | Expert at | Supports | Must not decide | Evidence |"));
  assert.ok(start >= 0, "cards table header present");
  const rows = [];
  for (let i = start + 2; i < lines.length && lines[i].startsWith("|"); i++) rows.push(lines[i]);
  return rows;
};

// The shipped-tree walk of impeccable-bridge.test.js (FR-11/FR-14), extended with AGENTS.md.
const sweepFiles = () => {
  const skipDirs = [path.join("docs", "specs"), path.join(".claude", "skills", "impeccable")];
  const files = [];
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      const r = path.join(rel, e.name);
      if (e.isDirectory()) {
        if (!skipDirs.includes(r)) walk(r);
      } else if (e.isFile()) files.push(r);
    }
  };
  walk(".claude");
  walk("docs");
  files.push("README.md", "AGENTS.md");
  assert.ok(files.length > 100, `sweep reached the shipped tree (${files.length} files)`);
  assert.ok(files.includes(path.join(".claude", "templates", "leader.md")), "templates in scope");
  assert.ok(!files.some((f) => skipDirs.some((d) => f.startsWith(d + path.sep))), "only the two named folders are excluded");
  return files;
};
const textOf = (f) => {
  const buf = fs.readFileSync(path.join(ROOT, f));
  return buf.includes(0) ? null : buf.toString("utf8").replace(/\r\n/g, "\n");
};

test("@akili-spec changes/design-skill-routing FR-1 B-16: matrix row and card signatures are held once", () => {
  const rows = matrixRows();
  assert.deepEqual(rows.map((r) => cells(r)[0]), ACTIVITIES.map((a) => `**${a}**`), "eight matrix rows");
  const cards = cardRows();
  assert.equal(cards.length, 9, "nine cards");
  const sigs = [...rows.map((r) => `| ${cells(r)[0]} |`), ...cards.map((r) => `| ${cells(r)[0]} | ${cells(r)[1]} |`)];
  const m = matrix();
  for (const s of sigs) assert.ok(m.includes(s), `matrix holds ${s}`);
  const matrixKey = MATRIX_REL;
  const hits = [];
  for (const f of sweepFiles()) {
    if (f === matrixKey) continue;
    const t = textOf(f);
    if (t === null) continue;
    for (const s of sigs) if (t.includes(s)) hits.push(`${f}: ${s}`);
  }
  assert.deepEqual(hits, [], `signatures restated outside the matrix:\n${hits.join("\n")}`);
});

test("@akili-spec changes/design-skill-routing A-14: design skill set agrees across folders, cards and AGENTS.md", () => {
  for (const s of EIGHT) assert.ok(fs.existsSync(path.join(ROOT, ...SKILLS, s, "SKILL.md")), `skill folder ${s}`);
  const cardSkills = cardRows().map((r) => (/^`([a-z-]+)`/.exec(cells(r)[0]) || [])[1] || cells(r)[0]);
  assert.deepEqual(cardSkills.filter((c) => /^[a-z-]+$/.test(c)).sort(), [...EIGHT].sort(), "cards name the eight");
  assert.equal(cardSkills.filter((c) => c.startsWith("other UI stack skills")).length, 1, "one generic card");
  assert.equal(cardSkills.length, 9, "eight + generic");
  const agents = read("AGENTS.md");
  const listed = section(agents, "Design Skills").split("\n").map((l) => (/^- `([a-z-]+)`/.exec(l) || [])[1]).filter(Boolean);
  assert.deepEqual([...listed].sort(), [...EIGHT].sort(), "AGENTS.md ## Design Skills names the eight");
});

test("@akili-spec changes/design-skill-routing W-1: every matrix cell holds exactly one lead", () => {
  const rows = matrixRows();
  assert.equal(rows.length, 8);
  for (const r of rows) {
    const c = cells(r);
    assert.equal(c.length, 5, `five cells in ${c[0]}`);
    for (const cell of c.slice(1)) {
      assert.ok(cell !== "—" && cell !== "", `${c[0]}: cell is not empty`);
      assert.ok(!/ \+ /.test(cell), `${c[0]}: one lead, not "${cell}"`);
    }
  }
});

test("@akili-spec changes/design-skill-routing FR-1: each card's evidence file and heading resolve", () => {
  for (const r of cardRows()) {
    const c = cells(r);
    const parts = c[4].split(";").map((p) => p.trim());
    assert.ok(parts.length >= 1);
    for (const p of parts) {
      const m = /^`([^`]+)` → \*(.+)\*$/.exec(p);
      assert.ok(m, `${c[0]}: evidence form in "${p}"`);
      const [, file, heading] = m;
      const abs = [path.join(ROOT, ...SKILLS, file), path.join(ROOT, file)].find((x) => fs.existsSync(x));
      assert.ok(abs, `${c[0]}: file resolves: ${file}`);
      const text = fs.readFileSync(abs, "utf8").replace(/\r\n/g, "\n");
      const hs = text.split("\n").filter((l) => /^#{1,6} /.test(l)).map((l) => l.replace(/^#+ /, "").replace(/\s+$/, ""));
      // Markup-only folding (bold/backticks) is safe: the heading words and their order still compare exactly.
      const bare = (s) => s.replace(/\*\*/g, "").replace(/`/g, "");
      assert.ok(hs.some((h) => bare(h) === bare(heading)), `${c[0]}: heading "${heading}" exists in ${file}`);
    }
  }
});

test("@akili-spec changes/design-skill-routing A-15b: no file:line pointers in the matrix or the new text", () => {
  const ptr = /\.(md|js):\d+/;
  const specify = cmd("akili-specify");
  const rule = between(specify, "Preferred UI/UX skill rule:", "#### Step 3.3");
  const constitution = cmd("akili-constitution");
  const item = between(constitution, "4. **A `### Design routing` block", "**Mode-specific policy");
  const designSkills = section(read("AGENTS.md"), "Design Skills");
  for (const [name, t] of [["matrix", matrix()], ["specify rule", rule], ["Step 8D item", item], ["AGENTS.md Design Skills", designSkills]]) {
    assert.ok(t.length > 50, `${name} non-trivial`);
    assert.doesNotMatch(t, ptr, `${name} holds no line pointer`);
  }
  // Whole files that carry the new command, persona, bridge and adapted-skill text. Each has zero
  // legitimate file:line text (grep -cE '\.(md|js):[0-9]+' returns 0 for every one), so a hit is a new pointer.
  const WHOLE = [
    [".claude", "templates", "leader.md"],
    [".claude", "templates", "tester.md"],
    [".claude", "commands", "akili-propose.md"],
    [".claude", "commands", "akili-seo.md"],
    [".claude", "skills", "impeccable-bridge", "SKILL.md"],
    [".claude", "skills", "ui-ux-pro-max", "SKILL.md"],
    [".claude", "skills", "frontend-design", "SKILL.md"],
    [".claude", "skills", "stitch-design", "SKILL.md"],
    [".claude", "skills", "gsap-animation", "SKILL.md"],
  ];
  for (const parts of WHOLE) {
    const t = read(...parts);
    assert.ok(t.length > 500, `${parts.join("/")} non-trivial`);
    assert.doesNotMatch(t, ptr, `${parts.join("/")} holds no line pointer`);
  }
});

test("@akili-spec changes/design-skill-routing FR-13: no shipped file keeps the superseded design phrasing", () => {
  const SWEEP = [
    "Implementer loads Impeccable's craft floor",
    "Craft floor before UI edits",
    "Use `frontend-design`, `ui-ux-pro-max`",
    "Recommend generating the mockup with the `stitch-design`",
    "`ui-ux-pro-max` if available",
    "load `gsap-animation` and read the reference file matching the task",
    "UI → `ui-ux-pro-max`",
    "animation → `gsap-animation`",
    "Use `gsap-animation` for animation work",
  ];
  const hits = [];
  for (const f of sweepFiles()) {
    const t = textOf(f);
    if (t === null) continue;
    t.split("\n").forEach((line, i) => {
      for (const p of SWEEP) if (line.includes(p)) hits.push(`${f.split(path.sep).join("/")}:${i + 1}: ${p}`);
    });
  }
  assert.deepEqual(hits, [], `stale design phrasing:\n${hits.join("\n")}`);
});

test("@akili-spec changes/design-skill-routing FR-2..FR-10: the matrix is wired into specify, bridge, propose, seo, constitution and the leader", () => {
  const specify = cmd("akili-specify");
  assert.ok(specify.includes("design-routing") && specify.includes("Design route:"), "specify names the matrix and the route line");
  const bridge = read(".claude", "skills", "impeccable-bridge", "SKILL.md");
  const phaseBuild = section(bridge, "Phase map").split("\n").find((l) => l.startsWith("| Build"));
  assert.ok(phaseBuild && phaseBuild.includes("design-routing"), "Phase map build row names the matrix");
  const who = section(bridge, "Who does what in each state").split("\n").find((l) => l.startsWith("| `/akili-execute`"));
  assert.ok(who && who.includes("design-routing"), "Who does what execute row names the matrix");
  const propose = cmd("akili-propose");
  const mock = between(propose, "#### Mockup Fallback (No Visual Input)", "**Design evaluation as a source.**");
  assert.ok(index(mock, "direction picker") < index(mock, "stitch-design"), "picker is offered before Stitch");
  assert.ok(cmd("akili-seo").includes("impeccable-bridge"), "seo names the bridge");
  assert.ok(cmd("akili-constitution").includes("### Design routing"), "Step 8D names the block");
  assert.ok(read(".claude", "templates", "leader.md").includes("UI → `impeccable-bridge`"), "leader UI example");
});

test("@akili-spec changes/design-skill-routing FR-3: the rule paragraph and Step 8D item load-direct no stack skill", () => {
  const stack = fs.readdirSync(path.join(ROOT, ...SKILLS), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(ROOT, ...SKILLS, e.name, "SKILL.md")))
    .filter((e) => /^\s*binding: stack\s*$/m.test(read(...SKILLS, e.name, "SKILL.md")))
    .map((e) => e.name);
  for (const s of ["tailwind-design-system", "shadcn-ui", "angular-developer"]) assert.ok(stack.includes(s), `${s} is a stack skill`);
  const rule = between(cmd("akili-specify"), "Preferred UI/UX skill rule:", "#### Step 3.3");
  const item = between(cmd("akili-constitution"), "4. **A `### Design routing` block", "**Mode-specific policy");
  for (const [name, t] of [["specify rule", rule], ["Step 8D item", item]]) {
    const named = stack.filter((s) => t.includes(s));
    assert.deepEqual(named, [], `${name} names no stack skill`);
  }
});

test("@akili-spec changes/design-skill-routing FR-4: the Build route is code-led, answers from design.md else Pivot, and skips the finish review", () => {
  const route = section(matrix(), "Build route");
  assert.ok(route.includes("**Code-led, against the recorded direction.**"), "code-led step");
  assert.ok(route.includes("answered from the spec's design"), "questions answered from design.md");
  assert.ok(route.includes("a spec gap, handled by the Pivot Protocol and never decided by the Implementer"), "else Pivot");
  assert.ok(route.includes("finish review: not run (AKILI execute)"), "finish review not run");
  assert.ok(route.includes("degraded inline finish pass is never run in the build thread either"), "no inline finish pass");
});

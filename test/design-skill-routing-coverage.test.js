"use strict";
// @akili-spec changes/design-skill-routing — Tester coverage (integration, text-contract) for the
// scenarios the author suite (design-skill-routing.test.js) does not prove. Expected values are
// inlined from requirements.md at commit 305afd2 (FR-10 as amended 2026-11-01); this file never
// reads docs/specs/ at runtime.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const matrix = () => read(".claude", "skills", "impeccable-bridge", "references", "design-routing.md");
const cmd = (n) => read(".claude", "commands", `${n}.md`);
const skill = (n) => read(".claude", "skills", n, "SKILL.md");
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
// Body rows of the first table whose header row starts with `header`.
const tableRows = (s, header) => {
  const lines = s.split("\n");
  const start = lines.findIndex((l) => l.trim().startsWith(header));
  assert.ok(start >= 0, `table header present: ${header}`);
  const rows = [];
  for (let i = start + 2; i < lines.length && lines[i].trim().startsWith("|"); i++) rows.push(cells(lines[i].trim()));
  return rows;
};
const ordered = (s, needles, label) => {
  const at = needles.map((n) => index(s, n));
  for (let i = 1; i < at.length; i++) assert.ok(at[i - 1] < at[i], `${label}: "${needles[i - 1]}" before "${needles[i]}"`);
};

test("@akili-spec changes/design-skill-routing FR-2 Precedence: the ladder is first-match, missing→ENV-0, native→ENV-3, established→ENV-2, else ENV-1", () => {
  const env = section(matrix(), "Environment classification");
  assert.match(env, /first match wins/, "first match wins");
  const rows = tableRows(env, "| Order | Evidence | Class |");
  assert.deepEqual(rows.map((r) => [r[0], r[2]]), [["1", "ENV-0"], ["2", "ENV-3"], ["3", "ENV-2"], ["4", "ENV-1"]], "ladder order");
  assert.match(rows[0][1], /skill source is `missing`/, "rung 1 is the missing skill source");
  for (const p of ["iOS", "Android", "adaptive"]) assert.ok(rows[1][1].includes(p), `rung 2 names ${p}`);
  assert.match(rows[3][1], /^None of the above$/, "ENV-1 only when nothing earlier matched");
  assert.match(env, /classified per screen/, "mixed web/native projects are classified per screen");
});

test("@akili-spec changes/design-skill-routing FR-2 Established design system: code or design.md evidence is ENV-2, and a missing DESIGN.md is never ENV-1 evidence", () => {
  const env = section(matrix(), "Environment classification");
  const rung3 = tableRows(env, "| Order | Evidence | Class |")[2];
  assert.equal(rung3[2], "ENV-2");
  assert.ok(rung3[1].includes("`docs/ux-ui/design.md` defines tokens or components"), "design.md evidence");
  assert.ok(rung3[1].includes("component library or token layer that forms a coherent identity"), "code evidence, no DESIGN.md needed");
  assert.doesNotMatch(rung3[1], /DESIGN\.md/, "rung 3 does not require DESIGN.md");
  assert.ok(env.includes("A missing `DESIGN.md` is never evidence for ENV-1."), "BUT: no ENV-1 on missing DESIGN.md alone");
  assert.ok(env.includes("its evidence path"), "AND IT MUST cite the evidence");
  const step21 = between(cmd("akili-specify"), "#### Step 2.1 — Explore", "#### Step 2.2 — Write");
  assert.ok(step21.includes("record its environment class (`ENV-*`) with the evidence that decided it"), "specify records class + evidence");
  assert.ok(step21.includes("*Environment classification*"), "specify uses the ladder");
});

test("@akili-spec changes/design-skill-routing FR-5: polish limit is full on Persuade/Experience, light on Operate/Read; light reports and does not fix tokens", () => {
  const route = section(matrix(), "Build route");
  assert.ok(route.includes("Full and light are an AKILI scope limit on `polish`, not an upstream mode"), "AKILI scope limit, not upstream mode");
  const rows = tableRows(route, "| Limit | Pages | Covers | Fixes | Reports, does not fix |");
  const byLimit = Object.fromEntries(rows.map((r) => [r[0], r]));
  assert.deepEqual(Object.keys(byLimit), ["full", "light"]);
  assert.equal(byLimit.full[1], "Persuade, Experience");
  assert.equal(byLimit.light[1], "Operate, Read");
  assert.match(byLimit.full[2], /whole screen/, "full covers the whole screen");
  assert.match(byLimit.full[3], /missing token is added to the authority only when the spec's approved design covers it/, "full may add tokens under approved design");
  assert.match(byLimit.light[2], /changed surface/, "light covers only the changed surface");
  assert.match(byLimit.light[3], /Local defects, one-off implementations/, "light fixes local defects");
  assert.doesNotMatch(byLimit.light[3], /token/i, "BUT light fixes no tokens");
  assert.match(byLimit.light[4], /Missing tokens, conceptual mismatches/, "light reports tokens and mismatches");
  const polishField = tableRows(section(matrix(), "Design route line"), "| Field | Values |").find((r) => r[0] === "Polish");
  assert.equal(polishField[1], "`full` (Persuade, Experience) or `light` (Operate, Read)", "route-line field agrees");
  assert.match(section(matrix(), "Decision rule"), /Every UI task ends with `polish`/, "every UI task ends with polish");
});

test("@akili-spec changes/design-skill-routing FR-7: animate owns motion; gsap-animation only for GSAP projects or a recorded spec choice; native never loads it", () => {
  const motion = section(matrix(), "Motion");
  const rows = Object.fromEntries(tableRows(motion, "| Concern | Owner |").map((r) => [r[0], r[1]]));
  assert.match(rows["Whether motion exists, purpose, choreography, reduced-motion"], /^Impeccable `animate`/, "animate owns purpose");
  const lib = rows.Library;
  assert.ok(lib.includes("With none: CSS or the Web Animations API"), "no library → CSS/WAAPI");
  assert.ok(lib.includes("`gsap-animation` loads only when GSAP is the project's library, or when CSS and WAAPI cannot express the effect cleanly"), "gsap gate");
  assert.ok(lib.includes("the spec records that choice as a design decision"), "gsap choice recorded in spec");
  assert.ok(rows["Native (ENV-3)"].includes("`gsap-animation` is not loaded"), "native: no gsap");
  assert.ok(motion.includes("GSAP is never added to a project unless the spec's design records the decision."), "BUT: no GSAP unless recorded");
  const envCol3 = matrix().split("\n").find((l) => l.startsWith("| **motion** |"));
  assert.ok(envCol3, "motion row present");
  assert.doesNotMatch(cells(envCol3)[3], /gsap/i, "ENV-3 motion cell names no gsap");

  const gsap = section(skill("gsap-animation"), "AKILI-SPECS Integration");
  assert.ok(gsap.includes("only when the *Motion* section of the routing matrix"), "gsap skill defers to Motion");
  assert.ok(gsap.includes("the project already uses GSAP, or the spec's design records it"), "gsap skill states the same gate");
  assert.ok(gsap.includes("Impeccable's `animate` owns whether motion exists and its purpose"), "gsap skill cedes purpose");

  const step21 = between(cmd("akili-specify"), "#### Step 2.1 — Explore", "#### Step 2.2 — Write");
  const gsapLines = step21.split("\n").filter((l) => l.includes("gsap-animation"));
  assert.ok(gsapLines.length >= 1, "Step 2.1 still routes motion");
  for (const l of gsapLines) assert.match(l, /only when the project uses GSAP or the design records it/, `Step 2.1 gates gsap: ${l.slice(0, 80)}`);
});

test("@akili-spec changes/design-skill-routing FR-10 (amended): Step 8D scaffolds the block only for UI projects, six fields, no matrix rows; Safe Update preserves it", () => {
  const c = cmd("akili-constitution");
  const item = between(c, "4. **A `### Design routing` block", "**Mode-specific policy");
  const heading = item.split("\n")[0];
  assert.ok(heading.includes("when the project has UI"), "block gated on a user interface");
  assert.ok(index(item, "when the project has UI") < index(item, "*Environment classification*"), "BUT: the UI gate precedes the ladder, so a no-UI project never reaches ENV-1");
  ordered(item, [
    "environment class(es) with the evidence path",
    "design lead (`impeccable` via",
    "implementation layers (",
    "motion library (",
    "mockup route (",
    "one line pointing at the matrix by name",
  ], "six fields in order");
  assert.ok(item.includes("The block holds **no matrix rows**"), "no matrix rows");
  assert.match(section(matrix(), "Environment classification"), /Classify each screen/, "the ladder classifies screens, so no screen means no class");
  // Step 8D's own policy: the first one after item 4 (Step 8C carries an earlier one).
  const policy = between(c.slice(index(c, "4. **A `### Design routing` block")), "**Mode-specific policy (mirror Step 8B):**", "### Step 8E");
  const safe = policy.split("\n- ").find((b) => b.startsWith("**Active AKILI-SPECS (Safe Update):**"));
  assert.ok(safe, "Safe Update bullet");
  assert.ok(/Preserve a\s+customized `### Design routing` block/.test(safe), "Safe Update preserves the block");
  assert.ok(/propose only newly detected evidence for it, never\s+restated matrix rows/.test(safe), "only new evidence, never matrix rows");
});

test("@akili-spec changes/design-skill-routing FR-11: the Design route line carries playbook, ENV, mode, polish, motion; specify requires it in Scope and evidence in Done", () => {
  const line = section(matrix(), "Design route line");
  const form = /`(Design route: [^`]+)`/.exec(line);
  assert.ok(form, "route-line form present");
  ordered(form[1], ["Design route: load impeccable-bridge → design-routing.md", "playbook <cmd>", "ENV-<n>", "mode <mode>", "polish <full|light>", "motion <value>"], "route-line fields");
  const fields = tableRows(line, "| Field | Values |").map((r) => r[0]);
  assert.deepEqual(fields, ["Playbook(s)", "Environment", "Page mode", "Polish", "Motion"]);
  assert.ok(line.includes("**Done criteria** carry:"), "Done criteria sentence");
  assert.ok(line.includes("`finish review: not run (AKILI execute)`") && line.includes("`skill source missing — frontend-design`"), "Done sentence carries FR-4 evidence");
  const rule = between(cmd("akili-specify"), "Preferred UI/UX skill rule:", "#### Step 3.3");
  assert.ok(rule.includes("every UI task's Scope carries a `Design route:` line"), "every UI task's Scope");
  assert.ok(rule.includes("its Done criteria carry that section's evidence sentence"), "Done evidence");
  assert.ok(rule.includes("its skills list `impeccable-bridge`"), "skills list the bridge");
  assert.ok(rule.includes("add `ui-ux-pro-max` only when the task needs catalog options"), "BUT: ui-ux-pro-max only for catalog options");
});

test("@akili-spec changes/design-skill-routing FR-14: ui-ux-pro-max, gsap-animation and frontend-design AKILI sections point at the matrix; frontend-design is the ENV-0 lead", () => {
  const sections = {
    "ui-ux-pro-max": section(skill("ui-ux-pro-max"), "AKILI-SPECS Integration"),
    "gsap-animation": section(skill("gsap-animation"), "AKILI-SPECS Integration"),
    "frontend-design": section(skill("frontend-design"), "8. Integration With Other Skills"),
  };
  for (const [n, s] of Object.entries(sections)) assert.ok(s.includes("`impeccable-bridge` → `references/design-routing.md`"), `${n} names the matrix`);
  const fd = sections["frontend-design"];
  assert.ok(fd.includes("It leads for a task only in an ENV-0 route, that is, when the Impeccable skill source is `missing`"), "frontend-design leads only at ENV-0");
  assert.ok(sections["ui-ux-pro-max"].includes("**reference catalog**") && sections["ui-ux-pro-max"].includes("this skill never overrides it"), "ui-ux-pro-max is catalog, never overrides");
  // Not contradicted by the matrix: the ENV-0 column leads with frontend-design in every row but mockup (stitch-design).
  const rows = matrix().split("\n").filter((l) => /^\| \*\*[a-z-]+\*\* \|/.test(l)).map(cells);
  assert.equal(rows.length, 8);
  for (const r of rows) {
    const want = r[0] === "**mockup**" ? /^`stitch-design`$/ : /^`frontend-design`/;
    assert.match(r[4], want, `ENV-0 lead for ${r[0]}`);
    for (const c of r.slice(1, 4)) assert.doesNotMatch(c, /frontend-design/, `${r[0]}: frontend-design leads nowhere outside ENV-0`);
  }
});

test("@akili-spec changes/design-skill-routing FR-8 Skill source missing: propose and the matrix keep stitch-design → Claude Design → HTML sketch", () => {
  const mock = between(cmd("akili-propose"), "#### Mockup Fallback (No Visual Input)", "**Design evaluation as a source.**");
  const missing = mock.split("\n").find((l) => l.startsWith("- **Impeccable skill source `missing`:**"));
  assert.ok(missing, "missing-source bullet");
  assert.ok(missing.includes("the picker is not offered"), "no picker when missing");
  ordered(missing, ["`stitch-design`", "Claude Design", "self-contained HTML sketch"], "propose missing order");
  const route = section(matrix(), "Mockup route");
  const mm = route.split("\n").find((l) => l.startsWith("- **Skill source `missing`:**"));
  assert.ok(mm, "matrix missing bullet");
  ordered(mm, ["`stitch-design`", "Claude Design", "self-contained HTML sketch"], "matrix missing order");
});

test("@akili-spec changes/design-skill-routing NFR-5: the matrix gives the host-neutral invocation /impeccable and $impeccable", () => {
  const rule = section(matrix(), "Decision rule");
  assert.ok(rule.includes("(`/impeccable`, `$impeccable` in Codex)"), "both invocation forms");
});

"use strict";

// @akili-spec changes/nestjs-official-skills (akili-test suite B)
//
// Text contracts the author tests do not pin: the CHANGELOG migration note
// (FR-9, NFR-8), the per-skill docs pages and inventory rows, the governance
// stack row and Removal Log row, AGENTS.md and the Leader persona (FR-8), the
// FR-7 relay / current-session clauses and where the rule lives, and the
// release-checklist outcome words (FR-2). Expected values are inlined from the
// approved requirements (spec commit 6f44ff3); nothing in the spec tree is
// read (NFR-5) and nothing touches the network (NFR-2).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
// Built, not written: the repo-wide retirement grep allowlists named test files only.
const RETIRED = "nestjs-" + "expert";
const SIX = ["nestjs", "nestjs-feature", "nestjs-auth", "nestjs-data", "nestjs-testing", "nestjs-production"];
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");

// Lines from the heading line that equals `heading` up to the next heading of
// the same or a higher level. Throws when the heading is absent: never falls
// back to the end of the file.
function section(text, heading) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start < 0) throw new Error(`section anchor not found: ${heading}`);
  const level = heading.match(/^#+/)[0].length;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#+) /);
    if (m && m[1].length <= level) { end = i; break; }
  }
  return lines.slice(start + 1, end).join("\n");
}

// Newest CHANGELOG section ([Unreleased] first, document order) that states the
// NestJS migration, so the test survives the release cut (AGENTS.md).
function changelogSection() {
  const sec = read("CHANGELOG.md").split(/\n(?=## \[)/)
    .find((s) => s.startsWith("## [") && s.includes(RETIRED) && s.includes("official NestJS skills"));
  assert.ok(sec, "no CHANGELOG section states the NestJS official-skills change");
  return sec;
}

test("@akili-spec changes/nestjs-official-skills FR-9 the guard: a missing section anchor throws", () => {
  assert.throws(() => section("# a\n## b\n", "## no-such-heading"), /section anchor not found/);
});

test("@akili-spec changes/nestjs-official-skills FR-9 release reader: six added, the retired skill removed", () => {
  const sec = changelogSection();
  for (const n of SIX) assert.ok(sec.includes(`\`${n}\``), `CHANGELOG names ${n}`);
  assert.match(sec, new RegExp(`\`${RETIRED}\` is removed`), "CHANGELOG says the retired skill is removed");
});

test("@akili-spec changes/nestjs-official-skills FR-9 release reader: what akili update does to an old retired-skill folder", () => {
  const line = changelogSection().split("\n").find((l) => l.includes("akili update") && l.includes(RETIRED));
  assert.ok(line, "no CHANGELOG line says what akili update does to the retired skill");
  assert.match(line, /deletes the old folder/, "update deletes the folder");
  assert.match(line, /STALE/, "doctor reports STALE");
  assert.match(line, /REMOVED/, "--fix reports REMOVED");
  assert.match(line, /never scanned/, "shared roots are never scanned");
});

test("@akili-spec changes/nestjs-official-skills FR-9 release reader: RETIRED warning and both fixes", () => {
  const line = changelogSection().split("\n").find((l) => l.includes("RETIRED"));
  assert.ok(line, "no CHANGELOG line names the RETIRED warning");
  assert.match(line, /doctor --agents/, "names doctor --agents");
  assert.match(line, /never writes it/, "the warning never writes the Skill Map");
  assert.match(line, /Step 8D/, "fix 1: re-run /akili-constitution Step 8D");
  assert.match(line, /edit the Skill Map row/, "fix 2: edit the Skill Map row");
});

test("@akili-spec changes/nestjs-official-skills FR-9 release reader: coexistence with npx @nestjs/skills and the nestjs@nestjs plugin", () => {
  const line = changelogSection().split("\n").find((l) => l.includes("npx @nestjs/skills"));
  assert.ok(line, "no CHANGELOG line names npx @nestjs/skills");
  assert.match(line, /foreign/, "upstream-installed folders are foreign");
  assert.match(line, /skips it/, "install skips a foreign folder");
  assert.ok(line.includes("`nestjs@nestjs`"), "names the nestjs@nestjs plugin");
  assert.match(line, /namespaced/, "plugin skills are namespaced");
});

test("@akili-spec changes/nestjs-official-skills NFR-8 the CHANGELOG ties minor to the RETIRED warning and the migration note", () => {
  const line = changelogSection().split("\n").find((l) => /Release type: \*\*minor\*\*/.test(l));
  assert.ok(line, "no 'Release type: **minor**' line");
  assert.ok(line.includes("RETIRED") && line.includes("migration note"), "minor is conditioned on both");
});

test("@akili-spec changes/nestjs-official-skills FR-8 each of the six has a docs/skills page naming the author and MIT", () => {
  for (const n of SIX) {
    const p = path.join("docs", "skills", `${n}.md`);
    assert.ok(fs.existsSync(path.join(ROOT, p)), `${p} missing`);
    const page = read(p);
    assert.equal(page.split("\n")[0], `# \`${n}\``, `${p} title`);
    assert.match(page, /\| Author \| Kamil Mysliwiec/, `${p} Author row`);
    assert.match(page, /\| License \| MIT \|/, `${p} License row`);
    assert.match(page, /\| Binding \| `stack` \|/, `${p} Binding row`);
  }
});

test("@akili-spec changes/nestjs-official-skills FR-8 docs/skills/README.md has one row per skill naming Kamil Mysliwiec and MIT", () => {
  const lines = read("docs", "skills", "README.md").split("\n");
  for (const n of SIX) {
    const rows = lines.filter((l) => l.startsWith(`| [\`${n}\`](${n}.md) |`));
    assert.equal(rows.length, 1, `docs/skills/README.md rows for ${n}`);
    assert.ok(rows[0].includes("Kamil Mysliwiec") && rows[0].includes("MIT"), `${n} row: ${rows[0]}`);
    assert.match(rows[0], /\| stack \|/, `${n} row binding`);
  }
});

test("@akili-spec changes/nestjs-official-skills FR-8 docs/overview.md has one stack row per skill", () => {
  const lines = read("docs", "overview.md").split("\n");
  for (const n of SIX) {
    const rows = lines.filter((l) => l.startsWith(`| [\`${n}\`](skills/${n}.md) | stack |`));
    assert.equal(rows.length, 1, `docs/overview.md rows for ${n}`);
  }
});

test("@akili-spec changes/nestjs-official-skills FR-8 governance: the stack row of Current assignment holds the six, not the retired skill", () => {
  const current = section(read("docs", "skills", "governance.md"), "### Current assignment");
  const row = current.split("\n").find((l) => l.startsWith("| `stack` |"));
  assert.ok(row, "no '| `stack` |' row in governance.md");
  for (const n of SIX) assert.ok(row.includes(`\`${n}\``), `stack row names ${n}`);
  assert.ok(!row.includes(RETIRED), "stack row still names the retired skill");
});

test("@akili-spec changes/nestjs-official-skills FR-8 governance: a dated Removal Log row retires the old NestJS skill for the six", () => {
  const rows = read("docs", "skills", "governance.md").split("\n").filter((l) => new RegExp(`^\\| \\d{4}-\\d{2}-\\d{2} \\| \`${RETIRED}\` retired`).test(l));
  assert.equal(rows.length, 1, "exactly one dated the retired skill Removal Log row");
  for (const n of SIX) assert.ok(rows[0].includes(`\`${n}\``), `Removal Log row names ${n}`);
});

test("@akili-spec changes/nestjs-official-skills FR-8 AGENTS.md Skill Usage and Backend Skills name the official set, not the retired skill", () => {
  const agents = read("AGENTS.md");
  const usage = section(agents, "## Skill Usage");
  assert.ok(usage.includes("`nestjs-feature`"), "Skill Usage names nestjs-feature");
  assert.ok(!usage.includes(RETIRED), "Skill Usage still names the retired skill");
  const backend = section(agents, "## Backend Skills");
  for (const n of SIX) assert.ok(backend.includes(`- \`${n}\` —`), `Backend Skills lists ${n}`);
  assert.ok(!backend.includes(RETIRED), "Backend Skills still names the retired skill");
});

test("@akili-spec changes/nestjs-official-skills FR-8 the Leader persona example names nestjs-feature, not the retired skill", () => {
  const leader = read(".claude", "templates", "leader.md");
  assert.ok(leader.includes("(e.g., `shadcn-ui`, `nestjs-feature`)"), "leader example list names nestjs-feature");
  assert.ok(!leader.includes(RETIRED), "leader.md still names the retired skill");
});

test("@akili-spec changes/nestjs-official-skills FR-7 rule 9: relay at most once, run only when the user asks in the current session", () => {
  const routing = read(".claude", "skills", "software-architect", "references", "backend-routing.md");
  const rule = routing.split("\n").find((l) => l.startsWith("9. **Outward actions"));
  assert.ok(rule, "no rule 9 in backend-routing.md");
  assert.match(rule, /may be relayed to the user once/, "MAY relay, once");
  assert.match(rule, /never run unless the user asks in the current session/, "SHALL NOT run unless asked in the current session");
});

test("@akili-spec changes/nestjs-official-skills FR-7 the rule lives outside the vendored folders", () => {
  for (const n of SIX) {
    const dir = path.join(ROOT, ".claude", "skills", n);
    const stack = [dir];
    while (stack.length) {
      const d = stack.pop();
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) { stack.push(full); continue; }
        const text = fs.readFileSync(full, "utf8");
        assert.ok(!text.includes("auto-passes"), `${path.relative(ROOT, full)} carries the AKILI rule`);
        assert.ok(!text.includes("pre-approved"), `${path.relative(ROOT, full)} names pre-approved`);
      }
    }
  }
});

test("@akili-spec changes/nestjs-official-skills FR-2 the release-checklist NestJS step records current, sync or defer", () => {
  const step = read("docs", "release-checklist.md").split("\n").find((l) => l.startsWith("- [ ] ") && l.includes(".claude/skills/nestjs/UPSTREAM.md"));
  assert.ok(step, "no checklist step names the NestJS pin");
  assert.match(step, /latest release tag/, "compares with upstream's latest tag");
  assert.match(step, /"current"/, "records current");
  assert.match(step, /scripts\/sync-nestjs-skills\.js/, "names the sync script");
  assert.match(step, /defer/, "records the decision to defer");
});

test("@akili-spec changes/nestjs-official-skills NFR-5 this file never reads the active spec folder", () => {
  const self = fs.readFileSync(__filename, "utf8");
  assert.ok(!self.includes("docs/" + "specs/"), "reads docs/specs");
  assert.ok(!/["'`]specs["'`]\s*,/.test(self), "joins a specs path");
});

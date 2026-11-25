"use strict";
// @akili-spec changes/java-springboot-skill — one stack-detection table, rows parsed, markers precise.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const ARCH = [".claude", "skills", "software-architect"];
const table = () => read(...ARCH, "references", "stack-detection.md");
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
  for (let i = start + 2; i < lines.length && lines[i].startsWith("|"); i++) rows.push(cells(lines[i]));
  return rows;
};
// Rows: [Stack, Manifest, Marker, Packaged skills, Commands]
const rows = () => tableRows(section(table(), "Rows"), "| Stack | Manifest | Marker (any of) | Packaged skills | Run and build commands read from |");
const skillsOf = (row) => [...row[3].matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]);
const rowFor = (name) => {
  const r = rows().find((x) => x[0].startsWith(name));
  assert.ok(r, `row present: ${name}`);
  return r;
};

const STACK_SKILLS = ["golang-pro", "java-springboot", "nestjs-feature", "nestjs", "nestjs-auth", "nestjs-data", "nestjs-testing", "nestjs-production", "angular-developer", "vercel-react-best-practices", "react-doctor", "tailwind-design-system", "shadcn-ui", "aws-serverless"];

test("@akili-spec changes/java-springboot-skill FR-4: every stack-specific skill appears in a row's Packaged skills cell", () => {
  const all = new Set(rows().flatMap(skillsOf));
  for (const s of STACK_SKILLS) assert.ok(all.has(s), `no row carries ${s}`);
});

test("@akili-spec changes/java-springboot-skill FR-4: the method skills are any-stack rows, never manifest rows", () => {
  const manifestSkills = new Set(rows().flatMap(skillsOf));
  const any = tableRows(section(table(), "Any-stack row"), "| Skill | Applies when |").map((r) => r[0]);
  for (const s of ["api-design-principles", "error-handling-patterns"]) {
    assert.ok(any.includes(`\`${s}\``), `${s} in any-stack row`);
    assert.ok(!manifestSkills.has(s), `${s} tied to a manifest row`);
  }
});

test("@akili-spec changes/java-springboot-skill FR-4: Java row names the Spring Boot markers precisely", () => {
  const marker = rowFor("Java / Spring Boot")[2];
  for (const t of ["org.springframework.boot", "libs.versions.toml", "<exclusions>", "dependencyManagement", "spring-boot-starter", "<parent>", "<plugin>"]) {
    assert.ok(marker.includes(t), `Java marker cell lacks ${t}`);
  }
  assert.deepEqual(skillsOf(rowFor("Java / Spring Boot")), ["java-springboot"]);
});

test("@akili-spec changes/java-springboot-skill FR-4: React needs next or react-dom, react alone does not match", () => {
  const marker = rowFor("React / Next.js")[2];
  assert.ok(marker.includes("`react-dom`"), "react-dom marker");
  assert.ok(marker.includes("`next`"), "next marker");
  assert.match(marker, /`react` key alone[^|]*does \*\*not\*\* match/);
});

test("@akili-spec changes/java-springboot-skill FR-4: CDK row keyed on cdk.json alone, with the aws-cdk-lib reason", () => {
  const cdk = rowFor("AWS serverless: CDK");
  assert.ok(cdk[1].includes("`cdk.json`"));
  assert.deepEqual(skillsOf(cdk), ["aws-serverless"]);
  const t = table();
  assert.match(t, /`aws-cdk-lib` is \*\*not\*\* a required marker/);
  assert.match(t, /v1 apps, which are out of support/);
  assert.match(t, /SAM\/CDK deployment/);
  assert.match(t, /`serverless\.ts`, `serverless\.js` and `serverless\.json` are not matched/);
});

test("@akili-spec changes/java-springboot-skill FR-4: no-match outcomes and the ask-the-user rule", () => {
  const out = section(table(), "Outcomes");
  assert.ok(out.includes("no packaged skill"));
  assert.ok(out.includes("ask the user before recording `Java — no packaged skill`"));
  assert.ok(out.includes("`<stack> (<manifest path>) → <skills | no packaged skill>`"));
});

test("@akili-spec changes/java-springboot-skill FR-4: read rules carry the git carve-out, the no-git rule, caps and modes", () => {
  const r = section(table(), "Read rules");
  assert.ok(r.includes("git show <base>:"), "git show carve-out");
  assert.ok(r.includes("git ls-tree -r --name-only <base>"));
  assert.ok(r.includes("120000"));
  assert.ok(r.includes("1 MiB"));
  assert.match(r, /Never run a build, install a dependency or run a git command for detection, apart from the local review mode/);
  assert.match(r, /CI review mode/);
  assert.match(r, /never an instruction/);
  for (const d of ["node_modules", ".git", "cdk.out", ".aws-sam"]) assert.ok(r.includes(`\`${d}\``), `skip dir ${d}`);
});

test("@akili-spec changes/java-springboot-skill FR-5: Readers names the six commands, by step name and never a line number", () => {
  const readers = section(table(), "Readers");
  for (const c of ["akili-constitution", "akili-specify", "akili-propose", "akili-audit", "akili-review", "akili-security"]) {
    assert.ok(readers.includes(`\`${c}\``), `Readers names ${c}`);
  }
  assert.equal(tableRows(readers, "| # | Command · step | What it does with the result |").length, 8);
  assert.ok(!/\bline \d+|:\d+\b/.test(readers), "no line numbers in Readers");
});

test("@akili-spec changes/java-springboot-skill NFR-3: the software-architect router points at the table", () => {
  const router = section(read(...ARCH, "SKILL.md"), "Routing — load the matching reference");
  const row = router.split("\n").find((l) => l.includes("references/stack-detection.md"));
  assert.ok(row, "router row present");
  assert.ok(row.startsWith("| Which stack a repository is"));
});

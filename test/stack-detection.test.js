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

// ---- Constitution sites S1-S3 (T4) ----
const CONS = () => read(".claude", "commands", "akili-constitution.md");
const between = (s, from, to) => {
  const a = s.indexOf(from);
  assert.ok(a >= 0, `missing anchor: ${from}`);
  const b = s.indexOf(to, a + from.length);
  assert.ok(b > a, `missing end anchor: ${to}`);
  return s.slice(a, b);
};
const step5Block = () => between(CONS(), "**Use skills when relevant**", "**Required structure:**");
const step8dItem1 = () => between(CONS(), "1. A table `Skill | Applies To", "2. The instruction:");
const step8dPolicy = () => between(CONS(), "**Mode-specific policy (mirror Step 8B):**\n\n- **Brand-new (Seed Setup):** build the map", "### Step 8E");
const bulletOf = (block, key) => {
  const bullets = block.split(/\n(?=- )/);
  const hit = bullets.find((x) => x.includes(key));
  assert.ok(hit, `bullet for ${key}`);
  return hit.split(/\n\s*\n/)[0];
};
const legacyActive = () => CONS().split("\n").find((l) => l.startsWith("- **Legacy / Active:** derive the contract"));

test("@akili-spec changes/java-springboot-skill FR-5: Constitution Step 5 points at the table and lists java-springboot and react-doctor", () => {
  const b = step5Block();
  assert.ok(b.includes("stack-detection.md"), "Step 5 names stack-detection.md");
  assert.match(b, /software-architect/);
  assert.match(b, /^- `java-springboot`$/m);
  assert.match(b, /^- `react-doctor`$/m);
  assert.match(b, /^- `golang-pro`$/m);
});

test("@akili-spec changes/java-springboot-skill FR-5: Constitution Step 8D names the table, candidates include java-springboot, modes use the table", () => {
  const item1 = step8dItem1();
  assert.ok(item1.includes("stack-detection.md"), "item 1 names the table");
  assert.match(item1, /Candidates shipped with AKILI:[^.]*`java-springboot`/);
  assert.match(item1, /Applies To[^]*manifest/i, "Applies To cell names the matched manifest path");
  const p = step8dPolicy();
  for (const mode of ["Seed Setup", "Discovery Setup", "Safe Update"]) {
    const bullet = bulletOf(p, mode);
    assert.ok(/stack-detection/.test(bullet), `${mode} bullet names the table`);
  }
});

test("@akili-spec changes/java-springboot-skill FR-5: Constitution run contract names the table's commands column", () => {
  const l = legacyActive();
  assert.ok(l, "Legacy / Active bullet present");
  assert.ok(l.includes("stack-detection.md"), "names the table");
  assert.ok(l.includes("Run and build commands read from"), "names the column");
  assert.match(l, /Do not invent commands/);
});

test("@akili-spec changes/java-springboot-skill FR-5: the constitution command restates no marker and cites no line number for the table", () => {
  const c = CONS();
  const forbidden = new Set(["org.springframework.boot", "react-dom", "AWS::Serverless-2016-10-31", "libs.versions.toml", "spring-boot-starter"]);
  for (const r of rows()) for (const m of r[2].matchAll(/`([^`]+)`/g)) {
    const t = m[1];
    if (/^(file present|provider\.name: aws|style|aliases)$/.test(t) || t.startsWith("$")) continue;
    if (/[@.:\/-]/.test(t) || t === "next") forbidden.add(t);
  }
  for (const m of forbidden) {
    if (m === "next") continue; // common word; covered by the specific keys above
    assert.ok(!c.includes(m), `marker restated: ${m}`);
  }
  assert.ok(forbidden.has("@nestjs/core") && forbidden.has("@angular/core"), "forbidden list derived from the Marker column");
  assert.ok(!/stack-detection\.md[^\n]{0,40}(line \d+|:\d+)/.test(c), "no line number after the table path");
  assert.ok((c.match(/stack-detection\.md/g) || []).length >= 3, "at least three pointers");
});

test("@akili-spec changes/java-springboot-skill FR-5: docs/commands/akili-constitution.md stack-skills line mirrors Step 5", () => {
  const line = read("docs", "commands", "akili-constitution.md").split("\n").find((l) => l.startsWith("- Stack skills matching the repo"));
  assert.ok(line, "line present");
  assert.ok(line.includes("`java-springboot`") && line.includes("`react-doctor`"));
});

test("@akili-spec changes/java-springboot-skill FR-5: Step 5 covers the Seed branch and the any-stack skills", () => {
  const b = step5Block();
  assert.match(b, /Discovery, Safe Update/);
  assert.match(b, /declared stack[^\n]*\(Seed/);
  assert.match(b, /any-stack skills/);
});

test("@akili-spec changes/java-springboot-skill FR-5: Applies To is scoped per row kind, never an invented manifest", () => {
  const item1 = step8dItem1();
  assert.match(item1, /produced from a manifest names that manifest path in \*Applies To\*/);
  assert.match(item1, /Seed row names the declared stack/);
  assert.match(item1, /any-stack row[^;]*`api-design-principles`[^;]*`error-handling-patterns`[^;]*never a manifest/);
  assert.match(item1, /environment-provided row/);
  assert.match(item1, /Never invent a manifest path/);
});

test("@akili-spec changes/java-springboot-skill FR-5: Discovery packaged-skill rows come only from the table", () => {
  const d = bulletOf(step8dPolicy(), "Discovery Setup");
  assert.match(d, /Packaged stack-skill rows come only from the table/);
  assert.match(d, /scan evidence[^]*routing blocks[^]*no packaged skill/);
});

// ---- Specify, Propose, Audit sites S4-S6 (T5) ----
const CMD = (n) => read(".claude", "commands", `akili-${n}.md`);
const allTableSkills = () => new Set([
  ...rows().flatMap(skillsOf),
  ...tableRows(section(table(), "Any-stack row"), "| Skill | Applies when |").map((r) => r[0].replace(/`/g, "")),
]);
const specifyFallback = () => between(CMD("specify"), "Use additional stack skills as needed", "When the design has backend work");
const forbiddenMarkers = () => {
  const f = new Set(["org.springframework.boot", "react-dom", "AWS::Serverless-2016-10-31", "libs.versions.toml", "spring-boot-starter"]);
  for (const r of rows()) for (const m of r[2].matchAll(/`([^`]+)`/g)) {
    const t = m[1];
    if (/^(file present|provider\.name: aws|style|aliases)$/.test(t) || t.startsWith("$")) continue;
    if (/[@.:\/-]/.test(t)) f.add(t);
  }
  return f;
};

test("@akili-spec changes/java-springboot-skill FR-5: Specify fallback applies the table and its list holds every skill the table can produce", () => {
  const b = specifyFallback();
  assert.ok(b.includes("stack-detection.md"), "names the table");
  assert.match(b, /software-architect/);
  assert.match(b, /matches no row[^\n]*project conventions/i, "no-match case stated");
});

test("@akili-spec changes/java-springboot-skill FR-5: the specify fallback list holds every skill the table can produce (set derived from the table, never from the list)", () => {
  const listed = new Set([...specifyFallback().matchAll(/^- `([a-z0-9-]+)`$/gm)].map((m) => m[1]));
  const missing = [...allTableSkills()].filter((s) => !listed.has(s));
  assert.deepEqual(missing, [], `specify fallback list lacks: ${missing.join(", ")}`);
});

test("@akili-spec changes/java-springboot-skill FR-3: Specify fallback lists java-springboot and keeps the golang-pro line form", () => {
  const b = specifyFallback();
  assert.match(b, /^- `java-springboot`$/m);
  assert.match(b, /^- `golang-pro`$/m);
});

test("@akili-spec changes/java-springboot-skill FR-5: Propose Step 0 applies the table and Step 2 names the Stack (detected) row", () => {
  const p = CMD("propose");
  const step0 = between(p, "### Step 0: Resolve Path And Load Context", "### Step 1");
  assert.ok(step0.includes("stack-detection.md"), "Step 0 names the table");
  assert.ok(step0.includes("Stack (detected)"), "Step 0 names the row");
  assert.match(step0, /none detected/);
  assert.match(step0, /manifest path/);
  const step2 = between(p, "### Step 2: Write `proposal.md`", "2. Intent");
  assert.ok(step2.includes("Stack (detected)"), "Step 2 item 1 names the row");
});

test("@akili-spec changes/java-springboot-skill FR-5: Audit applies the table and reports Skill Map drift both ways, report-only", () => {
  const a = CMD("audit");
  const scan = between(a, "4. **Key Modules & Dependencies:**", "**Delegation Thresholds");
  assert.ok(scan.includes("stack-detection.md"), "area 4 names the table");
  const step2 = between(a, "### Step 2: Compare Documentation vs. Codebase Reality", "### Step 3");
  const bullet = bulletOf(step2.replace(/^\* /gm, "- "), "Skill Map drift");
  assert.match(bullet, /no matching Skill Map row/);
  assert.match(bullet, /no matching manifest/);
  assert.match(bullet, /[Rr]eport only[^]*never edit/);
  assert.match(bullet, /no `## Skill Map`/);
});

test("@akili-spec changes/java-springboot-skill FR-5: specify, propose and audit restate no marker and cite no line number for the table", () => {
  for (const n of ["specify", "propose", "audit"]) {
    const c = CMD(n);
    for (const m of forbiddenMarkers()) assert.ok(!c.includes(m), `${n} restates marker: ${m}`);
    assert.ok(!/stack-detection\.md[^\n]{0,40}(line \d+|:\d+)/.test(c), `${n}: no line number after the table path`);
    assert.ok(c.includes("stack-detection.md"), `${n} points at the table`);
  }
});

// ---- T5 rework: every input has a stated outcome at S4-S6 ----
test("@akili-spec changes/java-springboot-skill FR-5: Specify fallback states an outcome for a declared stack that matches no row", () => {
  const b = specifyFallback();
  assert.match(b, /manifest or a declared stack that matches no row[^.]*project conventions/i);
  assert.match(b, /neither a manifest nor a declared stack[^.]*project conventions/i);
});

test("@akili-spec changes/java-springboot-skill FR-5: Specify fallback covers the absent table and unread manifests", () => {
  const b = specifyFallback();
  assert.match(b, /stack-detection\.md` is absent[^.]*say so once/i);
  assert.match(b, /not read:/);
});

test("@akili-spec changes/java-springboot-skill FR-5: Propose records unread manifests and uses the table's report line", () => {
  const p = CMD("propose");
  const step0 = between(p, "### Step 0: Resolve Path And Load Context", "### Step 1");
  assert.match(step0, /not read: <path>/);
  assert.match(step0, /`none detected` only when[^.]*no manifest/i);
  const step2 = between(p, "### Step 2: Write `proposal.md`", "2. Intent");
  assert.ok(step2.includes("<stack> (<manifest path>) → <skills | no packaged skill>"), "Step 2 uses the table's report line");
  assert.ok(!step2.includes("<stack (manifest path) →"), "no second shape for the same result");
});

test("@akili-spec changes/java-springboot-skill FR-5: Audit limits drift to stacks with packaged skills and covers absent table and unread manifests", () => {
  const a = CMD("audit");
  const step2 = between(a, "### Step 2: Compare Documentation vs. Codebase Reality", "### Step 3");
  const bullet = bulletOf(step2.replace(/^\* /gm, "- "), "Skill Map drift");
  assert.match(bullet, /has packaged skills/);
  assert.match(bullet, /no packaged skill[^.]*is not drift/i);
  assert.match(bullet, /stack-detection\.md` is absent[^.]*unevaluated/i);
  assert.match(bullet, /not read[^.]*not evaluated|not evaluated[^.]*not read/i);
});

// ---- by-stack page (FR-7): expected sets come from the table and governance, never from the page ----
const PAGE = () => read("docs", "skills", "by-stack.md");
const H2 = (text) => {
  const parts = text.split(/^## /m);
  return { preamble: parts[0], sections: parts.slice(1).map((p) => ({ title: p.split("\n")[0].trim(), body: p.slice(p.indexOf("\n") + 1) })) };
};
const NON_STACK = ["Any stack", "No packaged skill", "Source of truth"];
const stackSections = () => H2(PAGE()).sections.filter((s) => !NON_STACK.includes(s.title));
const linkedSkills = (body) => [...body.matchAll(/\[`([a-z0-9-]+)`\]\(([a-z0-9-]+)\.md\)/g)].map((m) => { assert.equal(m[1], m[2], "link text and target match"); return m[1]; });
const tableGroups = () => {
  const out = [];
  for (const r of rows()) {
    const g = r[0].split(":")[0].replace(/\s*\(.*\)\s*$/, "").trim();
    if (!out.includes(g)) out.push(g);
  }
  return out;
};
const governanceStack = () => {
  const row = section(read("docs", "skills", "governance.md"), "Current assignment").split("\n").find((l) => /^\| `stack` \|/.test(l));
  assert.ok(row, "governance stack row");
  return [...row.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]).filter((n) => n !== "stack");
};

test("@akili-spec changes/java-springboot-skill FR-7: by-stack skills in stack sections plus the two any-stack stack skills equal the governance stack row", () => {
  const fromSections = stackSections().flatMap((s) => linkedSkills(s.body));
  const any = H2(PAGE()).sections.find((s) => s.title === "Any stack");
  assert.ok(any, "## Any stack present");
  const anyStack = linkedSkills(any.body).filter((n) => ["api-design-principles", "error-handling-patterns"].includes(n));
  assert.deepEqual([...new Set([...fromSections, ...anyStack])].sort(), [...governanceStack()].sort());
  assert.equal(new Set(fromSections).size, fromSections.filter((n, i, a) => a.indexOf(n) === i).length);
});

test("@akili-spec changes/java-springboot-skill FR-7: each stack section matches a table stack group, in the table's order, with one aws-serverless section", () => {
  assert.deepEqual(stackSections().map((s) => s.title), tableGroups());
  const aws = stackSections().find((s) => s.title === "AWS serverless");
  for (const w of ["SAM", "Serverless Framework", "CDK", "cdk.json"]) assert.ok(aws.body.includes(w), `AWS section names ${w}`);
});

test("@akili-spec changes/java-springboot-skill FR-7: any-stack names the method skills and a no-skill section exists", () => {
  const any = H2(PAGE()).sections.find((s) => s.title === "Any stack");
  for (const n of ["api-design-principles", "error-handling-patterns", "software-architect", "tdd", "systematic-debugging"]) assert.ok(linkedSkills(any.body).includes(n), `Any stack lacks ${n}`);
  const none = H2(PAGE()).sections.find((s) => s.title === "No packaged skill");
  assert.ok(none, "## No packaged skill present");
  for (const n of ["Python", "Rust", ".NET", "PHP", "Ruby"]) assert.ok(none.body.includes(n), `no-skill list lacks ${n}`);
});

test("@akili-spec changes/java-springboot-skill FR-7: gsap-animation and impeccable sit on one line outside every section", () => {
  const { preamble, sections } = H2(PAGE());
  const line = preamble.split("\n").filter((l) => l.includes("gsap-animation") && l.includes("impeccable"));
  assert.equal(line.length, 1, "one line in the preamble");
  assert.match(line[0], /conditional/i);
  for (const s of sections) assert.ok(!/gsap-animation|`impeccable`/.test(s.body), `section ${s.title} names a frontend conditional skill`);
});

test("@akili-spec changes/java-springboot-skill FR-7: overview, README Learn more, docs hub and skills README link by-stack", () => {
  assert.match(read("docs", "overview.md"), /\]\(skills\/by-stack\.md\)/);
  assert.match(section(read("README.md"), "Learn more"), /\]\(docs\/skills\/by-stack\.md\)/);
  assert.match(read("docs", "README.md"), /\]\(skills\/by-stack\.md\)/);
  assert.match(read("docs", "skills", "README.md"), /\]\(by-stack\.md\)/);
});

test("@akili-spec changes/java-springboot-skill FR-8: java-springboot page carries the facts, the seven sibling names and bounds its security claim", () => {
  const page = read("docs", "skills", "java-springboot.md");
  for (const f of ["GitHub, Inc.", "MIT", "`stack`", "93fc8b9ee3ef56b9b5e7261e6ce92d314cb2c1cf", "4.1.1", "3.5.16", "INDIRECT_PROMPT_INJECTION", "npx skills add https://github.com/github/awesome-copilot --skill <name>"]) assert.ok(page.includes(f), `page lacks ${f}`);
  for (const n of ["java-hibernate-jpa", "spring-boot-testing", "spring-security", "spring-observability", "create-spring-boot-java-project", "java-add-graalvm-native-image-support", "spring-boot-4-migration"]) assert.ok(page.includes(n), `sibling ${n}`);
  assert.match(page, /optional/i);
  assert.match(page, /never vendor/i);
  assert.ok(/stack-detection\.md/.test(page), "Spring-marker rule points at the table");
  assert.ok(!/\bsecure\b|\bsafe\b/i.test(page.replace(/Risk Level SAFE/g, "")), "no security-property claim beyond the ratings");
  assert.match(read("docs", "skills", "governance.md"), /^\| `stack` \|.*`java-springboot`/m);
  assert.match(read("docs", "flow.md"), /^\* \*\*stack\*\*[^\n]*`java-springboot`/m);
});

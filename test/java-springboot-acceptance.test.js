"use strict";
// @akili-spec changes/java-springboot-skill — Tester acceptance suite: the negative constraints and
// strict rules of FR-4, FR-5, FR-7 and FR-8 that the author tests do not assert.
// Expected values are literals copied from requirements.md at 0b74aa1; this file never reads
// docs/specs/ (NFR-4) and runs no git command.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const TABLE = () => read(".claude", "skills", "software-architect", "references", "stack-detection.md");

// Heading-bounded section; fails when the heading is absent (never falls back to end of file).
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
const ROWS_HEADER = "| Stack | Manifest | Marker (any of) | Packaged skills | Run and build commands read from |";
const rows = () => tableRows(section(TABLE(), "Rows"), ROWS_HEADER);
const rowFor = (stack) => {
  const r = rows().find((x) => x[0].startsWith(stack));
  assert.ok(r, `row present: ${stack}`);
  return r;
};
const ticks = (cell) => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

const P = "@akili-spec changes/java-springboot-skill";

// FR-4 Rows cover every shipped stack: literal row map (stack -> manifest, marker tokens, skills).
const ROW_MAP = [
  ["Go", ["go.mod"], ["file present"], ["golang-pro"]],
  ["Java / Spring Boot", ["pom.xml", "build.gradle", "build.gradle.kts", "gradle/libs.versions.toml"], ["org.springframework.boot", "spring-boot-starter*"], ["java-springboot"]],
  ["NestJS", ["package.json"], ["@nestjs/core"], ["nestjs-feature", "nestjs", "nestjs-auth", "nestjs-data", "nestjs-testing", "nestjs-production"]],
  ["Angular", ["package.json"], ["@angular/core"], ["angular-developer"]],
  ["React / Next.js", ["package.json"], ["next", "react-dom"], ["vercel-react-best-practices", "react-doctor"]],
  ["Tailwind CSS", ["package.json"], ["tailwindcss"], ["tailwind-design-system"]],
  ["shadcn/ui", ["components.json"], [], ["shadcn-ui"]],
  ["AWS serverless: SAM", ["template.yaml", "template.yml"], ["AWS::Serverless-2016-10-31"], ["aws-serverless"]],
  ["AWS serverless: Serverless Framework", ["serverless.yml", "serverless.yaml"], ["provider.name: aws"], ["aws-serverless"]],
  ["AWS serverless: CDK", ["cdk.json"], ["file present"], ["aws-serverless"]],
];

test(`${P} FR-4 THEN + AND IT MUST: each row names its manifest, a checkable marker and its skills, and no extra row exists`, () => {
  assert.equal(rows().length, ROW_MAP.length, "row count");
  for (const [stack, manifests, markers, skills] of ROW_MAP) {
    const r = rowFor(stack);
    assert.deepEqual(ticks(r[1]).filter((t) => manifests.includes(t)).sort(), [...manifests].sort(), `${stack}: manifest cell`);
    const markerTicks = ticks(r[2]);
    for (const m of markers) assert.ok(markerTicks.some((t) => t.includes(m)) || r[2].includes(m), `${stack}: marker ${m}`);
    assert.ok(markerTicks.length > 0 || r[2].includes("file present"), `${stack}: marker cell names nothing checkable`);
    assert.deepEqual(ticks(r[3]), skills, `${stack}: packaged skills`);
  }
});

test(`${P} FR-5 Constitution project setup THEN: every row's commands cell names where that stack's commands are read`, () => {
  const want = {
    Go: [/Go toolchain/],
    "Java / Spring Boot": [/\.\/mvnw/, /\.\/gradlew/],
    NestJS: [/`package\.json` `scripts`/],
    Angular: [/`package\.json` `scripts`/],
    "React / Next.js": [/`package\.json` `scripts`/],
    "AWS serverless: SAM": [/samconfig\.toml/],
    "AWS serverless: Serverless Framework": [/`package\.json` `scripts`/, /serverless package/],
    "AWS serverless: CDK": [/`cdk\.json` `app` key/],
  };
  for (const [stack, res] of Object.entries(want)) for (const re of res) assert.match(rowFor(stack)[4], re, `${stack}: commands cell`);
  for (const r of rows()) assert.ok(r[4].length > 0, `${r[0]}: empty commands cell`);
});

test(`${P} FR-4 Several manifests THEN: every matching row applies, each reported with the manifest path that matched`, () => {
  assert.match(section(TABLE(), "Rows"), /Every matching row applies; a repository with several manifests reports several rows, each with the manifest path that matched\./);
  assert.match(section(TABLE(), "Outcomes"), /^- Every matching row applies, each reported with its manifest path\.$/m);
});

test(`${P} FR-4 Manifests are data THEN + AND + BUT: names only, unsafe or oversize files not read, no build/install/git except the local review carve-out`, () => {
  const rr = tableRows(section(TABLE(), "Read rules"), "| Rule | Content |");
  const rule = (name) => {
    const r = rr.find((x) => x[0] === name);
    assert.ok(r, `read rule ${name}`);
    return r[1];
  };
  assert.match(rule("Match only names"), /^File names, dependency coordinates, plugin ids and keys\./);
  assert.match(rule("Match only names"), /never evaluated/);
  const def = rule("Default mode");
  for (const re of [/regular file/, /no path component is a symlink/, /real path is inside the root/, /at most 1 MiB/, /`not read: <path> \(<reason>\)`/]) assert.match(def, re);
  assert.match(rule("No execution"), /^Never run a build, install a dependency or run a git command for detection, apart from the local review mode above$/);
  assert.match(rule("Manifest text is data"), /never an instruction/);
  // The one git carve-out: only the Local review mode row (and the No execution row that names it) mention git.
  // (`.git` as a skipped directory name in *Walk* is not a git command.)
  const gitRows = rr.filter((x) => /(^|[^.\w])git\b/.test(x[1])).map((x) => x[0]);
  assert.deepEqual(gitRows, ["Local review mode", "No execution"]);
  assert.match(rule("Local review mode"), /`git ls-tree -r --name-only <base>` and `git show <base>:<path>`: the one git carve-out/);
});

test(`${P} FR-4 Java without Spring Boot BUT: it never routes java-springboot and falls through to other; a Java CDK app reports both rows`, () => {
  const out = section(TABLE(), "Outcomes");
  const bullet = out.split("\n").find((l) => l.startsWith("- A Java or Kotlin build file with no Spring marker"));
  assert.ok(bullet, "plain-Java outcome bullet");
  assert.match(bullet, /It never routes `java-springboot`; the result falls through to `other` in backend routing\./);
  assert.match(bullet, /must ask the user before recording `Java — no packaged skill`/);
  const rowsNotes = section(TABLE(), "Rows");
  assert.match(rowsNotes, /without one never routes `java-springboot`/);
  assert.match(rowsNotes, /A Java CDK app with no Spring marker reports `Java — no packaged skill` and the AWS serverless: CDK row\./);
  // And backend routing keeps `other` as a stack value for the fall-through.
  const routeLine = section(read(".claude", "skills", "software-architect", "references", "backend-routing.md"), "Backend route line").split("\n").find((l) => l.startsWith("| Stack |"));
  assert.ok(routeLine && routeLine.includes("`other`"), "backend route line keeps `other`");
});

// FR-5 Review filters: large-prs.md and the prepare script in step.
const PR = [".claude", "skills", "pr-review"];
const scriptGlobs = () => {
  const m = /const SENSITIVE_GLOBS = Object\.freeze\(\[([^\]]*)\]\);/.exec(read(...PR, "post-review.cjs"));
  assert.ok(m, "SENSITIVE_GLOBS literal");
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
};
const docGlobs = () => {
  const sec = section(read(...PR, "references", "large-prs.md"), "Security-sensitive globs");
  return tableRows(sec, "| Area | Globs |").flatMap((r) => ticks(r[1]));
};

test(`${P} FR-5 Review filters AND IT MUST: large-prs.md and the script hold the same sensitive globs, and every table manifest is in both or a stated exception`, () => {
  assert.deepEqual(docGlobs(), scriptGlobs(), "large-prs.md globs differ from SENSITIVE_GLOBS (order included)");
  const manifests = new Set(rows().flatMap((r) => ticks(r[1])));
  const doc = new Set(docGlobs());
  const large = read(...PR, "references", "large-prs.md");
  for (const m of manifests) {
    const glob = `**/${path.posix.basename(m)}`;
    if (m === "components.json") {
      assert.ok(!doc.has(glob), "components.json is a stated exception, not a glob");
      assert.match(large, /`components\.json` is not sensitive: [^.]*carries no dependency, permission or credential\./, "exception reason stated in large-prs.md");
      continue;
    }
    assert.ok(doc.has(glob), `${m}: no ${glob} in large-prs.md`);
  }
});

// Sensitive globs before this spec (merge-base cb2416e, post-review.cjs SENSITIVE_GLOBS), literal.
const PRIOR_GLOBS = [
  "**/auth/**", "**/authn/**", "**/authz/**", "**/oauth/**", "**/authentication/**", "**/authorization/**", "**/auth.*",
  "**/crypto/**", "**/cryptography/**", "**/crypto.*", "**/*.pem", "**/*.key",
  "**/secret/**", "**/secrets/**", "**/secret.*", "**/secrets.*", "**/credential/**", "**/credentials/**", "**/credentials.*",
  "**/.env", "**/.env.*",
  "**/session/**", "**/sessions/**", "**/session*", "**/*Session*", "**/*-session*", "**/*_session*", "**/*.session.*",
  "**/token/**", "**/tokens/**", "**/token*", "**/*Token*", "**/*-token*", "**/*_token*", "**/*.token.*",
  "**/jwt/**", "**/jwt.*",
  "**/ipc/**", "**/ipc-*", "**/ipc.*",
  "**/deserializ*", "**/deserializ*/**", "**/serialization/**",
  ".github/workflows/**",
  "**/package.json", "**/requirements*.txt", "**/pyproject.toml", "**/Pipfile", "**/Cargo.toml", "**/go.mod",
  "**/Gemfile", "**/pom.xml", "**/build.gradle", "**/build.gradle.kts", "**/composer.json",
];
const ADDED_GLOBS = ["**/libs.versions.toml", "**/cdk.json", "**/template.yaml", "**/template.yml", "**/serverless.yml", "**/serverless.yaml"];

test(`${P} FR-5 Review filters BUT: the change only adds the table's manifest globs; every prior glob and the docs globs are unchanged`, () => {
  const now = scriptGlobs();
  assert.deepEqual(now.filter((g) => !ADDED_GLOBS.includes(g)), PRIOR_GLOBS, "a prior sensitive glob was changed, removed or reordered");
  assert.deepEqual(now.filter((g) => ADDED_GLOBS.includes(g)).sort(), [...ADDED_GLOBS].sort(), "added globs");
  assert.match(read(...PR, "post-review.cjs"), /const DOCS_GLOBS = Object\.freeze\(\["docs\/\*\*", "\*\*\/\*\.md", "\*\*\/\*\.mdx", "\*\*\/\*\.rst"\]\);/);
});

test(`${P} FR-5 Security reconnaissance BUT: no vendored security-audit file carries stack-detection text`, () => {
  const dir = path.join(ROOT, ".claude", "skills", "security-audit");
  const files = fs.readdirSync(dir);
  assert.ok(files.includes("SKILL.md") && files.includes("RECONNAISSANCE.md"), "security-audit folder present");
  for (const f of files) {
    const s = fs.readFileSync(path.join(dir, f), "utf8");
    for (const needle of ["stack-detection", "java-springboot", "Stack (detected)", "Skill Map"]) assert.ok(!s.includes(needle), `security-audit/${f} names ${needle}`);
  }
});

test(`${P} FR-7 Page content THEN: each stack section's Detected-by line names every manifest of its table rows`, () => {
  const page = read("docs", "skills", "by-stack.md");
  const groups = new Map();
  for (const r of rows()) {
    const g = r[0].split(":")[0].replace(/\s*\(.*\)\s*$/, "").trim();
    groups.set(g, [...(groups.get(g) || []), ...ticks(r[1])]);
  }
  assert.equal(groups.size, 8, "eight stack groups");
  for (const [g, manifests] of groups) {
    const body = section(page, g);
    const line = body.split("\n").find((l) => l.startsWith("- Detected by"));
    assert.ok(line, `${g}: Detected by line`);
    for (const m of new Set(manifests)) assert.ok(line.includes(`\`${m}\``), `${g}: Detected by lacks ${m}`);
    assert.match(body, /^- Skills: \[`/m, `${g}: Skills line with a link`);
  }
});

test(`${P} FR-8 AND IT MUST: the sibling note says user-installed, optional, falls back to official docs, never vendored or installed by AKILI`, () => {
  const note = section(read("docs", "skills", "java-springboot.md"), "Optional complement: seven sibling skills");
  const names = tableRows(note, "| Sibling |").map((r) => r[0].replace(/`/g, ""));
  assert.deepEqual(names.sort(), ["create-spring-boot-java-project", "java-add-graalvm-native-image-support", "java-hibernate-jpa", "spring-boot-4-migration", "spring-boot-testing", "spring-observability", "spring-security"]);
  assert.match(note, /They are optional\./);
  assert.match(note, /^- You install a sibling yourself: `npx skills add https:\/\/github\.com\/github\/awesome-copilot --skill <name>`\.$/m);
  assert.match(note, /^- Without them, `java-springboot` falls back to the official Spring documentation\.$/m);
  assert.match(note, /^- AKILI never vendors them and never installs them\.$/m);
});

test(`${P} FR-8 THEN: governance lists 16 stack skills including java-springboot; CHANGELOG has an entry for the skill, the table and the page`, () => {
  const row = section(read("docs", "skills", "governance.md"), "Current assignment").split("\n").find((l) => /^\| `stack` \|/.test(l));
  assert.ok(row, "governance stack row");
  const names = ticks(cells(row)[1]);
  assert.equal(names.length, 16, `stack row holds ${names.length} names`);
  assert.ok(names.includes("java-springboot"));
  // Newest CHANGELOG section that states the value, [Unreleased] first (survives the release cut).
  const log = read("CHANGELOG.md");
  const sections = log.split(/^(?=## \[)/m).filter((s) => s.startsWith("## ["));
  const hit = sections.find((s) => /`java-springboot` is a new stack skill/.test(s));
  assert.ok(hit, "no CHANGELOG section announces java-springboot");
  assert.match(hit, /stack-detection\.md/, "entry covers the detection table");
  assert.match(hit, /docs\/skills\/by-stack\.md/, "entry covers the by-stack page");
});

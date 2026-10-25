"use strict";

// @akili-spec changes/akili-review (T8, FR-12, FR-11, FR-14, NFR-6)
// Text contract for docs/ci/*.yml. No YAML parser (no dependency): the test slices each template by
// job and asserts literals per design 7.6 row. AKILI_REVIEW_CI_DIR_UNDER_TEST points it at a scratch
// copy so stubs and mutations never touch the shipped templates.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIR = process.env.AKILI_REVIEW_CI_DIR_UNDER_TEST || path.join(ROOT, "docs", "ci");
const read = (p) => fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const SHA = /@[0-9a-f]{40} # v\d+(\.\d+)*$/;
const code = (ls) => ls.filter((l) => !/^\s*#/.test(l)).join("\n");

function load(name) {
  const file = path.join(DIR, `akili-review.${name}.yml`);
  const lines = (fs.existsSync(file) ? read(file) : "").split("\n");
  const start = lines.findIndex((l) => /^jobs:\s*$/.test(l));
  const heads = [];
  lines.forEach((l, i) => { const m = start >= 0 && i > start && /^ {2}([a-z][\w-]*):\s*$/.exec(l); if (m) heads.push([m[1], i]); });
  const jobs = {};
  heads.forEach(([n, i], k) => { jobs[n] = lines.slice(i, k + 1 < heads.length ? heads[k + 1][1] : lines.length); });
  for (const n of ["review", "post"]) jobs[n] = jobs[n] || [];
  return { whole: lines.join("\n"), lines, jobs, head: lines.slice(0, start < 0 ? lines.length : start).join("\n").replace(/\n#[ ]*/g, " ") };
}

function runLines(ls) { // every line that belongs to a `run:` script
  const out = [];
  ls.forEach((l, i) => {
    const m = /^(\s*)(?:- )?run:\s*(.*)$/.exec(l);
    if (!m) return;
    if (m[2] && !/^[|>]/.test(m[2])) out.push(m[2]);
    else for (let j = i + 1; j < ls.length && (ls[j].trim() === "" || ls[j].search(/\S/) > m[1].length); j++) out.push(ls[j]);
  });
  return out;
}

function steps(ls) { // a job's steps, each as its own line slice
  const out = [];
  ls.forEach((l) => { if (/^ {6}- /.test(l)) out.push([]); if (out.length) out[out.length - 1].push(l); });
  return out;
}
function permBlock(ls) { // the job-level `permissions:` body, nothing past its last key
  const i = ls.findIndex((l) => /^ {4}permissions:\s*$/.test(l));
  const body = [];
  for (let j = i + 1; i >= 0 && j < ls.length && /^ {6}\S/.test(ls[j]); j++) body.push(ls[j].trim());
  return body;
}

for (const rt of ["claude", "codex"]) {
  const t = load(rt);
  const review = code(t.jobs.review);
  const post = code(t.jobs.post);
  const cfg = rt === "claude" ? ".claude" : ".agents";

  test(`${rt}: FR-12.1 trigger and gating`, () => {
    assert.match(code(t.lines), /^on:\n {2}pull_request:\n {4}types: \[opened, synchronize, ready_for_review, reopened\]/m);
    assert.doesNotMatch(code(t.lines), /pull_request_target/);
    assert.match(review, /github\.event\.pull_request\.draft == false/);
    assert.match(review, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
    assert.match(review, /!contains\(github\.event\.pull_request\.labels\.\*\.name, 'akili-review:skip'\)/);
  });

  test(`${rt}: FR-12.2 review job token is read-only, no OIDC`, () => {
    assert.match(review, /permissions:\n\s+contents: read\n\s+pull-requests: read\n/);
    assert.doesNotMatch(review, /: write/);
    assert.doesNotMatch(code(t.lines), /id-token/);
  });

  test(`${rt}: FR-12.2 post job writes PRs and checks out nothing`, () => {
    assert.match(post, /needs: review/);
    assert.match(post, /permissions:\n\s+pull-requests: write\n\s+contents: read\n/);
    assert.doesNotMatch(post, /actions\/checkout/);
    assert.match(post, /actions\/download-artifact@/);
    assert.match(post, /cancel-in-progress: false/);
    assert.match(post, /group: akili-review-post-\$\{\{ github\.event\.pull_request\.number \}\}/);
    assert.match(post, /timeout-minutes: 5\b/);
  });

  test(`${rt}: FR-12.2 post takes repo, PR and SHAs from the event, never the artifact`, () => {
    for (const [k, v] of [["REPO", "github.repository"], ["PR", "github.event.pull_request.number"], ["BASE_SHA", "github.event.pull_request.base.sha"], ["HEAD_SHA", "github.event.pull_request.head.sha"]]) {
      assert.match(post, new RegExp(`${k}: \\$\\{\\{ ${v.replace(/\./g, "\\.")} \\}\\}`));
    }
    assert.match(post, /post-review\.cjs" post "\$ART\/findings\.json" --manifest "\$ART\/manifest\.json" --repo "\$REPO" --pr "\$PR" --base "\$BASE_SHA" --head "\$HEAD_SHA"/);
    assert.ok(post.includes(`$HOME/${cfg}/skills/pr-review/post-review.cjs`));
  });

  test(`${rt}: FR-12.3 install is global, forced and pinned, in both jobs`, () => {
    for (const body of [review, post]) {
      const installs = body.split("\n").filter((l) => /npx -y akili-specs@/.test(l));
      assert.equal(installs.length, 1);
      assert.match(installs[0], new RegExp(`npx -y akili-specs@\\d+\\.\\d+\\.\\d+ install --tool ${rt} --force$`));
    }
    assert.doesNotMatch(code(t.lines), /--local|--skills-only/);
  });

  test(`${rt}: FR-12.4 the workspace is the PR base and the head lives outside it`, () => {
    assert.match(review, /actions\/checkout@[^\n]*\n\s+with:\n\s+ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}\n\s+fetch-depth: 1\n\s+persist-credentials: false/);
    assert.ok(review.includes('echo "in=$RUNNER_TEMP/akili-input"'));
    assert.ok(review.includes('tar -xzf "$RUNNER_TEMP/head.tgz" -C "$IN/head" --strip-components=1'));
    assert.ok(review.includes('find "$IN/head" -type l -delete'));
    assert.ok(!review.split("\n").some((l) => /github\.workspace|GITHUB_WORKSPACE/.test(l) && /head/.test(l)), "the head tree must not be written under the workspace");
  });

  test(`${rt}: forward pointer T3, check-skip reads the base .akili/review.yml`, () => {
    assert.ok(review.includes('--config "$GITHUB_WORKSPACE/.akili/review.yml"'));
    assert.match(review, /check-skip --repo "\$REPO" --pr "\$PR" --head "\$HEAD_SHA" --out "\$IN" "\$\{CFG\[@\]\}"/);
  });

  test(`${rt}: FR-12.4 values reach run: only through env:`, () => {
    assert.deepEqual(runLines(t.jobs.review.concat(t.jobs.post)).filter((l) => l.includes("${{")), []);
  });

  test(`${rt}: every third-party action is pinned by full SHA with its tag`, () => {
    const uses = t.lines.filter((l) => /^\s*(- )?uses: /.test(l));
    assert.ok(uses.length >= 5);
    for (const l of uses) assert.match(l, SHA, l);
  });

  test(`${rt}: FR-12.6 cost controls and the artifact`, () => {
    assert.match(review, /timeout-minutes: 20\b/);
    assert.match(review, /group: akili-review-\$\{\{ github\.event\.pull_request\.number \}\}\n\s+cancel-in-progress: true/);
    assert.match(t.whole, /^ {4}# paths-ignore:$/m);
    assert.match(review, /actions\/upload-artifact@[^\n]*\n\s+with:\n\s+name: akili-review\n\s+path: \$\{\{ runner\.temp \}\}\/akili-artifact\n\s+if-no-files-found: error/);
    assert.ok(review.includes('cp "$IN/skipped.json"') && review.includes('cp "$IN/manifest.json"'));
  });

  test(`${rt}: FR-11 / FR-12.7 advisory default, pilot line commented`, () => {
    assert.match(code(t.lines), /^\s+--fail-on none$/m);
    assert.doesNotMatch(code(t.lines), /--fail-on (critical|warning)/);
    assert.match(t.whole, /^\s+# +--fail-on critical$/m);
  });

  test(`${rt}: boundary breaches - one base checkout, exact permissions, base config, gated agent`, () => {
    const rs = steps(t.jobs.review);
    const co = rs.filter((st) => st.some((l) => /^\s*(- )?uses: actions\/checkout@/.test(l)));
    assert.equal(co.length, 1, "review must have exactly one actions/checkout");
    assert.equal(t.jobs.review.filter((l) => /uses: actions\/checkout@/.test(l)).length, 1);
    const headRefs = code(t.jobs.review).split("\n").filter((l) => /pull_request\.head\.(sha|ref)/.test(l));
    assert.deepEqual(headRefs.filter((l) => !/^\s+HEAD_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \}\}$/.test(l)), [], "head sha may appear in review only as an env: value");
    assert.deepEqual(permBlock(t.jobs.review), ["contents: read", "pull-requests: read"]);
    assert.deepEqual(permBlock(t.jobs.post), ["pull-requests: write", "contents: read"]);
    const prep = rs.find((st) => /id: input/.test(st.join("\n")));
    assert.ok(prep, "prepare step missing");
    for (const cmd of ["check-skip", "prepare"]) {
      const ln = prep.filter((l) => l.includes(` ${cmd} `) && l.includes("node"));
      assert.equal(ln.length, 1, cmd);
      assert.ok(ln[0].trimEnd().endsWith('"${CFG[@]}"') || /"\$\{CFG\[@\]\}" \|/.test(ln[0]), `${cmd} must pass "\${CFG[@]}"`);
    }
    const agent = rs.find((st) => st.some((l) => /uses: (anthropics\/claude-code-action|openai\/codex-action)@/.test(l)));
    assert.ok(agent, "agent step missing");
    assert.ok(agent.some((l) => /^ {8}if: steps\.input\.outputs\.skip != 'true'$/.test(l)), "agent step must be gated on skip");
    assert.match(code(steps(t.jobs.post).find((st) => /- name: Post/.test(st[0])) || []), /^\s+--fail-on none$/m);
  });

  test(`${rt}: FR-12.8 header states the residual risk and the approval setting`, () => {
    assert.match(t.head, /RESIDUAL RISK/);
    assert.match(t.head, /prompt injection/);
    assert.match(t.head, /"Require approval for all external contributors"/);
    assert.match(t.head, /commit SHAs/);
  });
}

test("claude: FR-12.2 / FR-12.5 job token passed explicitly, read-only tool scope", () => {
  const review = code(load("claude").jobs.review);
  assert.match(review, /^\s+github_token: \$\{\{ secrets\.GITHUB_TOKEN \}\}$/m);
  assert.match(review, /uses: anthropics\/claude-code-action@/);
  assert.match(review, /^\s+anthropic_api_key: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}$/m);
  assert.match(review, /^\s+--allowedTools "Read,Grep,Glob,Task,Skill"$/m);
  const deny = /--disallowedTools "([^"]*)"/.exec(review);
  assert.ok(deny, "--disallowedTools missing");
  for (const d of ["Bash", "Write", "Edit", "NotebookEdit", "WebFetch", "WebSearch", "Read(//proc/**)", "Read(//sys/**)"]) assert.ok(deny[1].split(",").includes(d), `${d} not denied`);
  assert.match(review, /^\s+--max-turns 40$/m);
  assert.match(review, /^\s+--json-schema '\$\{\{ steps\.paths\.outputs\.schema \}\}'$/m);
  assert.match(review, /^\s+--add-dir \$\{\{ steps\.paths\.outputs\.home \}\}\/\.claude$/m);
  assert.match(review, /^\s+--add-dir \$\{\{ steps\.paths\.outputs\.in \}\}$/m);
  assert.match(review, /Follow \$\{\{ steps\.paths\.outputs\.home \}\}\/\.claude\/commands\/akili-review\.md with arguments: \$\{\{ github\.event\.pull_request\.number \}\} --ci --input \$\{\{ steps\.paths\.outputs\.in \}\}/);
  assert.match(review, /STRUCTURED: \$\{\{ steps\.agent\.outputs\.structured_output \}\}/);
  assert.ok(review.includes(`printf '%s' "$STRUCTURED" > "$OUT_DIR/findings.json"`));
});

test("codex: FR-12.2 / FR-12.5 read-only sandbox, schema-constrained output", () => {
  const t = load("codex");
  const review = code(t.jobs.review);
  assert.match(review, /uses: openai\/codex-action@/);
  assert.match(review, /^\s+openai-api-key: \$\{\{ secrets\.OPENAI_API_KEY \}\}$/m);
  assert.match(review, /^\s+sandbox: read-only$/m);
  assert.match(review, /^\s+safety-strategy: drop-sudo$/m);
  assert.match(review, /^\s+output-schema-file: \$\{\{ steps\.paths\.outputs\.home \}\}\/\.agents\/skills\/pr-review\/review-schema\.json$/m);
  assert.match(review, /^\s+output-file: \$\{\{ steps\.paths\.outputs\.out \}\}\/findings\.json$/m);
  assert.ok(review.includes("Follow %s/.agents/skills/akili-review/SKILL.md with arguments: %s --ci --input %s"));
  assert.match(t.head, /read-only shell commands/);
});

test("KZ-002: the scripts, flags and files the templates use exist at HEAD", () => {
  const cjs = read(path.join(ROOT, ".claude", "skills", "pr-review", "post-review.cjs"));
  for (const f of ["prepare --diff", "check-skip --repo", "post <doc> --manifest"]) assert.ok(cjs.includes(`node post-review.cjs ${f}`), f);
  for (const flag of ["--config", "--fail-on", "--out", "--base", "--head", "--repo", "--pr"]) assert.ok(cjs.includes(flag), flag);
  for (const rel of [".claude/commands/akili-review.md", ".claude/skills/pr-review/review-schema.json", ".claude/skills/pr-review/SKILL.md"]) assert.ok(fs.existsSync(path.join(ROOT, rel)), rel);
});

test("FR-14: docs/ci/README.md covers secrets, fail-on, residual risk, approval and the cap", () => {
  const readme = fs.existsSync(path.join(DIR, "README.md")) ? read(path.join(DIR, "README.md")) : "";
  for (const s of ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "--fail-on critical", "Require approval for all external contributors", "Residual risk", "github-actions[bot]", "skipped.json", "akili-review:advisory"]) assert.ok(readme.includes(s), s);
  assert.equal([...readme.matchAll(/at most (\d+) inline/g)].map((m) => +m[1]).join(), "10");
});

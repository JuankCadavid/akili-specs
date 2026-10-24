"use strict";

// @akili-spec changes/video-deliverable-track — static contract tests for the
// packaged bridge skill `video-production` and the command / governance text
// that routes `Deliverable: video` to it. Each test names the requirement it
// proves (requirements.md FR-4, FR-5, FR-6, FR-8, FR-9, FR-10, §7 NFR-1..4;
// design.md §9, DD-8, DD-10, DD-12, §11 P-5, P-22).
//
// These are text contracts: the shipped artifacts ARE prose an agent follows,
// so each test asserts the rule is stated where the agent reads it (the right
// row / line / section), not merely that a word occurs somewhere.
//
// Falsifier hook: VIDEO_PRODUCTION_TEST_ROOT points the text tests at a
// scratch copy of the repo files so a mutation can be run without touching
// the working tree. Unset, the tests read this checkout.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const ROOT = process.env.VIDEO_PRODUCTION_TEST_ROOT || REPO_ROOT;
const SKILL_DIR = path.join(ROOT, ".claude", "skills", "video-production");
const SKILL_MD = path.join(SKILL_DIR, "SKILL.md");
const RENDER_EVIDENCE = path.join(SKILL_DIR, "references", "render-evidence.md");
const GOVERNANCE = path.join(ROOT, "docs", "skills", "governance.md");
const COMMANDS = path.join(ROOT, ".claude", "commands");
const AKILI_BIN = path.join(REPO_ROOT, "bin", "akili.js");

function read(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

// Minimal YAML frontmatter reader: top-level keys and one level of
// two-space-indented `metadata:` children. Values keep surrounding quotes off.
function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "expected a YAML frontmatter block");
  const top = {};
  const nested = {};
  let parent = null;
  for (const line of match[1].split("\n")) {
    const child = line.match(/^ {2}([A-Za-z0-9_-]+):\s*(.*)$/);
    const root = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    const clean = (v) => v.replace(/^"(.*)"$/, "$1");
    if (root) {
      parent = root[1];
      top[parent] = clean(root[2]);
    } else if (child && parent) {
      nested[parent] = nested[parent] || {};
      nested[parent][child[1]] = clean(child[2]);
    }
  }
  return { top, nested, lineCount: match[0].split("\n").length - 1 };
}

// Lines from a `## Heading` up to (not including) the next heading of the
// same or higher level.
function section(text, heading) {
  const lines = text.split("\n");
  const level = heading.match(/^#+/)[0].length;
  const start = lines.findIndex((l) => l.trim() === heading);
  assert.ok(start >= 0, `expected heading "${heading}"`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const h = lines[i].match(/^(#+)\s/);
    if (h && h[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

// A numbered list item ("N. **…") through the line before the next numbered
// item or the next blank line that is followed by a non-indented line.
function numberedRule(text, n) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`${n}. **`));
  assert.ok(start >= 0, `expected numbered rule ${n}`);
  const out = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\d+\. \*\*/.test(lines[i]) || lines[i].trim() === "") break;
    out.push(lines[i]);
  }
  return out.join(" ").replace(/\s+/g, " ");
}

function countOf(text, needle) {
  return text.split(needle).length - 1;
}

const skillText = () => read(SKILL_MD);
const skillLines = () => skillText().split("\n");

// ---------------------------------------------------------------------------

test("FR-8: frontmatter is the original-authorship variant (name, MIT, author, conditional, inspired-by credits HyperFrames/HeyGen/Apache-2.0; no source/adapted-by)", () => {
  const { top, nested } = frontmatter(skillText());
  assert.equal(top.name, "video-production");
  assert.doesNotMatch(top.name, /^hyperframes-/, "FR-8 BUT: must NOT be named hyperframes-*");
  assert.equal(top.license, "MIT");
  const meta = nested.metadata || {};
  assert.equal(meta.author, "Juan Carlos Cadavid — jcadavid.com");
  assert.equal(meta.binding, "conditional");
  assert.ok(meta["inspired-by"], "expected metadata.inspired-by");
  for (const credit of ["HyperFrames", "HeyGen", "Apache-2.0"]) {
    assert.ok(meta["inspired-by"].includes(credit), `inspired-by must credit ${credit}`);
  }
  for (const key of ["source", "adapted-by"]) {
    assert.ok(!(key in meta) && !(key in top), `original-authorship skill must not carry ${key}`);
  }
});

test("FR-8 BUT: 'HeyGen' appears only on the inspired-by line, install-route lines, and the Attribution section (never presented as a HeyGen product)", () => {
  const text = skillText();
  const lines = text.split("\n");
  const attrStart = lines.findIndex((l) => l.trim() === "## Attribution");
  assert.ok(attrStart >= 0, "expected an Attribution section");
  const offenders = [];
  lines.forEach((line, i) => {
    if (!/heygen/i.test(line)) return;
    const inspired = /^\s+inspired-by:/.test(line);
    const installRoute = /npx skills add heygen-com\//.test(line);
    const attribution = i > attrStart;
    if (!inspired && !installRoute && !attribution) offenders.push(`${i + 1}: ${line}`);
  });
  assert.deepEqual(offenders, [], "HeyGen named outside the allowed sites");
  assert.match(section(text, "## Attribution"), /not a HeyGen product/);
});

test("NFR-3: bridge skill is at most 3 files and at most 20,000 bytes", () => {
  const files = listFiles(SKILL_DIR);
  assert.equal(files.length, 3, `expected exactly 3 files, got ${files.map((f) => path.relative(SKILL_DIR, f)).join(", ")}`);
  const bytes = files.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  assert.ok(bytes <= 20000, `expected ≤ 20000 bytes, got ${bytes}`);
});

test("NFR-2 / DD-8: every instructed `npx hyperframes` subcommand is in the verified set; outward actions are only named on the consent-rule line", () => {
  const allowed = new Set(["check", "snapshot", "render", "preview", "skills update", "skills check"]);
  const outward = /\b(feedback|publish|cloud|lambda|cloudrun)\b|--file-issue/i;
  const seen = new Set();
  const misplaced = [];
  for (const file of listFiles(SKILL_DIR)) {
    const rel = path.relative(SKILL_DIR, file);
    read(file).split("\n").forEach((line, i) => {
      for (const m of line.matchAll(/npx hyperframes ([a-z-]+)(?: ([a-z-]+))?/g)) {
        const sub = m[1] === "skills" ? `skills ${m[2]}` : m[1];
        seen.add(sub);
        assert.ok(allowed.has(sub), `${rel}:${i + 1} instructs unverified subcommand "npx hyperframes ${sub}"`);
      }
      assert.doesNotMatch(
        line,
        /npx hyperframes (feedback|publish|cloud|lambda|cloudrun)\b|npx hyperframes [^`|]*--file-issue/,
        `${rel}:${i + 1} instructs an outward action`
      );
      if (outward.test(line) && !/\*\*Consent rule\.\*\*/.test(line)) misplaced.push(`${rel}:${i + 1}: ${line}`);
    });
  }
  assert.deepEqual(misplaced, [], "outward actions named outside the consent rule");
  for (const sub of ["check", "snapshot", "render"]) assert.ok(seen.has(sub), `expected the skill to instruct ${sub}`);
});

test("FR-5: telemetry off by default and every outward action needs consent each time", () => {
  const privacy = section(skillText(), "## Privacy and outward actions");
  assert.match(privacy, /Prefix every HyperFrames command with `HYPERFRAMES_NO_TELEMETRY=1` unless the user has opted in/);
  const consent = privacy.split("\n").find((l) => /\*\*Consent rule\.\*\*/.test(l));
  assert.ok(consent, "expected the consent rule line");
  for (const name of ["`feedback`", "`--file-issue`", "`publish`", "`cloud`", "`lambda`", "`cloudrun`"]) {
    assert.ok(consent.includes(name), `consent rule must name ${name}`);
  }
  assert.match(consent, /explicit consent \*\*each time\*\*/);
  assert.match(consent, /earlier consent does not carry over/);
  assert.match(consent, /post-render report; under AKILI that suggestion is \*\*off\*\*/, "FR-5 scenario: post-render feedback report is NOT sent");
});

test("FR-4: availability gate accepts standalone and plugin-namespaced router; missing router stops without improvising or installing", () => {
  const gate = section(skillText(), "## Step 0 — Availability gate (before any video work)");
  assert.match(gate, /`hyperframes` \(standalone install\)/);
  assert.match(gate, /plugin-namespaced router such as `\/hyperframes:hyperframes`/);
  const missing = gate.split("\n").find((l) => l.startsWith("| Router missing"));
  assert.ok(missing, "expected a Router missing row");
  assert.match(missing, /\*\*STOP\.\*\*/);
  assert.match(missing, /do not hand-write a video pipeline/i);
  assert.match(missing, /do not copy HyperFrames text into the repo/);
  assert.match(missing, /do not install anything without the user's consent/);
});

test("FR-4 / DD-10 (P-24): agent install route is project-scoped (no -g); `skills update` is labelled global and consent-gated", () => {
  const lines = skillLines();
  const route = lines.find((l) => l.includes("npx skills add heygen-com/hyperframes --yes"));
  assert.ok(route, "expected the non-interactive core-set route");
  const cmd = route.match(/`(npx skills add heygen-com\/hyperframes --yes[^`]*)`/)[1];
  assert.doesNotMatch(cmd, /(^|\s)(-g|--global)(\s|$)/, "project-scoped route must not carry -g/--global");
  assert.match(cmd, /--skill hyperframes /);
  assert.match(route, /project-scoped/);
  const update = lines.find((l) => l.includes("`npx hyperframes skills update`") && l.startsWith("| Global install"));
  assert.ok(update, "expected the Global install row naming skills update");
  assert.match(update, /\*\*globally\*\*/);
  assert.match(update, /explicit consent/);
});

test("FR-4 (A3, first render): consent row warns of the browser download, home caches and network before any render", () => {
  const row = skillLines().find((l) => l.startsWith("| First render on a machine"));
  assert.ok(row, "expected the First render render-rule row");
  assert.match(row, /Before the first render, draft or delivery/);
  assert.match(row, /headless browser \(~200 MB\) into `~\/\.cache\/hyperframes`/);
  assert.match(row, /`~\/\.hyperframes`/);
  assert.match(row, /needs network/);
  assert.match(row, /render only after the user consents/);
  assert.match(row, /runtime caches, not a skill install/);
});

test("FR-4 (A3, freshness scope): `skills check` is stated as global-only and never certifies a project install", () => {
  const row = skillLines().find((l) => l.startsWith("| `npx hyperframes skills check`"));
  assert.ok(row, "expected the skills check command row");
  assert.match(row, /Reads only the user's global skills directory/);
  assert.match(row, /never certifies a project install/);
  assert.match(row, /`skills-lock\.json`/);
});

test("NFR-4 / FR-3: one row per host with its `--agent` id and project-scoped directory", () => {
  const hosts = section(skillText(), "## Step 0 — Availability gate (before any video work)")
    .split("\n")
    .filter((l) => /^\| (Claude Code|OpenCode|Codex|Cursor|Antigravity) \|/.test(l))
    .map((l) => l.split("|").map((c) => c.trim()).filter(Boolean));
  const expected = [
    ["Claude Code", "`claude-code`", "`.claude/skills`"],
    ["OpenCode", "`opencode`", "`.agents/skills`"],
    ["Codex", "`codex`", "`.agents/skills`"],
    ["Cursor", "`cursor`", "`.agents/skills`"],
    ["Antigravity", "`antigravity`", "`.agents/skills`"],
  ];
  assert.deepEqual(hosts, expected, "host table: one row per host, columns Host / --agent id / Directory");
});

test("FR-6 / DD-12: duration compared with BOTH target ± tolerance (default ± 0.1 s) and root data-duration; check exit 0 never offsets it", () => {
  const dur = section(read(RENDER_EVIDENCE), "## Duration comparison");
  assert.match(dur, /Compare `format\.duration` from `ffprobe` with \*\*both\*\*/);
  const rows = dur.split("\n").filter((l) => l.startsWith("| ") && !/^\| (Compared with|---)/.test(l));
  assert.equal(rows.length, 2, "expected exactly two comparison rows");
  assert.ok(rows.some((r) => /target duration, within its stated tolerance \(default \*\*± 0\.1 s\*\* when none is stated\)/.test(r)), "target ± tolerance row with default ± 0.1 s");
  assert.ok(rows.some((r) => /root `data-duration`/.test(r)), "root data-duration row");
  assert.match(dur, /Report FAIL citing both values and the tolerance if either comparison fails/);
  assert.match(dur, /A zero exit from `check` never offsets a duration failure/, "FR-6 BUT: must NOT pass because check exited 0");
});

test("NFR-1 / P-22: `Deliverable: video` gates the specify, test and validate blocks (settled enumeration as lower bounds)", () => {
  const expected = { "akili-specify.md": 5, "akili-test.md": 3, "akili-validate.md": 4 };
  for (const [file, min] of Object.entries(expected)) {
    const n = countOf(read(path.join(COMMANDS, file)), "Deliverable: video");
    assert.ok(n >= min, `${file}: expected ≥ ${min} "Deliverable: video", got ${n}`);
  }
});

test("NFR-1 / FR-1 Default: specify Video Mode states an absent Deliverable row means software", () => {
  const block = section(read(path.join(COMMANDS, "akili-specify.md")), "### Video Mode");
  assert.match(block, /When the proposal's Document Control says `Deliverable: video`/);
  assert.match(block, /An absent `Deliverable` row means `software`: Video Mode does not apply and nothing below changes/);
});

test("FR-9 (amended): governance rule 4 uses load-direct and exempts illustrative / Skill Map-builder mentions", () => {
  const rule4 = numberedRule(read(GOVERNANCE), 4);
  assert.match(rule4, /load-direct/);
  assert.match(rule4, /only when \(a\) the spec records a `Deliverable` selector/);
  assert.match(rule4, /\(b\) that skill's own availability gate runs first/);
  assert.match(rule4, /Illustrative and Skill Map-builder mentions/);
  assert.match(rule4, /direct no load and are not restricted/);
});

test("FR-9 (amended): governance rule 2 no longer states the unconditional 'every command must still work without it'", () => {
  const rule2 = numberedRule(read(GOVERNANCE), 2);
  assert.doesNotMatch(rule2, /every command must still work without it/i);
  assert.match(rule2, /every command still runs without it/);
  assert.match(rule2, /a spec whose `Deliverable` selects an environment-provided skill stops at that skill's availability gate/);
});

test("FR-10 / P-5: `install --tool all --dry-run` lists video-production for every tool target and writes nothing", () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "akili-video-"));
  try {
    const result = spawnSync(process.execPath, [AKILI_BIN, "install", "--tool", "all", "--dry-run"], {
      encoding: "utf8",
      env: {
        ...process.env,
        HOME: home,
        USERPROFILE: home,
        CODEX_HOME: path.join(home, ".codex"),
        CURSOR_CONFIG_DIR: path.join(home, ".cursor"),
        NO_COLOR: "1",
      },
    });
    assert.equal(result.status, 0, `dry-run failed:\n${result.stderr}`);
    const out = result.stdout.replace(/\x1b\[[0-9;]*m/g, "");
    const blocks = out.split(/\n(?=(?:CLAUDE|OPENCODE|ANTIGRAVITY|CODEX|CURSOR) target:)/).slice(1);
    const tools = blocks.map((b) => b.match(/^(\w+) target:/)[1]);
    assert.deepEqual(tools, ["CLAUDE", "OPENCODE", "ANTIGRAVITY", "CODEX", "CURSOR"]);
    for (const block of blocks) {
      const tool = block.match(/^(\w+)/)[1];
      assert.match(block, /would install \S+[\\/]skills[\\/]video-production\b/, `${tool} dry-run does not list video-production`);
    }
    assert.match(out, /dry-run: no files were written/);
    assert.deepEqual(fs.readdirSync(home), [], "dry-run must write nothing into HOME");
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// @akili-spec changes/video-production-hardening — pins for the hardened skill
// text (FR-1..FR-5, FR-10, FR-14). Each test locates a row / line / section
// first, then asserts inside it.

const rowStarting = (text, prefix) => text.split("\n").find((l) => l.startsWith(prefix));
const cells = (row) => row.split("|").slice(1, -1).map((c) => c.trim());
// Numbered item "N. " through the line before the next item or blank line.
function numberedItem(text, n) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`${n}. `));
  assert.ok(start >= 0, `expected numbered item ${n}`);
  const out = [lines[start]];
  for (let i = start + 1; i < lines.length && lines[i].trim() !== "" && !/^\d+\. /.test(lines[i]); i++) out.push(lines[i]);
  return out.join(" ").replace(/\s+/g, " ");
}
const privacyRule = (n) => numberedItem(section(skillText(), "## Privacy and outward actions"), n);
const evidenceFiles = () => section(read(RENDER_EVIDENCE), "## Evidence files");
const skillFiles = () => listFiles(SKILL_DIR).map((f) => [path.relative(SKILL_DIR, f), read(f)]);
// Every line of the skill dir that instructs `npx hyperframes <sub>`.
const commandLines = (sub) => {
  const out = [];
  for (const [rel, text] of skillFiles()) {
    text.split("\n").forEach((line, i) => {
      if (new RegExp(`npx hyperframes ${sub}\\b`).test(line)) out.push({ rel, n: i + 1, line });
    });
  }
  return out;
};

test("FR-1 Default snapshot: every instructed `snapshot` line passes `--describe false`; the rule states it and why", () => {
  const lines = commandLines("snapshot");
  assert.ok(lines.length >= 3, `expected snapshot rows in SKILL.md and render-evidence.md, got ${lines.length}`);
  for (const { rel, n, line } of lines) {
    assert.match(line, /--describe false/, `${rel}:${n} snapshot line lacks --describe false`);
  }
  const consent = privacyRule(2);
  assert.match(consent, /Every `snapshot` passes `--describe false` unless the user consents to describe for that use/);
  assert.match(consent, /`snapshot --describe` \(reported in #6138 to send frames to a third-party model when `GEMINI_API_KEY` is set\)/);
});

test("FR-1 Consent per use: describe consent is per snapshot and does not carry over", () => {
  const consent = privacyRule(2);
  assert.match(consent, /Each use needs the user's explicit consent \*\*each time\*\*/);
  assert.match(consent, /consent for one snapshot does not cover the next/);
});

test("FR-2 Output flag: every snapshot and render line passes `--output` under the spec's evidence folder, one folder per snapshot run", () => {
  for (const sub of ["snapshot", "render"]) {
    for (const { rel, n, line } of commandLines(sub)) {
      const out = line.match(/--output (\S+?)[`\s|]/);
      assert.ok(out, `${rel}:${n} ${sub} line has no --output (no default location)`);
      assert.match(out[1], /^<spec>\/evidence\//, `${rel}:${n} --output must sit under <spec>/evidence/`);
    }
  }
  for (const { rel, n, line } of commandLines("snapshot")) {
    assert.match(line.match(/--output (\S+?)[`\s|]/)[1], /\/$/, `${rel}:${n} snapshot output is a folder`);
  }
  const stills = rowStarting(section(skillText(), "## Commands this skill instructs"), "| `npx hyperframes snapshot --at");
  assert.ok(stills, "expected the beat-stills snapshot row");
  assert.match(stills, /--output <spec>\/evidence\/stills\/<task>-<label>\//);
  assert.match(stills, /one output folder per run, because each run clears its folder/);
  assert.match(evidenceFiles(), /written there by the command's own output flag, one subfolder per snapshot run \(each run clears its output folder\)/);
});

test("FR-2 Sanitize: placeholders and both greps appear in Evidence files item 4, before `git add`", () => {
  const item = numberedItem(evidenceFiles(), 4);
  for (const ph of ["`<HOME>`", "`<CACHE>`", "`<TMP>`"]) assert.ok(item.includes(ph), `sanitize rule must name ${ph}`);
  assert.match(item, /Both greps return nothing before `git add`/);
  const block = evidenceFiles().match(/```bash\n([\s\S]*?)```/);
  assert.ok(block, "expected the grep code block in Evidence files");
  const greps = block[1].trim().split("\n");
  assert.deepEqual(greps, [
    'grep -rn "$HOME" <spec>/evidence/',
    'grep -rnE "/(private/)?var/folders/|/tmp/" <spec>/evidence/',
  ]);
  assert.match(privacyRule(3), /Sanitize evidence before `git add` per `references\/render-evidence\.md` \*Evidence files\*/);
});

test("FR-2 Logs `.txt`: captured logs are .txt and need no .gitignore change", () => {
  const item = numberedItem(evidenceFiles(), 2);
  assert.match(item, /Captured logs are `\.txt`, never `\.log`; no `\.gitignore` change is needed/);
});

test("FR-2 Skill refresh: SKIP_SKILLS prefixes exactly check/snapshot/render/preview/init, never the skills commands; telemetry covers all", () => {
  const rule = privacyRule(1);
  assert.match(rule, /Prefix every HyperFrames command with `HYPERFRAMES_NO_TELEMETRY=1`[^.]*; the `skills` commands are included/);
  const skip = rule.match(/Also prefix ([^:]*) with `HYPERFRAMES_SKIP_SKILLS=1`/);
  assert.ok(skip, "expected the SKIP_SKILLS prefix sentence");
  assert.deepEqual([...skip[1].matchAll(/`([a-z ]+)`/g)].map((m) => m[1]), ["check", "snapshot", "render", "preview", "init"]);
  assert.match(rule, /with `HYPERFRAMES_SKIP_SKILLS=1`: without it `init` checks GitHub and refreshes skills/, "expected the stated reason for SKIP_SKILLS");
  assert.match(rule, /Never put it on `skills update` or bare `skills`: the variable turns them into a silent exit 0/);
  assert.match(rule, /`skills check` carries only the telemetry variable/);
  for (const { rel, n, line } of commandLines("skills")) {
    assert.doesNotMatch(line, /HYPERFRAMES_SKIP_SKILLS=1\s+npx hyperframes skills/, `${rel}:${n} puts SKIP_SKILLS on a skills command`);
  }
});

test("FR-3 Route per host: core-set route is project-scoped with `--agent <id>`; the host table maps each id", () => {
  const gate = section(skillText(), "## Step 0 — Availability gate (before any video work)");
  const route = rowStarting(gate, "| Core set, non-interactive");
  assert.ok(route, "expected the core-set route row");
  assert.match(route, /From the project root, \*\*without `-g`\*\* \(project-scoped\), with `<id>` from the host table/);
  const cmdMatch = route.match(/`(npx skills add [^`]*)`/);
  assert.ok(cmdMatch, "expected the npx skills add command in the route row");
  const cmd = cmdMatch[1];
  assert.match(cmd, /--yes --agent <id> --skill hyperframes --skill hyperframes-cli --skill hyperframes-registry --skill media-use$/);
  assert.doesNotMatch(cmd, /(^|\s)(-g|--global)(\s|$)/, "route must not carry -g/--global");
  const header = rowStarting(gate, "| Host |");
  assert.deepEqual(cells(header), ["Host", "`--agent` id", "Directory"]);
  assert.match(gate, /Project-scoped skill directories by host \(never suggest a global directory, except the consent-gated global route above\)/);
});

test("FR-3 Lock mismatch: Router found row compares skills-lock.json both ways, warns, records, never passes silently", () => {
  const found = rowStarting(section(skillText(), "## Step 0 — Availability gate (before any video work)"), "| Router found");
  assert.ok(found, "expected the Router found row");
  assert.match(found, /If the project has `skills-lock\.json`, list the skills it lists that are not installed under the host's project skill directory, and the installed skills it does not list/);
  assert.match(found, /report both as a warning and record it in `execution\.md`/);
  assert.match(found, /Never pass silently on the router alone when a lock file exists/);
  assert.match(cells(found)[1], /\. Continue$/, "expected the gate to still pass on a found router");
});

test("FR-3 No stale names: every deferral owner is in the core four; captions route to the router", () => {
  const core = new Set(["hyperframes", "hyperframes-cli", "hyperframes-registry", "media-use"]);
  const rows = section(skillText(), "## Deferral table").split("\n").filter((l) => l.startsWith("| ") && !/^\| (Question|---)/.test(l));
  assert.ok(rows.length >= 5, "expected the deferral rows");
  for (const row of rows) {
    const owner = cells(row)[1];
    for (const m of owner.matchAll(/`([^`]+)`/g)) assert.ok(core.has(m[1]), `deferral owner "${m[1]}" is not in the core set`);
  }
  const captions = rows.find((r) => /captions/i.test(cells(r)[0]));
  assert.ok(captions, "expected a row mentioning captions");
  assert.match(cells(captions)[1], /^`hyperframes` \(router\) and its references$/);
  for (const stale of ["hyperframes-core", "hyperframes-animation", "hyperframes-creative", "hyperframes-captions"]) {
    assert.ok(!skillText().includes(stale), `stale skill name ${stale} present`);
  }
});

test("FR-4 Film artifacts: phase map places story.md, SPEC.md, snapshot --review with no second approval", () => {
  const phase = section(skillText(), "## Phase map");
  const story = rowStarting(phase, "| `story.md`");
  assert.ok(story, "expected the story.md row");
  assert.equal(cells(story)[1], "`/akili-propose`", "expected story.md owner");
  assert.match(story, /The Deliverable Outline on the Change track, the Lite proposal's Intent on the Trivial track, the Bug Diagnosis's expected behavior on the Bug track; then `requirements\.md`/, "expected story.md storage");
  assert.match(story, /The storyline pick is that proposal's approval; no second approval/);
  const spec = rowStarting(phase, "| `SPEC.md`");
  assert.ok(spec, "expected the SPEC.md row");
  assert.equal(cells(spec)[1], "`design.md` (beat table and look)", "expected SPEC.md owner");
  assert.match(spec, /stored at the composition root/, "expected SPEC.md storage");
  assert.match(spec, /regenerated, never approved on its own/);
  const review = rowStarting(phase, "| `snapshot --review`");
  assert.ok(review, "expected the snapshot --review row");
  assert.equal(cells(review)[0], "`snapshot --review` and its `REVIEW.md`", "expected REVIEW.md named beside snapshot --review");
  assert.equal(cells(review)[1], "Each execute task's verification", "expected snapshot --review owner");
  assert.match(review, /Run as `snapshot --review --describe false /, "expected --describe false on the review snapshot");
  assert.match(review, /snapshot --review --describe false --output <spec>\/evidence\/review\/<task>\/` with `REVIEW\.md` copied there/, "expected REVIEW.md storage");
  assert.match(review, /it creates no approval of its own/);
  const storyboard = rowStarting(phase, "| Storyboard plan");
  assert.match(storyboard, /The beat table in `design\.md` is the storyboard; its approval is the storyboard approval/, "expected the storyboard rule to hold");
});

test("FR-4 Music bed: criteria row 8 requires a film over about 15 s to state its music bed or n/a", () => {
  const row = rowStarting(read(path.join(SKILL_DIR, "references", "acceptance-criteria.md")), "| 8 |");
  assert.ok(row, "expected criteria row 8");
  assert.match(cells(row)[1], /^Audio$/);
  assert.match(cells(row)[2], /a film over about 15 s states its music bed, or `n\/a — <reason>`/);
});

test("FR-5 Bundled is not local: Fonts row self-hosts every family, cites #6137, rejects a warm-cache check", () => {
  const fonts = rowStarting(section(skillText(), "## Render rules"), "| Fonts |");
  assert.ok(fonts, "expected the Fonts row");
  assert.match(fonts, /Every font family a composition uses is self-hosted: `@font-face` pointing at a local file, "bundled" families included \(#6137 reports they may be fetched from Google Fonts at compile time\)/);
  assert.match(fonts, /cold-font-cache `check` per `references\/render-evidence\.md` item 7; a warm-cache `check` is not evidence/);
  const item7 = rowStarting(read(RENDER_EVIDENCE), "| 7 |");
  assert.match(item7, /"bundled" families are not local \(#6137\)/);
});

test("FR-5 Brand source: criteria row 9 names the font files and their local paths", () => {
  const row = rowStarting(read(path.join(SKILL_DIR, "references", "acceptance-criteria.md")), "| 9 |");
  assert.ok(row, "expected criteria row 9");
  assert.match(cells(row)[1], /^Brand source$/);
  assert.match(cells(row)[2], /names the font files and their local paths/);
});

test("FR-10 Daemon: Quiet tree row treats a running tool daemon as breaking the quiet tree", () => {
  const row = rowStarting(section(skillText(), "## Render rules"), "| Quiet tree |");
  assert.ok(row, "expected the Quiet tree row");
  assert.match(row, /No render, draft or delivery, while a delegated agent is active/);
  assert.match(row, /A running tool daemon also breaks the quiet tree/);
  assert.match(row, /wait for it to exit or stop it, and record which in `execution\.md`/);
});

test("FR-10 One render: Environment row allows one render at a time, a second waits", () => {
  const row = rowStarting(section(skillText(), "## Render rules"), "| Environment |");
  assert.ok(row, "expected the Environment row");
  assert.match(row, /one render at a time: a second render, draft or delivery, waits for the first/);
});

test("FR-14 Motion: defect row gates on stills at transition boundaries then final look; check --at-transitions is not motion", () => {
  const defects = section(read(path.join(SKILL_DIR, "references", "acceptance-criteria.md")), "## Defect class to gate");
  const row = rowStarting(defects, "| Motion:");
  assert.ok(row, "expected the Motion defect row");
  const [klass, gate] = cells(row);
  assert.match(klass, /a transition missing or wrong \(entry, exit, fade\)/);
  assert.match(gate, /^Stills just before and just after each transition boundary, then final look\./);
  assert.doesNotMatch(gate, /^`check`/, "motion must not be gated on check");
  assert.match(gate, /`check --at-transitions` samples overlap and layout at tween boundaries, not motion/);
});

test("NFR-2 / NFR-6: the skill stays 3 files under the cap; this test file reads no active spec folder", () => {
  assert.equal(listFiles(SKILL_DIR).length, 3);
  const self = fs.readFileSync(__filename, "utf8").split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  const forbidden = new RegExp(["join\\([^)]*['\"]", "specs['\"]"].join(""));
  assert.doesNotMatch(self, forbidden, "a test joins a path into docs/specs");
});

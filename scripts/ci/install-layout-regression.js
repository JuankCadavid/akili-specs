// CI gate (FR-4 + FR-1 auto-detection fixture): proves the Codex registry
// generalization (T1, DD-1) produced zero LAYOUT regression on the three
// shipping targets, and that a shared, foreign-populated `~/.agents/skills`
// never causes a false-positive Codex auto-detection (T1 check 5 / W-3).
//
// Part 1 — three-target diff (FR-4, amended — Pivot Record T2):
//   side A = npx --yes akili-specs@<PINNED_VERSION> install --tool <t> --target <tmp-a>
//   side B = node bin/akili.js                      install --tool <t> --target <tmp-b>
// for each of claude, opencode, antigravity.
//   1. Path lists must be identical — any path present on only one side FAILs.
//   2. For a path present on both sides with a differing SHA-256, this is
//      tolerated ONLY when side B's bytes are byte-identical to the
//      working-tree `.claude`/repo source that installed it (a canonical-file
//      edit this spec itself made, e.g. akili-execute.md's Codex paragraphs —
//      never an installer mapping change). Reported as `EXPECTED-DIFF`, does
//      not fail. Any other content diff (source missing, or side B doesn't
//      even match its own source) FAILs — that is an installer bug.
//   3. Per-tool summary: `IDENTICAL <tool>` (byte-for-byte) or
//      `LAYOUT-IDENTICAL <tool> (<n> expected source diffs)` when every diff
//      resolved to (2). Overall exit 0 only when no FAIL occurred anywhere.
// The source mapping (resolveSource below) mirrors bin/akili.js's
// TOOL_REGISTRY + installTool copy operations for these three tools — never
// `require("../../bin/akili.js")`, which runs its CLI as an unconditional
// module side effect (main() at end of file, no require.main guard). Keep
// the mirror in sync with bin/akili.js, same convention as
// scripts/ci/install-symlink-probe.js mirroring the copy primitives.
//
// Part 2 — detection fixture (T1 check 5, W-3): a temp HOME whose shared
// `.agents/skills` root holds only foreign (non-akili) skill directories
// must NOT auto-detect Codex; adding one `akili-<cmd>/SKILL.md` must.
//
// Disqualifier (tasks.md T2): three IDENTICAL lines produced because npx
// resolved a local link (both sides effectively the working tree) is not
// evidence. This script prints the resolved version of side A and refuses
// to trust any result unless it reads exactly PINNED_VERSION.
//
// SKIP semantics: a registry/network failure on the npx call prints
// `SKIP: registry unreachable (<reason>)` and exits 0 — but only for that
// failure class. Any other npx failure (bad args, broken install) is a real
// FAIL, not a SKIP; a SKIP on every leg means the gate never ran and is
// inconclusive, not a PASS (report that distinction in execution.md, not in
// this script's exit code).
//
// Windows-safe: relative-path comparison keys are forward-slash normalized;
// npx runs through npx.cmd with shell:true (the same CVE-2024-27980 shim
// pattern as bin/akili.js's execCliSync); temp dirs come from
// fs.mkdtempSync(path.join(os.tmpdir(), ...)) and are always cleaned up.
//
// No external deps. Node 18 compatible. Exports its pure functions (guarded
// by require.main) so a throwaway harness can unit-test the classification
// rule without a real npx/network round trip — see the T2 falsifier run.

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const BIN = path.join(REPO_ROOT, "bin", "akili.js");
// Pinned published baseline (design.md §7 row 24 / tasks.md T2). Must match
// the akili-specs version that shipped the pre-Codex claude/opencode/
// antigravity layouts unchanged, so a version drift here is a spec update,
// not a silent baseline shift.
const PINNED_VERSION = "2.23.2";
const SHIPPING_TARGETS = ["claude", "opencode", "antigravity"];

const isWindows = process.platform === "win32";
let exitCode = 0;

function fail(message) {
  console.error(message);
  exitCode = 1;
}

function mkTmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function rmTmp(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (e) {
    // best-effort cleanup only
  }
}

// npx ships as npx.cmd on Windows; patched Node throws EINVAL spawning a
// .cmd/.bat file without shell:true (CVE-2024-27980) — the same reason
// bin/akili.js's execCliSync forces a shell on win32. Every argument here is
// a static literal (tool name, pinned version, temp path we just created),
// never untrusted input, so shell:true is safe in this one call site.
function spawnNpx(args, opts) {
  return spawnSync(isWindows ? "npx.cmd" : "npx", args, {
    encoding: "utf8",
    shell: isWindows,
    ...opts,
  });
}

function spawnAkili(args, opts) {
  return spawnSync(process.execPath, [BIN, ...args], { encoding: "utf8", ...opts });
}

// Deliberately specific network/transport-layer error signatures only — NOT
// generic words like "network" or "registry", which also appear in ordinary
// HTTP-status failures (e.g. "404 Not Found - GET https://registry.npmjs.org/
// akili-specs - not in this registry" for an unpublished/mistyped version).
// A broader match would silently SKIP a real install failure instead of
// failing the gate on it — verified against that exact 404 message during
// development (it must NOT match any pattern here).
const NETWORK_FAILURE_PATTERNS = [
  /ECONNREFUSED/i,
  /ECONNRESET/i,
  /ENOTFOUND/i,
  /ETIMEDOUT/i,
  /EAI_AGAIN/i,
  /ENETUNREACH/i,
  /EHOSTUNREACH/i,
  /getaddrinfo/i,
  /FetchError/i,
  /request to .* failed/i,
];

function firstNetworkMatch(text) {
  const clean = stripAnsi(text);
  for (const re of NETWORK_FAILURE_PATTERNS) {
    const m = re.exec(clean);
    if (m) return m[0];
  }
  return null;
}

// bin/akili.js wraps status lines in ANSI color codes with no separating
// whitespace before the reset sequence (e.g. "codex\x1b[0m"), so a naive
// captured-line split/trim leaves the escape sequence attached to the last
// token and breaks exact-string matching. Strip codes before any parsing.
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function extractVersion(output) {
  const m = /akili-specs v(\S+)/.exec(stripAnsi(output));
  return m ? m[1] : null;
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

// Sorted relative-path (forward-slash normalized) -> sha256 map for every
// file under root. Directories themselves are not compared (design/tasks
// only require file lists + per-file hashes).
function snapshotTree(root) {
  const files = new Map();
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const rel = path.relative(root, full).split(path.sep).join("/");
        files.set(rel, sha256(full));
      }
    }
  }
  walk(root);
  return files;
}

// --- Source mapping (mirrors bin/akili.js — keep in sync; see header) ------

const SOURCE_CLAUDE = path.join(REPO_ROOT, ".claude");
const SOURCE_COMMANDS = path.join(SOURCE_CLAUDE, "commands");
const SOURCE_SKILLS = path.join(SOURCE_CLAUDE, "skills");
const SOURCE_TEMPLATES = path.join(SOURCE_CLAUDE, "templates");
const SOURCE_SCRIPTS = path.join(REPO_ROOT, "scripts");
const SOURCE_MCP_EXAMPLE = path.join(REPO_ROOT, ".mcp.json.example");
const RESOURCE_SCRIPT_NAMES = ["gsc_verify.py", "parse_tests.js"];
const AGENT_TEMPLATE_NAMES = ["leader.md", "implementer.md", "reviewer.md", "tester.md"];

// bin/akili.js TOOL_REGISTRY, restricted to the three shipping targets this
// gate covers (Codex is out of scope for FR-4). `roots.root` is the
// `--target <tmp>` directory used for side B's install.
const MIRROR_TOOL_REGISTRY = {
  claude: (roots) => ({
    commands: [path.join(roots.root, "commands")],
    skills: [path.join(roots.root, "skills")],
    resources: path.join(roots.root, "akili"),
    commandsAsSkills: false,
  }),
  opencode: (roots) => ({
    commands: [path.join(roots.root, "commands")],
    skills: [path.join(roots.root, "skills")],
    resources: path.join(roots.root, "akili"),
    commandsAsSkills: false,
  }),
  antigravity: (roots) => ({
    commands: [
      path.join(roots.root, "antigravity", "global_workflows"),
      path.join(roots.root, "antigravity-cli", "global_workflows"),
      path.join(roots.root, "antigravity-cli", "workflows"),
    ],
    skills: [
      path.join(roots.root, "config", "skills"),
      path.join(roots.root, "skills"),
      path.join(roots.root, "antigravity-cli", "skills"),
    ],
    resources: path.join(roots.root, "config", "akili"),
    commandsAsSkills: true,
  }),
};

let cachedCommandNames = null;
function listCommandNames() {
  if (!cachedCommandNames) {
    cachedCommandNames = fs
      .readdirSync(SOURCE_COMMANDS, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => e.name.replace(/\.md$/, ""));
  }
  return cachedCommandNames;
}

// A path is "inside" dir when path.relative doesn't escape it (no leading
// ".." segment) and isn't itself absolute (Windows drive-letter mismatch).
function relativeInside(dir, abs) {
  const rel = path.relative(dir, abs);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return rel;
}

// Resolve the working-tree source file that produced an installed path,
// mirroring installTool's copy operations exactly (see header comment).
// Returns an absolute source path, or null if the path doesn't match any
// recognized installed-artifact shape for this tool.
function resolveSource(tool, tmpRootB, relPath) {
  const paths = MIRROR_TOOL_REGISTRY[tool]({ root: tmpRootB });
  const abs = path.join(tmpRootB, ...relPath.split("/"));

  // 1. Raw command copy: <commandsDir>/<name>.md
  for (const dir of paths.commands) {
    const rel = relativeInside(dir, abs);
    if (rel && rel.split(path.sep).length === 1 && rel.endsWith(".md")) {
      return path.join(SOURCE_COMMANDS, rel);
    }
  }

  // 2. Command-as-skill: <skillsDir>/<cmdName>/SKILL.md
  if (paths.commandsAsSkills) {
    for (const dir of paths.skills) {
      const rel = relativeInside(dir, abs);
      if (!rel) continue;
      const parts = rel.split(path.sep);
      if (parts.length === 2 && parts[1] === "SKILL.md" && listCommandNames().includes(parts[0])) {
        return path.join(SOURCE_COMMANDS, `${parts[0]}.md`);
      }
    }
  }

  // 3. Packaged skill file (any depth, e.g. references/*.md): <skillsDir>/<rel>
  for (const dir of paths.skills) {
    const rel = relativeInside(dir, abs);
    if (rel) return path.join(SOURCE_SKILLS, rel);
  }

  // 4. Resources: scripts/<name>, templates/<name>, .mcp.json.example
  const relResources = relativeInside(paths.resources, abs);
  if (relResources) {
    const parts = relResources.split(path.sep);
    if (parts[0] === "scripts" && parts.length === 2 && RESOURCE_SCRIPT_NAMES.includes(parts[1])) {
      return path.join(SOURCE_SCRIPTS, parts[1]);
    }
    if (parts[0] === "templates" && parts.length === 2 && AGENT_TEMPLATE_NAMES.includes(parts[1])) {
      return path.join(SOURCE_TEMPLATES, parts[1]);
    }
    if (relResources === ".mcp.json.example") return SOURCE_MCP_EXAMPLE;
  }

  return null;
}

// Classify the diff between two snapshots for one tool per the amended FR-4
// rule: presence-only paths always fail; a content diff is `expected` only
// when side B's bytes equal its own current working-tree source (a canonical
// edit this spec made), otherwise `unresolved` (an installer bug — side B
// doesn't even match the file it claims to have copied).
function classifyToolDiff(tool, tmpRootB, snapA, snapB) {
  const presenceOnlyA = [];
  const presenceOnlyB = [];
  const contentDiffKeys = [];
  const allKeys = new Set([...snapA.keys(), ...snapB.keys()]);

  for (const key of [...allKeys].sort()) {
    const inA = snapA.has(key);
    const inB = snapB.has(key);
    if (inA && !inB) presenceOnlyA.push(key);
    else if (!inA && inB) presenceOnlyB.push(key);
    else if (snapA.get(key) !== snapB.get(key)) contentDiffKeys.push(key);
  }

  const expected = [];
  const unresolved = [];

  for (const relPath of contentDiffKeys) {
    const sourceAbs = resolveSource(tool, tmpRootB, relPath);
    if (!sourceAbs || !fs.existsSync(sourceAbs)) {
      unresolved.push({
        path: relPath,
        reason: sourceAbs
          ? `resolved source is missing on disk: ${path.relative(REPO_ROOT, sourceAbs)}`
          : "no known source mapping for this installed path",
      });
      continue;
    }
    if (snapB.get(relPath) === sha256(sourceAbs)) {
      expected.push(relPath);
    } else {
      unresolved.push({
        path: relPath,
        reason: `working-tree install does not even match its own source ${path.relative(REPO_ROOT, sourceAbs)} — installer mapping bug, not a canonical-file edit`,
      });
    }
  }

  return { presenceOnlyA, presenceOnlyB, expected, unresolved };
}

function autoDetectedList(output) {
  const m = /Auto-detected installed target\(s\):\s*(.+)/.exec(stripAnsi(output));
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Part 1 — three-target diff against the published baseline (FR-4).
function runThreeTargetDiff() {
  let sideAVersionChecked = false;

  for (const tool of SHIPPING_TARGETS) {
    const tmpA = mkTmp(`akili-regress-a-${tool}-`);
    const tmpB = mkTmp(`akili-regress-b-${tool}-`);
    try {
      const sideA = spawnNpx(
        ["--yes", `akili-specs@${PINNED_VERSION}`, "install", "--tool", tool, "--target", tmpA],
        { cwd: REPO_ROOT }
      );

      if (sideA.error) {
        fail(`FAIL ${tool}: could not spawn npx (${sideA.error.message}). Ensure npx is on PATH.`);
        continue;
      }

      const outA = `${sideA.stdout || ""}${sideA.stderr || ""}`;

      if (sideA.status !== 0) {
        const reason = firstNetworkMatch(outA);
        if (reason) {
          console.log(`SKIP: registry unreachable (${reason})`);
          return; // whole gate SKIPs — the remaining targets share the same registry
        }
        fail(`FAIL ${tool}: npx install exited ${sideA.status}\n${outA}`);
        continue;
      }

      if (!sideAVersionChecked) {
        sideAVersionChecked = true;
        const version = extractVersion(outA);
        console.log(`Side A resolved version: ${version || "<unparsed>"}`);
        if (version !== PINNED_VERSION) {
          fail(
            `FAIL: side A resolved to akili-specs@${version || "unknown"}, expected @${PINNED_VERSION}. ` +
              `npx may have resolved a local link/workspace — refusing to treat any IDENTICAL result as evidence.`
          );
          return;
        }
      }

      const sideB = spawnAkili(["install", "--tool", tool, "--target", tmpB], { cwd: REPO_ROOT });
      const outB = `${sideB.stdout || ""}${sideB.stderr || ""}`;
      if (sideB.status !== 0) {
        fail(`FAIL ${tool}: working-tree install exited ${sideB.status}\n${outB}`);
        continue;
      }

      const { presenceOnlyA, presenceOnlyB, expected, unresolved } = classifyToolDiff(
        tool,
        tmpB,
        snapshotTree(tmpA),
        snapshotTree(tmpB)
      );

      for (const p of expected) {
        console.log(`EXPECTED-DIFF ${tool} ${p} (source changed since ${PINNED_VERSION})`);
      }

      const hasFail = presenceOnlyA.length > 0 || presenceOnlyB.length > 0 || unresolved.length > 0;
      if (hasFail) {
        const lines = [];
        for (const p of presenceOnlyA) lines.push(`- only in published side A (npx akili-specs@${PINNED_VERSION}): ${p}`);
        for (const p of presenceOnlyB) lines.push(`+ only in working tree side B (bin/akili.js): ${p}`);
        for (const u of unresolved) lines.push(`~ ${u.path}: ${u.reason}`);
        fail(`FAIL ${tool}:\n${lines.map((l) => "  " + l).join("\n")}`);
      } else if (expected.length === 0) {
        console.log(`IDENTICAL ${tool}`);
      } else {
        console.log(`LAYOUT-IDENTICAL ${tool} (${expected.length} expected source diffs)`);
      }
    } finally {
      rmTmp(tmpA);
      rmTmp(tmpB);
    }
  }
}

// Part 2 — detection fixture (T1 check 5, W-3): a shared, foreign-populated
// skills root must not cause a false-positive Codex auto-detection; a real
// akili-* command skill must cause a true positive. Driven via a spawned
// `node bin/akili.js doctor` (no --tool) with HOME (and USERPROFILE on
// Windows) pointed at a scratch home, so the real ~/.agents is never read.
function runDetectionFixture() {
  const tmpHome = mkTmp("akili-regress-fixture-");
  try {
    const skillsRoot = path.join(tmpHome, ".agents", "skills");
    fs.mkdirSync(skillsRoot, { recursive: true });

    const foreignSkills = ["gsap-core", "tdd-foreign", "react-doctor", "shadcn-ui-foreign", "seo-audit-foreign"];
    for (const name of foreignSkills) {
      const dir = path.join(skillsRoot, name);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "SKILL.md"), `# ${name}\nForeign skill, unrelated to AKILI.\n`);
    }
    // No akili-* skill dir and no <home>/.codex/akili — both left absent.

    const env = { ...process.env, HOME: tmpHome, USERPROFILE: tmpHome };

    const before = spawnAkili(["doctor"], { cwd: REPO_ROOT, env });
    const beforeOut = `${before.stdout || ""}${before.stderr || ""}`;
    const beforeDetected = autoDetectedList(beforeOut);
    if (beforeDetected.includes("codex")) {
      fail(
        `FIXTURE FAIL (false positive): codex auto-detected with only foreign, non-akili skills under ` +
          `${skillsRoot}. Auto-detected line: ${beforeDetected.join(", ") || "<none>"}`
      );
      return;
    }

    fs.mkdirSync(path.join(skillsRoot, "akili-execute"), { recursive: true });
    fs.writeFileSync(path.join(skillsRoot, "akili-execute", "SKILL.md"), "# akili-execute\n");

    const after = spawnAkili(["doctor"], { cwd: REPO_ROOT, env });
    const afterOut = `${after.stdout || ""}${after.stderr || ""}`;
    const afterDetected = autoDetectedList(afterOut);
    if (!afterDetected.includes("codex")) {
      fail(
        `FIXTURE FAIL (false negative): codex NOT auto-detected after adding ` +
          `${path.join(skillsRoot, "akili-execute", "SKILL.md")}. Auto-detected line: ${afterDetected.join(", ") || "<none>"}`
      );
      return;
    }

    console.log(
      "FIXTURE OK: codex ignored on a foreign-only shared skills root, detected once an akili-* command skill is present"
    );
  } finally {
    rmTmp(tmpHome);
  }
}

function main() {
  runThreeTargetDiff();
  runDetectionFixture();
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

// Exported for the T2 falsifier harness (KZ-006): exercises the amended
// FR-4 classification rule directly, without a real npx/network round trip.
module.exports = { classifyToolDiff, resolveSource, snapshotTree, sha256, REPO_ROOT };

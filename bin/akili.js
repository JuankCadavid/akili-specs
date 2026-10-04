#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { parseArgs } = require("util");

const { execFileSync } = require("child_process");
const { parsePersona, sectionStates, resultExitCode, applyFix, migratePersona } = require("./persona.js");

// Spawn a CLI without a shell on POSIX. On Windows, package-manager bins are
// .cmd shims, and patched Node (CVE-2024-27980) throws EINVAL when spawning
// .cmd/.bat without shell: true — so Windows gets a shell. That is safe here
// ONLY because every argument passed through this helper is a static literal;
// never route untrusted input through it.
function execCliSync(bin, args, options = {}) {
  const win = process.platform === "win32";
  return execFileSync(win ? bin + ".cmd" : bin, args, { ...options, shell: win });
}

function atomicWriteFileSync(targetPath, data) {
  const tmpPath = targetPath + "." + crypto.randomBytes(6).toString("hex") + ".tmp";
  try {
    fs.writeFileSync(tmpPath, data, { flag: "wx" });
    fs.renameSync(tmpPath, targetPath);
  } finally {
    try { fs.rmSync(tmpPath, { force: true }); } catch (e) {}
  }
}

function atomicCopyFileSync(sourcePath, targetPath) {
  const tmpPath = targetPath + "." + crypto.randomBytes(6).toString("hex") + ".tmp";
  try {
    fs.copyFileSync(sourcePath, tmpPath, fs.constants.COPYFILE_EXCL);
    fs.renameSync(tmpPath, targetPath);
  } finally {
    try { fs.rmSync(tmpPath, { force: true }); } catch (e) {}
  }
}

// Recursive copy that never hands a destination path to a call that follows
// symlinks. fs.cpSync(force) writes THROUGH a nested destination symlink on
// current Node 22.x (proven by scripts/ci/install-symlink-probe.js), so the
// removeTargetSymlinks check ahead of it left a TOCTOU window. Directories are
// created with mkdirSync after unlinking anything non-directory squatting at
// the path; every file lands via atomicCopyFileSync (COPYFILE_EXCL temp file +
// renameSync, which replaces a symlink instead of following it).
// Mirrored in scripts/ci/install-symlink-probe.js — keep in sync.
function copyTreeSync(sourcePath, targetPath) {
  if (!fs.statSync(sourcePath).isDirectory()) {
    atomicCopyFileSync(sourcePath, targetPath);
    return;
  }
  let targetStat = null;
  try {
    targetStat = fs.lstatSync(targetPath);
  } catch (e) {
    // Does not exist
  }
  if (targetStat && !targetStat.isDirectory()) {
    fs.rmSync(targetPath, { force: true }); // symlink or stray file where a directory belongs
  }
  fs.mkdirSync(targetPath, { recursive: true });
  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    copyTreeSync(path.join(sourcePath, entry.name), path.join(targetPath, entry.name));
  }
}

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const SOURCE_CLAUDE = path.join(PACKAGE_ROOT, ".claude");
const SOURCE_COMMANDS = path.join(SOURCE_CLAUDE, "commands");
const SOURCE_SKILLS = path.join(SOURCE_CLAUDE, "skills");
const SOURCE_TEMPLATES = path.join(SOURCE_CLAUDE, "templates");
const AGENT_TEMPLATES = ["leader.md", "implementer.md", "reviewer.md", "tester.md"];
const RESOURCE_SCRIPTS = ["gsc_verify.py", "parse_tests.js"];
// Skill directories removed from the package; deleted from installs during legacy cleanup.
// v2.8.0: the 8 gsap-* skills were fused into the single gsap-animation skill.
const LEGACY_SKILLS = [
  "gsap-core",
  "gsap-frameworks",
  "gsap-performance",
  "gsap-plugins",
  "gsap-react",
  "gsap-scrolltrigger",
  "gsap-timeline",
  "gsap-utils",
];
const SOURCE_SCRIPTS = path.join(PACKAGE_ROOT, "scripts");
const SOURCE_MCP_EXAMPLE = path.join(PACKAGE_ROOT, ".mcp.json.example");
const BANNER = ` █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝`;

// ANSI Colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function formatPath(p) {
  // Normalize paths for display to prefer forward slashes, even on Windows, for consistency in docs/CLI
  return p.split(path.sep).join("/");
}

// Default paths per OS
const defaultPaths = {
  claude: path.join(os.homedir(), ".claude"),
  opencode: path.join(os.homedir(), ".config", "opencode"),
  antigravity: path.join(os.homedir(), ".gemini"),
  // @akili-spec changes/codex-install-target — T1 delta (T7 CODEX_HOME finding):
  // Codex's own config home follows $CODEX_HOME when set (glossary: "config home
  // $CODEX_HOME, default ~/.codex"). This is the global default only — --local
  // keeps ./.codex, and --codex-target/--target still override it exactly as
  // before. codexSkills below is unaffected: Codex's Agent Skills root does not
  // follow CODEX_HOME.
  codex:
    process.env.CODEX_HOME && process.env.CODEX_HOME.trim() !== ""
      ? resolveUserPath(process.env.CODEX_HOME.trim())
      : path.join(os.homedir(), ".codex"),
  codexSkills: path.join(os.homedir(), ".agents", "skills"),
  // @akili-spec changes/cursor-install-target — T1: Cursor's config home follows
  // $CURSOR_CONFIG_DIR when set (glossary: "config home $CURSOR_CONFIG_DIR,
  // default ~/.cursor"), same shape as CODEX_HOME above. Global default only —
  // --local keeps ./.cursor, and --cursor-target/--target still override it.
  // cursorSkills shares the same path as codexSkills (DD-3, DD-1): one shared
  // Agent Skills root, named separately so each target stays independently
  // overridable.
  cursor:
    process.env.CURSOR_CONFIG_DIR && process.env.CURSOR_CONFIG_DIR.trim() !== ""
      ? resolveUserPath(process.env.CURSOR_CONFIG_DIR.trim())
      : path.join(os.homedir(), ".cursor"),
  cursorSkills: path.join(os.homedir(), ".agents", "skills"),
};

// Tool Registry defining target directories mapping per tool. Each entry is a
// function of a `roots` object ({ root } for the three tools whose skills and
// resources live under one directory; { root, skillsRoot } for Codex and
// Cursor, each of whose Agent Skills root is shared with other tools and
// lives outside its config home) so no entry has to know how CLI flags map to
// paths.
const TOOL_REGISTRY = {
  claude: (roots) => ({
    commands: [path.join(roots.root, "commands")],
    skills: [path.join(roots.root, "skills")],
    resources: path.join(roots.root, "akili"),
    legacyResources: path.join(roots.root, "sdd-jc"),
  }),
  opencode: (roots) => ({
    commands: [path.join(roots.root, "commands")],
    skills: [path.join(roots.root, "skills")],
    resources: path.join(roots.root, "akili"),
    legacyResources: path.join(roots.root, "sdd-jc"),
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
    legacyResources: path.join(roots.root, "config", "sdd-jc"),
    commandsAsSkills: true,
  }),
  // @akili-spec changes/codex-install-target — Codex: commands install as skills into a shared Agent Skills root
  codex: (roots) => ({
    commands: [],
    skills: [roots.skillsRoot],
    resources: path.join(roots.root, "akili"),
    legacyResources: null,
    commandsAsSkills: true,
    sharedSkillsRoot: true,
  }),
  // @akili-spec changes/cursor-install-target — Cursor: same shape as Codex,
  // sharing the Agent Skills root. detectByResourcesOnly (DD-2) keys detection
  // on the resources root only, never the shared command-skill probe.
  cursor: (roots) => ({
    commands: [],
    skills: [roots.skillsRoot],
    resources: path.join(roots.root, "akili"),
    legacyResources: null,
    commandsAsSkills: true,
    sharedSkillsRoot: true,
    detectByResourcesOnly: true,
  }),
};

function printHelp() {
  console.log(`AKILI-SPECS Methodology CLI

Usage:
  akili <command> [options]

Commands:
  install   Install commands, skills, and helper resources
  update    Update npm package to latest version, reinstall files, and show what changed
  doctor    Check whether expected files are installed
  list      List packaged commands, skills, and helper resources
  routing   Configure model routing: AGENTS.md ## Model Routing, native agent wrappers, .agents/model-routing.json
  check-update    Print one line if a newer version exists (--quiet: silent when current; for session hooks)
  notifications   enable | disable | status — opt-in Claude Code SessionStart hook announcing new versions
  help      Show this help

Options:
  --tool <name>        Install target: claude, opencode, antigravity, codex, cursor, both, or all.
                       "both" = Claude Code + OpenCode. "all" = all five targets.
                       When omitted, install/update/doctor auto-detect already-installed
                       targets; if none are found they default to claude.
  --target <path>      Target config directory for selected single tool.
                       For --tool codex or --tool cursor this selects a single-root
                       sandbox layout: <path>/akili (resources) and <path>/skills (skills).
  --claude-target      Claude config directory. Default: ~/.claude
  --opencode-target    OpenCode config directory. Default: ~/.config/opencode
  --antigravity-target Antigravity config directory. Default: ~/.gemini
  --codex-target       Codex config home (resources land at <path>/akili). Default: $CODEX_HOME if set, else ~/.codex
  --codex-skills-target Codex Agent Skills root (shared with other tools). Default: ~/.agents/skills
  --cursor-target       Cursor config home (resources land at <path>/akili). Default: $CURSOR_CONFIG_DIR if set, else ~/.cursor
  --cursor-skills-target Cursor Agent Skills root (shared with other tools). Default: ~/.agents/skills
  --force              Overwrite existing files
  --dry-run            Show what would happen without writing files
  --commands-only      Install or check only commands
  --skills-only        Install or check only skills
  --fix                Automatically fix missing files during doctor command
  --local, -l          Install locally to the current project instead of globally

Routing options (akili routing; flags pre-answer the wizard):
  --hosts <a,b>        Hosts to configure: claude, opencode, antigravity, codex, cursor
  --models <host>=<id>[@T<n>[+T<m>]],...  Models for one host (repeatable; last per host wins)
  --cli <host>=<binary>  Confirmed CLI invocation for a host (repeatable)
  --wrappers yes|no    Write native agent wrappers (Step 8E); --yes without it means yes
  --t3-cross-host <host>=<other>  Dispatch a host's Reviewer (T3) to another host (repeatable)
  --antigravity-tools <a,b>  Confirmed Antigravity tool names for the Reviewer restriction
  --opencode-agent-dir <path>  OpenCode wrapper directory. Default: .opencode/agent
  --pin-reason <host>=<id>=<text>  Recorded reason for a dated model id (repeatable)
  --yes                Accept the derived mapping without the confirm prompt
  --adopt              Adopt an unfenced ## Model Routing section without asking
  --json               Print the plan result as JSON on stdout (nothing else)
  --project <path>     Project directory. Default: current directory
  --force / --dry-run  With routing: overwrite wrappers and a hand-edited fence / print the plan only

Examples:
  akili init
  akili install
  akili install --local
  akili install --tool opencode
  akili install --tool codex
  akili install --tool both --dry-run
  akili install --tool claude --target ./.claude
  akili install --tool codex --codex-target ~/.codex --codex-skills-target ~/.agents/skills
  akili install --tool cursor
  akili update --tool both --force
  akili doctor --tool all --fix
  akili doctor --tool codex
  akili doctor --tool cursor
  akili list
  akili notifications enable
  akili routing
  akili routing --hosts claude --models claude=opus,sonnet,haiku --cli claude=claude --wrappers yes --yes --json
  akili routing --dry-run
`);
}

function printBanner() {
  console.log(colors.cyan + BANNER + colors.reset);
}

function fail(message) {
  console.error(`${colors.red}ERROR: ${message}${colors.reset}`);
  process.exit(1);
}

function resolveUserPath(input) {
  // Works for both ~/path (Unix) and ~\\path (Windows)
  return path.resolve(input.replace(/^~(?=$|\/|\\)/, os.homedir()));
}

// Shared --target / --<tool>-target / default resolution for a single tool: a
// single-tool --target wins outright, then an explicitly-passed --<tool>-target
// override, then the computed default (global or --local base). Parameterized
// by tool name so this is data flowing through one function, not a per-tool
// `values.tool === "<name>"` branch repeated for each target (DD-1 applied to
// arg parsing, not just the registry).
function resolveToolTarget(toolName, values, targetFlagKey, defaultPath, basePath) {
  if (values.target && values.tool === toolName) return values.target;
  return values[targetFlagKey] !== defaultPath ? values[targetFlagKey] : basePath;
}

function getArgs() {
  const options = {
    tool: { type: "string", default: "claude" },
    target: { type: "string" },
    "claude-target": { type: "string", default: defaultPaths.claude },
    "opencode-target": { type: "string", default: defaultPaths.opencode },
    "antigravity-target": { type: "string", default: defaultPaths.antigravity },
    "codex-target": { type: "string", default: defaultPaths.codex },
    "codex-skills-target": { type: "string", default: defaultPaths.codexSkills },
    "cursor-target": { type: "string", default: defaultPaths.cursor },
    "cursor-skills-target": { type: "string", default: defaultPaths.cursorSkills },
    force: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    "commands-only": { type: "boolean", default: false },
    "skills-only": { type: "boolean", default: false },
    fix: { type: "boolean", default: false },
    local: { type: "boolean", short: "l", default: false },
    quiet: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
    // doctor --agents (persona-upgrade FR-3/FR-4): report/fix persona drift
    // against the CLI's packaged templates. `section` is repeatable so
    // --fix can name several custom-edited/unlocated ids in one run.
    agents: { type: "boolean", default: false },
    section: { type: "string", multiple: true, default: [] },
    "allow-branch": { type: "boolean", default: false },
    // routing (model-routing-configurator FR-2 / design §5.7): flags
    // pre-answer the wizard; validation lives in bin/routing.js.
    hosts: { type: "string" },
    models: { type: "string", multiple: true },
    cli: { type: "string", multiple: true },
    wrappers: { type: "string" },
    "t3-cross-host": { type: "string", multiple: true },
    "antigravity-tools": { type: "string" },
    "opencode-agent-dir": { type: "string" },
    "pin-reason": { type: "string", multiple: true },
    yes: { type: "boolean", default: false },
    adopt: { type: "boolean", default: false },
    json: { type: "boolean", default: false },
    project: { type: "string" },
  };

  try {
    const { values, positionals } = parseArgs({
      options,
      strict: true,
      allowPositionals: true,
    });

    let command = positionals[0] || "help";
    if (values.help) command = "help";

    if (values["commands-only"] && values["skills-only"]) {
      fail("Use only one of --commands-only or --skills-only");
    }

    if (!["claude", "opencode", "antigravity", "codex", "cursor", "both", "all"].includes(values.tool)) {
      fail("--tool must be one of: claude, opencode, antigravity, codex, cursor, both, all");
    }

    if (values.target && (values.tool === "both" || values.tool === "all")) {
      fail("--target can only be used with a single tool target.");
    }

    // Resolve paths
    const baseClaude = values.local ? path.join(process.cwd(), ".claude") : defaultPaths.claude;
    const baseOpencode = values.local ? path.join(process.cwd(), ".config", "opencode") : defaultPaths.opencode;
    const baseAntigravity = values.local ? path.join(process.cwd(), ".gemini") : defaultPaths.antigravity;
    const baseCodex = values.local ? path.join(process.cwd(), ".codex") : defaultPaths.codex;
    const baseCodexSkills = values.local ? path.join(process.cwd(), ".agents", "skills") : defaultPaths.codexSkills;
    const baseCursor = values.local ? path.join(process.cwd(), ".cursor") : defaultPaths.cursor;
    const baseCursorSkills = values.local ? path.join(process.cwd(), ".agents", "skills") : defaultPaths.cursorSkills;

    // Whether the user explicitly passed --tool. When they did not, install/
    // update/doctor auto-detect already-installed targets instead of assuming
    // the "claude" default (see resolveTools).
    const toolExplicit =
      process.argv.includes("--tool") ||
      process.argv.some((a) => a.startsWith("--tool="));

    const args = {
      command,
      action: positionals[1] || null,
      tool: values.tool,
      toolExplicit,
      quiet: values.quiet,
      force: values.force,
      dryRun: values["dry-run"],
      commandsOnly: values["commands-only"],
      skillsOnly: values["skills-only"],
      fix: values.fix,
      local: values.local,
      agents: values.agents,
      section: values.section,
      allowBranch: values["allow-branch"],
      hosts: values.hosts,
      models: values.models,
      cli: values.cli,
      wrappers: values.wrappers,
      t3CrossHost: values["t3-cross-host"],
      antigravityTools: values["antigravity-tools"],
      opencodeAgentDir: values["opencode-agent-dir"],
      pinReason: values["pin-reason"],
      yes: values.yes,
      adopt: values.adopt,
      json: values.json,
      project: values.project,
      claudeTarget: resolveUserPath(resolveToolTarget("claude", values, "claude-target", defaultPaths.claude, baseClaude)),
      opencodeTarget: resolveUserPath(resolveToolTarget("opencode", values, "opencode-target", defaultPaths.opencode, baseOpencode)),
      antigravityTarget: resolveUserPath(resolveToolTarget("antigravity", values, "antigravity-target", defaultPaths.antigravity, baseAntigravity)),
      codexTarget: resolveUserPath(resolveToolTarget("codex", values, "codex-target", defaultPaths.codex, baseCodex)),
      // --target with --tool codex selects a single-root sandbox layout: resources
      // at <path>/akili (via codexTarget above) and skills at <path>/skills here —
      // see DD-2. Without --target, the two roots resolve independently.
      codexSkillsTarget: resolveUserPath(
        values.target && values.tool === "codex"
          ? path.join(values.target, "skills")
          : (values["codex-skills-target"] !== defaultPaths.codexSkills ? values["codex-skills-target"] : baseCodexSkills)
      ),
      cursorTarget: resolveUserPath(resolveToolTarget("cursor", values, "cursor-target", defaultPaths.cursor, baseCursor)),
      // --target with --tool cursor selects a single-root sandbox layout: resources
      // at <path>/akili (via cursorTarget above) and skills at <path>/skills here —
      // the Codex rule (:331-337) as a second clause, not a refactor (NFR-6).
      cursorSkillsTarget: resolveUserPath(
        values.target && values.tool === "cursor"
          ? path.join(values.target, "skills")
          : (values["cursor-skills-target"] !== defaultPaths.cursorSkills ? values["cursor-skills-target"] : baseCursorSkills)
      ),
    };

    return args;
  } catch (err) {
    fail(err.message);
  }
}

function ensureDirectory(dir, dryRun) {
  if (fs.existsSync(dir)) return;
  if (dryRun) {
    console.log(`  ${colors.yellow}would create dir${colors.reset} ${dir}`);
    return;
  }
  fs.mkdirSync(dir, { recursive: true });
}

function listEntries(dir, filter) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(filter)
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function listCommands() {
  return listEntries(SOURCE_COMMANDS, (entry) => entry.isFile() && entry.name.endsWith(".md"));
}

function listSkills() {
  return listEntries(SOURCE_SKILLS, (entry) => entry.isDirectory());
}

function selectedTools(args) {
  if (args.tool === "both") return ["claude", "opencode"];
  if (args.tool === "all") return ["claude", "opencode", "antigravity", "codex", "cursor"];
  return [args.tool];
}

const ALL_TOOLS = ["claude", "opencode", "antigravity", "codex", "cursor"];

// A tool counts as installed when any of its target directories exists and is
// non-empty. Checking commands / skills / resources covers --commands-only and
// --skills-only installs too, not just full ones.
//
// Codex's and Cursor's skills root (`sharedSkillsRoot`) is the exception: it is
// shared with other tools (e.g. a local Codex install populates
// `~/.agents/skills` with foreign skills too), so a non-empty skills dir is not
// evidence either one is installed. The split is asymmetric (DD-2): Cursor
// detects by its own resources root only; Codex detects by its resources root,
// or by the presence of a command skill file when no sibling tenant's
// resources root is populated — never the raw skills directory alone.
function isToolInstalled(tool, args) {
  const { paths } = getToolRegistryInfo(tool, args);
  if (paths.sharedSkillsRoot) {
    let resourcesNonEmpty = false;
    try {
      resourcesNonEmpty = fs.existsSync(paths.resources) && fs.readdirSync(paths.resources).length > 0;
    } catch {
      resourcesNonEmpty = false;
    }
    if (resourcesNonEmpty) return true;
    // @akili-spec changes/cursor-install-target — DD-2 (symmetric detection).
    // A tool flagged detectByResourcesOnly (Cursor) is evidenced ONLY by its own
    // resources root; it never falls through to the shared command-skill probe
    // below, so a Codex-only machine's akili-* skill files never make Cursor
    // auto-detect as installed.
    if (paths.detectByResourcesOnly) return false;
    const skillDirs = Array.isArray(paths.skills) ? paths.skills : [paths.skills];
    const resolvedSkillDirs = skillDirs.map((dir) => path.resolve(dir));
    // Symmetric half: a tool WITHOUT the flag (Codex) only counts the shared
    // command-skill probe while no sibling tenant resolving to the same skills
    // root has a populated resources dir of its own — otherwise a Cursor-only
    // machine's command-skill files (written by the Cursor install itself)
    // would make `akili update` auto-detect Codex too.
    const siblingResourcesPopulated = ALL_TOOLS.some((otherTool) => {
      if (otherTool === tool) return false;
      const { paths: otherPaths } = getToolRegistryInfo(otherTool, args);
      if (!otherPaths.sharedSkillsRoot) return false;
      const otherSkillDirs = Array.isArray(otherPaths.skills) ? otherPaths.skills : [otherPaths.skills];
      const sharesRoot = otherSkillDirs.some((dir) => resolvedSkillDirs.includes(path.resolve(dir)));
      if (!sharesRoot) return false;
      try {
        return fs.existsSync(otherPaths.resources) && fs.readdirSync(otherPaths.resources).length > 0;
      } catch {
        return false;
      }
    });
    if (siblingResourcesPopulated) return false;
    return listCommands().some((cmdFile) => {
      const cmdName = cmdFile.replace(/\.md$/, "");
      return skillDirs.some((dir) => fs.existsSync(path.join(dir, cmdName, "SKILL.md")));
    });
  }
  const skillDirs = Array.isArray(paths.skills) ? paths.skills : [paths.skills];
  const dirs = [...paths.commands, ...skillDirs, paths.resources];
  return dirs.some((dir) => {
    try {
      return fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
    } catch {
      return false;
    }
  });
}

function detectInstalledTools(args) {
  return ALL_TOOLS.filter((tool) => isToolInstalled(tool, args));
}

// Resolve which tools an install/update/doctor run should act on. An explicit
// --tool always wins. Otherwise we auto-detect targets already on disk so a bare
// `akili update` refreshes every installed tool (e.g. claude AND opencode)
// instead of silently defaulting to claude only. A first-time run with nothing
// installed falls back to the default (claude). The resolved list and any
// auto-detection note are stashed on args for the summary output.
function resolveTools(args) {
  if (args.toolExplicit) {
    args.resolvedTools = selectedTools(args);
    return args.resolvedTools;
  }
  const detected = detectInstalledTools(args);
  const isJustDefault = detected.length === 1 && detected[0] === args.tool;
  if (detected.length > 0 && !isJustDefault) {
    args.autoDetected = detected;
    args.resolvedTools = detected;
    return detected;
  }
  args.resolvedTools = selectedTools(args);
  return args.resolvedTools;
}

// Map a resolved tool list back to a --tool flag value for verify hints. Returns
// null when the set is neither the full five-tool "all" set nor the Claude+
// OpenCode "both" pair — e.g. an auto-detected {claude, antigravity} pair must
// not be told to check codex, so callers fall back to one hint per tool (W-13).
function toolFlagFor(tools) {
  if (tools.length === 1) return tools[0];
  const set = new Set(tools);
  if (set.size === 2 && set.has("claude") && set.has("opencode")) return "both";
  if (set.size === ALL_TOOLS.length && ALL_TOOLS.every((t) => set.has(t))) return "all";
  return null;
}

// One or more `akili doctor --tool <x>` command strings that together verify
// exactly `tools`. A single string when `--tool all`/`--tool both` covers the
// whole set, otherwise one string per tool in resolved order.
function verifyHints(tools) {
  const flag = toolFlagFor(tools);
  return flag ? [flag] : tools;
}

function shouldInclude(type, args) {
  if (args.commandsOnly) return type === "commands";
  if (args.skillsOnly) return type === "skills";
  return true;
}

function removeTargetSymlinks(sourcePath, targetPath) {
  let sourceStat = null;
  let targetStat = null;
  try {
    sourceStat = fs.lstatSync(sourcePath);
  } catch (e) {
    return; // Source does not exist
  }
  try {
    targetStat = fs.lstatSync(targetPath);
  } catch (e) {
    return; // Target does not exist
  }

  if (targetStat.isSymbolicLink()) {
    fs.rmSync(targetPath, { force: true });
  } else if (sourceStat.isDirectory() && targetStat.isDirectory()) {
    const entries = fs.readdirSync(sourcePath, { withFileTypes: true });
    for (const entry of entries) {
      removeTargetSymlinks(path.join(sourcePath, entry.name), path.join(targetPath, entry.name));
    }
  }
}

function copySingleFile(sourcePath, targetPath, args) {
  ensureDirectory(path.dirname(targetPath), args.dryRun);

  let targetStat = null;
  try {
    targetStat = fs.lstatSync(targetPath);
  } catch (e) {
    // Does not exist
  }

  const exists = targetStat !== null;

  if (exists && !args.force) {
    console.log(`  ${colors.yellow}skip existing${colors.reset} ${targetPath}`);
    return { installed: 0, overwritten: 0, skipped: 1 };
  }

  const action = exists ? "overwrite" : "install";
  console.log(`  ${colors.green}${args.dryRun ? "would " : ""}${action}${colors.reset} ${targetPath}`);

  if (!args.dryRun) {
    removeTargetSymlinks(sourcePath, targetPath);
    atomicCopyFileSync(sourcePath, targetPath);
  }

  return exists
    ? { installed: 0, overwritten: 1, skipped: 0 }
    : { installed: 1, overwritten: 0, skipped: 0 };
}

function copyDirectoryContents(sourceDir, targetDir, args) {
  ensureDirectory(targetDir, args.dryRun);

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  let installed = 0;
  let overwritten = 0;
  let skipped = 0;

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    let targetStat = null;
    try {
      targetStat = fs.lstatSync(targetPath);
    } catch (e) {
      // Does not exist
    }

    const exists = targetStat !== null;

    if (exists && !args.force) {
      console.log(`  ${colors.yellow}skip existing${colors.reset} ${targetPath}`);
      skipped += 1;
      continue;
    }

    const action = exists ? "overwrite" : "install";
    console.log(`  ${colors.green}${args.dryRun ? "would " : ""}${action}${colors.reset} ${targetPath}`);

    if (!args.dryRun) {
      removeTargetSymlinks(sourcePath, targetPath);
      copyTreeSync(sourcePath, targetPath);
    }
    if (exists) overwritten += 1;
    else installed += 1;
  }

  return { installed, overwritten, skipped };
}

// Which parsed `args` fields feed each tool's `roots` object — data, not a
// per-tool branch chain (DD-1 applied to arg → root mapping as well as the
// registry itself).
const TOOL_ROOT_ARGS = {
  claude: (args) => ({ root: args.claudeTarget }),
  opencode: (args) => ({ root: args.opencodeTarget }),
  antigravity: (args) => ({ root: args.antigravityTarget }),
  codex: (args) => ({ root: args.codexTarget, skillsRoot: args.codexSkillsTarget }),
  cursor: (args) => ({ root: args.cursorTarget, skillsRoot: args.cursorSkillsTarget }),
};

function getToolRegistryInfo(tool, args) {
  const roots = TOOL_ROOT_ARGS[tool](args);
  return { rootPath: roots.root, roots, paths: TOOL_REGISTRY[tool](roots) };
}

// Header string for a tool's install/doctor block. Codex has two roots (config
// home + shared skills root); every other tool has one (W-1).
function toolTargetLabel(rootPath, roots, paths) {
  return paths.sharedSkillsRoot ? `${rootPath} (skills → ${roots.skillsRoot})` : rootPath;
}

function cleanupLegacyFiles(tool, args) {
  const { paths } = getToolRegistryInfo(tool, args);
  let cleaned = 0;

  if (shouldInclude("commands", args)) {
    for (const cmdDir of paths.commands) {
      if (fs.existsSync(cmdDir)) {
        const files = fs.readdirSync(cmdDir);
        for (const file of files) {
          if (file.startsWith("sdd-") && file.endsWith(".md")) {
            const filePath = path.join(cmdDir, file);
            if (args.dryRun) {
              console.log(`  ${colors.red}would delete legacy file${colors.reset} ${filePath}`);
            } else {
              fs.rmSync(filePath, { force: true });
              console.log(`  ${colors.red}deleted legacy file${colors.reset} ${filePath}`);
            }
            cleaned++;
          }
        }
      }
    }
  }

  // Legacy-skill cleanup never runs against a shared skills root (DD-11, CS-2):
  // AKILI never owned that directory pre-Codex, so it has no legacy skills of
  // its own to remove, and a foreign tool's directory there must never be
  // touched by this loop.
  if (shouldInclude("skills", args) && !paths.sharedSkillsRoot) {
    const skillDirs = Array.isArray(paths.skills) ? paths.skills : [paths.skills];
    for (const targetSkills of skillDirs) {
      for (const skillName of LEGACY_SKILLS) {
        const skillDir = path.join(targetSkills, skillName);
        if (fs.existsSync(skillDir)) {
          if (args.dryRun) {
            console.log(`  ${colors.red}would delete legacy skill${colors.reset} ${skillDir}`);
          } else {
            fs.rmSync(skillDir, { recursive: true, force: true });
            console.log(`  ${colors.red}deleted legacy skill${colors.reset} ${skillDir}`);
          }
          cleaned++;
        }
      }
    }
  }

  if (shouldInclude("resources", args)) {
    if (paths.legacyResources && fs.existsSync(paths.legacyResources)) {
      if (args.dryRun) {
        console.log(`  ${colors.red}would delete legacy directory${colors.reset} ${paths.legacyResources}`);
      } else {
        fs.rmSync(paths.legacyResources, { recursive: true, force: true });
        console.log(`  ${colors.red}deleted legacy directory${colors.reset} ${paths.legacyResources}`);
      }
      cleaned++;
    }
  }

  return cleaned;
}

function installTool(tool, args) {
  const { rootPath, roots, paths } = getToolRegistryInfo(tool, args);

  let installed = 0;
  let overwritten = 0;
  let skipped = 0;

  console.log(`\n${colors.cyan}${tool.toUpperCase()} target: ${toolTargetLabel(rootPath, roots, paths)}${colors.reset}`);

  const cleaned = cleanupLegacyFiles(tool, args);
  if (cleaned > 0 && !args.dryRun) {
    console.log(`  ${colors.green}Legacy cleanup complete.${colors.reset}`);
  }

  const add = (result) => {
    installed += result.installed;
    overwritten += result.overwritten;
    skipped += result.skipped;
  };

  if (shouldInclude("commands", args)) {
    for (const targetCommands of paths.commands) {
      add(copyDirectoryContents(SOURCE_COMMANDS, targetCommands, args));
    }
    if (paths.commandsAsSkills) {
      const skillDirs = Array.isArray(paths.skills) ? paths.skills : [paths.skills];
      for (const cmdFile of listCommands()) {
        const cmdName = cmdFile.replace(/\.md$/, "");
        for (const targetSkills of skillDirs) {
          add(
            copySingleFile(
              path.join(SOURCE_COMMANDS, cmdFile),
              path.join(targetSkills, cmdName, "SKILL.md"),
              args
            )
          );
        }
      }
    }
  }

  if (shouldInclude("skills", args)) {
    const skillDirs = Array.isArray(paths.skills) ? paths.skills : [paths.skills];
    for (const targetSkills of skillDirs) {
      add(copyDirectoryContents(SOURCE_SKILLS, targetSkills, args));
    }
  }

  if (shouldInclude("resources", args)) {
    for (const scriptName of RESOURCE_SCRIPTS) {
      add(
        copySingleFile(
          path.join(SOURCE_SCRIPTS, scriptName),
          path.join(paths.resources, "scripts", scriptName),
          args
        )
      );
    }

    for (const templateName of AGENT_TEMPLATES) {
      add(
        copySingleFile(
          path.join(SOURCE_TEMPLATES, templateName),
          path.join(paths.resources, "templates", templateName),
          args
        )
      );
    }

    // DD-11: digests.json ships beside the four templates, as one more
    // resource file — AGENT_TEMPLATES itself stays the fixed four-name list.
    add(
      copySingleFile(
        path.join(SOURCE_TEMPLATES, "digests.json"),
        path.join(paths.resources, "templates", "digests.json"),
        args
      )
    );

    add(copySingleFile(SOURCE_MCP_EXAMPLE, path.join(paths.resources, ".mcp.json.example"), args));
  }

  return { rootPath, installed, overwritten, skipped, cleaned };
}

// Package managers to probe, preferring the one that invoked this process
// (npm/pnpm/yarn set npm_config_user_agent when running bins via npx / pnpm dlx / exec).
function packageManagerOrder() {
  const ua = process.env.npm_config_user_agent || "";
  return ua.startsWith("pnpm") ? ["pnpm", "npm"] : ["npm", "pnpm"];
}

// Detect how akili-specs is installed: { type: "global" | "local" | "npx", pm: "npm" | "pnpm" }.
// pnpm keeps its own global tree, so each manager must be probed separately.
function detectInstallType() {
  const managers = packageManagerOrder();

  for (const pm of managers) {
    try {
      const globalList = execCliSync(pm, ["list", "-g", "akili-specs", "--depth=0"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      if (globalList.includes("akili-specs")) return { type: "global", pm };
    } catch (e) {}
  }

  for (const pm of managers) {
    try {
      const localList = execCliSync(pm, ["list", "akili-specs", "--depth=0"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      if (localList.includes("akili-specs")) return { type: "local", pm };
    } catch (e) {}
  }

  return { type: "npx", pm: managers[0] };
}

// Resolve the installed akili-specs package directory (global or local) after an update.
// Returns the absolute path to the package root, or null if it cannot be found.
function resolveInstalledPackageDir(install) {
  try {
    const args = install.type === "global" ? ["root", "-g"] : ["root"];
    const root = execCliSync(install.pm, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (root) {
      const dir = path.join(root, "akili-specs");
      if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    }
  } catch (e) {}
  return null;
}

// Read the version from an installed package's package.json.
function readInstalledVersion(packageDir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8")).version;
  } catch (e) {
    return null;
  }
}

// Parse CHANGELOG.md and return the raw text of every version section strictly
// newer than `fromVersion` up to and including `toVersion`. Sections look like
// `## [X.Y.Z] - date`. Returns an array of { version, body } newest-first.
function changelogSectionsBetween(changelogPath, fromVersion, toVersion) {
  let text;
  try {
    text = fs.readFileSync(changelogPath, "utf8");
  } catch (e) {
    return [];
  }

  const lines = text.split("\n");
  const sections = [];
  let current = null;

  const isNewer = (a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }) > 0;

  for (const line of lines) {
    const match = line.match(/^##\s+\[([^\]]+)\]/);
    if (match) {
      if (current) sections.push(current);
      current = { version: match[1], bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) sections.push(current);

  return sections
    .filter((s) => /^\d+\.\d+\.\d+/.test(s.version)) // skip "Unreleased"
    .filter((s) => {
      const newerThanFrom = !fromVersion || isNewer(s.version, fromVersion);
      const notNewerThanTo = !toVersion || !isNewer(s.version, toVersion);
      return newerThanFrom && notNewerThanTo;
    })
    .map((s) => ({ version: s.version, body: s.bodyLines.join("\n").trim() }));
}

// Print a concise summary of what changed between two versions, sourced from the
// installed package's CHANGELOG.md.
function printUpdateChangeSummary(packageDir, fromVersion, toVersion) {
  if (!packageDir || !fromVersion || !toVersion) return;

  if (fromVersion === toVersion) {
    console.log(
      `\n${colors.cyan}Already on the latest version (${toVersion}). No changelog to show.${colors.reset}`
    );
    return;
  }

  const changelogPath = path.join(packageDir, "CHANGELOG.md");
  const sections = changelogSectionsBetween(changelogPath, fromVersion, toVersion);

  console.log(
    `\n${colors.cyan}What changed (${fromVersion} → ${toVersion}):${colors.reset}`
  );

  if (sections.length === 0) {
    console.log(`  (No changelog entries found for this range.)`);
    return;
  }

  for (const section of sections) {
    console.log(`\n${colors.green}v${section.version}${colors.reset}`);
    const body = section.body || "  (No details recorded.)";
    // Indent each line slightly for readability.
    console.log(
      body
        .split("\n")
        .map((l) => (l.length ? `  ${l}` : l))
        .join("\n")
    );
  }
}

function runUpdate(args) {
  const install = detectInstallType();

  console.log(
    `\n${colors.cyan}Detected installation type: ${install.type}${install.type === "npx" ? "" : ` (${install.pm})`}${colors.reset}`
  );

  if (install.type === "npx") {
    console.log(`\n${colors.yellow}You are running via a package runner (npx / pnpm dlx). No persistent installation to update.${colors.reset}`);
    console.log(`To install globally: ${colors.cyan}npm install -g akili-specs${colors.reset} or ${colors.cyan}pnpm add -g akili-specs${colors.reset}`);
    console.log(`To install locally:  ${colors.cyan}npm install akili-specs${colors.reset} or ${colors.cyan}pnpm add akili-specs${colors.reset}`);
    return;
  }

  // Capture the version before updating so we can show what changed afterward.
  const versionBefore = currentVersion;

  console.log(`\n${colors.yellow}Updating package via ${install.pm}...${colors.reset}`);

  const updateArgs =
    install.pm === "pnpm"
      ? install.type === "global"
        ? ["add", "-g", "akili-specs@latest"]
        : ["add", "akili-specs@latest"]
      : install.type === "global"
        ? ["install", "-g", "akili-specs@latest"]
        : ["install", "akili-specs@latest"];

  try {
    execCliSync(install.pm, updateArgs, { stdio: "inherit" });

    console.log(`\n${colors.green}Package updated successfully via ${install.pm}.${colors.reset}`);
  } catch (e) {
    console.error(`\n${colors.red}Failed to update package (ran: ${install.pm} ${updateArgs.join(" ")}).${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.yellow}Reinstalling files with --force...${colors.reset}`);
  args.force = true;
  runInstall(args);

  // After reinstalling, read the freshly installed version and show the changelog
  // between the old and new versions. The running process still has the old code
  // loaded, so we read version + CHANGELOG from the installed package on disk.
  const packageDir = resolveInstalledPackageDir(install);
  const versionAfter = packageDir ? readInstalledVersion(packageDir) : null;
  printUpdateChangeSummary(packageDir, versionBefore, versionAfter);

  console.log(`\n${colors.cyan}${"─".repeat(56)}${colors.reset}`);
  console.log(`${colors.cyan}Update Summary${colors.reset}`);
  const installLabel = `${install.type} install via ${install.pm}`;
  if (versionAfter && versionAfter !== versionBefore) {
    console.log(`  Package: ${versionBefore} → ${colors.green}${versionAfter}${colors.reset} (${installLabel})`);
  } else if (versionAfter) {
    console.log(`  Package: already up to date at ${colors.green}v${versionAfter}${colors.reset} (${installLabel})`);
  } else {
    console.log(`  Package: updated from v${versionBefore} (${installLabel}; new version could not be read)`);
  }
  const updatedTools = args.resolvedTools || selectedTools(args);
  console.log(`  Files: reinstalled with --force for ${updatedTools.join(", ")}${args.autoDetected ? " (auto-detected)" : ""} (see Install Summary above)`);
  const updateHints = verifyHints(updatedTools).map((h) => `akili doctor --tool ${h}`);
  if (updateHints.length === 1) {
    console.log(`  Verify: ${colors.cyan}${updateHints[0]}${colors.reset}`);
  } else {
    console.log(`  Verify: ${updateHints.map((h) => colors.cyan + h + colors.reset).join(" ; ")}`);
  }
}

function summaryCounts(result) {
  return `${colors.green}installed ${result.installed}${colors.reset} | overwritten ${result.overwritten} | ${colors.yellow}skipped ${result.skipped}${colors.reset}${result.cleaned ? ` | legacy cleaned ${result.cleaned}` : ""}`;
}

function runInstall(args) {
  const tools = resolveTools(args);
  if (args.autoDetected) {
    console.log(
      `\n${colors.cyan}Auto-detected installed target(s): ${args.autoDetected.join(", ")}${colors.reset}`
    );
    console.log(
      `  Refreshing all detected targets. Pass ${colors.yellow}--tool <name>${colors.reset} to override.`
    );
  }
  const results = [];

  for (const tool of tools) {
    results.push({ tool, ...installTool(tool, args) });
  }

  const totals = results.reduce(
    (acc, r) => ({
      installed: acc.installed + r.installed,
      overwritten: acc.overwritten + r.overwritten,
      skipped: acc.skipped + r.skipped,
      cleaned: acc.cleaned + r.cleaned,
    }),
    { installed: 0, overwritten: 0, skipped: 0, cleaned: 0 }
  );

  console.log(`\n${colors.cyan}${"─".repeat(56)}${colors.reset}`);
  console.log(`${colors.cyan}Install Summary${colors.reset} — akili-specs v${currentVersion}${args.dryRun ? ` ${colors.yellow}(dry-run: no files were written)${colors.reset}` : ""}`);
  for (const r of results) {
    console.log(`  ${r.tool.toUpperCase().padEnd(12)} ${summaryCounts(r)}`);
    console.log(`  ${"".padEnd(12)} → ${r.rootPath}`);
  }
  if (results.length > 1) {
    console.log(`  ${"TOTAL".padEnd(12)} ${summaryCounts(totals)}`);
  }

  console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
  if (totals.skipped > 0 && !args.force) {
    console.log(`  - ${totals.skipped} existing file(s) were preserved. Re-run with ${colors.yellow}--force${colors.reset} to overwrite them.`);
  }
  if (tools.includes("opencode") && !args.dryRun) {
    console.log(`  - Restart ${colors.cyan}OpenCode${colors.reset} for installed commands and skills to be loaded.`);
  }
  if (tools.includes("codex") && !args.dryRun) {
    console.log(`  - Restart ${colors.cyan}Codex${colors.reset} or open a new chat for installed commands and skills to be loaded.`);
  }
  if (tools.includes("cursor") && !args.dryRun) {
    console.log(`  - Restart ${colors.cyan}Cursor${colors.reset} or open a new chat for installed commands and skills to be loaded.`);
  }
  if (args.dryRun) {
    console.log(`  - Re-run without ${colors.yellow}--dry-run${colors.reset} to apply the changes above.`);
  } else {
    const installHints = verifyHints(tools).map((h) => `akili doctor --tool ${h}`);
    if (installHints.length === 1) {
      console.log(`  - Verify the installation with ${colors.cyan}${installHints[0]}${colors.reset}.`);
    } else {
      console.log(`  - Verify the installation with:`);
      for (const h of installHints) {
        console.log(`      ${colors.cyan}${h}${colors.reset}`);
      }
    }
    console.log(`  - Optional: ${colors.cyan}akili notifications enable${colors.reset} to hear about new versions at Claude Code session start.`);
  }
}

function runList() {
  const commands = listCommands();
  const skills = listSkills();
  console.log(`\n${colors.cyan}Commands:${colors.reset}`);
  commands.forEach((name) => console.log(`  ${name.replace(/\.md$/, "")}`));

  console.log(`\n${colors.cyan}Skills:${colors.reset}`);
  skills.forEach((name) => console.log(`  ${name}`));

  console.log(`\n${colors.cyan}Resources:${colors.reset}`);
  RESOURCE_SCRIPTS.forEach((name) => console.log(`  ${formatPath(path.join("scripts", name))}`));
  AGENT_TEMPLATES.forEach((name) => console.log(`  ${formatPath(path.join("templates", name))}`));
  console.log(`  ${formatPath(path.join("templates", "digests.json"))}`);
  console.log("  .mcp.json.example");

  const resourceCount = RESOURCE_SCRIPTS.length + AGENT_TEMPLATES.length + 1 /* digests.json */ + 1 /* .mcp.json.example */;
  console.log(`\n${colors.cyan}Summary:${colors.reset} ${commands.length} commands | ${skills.length} skills | ${resourceCount} resources (akili-specs v${currentVersion})`);
}

function hasInstalledCommand(targetCommandsList, skillDirsList, name) {
  for (const targetCommands of targetCommandsList) {
    if (fs.existsSync(path.join(targetCommands, name))) {
      return true;
    }
  }
  const cmdName = name.replace(/\.md$/, "");
  for (const targetSkills of skillDirsList) {
    if (fs.existsSync(path.join(targetSkills, cmdName, "SKILL.md"))) {
      return true;
    }
  }
  return false;
}

function hasInstalledSkill(skillDirsList, skill) {
  for (const targetSkills of skillDirsList) {
    if (fs.existsSync(path.join(targetSkills, skill, "SKILL.md"))) {
      return true;
    }
  }
  return false;
}

function doctorTool(tool, args) {
  const { rootPath, roots, paths } = getToolRegistryInfo(tool, args);
  const skillDirs = Array.isArray(paths.skills) ? paths.skills : [paths.skills];
  let okCount = 0;
  let missing = 0;
  let fixed = 0;

  console.log(`\n${colors.cyan}Checking ${tool.toUpperCase()}: ${toolTargetLabel(rootPath, roots, paths)}${colors.reset}`);

  if (shouldInclude("commands", args)) {
    console.log(`\n${colors.yellow}Commands:${colors.reset}`);
    for (const command of listCommands()) {
      const ok = hasInstalledCommand(paths.commands, skillDirs, command);
      if (ok) {
        okCount += 1;
        console.log(`  ${colors.green}OK${colors.reset} ${command}`);
      } else {
        if (args.fix) {
          // No paths.commands[0] access when the tool has no raw commands dir
          // (Codex: `commands: []`) — that indexed access on an empty array is
          // undefined, and path.join(undefined, ...) throws (CS-1).
          if (paths.commands.length > 0) {
            const targetPath = path.join(paths.commands[0], command);
            copySingleFile(path.join(SOURCE_COMMANDS, command), targetPath, { force: true, dryRun: false });
          }
          if (paths.commandsAsSkills) {
            const cmdName = command.replace(/\.md$/, "");
            for (const targetSkills of skillDirs) {
              copySingleFile(path.join(SOURCE_COMMANDS, command), path.join(targetSkills, cmdName, "SKILL.md"), { force: true, dryRun: false });
            }
          }
          console.log(`  ${colors.cyan}FIXED${colors.reset} ${command}`);
          fixed += 1;
        } else {
          console.log(`  ${colors.red}MISSING${colors.reset} ${command}`);
          missing += 1;
        }
      }
    }
  }

  if (shouldInclude("skills", args)) {
    console.log(`\n${colors.yellow}Skills:${colors.reset}`);
    for (const skill of listSkills()) {
      const ok = hasInstalledSkill(skillDirs, skill);
      if (ok) {
        okCount += 1;
        console.log(`  ${colors.green}OK${colors.reset} ${skill}`);
      } else {
        if (args.fix) {
          for (const targetSkills of skillDirs) {
            copyDirectoryContents(path.join(SOURCE_SKILLS, skill), path.join(targetSkills, skill), { force: true, dryRun: false });
          }
          console.log(`  ${colors.cyan}FIXED${colors.reset} ${skill}`);
          fixed += 1;
        } else {
          console.log(`  ${colors.red}MISSING${colors.reset} ${skill}`);
          missing += 1;
        }
      }
    }
    // STALE scan never runs against a shared skills root (DD-11, CS-2): the
    // directory holds foreign tools' skills too, and AKILI never wrote a
    // legacy gsap-* copy there to begin with, so there is nothing of ours to
    // find or remove — a `LEGACY_SKILLS` name match on a foreign dir (e.g. a
    // real `gsap-core` skill some other tool ships) would be a false STALE.
    if (!paths.sharedSkillsRoot) {
      for (const skillName of LEGACY_SKILLS) {
        for (const targetSkills of skillDirs) {
          const skillDir = path.join(targetSkills, skillName);
          if (fs.existsSync(skillDir)) {
            if (args.fix) {
              fs.rmSync(skillDir, { recursive: true, force: true });
              console.log(`  ${colors.cyan}REMOVED${colors.reset} ${skillName} (legacy, replaced by gsap-animation)`);
              fixed += 1;
            } else {
              console.log(`  ${colors.red}STALE${colors.reset} ${skillName} (legacy, replaced by gsap-animation — run with --fix or akili update to remove)`);
              missing += 1;
            }
          }
        }
      }
    }

    // FR-3 "Legacy manual copies": a pre-Codex-target manual copy at the old
    // `~/.codex/skills/akili-*` location is neither required nor deleted — the
    // shared `~/.agents/skills` root is what is checked. Informational only
    // (W-9): never counted toward missing/fixed, never touched by --fix.
    // Two guards: (1) `<codex-home>/skills` can legitimately BE the resolved
    // skills root (single-root `--target`, or `--codex-skills-target` pointed
    // under the codex home) — compare resolved paths so the line never fires
    // on the directory this very run just verified as OK. (2) the probe must
    // never throw (a non-directory or unreadable path there is treated as "no
    // legacy copies"), matching the try/catch convention `isToolInstalled`
    // already uses for the same kind of existsSync/readdirSync pair.
    if (tool === "codex") {
      const legacySkillsDir = path.join(roots.root, "skills");
      const isManagedSkillsDir = skillDirs.some((dir) => path.resolve(dir) === path.resolve(legacySkillsDir));
      let hasLegacyCopies = false;
      if (!isManagedSkillsDir) {
        try {
          hasLegacyCopies =
            fs.existsSync(legacySkillsDir) &&
            fs.readdirSync(legacySkillsDir).some((name) => name.startsWith("akili-"));
        } catch {
          hasLegacyCopies = false;
        }
      }
      if (hasLegacyCopies) {
        console.log(
          `  ${colors.yellow}INFO${colors.reset} legacy manual copies present at ${legacySkillsDir} (not managed by akili-specs)`
        );
      }
    }
  }

  if (shouldInclude("resources", args)) {
    console.log(`\n${colors.yellow}Resources:${colors.reset}`);
    const resourceChecks = [
      { src: path.join(SOURCE_SCRIPTS, "gsc_verify.py"), dest: path.join(paths.resources, "scripts", "gsc_verify.py") },
      { src: path.join(SOURCE_SCRIPTS, "parse_tests.js"), dest: path.join(paths.resources, "scripts", "parse_tests.js") },
      { src: SOURCE_MCP_EXAMPLE, dest: path.join(paths.resources, ".mcp.json.example") },
      ...AGENT_TEMPLATES.map((name) => ({
        src: path.join(SOURCE_TEMPLATES, name),
        dest: path.join(paths.resources, "templates", name),
      })),
      { src: path.join(SOURCE_TEMPLATES, "digests.json"), dest: path.join(paths.resources, "templates", "digests.json") },
    ];

    for (const check of resourceChecks) {
      const ok = fs.existsSync(check.dest);
      if (ok) {
        okCount += 1;
        console.log(`  ${colors.green}OK${colors.reset} ${check.dest}`);
      } else {
         if (args.fix) {
          copySingleFile(check.src, check.dest, { force: true, dryRun: false });
          console.log(`  ${colors.cyan}FIXED${colors.reset} ${check.dest}`);
          fixed += 1;
        } else {
          console.log(`  ${colors.red}MISSING${colors.reset} ${check.dest}`);
          missing += 1;
        }
      }
    }
  }

  return { rootPath, ok: okCount, missing, fixed };
}

// Environment dependencies the methodology recommends but never requires.
// Doctor reports them without failing: a missing recommended tool degrades
// analysis quality (commands fall back to Glob/Grep), it does not break the
// installation — so it must never flip the exit code, only inform.
const RECOMMENDED_ENV = [
  {
    name: "codegraph",
    bin: "codegraph",
    args: ["--version"],
    why: "semantic code analysis in /akili-constitution, /akili-audit, and worker briefs",
    withoutIt: "commands fall back to Glob/Grep with a lower-confidence scan",
    installHint: "npm install -g @colbymchenry/codegraph",
    postInstall: "then run codegraph init -i in your project",
  },
  {
    name: "playwright-cli",
    bin: "playwright-cli",
    args: ["--version"],
    why: "token-lean browser automation for E2E Testers and browser verification (Skill Map row; alternative to loading the Playwright MCP)",
    withoutIt: "E2E/browser work loads the Playwright MCP schemas into every session instead",
    installHint: "npm install -g @playwright/cli",
    postInstall: "then run playwright-cli install --skills FROM YOUR HOME DIRECTORY (it writes to ./.claude/skills of the cwd)",
  },
  {
    name: "codex",
    bin: "codex",
    args: ["--version"],
    appliesTo: ["codex"],
    why: "the OpenAI Codex CLI itself — required to load and run the Codex-hosted skills this installer writes",
    withoutIt: "Codex-hosted commands/skills cannot be loaded; if the binary is present but still reports NOT FOUND, it may be a broken vendor install (spawn ENOENT) — reinstalling usually fixes it, and on Windows only a codex.cmd shim is probed, not a standalone codex.exe",
    installHint: "npm install -g @openai/codex",
  },
  // @akili-spec changes/cursor-install-target — DD-5: probe `cursor-agent` (the
  // unambiguous binary name), not `agent` (too generic to probe reliably; any
  // `agent` on PATH would answer). `agent` is the documented alias and is named
  // in the row's text, as is the Windows install command.
  {
    name: "cursor-agent",
    bin: "cursor-agent",
    args: ["--version"],
    appliesTo: ["cursor"],
    why: "the Cursor CLI itself — required to load and run the Cursor-hosted skills this installer writes",
    withoutIt: "Cursor-hosted commands/skills cannot be loaded; the CLI is also invoked as agent (documented alias of cursor-agent)",
    installHint:
      "curl https://cursor.com/install -fsS | bash (macOS/Linux/WSL) or, on Windows PowerShell, irm 'https://cursor.com/install?win32=true' | iex",
  },
];

// `tools` restricts which rows print: a row with `appliesTo` only applies when
// at least one resolved tool matches (DD-4) — e.g. Claude-only users are never
// nagged about a missing `codex` binary. Rows without `appliesTo` (codegraph,
// playwright-cli) always print, as before.
function checkEnvironment(tools) {
  return RECOMMENDED_ENV.filter((dep) => !dep.appliesTo || dep.appliesTo.some((t) => tools.includes(t))).map((dep) => {
    try {
      const version = execCliSync(dep.bin, dep.args, { stdio: ["ignore", "pipe", "ignore"], timeout: 5000 })
        .toString()
        .trim()
        .split("\n")[0];
      return { ...dep, ok: true, version };
    } catch {
      return { ...dep, ok: false, version: null };
    }
  });
}

// FR-3: `akili doctor --agents` — report-only by default. Compares
// `./.agents/<role>.md` against the CLI's own PACKAGED templates
// (SOURCE_TEMPLATES; the same bytes regardless of which tool is installed or
// which --tool is passed — FR-3's "same states whichever --tool is passed"
// scenario), states one row per owned section via bin/persona.js's
// sectionStates, and sets the exit code per §5.4. `--fix` (FR-4/FR-10/FR-5)
// adds guards, a backup, one atomic write per rewritten persona, and a
// re-report; an `unmarked` persona is migrated (fenced) via
// bin/persona.js's migratePersona rather than run through applyFix's normal
// outdated/missing branches.
//
// T5/DD-11: `.claude/templates/digests.json` now ships as a packaged
// resource, keyed by role FIRST (`releases[r][role][id]`,
// `legacy[role][id][tag]`) — but sectionStates/applyFix/migratePersona all
// take a ROLE-SCOPED table (`releases[r][id]`, `legacy[id][tag]`), per
// design §7's forward pointer from T2. `loadTemplates()` reads the packaged
// file once (missing or unparsable -> the empty table, same degraded
// behavior as before T5: everything not matching the current template
// reads `custom-edited`, never a crash); `digestsForRole` slices it per
// role for each call site below.
function loadTemplates() {
  const digestsPath = path.join(SOURCE_TEMPLATES, "digests.json");
  try {
    const parsed = JSON.parse(fs.readFileSync(digestsPath, "utf8"));
    return {
      version: parsed.version || null,
      releases: parsed.releases || {},
      legacy: parsed.legacy || {},
    };
  } catch {
    return { version: null, releases: {}, legacy: {} };
  }
}

function digestsForRole(digests, role) {
  const releases = {};
  for (const [release, byRole] of Object.entries(digests.releases || {})) {
    releases[release] = (byRole && byRole[role]) || {};
  }
  return { releases, legacy: (digests.legacy && digests.legacy[role]) || {} };
}

const SECTION_STATE_COLOR = {
  current: "green",
  outdated: "red",
  "custom-edited": "yellow",
  missing: "red",
  unlocated: "yellow",
  extra: "yellow",
  unmarked: "red",
};

const FIX_ROW_COLOR = {
  fixed: "green",
  inserted: "green",
  installed: "green",
  skipped: "yellow",
  fenced: "green",
  "not located": "yellow",
};

// Runs a git subcommand quietly; returns trimmed stdout, or null on any
// failure (not a repo, git missing, no such ref). Every caller below treats
// null as "this signal is unavailable", never as an error to surface —
// DD-12's resolution is built entirely out of "try the next signal" steps.
function tryGit(cwd, gitArgs) {
  try {
    return execFileSync("git", gitArgs, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

// Reads the `Default Branch:` / `Integration Branch:` pins that
// /akili-constitution writes into the root guide's constitution summary
// (AGENTS.md preferred, CLAUDE.md as the other root guide) — the same pins
// the kaizen skill's "### Branch Context" resolves against. Bullet-list
// prefixes ("- Default Branch: master") are tolerated; only the value after
// the colon is captured.
function readConstitutionPins(cwd) {
  for (const name of ["AGENTS.md", "CLAUDE.md"]) {
    const p = path.join(cwd, name);
    if (!fs.existsSync(p)) continue;
    let text;
    try {
      text = fs.readFileSync(p, "utf8");
    } catch {
      continue;
    }
    const defaultMatch = text.match(/Default Branch:\s*(\S+)/);
    const integrationMatch = text.match(/Integration Branch:\s*(\S+)/);
    if (defaultMatch || integrationMatch) {
      return {
        defaultBranch: defaultMatch ? defaultMatch[1].replace(/[.,;]+$/, "") : null,
        integrationBranch: integrationMatch ? integrationMatch[1].replace(/[.,;]+$/, "") : null,
      };
    }
  }
  return { defaultBranch: null, integrationBranch: null };
}

// DD-12: "--fix resolves the branch the way the kaizen skill does, and
// refuses when it cannot" — mirroring the kaizen SKILL.md "### Branch
// Context" resolution order: an Integration Branch: pin, else a Default
// Branch: pin, else the remote's origin/HEAD, else the unique main/master
// among local and origin branches; unresolved when none of those settle it.
// Not a git checkout: no branch guard applies at all (DD-12: "no branch
// exists → proceed, say so").
function resolveBranchContext(cwd) {
  const isGitRepo = tryGit(cwd, ["rev-parse", "--is-inside-work-tree"]) === "true";
  if (!isGitRepo) {
    return { isGitRepo: false, currentBranch: null, applyCapableBranch: null, resolved: false, source: "not-a-git-repo" };
  }

  const currentBranch = tryGit(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const pins = readConstitutionPins(cwd);

  if (pins.integrationBranch) {
    return { isGitRepo: true, currentBranch, applyCapableBranch: pins.integrationBranch, resolved: true, source: "integration-pin" };
  }
  if (pins.defaultBranch) {
    return { isGitRepo: true, currentBranch, applyCapableBranch: pins.defaultBranch, resolved: true, source: "default-pin" };
  }

  const symbolic = tryGit(cwd, ["symbolic-ref", "refs/remotes/origin/HEAD"]);
  if (symbolic) {
    return {
      isGitRepo: true,
      currentBranch,
      applyCapableBranch: symbolic.replace(/^refs\/remotes\/origin\//, ""),
      resolved: true,
      source: "origin-head",
    };
  }

  const refsRaw = tryGit(cwd, ["for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes/origin"]) || "";
  const names = refsRaw
    .split("\n")
    .filter(Boolean)
    .map((n) => n.replace(/^origin\//, ""));
  const hasMain = names.includes("main");
  const hasMaster = names.includes("master");
  if (hasMain && !hasMaster) {
    return { isGitRepo: true, currentBranch, applyCapableBranch: "main", resolved: true, source: "unique-main-master" };
  }
  if (hasMaster && !hasMain) {
    return { isGitRepo: true, currentBranch, applyCapableBranch: "master", resolved: true, source: "unique-main-master" };
  }

  // Neither settled, or both main and master exist — never guess (DD-12).
  return { isGitRepo: true, currentBranch, applyCapableBranch: null, resolved: false, source: "unresolved" };
}

// DD-12 dirty-tree guard: `git status --porcelain -- .agents`, with the
// fix's own artifacts (DD-5: its backup folder and the .gitignore line it
// writes) excluded, so a --fix run is never blocked by evidence of its own
// prior run.
function agentsDirtyStatus(cwd) {
  const out = tryGit(cwd, ["status", "--porcelain", "--", ".agents"]);
  if (out === null) return { dirty: false, lines: [] };
  const lines = out
    .split("\n")
    .filter(Boolean)
    .filter((line) => {
      const filePath = line.slice(3);
      return filePath !== ".agents/.gitignore" && !filePath.startsWith(".agents/.backup/");
    });
  return { dirty: lines.length > 0, lines };
}

// Both --fix guards (DD-12), evaluated in this order: branch, then dirty
// tree. Prints an override notice when a passed flag defused a guard that
// would otherwise have refused; returns an array of refusal reason strings
// (empty when the run may proceed). Both guards are always evaluated (and
// any override printed) — DD-4's disqualifier note ("a guard test that stubs
// git must stub it for the refusing case too") is about test coverage, not
// about short-circuiting real runs — and every refusing guard contributes
// its own reason (RISK issue 1: a lone `if (!reason)` on the second guard
// used to drop it whenever the first guard had already refused).
function evaluateFixGuards(branchCtx, cwd, args) {
  const reasons = [];

  if (!branchCtx.isGitRepo) {
    console.log(`  ${colors.yellow}Not a git checkout — branch guard skipped, proceeding.${colors.reset}`);
  } else {
    const onApplyCapable = branchCtx.resolved && branchCtx.currentBranch === branchCtx.applyCapableBranch;
    if (!onApplyCapable) {
      const detail = branchCtx.resolved
        ? `on "${branchCtx.currentBranch}", the apply-capable branch is "${branchCtx.applyCapableBranch}"`
        : `the apply-capable branch could not be resolved (kaizen skill's Branch Context)`;
      if (args.allowBranch) {
        console.log(`  ${colors.yellow}--allow-branch: branch guard overridden (${detail}).${colors.reset}`);
      } else {
        reasons.push(`branch: ${detail} — pass --allow-branch to proceed anyway`);
      }
    }
  }

  if (branchCtx.isGitRepo) {
    const dirty = agentsDirtyStatus(cwd);
    if (dirty.dirty) {
      if (args.force) {
        console.log(`  ${colors.yellow}--force: dirty-tree guard overridden (${dirty.lines.length} changed path(s) under .agents/).${colors.reset}`);
      } else {
        reasons.push(`dirty tree: .agents/ has uncommitted changes outside the fix's own backup/ignore artifacts — pass --force to proceed, or commit first`);
      }
    }
  }

  return reasons;
}

// DD-5: ".agents/.gitignore gains .backup/ (created when missing)." Called
// lazily, the first time a backup is actually about to be written this run
// — a run that changes nothing never touches this file.
function ensureBackupGitignore(agentsDir) {
  const gitignorePath = path.join(agentsDir, ".gitignore");
  let contents = "";
  let exists = false;
  if (fs.existsSync(gitignorePath)) {
    exists = true;
    contents = fs.readFileSync(gitignorePath, "utf8");
  }
  if (contents.split(/\r?\n/).some((line) => line.trim() === ".backup/")) return;
  const next = exists ? (contents.length && !contents.endsWith("\n") ? contents + "\n" : contents) + ".backup/\n" : ".backup/\n";
  atomicWriteFileSync(gitignorePath, next);
}

// FR-4: "Before writing a persona it SHALL copy the file to
// .agents/.backup/<role>.md.<timestamp>" — and, per the scenario, the file
// must NOT be written before its backup exists. `fs.writeFileSync` with
// `flag: "wx"` fails loudly (rather than silently overwriting) if a backup
// of the same name already exists.
function backupPersona(agentsDir, roleFile, originalText) {
  const backupDir = path.join(agentsDir, ".backup");
  fs.mkdirSync(backupDir, { recursive: true });
  // DD-5: "<role>.md.<YYYYMMDD-HHMMSS>". Neither DD-5 nor FR-4 names a
  // timezone; local time is used so the name reads against the machine's
  // own clock (matching the report's other timestamps), not against a
  // pinned UTC offset a maintainer would have to convert.
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timestamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const backupPath = path.join(backupDir, `${roleFile}.${timestamp}`);
  fs.writeFileSync(backupPath, originalText, { flag: "wx" });
  return backupPath;
}

function printFixRow(row) {
  const color = colors[FIX_ROW_COLOR[row.action]] || colors.reset;
  const label = row.action.toUpperCase();
  const idPart = row.id ? `  ${row.id}` : "";
  const detailPart = row.detail ? ` (${row.detail})` : "";
  console.log(`    ${color}${label}${colors.reset}${idPart}${detailPart}`);
}

function runAgentsDoctor(args) {
  const cwd = process.cwd();
  const agentsDir = path.join(cwd, ".agents");

  console.log(`\n${colors.cyan}Persona drift (doctor --agents)${colors.reset} — akili-specs v${currentVersion}`);

  const tools = resolveTools(args);
  for (const tool of tools) {
    const { rootPath } = getToolRegistryInfo(tool, args);
    console.log(`  ${colors.yellow}Tool root (info only):${colors.reset} ${tool} → ${rootPath}`);
  }

  if (!fs.existsSync(agentsDir)) {
    console.log(`\n  ${colors.red}ABSENT${colors.reset} ${formatPath(agentsDir)} does not exist`);
    process.exitCode = 1;
    return;
  }

  // Guards only matter for --fix — report-only mode never writes, so it
  // never needs to ask permission to. A real (non-dry) run keeps
  // short-circuiting on the first refusal, exactly as before: no I/O has
  // happened yet, so there is nothing to lose by stopping here. Under
  // --dry-run there is nothing to lose by continuing either — it never
  // writes — so every guard's plan AND every guard's refusal reason get
  // printed (RISK issue 1): the reasons are held and reported after the
  // per-persona plan loop below, instead of exiting before it ever runs.
  let guardReasons = [];
  if (args.fix) {
    const branchCtx = resolveBranchContext(cwd);
    guardReasons = evaluateFixGuards(branchCtx, cwd, args);
    if (guardReasons.length && !args.dryRun) {
      console.log(`\n  ${colors.red}REFUSED (${guardReasons[0]})${colors.reset}`);
      process.exitCode = 1;
      return;
    }
  }

  let overallExit = 0;
  let gitignoreEnsured = false;
  let wroteAtLeastOne = false;
  const postFixExits = [];
  const packagedDigests = loadTemplates();

  for (const roleFile of AGENT_TEMPLATES) {
    const role = roleFile.replace(/\.md$/, "");
    const personaPath = path.join(agentsDir, roleFile);
    const templatePath = path.join(SOURCE_TEMPLATES, roleFile);
    const template = parsePersona(fs.readFileSync(templatePath, "utf8"));
    const personaExists = fs.existsSync(personaPath);
    const personaText = personaExists ? fs.readFileSync(personaPath, "utf8") : null;
    const persona = personaText !== null ? parsePersona(personaText) : null;
    const roleDigests = digestsForRole(packagedDigests, role);
    const result = sectionStates(persona, template, roleDigests);
    const exitCode = resultExitCode(result);
    if (exitCode !== 0) overallExit = 1;

    console.log(`\n${colors.cyan}${role}${colors.reset} (${formatPath(path.relative(cwd, personaPath))})`);
    if (result.status === "absent") {
      console.log(`  ${colors.red}ABSENT${colors.reset} persona file does not exist`);
    } else if (result.status === "unreadable") {
      console.log(`  ${colors.red}UNREADABLE${colors.reset} ${result.reason}`);
    } else if (result.status === "unmarked") {
      console.log(`  ${colors.yellow}UNMARKED${colors.reset} no marker of any kind found`);
      for (const row of result.sections) {
        console.log(`    ${colors.yellow}UNMARKED${colors.reset}  ${row.id}`);
      }
    } else {
      for (const row of result.sections) {
        const color = colors[SECTION_STATE_COLOR[row.state]] || colors.reset;
        const matched = row.matched ? ` (matched ${row.matched})` : "";
        console.log(`    ${color}${row.state.toUpperCase()}${colors.reset}  ${row.id}${matched}`);
      }
    }

    if (!args.fix) continue;

    // FR-5: an `unmarked` persona is migrated (fenced), never treated as a
    // normal outdated/missing fix — applyFix's own `unmarked` branch exists
    // only to explain why it skips (design §7's migratePersona).
    const fix =
      persona && persona.unmarked
        ? migratePersona(personaText, template, roleDigests, currentVersion)
        : applyFix(persona, template, roleDigests, { sections: args.section || [] });
    for (const row of fix.rows) printFixRow(row);

    let postExit = exitCode;
    if (fix.changed) {
      if (args.dryRun) {
        console.log(`    ${colors.yellow}(dry-run — no file written)${colors.reset}`);
        // The plan's own exit-code contribution: what the state WOULD be
        // after this text, without ever touching disk.
        postExit = resultExitCode(sectionStates(parsePersona(fix.text), template, roleDigests));
      } else {
        if (personaExists) {
          // Guard -> backup -> one atomic write -> re-report (design §7):
          // the backup is written before this persona file is touched at
          // all, never after (FR-4's "must NOT be written before its
          // backup exists").
          const backupPath = backupPersona(agentsDir, roleFile, personaText);
          if (!gitignoreEnsured) {
            ensureBackupGitignore(agentsDir);
            gitignoreEnsured = true;
          }
          console.log(`    ${colors.cyan}BACKUP${colors.reset} ${formatPath(backupPath)}`);
        }
        atomicWriteFileSync(personaPath, fix.text);
        wroteAtLeastOne = true;
        // Re-report: recompute from the file just written, on disk — never
        // reuse the pre-fix `result` for the exit code (FR-4 idempotence:
        // a section this run just fixed must not still read as failing).
        const rewritten = parsePersona(fs.readFileSync(personaPath, "utf8"));
        postExit = resultExitCode(sectionStates(rewritten, template, roleDigests));
      }
    } else if (persona && persona.unreadable) {
      // applyFix skips an unreadable file rather than guessing at its
      // markers — still fails until the maintainer fixes it by hand.
      // (An `unmarked` persona never reaches here: migratePersona above
      // always changes the text, so this `else if` is unreadable-only.)
      postExit = 1;
    }
    postFixExits.push(postExit);
  }

  const finalExit = args.fix ? (postFixExits.some((e) => e !== 0) ? 1 : 0) : overallExit;

  console.log(`\n${colors.cyan}${"─".repeat(56)}${colors.reset}`);
  if (finalExit !== 0) {
    console.log(`${colors.red}Persona drift found.${colors.reset} Sections reported outdated, missing, unmarked or unreadable, or a persona is absent.`);
    process.exitCode = 1;
  } else {
    console.log(`${colors.green}No persona drift blocking CI.${colors.reset} custom-edited, extra and unlocated sections remain the maintainer's call.`);
  }

  // RISK issue 1 (--dry-run only; a real run already returned above before
  // any of this printed): the full plan above is followed by one REFUSED
  // row per refusing guard, and the exit code reflects the refusal
  // regardless of what the persona plan itself would have exited with.
  if (args.fix && guardReasons.length) {
    for (const reason of guardReasons) {
      console.log(`  ${colors.red}REFUSED (${reason})${colors.reset}`);
    }
    process.exitCode = 1;
  }

  // DD-5: the rewritten personas make .agents/ dirty by design, so the
  // report tells the maintainer what the next --fix will need — but only
  // when a persona was actually written this run (never under --dry-run,
  // never on a guard refusal, never when every persona was already current).
  if (wroteAtLeastOne) {
    console.log("commit `.agents/` before the next `--fix`, or pass `--force`");
  }
}

function runDoctor(args) {
  const results = [];

  const tools = resolveTools(args);
  if (args.autoDetected) {
    console.log(
      `\n${colors.cyan}Auto-detected installed target(s): ${args.autoDetected.join(", ")}${colors.reset}`
    );
    console.log(
      `  Checking all detected targets. Pass ${colors.yellow}--tool <name>${colors.reset} to override.`
    );
  }
  for (const tool of tools) {
    results.push({ tool, ...doctorTool(tool, args) });
  }

  // Environment section — recommended tooling, reported once per run (not per
  // tool) and never counted toward missing/exit code.
  const envResults = checkEnvironment(tools);
  console.log(`\n${colors.yellow}Environment (recommended, not required):${colors.reset}`);
  for (const dep of envResults) {
    if (dep.ok) {
      console.log(`  ${colors.green}OK${colors.reset} ${dep.name} (${dep.version})`);
    } else {
      console.log(`  ${colors.yellow}NOT FOUND${colors.reset} ${dep.name} — used for ${dep.why}.`);
      console.log(`  ${"".padEnd(9)}Without it, ${dep.withoutIt}.`);
      console.log(`  ${"".padEnd(9)}Install: ${colors.cyan}${dep.installHint}${colors.reset}${dep.postInstall ? `, ${dep.postInstall}` : ""}.`);
    }
  }

  const missingTotal = results.reduce((acc, r) => acc + r.missing, 0);
  const fixedTotal = results.reduce((acc, r) => acc + r.fixed, 0);

  console.log(`\n${colors.cyan}${"─".repeat(56)}${colors.reset}`);
  console.log(`${colors.cyan}Doctor Summary${colors.reset} — akili-specs v${currentVersion}`);
  for (const r of results) {
    const status =
      r.missing > 0
        ? `${colors.red}INCOMPLETE${colors.reset}`
        : r.fixed > 0
        ? `${colors.cyan}REPAIRED${colors.reset}`
        : `${colors.green}HEALTHY${colors.reset}`;
    console.log(`  ${r.tool.toUpperCase().padEnd(12)} ${status}  ${colors.green}ok ${r.ok}${colors.reset} | ${colors.red}missing ${r.missing}${colors.reset} | fixed ${r.fixed}`);
    console.log(`  ${"".padEnd(12)} → ${r.rootPath}`);
  }

  if (missingTotal > 0) {
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  - Run ${colors.cyan}akili doctor --tool ${args.tool} --fix${colors.reset} to auto-repair the ${missingTotal} missing file(s).`);
    console.log(`  - Or run ${colors.cyan}akili update${colors.reset} to refresh the package and reinstall everything.`);
    process.exitCode = 1;
  } else if (fixedTotal > 0) {
    console.log(`\nAll issues repaired: ${fixedTotal} file(s) restored.`);
  } else {
    console.log(`\nAll checks passed. Your installation is complete and healthy.`);
  }
}

const readline = require("readline/promises");
const https = require("https");
const { version: currentVersion } = require("../package.json");

// Update-check cache: one registry hit per day, shared by every entry point
// (startup banner, `check-update`, the session hook). Without it, every CLI
// run paid up to 1.5s of registry latency for information that changes at
// most a few times a week.
const UPDATE_CACHE_PATH = path.join(os.homedir(), ".akili-specs-update.json");
const UPDATE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function readUpdateCache() {
  try {
    const cache = JSON.parse(fs.readFileSync(UPDATE_CACHE_PATH, "utf8"));
    if (cache && typeof cache.checkedAt === "number" && Date.now() - cache.checkedAt < UPDATE_CACHE_TTL_MS) {
      return cache;
    }
  } catch {
    /* missing or corrupt cache is the same as no cache */
  }
  return null;
}

function writeUpdateCache(latest) {
  try {
    atomicWriteFileSync(UPDATE_CACHE_PATH, JSON.stringify({ checkedAt: Date.now(), latest }));
  } catch {
    /* a cache we cannot write just means we check again next run */
  }
}

function fetchLatestVersion() {
  return new Promise((resolve) => {
    const req = https.get("https://registry.npmjs.org/-/package/akili-specs/dist-tags", { timeout: 1500 }, (res) => {
      // 🛡️ Sentinel: Handle stream errors to prevent unhandled exceptions and DoS
      res.on("error", () => {
        req.destroy();
        resolve(null);
      });
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null);
      }
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
        if (data.length > 50000) {
          req.destroy();
          resolve(null);
        }
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data).latest || null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
  });
}

// Returns the latest published version, from cache when fresh, hitting the
// registry (and refreshing the cache) otherwise. Null when it cannot tell.
async function getLatestVersion() {
  const cache = readUpdateCache();
  if (cache) return cache.latest;
  const latest = await fetchLatestVersion();
  if (latest) writeUpdateCache(latest);
  return latest;
}

function isNewerVersion(latestVersion) {
  return (
    latestVersion &&
    latestVersion !== currentVersion &&
    latestVersion.localeCompare(currentVersion, undefined, { numeric: true, sensitivity: "base" }) > 0
  );
}

async function checkForUpdates() {
  // Scripted/CI runs neither want the banner nor should pay for the check.
  if (!process.stdout.isTTY) return;
  const latestVersion = await getLatestVersion();
  if (!isNewerVersion(latestVersion)) return;

  const border = `╭─────────────────────────────────────────────────────────────╮`;
  const emptyLine = `│                                                             │`;

  console.log(`\n${colors.yellow}${border}`);
  console.log(`${emptyLine}`);
  const rawStr1 = `   Update available! ${currentVersion} -> ${latestVersion}`;
  const pad1 = " ".repeat(Math.max(0, 61 - rawStr1.length));
  console.log(`│   ${colors.yellow}Update available!${colors.reset} ${colors.red}${currentVersion}${colors.reset} → ${colors.green}${latestVersion}${colors.reset}${pad1}│`);

  const rawStr2 = `   Run akili update to upgrade.`;
  const pad2 = " ".repeat(Math.max(0, 61 - rawStr2.length));
  console.log(`│   Run ${colors.cyan}akili update${colors.reset} to upgrade.${pad2}│`);
  console.log(`${emptyLine}`);
  console.log(`╰─────────────────────────────────────────────────────────────╯${colors.reset}\n`);
}

// `akili check-update [--quiet]` — the session-hook entry point. One short
// line when an update exists, silence otherwise, exit 0 always: a hook that
// can fail or spam would be worse than no hook. Uses the shared 24h cache,
// so the common case (fresh cache, no update) costs one file read.
async function runCheckUpdate(args) {
  const latestVersion = await getLatestVersion();
  if (isNewerVersion(latestVersion)) {
    if (args.quiet) {
      // Plain text, no colors: this line lands in a session-context buffer,
      // not a human terminal.
      console.log(
        `akili-specs update available: ${currentVersion} → ${latestVersion}. Tell the user to run: akili update`
      );
    } else {
      console.log(
        `${colors.yellow}Update available:${colors.reset} ${currentVersion} → ${colors.green}${latestVersion}${colors.reset}. Run ${colors.cyan}akili update${colors.reset}.`
      );
    }
  } else if (!args.quiet) {
    console.log(`akili-specs ${currentVersion} is up to date.`);
  }
}

// `akili notifications enable|disable|status` — opt-in SessionStart hook in
// Claude Code's user settings, so people who never re-run the CLI still hear
// about new versions where they actually work: at session start. Claude Code
// only for now — OpenCode and Antigravity hook mechanisms differ and are not
// wired here.
const NOTIFY_HOOK_COMMAND = "akili check-update --quiet";

function runNotifications(args, action) {
  const settingsPath = path.join(args.claudeTarget || defaultPaths.claude, "settings.json");

  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    } catch {
      fail(`${settingsPath} exists but is not valid JSON — fix it manually before enabling notifications. Nothing was changed.`);
    }
  }

  const sessionStart = settings.hooks && Array.isArray(settings.hooks.SessionStart) ? settings.hooks.SessionStart : [];
  const hasHook = sessionStart.some(
    (entry) => Array.isArray(entry.hooks) && entry.hooks.some((h) => typeof h.command === "string" && h.command.includes("akili check-update"))
  );

  if (action === "status") {
    console.log(`\nUpdate notifications (Claude Code SessionStart hook): ${hasHook ? colors.green + "enabled" : colors.yellow + "disabled"}${colors.reset}`);
    console.log(`Settings file: ${settingsPath}`);
    const cache = readUpdateCache();
    if (cache) console.log(`Last registry check: ${new Date(cache.checkedAt).toISOString()} (latest seen: ${cache.latest})`);
    return;
  }

  if (action === "enable") {
    if (hasHook) {
      console.log(`\nAlready enabled in ${settingsPath}.`);
      return;
    }
    settings.hooks = settings.hooks || {};
    settings.hooks.SessionStart = sessionStart;
    sessionStart.push({ hooks: [{ type: "command", command: NOTIFY_HOOK_COMMAND }] });
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    atomicWriteFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
    console.log(`\n${colors.green}Enabled.${colors.reset} Claude Code sessions will surface new akili-specs versions at session start.`);
    console.log(`Hook added to ${settingsPath} (remove anytime with ${colors.cyan}akili notifications disable${colors.reset}).`);
    return;
  }

  if (action === "disable") {
    if (!hasHook) {
      console.log(`\nAlready disabled — no akili hook found in ${settingsPath}.`);
      return;
    }
    settings.hooks.SessionStart = sessionStart
      .map((entry) => {
        if (!Array.isArray(entry.hooks)) return entry;
        const kept = entry.hooks.filter((h) => !(typeof h.command === "string" && h.command.includes("akili check-update")));
        return kept.length === entry.hooks.length ? entry : { ...entry, hooks: kept };
      })
      .filter((entry) => !Array.isArray(entry.hooks) || entry.hooks.length > 0);
    if (settings.hooks.SessionStart.length === 0) delete settings.hooks.SessionStart;
    atomicWriteFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
    console.log(`\n${colors.green}Disabled.${colors.reset} The akili hook was removed from ${settingsPath}; other hooks were left untouched.`);
    return;
  }

  fail(`Unknown notifications action: ${action || "(none)"}. Use enable, disable, or status.`);
}

async function runInteractiveInit() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`\n${colors.cyan}Welcome to the AKILI-SPECS Setup!${colors.reset}`);
  console.log("Let's configure your AI-assisted development environment.\n");

  const toolAnswer = await rl.question(
    `Which tool do you want to install AKILI-SPECS for?\n` +
    `  1) Claude Code\n` +
    `  2) OpenCode\n` +
    `  3) Google Antigravity\n` +
    `  4) OpenAI Codex\n` +
    `  5) Cursor\n` +
    `  6) Both (Claude Code + OpenCode)\n` +
    `  7) All five\n` +
    `${colors.cyan}>${colors.reset} `
  );

  let tool = "claude";
  if (toolAnswer.trim() === "2") tool = "opencode";
  else if (toolAnswer.trim() === "3") tool = "antigravity";
  else if (toolAnswer.trim() === "4") tool = "codex";
  else if (toolAnswer.trim() === "5") tool = "cursor";
  else if (toolAnswer.trim() === "6") tool = "both";
  else if (toolAnswer.trim() === "7") tool = "all";

  console.log("");
  const scopeAnswer = await rl.question(
    `Do you want to install it globally or locally for this specific project?\n` +
    `  1) Globally (available in all your projects)\n` +
    `  2) Locally (only for this project workspace)\n` +
    `${colors.cyan}>${colors.reset} `
  );

  const isLocal = scopeAnswer.trim() === "2";
  rl.close();

  const args = {
    command: "install",
    tool: tool,
    toolExplicit: true,
    force: false,
    dryRun: false,
    commandsOnly: false,
    skillsOnly: false,
    fix: false,
    local: isLocal,
  };

  if (isLocal) {
    const cwd = process.cwd();
    args.claudeTarget = path.join(cwd, ".claude");
    args.opencodeTarget = path.join(cwd, ".config", "opencode");
    args.antigravityTarget = path.join(cwd, ".gemini");
    args.codexTarget = path.join(cwd, ".codex");
    args.codexSkillsTarget = path.join(cwd, ".agents", "skills");
    args.cursorTarget = path.join(cwd, ".cursor");
    args.cursorSkillsTarget = path.join(cwd, ".agents", "skills");
    console.log(`\n${colors.yellow}Setting up local project installation...${colors.reset}`);
  } else {
    args.claudeTarget = defaultPaths.claude;
    args.opencodeTarget = defaultPaths.opencode;
    args.antigravityTarget = defaultPaths.antigravity;
    args.codexTarget = defaultPaths.codex;
    args.codexSkillsTarget = defaultPaths.codexSkills;
    args.cursorTarget = defaultPaths.cursor;
    args.cursorSkillsTarget = defaultPaths.cursorSkills;
    console.log(`\n${colors.yellow}Setting up global installation...${colors.reset}`);
  }

  runInstall(args);
}

// ---- akili routing (model-routing-configurator, design §3, §7) ----
// bin/routing.js owns flags, derivation, rendering, and the plan (pure);
// this block keeps only the I/O: answers file, terminal, snapshot, writes.

const routing = require("./routing.js");
const ROUTING_ANSWERS = ".agents/model-routing.json";
const ROUTING_ROLES = ["leader", "implementer", "reviewer", "tester"];

function routingAbs(projectDir, relPath) {
  return path.join(projectDir, ...relPath.split("/"));
}

function readTextOrNull(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

function readRoutingAnswers(projectDir) {
  const text = readTextOrNull(routingAbs(projectDir, ROUTING_ANSWERS));
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    fail(`${ROUTING_ANSWERS}: not valid JSON (${e.message}) — fix or remove it`);
  }
}

// Everything buildPlan reads from disk (design §7 snapshot): AGENTS.md,
// CLAUDE.md, existing wrapper contents at the five hosts' locations (the
// OpenCode dir from the answers, else the previous file, else the default),
// the previous answers, the EOL, and the packaged section template.
function takeSnapshot(projectDir, registry, answers, previousAnswers) {
  const agentsMd = readTextOrNull(path.join(projectDir, "AGENTS.md"));
  const existingFiles = new Map();
  const pick = (a) => (a && a.decisions && a.decisions.opencode && typeof a.decisions.opencode.agentDir === "string" ? a.decisions.opencode.agentDir : undefined);
  const opencodeDir = pick(answers) || pick(previousAnswers);
  for (const host of routing.HOST_KEYS) {
    const location = registry.hosts[host].wrapper.location;
    for (const role of ROUTING_ROLES) {
      const relPath = host === "opencode" && opencodeDir
        ? path.posix.join(opencodeDir, `akili-${role}.md`)
        : location.replace("<role>", role);
      const content = readTextOrNull(routingAbs(projectDir, relPath));
      if (content !== null) existingFiles.set(relPath, content);
    }
  }
  return {
    agentsMd,
    claudeMd: readTextOrNull(path.join(projectDir, "CLAUDE.md")),
    existingFiles,
    previousAnswers,
    eol: agentsMd !== null && /\r\n/.test(agentsMd) ? "\r\n" : "\n",
    sectionTemplate: fs.readFileSync(path.join(PACKAGE_ROOT, ".claude", "templates", "model-routing.section.md"), "utf8"),
  };
}

const ROUTING_WRITING = ["created", "replaced", "appended", "adopted", "overwritten"];

// NFR-3: every planned path stays inside the project (an --opencode-agent-dir
// of `../x` is refused here, before any write).
function checkRoutingPaths(plan, projectDir) {
  const root = path.resolve(projectDir);
  for (const w of plan.writes) {
    const abs = path.resolve(routingAbs(root, w.relPath));
    if (abs !== root && !abs.startsWith(root + path.sep)) fail(`routing: ${w.relPath} resolves outside the project (${root})`);
  }
}

// The only writer (DD-1): atomic writes for the writing tokens, nothing for
// skipped / unchanged / refused, nothing at all under --dry-run. Missing
// directories are created quietly and reported as one aggregated line under
// --dry-run (U4). Returns the summary lines (one per planned file — NFR-6).
function applyPlan(plan, args, projectDir) {
  const toWrite = plan.writes.filter((w) => ROUTING_WRITING.includes(w.token));
  const dirs = [...new Set(toWrite.map((w) => path.dirname(routingAbs(projectDir, w.relPath))))].filter((d) => !fs.existsSync(d));
  const lines = [];
  if (args.dryRun) {
    if (dirs.length > 0) lines.push(`[dry-run] would create ${dirs.length} dir${dirs.length === 1 ? "" : "s"}`);
  } else {
    for (const d of dirs) fs.mkdirSync(d, { recursive: true });
    for (const w of toWrite) atomicWriteFileSync(routingAbs(projectDir, w.relPath), w.content);
  }
  const prefix = args.dryRun ? "[dry-run] " : "";
  for (const w of plan.writes) {
    const note = w.note ? (w.note.startsWith("—") ? ` ${w.note}` : ` — ${w.note}`) : "";
    lines.push(`${prefix}${w.token}  ${w.relPath}${note}`);
  }
  return lines;
}

function printRoutingSummary(plan, lines, args) {
  for (const line of lines) console.log(line);
  const agents = plan.writes.find((w) => w.relPath === "AGENTS.md");
  if (agents && agents.diff) console.log(agents.diff.replace(/\n$/, "").split("\n").map((l) => `    ${l}`).join("\n"));
  for (const r of plan.stale) console.log(r);
  for (const r of plan.reports) console.log(r);
  if (args.dryRun) {
    console.log("");
    console.log(plan.registryTable.replace(/\n$/, ""));
  } else {
    for (const h of plan.hints) console.log(`${colors.cyan}hint:${colors.reset} ${h}`);
  }
}

// --json (U1, FR-8): the plan result the constitution's Step 9 reads — no
// content bodies, and the --dry-run fact as a field, not a token prefix.
function printRoutingJson(plan, args) {
  const restrictions = {};
  for (const h of plan.answers.hosts) restrictions[h] = (plan.answers.decisions[h] || {}).restriction;
  const out = {
    dryRun: args.dryRun === true,
    exitCode: plan.exitCode,
    hosts: plan.answers.hosts,
    writes: plan.writes.map((w) => (w.note ? { relPath: w.relPath, token: w.token, note: w.note } : { relPath: w.relPath, token: w.token })),
    restrictions,
    authorAuditor: plan.authorAuditor,
    placeholdersByColumn: plan.placeholdersByColumn,
    sectionBytes: plan.sectionBytes,
    stale: plan.stale,
    reports: plan.reports,
    hints: args.dryRun ? [] : plan.hints,
  };
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
}

async function runRouting(args) {
  const projectDir = path.resolve(args.project || process.cwd());
  if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) fail(`--project: ${projectDir} is not a directory`);
  const registry = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, ".claude", "templates", "model-registry.json"), "utf8"));
  const previous = readRoutingAnswers(projectDir);
  // W6 / NFR-2: a terminal reader only on a TTY — without one, collectAnswers
  // never asks and returns a usage error when answers are still missing.
  const isTTY = process.stdin.isTTY === true;
  const rl = isTTY ? readline.createInterface({ input: process.stdin, output: args.json ? process.stderr : process.stdout }) : null;
  const io = { ask: (question, def) => rl.question(def ? `${question} [${def}] ` : `${question} `) };
  try {
    const collected = await routing.collectAnswers(args, previous, registry, io, { isTTY });
    if (collected.error) fail(collected.error);
    if (collected.quit) return;
    const snapshot = takeSnapshot(projectDir, registry, collected.answers, previous);
    const build = (adopt) => routing.buildPlan(collected.answers, registry, currentVersion, snapshot, new Date(), { force: args.force, adopt });
    let plan = build(args.adopt);
    // State (b) on a TTY: show the diff, ask adopt / skip (without a TTY,
    // --adopt alone decides — W5).
    const agents = plan.writes.find((w) => w.relPath === "AGENTS.md");
    if (isTTY && !args.adopt && agents && agents.token === "skipped (unfenced; --adopt to replace)") {
      const out = args.json ? process.stderr : process.stdout;
      if (agents.diff) out.write(agents.diff.endsWith("\n") ? agents.diff : agents.diff + "\n");
      const reply = String(await io.ask("AGENTS.md has an unfenced ## Model Routing section — [a]dopt / [s]kip?", "s")).trim().toLowerCase();
      if (reply === "a" || reply === "adopt") plan = build(true);
    }
    checkRoutingPaths(plan, projectDir);
    const lines = applyPlan(plan, args, projectDir);
    if (args.json) printRoutingJson(plan, args);
    else printRoutingSummary(plan, lines, args);
    if (plan.exitCode !== 0) process.exitCode = plan.exitCode;
  } finally {
    if (rl) rl.close();
  }
}

async function main() {
  const args = getArgs();

  // check-update IS the update check (and runs from a session hook, where
  // banners and a second registry hit would be noise) — every other command
  // keeps the startup banner-check behavior.
  if (args.command === "check-update") {
    await runCheckUpdate(args);
    return;
  }

  // routing --json: stdout carries the JSON plan result and nothing else (U1).
  const routingJson = args.command === "routing" && args.json;

  if (!routingJson) await checkForUpdates();

  if (args.command !== "help" && args.command !== "list" && args.command !== "init" && !routingJson) {
    printBanner();
  }

  if (args.command === "init") {
    printBanner();
    await runInteractiveInit();
    return;
  }

  switch (args.command) {
    case "install":
      runInstall(args);
      break;
    case "update":
      runUpdate(args);
      break;
    case "doctor":
      if (args.agents) {
        runAgentsDoctor(args);
      } else {
        runDoctor(args);
      }
      break;
    case "routing":
      await runRouting(args);
      break;
    case "list":
      runList();
      break;
    case "notifications":
      runNotifications(args, args.action);
      break;
    case "help":
      printHelp();
      break;
    default:
      fail(`Unknown command: ${args.command}`);
  }
}

main();
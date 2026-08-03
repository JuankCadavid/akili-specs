#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { parseArgs } = require("util");

const { execFileSync } = require("child_process");

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
};

// Tool Registry defining target directories mapping per tool
const TOOL_REGISTRY = {
  claude: (rootPath) => ({
    commands: [path.join(rootPath, "commands")],
    skills: [path.join(rootPath, "skills")],
    resources: path.join(rootPath, "akili"),
    legacyResources: path.join(rootPath, "sdd-jc"),
  }),
  opencode: (rootPath) => ({
    commands: [path.join(rootPath, "commands")],
    skills: [path.join(rootPath, "skills")],
    resources: path.join(rootPath, "akili"),
    legacyResources: path.join(rootPath, "sdd-jc"),
  }),
  antigravity: (rootPath) => ({
    commands: [
      path.join(rootPath, "antigravity", "global_workflows"),
      path.join(rootPath, "antigravity-cli", "global_workflows"),
      path.join(rootPath, "antigravity-cli", "workflows"),
    ],
    skills: [
      path.join(rootPath, "config", "skills"),
      path.join(rootPath, "skills"),
      path.join(rootPath, "antigravity-cli", "skills"),
    ],
    resources: path.join(rootPath, "config", "akili"),
    legacyResources: path.join(rootPath, "config", "sdd-jc"),
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
  check-update    Print one line if a newer version exists (--quiet: silent when current; for session hooks)
  notifications   enable | disable | status — opt-in Claude Code SessionStart hook announcing new versions
  help      Show this help

Options:
  --tool <name>        Install target: claude, opencode, antigravity, both, or all.
                       When omitted, install/update/doctor auto-detect already-installed
                       targets; if none are found they default to claude.
  --target <path>      Target config directory for selected single tool
  --claude-target      Claude config directory. Default: ~/.claude
  --opencode-target    OpenCode config directory. Default: ~/.config/opencode
  --antigravity-target Antigravity config directory. Default: ~/.gemini
  --force              Overwrite existing files
  --dry-run            Show what would happen without writing files
  --commands-only      Install or check only commands
  --skills-only        Install or check only skills
  --fix                Automatically fix missing files during doctor command
  --local, -l          Install locally to the current project instead of globally

Examples:
  akili init
  akili install
  akili install --local
  akili install --tool opencode
  akili install --tool both --dry-run
  akili install --tool claude --target ./.claude
  akili update --tool both --force
  akili doctor --tool all --fix
  akili list
  akili notifications enable
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

function getArgs() {
  const options = {
    tool: { type: "string", default: "claude" },
    target: { type: "string" },
    "claude-target": { type: "string", default: defaultPaths.claude },
    "opencode-target": { type: "string", default: defaultPaths.opencode },
    "antigravity-target": { type: "string", default: defaultPaths.antigravity },
    force: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    "commands-only": { type: "boolean", default: false },
    "skills-only": { type: "boolean", default: false },
    fix: { type: "boolean", default: false },
    local: { type: "boolean", short: "l", default: false },
    quiet: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
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

    if (!["claude", "opencode", "antigravity", "both", "all"].includes(values.tool)) {
      fail("--tool must be one of: claude, opencode, antigravity, both, all");
    }

    if (values.target && (values.tool === "both" || values.tool === "all")) {
      fail("--target can only be used with a single tool target.");
    }

    // Resolve paths
    const baseClaude = values.local ? path.join(process.cwd(), ".claude") : defaultPaths.claude;
    const baseOpencode = values.local ? path.join(process.cwd(), ".config", "opencode") : defaultPaths.opencode;
    const baseAntigravity = values.local ? path.join(process.cwd(), ".gemini") : defaultPaths.antigravity;

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
      claudeTarget: resolveUserPath(values.target && values.tool === "claude" ? values.target : (values["claude-target"] !== defaultPaths.claude ? values["claude-target"] : baseClaude)),
      opencodeTarget: resolveUserPath(values.target && values.tool === "opencode" ? values.target : (values["opencode-target"] !== defaultPaths.opencode ? values["opencode-target"] : baseOpencode)),
      antigravityTarget: resolveUserPath(values.target && values.tool === "antigravity" ? values.target : (values["antigravity-target"] !== defaultPaths.antigravity ? values["antigravity-target"] : baseAntigravity)),
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
  if (args.tool === "all") return ["claude", "opencode", "antigravity"];
  return [args.tool];
}

const ALL_TOOLS = ["claude", "opencode", "antigravity"];

// A tool counts as installed when any of its target directories exists and is
// non-empty. Checking commands / skills / resources covers --commands-only and
// --skills-only installs too, not just full ones.
function isToolInstalled(tool, args) {
  const { paths } = getToolRegistryInfo(tool, args);
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

// Map a resolved tool list back to a --tool flag value for verify hints.
function toolFlagFor(tools) {
  if (tools.length === 1) return tools[0];
  const set = new Set(tools);
  if (set.size === 2 && set.has("claude") && set.has("opencode")) return "both";
  return "all";
}

function shouldInclude(type, args) {
  if (args.commandsOnly) return type === "commands";
  if (args.skillsOnly) return type === "skills";
  return true;
}

function copySingleFile(sourcePath, targetPath, args) {
  ensureDirectory(path.dirname(targetPath), args.dryRun);

  const exists = fs.existsSync(targetPath);

  if (exists && !args.force) {
    console.log(`  ${colors.yellow}skip existing${colors.reset} ${targetPath}`);
    return { installed: 0, overwritten: 0, skipped: 1 };
  }

  const action = exists ? "overwrite" : "install";
  console.log(`  ${colors.green}${args.dryRun ? "would " : ""}${action}${colors.reset} ${targetPath}`);

  if (!args.dryRun) {
    fs.copyFileSync(sourcePath, targetPath);
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
    const exists = fs.existsSync(targetPath);

    if (exists && !args.force) {
      console.log(`  ${colors.yellow}skip existing${colors.reset} ${targetPath}`);
      skipped += 1;
      continue;
    }

    const action = exists ? "overwrite" : "install";
    console.log(`  ${colors.green}${args.dryRun ? "would " : ""}${action}${colors.reset} ${targetPath}`);

    if (!args.dryRun) {
      fs.cpSync(sourcePath, targetPath, {
        recursive: true,
        force: true,
        errorOnExist: false,
      });
    }
    if (exists) overwritten += 1;
    else installed += 1;
  }

  return { installed, overwritten, skipped };
}

function getToolRegistryInfo(tool, args) {
  const rootPath =
    tool === "claude"
      ? args.claudeTarget
      : tool === "opencode"
      ? args.opencodeTarget
      : args.antigravityTarget;
  return { rootPath, paths: TOOL_REGISTRY[tool](rootPath) };
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

  if (shouldInclude("skills", args)) {
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
  const { rootPath, paths } = getToolRegistryInfo(tool, args);

  let installed = 0;
  let overwritten = 0;
  let skipped = 0;

  console.log(`\n${colors.cyan}${tool.toUpperCase()} target: ${rootPath}${colors.reset}`);

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
    if (tool === "antigravity") {
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
      const cmd = process.platform === "win32" ? pm + ".cmd" : pm;
      const globalList = execFileSync(cmd, ["list", "-g", "akili-specs", "--depth=0"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      if (globalList.includes("akili-specs")) return { type: "global", pm };
    } catch (e) {}
  }

  for (const pm of managers) {
    try {
      const cmd = process.platform === "win32" ? pm + ".cmd" : pm;
      const localList = execFileSync(cmd, ["list", "akili-specs", "--depth=0"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      if (localList.includes("akili-specs")) return { type: "local", pm };
    } catch (e) {}
  }

  return { type: "npx", pm: managers[0] };
}

// Resolve the installed akili-specs package directory (global or local) after an update.
// Returns the absolute path to the package root, or null if it cannot be found.
function resolveInstalledPackageDir(install) {
  try {
    const cmd = process.platform === "win32" ? install.pm + ".cmd" : install.pm;
    const args = install.type === "global" ? ["root", "-g"] : ["root"];
    const root = execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
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
    const cmd = process.platform === "win32" ? install.pm + ".cmd" : install.pm;
    execFileSync(cmd, updateArgs, { stdio: "inherit" });

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
  console.log(`  Verify: ${colors.cyan}akili doctor --tool ${toolFlagFor(updatedTools)}${colors.reset}`);
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
  if (args.dryRun) {
    console.log(`  - Re-run without ${colors.yellow}--dry-run${colors.reset} to apply the changes above.`);
  } else {
    console.log(`  - Verify the installation with ${colors.cyan}akili doctor --tool ${toolFlagFor(tools)}${colors.reset}.`);
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
  console.log("  .mcp.json.example");

  const resourceCount = RESOURCE_SCRIPTS.length + AGENT_TEMPLATES.length + 1;
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
  const { rootPath, paths } = getToolRegistryInfo(tool, args);
  const skillDirs = Array.isArray(paths.skills) ? paths.skills : [paths.skills];
  let okCount = 0;
  let missing = 0;
  let fixed = 0;

  console.log(`\n${colors.cyan}Checking ${tool.toUpperCase()}: ${rootPath}${colors.reset}`);

  if (shouldInclude("commands", args)) {
    console.log(`\n${colors.yellow}Commands:${colors.reset}`);
    for (const command of listCommands()) {
      const ok = hasInstalledCommand(paths.commands, skillDirs, command);
      if (ok) {
        okCount += 1;
        console.log(`  ${colors.green}OK${colors.reset} ${command}`);
      } else {
        if (args.fix) {
          const targetPath = path.join(paths.commands[0], command);
          copySingleFile(path.join(SOURCE_COMMANDS, command), targetPath, { force: true, dryRun: false });
          if (tool === "antigravity") {
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
    installHint: "npm install -g @colbymchenry/codegraph",
  },
];

function checkEnvironment() {
  return RECOMMENDED_ENV.map((dep) => {
    try {
      const cmd = process.platform === "win32" ? dep.bin + ".cmd" : dep.bin;
      const version = execFileSync(cmd, dep.args, { stdio: ["ignore", "pipe", "ignore"], timeout: 5000 })
        .toString()
        .trim()
        .split("\n")[0];
      return { ...dep, ok: true, version };
    } catch {
      return { ...dep, ok: false, version: null };
    }
  });
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
  const envResults = checkEnvironment();
  console.log(`\n${colors.yellow}Environment (recommended, not required):${colors.reset}`);
  for (const dep of envResults) {
    if (dep.ok) {
      console.log(`  ${colors.green}OK${colors.reset} ${dep.name} (${dep.version})`);
    } else {
      console.log(`  ${colors.yellow}NOT FOUND${colors.reset} ${dep.name} — used for ${dep.why}.`);
      console.log(`  ${"".padEnd(9)}Without it, commands fall back to Glob/Grep with a lower-confidence scan.`);
      console.log(`  ${"".padEnd(9)}Install: ${colors.cyan}${dep.installHint}${colors.reset}, then run ${colors.cyan}codegraph init -i${colors.reset} in your project.`);
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
    fs.writeFileSync(UPDATE_CACHE_PATH, JSON.stringify({ checkedAt: Date.now(), latest }));
  } catch {
    /* a cache we cannot write just means we check again next run */
  }
}

function fetchLatestVersion() {
  return new Promise((resolve) => {
    const req = https.get("https://registry.npmjs.org/-/package/akili-specs/dist-tags", { timeout: 1500 }, (res) => {
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
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
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
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
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
    `  4) Both (Claude Code + OpenCode)\n` +
    `  5) All three\n` +
    `${colors.cyan}>${colors.reset} `
  );

  let tool = "claude";
  if (toolAnswer.trim() === "2") tool = "opencode";
  else if (toolAnswer.trim() === "3") tool = "antigravity";
  else if (toolAnswer.trim() === "4") tool = "both";
  else if (toolAnswer.trim() === "5") tool = "all";

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
    console.log(`\n${colors.yellow}Setting up local project installation...${colors.reset}`);
  } else {
    args.claudeTarget = defaultPaths.claude;
    args.opencodeTarget = defaultPaths.opencode;
    args.antigravityTarget = defaultPaths.antigravity;
    console.log(`\n${colors.yellow}Setting up global installation...${colors.reset}`);
  }

  runInstall(args);
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

  await checkForUpdates();

  if (args.command !== "help" && args.command !== "list" && args.command !== "init") {
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
      runDoctor(args);
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
#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const SOURCE_CLAUDE = path.join(PACKAGE_ROOT, ".claude");
const SOURCE_COMMANDS = path.join(SOURCE_CLAUDE, "commands");
const SOURCE_SKILLS = path.join(SOURCE_CLAUDE, "skills");
const RESOURCE_SCRIPTS = ["gsc_verify.py", "parse_tests.js"];
const SOURCE_SCRIPTS = path.join(PACKAGE_ROOT, "scripts");
const SOURCE_MCP_EXAMPLE = path.join(PACKAGE_ROOT, ".mcp.json.example");
const BANNER = `     ██╗ ██████╗███████╗██████╗ ███████╗ ██████╗███████╗
     ██║██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝
     ██║██║     ███████╗██████╔╝█████╗  ██║     ███████╗
██   ██║██║     ╚════██║██╔═══╝ ██╔══╝  ██║     ╚════██║
╚█████╔╝╚██████╗███████║██║     ███████╗╚██████╗███████║
 ╚════╝  ╚═════╝╚══════╝╚═╝     ╚══════╝ ╚═════╝╚══════╝`;

const TOOL_DEFAULTS = {
  claude: path.join(os.homedir(), ".claude"),
  opencode: path.join(os.homedir(), ".config", "opencode"),
  antigravity: path.join(os.homedir(), ".gemini"),
};

function printHelp() {
  console.log(`SDD JC Methodology CLI

Usage:
  sdd-jc <command> [options]

Commands:
  install   Install commands, skills, and helper resources
  update    Reinstall commands, skills, and helper resources
  doctor    Check whether expected files are installed
  list      List packaged commands, skills, and helper resources
  help      Show this help

Options:
  --tool <name>        Install target: claude, opencode, antigravity, both, or all. Default: claude
  --target <path>      Target config directory for selected single tool
  --claude-target      Claude config directory. Default: ~/.claude
  --opencode-target    OpenCode config directory. Default: ~/.config/opencode
  --antigravity-target Antigravity config directory. Default: ~/.gemini
  --force              Overwrite existing files
  --dry-run            Show what would happen without writing files
  --commands-only      Install or check only commands
  --skills-only        Install or check only skills

Examples:
  sdd-jc install
  sdd-jc install --tool opencode
  sdd-jc install --tool antigravity
  sdd-jc install --tool both --dry-run
  sdd-jc install --tool claude --target ./.claude
  sdd-jc update --tool both --force
  sdd-jc doctor --tool antigravity
  sdd-jc list
`);
}

function printBanner() {
  console.log(BANNER);
}

function parseArgs(argv) {
  const args = {
    command: argv[2] || "help",
    tool: "claude",
    target: undefined,
    claudeTarget: TOOL_DEFAULTS.claude,
    opencodeTarget: TOOL_DEFAULTS.opencode,
    antigravityTarget: TOOL_DEFAULTS.antigravity,
    force: false,
    dryRun: false,
    commandsOnly: false,
    skillsOnly: false,
  };

  for (let i = 3; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--tool") {
      const value = argv[i + 1];
      if (!value) fail("Missing value for --tool");
      if (!["claude", "opencode", "antigravity", "both", "all"].includes(value)) {
        fail("--tool must be one of: claude, opencode, antigravity, both, all");
      }
      args.tool = value;
      i += 1;
    } else if (arg === "--target") {
      const value = argv[i + 1];
      if (!value) fail("Missing value for --target");
      args.target = resolveUserPath(value);
      i += 1;
    } else if (arg === "--claude-target") {
      const value = argv[i + 1];
      if (!value) fail("Missing value for --claude-target");
      args.claudeTarget = resolveUserPath(value);
      i += 1;
    } else if (arg === "--opencode-target") {
      const value = argv[i + 1];
      if (!value) fail("Missing value for --opencode-target");
      args.opencodeTarget = resolveUserPath(value);
      i += 1;
    } else if (arg === "--antigravity-target") {
      const value = argv[i + 1];
      if (!value) fail("Missing value for --antigravity-target");
      args.antigravityTarget = resolveUserPath(value);
      i += 1;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--commands-only") {
      args.commandsOnly = true;
    } else if (arg === "--skills-only") {
      args.skillsOnly = true;
    } else if (arg === "--help" || arg === "-h") {
      args.command = "help";
    } else {
      fail(`Unknown option: ${arg}`);
    }
  }

  if (args.commandsOnly && args.skillsOnly) {
    fail("Use only one of --commands-only or --skills-only");
  }

  if (args.target && (args.tool === "both" || args.tool === "all")) {
    fail("--target can only be used with a single tool target.");
  }

  if (args.target && args.tool === "claude") args.claudeTarget = args.target;
  if (args.target && args.tool === "opencode") args.opencodeTarget = args.target;
  if (args.target && args.tool === "antigravity") args.antigravityTarget = args.target;

  return args;
}

function resolveUserPath(input) {
  return path.resolve(input.replace(/^~(?=$|\/|\\)/, os.homedir()));
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function ensureDirectory(dir, dryRun) {
  if (fs.existsSync(dir)) return;
  if (dryRun) {
    console.log(`create directory ${dir}`);
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

function shouldInclude(type, args) {
  if (args.commandsOnly) return type === "commands";
  if (args.skillsOnly) return type === "skills";
  return true;
}

function copySingleFile(sourcePath, targetPath, args) {
  ensureDirectory(path.dirname(targetPath), args.dryRun);

  if (fs.existsSync(targetPath) && !args.force) {
    console.log(`skip existing ${targetPath}`);
    return { installed: 0, skipped: 1 };
  }

  const action = fs.existsSync(targetPath) ? "overwrite" : "install";
  console.log(`${args.dryRun ? "would " : ""}${action} ${targetPath}`);

  if (!args.dryRun) {
    fs.copyFileSync(sourcePath, targetPath);
  }

  return { installed: 1, skipped: 0 };
}

function copyDirectoryContents(sourceDir, targetDir, args) {
  ensureDirectory(targetDir, args.dryRun);

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  let installed = 0;
  let skipped = 0;

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (fs.existsSync(targetPath) && !args.force) {
      console.log(`skip existing ${targetPath}`);
      skipped += 1;
      continue;
    }

    const action = fs.existsSync(targetPath) ? "overwrite" : "install";
    console.log(`${args.dryRun ? "would " : ""}${action} ${targetPath}`);

    if (!args.dryRun) {
      fs.cpSync(sourcePath, targetPath, {
        recursive: true,
        force: true,
        errorOnExist: false,
      });
    }
    installed += 1;
  }

  return { installed, skipped };
}

function copyResourceScripts(targetDir, args) {
  let installed = 0;
  let skipped = 0;

  for (const scriptName of RESOURCE_SCRIPTS) {
    const result = copySingleFile(
      path.join(SOURCE_SCRIPTS, scriptName),
      path.join(targetDir, scriptName),
      args
    );
    installed += result.installed;
    skipped += result.skipped;
  }

  return { installed, skipped };
}

function installTool(tool, args) {
  const targetRoot = tool === "claude"
    ? args.claudeTarget
    : tool === "opencode"
      ? args.opencodeTarget
      : args.antigravityTarget;

  const targetCommandsList = tool === "antigravity"
    ? [
        path.join(targetRoot, "antigravity", "global_workflows"),
        path.join(targetRoot, "antigravity-cli", "global_workflows"),
        path.join(targetRoot, "antigravity-cli", "workflows"),
      ]
    : [path.join(targetRoot, "commands")];

  const targetSkills = tool === "antigravity"
    ? path.join(targetRoot, "config", "skills")
    : path.join(targetRoot, "skills");

  const targetResources = tool === "antigravity"
    ? path.join(targetRoot, "config", "sdd-jc")
    : path.join(targetRoot, "sdd-jc");

  let installed = 0;
  let skipped = 0;

  console.log(`\n${tool} target: ${targetRoot}`);

  if (shouldInclude("commands", args)) {
    for (const targetCommands of targetCommandsList) {
      const result = copyDirectoryContents(SOURCE_COMMANDS, targetCommands, args);
      installed += result.installed;
      skipped += result.skipped;
    }
  }

  if (shouldInclude("skills", args)) {
    const result = copyDirectoryContents(SOURCE_SKILLS, targetSkills, args);
    installed += result.installed;
    skipped += result.skipped;
  }

  if (shouldInclude("resources", args)) {
    const scriptsResult = copyResourceScripts(path.join(targetResources, "scripts"), args);
    installed += scriptsResult.installed;
    skipped += scriptsResult.skipped;

    const mcpResult = copySingleFile(
      SOURCE_MCP_EXAMPLE,
      path.join(targetResources, ".mcp.json.example"),
      args
    );
    installed += mcpResult.installed;
    skipped += mcpResult.skipped;
  }

  return { installed, skipped };
}

function runInstall(args) {
  let installed = 0;
  let skipped = 0;

  for (const tool of selectedTools(args)) {
    const result = installTool(tool, args);
    installed += result.installed;
    skipped += result.skipped;
  }

  console.log(`\nDone. Installed: ${installed} | Skipped: ${skipped}`);
  if (skipped > 0 && !args.force) {
    console.log("Use --force to overwrite existing files.");
  }

  if (selectedTools(args).includes("opencode") && !args.dryRun) {
    console.log("Restart OpenCode for installed commands and skills to be loaded.");
  }
}

function runList() {
  const commands = listCommands();
  const skills = listSkills();
  console.log("Commands:");
  commands.forEach((name) => console.log(`  ${name.replace(/\.md$/, "")}`));

  console.log("\nSkills:");
  skills.forEach((name) => console.log(`  ${name}`));

  console.log("\nResources:");
  RESOURCE_SCRIPTS.forEach((name) => console.log(`  scripts/${name}`));
  console.log("  .mcp.json.example");
}

function hasInstalledCommand(targetCommands, name) {
  return fs.existsSync(path.join(targetCommands, name));
}

function hasInstalledSkill(targetSkills, name) {
  return fs.existsSync(path.join(targetSkills, name, "SKILL.md"));
}

function doctorTool(tool, args) {
  const targetRoot = tool === "claude"
    ? args.claudeTarget
    : tool === "opencode"
      ? args.opencodeTarget
      : args.antigravityTarget;

  const targetCommandsList = tool === "antigravity"
    ? [
        path.join(targetRoot, "antigravity", "global_workflows"),
        path.join(targetRoot, "antigravity-cli", "global_workflows"),
        path.join(targetRoot, "antigravity-cli", "workflows"),
      ]
    : [path.join(targetRoot, "commands")];

  const targetSkills = tool === "antigravity"
    ? path.join(targetRoot, "config", "skills")
    : path.join(targetRoot, "skills");

  const targetResources = tool === "antigravity"
    ? path.join(targetRoot, "config", "sdd-jc")
    : path.join(targetRoot, "sdd-jc");

  let missing = 0;

  console.log(`\nChecking ${tool}: ${targetRoot}`);

  if (shouldInclude("commands", args)) {
    console.log("\nCommands:");
    for (const command of listCommands()) {
      let ok = false;
      for (const targetCommands of targetCommandsList) {
        if (hasInstalledCommand(targetCommands, command)) {
          ok = true;
          break;
        }
      }
      console.log(`  ${ok ? "OK" : "MISSING"} ${command}`);
      if (!ok) missing += 1;
    }
  }

  if (shouldInclude("skills", args)) {
    console.log("\nSkills:");
    for (const skill of listSkills()) {
      const ok = hasInstalledSkill(targetSkills, skill);
      console.log(`  ${ok ? "OK" : "MISSING"} ${skill}`);
      if (!ok) missing += 1;
    }
  }

  if (shouldInclude("resources", args)) {
    console.log("\nResources:");
    const resourceChecks = [
      path.join(targetResources, "scripts", "gsc_verify.py"),
      path.join(targetResources, ".mcp.json.example"),
    ];

    for (const resourcePath of resourceChecks) {
      const ok = fs.existsSync(resourcePath);
      console.log(`  ${ok ? "OK" : "MISSING"} ${resourcePath}`);
      if (!ok) missing += 1;
    }
  }

  return missing;
}

function runDoctor(args) {
  let missing = 0;
  for (const tool of selectedTools(args)) {
    missing += doctorTool(tool, args);
  }

  console.log(`\nDone. Missing: ${missing}`);
  if (missing > 0) process.exitCode = 1;
}

function main() {
  printBanner();
  const args = parseArgs(process.argv);

  switch (args.command) {
    case "install":
    case "update":
      runInstall(args);
      break;
    case "doctor":
      runDoctor(args);
      break;
    case "list":
      runList();
      break;
    case "help":
      printHelp();
      break;
    default:
      fail(`Unknown command: ${args.command}`);
  }
}

main();

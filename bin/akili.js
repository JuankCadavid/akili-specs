#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { parseArgs } = require("util");

const { execSync } = require("child_process");

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const SOURCE_CLAUDE = path.join(PACKAGE_ROOT, ".claude");
const SOURCE_COMMANDS = path.join(SOURCE_CLAUDE, "commands");
const SOURCE_SKILLS = path.join(SOURCE_CLAUDE, "skills");
const SOURCE_TEMPLATES = path.join(SOURCE_CLAUDE, "templates");
const AGENT_TEMPLATES = ["leader.md", "implementer.md", "reviewer.md"];
const RESOURCE_SCRIPTS = ["gsc_verify.py", "parse_tests.js"];
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
    skills: path.join(rootPath, "skills"),
    resources: path.join(rootPath, "akili"),
    legacyResources: path.join(rootPath, "sdd-jc"),
  }),
  opencode: (rootPath) => ({
    commands: [path.join(rootPath, "commands")],
    skills: path.join(rootPath, "skills"),
    resources: path.join(rootPath, "akili"),
    legacyResources: path.join(rootPath, "sdd-jc"),
  }),
  antigravity: (rootPath) => ({
    commands: [
      path.join(rootPath, "antigravity", "global_workflows"),
      path.join(rootPath, "antigravity-cli", "global_workflows"),
      path.join(rootPath, "antigravity-cli", "workflows"),
    ],
    skills: path.join(rootPath, "config", "skills"),
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
  update    Update npm package to latest version and reinstall files
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

    const args = {
      command,
      tool: values.tool,
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

function shouldInclude(type, args) {
  if (args.commandsOnly) return type === "commands";
  if (args.skillsOnly) return type === "skills";
  return true;
}

function copySingleFile(sourcePath, targetPath, args) {
  ensureDirectory(path.dirname(targetPath), args.dryRun);

  if (fs.existsSync(targetPath) && !args.force) {
    console.log(`  ${colors.yellow}skip existing${colors.reset} ${targetPath}`);
    return { installed: 0, skipped: 1 };
  }

  const action = fs.existsSync(targetPath) ? "overwrite" : "install";
  console.log(`  ${colors.green}${args.dryRun ? "would " : ""}${action}${colors.reset} ${targetPath}`);

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
      console.log(`  ${colors.yellow}skip existing${colors.reset} ${targetPath}`);
      skipped += 1;
      continue;
    }

    const action = fs.existsSync(targetPath) ? "overwrite" : "install";
    console.log(`  ${colors.green}${args.dryRun ? "would " : ""}${action}${colors.reset} ${targetPath}`);

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
  let skipped = 0;

  console.log(`\n${colors.cyan}${tool.toUpperCase()} target: ${rootPath}${colors.reset}`);

  const cleaned = cleanupLegacyFiles(tool, args);
  if (cleaned > 0 && !args.dryRun) {
    console.log(`  ${colors.green}Legacy cleanup complete.${colors.reset}`);
  }

  if (shouldInclude("commands", args)) {
    for (const targetCommands of paths.commands) {
      const result = copyDirectoryContents(SOURCE_COMMANDS, targetCommands, args);
      installed += result.installed;
      skipped += result.skipped;
    }
  }

  if (shouldInclude("skills", args)) {
    const result = copyDirectoryContents(SOURCE_SKILLS, paths.skills, args);
    installed += result.installed;
    skipped += result.skipped;
  }

  if (shouldInclude("resources", args)) {
    for (const scriptName of RESOURCE_SCRIPTS) {
      const result = copySingleFile(
        path.join(SOURCE_SCRIPTS, scriptName),
        path.join(paths.resources, "scripts", scriptName),
        args
      );
      installed += result.installed;
      skipped += result.skipped;
    }

    for (const templateName of AGENT_TEMPLATES) {
      const result = copySingleFile(
        path.join(SOURCE_TEMPLATES, templateName),
        path.join(paths.resources, "templates", templateName),
        args
      );
      installed += result.installed;
      skipped += result.skipped;
    }

    const mcpResult = copySingleFile(
      SOURCE_MCP_EXAMPLE,
      path.join(paths.resources, ".mcp.json.example"),
      args
    );
    installed += mcpResult.installed;
    skipped += mcpResult.skipped;
  }

  return { installed, skipped };
}

function detectInstallType() {
  try {
    const globalList = execSync("npm list -g akili-specs --depth=0 2>/dev/null", { encoding: "utf8" });
    if (globalList.includes("akili-specs")) return "global";
  } catch (e) {}

  try {
    const localList = execSync("npm list akili-specs --depth=0 2>/dev/null", { encoding: "utf8" });
    if (localList.includes("akili-specs")) return "local";
  } catch (e) {}

  return "npx";
}

function runUpdate(args) {
  const installType = detectInstallType();

  console.log(`\n${colors.cyan}Detected installation type: ${installType}${colors.reset}`);

  if (installType === "npx") {
    console.log(`\n${colors.yellow}You are running via npx. No persistent installation to update.${colors.reset}`);
    console.log(`To install globally: ${colors.cyan}npm install -g akili-specs${colors.reset}`);
    console.log(`To install locally:  ${colors.cyan}npm install akili-specs${colors.reset}`);
    return;
  }

  console.log(`\n${colors.yellow}Updating npm package...${colors.reset}`);

  try {
    if (installType === "global") {
      execSync("npm install -g akili-specs@latest", { stdio: "inherit" });
    } else {
      execSync("npm install akili-specs@latest", { stdio: "inherit" });
    }

    console.log(`\n${colors.green}npm package updated successfully.${colors.reset}`);
  } catch (e) {
    console.error(`\n${colors.red}Failed to update npm package.${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.yellow}Reinstalling files with --force...${colors.reset}`);
  args.force = true;
  runInstall(args);
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
    console.log(`Use ${colors.yellow}--force${colors.reset} to overwrite existing files.`);
  }

  if (selectedTools(args).includes("opencode") && !args.dryRun) {
    console.log(`Restart ${colors.cyan}OpenCode${colors.reset} for installed commands and skills to be loaded.`);
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
}

function hasInstalledCommand(targetCommandsList, name) {
  for (const targetCommands of targetCommandsList) {
    if (fs.existsSync(path.join(targetCommands, name))) {
      return true;
    }
  }
  return false;
}

function doctorTool(tool, args) {
  const { rootPath, paths } = getToolRegistryInfo(tool, args);
  let missing = 0;
  let fixed = 0;

  console.log(`\n${colors.cyan}Checking ${tool.toUpperCase()}: ${rootPath}${colors.reset}`);

  if (shouldInclude("commands", args)) {
    console.log(`\n${colors.yellow}Commands:${colors.reset}`);
    for (const command of listCommands()) {
      const ok = hasInstalledCommand(paths.commands, command);
      if (ok) {
        console.log(`  ${colors.green}OK${colors.reset} ${command}`);
      } else {
        if (args.fix) {
          const targetPath = path.join(paths.commands[0], command);
          copySingleFile(path.join(SOURCE_COMMANDS, command), targetPath, { force: true, dryRun: false });
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
      const ok = fs.existsSync(path.join(paths.skills, skill, "SKILL.md"));
      if (ok) {
        console.log(`  ${colors.green}OK${colors.reset} ${skill}`);
      } else {
        if (args.fix) {
          copyDirectoryContents(path.join(SOURCE_SKILLS, skill), path.join(paths.skills, skill), { force: true, dryRun: false });
          console.log(`  ${colors.cyan}FIXED${colors.reset} ${skill}`);
          fixed += 1;
        } else {
          console.log(`  ${colors.red}MISSING${colors.reset} ${skill}`);
          missing += 1;
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

  return { missing, fixed };
}

function runDoctor(args) {
  let missingTotal = 0;
  let fixedTotal = 0;
  
  for (const tool of selectedTools(args)) {
    const { missing, fixed } = doctorTool(tool, args);
    missingTotal += missing;
    fixedTotal += fixed;
  }

  console.log(`\nDone. Missing: ${missingTotal} | Fixed: ${fixedTotal}`);
  if (missingTotal > 0) {
    console.log(`Run ${colors.cyan}akili doctor --fix${colors.reset} to auto-repair missing files.`);
    process.exitCode = 1;
  }
}

const readline = require("readline/promises");
const https = require("https");
const { version: currentVersion } = require("../package.json");

function checkForUpdates() {
  return new Promise((resolve) => {
    const req = https.get("https://registry.npmjs.org/-/package/akili-specs/dist-tags", { timeout: 1500 }, (res) => {
      if (res.statusCode !== 200) return resolve();
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const tags = JSON.parse(data);
          const latestVersion = tags.latest;
          if (latestVersion && latestVersion !== currentVersion) {
            // simple semver check
            const isNewer = latestVersion.localeCompare(currentVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0;
            if (isNewer) {
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
          }
          resolve();
        } catch (e) {
          resolve();
        }
      });
    });

    req.on("error", () => resolve());
    req.on("timeout", () => {
      req.destroy();
      resolve();
    });
  });
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
  await checkForUpdates();
  
  const args = getArgs();
  
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
    case "help":
      printHelp();
      break;
    default:
      fail(`Unknown command: ${args.command}`);
  }
}

main();
// Content core for the AKILI MCP surfaces: the catalog of shipped files, the
// frontmatter parser, command rendering, paging, and the tool definitions and
// handlers. Node built-ins only, no dependency (NFR-1), and it never requires
// bin/akili.js (that file runs main() on load, DD-6).
//
// Path safety (FR-1): every lookup is `Map.get(key)` on an exact string. No
// input is ever joined onto a filesystem path; absolute paths live only inside
// the catalog map and are never returned.
"use strict";

const fs = require("fs");
const path = require("path");

const PART_CHARS = 30000;
const AREAS = ["commands", "skills", "templates"];
// Duplicated from bin/akili.js RESOURCE_SCRIPTS; test/mcp-core.test.js pins the
// two lists equal by reading bin/akili.js as text (DD-6).
const RESOURCE_SCRIPTS = ["gsc_verify.py", "parse_tests.js"];
const ERROR_CODES = ["not_found", "invalid_argument", "unknown_tool", "internal"];

// A coded failure. Handlers throw it; callTool turns it into an error result.
class ToolError extends Error {
  constructor(code, message, hints) {
    super(message);
    this.name = "ToolError";
    this.code = code;
    this.hints = hints || {};
  }
}

// ---------------------------------------------------------------------------
// Frontmatter (design §5): the block between a first line `---` and the next
// line `---`. Keys are one per line as `key: value`; the value is plain or
// quoted on one line. Nested keys are read only for `metadata:` -> `binding:`.
// ---------------------------------------------------------------------------

function parseScalar(raw) {
  const v = raw.trim();
  if (v.length >= 2 && v[0] === '"' && v[v.length - 1] === '"') {
    try {
      return JSON.parse(v);
    } catch (_) {
      return v.slice(1, -1);
    }
  }
  if (v.length >= 2 && v[0] === "'" && v[v.length - 1] === "'") {
    return v.slice(1, -1).replace(/''/g, "'");
  }
  return v;
}

// Returns { fields, binding, body }. `body` is everything after the closing
// `---` line and its line ending, byte for byte. Text without a complete
// frontmatter block comes back unchanged as the body.
function parseFrontmatter(text) {
  const none = { fields: {}, binding: null, body: text };
  if (typeof text !== "string") return none;
  const first = /^---[ \t]*\r?\n/.exec(text);
  if (!first) return none;
  let pos = first[0].length;
  const fields = {};
  let binding = null;
  let inMetadata = false;
  while (pos <= text.length) {
    let nl = text.indexOf("\n", pos);
    const lineEnd = nl === -1 ? text.length : nl;
    const next = nl === -1 ? text.length : nl + 1;
    const line = text.slice(pos, lineEnd).replace(/\r$/, "");
    if (/^---[ \t]*$/.test(line)) {
      return { fields, binding, body: text.slice(next) };
    }
    if (nl === -1) return none; // never closed
    const top = /^([A-Za-z0-9_.-]+):(?:[ \t]+(.*))?$/.exec(line);
    if (top) {
      inMetadata = top[1] === "metadata";
      fields[top[1]] = top[2] === undefined ? "" : parseScalar(top[2]);
    } else if (inMetadata) {
      const nested = /^[ \t]+binding:[ \t]*(.*)$/.exec(line);
      if (nested) binding = parseScalar(nested[1]);
    }
    pos = next;
  }
  return none;
}

// ---------------------------------------------------------------------------
// Rendering (FR-2 Command text rendered). split/join, never a regex built from
// user input, so `$&` or `$1` in arguments stay literal.
// ---------------------------------------------------------------------------

function renderCommand(fileText, argumentsText) {
  const args = typeof argumentsText === "string" ? argumentsText : "";
  const body = parseFrontmatter(fileText).body;
  if (body.includes("$ARGUMENTS")) {
    return body.split("$ARGUMENTS").join(args);
  }
  if (args === "") return body;
  return (body.endsWith("\n") ? body : body + "\n") + "ARGUMENTS: " + args + "\n";
}

// ---------------------------------------------------------------------------
// Paging (design §5): parts of at most `max` UTF-16 code units. A cut moves
// back to just after the last "\n" in the window; with no "\n" it cuts at the
// limit, one unit earlier if that would split a surrogate pair.
// ---------------------------------------------------------------------------

function splitParts(text, max) {
  const limit = max === undefined ? PART_CHARS : max;
  const parts = [];
  let start = 0;
  while (text.length - start > limit) {
    const windowEnd = start + limit;
    const nl = text.lastIndexOf("\n", windowEnd - 1);
    let end;
    if (nl >= start) {
      end = nl + 1;
    } else {
      end = windowEnd;
      const hi = text.charCodeAt(end - 1);
      const lo = text.charCodeAt(end);
      if (hi >= 0xd800 && hi <= 0xdbff && lo >= 0xdc00 && lo <= 0xdfff && end - 1 > start) {
        end -= 1;
      }
    }
    parts.push(text.slice(start, end));
    start = end;
  }
  parts.push(text.slice(start));
  return parts;
}

// Returns { part, parts, text }; a `part` outside 1..parts throws invalid_argument.
function pageText(text, part, max) {
  const pages = splitParts(text, max);
  const n = part === undefined ? 1 : part;
  if (!Number.isInteger(n) || n < 1 || n > pages.length) {
    throw new ToolError("invalid_argument", `part must be an integer from 1 to ${pages.length}`, {
      parts: pages.length,
    });
  }
  return { part: n, parts: pages.length, text: pages[n - 1] };
}

// ---------------------------------------------------------------------------
// Tool definitions (design §6). Only the input types the Lambda target schema
// documents: string, integer, object. Names are validated in the core, no enum.
// ---------------------------------------------------------------------------

function deepFreeze(o) {
  if (o && typeof o === "object") {
    Object.freeze(o);
    for (const k of Object.keys(o)) deepFreeze(o[k]);
  }
  return o;
}

const PART_PROP = {
  type: "integer",
  description: "1-based part number when the text is longer than one part. Default 1.",
};

const TOOL_DEFINITIONS = deepFreeze([
  {
    name: "list_commands",
    description:
      "AKILI-SPECS methodology commands (akili-propose, akili-specify, akili-execute, ...). Call this to see them with their descriptions and part counts; then call get_command.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_command",
    description:
      "Run an AKILI-SPECS command. When the user asks to run an AKILI command or phase, call this and follow the returned text exactly; fetch every skill it names with get_skill. Long text comes in parts; read them in order.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Command name, for example akili-propose. See list_commands." },
        arguments: {
          type: "string",
          description: "The user's arguments for the command. Replaces $ARGUMENTS in the text.",
        },
        part: PART_PROP,
      },
      required: ["name"],
    },
  },
  {
    name: "list_skills",
    description:
      "AKILI-SPECS methodology skills with their descriptions, binding level and file lists. Call this to see them; then call get_skill.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_skill",
    description:
      "AKILI-SPECS methodology skills. Returns SKILL.md by default, or another file of the skill (for example references/...) when file is given. Commands name the skills to fetch.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Skill name, for example tdd. See list_skills." },
        file: { type: "string", description: "File inside the skill. Default SKILL.md." },
        part: PART_PROP,
      },
      required: ["name"],
    },
  },
  {
    name: "get_template",
    description:
      "AKILI-SPECS persona and routing templates: leader, implementer, reviewer, tester, model-registry, model-routing.section, digests.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Template name, for example implementer." },
        part: PART_PROP,
      },
      required: ["name"],
    },
  },
  {
    name: "get_file",
    description:
      "Any other shipped AKILI-SPECS file by catalog path, for example scripts/parse_tests.js or skills/tdd/SKILL.md. Paths come from the other tools; unknown paths return not_found.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Catalog path, for example scripts/parse_tests.js." },
        part: PART_PROP,
      },
      required: ["path"],
    },
  },
  {
    name: "search",
    description:
      "Search AKILI-SPECS commands, skills and templates by words. Returns catalog paths with a title, a snippet and a score; fetch a hit with get_file.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words to look for." },
        limit: { type: "integer", description: "Maximum results, default 10, at most 20." },
      },
      required: ["query"],
    },
  },
]);

// ---------------------------------------------------------------------------
// usage block (part 1 of get_command): five fixed lines.
// ---------------------------------------------------------------------------

const USAGE = [
  "Follow the text below exactly, as you would a slash command; it is the whole command.",
  "Fetch every skill listed in `skills` with get_skill before you start, and apply it as the text directs.",
  "Paths in the text map to tools: `akili/scripts/...` is get_file with path `scripts/...`; `akili/templates/...` is get_template with the template name.",
  "Where the text says to run `akili <cli command>`, run `npx -y akili-specs <cli command>`; it needs Node.",
  "This text may span several parts: `part` of `parts` is returned here; call get_command again with the same arguments and part 2..parts to read the rest, in order.",
].join("\n");

// A skill name is "named" when it appears in backticks, or as a whole word
// followed by the word "skill" (design §6). Matched against catalog skill names
// only, on the body before argument substitution.
function detectSkills(body, skillNames) {
  const found = [];
  for (const name of skillNames) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("`" + esc + "`|(?<![A-Za-z0-9_-])" + esc + "[ \\t]+skill(?![A-Za-z0-9_-])");
    if (re.test(body)) found.push(name);
  }
  return found.sort();
}

// ---------------------------------------------------------------------------
// Catalog (FR-1). Metadata only at build time: lstat per entry, no file reads
// except the package's own package.json for the version.
// ---------------------------------------------------------------------------

function walkArea(root, areaName, out) {
  let rootStat;
  try {
    rootStat = fs.lstatSync(root);
  } catch (_) {
    return;
  }
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return;
  const visit = (dir, keyParts) => {
    const entries = fs.readdirSync(dir).sort();
    for (const name of entries) {
      if (name.startsWith(".")) continue; // dotfiles and dot-directories
      const abs = path.join(dir, name);
      const st = fs.lstatSync(abs);
      if (st.isSymbolicLink()) continue;
      const parts = keyParts.concat(name);
      if (st.isDirectory()) visit(abs, parts);
      else if (st.isFile()) out.set(parts.join("/"), { abs, size: st.size });
    }
  };
  visit(root, [areaName]);
}

function buildCatalog(packageDir) {
  const catalog = new Map();
  for (const area of AREAS) {
    walkArea(path.join(packageDir, ".claude", area), area, catalog);
  }
  for (const script of RESOURCE_SCRIPTS) {
    const abs = path.join(packageDir, "scripts", script);
    try {
      const st = fs.lstatSync(abs);
      if (st.isFile() && !st.isSymbolicLink()) catalog.set("scripts/" + script, { abs, size: st.size });
    } catch (_) {
      // absent in this tree: not in the catalog
    }
  }
  return catalog;
}

function okResult(version, fields) {
  return Object.assign({ akiliVersion: version }, fields);
}

function errorResult(version, code, message, hints) {
  return { akiliVersion: version, error: Object.assign({ code, message }, hints || {}) };
}

function describeKey(k) {
  const s = String(k);
  return JSON.stringify(s.length > 64 ? s.slice(0, 64) + "..." : s);
}

// Checks args against a tool definition: object shape, no unknown keys, types,
// required. Throws invalid_argument naming the argument.
function validateArgs(def, args) {
  if (args === undefined || args === null) args = {};
  if (typeof args !== "object" || Array.isArray(args)) {
    throw new ToolError("invalid_argument", "arguments must be an object");
  }
  const props = def.inputSchema.properties;
  for (const key of Object.keys(args)) {
    if (!Object.prototype.hasOwnProperty.call(props, key)) {
      throw new ToolError("invalid_argument", `unknown argument ${describeKey(key)}`);
    }
  }
  for (const req of def.inputSchema.required || []) {
    if (!Object.prototype.hasOwnProperty.call(args, req) || args[req] === undefined || args[req] === null) {
      throw new ToolError("invalid_argument", `missing required argument ${req}`);
    }
  }
  for (const key of Object.keys(args)) {
    const v = args[key];
    if (v === undefined || v === null) continue;
    const type = props[key].type;
    if (type === "string" && typeof v !== "string") {
      throw new ToolError("invalid_argument", `argument ${key} must be a string`);
    }
    if (type === "integer" && !Number.isInteger(v)) {
      throw new ToolError("invalid_argument", `argument ${key} must be an integer`);
    }
  }
  return args;
}

function createCore(options) {
  const packageDir = options && options.packageDir;
  if (typeof packageDir !== "string" || packageDir === "") {
    throw new TypeError("createCore requires { packageDir }");
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));
  const akiliVersion = pkg.version;
  const catalog = buildCatalog(packageDir);
  const textCache = new Map();
  const metaCache = new Map();
  const defs = new Map(TOOL_DEFINITIONS.map((d) => [d.name, d]));

  // name -> key maps; names come from the file layout, looked up by Map.get.
  const commandKeys = new Map();
  const skillNames = new Set();
  for (const key of catalog.keys()) {
    let m = /^commands\/([^/]+)\.md$/.exec(key);
    if (m) commandKeys.set(m[1], key);
    m = /^skills\/([^/]+)\/SKILL\.md$/.exec(key);
    if (m) skillNames.add(m[1]);
  }
  const sortedCommandNames = Array.from(commandKeys.keys()).sort();
  const sortedSkillNames = Array.from(skillNames).sort();

  // The only file read after build. Unknown or non-string keys return null.
  function readFile(key) {
    if (typeof key !== "string") return null;
    const entry = catalog.get(key);
    if (entry === undefined) return null;
    let text = textCache.get(key);
    if (text === undefined) {
      text = fs.readFileSync(entry.abs, "utf8");
      textCache.set(key, text);
    }
    return text;
  }

  function frontmatterOf(key) {
    let meta = metaCache.get(key);
    if (meta === undefined) {
      meta = parseFrontmatter(readFile(key));
      metaCache.set(key, meta);
    }
    return meta;
  }

  const handlers = {
    list_commands() {
      const commands = sortedCommandNames.map((cmd) => {
        const key = commandKeys.get(cmd);
        const fm = frontmatterOf(key);
        return {
          name: typeof fm.fields.name === "string" && fm.fields.name !== "" ? fm.fields.name : cmd,
          description: typeof fm.fields.description === "string" ? fm.fields.description : "",
          parts: splitParts(renderCommand(readFile(key), "")).length,
        };
      });
      return { commands };
    },

    get_command(args) {
      const key = commandKeys.get(args.name);
      if (key === undefined) {
        throw new ToolError("not_found", "unknown command", { valid: sortedCommandNames.slice() });
      }
      const raw = readFile(key);
      const skills = detectSkills(parseFrontmatter(raw).body, sortedSkillNames);
      const page = pageText(renderCommand(raw, args.arguments), args.part);
      const out = { name: args.name, part: page.part, parts: page.parts, skills, text: page.text };
      if (page.part === 1) out.usage = USAGE;
      return out;
    },
  };

  // Tools whose handlers arrive in a later task answer `internal` for now.
  function notReady() {
    throw new ToolError("internal", "tool not available");
  }

  function callTool(name, args) {
    try {
      const def = typeof name === "string" ? defs.get(name) : undefined;
      if (def === undefined) {
        throw new ToolError("unknown_tool", "unknown tool", { valid: TOOL_DEFINITIONS.map((d) => d.name) });
      }
      const clean = validateArgs(def, args);
      const handler = Object.prototype.hasOwnProperty.call(handlers, def.name) ? handlers[def.name] : notReady;
      return okResult(akiliVersion, handler(clean));
    } catch (err) {
      if (err instanceof ToolError) {
        return errorResult(akiliVersion, err.code, err.message, err.hints);
      }
      return errorResult(akiliVersion, "internal", "internal error");
    }
  }

  return {
    akiliVersion,
    callTool,
    keys: () => Array.from(catalog.keys()).sort(),
    readFile,
  };
}

module.exports = {
  PART_CHARS,
  RESOURCE_SCRIPTS,
  ERROR_CODES,
  TOOL_DEFINITIONS,
  ToolError,
  createCore,
  parseFrontmatter,
  renderCommand,
  splitParts,
  pageText,
};

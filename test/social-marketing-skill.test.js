"use strict";

// @akili-spec changes/akili-marketing (T3)
//
// Locks the packaged `social-marketing` skill: the exact file set, the
// attribution a licence obligation requires, the stripped vendor vocabulary and
// the installed payload. The 13 names below are literals on purpose -- reading
// the expected list from the directory under test would assert the directory
// against itself. Reads return "" / [] for a missing path so a missing skill
// fails an assertion instead of throwing ENOENT.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const AKILI_BIN = path.join(REPO_ROOT, "bin", "akili.js");
const SKILL_DIR = path.join(REPO_ROOT, ".claude", "skills", "social-marketing");

const PINS = {
  instagram: ["https://github.com/sergebulaev/instagram-skills", "6a124481d0ebe9b6d3ac1323ed2a2abc40c7e1d7"],
  linkedin: ["https://github.com/sergebulaev/linkedin-skills", "c4447ead7723aa0b65bbfb5d9281784b20dce75a"],
  facebook: ["https://github.com/sergebulaev/facebook-skills", "f3fb266c0b984cf5e9e9e3a6a57021373f3ced68"],
};

const REFERENCES = [
  "angles-framework.md",
  "brand-voice-template.md",
  "facebook.md",
  "hook-formulas.md",
  "humanizer.md",
  "instagram.md",
  "linkedin.md",
  "planning-and-calendar.md",
  "repurposing.md",
  "untrusted-content.md",
  "voice-rules.md",
];
const PLATFORM_REFERENCES = ["facebook.md", "instagram.md", "linkedin.md"];
const EXPECTED_FILES = ["LICENSE", "SKILL.md", ...REFERENCES.map((f) => "references/" + f)].sort();

// Vendor vocabulary and nudges that must not ship (FR-1 *Vendor paths and nudges are stripped*).
const FORBIDDEN =
  /publora|pixfaro|apify|custom_poster|star (the|on|us)|schedul(e|ing) (the|a) post|api key|access token/i;
const FORBIDDEN_EXT = /\.(py|env|sh|cjs|js)$/;

// The standalone line; the command's `## Invariants` owns the conditions.
const STANDALONE =
  "This skill drafts only and never publishes; approval counts only when it comes in the user's own words, as `/akili-marketing` defines it.";

function read(file) {
  try {
    return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  } catch (_) {
    return "";
  }
}

// Recursive relative listing, forward slashes; [] when the directory is missing.
function listTree(dir, rel = "") {
  let entries;
  try {
    entries = fs.readdirSync(path.join(dir, rel), { withFileTypes: true });
  } catch (_) {
    return [];
  }
  const out = [];
  for (const e of entries) {
    const r = rel ? rel + "/" + e.name : e.name;
    if (e.isDirectory()) out.push(...listTree(dir, r));
    else out.push(r);
  }
  return out.sort();
}

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  return m ? m[1] : "";
}

function mkTmp(t, prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("SKILL.md frontmatter carries author, license, adaptation, binding and all three pins", () => {
  const fm = frontmatter(read(path.join(SKILL_DIR, "SKILL.md")));
  assert.match(fm, /^license: MIT$/m);
  assert.match(fm, /^ {2}author: "Sergey Bulaev"$/m);
  assert.match(fm, /^ {2}adapted-by: "Juan Carlos Cadavid — jcadavid\.com"$/m);
  assert.match(fm, /^ {2}adapted-for: "AKILI-SPECS"$/m);
  assert.match(fm, /^ {2}binding: core$/m);
  assert.match(fm, /^ {2}version: ".+"$/m);
  const source = (fm.match(/^ {2}source: (.*)$/m) || [])[1] || "";
  for (const [name, [url, sha]] of Object.entries(PINS)) {
    assert.ok(source.includes(url), `source names the ${name} URL`);
    assert.ok(source.includes(sha), `source carries the ${name} pin`);
  }
});

test("LICENSE keeps the upstream copyright notice and MIT permission sentence", () => {
  const licence = read(path.join(SKILL_DIR, "LICENSE"));
  assert.ok(licence.includes("Copyright (c) 2026 Sergey Bulaev"), "copyright line");
  assert.ok(
    licence.includes("Permission is hereby granted, free of charge, to any person obtaining a copy"),
    "MIT permission sentence"
  );
});

test("file set is exactly the 13 expected names", () => {
  assert.deepEqual(listTree(SKILL_DIR), EXPECTED_FILES);
});

test("no vendor vocabulary in any file and no script or env file", () => {
  const files = listTree(SKILL_DIR);
  assert.ok(files.length > 0, "the skill directory is present");
  assert.deepEqual(files.filter((f) => FORBIDDEN_EXT.test(f)), []);
  for (const f of files) {
    const m = read(path.join(SKILL_DIR, f)).match(FORBIDDEN);
    assert.equal(m, null, `${f} matches the forbidden pattern: ${m && m[0]}`);
  }
});

test("SKILL.md carries the standalone never-publish line", () => {
  assert.ok(read(path.join(SKILL_DIR, "SKILL.md")).includes(STANDALONE));
});

test("SKILL.md Integration table names every mode and loads only existing references", () => {
  const text = read(path.join(SKILL_DIR, "SKILL.md"));
  const section = (text.split(/^## AKILI-SPECS Integration$/m)[1] || "").split(/^## /m)[0];
  for (const mode of ["brand", "angles", "campaign", "calendar", "post", "review", "repurpose"]) {
    assert.match(section, new RegExp("^\\| `" + mode + "` \\|", "m"), `row for ${mode}`);
  }
  const named = [...section.matchAll(/`([a-z-]+\.md)`/g)].map((m) => m[1]);
  assert.ok(named.length > 0, "the table names references");
  for (const n of named) assert.ok(REFERENCES.includes(n), `${n} is a shipped reference`);
});

test("SKILL.md angles, campaign and post rows load angles-framework.md; the body credits the method", () => {
  const text = read(path.join(SKILL_DIR, "SKILL.md"));
  const section = (text.split(/^## AKILI-SPECS Integration$/m)[1] || "").split(/^## /m)[0];
  for (const mode of ["angles", "campaign", "post"]) {
    const row = section.split("\n").find((l) => l.startsWith("| `" + mode + "` |")) || "";
    assert.ok(row.includes("`angles-framework.md`"), `${mode} row loads angles-framework.md`);
  }
  const body = text.split(/^## AKILI-SPECS Integration$/m)[0];
  assert.match(body, /Nico Azero/, "SKILL.md body credits the method");
  assert.ok(body.includes("references/angles-framework.md"), "SKILL.md body points to the reference");
});

test("angles-framework.md carries the credit, four types, five approaches, sourcing rule, ID scheme and map shape", () => {
  const text = read(path.join(SKILL_DIR, "references", "angles-framework.md"));
  // Every literal is checked inside the section that owns it: the worked example
  // repeats the approach names and the map blocks, so whole-file matching would
  // pass with the owning row deleted.
  const sec = (heading) => (text.split("\n## " + heading + "\n")[1] || "").split(/^## /m)[0];
  const head = text.split("\n").slice(0, 4).join("\n");
  assert.match(head, /^AKILI-authored/m, "AKILI-authored line in the first lines");
  assert.ok(head.includes("Nico Azero") && head.includes("Así creo 6.480 reels con Claude en 3h"), "method credit names the author and the video");
  const types = sec("The four angle types");
  for (const t of ["Problem", "Desire", "Objection", "Belief"]) assert.match(types, new RegExp("^\\| " + t + " \\| [PDOB] \\| ", "m"), `${t} type row`);
  const approaches = sec("The five approaches");
  assert.ok(approaches.includes("| Approach | What it does | Do not use when |"), "approach table has the do-not-use column");
  const rows = {
    Expert: "| Expert | Teaches something",
    Bridge: "| Bridge | Starts at",
    Differentiator: "| Differentiator | Shows what is different",
    "Social proof": "| Social proof | Uses a real case",
    Connection: "| Connection | Tells the owner",
  };
  for (const [a, lead] of Object.entries(rows)) assert.ok(approaches.includes("\n" + lead), `${a} approach row (method table)`);
  assert.ok(approaches.includes("never invent a testimonial, client name or figure"), "Social proof row forbids invented testimonials, client names and figures");
  assert.ok(sec("How many, and where they come from").includes("**Up to nine per type, never padded.**"), "sourcing rule: up to nine, never padded");
  assert.ok(sec("ID scheme").includes("`<CODE>-<type letter><n>`"), "ID scheme literal");
  const shape = sec("The shape of `angles.md`");
  assert.ok(shape.includes("`## Approaches applied`") && shape.includes("`## Open questions`"), "map shape blocks");
  assert.ok(shape.includes("follow `/akili-marketing` `## Invariants`"), "status and approval pointed to the command");
  assert.ok(shape.includes("This file does not restate those rules."), "map-shape section does not restate the invariants");
});

test("install --tool claude lands the same 13 files, byte-identical, in a temp target", (t) => {
  const home = mkTmp(t, "sms-install-");
  const target = path.join(home, "claude");
  const result = spawnSync(
    process.execPath,
    [AKILI_BIN, "install", "--tool", "claude", "--claude-target", target],
    { encoding: "utf8", env: Object.assign({}, process.env, { HOME: home, USERPROFILE: home }) }
  );
  assert.equal(result.status, 0, result.stderr);
  const installed = path.join(target, "skills", "social-marketing");
  assert.deepEqual(listTree(installed), EXPECTED_FILES);
  for (const f of EXPECTED_FILES) {
    const a = fs.readFileSync(path.join(SKILL_DIR, f));
    const b = fs.readFileSync(path.join(installed, f));
    assert.ok(a.equals(b), `${f} is byte-identical after install`);
  }
});

test("each platform reference states lastVerified", () => {
  for (const f of PLATFORM_REFERENCES) {
    const text = read(path.join(SKILL_DIR, "references", f));
    assert.match(text, /^lastVerified: \d{4}-\d{2}-\d{2}$/m, `${f} lastVerified`);
  }
});

test("every reference opens with an Adapted from or AKILI-authored line", () => {
  for (const f of REFERENCES) {
    const head = read(path.join(SKILL_DIR, "references", f)).split("\n").slice(0, 3).join("\n");
    assert.match(head, /Adapted from|AKILI-authored/, `${f} first 3 lines`);
  }
});

"use strict";

// @akili-spec changes/nestjs-official-skills T4
//
// Pure helpers (no I/O) behind the `doctor --agents` Skill Map scan and the
// retired-skill table. The table is shaped so bin/akili.js can require it for
// the installer cleanup loops as well.

const RETIRED_SKILLS = [
  {
    name: "nestjs-expert",
    replacement:
      "nestjs-feature plus the official set (nestjs, nestjs-auth, nestjs-data, nestjs-production, nestjs-testing)",
  },
];

const WORD_CHAR = /[A-Za-z0-9_-]/;
const FENCE = /^\s*(```|~~~)/;

function splitLines(text) {
  return String(text).split("\n").map((l) => l.replace(/\r$/, ""));
}

// Returns { start, end } as 0-based line indexes (start = the heading, end =
// exclusive), or null when there is no `## Skill Map` heading. Only the first
// heading opens a section.
function findSkillMapSection(text) {
  const lines = splitLines(text);
  let fenced = false;
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (FENCE.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (start < 0) {
      if (line.replace(/\s+$/, "") === "## Skill Map") start = i;
    } else if (line.startsWith("## ") || line.startsWith("# ")) {
      return { start, end: i };
    }
  }
  return start < 0 ? null : { start, end: lines.length };
}

function matchesToken(line, name) {
  let from = 0;
  for (;;) {
    const at = line.indexOf(name, from);
    if (at < 0) return false;
    const before = at === 0 ? "" : line[at - 1];
    const after = line[at + name.length] || "";
    if (!(before && WORD_CHAR.test(before)) && !(after && WORD_CHAR.test(after))) return true;
    from = at + 1;
  }
}

// Returns [{ name, line, replacement }] in line order, 1-based lines.
function scanSkillMap(text, retired = RETIRED_SKILLS) {
  const section = findSkillMapSection(text);
  if (!section) return [];
  const lines = splitLines(text);
  const hits = [];
  for (let i = section.start + 1; i < section.end; i++) {
    for (const r of retired) {
      if (matchesToken(lines[i], r.name)) hits.push({ name: r.name, line: i + 1, replacement: r.replacement });
    }
  }
  return hits;
}

module.exports = { RETIRED_SKILLS, findSkillMapSection, scanSkillMap };

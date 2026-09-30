// Pure parsing and section-state functions for the persona marker grammar
// (design.md §5.1–§5.4). No I/O, no dependency beyond node:crypto — required by
// bin/akili.js (doctor --agents) and by scripts/release.js (digest generation),
// neither of which may pull in bin/akili.js itself (that file runs main() on
// load).
"use strict";

const crypto = require("crypto");

const SECTION_OPEN_RE = /^<!-- akili:section id=([a-z0-9-]+) since=(\S+) -->$/;
const SECTION_CLOSE_RE = /^<!-- \/akili:section -->$/;
const PROJECT_OPEN_RE = /^<!-- akili:project -->$/;
const PROJECT_CLOSE_RE = /^<!-- \/akili:project -->$/;
const MIGRATION_RECORD_RE = /^<!-- akili:migrated (\S+) not-located=(\S+) -->$/;

// Majority line ending of the whole file (design §5.1: "the writer emits the
// file's majority line ending, so a CRLF persona stays CRLF").
function detectEol(text) {
  const crlfCount = (text.match(/\r\n/g) || []).length;
  const allLf = (text.match(/\n/g) || []).length;
  const lfOnlyCount = allLf - crlfCount;
  return crlfCount > lfOnlyCount ? "\r\n" : "\n";
}

// §5.1 body comparison normalization: strip \r, strip trailing whitespace per
// line, collapse to exactly one trailing newline.
function normalizeBody(body) {
  const lines = body.split(/\r\n|\n|\r/).map((line) => line.replace(/[ \t]+$/, ""));
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n") + "\n";
}

function hashBody(body) {
  return crypto.createHash("sha256").update(normalizeBody(body), "utf8").digest("hex");
}

// Parse a persona (or template) file's text into its marker structure.
// Returns:
//   {
//     eol, frontMatter: {startLine, endLine} | null,
//     unmarked: boolean,      // no marker of any kind (§5.1 exception)
//     unreadable: boolean,    // grammar violation (§5.1); false when unmarked
//     unreadableReason: string | null,
//     sections: [{ id, since, body }],   // well-formed open/close pairs, in file order
//     projectBlockCount: number,
//     migrationRecord: { release, notLocated: string[] } | null,
//   }
function parsePersona(text) {
  const eol = detectEol(text);
  const rawLines = text.split(/\r\n|\n/);

  let frontMatter = null;
  let scanStart = 0;
  if (rawLines[0] === "---") {
    let end = -1;
    for (let i = 1; i < rawLines.length; i++) {
      if (rawLines[i] === "---") {
        end = i;
        break;
      }
    }
    if (end !== -1) {
      frontMatter = { startLine: 0, endLine: end };
      scanStart = end + 1;
    }
  }

  let anyMarker = false;
  let unreadableReason = null;
  const flagUnreadable = (reason) => {
    if (!unreadableReason) unreadableReason = reason;
  };

  const seenIds = new Set();
  const openStack = [];
  const sections = [];
  let projectOpenCount = 0;
  let projectCloseCount = 0;
  // Tracks the project block's own open/close state IN SCAN ORDER, separate
  // from the totals below. The totals alone cannot tell "well-formed" from
  // "a close before its matching open" when both markers happen to appear
  // once each (design §5.1: "a close has no open" is a general open/close
  // rule, not a section-only one) — nor can they see a project block that
  // opens and closes entirely inside a section's span (§5.1: nesting is not
  // allowed). Both are order/position facts the running counts discard.
  let projectIsOpen = false;
  const migrationRecords = [];

  for (let i = scanStart; i < rawLines.length; i++) {
    const line = rawLines[i];
    let m;
    if ((m = line.match(SECTION_OPEN_RE))) {
      anyMarker = true;
      const id = m[1];
      const since = m[2];
      if (openStack.length > 0) {
        flagUnreadable(`section id=${id} opens inside id=${openStack[openStack.length - 1].id}`);
      }
      if (projectIsOpen) {
        flagUnreadable(`section id=${id} opens inside the project block`);
      }
      if (seenIds.has(id)) {
        flagUnreadable(`duplicate section id=${id}`);
      }
      seenIds.add(id);
      openStack.push({ id, since, line: i });
    } else if (SECTION_CLOSE_RE.test(line)) {
      anyMarker = true;
      if (openStack.length === 0) {
        flagUnreadable(`close marker with no open at line ${i}`);
      } else {
        const open = openStack.pop();
        sections.push({
          id: open.id,
          since: open.since,
          body: rawLines.slice(open.line + 1, i).join("\n"),
        });
      }
    } else if (PROJECT_OPEN_RE.test(line)) {
      anyMarker = true;
      projectOpenCount += 1;
      if (openStack.length > 0) {
        flagUnreadable(`project block opens inside section id=${openStack[openStack.length - 1].id}`);
      }
      projectIsOpen = true;
    } else if (PROJECT_CLOSE_RE.test(line)) {
      anyMarker = true;
      projectCloseCount += 1;
      if (!projectIsOpen) {
        flagUnreadable(`project block close with no open at line ${i}`);
      }
      projectIsOpen = false;
    } else if ((m = line.match(MIGRATION_RECORD_RE))) {
      anyMarker = true;
      const notLocated = m[2] === "none" ? [] : m[2].split(",").filter(Boolean);
      migrationRecords.push({ release: m[1], notLocated });
    }
  }

  if (openStack.length > 0) {
    flagUnreadable(`unclosed section id=${openStack[openStack.length - 1].id}`);
  }

  const unmarked = !anyMarker;
  let unreadable = false;
  if (!unmarked) {
    if (unreadableReason) unreadable = true;
    if (projectOpenCount !== projectCloseCount) {
      unreadable = true;
      flagUnreadable(`project block open/close mismatch (${projectOpenCount} open, ${projectCloseCount} close)`);
    } else if (projectOpenCount !== 1) {
      unreadable = true;
      flagUnreadable(`project block count is ${projectOpenCount}, expected 1`);
    }
    if (migrationRecords.length > 1) {
      unreadable = true;
      flagUnreadable(`${migrationRecords.length} migration records, expected at most 1`);
    }
  }

  return {
    eol,
    frontMatter,
    unmarked,
    unreadable,
    unreadableReason: unreadable ? unreadableReason : null,
    sections,
    projectBlockCount: projectOpenCount,
    migrationRecord: migrationRecords[0] || null,
  };
}

// FR-3 / design §5.4: one state per template section, computed from a parsed
// persona, a parsed template, and a role-scoped digest table
// { releases: { "<version>": { <id>: hash } }, legacy: { <id>: { <tag>: hash } } }.
// `persona` is null when the persona file does not exist (the `absent` file
// state); the `.agents/` directory itself being absent is a caller concern,
// never reaching this function.
//
// Every row of design §5.4 lands in exactly one branch below:
//   absent (file)              -> persona === null guard
//   unreadable                 -> persona.unreadable guard
//   unmarked (every id)        -> persona.unmarked guard
//   current                    -> pHash === currentHash
//   outdated                   -> pHash matches a releases/legacy entry
//   custom-edited               -> pHash matches nothing (default when no digest matches)
//   missing                     -> id absent from persona, not in the migration record
//   unlocated                   -> id absent from persona, listed in the migration record
//   extra                       -> persona holds an id the template does not
function sectionStates(persona, template, digests) {
  const table = digests || {};
  const releases = table.releases || {};
  const legacy = table.legacy || {};

  if (persona === null || persona === undefined) {
    return { status: "absent" };
  }
  if (persona.unreadable) {
    return { status: "unreadable", reason: persona.unreadableReason };
  }
  if (persona.unmarked) {
    return {
      status: "unmarked",
      sections: template.sections.map((tSec) => ({ id: tSec.id, state: "unmarked" })),
    };
  }

  const templateIds = new Set(template.sections.map((tSec) => tSec.id));
  const notLocated = new Set(
    persona.migrationRecord ? persona.migrationRecord.notLocated : []
  );

  const sectionRows = [];

  for (const tSec of template.sections) {
    const currentHash = hashBody(tSec.body);
    const pSec = persona.sections.find((s) => s.id === tSec.id);

    if (!pSec) {
      sectionRows.push({
        id: tSec.id,
        state: notLocated.has(tSec.id) ? "unlocated" : "missing",
      });
      continue;
    }

    const pHash = hashBody(pSec.body);
    if (pHash === currentHash) {
      sectionRows.push({ id: tSec.id, state: "current" });
      continue;
    }

    let matchedRelease = null;
    for (const [release, ids] of Object.entries(releases)) {
      if (ids && ids[tSec.id] === pHash) {
        matchedRelease = release;
        break;
      }
    }
    if (!matchedRelease) {
      const legacyForId = legacy[tSec.id] || {};
      for (const [tag, hash] of Object.entries(legacyForId)) {
        if (hash === pHash) {
          matchedRelease = tag;
          break;
        }
      }
    }

    sectionRows.push(
      matchedRelease
        ? { id: tSec.id, state: "outdated", matched: matchedRelease }
        : { id: tSec.id, state: "custom-edited" }
    );
  }

  for (const pSec of persona.sections) {
    if (!templateIds.has(pSec.id)) {
      sectionRows.push({ id: pSec.id, state: "extra" });
    }
  }

  return { status: "ok", sections: sectionRows };
}

// States that keep `akili doctor --agents` at exit 0 (FR-3): the maintainer's
// own decisions. Every other section state, an unreadable file, an unmarked
// file, or an absent persona file fails the run.
const EXIT_ZERO_STATES = new Set(["current", "custom-edited", "extra", "unlocated"]);

function resultExitCode(result) {
  if (result.status === "absent" || result.status === "unreadable") return 1;
  if (result.status === "unmarked") return result.sections.length > 0 ? 1 : 0;
  return result.sections.some((s) => !EXIT_ZERO_STATES.has(s.state)) ? 1 : 0;
}

module.exports = {
  parsePersona,
  normalizeBody,
  hashBody,
  sectionStates,
  resultExitCode,
  EXIT_ZERO_STATES,
};

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
  // Line indices of the project block's own markers and the (at most one)
  // migration record, captured only so a well-formed persona can later be
  // rebuilt line-for-line by buildSegments — never consulted by the grammar
  // checks above, which already have their own well-formedness logic.
  let projectOpenLine = -1;
  let projectCloseLine = -1;
  let migrationLine = -1;

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
          openLine: open.line,
          closeLine: i,
        });
      }
    } else if (PROJECT_OPEN_RE.test(line)) {
      anyMarker = true;
      projectOpenCount += 1;
      if (openStack.length > 0) {
        flagUnreadable(`project block opens inside section id=${openStack[openStack.length - 1].id}`);
      }
      projectIsOpen = true;
      projectOpenLine = i;
    } else if (PROJECT_CLOSE_RE.test(line)) {
      anyMarker = true;
      projectCloseCount += 1;
      if (!projectIsOpen) {
        flagUnreadable(`project block close with no open at line ${i}`);
      }
      projectIsOpen = false;
      projectCloseLine = i;
    } else if ((m = line.match(MIGRATION_RECORD_RE))) {
      anyMarker = true;
      const notLocated = m[2] === "none" ? [] : m[2].split(",").filter(Boolean);
      migrationRecords.push({ release: m[1], notLocated, line: i });
      migrationLine = i;
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

  // Segments: an ordered, whole-file reconstruction list — design's
  // parsePersona(text) -> {..., segments[]}. Built only for a well-formed,
  // marked persona/template (never for `unmarked` — nothing to fence yet,
  // that is migratePersona's job (T4) — and never for `unreadable`, whose
  // marker positions are not trustworthy). Every line of the file lands in
  // exactly one segment: 'text' for everything outside a marker (front
  // matter, the title, blank lines, unfenced prose — i.e. project space
  // that is not the project block itself), 'owned' for a fenced section,
  // 'project' for the project block's body, 'migration' for the migration
  // record. applyFix (below) only ever replaces or inserts 'owned' segments
  // and edits a 'migration' segment's notLocated list — it never touches a
  // 'text' or 'project' segment, which is exactly what keeps project space
  // byte-identical (FR-4, NFR-4) as a structural guarantee rather than a
  // rule the fix has to remember to obey.
  let segments = null;
  if (!unmarked && !unreadable) {
    const regions = [];
    for (const s of sections) {
      regions.push({ kind: "owned", start: s.openLine, end: s.closeLine, id: s.id, since: s.since });
    }
    if (projectOpenLine !== -1) {
      regions.push({ kind: "project", start: projectOpenLine, end: projectCloseLine });
    }
    if (migrationRecords.length) {
      const rec = migrationRecords[0];
      regions.push({ kind: "migration", start: rec.line, end: rec.line, release: rec.release, notLocated: rec.notLocated.slice() });
    }
    regions.sort((a, b) => a.start - b.start);

    segments = [];
    let cursor = 0;
    for (const r of regions) {
      if (r.start > cursor) {
        segments.push({ kind: "text", lines: rawLines.slice(cursor, r.start) });
      }
      if (r.kind === "owned") {
        segments.push({ kind: "owned", id: r.id, since: r.since, bodyLines: rawLines.slice(r.start + 1, r.end) });
      } else if (r.kind === "project") {
        segments.push({ kind: "project", bodyLines: rawLines.slice(r.start + 1, r.end) });
      } else if (r.kind === "migration") {
        segments.push({ kind: "migration", release: r.release, notLocated: r.notLocated });
      }
      cursor = r.end + 1;
    }
    if (cursor < rawLines.length) {
      segments.push({ kind: "text", lines: rawLines.slice(cursor) });
    }
  }

  return {
    eol,
    text,
    frontMatter,
    unmarked,
    unreadable,
    unreadableReason: unreadable ? unreadableReason : null,
    sections,
    segments,
    projectBlockCount: projectOpenCount,
    migrationRecord: migrationRecords[0] || null,
  };
}

// Renders an ordered segment list (parsePersona's `segments`) back into
// file text, joining every line with `eol` — design §5.1: "the writer emits
// the file's majority line ending". A marker line is always regenerated
// from its structured fields (id/since, release/notLocated), never stored
// as raw text: SECTION_OPEN_RE / MIGRATION_RECORD_RE etc. are anchored,
// fixed-spacing patterns, so a line that matched one had exactly this text
// already — regenerating it loses no information for an unchanged segment,
// and is what lets a changed one (a new `since`, a trimmed notLocated list)
// come out correctly formatted too.
function renderSegments(segments, eol) {
  const lines = [];
  for (const seg of segments) {
    if (seg.kind === "text") {
      lines.push(...seg.lines);
    } else if (seg.kind === "owned") {
      lines.push(`<!-- akili:section id=${seg.id} since=${seg.since} -->`);
      lines.push(...seg.bodyLines);
      lines.push(`<!-- /akili:section -->`);
    } else if (seg.kind === "project") {
      lines.push(`<!-- akili:project -->`);
      lines.push(...seg.bodyLines);
      lines.push(`<!-- /akili:project -->`);
    } else if (seg.kind === "migration") {
      const notLocated = seg.notLocated.length ? seg.notLocated.join(",") : "none";
      lines.push(`<!-- akili:migrated ${seg.release} not-located=${notLocated} -->`);
    }
  }
  return lines.join(eol);
}

// FR-4 / FR-5 boundary, design §5.4 + DD-4: for a well-formed, marked
// persona, replaces every `outdated` section, inserts every `missing` one,
// and (with `opts.sections`) lets `--section <id>` force a `custom-edited`
// replace or an `unlocated` insert. Pure: returns the new text and a change
// list; the caller (runAgentsDoctor) owns the backup and the write. Every
// §5.4 row is handled by exactly one branch of the switch below (KZ-004) —
// `current` and `extra` are explicit no-ops, not a silent fall-through.
//
//   absent (persona === null)  -> install the packaged template verbatim
//   unreadable                 -> skip the file, report why
//   unmarked                   -> skip the file; migratePersona is T4's job
//   current                    -> no-op
//   outdated                   -> replace body + since
//   custom-edited              -> skip, unless --section <id>: replace
//   missing                    -> insert at the DD-4 position
//   unlocated                  -> skip, unless --section <id>: insert + drop from the migration record
//   extra                      -> no-op (FR-4: never changed)
function applyFix(persona, template, digests, opts) {
  const options = opts || {};
  const sectionOverrides = new Set(options.sections || []);

  if (persona === null || persona === undefined) {
    return {
      changed: true,
      text: template.text,
      rows: [{ id: null, action: "installed", detail: null }],
    };
  }

  if (persona.unreadable) {
    return {
      changed: false,
      text: null,
      rows: [{ id: null, action: "skipped", detail: `unreadable: ${persona.unreadableReason}` }],
    };
  }

  if (persona.unmarked) {
    return {
      changed: false,
      text: null,
      rows: [{ id: null, action: "skipped", detail: "unmarked; migration runs via migratePersona, not this fix" }],
    };
  }

  const result = sectionStates(persona, template, digests);
  const segments = persona.segments.slice();
  const rows = [];
  let changed = false;
  const removedFromRecord = [];

  const findOwnedIndex = (id) => segments.findIndex((seg) => seg.kind === "owned" && seg.id === id);
  const findProjectIndex = () => segments.findIndex((seg) => seg.kind === "project");
  const findMigrationIndex = () => segments.findIndex((seg) => seg.kind === "migration");

  // DD-4: "after the persona's segment for the template's preceding
  // section; when that is absent, before the next present one; when
  // neither exists, before the project block."
  const insertionIndex = (id) => {
    const tIdx = template.sections.findIndex((s) => s.id === id);
    for (let j = tIdx - 1; j >= 0; j--) {
      const segIdx = findOwnedIndex(template.sections[j].id);
      if (segIdx !== -1) return segIdx + 1;
    }
    for (let j = tIdx + 1; j < template.sections.length; j++) {
      const segIdx = findOwnedIndex(template.sections[j].id);
      if (segIdx !== -1) return segIdx;
    }
    const projIdx = findProjectIndex();
    if (projIdx === -1) return segments.length;
    // §5.1 / DD-13: the migration record sits immediately before the project
    // block. When this fallback's neighbourless insertion would otherwise
    // land between them (the segment right before the project block is the
    // migration record), insert before the record instead, so the record
    // stays adjacent to the project block after the splice.
    if (projIdx > 0 && segments[projIdx - 1].kind === "migration") return projIdx - 1;
    return projIdx;
  };

  for (const row of result.sections) {
    const tSec = template.sections.find((s) => s.id === row.id);
    switch (row.state) {
      case "current":
        // Already matches the packaged template; --section on a `current`
        // id is a no-op too (FR-4 only gives --section an effect on
        // custom-edited/unlocated).
        break;
      case "outdated": {
        const idx = findOwnedIndex(row.id);
        segments[idx] = { kind: "owned", id: row.id, since: tSec.since, bodyLines: tSec.body.split("\n") };
        rows.push({ id: row.id, action: "fixed", detail: `matched ${row.matched}` });
        changed = true;
        break;
      }
      case "custom-edited": {
        if (sectionOverrides.has(row.id)) {
          const idx = findOwnedIndex(row.id);
          segments[idx] = { kind: "owned", id: row.id, since: tSec.since, bodyLines: tSec.body.split("\n") };
          rows.push({ id: row.id, action: "fixed", detail: "--section override" });
          changed = true;
        } else {
          rows.push({ id: row.id, action: "skipped", detail: "custom-edited; use --section" });
        }
        break;
      }
      case "missing": {
        const idx = insertionIndex(row.id);
        segments.splice(idx, 0, { kind: "owned", id: row.id, since: tSec.since, bodyLines: tSec.body.split("\n") });
        rows.push({ id: row.id, action: "inserted", detail: null });
        changed = true;
        break;
      }
      case "unlocated": {
        if (sectionOverrides.has(row.id)) {
          const idx = insertionIndex(row.id);
          segments.splice(idx, 0, { kind: "owned", id: row.id, since: tSec.since, bodyLines: tSec.body.split("\n") });
          rows.push({ id: row.id, action: "inserted", detail: "--section (removed from migration record)" });
          changed = true;
          removedFromRecord.push(row.id);
        } else {
          rows.push({ id: row.id, action: "skipped", detail: "unlocated; use --section" });
        }
        break;
      }
      case "extra":
        // FR-4: "it SHALL NOT change an extra section." Explicit branch,
        // not a default fall-through (KZ-004): the persona's segment for
        // this id is left exactly as it is.
        break;
      default:
        // Every §5.4 row for a well-formed marked persona is one of the
        // cases above; a new state reaching here is a real bug, not a case
        // to swallow silently.
        throw new Error(`applyFix: unhandled section state "${row.state}" for id ${row.id}`);
    }
  }

  if (removedFromRecord.length) {
    const migIdx = findMigrationIndex();
    if (migIdx !== -1) {
      const seg = segments[migIdx];
      segments[migIdx] = {
        kind: "migration",
        release: seg.release,
        notLocated: seg.notLocated.filter((id) => !removedFromRecord.includes(id)),
      };
    }
  }

  if (!changed) {
    return { changed: false, text: null, rows };
  }

  return { changed: true, text: renderSegments(segments, persona.eol), rows };
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
  renderSegments,
  applyFix,
};

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

// §5.2's level-rule primitives, module-level (T5/DD-3): migratePersona (DD-6)
// locates sections in an UNMARKED persona against KNOWN signatures;
// seedLegacySections (T5) cuts sections out of a pre-marker git tag's
// template with NO signatures available yet (it is generating them) — two
// different location strategies that must still cut a found span by the
// exact same §5.2 rule, so the cutting primitives live here once and both
// callers use them, never a second implementation (the T4 Reviewer's
// advisory).
const ITEM_RE = /^\d+\.\s{1,2}\*\*/;
const HEADING_RE = /^## /; // exactly two `#`; `### ` never matches this

// A section's level is the level of its first line (§5.2).
function levelOf(body) {
  return ITEM_RE.test(body.split("\n")[0]) ? "item" : "heading";
}

// Every structural candidate start-line in file order: an item (column 0) or
// a `##` heading, from `scanStart` on (past front matter). `###` lines are
// never candidates, so they can never start, end, or interrupt a section.
function buildCandidates(rawLines, scanStart) {
  const candidates = [];
  for (let i = scanStart; i < rawLines.length; i++) {
    if (ITEM_RE.test(rawLines[i])) candidates.push({ line: i, kind: "item" });
    else if (HEADING_RE.test(rawLines[i])) candidates.push({ line: i, kind: "heading" });
  }
  return candidates;
}

// FR-1's unfenced list names "horizontal rules and blank lines" as text
// outside any owned section — trim them back off a located span's tail so it
// matches what a marked template would itself fence (see migratePersona's
// call site for the fuller rationale).
function trimTrailingGap(rawLines, startLine, endExclusive) {
  let e = endExclusive;
  while (e > startLine + 1) {
    const line = rawLines[e - 1].trim();
    if (line === "" || line === "---") {
      e -= 1;
    } else {
      break;
    }
  }
  return e;
}

// §5.2: an item-level section ends at the next candidate of either kind (a
// `##` is a higher level and also ends it); a `##` section ends only at the
// next `##` candidate.
function extentEnd(rawLines, candidates, idx, extentLevel) {
  const cand = candidates[idx];
  const level = extentLevel || cand.kind;
  for (let j = idx + 1; j < candidates.length; j++) {
    if (level === "item" || candidates[j].kind === "heading") {
      return trimTrailingGap(rawLines, cand.line, candidates[j].line);
    }
  }
  return trimTrailingGap(rawLines, cand.line, rawLines.length);
}

// §5.2 clarification (2026-09-30, before T4): leader.md's `primary-instructions`
// is an item-level section for MATCHING (its candidates are item-1 start
// lines, like any other item section), but its EXTENT is governed by the
// table row, not derived from the first line — the row cuts it from item 1
// to the next `##`, as items 1-4 in one block. Every other item section
// keeps the generic item-level extent (ends at the next item or the next
// `##`). This is the one named override; nothing else in §5.2 needs one.
// Exported (T5, on the T4 Reviewer's advisory) so the legacy seed below and
// migratePersona's own matching share this table instead of risking two
// diverging cuts of the same section.
function extentLevelFor(id, matchLevel) {
  return id === "primary-instructions" ? "heading" : matchLevel;
}

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

// DD-6's heading-match normalization: "stripping list numbers (one or two
// spaces), emoji, punctuation and case". Used for both the heading line
// itself and the opening-sentence line — a single normalizer so the two
// checks stay consistent with each other.
function normalizeForMatch(line) {
  return line
    .toLowerCase()
    .replace(/^\d+\.\s*/, "") // list number (any run of spaces after it)
    .replace(/^#+\s*/, "") // heading hashes
    .replace(/\*\*/g, "") // markdown bold markers
    .replace(/[\u{1F000}-\u{1FFFF}\u{2190}-\u{2BFF}\u{2600}-\u{27BF}️]/gu, "") // emoji/symbol ranges
    .replace(/[^a-z0-9\s]/g, " ") // remaining punctuation -> space
    .replace(/\s+/g, " ")
    .trim();
}

// DD-6 step 2's "section's first line" signature.
function hashHead(line) {
  return crypto.createHash("sha256").update(normalizeForMatch(line), "utf8").digest("hex");
}

// DD-6 step 2's "first 40 normalized characters of the opening sentence"
// signature.
function hashOpen(line) {
  return crypto.createHash("sha256").update(normalizeForMatch(line).slice(0, 40), "utf8").digest("hex");
}

// §5.3 amendment (2026-09-30, before T4): a digest table entry is the object
// `{ body, head, open }` — body per §5.1 normalization, head the section's
// first line normalized (DD-6), open the first 40 normalized characters of
// the first non-blank line after it. One builder, shared by every generator
// that writes this shape (seedLegacySections below for `legacy`;
// scripts/release.js's writeReleaseDigests for `releases`) and by
// migratePersona's own known-signature set (signaturesFor) — never a second
// implementation of the pair.
function sectionDigestEntry(bodyText) {
  const lines = bodyText.split("\n");
  const firstLine = lines[0];
  const openLine = lines.slice(1).find((l) => l.trim() !== "");
  return {
    body: hashBody(bodyText),
    head: hashHead(firstLine),
    open: openLine ? hashOpen(openLine) : null,
  };
}

// A bare string entry is read as `body` alone (§5.3's amendment, T2's
// tests). Shared by every reader that compares a persona's section hash
// against a `releases`/`legacy` table entry of either shape.
function entryBodyHash(entry) {
  if (entry === null || entry === undefined) return undefined;
  return typeof entry === "string" ? entry : entry.body;
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
      if (ids && entryBodyHash(ids[tSec.id]) === pHash) {
        matchedRelease = release;
        break;
      }
    }
    if (!matchedRelease) {
      const legacyForId = legacy[tSec.id] || {};
      for (const [tag, entry] of Object.entries(legacyForId)) {
        if (entryBodyHash(entry) === pHash) {
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

// FR-5 / DD-6: the one-time migration of an `unmarked` persona. Locates each
// template section's start line by exact body-hash match first, then by a
// paired heading+opening-sentence match (never heading alone — a matched
// head with no matching nearby opening sentence is left `not located`, so a
// retitled/rewritten item is never mistaken for the section it replaced).
// Every located section is cut by level (§5.2: an item ends at the next item
// or `##` line; a `##` section ends only at the next `##`; `###` never ends
// anything, by construction — it is simply never a candidate below). Front
// matter and every line outside a located span are copied through
// untouched; nothing is deleted, moved or reordered (FR-5).
//
// `release` is the record's `<release>` (design §5.1); digests.version is
// used when `release` is omitted (T5 will populate it) — this function has
// no I/O, so it cannot read package.json itself, and the caller
// (runAgentsDoctor) passes the CLI's own version explicitly.
function migratePersona(text, template, digests, release) {
  const table = digests || {};
  const eol = detectEol(text);
  const rawLines = text.split(/\r\n|\n/);

  // Front matter: same rule as parsePersona (§5.1) — a leading `---` … `---`
  // block is one text segment, scanned for nothing.
  let frontEnd = -1;
  if (rawLines[0] === "---") {
    for (let i = 1; i < rawLines.length; i++) {
      if (rawLines[i] === "---") {
        frontEnd = i;
        break;
      }
    }
  }
  const scanStart = frontEnd === -1 ? 0 : frontEnd + 1;

  // Every structural candidate start-line in file order, and the shared
  // level-rule cutting primitives (module-level above, T5) — a nested item
  // list inside a `##` section (e.g. Reporting's own numbered fields) still
  // shows up as an `item`-kind candidate here; it never closes an open `##`
  // section (the level rule only stops a `##` span at the next `##`), and it
  // is never reached as an item-level MATCH start because `cursor` has
  // already advanced past it by the time this scan gets there.
  const candidates = buildCandidates(rawLines, scanStart);

  // Every known signature for one template section id: the packaged
  // template's own body/head/open (always available, no digest needed), plus
  // whatever `releases`/`legacy` carries for this id — a bare string entry
  // (§5.3: "read as body alone") contributes to the exact set only.
  const signaturesFor = (tSec) => {
    const ownSignature = sectionDigestEntry(tSec.body);
    const bodyHashes = new Set([ownSignature.body]);
    const paired = [];
    paired.push({ head: ownSignature.head, open: ownSignature.open });

    const releases = table.releases || {};
    for (const ids of Object.values(releases)) {
      const entry = ids && ids[tSec.id];
      if (!entry) continue;
      if (typeof entry === "string") {
        bodyHashes.add(entry);
        continue;
      }
      if (entry.body) bodyHashes.add(entry.body);
      if (entry.head && entry.open) paired.push({ head: entry.head, open: entry.open });
    }
    const legacyForId = (table.legacy && table.legacy[tSec.id]) || {};
    for (const entry of Object.values(legacyForId)) {
      if (typeof entry === "string") {
        bodyHashes.add(entry);
        continue;
      }
      if (entry.body) bodyHashes.add(entry.body);
      if (entry.head && entry.open) paired.push({ head: entry.head, open: entry.open });
    }
    return { bodyHashes, paired };
  };

  let cursor = scanStart;
  const fenced = []; // { id, since, startLine, endLine }
  const rows = [];

  for (const tSec of template.sections) {
    const level = levelOf(tSec.body);
    const extentLevel = extentLevelFor(tSec.id, level);
    const { bodyHashes, paired } = signaturesFor(tSec);
    let found = null;

    for (let idx = 0; idx < candidates.length; idx++) {
      const cand = candidates[idx];
      if (cand.kind !== level || cand.line < cursor) continue;
      const end = extentEnd(rawLines, candidates, idx, extentLevel);
      const bodyText = rawLines.slice(cand.line, end).join("\n");

      if (bodyHashes.has(hashBody(bodyText))) {
        found = { startLine: cand.line, endLine: end - 1, matchType: "exact" };
        break;
      }

      // Heading + opening sentence, paired (FR-5: "heading alone" never
      // fences) — the candidate's head must equal a known entry's head, AND
      // one of the next (up to three) non-blank lines must equal THAT SAME
      // entry's opening-sentence signature.
      const candHead = hashHead(rawLines[cand.line]);
      const relevantPairs = paired.filter((p) => p.head === candHead && p.open);
      if (relevantPairs.length) {
        let nonBlankSeen = 0;
        for (let j = cand.line + 1; j < end && nonBlankSeen < 3; j++) {
          if (rawLines[j].trim() === "") continue;
          nonBlankSeen += 1;
          const oh = hashOpen(rawLines[j]);
          if (relevantPairs.some((p) => p.open === oh)) {
            found = { startLine: cand.line, endLine: end - 1, matchType: "heading" };
            break;
          }
        }
      }
      if (found) break;
    }

    if (found) {
      fenced.push({ id: tSec.id, since: tSec.since, startLine: found.startLine, endLine: found.endLine });
      cursor = found.endLine + 1;
      rows.push({ id: tSec.id, action: "fenced", detail: found.matchType });
    } else {
      rows.push({ id: tSec.id, action: "not located", detail: null });
    }
  }

  fenced.sort((a, b) => a.startLine - b.startLine);
  const notLocated = rows.filter((r) => r.action === "not located").map((r) => r.id);
  const migrationRelease = release || table.version || "unreleased";

  // DD-6 step 5 / DD-13: after the last fenced section; when nothing was
  // fenced, at end of file, or before `## Authorship` when the file has one.
  const outSegments = [];
  let cursor2 = 0;
  for (const span of fenced) {
    if (span.startLine > cursor2) {
      outSegments.push({ kind: "text", lines: rawLines.slice(cursor2, span.startLine) });
    }
    outSegments.push({
      kind: "owned",
      id: span.id,
      since: span.since,
      bodyLines: rawLines.slice(span.startLine, span.endLine + 1),
    });
    cursor2 = span.endLine + 1;
  }

  if (fenced.length > 0) {
    outSegments.push({ kind: "migration", release: migrationRelease, notLocated });
    outSegments.push({ kind: "project", bodyLines: [] });
    if (cursor2 < rawLines.length) {
      outSegments.push({ kind: "text", lines: rawLines.slice(cursor2) });
    }
  } else {
    let authorshipLine = -1;
    for (let i = scanStart; i < rawLines.length; i++) {
      if (/^## Authorship/.test(rawLines[i])) {
        authorshipLine = i;
        break;
      }
    }
    if (authorshipLine !== -1) {
      outSegments.push({ kind: "text", lines: rawLines.slice(cursor2, authorshipLine) });
      outSegments.push({ kind: "migration", release: migrationRelease, notLocated });
      outSegments.push({ kind: "project", bodyLines: [] });
      outSegments.push({ kind: "text", lines: rawLines.slice(authorshipLine) });
    } else {
      // rawLines' own trailing "" (the split artifact for a file ending in
      // a newline, not a blank line anyone wrote) must not float in front of
      // the migration record as a manufactured blank line — drop exactly
      // one, leaving any genuinely-authored trailing blank lines in place.
      let tail = rawLines.slice(cursor2);
      if (tail.length && tail[tail.length - 1] === "") tail = tail.slice(0, -1);
      outSegments.push({ kind: "text", lines: tail });
      outSegments.push({ kind: "migration", release: migrationRelease, notLocated });
      outSegments.push({ kind: "project", bodyLines: [] });
    }
  }

  // Always `changed`: a migration inserts at least an empty project block
  // and a migration record even when nothing was located, so the caller's
  // applyFix-shaped `if (fix.changed)` branch always takes the write path.
  return { changed: true, text: renderSegments(outSegments, eol), rows };
}

// T5 / DD-3: seeds the `legacy` table's entries for ONE tag's ENTIRE
// template text of one role, given that role's CURRENT template's sections
// (in file order — `parsePersona(currentTemplateText).sections`, each
// `{ id, since, body }`). A pre-marker tag's template carries no ids of its
// own, so this settles the design gap the task names: which block of the
// tag's text corresponds to which of today's ids.
//
// Mapping rule (declared once, applied to every tag and every role — never
// re-derived per tag):
//   - An item-level id (§5.2's `levelOf` says "item") is claimed by ORDINAL,
//     restricted to the item-kind candidates that appear BEFORE the tag's
//     first heading-kind candidate — i.e. within its own "## Primary
//     Instructions" block, never a numbered list nested inside some other
//     `##` section (Reporting's own "1. Task:", "2. Outcome:" etc. also
//     match ITEM_RE, so an unrestricted ordinal would misassign against
//     them). The k-th item-level id of today's template (in file order)
//     claims the k-th such candidate. leader.md has exactly one item-level
//     id (`primary-instructions`), so it claims the 1st (only) candidate;
//     its extent is still governed by `extentLevelFor`'s override, so the
//     seed and DD-6's migration cut it identically (items 1-4 as one block)
//     — never a second rule for the same override.
//   - A `##`-level id is claimed by HEADING EQUALITY: its current template's
//     first line, hashed by `hashHead` (DD-6's own normalization — list
//     numbers, emoji, punctuation, case stripped), must equal a heading-kind
//     candidate's `hashHead` somewhere in the tag's text (its position
//     relative to the item block is irrelevant; headings never collide with
//     nested numbered lists, which never match HEADING_RE).
//   - Either claim's extent is then cut by the one shared level rule
//     (`extentLevelFor` + `extentEnd`) — never a second implementation of
//     §5.2.
//   - An id with no claimed candidate (an ordinal past the tag's own item
//     count; a heading whose wording predates today's) gets NO entry (DD-3:
//     "a tag whose template lacks a section simply has no entry").
//
// Returns `{ id: { body, head, open } }` — the §5.3 object shape, built by
// `sectionDigestEntry` on the same cut text (never a second implementation
// of head/open). `legacy` and `releases` both carry this shape; a bare
// string entry is still read as `body` alone by every reader (§5.3's
// amendment, T2's tests).
function seedLegacySections(tagText, templateSections) {
  const rawLines = tagText.split(/\r\n|\n|\r/);
  const candidates = buildCandidates(rawLines, 0);
  // The container heading itself ("## Primary Instructions") is a
  // heading-kind candidate that precedes every item — restricting to
  // "before the FIRST heading candidate" would exclude every item outright.
  // The real boundary is the first heading candidate AFTER the first item
  // candidate (the `##` that ends the Primary Instructions block).
  const firstItemIdx = candidates.findIndex((c) => c.kind === "item");
  const firstHeadingAfterItems =
    firstItemIdx === -1 ? -1 : candidates.findIndex((c, idx) => c.kind === "heading" && idx > firstItemIdx);
  const itemCandidateIdxs = candidates
    .map((c, idx) => ({ ...c, idx }))
    .filter((c) => c.kind === "item" && (firstHeadingAfterItems === -1 || c.idx < firstHeadingAfterItems));

  const entries = {};
  let itemOrdinal = 0;

  for (const tSec of templateSections) {
    const level = levelOf(tSec.body);

    if (level === "item") {
      itemOrdinal += 1;
      const claimed = itemCandidateIdxs[itemOrdinal - 1];
      if (!claimed) continue; // this tag's Primary Instructions had fewer items
      const extentLevel = extentLevelFor(tSec.id, "item");
      const end = extentEnd(rawLines, candidates, claimed.idx, extentLevel);
      entries[tSec.id] = sectionDigestEntry(rawLines.slice(claimed.line, end).join("\n"));
    } else {
      const targetHead = hashHead(tSec.body.split("\n")[0]);
      const idx = candidates.findIndex((c) => c.kind === "heading" && hashHead(rawLines[c.line]) === targetHead);
      if (idx === -1) continue; // this tag's heading text does not match today's
      const end = extentEnd(rawLines, candidates, idx, "heading");
      entries[tSec.id] = sectionDigestEntry(rawLines.slice(candidates[idx].line, end).join("\n"));
    }
  }

  return entries;
}

module.exports = {
  parsePersona,
  normalizeBody,
  hashBody,
  hashHead,
  hashOpen,
  sectionStates,
  resultExitCode,
  EXIT_ZERO_STATES,
  renderSegments,
  applyFix,
  migratePersona,
  extentLevelFor,
  levelOf,
  buildCandidates,
  extentEnd,
  seedLegacySections,
  sectionDigestEntry,
  entryBodyHash,
};

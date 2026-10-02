// Pure flag-grammar and tier-derivation functions for `akili routing`
// (design.md §5.3, §5.7, §7). No I/O — required by test/routing.test.js and,
// from T3, by bin/akili.js (runRouting); kept out of bin/akili.js because that
// file runs main() on load, so nothing in it is unit-testable by require.
"use strict";

const path = require("path");
const { SECTION_OPEN_RE, SECTION_CLOSE_RE } = require("./persona.js");

// The five install targets, in the registry table's column order (§5.7
// `--hosts`: "validated against the five keys").
const HOST_KEYS = ["claude", "opencode", "antigravity", "codex", "cursor"];
const ACCEPTED_HOSTS = HOST_KEYS.join(", ");

function splitList(str) {
  return String(str == null ? "" : str)
    .split(",")
    .map((s) => s.trim());
}

// `--hosts <a,b>` -> { hosts } (order kept, duplicates dropped) or { error }.
function parseHosts(str) {
  const items = splitList(str).filter((s) => s !== "");
  if (items.length === 0) return { error: `--hosts is empty — accepted: ${ACCEPTED_HOSTS}` };
  const hosts = [];
  for (const h of items) {
    if (!HOST_KEYS.includes(h)) return { error: `--hosts: unknown host \`${h}\` — accepted: ${ACCEPTED_HOSTS}` };
    if (!hosts.includes(h)) hosts.push(h);
  }
  return { hosts };
}

// One `<host>=<rest>` flag value -> { host, rest } or { error }. The host must
// be one of the five keys and selected in `--hosts`.
function splitHostValue(flag, item, hosts) {
  const value = String(item);
  const eq = value.indexOf("=");
  if (eq <= 0) return { error: `${flag} \`${value}\`: expected <host>=… — accepted hosts: ${ACCEPTED_HOSTS}` };
  const host = value.slice(0, eq).trim();
  if (!HOST_KEYS.includes(host)) return { error: `${flag} ${value}: unknown host \`${host}\` — accepted: ${ACCEPTED_HOSTS}` };
  if (!hosts.includes(host)) return { error: `${flag} ${value}: host \`${host}\` is not selected — --hosts: ${hosts.join(", ")}` };
  return { host, rest: value.slice(eq + 1) };
}

// `--pin-reason <host>=<id>=<text>` (repeatable) -> { reasons: { host: { id: text } } }
// or { error }. The text is everything after the second `=`; last flag per
// host+id wins.
function parsePinReasons(list, hosts) {
  const reasons = {};
  for (const item of list || []) {
    const pair = splitHostValue("--pin-reason", item, hosts);
    if (pair.error) return { error: pair.error };
    const eq = pair.rest.indexOf("=");
    const id = eq === -1 ? "" : pair.rest.slice(0, eq).trim();
    const text = eq === -1 ? "" : pair.rest.slice(eq + 1).trim();
    if (id === "" || text === "") return { error: `--pin-reason \`${item}\`: expected <host>=<id>=<text> with a non-empty id and reason` };
    (reasons[pair.host] = reasons[pair.host] || {})[id] = text;
  }
  return { reasons };
}

// `--cli <host>=<binary>` (repeatable) -> { cli: { host: binary } } or { error }.
function parseCli(list, hosts) {
  const cli = {};
  for (const item of list || []) {
    const pair = splitHostValue("--cli", item, hosts);
    if (pair.error) return { error: pair.error };
    const binary = pair.rest.trim();
    if (binary === "") return { error: `--cli \`${item}\`: empty invocation — expected <host>=<binary>` };
    cli[pair.host] = binary;
  }
  return { cli };
}

// `--t3-cross-host <host>=<other>` (repeatable) -> { crossHost: { host: other } }
// or { error }. `other` is any of the five keys except the host itself.
function parseCrossHost(list, hosts) {
  const crossHost = {};
  for (const item of list || []) {
    const pair = splitHostValue("--t3-cross-host", item, hosts);
    if (pair.error) return { error: pair.error };
    const other = pair.rest.trim();
    if (!HOST_KEYS.includes(other)) return { error: `--t3-cross-host ${item}: unknown host \`${other}\` — accepted: ${ACCEPTED_HOSTS}` };
    if (other === pair.host) return { error: `--t3-cross-host \`${item}\`: the Reviewer must be dispatched to another host — accepted: ${HOST_KEYS.filter((h) => h !== pair.host).join(", ")}` };
    crossHost[pair.host] = other;
  }
  return { crossHost };
}

const TIER_SUFFIX_RE = /^T\d+(\+T\d+)*$/;
// A user id is "dated" (not a floating alias) when it carries a date stamp
// token: `20250514`, `2025-05-14`. Packaged ids use the registry's `dated`.
const DATE_STAMP_RE = /(^|[^0-9])(\d{8}|\d{4}-\d{2}-\d{2})($|[^0-9])/;

// Does this roster entry need a recorded reason (alias-first "record why",
// §5.7 `--pin-reason`)? Packaged: the registry's `dated` flag. User id: a
// date stamp in the id.
function needsPinReason(id, packaged) {
  return packaged ? packaged.dated === true : DATE_STAMP_RE.test(id);
}

// `--models <host>=<id>[@T<n>[+T<m>]],…` (repeatable) -> { roster: { host: [entry] } }
// or { error } — one line naming the offending value and the accepted set.
// entry = { id, source: "packaged" | "user", tiers?, reason? } (§5.2): an id
// with an `@T…` placement is a user placement (`tiers`, DD-4); an id without
// one must be in the packaged `models[]`. Last flag for a host wins.
// opts.reasons: parsePinReasons(...).reasons; opts.interactive: true when the
// wizard will ask for missing reasons itself (default false — a dated id then
// requires its `--pin-reason`).
function parseModels(list, hosts, registry, opts = {}) {
  const reasons = opts.reasons || {};
  const interactive = opts.interactive === true;
  const lastByHost = new Map();
  for (const item of list || []) {
    const pair = splitHostValue("--models", item, hosts);
    if (pair.error) return { error: pair.error };
    lastByHost.set(pair.host, { item: String(item), body: pair.rest });
  }
  const roster = {};
  for (const [host, { item, body }] of lastByHost) {
    const packagedModels = registry.hosts[host].models.filter((m) => m.id !== null);
    const packagedIds = packagedModels.map((m) => m.id);
    const entries = [];
    const parts = splitList(body);
    if (parts.length === 1 && parts[0] === "") return { error: `--models \`${item}\`: empty model list — expected <host>=<id>[@T<n>[+T<m>]],…` };
    for (const part of parts) {
      if (part === "") return { error: `--models \`${item}\`: empty id in the list — expected <host>=<id>[@T<n>[+T<m>]],…` };
      const at = part.lastIndexOf("@");
      let id = part;
      let tiers;
      if (at !== -1 && TIER_SUFFIX_RE.test(part.slice(at + 1))) {
        id = part.slice(0, at);
        tiers = [];
        for (const t of part.slice(at + 1).split("+")) {
          const n = Number(t.slice(1));
          if (!(n >= 1 && n <= 6)) return { error: `--models ${item}: tier \`${t}\` in \`${part}\` — accepted: T1–T6` };
          if (!tiers.includes(t)) tiers.push(t);
        }
      }
      if (id === "") return { error: `--models \`${item}\`: empty id before \`${part}\`` };
      if (id.includes("@")) return { error: `--models ${item}: id \`${id}\` contains \`@\`, which is reserved for the placement suffix @T<n>[+T<m>] (T1–T6)` };
      const packaged = packagedModels.find((m) => m.id === id);
      if (!tiers && !packaged) {
        return { error: `--models ${item}: id \`${id}\` is not in the packaged ${registry.hosts[host].label} roster — add a placement @T<n>[+T<m>] (T1–T6); packaged: ${packagedIds.join(", ") || "none"}` };
      }
      if (tiers && tiers.includes("T2") && tiers.includes("T3")) {
        return { error: `--models ${item}: id \`${id}\` is placed on both T2 and T3 — T3 must differ from T2 (author ≠ auditor)` };
      }
      const entry = tiers ? { id, source: "user", tiers } : { id, source: "packaged" };
      const reason = reasons[host] && reasons[host][id];
      if (reason) entry.reason = reason;
      else if (!interactive && needsPinReason(id, packaged)) {
        return { error: `--models ${item}: dated id \`${id}\` needs a recorded reason — add --pin-reason ${host}=${id}=<text>` };
      }
      const seen = entries.findIndex((e) => e.id === id);
      if (seen === -1) entries.push(entry);
      else entries[seen] = entry;
    }
    roster[host] = entries;
  }
  return { roster };
}

const TIERS = ["T1", "T2", "T3", "T4", "T5", "T6"];

const PLACEHOLDER_RE = /^<CONFIRM[^>]*>$/;
const NOTE_UNSATISFIABLE = "author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host";

function isPlaceholder(x) {
  return PLACEHOLDER_RE.test(x);
}

// The fallback cell: the first candidate other than the chosen primary.
function fallbackOf(cands, primary) {
  const next = cands.find((x) => x !== primary);
  return next === undefined ? "—" : next;
}

// §5.3 preference-list intersection for one host. roster = the host's entries
// ({ id, source, tiers? }, roster order); hostRegistry = registry.hosts[host].
// opts: crossHost (the `--t3-cross-host` other host, or undefined),
// selectedHosts (hosts[]), hostKey (this host), crossHostT6Owner
// (registry.crossHost.T6). -> { mapping: { T1…T6: { primary, fallback, note,
// crossHost? } }, authorAuditor, notes[] }. Pure: list order is the only order.
function deriveTiers(roster, hostRegistry, opts = {}) {
  const ids = roster.map((e) => e.id);
  const pref = hostRegistry.tierPreference;
  const cands = {};
  for (const t of TIERS) {
    // Step 1: user placements at the head, in roster order, then the packaged list.
    const list = [];
    for (const x of roster.filter((e) => e.source === "user" && e.tiers.includes(t)).map((e) => e.id).concat(pref[t])) {
      if (!list.includes(x)) list.push(x);
    }
    // Step 2: keep roster ids and placeholders.
    cands[t] = list.filter((x) => ids.includes(x) || isPlaceholder(x));
  }
  const mapping = {};
  const tierNotes = {};
  for (const t of TIERS) tierNotes[t] = [];
  // Picks cands[t][0]; an empty list returns false and leaves the tier unset.
  const pick = (t) => {
    if (cands[t].length === 0) return false;
    mapping[t] = { primary: cands[t][0], fallback: fallbackOf(cands[t], cands[t][0]) };
    return true;
  };
  // Step 3: T2 first (empty -> `<CONFIRM SLUG>`, like T1/T5).
  if (!pick("T2")) mapping.T2 = { primary: "<CONFIRM SLUG>", fallback: "—" };
  const t2 = mapping.T2.primary;
  // Step 4: T3 — the first id candidate ≠ T2's pick. Ids only: a placeholder
  // neither satisfies nor is excluded by the rule, and `ok` needs two ids.
  // A recorded `--t3-cross-host` choice dispatches the Reviewer elsewhere.
  let authorAuditor;
  const t3 = isPlaceholder(t2) ? undefined : cands.T3.find((x) => !isPlaceholder(x) && x !== t2);
  if (opts.crossHost) {
    mapping.T3 = { primary: `→ ${opts.crossHost}`, fallback: "—", crossHost: opts.crossHost };
    authorAuditor = `cross-host: ${opts.crossHost}`;
  } else if (t3 !== undefined) {
    mapping.T3 = { primary: t3, fallback: fallbackOf(cands.T3, t3) };
    authorAuditor = "ok";
  } else {
    // Unsatisfiable: the registry cell only — no Reviewer wrapper (DD-5).
    const primary = cands.T3.length > 0 ? cands.T3[0] : t2;
    mapping.T3 = { primary, fallback: fallbackOf(cands.T3, primary) };
    authorAuditor = "unsatisfiable";
    tierNotes.T3.push(NOTE_UNSATISFIABLE);
  }
  // Step 5: the remaining tiers, with their empty-list rules.
  for (const t of ["T1", "T5"]) if (!pick(t)) mapping[t] = { primary: "<CONFIRM SLUG>", fallback: "—" };
  if (!pick("T4")) {
    mapping.T4 = { primary: t2, fallback: "—" };
    tierNotes.T4.push("no long-context model selected");
  }
  if (!pick("T6")) {
    mapping.T6 = { primary: "<CONFIRM>", fallback: "—" };
    const owner = opts.crossHostT6Owner;
    if (owner === opts.hostKey) tierNotes.T6.push("no vision model selected");
    else if ((opts.selectedHosts || []).includes(owner)) tierNotes.T6.push(`→ cross-host dispatch: ${owner} (selected)`);
    else tierNotes.T6.push(`→ cross-host dispatch: ${owner}`);
  }
  // Step 6: notes from the final mapping, fixed per-tier notes appended.
  const fixed = hostRegistry.notes || {};
  const ordered = {};
  for (const t of TIERS) {
    if (fixed[t]) tierNotes[t].push(fixed[t]);
    ordered[t] = { ...mapping[t], note: tierNotes[t].join("; ") };
  }
  const notes = ids.length === 1 ? ["single-model roster"] : [];
  return { mapping: ordered, authorAuditor, notes };
}

// Deep copy with object keys sorted; array order is data (roster order) and kept.
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value === null || typeof value !== "object") return value;
  const out = {};
  for (const k of Object.keys(value).sort()) out[k] = sortKeys(value[k]);
  return out;
}

// The answers file's canonical form (§5.2, DD-8): stable JSON, object keys
// sorted, top-level `updatedAt` excluded — two runs compare equal exactly
// when every other field is unchanged.
function canonicalAnswers(answers) {
  const { updatedAt, ...rest } = answers; // eslint-disable-line no-unused-vars
  return JSON.stringify(sortKeys(rest));
}

// ---- T3: the `## Model Routing` fence in AGENTS.md (design §5.6, DD-2, DD-11) ----

const SECTION_ID = "model-routing";
const HEADING_RE = /^## Model Routing\s*$/;
const H2_RE = /^## /;
const CODE_FENCE_RE = /^\s*(```|~~~)/;
const TOKEN_REFUSED_EDIT = "refused (hand-edited fence; --force to regenerate)";

// Majority line ending, exactly as bin/persona.js:92-95 (detectEol) counts it
// (P-22). Not imported: persona.js exports only the two fence regexes (DD-2).
function detectEol(text) {
  const crlfCount = (text.match(/\r\n/g) || []).length;
  const lfOnlyCount = (text.match(/\n/g) || []).length - crlfCount;
  return crlfCount > lfOnlyCount ? "\r\n" : "\n";
}

// Lines split as persona.js:177 does (/\r\n|\n/), each with its character
// offsets in the original text, so a splice keeps every outside byte.
function splitLines(text) {
  const out = [];
  const re = /\r\n|\n/g;
  let start = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ text: text.slice(start, m.index), start, end: m.index });
    start = m.index + m[0].length;
  }
  out.push({ text: text.slice(start), start, end: text.length });
  return out;
}

// Body as fence content: LF-normalized, no trailing line breaks.
function normalizeSectionBody(body) {
  return String(body).replace(/\r\n/g, "\n").replace(/\n+$/, "");
}

function fencedBlock(body, sinceTag, eol) {
  const lines = [`<!-- akili:section id=${SECTION_ID} since=${sinceTag} -->`]
    .concat(normalizeSectionBody(body).split("\n"), ["<!-- /akili:section -->"]);
  return lines.join(eol);
}

// Minimal unified diff (one hunk, full context) between two LF texts.
function unifiedDiff(oldText, newText, label) {
  const a = oldText === "" ? [] : oldText.split("\n");
  const b = newText === "" ? [] : newText.split("\n");
  const lcs = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out = [`--- ${label} (current)`, `+++ ${label} (akili routing)`, `@@ -1,${a.length} +1,${b.length} @@`];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      out.push(` ${a[i]}`);
      i++;
      j++;
    } else if (j < b.length && (i === a.length || lcs[i][j + 1] >= lcs[i + 1][j])) {
      out.push(`+${b[j]}`);
      j++;
    } else {
      out.push(`-${a[i]}`);
      i++;
    }
  }
  return out.join("\n") + "\n";
}

// Scan AGENTS.md: model-routing fences, malformed markers, unfenced
// `## Model Routing` headings. Lines inside ``` / ~~~ code fences are text,
// not markers or headings (§5.6 (b)).
function scanAgents(lines) {
  const blocks = [];
  const headings = [];
  let malformed = false;
  let inCode = false;
  let open = null; // { id, index }
  lines.forEach((line, index) => {
    const t = line.text;
    if (CODE_FENCE_RE.test(t)) {
      inCode = !inCode;
      return;
    }
    if (inCode) return;
    const mOpen = t.match(SECTION_OPEN_RE);
    if (mOpen) {
      if (open && (open.id === SECTION_ID || mOpen[1] === SECTION_ID)) malformed = true;
      open = { id: mOpen[1], index };
      return;
    }
    if (SECTION_CLOSE_RE.test(t)) {
      if (!open) malformed = true;
      else if (open.id === SECTION_ID) blocks.push({ open: open.index, close: index });
      open = null;
      return;
    }
    if (!open && HEADING_RE.test(t)) headings.push(index);
  });
  if (open && open.id === SECTION_ID) malformed = true;
  if (blocks.length > 1) malformed = true;
  return { blocks, headings, malformed };
}

// The extent of an unfenced section: its heading to the line before the next
// `## ` heading outside a code fence (or EOF), trailing blank lines excluded.
function unfencedExtent(lines, from) {
  let inCode = false;
  let last = lines.length - 1;
  for (let k = from + 1; k < lines.length; k++) {
    const t = lines[k].text;
    if (CODE_FENCE_RE.test(t)) inCode = !inCode;
    else if (!inCode && H2_RE.test(t)) {
      last = k - 1;
      break;
    }
  }
  while (last > from && lines[last].text.trim() === "") last--;
  return last;
}

// FR-4 / §5.6: write `body` into AGENTS.md's model-routing fence.
// text: AGENTS.md content, or null when the file does not exist (state d).
// expectedBody: render(previous answers), or null without an answers file.
// opts: { force, adopt } — `adopt` is the (b) answer (the TTY prompt or
// `--adopt`), decided by the caller. -> { text, state, token, diff?, notes[] }.
function replaceFencedSection(text, body, sinceTag, expectedBody, opts = {}) {
  const newBody = normalizeSectionBody(body);
  if (text === null || text === undefined) {
    return { text: "# Agent Guidance\n\n" + fencedBlock(newBody, sinceTag, "\n") + "\n", state: "d", token: "created", notes: [] };
  }
  const eol = detectEol(text);
  const lines = splitLines(text);
  const scan = scanAgents(lines);
  if (scan.malformed) return { text, state: "e", token: "refused (malformed fence)", notes: [] };
  const splice = (first, last, block) => text.slice(0, lines[first].start) + block + text.slice(lines[last].end);
  if (scan.blocks.length === 1) {
    const { open, close } = scan.blocks[0];
    const oldBody = lines.slice(open + 1, close).map((l) => l.text).join("\n");
    const notes = scan.headings.map((k) => `+ stray "## Model Routing" heading at line ${k + 1} — remove it`);
    const state = notes.length > 0 ? "f" : "a";
    if (oldBody === newBody) return { text, state, token: "unchanged", notes };
    const replaced = splice(open, close, fencedBlock(newBody, sinceTag, eol));
    if (expectedBody !== null && expectedBody !== undefined && oldBody === normalizeSectionBody(expectedBody)) {
      return { text: replaced, state, token: "replaced", notes };
    }
    const diff = unifiedDiff(oldBody, newBody, "AGENTS.md");
    if (opts.force) return { text: replaced, state, token: "overwritten", diff, notes };
    return { text, state: state === "f" ? "f" : "a-prime", token: TOKEN_REFUSED_EDIT, diff, notes };
  }
  if (scan.headings.length > 0) {
    const first = scan.headings[0];
    const last = unfencedExtent(lines, first);
    const oldText = lines.slice(first, last + 1).map((l) => l.text).join("\n");
    const diff = unifiedDiff(oldText, fencedBlock(newBody, sinceTag, "\n"), "AGENTS.md");
    if (opts.adopt) return { text: splice(first, last, fencedBlock(newBody, sinceTag, eol)), state: "b", token: "adopted", diff, notes: [] };
    return { text, state: "b", token: "skipped (unfenced; --adopt to replace)", diff, notes: [] };
  }
  const sep = text === "" || text.endsWith("\n") ? "" : eol;
  return { text: text + sep + eol + fencedBlock(newBody, sinceTag, eol) + eol, state: "c", token: "appended", notes: [] };
}

// ---- T3: registry table and section render (design §5.4, FR-4) ----

const TIER_LABELS = {
  T1: "**T1 Architect**",
  T2: "**T2 Coder**",
  T3: "**T3 Auditor** *(≠ T2)*",
  T4: "**T4 Context-Ingest**",
  T5: "**T5 Fast-Cheap**",
  T6: "**T6 Multimodal**",
};

// An id is a concrete model: not a placeholder, not a cross-host arrow, not "—".
function isId(x) {
  return typeof x === "string" && x !== "" && x !== "—" && !isPlaceholder(x) && !x.startsWith("→");
}

// The packaged default column: tierPreference head / second, fixed notes —
// the doc cell by construction (§5.1). Used for a host with no mapping.
function packagedColumn(hostRegistry) {
  const col = {};
  for (const t of TIERS) {
    const pref = hostRegistry.tierPreference[t];
    col[t] = { primary: pref[0], fallback: pref[1] === undefined ? "—" : pref[1], note: (hostRegistry.notes || {})[t] || "" };
  }
  return col;
}

// Every host's column: its mapping when the answers hold one (selected, or
// filled on an earlier run — C3), else the packaged default.
function tableColumns(mappingByHost, registry) {
  const cols = {};
  for (const h of HOST_KEYS) cols[h] = (mappingByHost || {})[h] || packagedColumn(registry.hosts[h]);
  return cols;
}

// Dated ids carry a recorded reason (roster[].reason, C9): numbered in
// table order (host, tier, primary then fallback).
function collectPins(cols, roster) {
  const pins = [];
  for (const h of HOST_KEYS) {
    const entries = (roster || {})[h] || [];
    for (const t of TIERS) {
      for (const id of [cols[h][t].primary, cols[h][t].fallback]) {
        const e = entries.find((x) => x.id === id);
        if (e && e.reason && !pins.some((p) => p.host === h && p.id === id)) pins.push({ host: h, id, reason: e.reason, n: pins.length + 1 });
      }
    }
  }
  return pins;
}

function cellValue(x, host, pins) {
  if (x.startsWith("→")) return x;
  const pin = pins.find((p) => p.host === host && p.id === x);
  return `\`${x}\`` + (pin ? ` [pin ${pin.n}]` : "");
}

function tableParts(mappingByHost, registry, roster) {
  const cols = tableColumns(mappingByHost, registry);
  const pins = collectPins(cols, roster);
  const lines = [
    "| Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const t of TIERS) {
    const hostCells = HOST_KEYS.map((h) => {
      const c = cols[h][t];
      return cellValue(c.primary, h, pins) + (c.note ? ` ${c.note}` : "");
    });
    const fallbacks = HOST_KEYS.filter((h) => cols[h][t].fallback !== "—")
      .map((h) => `${cellValue(cols[h][t].fallback, h, pins)} (${registry.hosts[h].label})`);
    lines.push(`| ${TIER_LABELS[t]} | ${hostCells.join(" | ")} | ${fallbacks.length ? fallbacks.join(" · ") : "—"} |`);
  }
  return { table: lines.join("\n"), pins, cols };
}

// §5.4 item 4: always 7 columns. roster supplies the dated-id pin markers.
function renderRegistryTable(mappingByHost, registry, roster) {
  return tableParts(mappingByHost, registry, roster).table;
}

// Placeholder cells per host column (primary, fallback or note) — `--json`.
function placeholdersByColumn(cols) {
  const out = {};
  for (const h of HOST_KEYS) {
    out[h] = TIERS.filter((t) => [cols[h][t].primary, cols[h][t].fallback, cols[h][t].note].some((x) => String(x).includes("<CONFIRM"))).length;
  }
  return out;
}

const label = (registry, h) => registry.hosts[h].label;

// The eight template placeholders, from an answers object (§5.2). Defensive
// over an older answers file: a missing field renders as absent.
function sectionContext(answers, registry) {
  const hosts = answers.hosts || [];
  const mapping = answers.mapping || {};
  const { table, pins, cols } = tableParts(mapping, registry, answers.roster || {});
  const cli = answers.cli || {};
  const aa = answers.authorAuditor || {};
  const pinReasons = pins.length === 0
    ? "No dated model ID is pinned."
    : ["**Pinned model IDs** (the reason is recorded next to the pin):", ""]
        .concat(pins.map((p) => `- [pin ${p.n}] \`${p.id}\` (${label(registry, p.host)}): ${p.reason}`)).join("\n");
  const aaLines = HOST_KEYS.map((h) => {
    const t2 = cols[h].T2.primary;
    const t3 = cols[h].T3.primary;
    const v = aa[h];
    let text;
    if (v === "unsatisfiable") text = `${NOTE_UNSATISFIABLE}; no wrappers are written for this host.`;
    else if (typeof v === "string" && v.startsWith("cross-host: ")) text = `Reviewer (T3) dispatched cross-host to ${label(registry, v.slice(12))}.`;
    else if (!isId(t2) || !isId(t3)) text = "placeholders — confirm the T2 and T3 ids before binding wrappers.";
    else text = `${v === "ok" ? "" : "packaged defaults — "}Implementer (T2) \`${t2}\` ≠ Reviewer (T3) \`${t3}\`.`;
    return `- **${label(registry, h)}:** ${text}`;
  });
  const sel = (h) => (hosts.includes(h) ? "" : " (not selected in this run)");
  const owner = registry.crossHost.T6;
  const cross = [`T6 Multimodal → ${label(registry, owner)} (packaged default)${sel(owner)}.`];
  for (const h of HOST_KEYS) {
    const other = cols[h].T3.crossHost;
    if (other) cross.push(`${label(registry, h)} T3 Reviewer → ${label(registry, other)}${sel(other)}.`);
  }
  return {
    registryTable: table,
    updated: String(answers.updatedAt || "").slice(0, 7),
    pinReasons,
    antigravityDialMap: "| Dial | `low` | `medium` | `high` / `xhigh` / `max` |\n|---|---|---|---|\n| Antigravity effort ID | `-low` | `-medium` | `-high` |",
    authorAuditorNotes: ["**Author ≠ auditor per host:**", ""].concat(aaLines).join("\n"),
    // C8: only a confirmed invocation for a selected host; never the suggestion.
    cliInvocationRow: [
      `| ${HOST_KEYS.map((h) => label(registry, h)).join(" | ")} |`,
      `|${HOST_KEYS.map(() => "---|").join("")}`,
      `| ${HOST_KEYS.map((h) => (hosts.includes(h) && cli[h] ? `\`${cli[h]}\`` : "`<CONFIRM>`")).join(" | ")} |`,
    ].join("\n"),
    crossHostLine: cross.join(" "),
    regenerateHint: "*Generated by `akili routing` from `.agents/model-routing.json`; a hand edit inside this fence is refused on the next run unless `--force`.*",
  };
}

// `{{name}}` -> ctx[name]; a placeholder without a value throws (template drift).
function renderSection(template, ctx) {
  return String(template).replace(/\{\{(\w+)\}\}/g, (m, key) => {
    if (typeof ctx[key] !== "string") throw new Error(`renderSection: no value for {{${key}}}`);
    return ctx[key];
  });
}

function renderBody(answers, registry, template) {
  return renderSection(template, sectionContext(answers, registry));
}

// ---- T3: Step 8E wrappers (design §5.5, FR-5, DD-7) ----

const ROLE_TIER = { leader: "T1", implementer: "T2", reviewer: "T3", tester: "T2" }; // Tester = T2 primary (W3)
const ROLE_LABEL = { leader: "Leader", implementer: "Implementer", reviewer: "Reviewer", tester: "Tester" };
const ROLE_EFFORT = { leader: "high", implementer: "medium", reviewer: "high", tester: "medium" };
const ROLE_DESC = {
  leader: "AKILI Leader — orchestrates the spec run, selects skills, adjudicates FAILs, and writes no code.",
  implementer: "AKILI Implementer — executes one spec task with strict scope and verification.",
  reviewer: "AKILI Reviewer — independent audit of the Implementer's diff against the spec.",
  tester: "AKILI Tester — authors and runs one test suite and reports PASS, FAIL, or PRODUCT_BUG.",
};
const WRAPPER_ROLES = ["leader", "implementer", "reviewer", "tester"];

// Step 8E rule 3: one sentence referencing the persona, never its content.
function personaSentence(role) {
  return `Read \`.agents/${role}.md\` in the project root and adopt it fully as your persona and\noperating contract before doing anything else.\n`;
}

function yamlScalar(v) {
  return /^[A-Za-z0-9][A-Za-z0-9._/[\]=-]*$/.test(v) ? v : JSON.stringify(v);
}

function wrapperPath(host, role, hostRegistry, decisions) {
  if (host === "opencode" && decisions.agentDir) return path.posix.join(decisions.agentDir, `akili-${role}.md`);
  return hostRegistry.wrapper.location.replace("<role>", role);
}

// One wrapper, or why it is not written: { relPath, content, model } or
// { relPath, skipKind: "cross-host", other } / { relPath, skipText }.
// DD-7 / S1: nothing unconfirmed reaches a frontmatter value — a placeholder
// tier or an Antigravity id without `wrapperModel` skips the role (reported).
function planWrapper(host, role, tierMap, decisions, registry) {
  const hr = registry.hosts[host];
  const dec = decisions || {};
  const relPath = wrapperPath(host, role, hr, dec);
  const tier = ROLE_TIER[role];
  const cell = (tierMap || {})[tier];
  if (!cell) return { relPath, skipText: `no wrapper — no ${tier} mapping` };
  if (cell.crossHost) return { relPath, skipKind: "cross-host", other: cell.crossHost };
  if (!isId(cell.primary)) return { relPath, skipText: `no wrapper — ${tier} resolves to \`${cell.primary}\`; confirm an id` };
  const entry = hr.models.find((m) => m.id === cell.primary);
  const reviewer = role === "reviewer";
  let model = cell.primary;
  const fields = [];
  switch (hr.wrapper.shape) {
    case "agy-yaml": {
      // Antigravity — akili-constitution.md:739-784 (no vendor URL, P-26):
      // `model` is `flash` | `pro` from the roster entry, never the id (C4).
      if (!entry || !entry.wrapperModel) return { relPath, skipText: `no wrapper — \`${cell.primary}\` has no Antigravity wrapper model (flash | pro)` };
      model = entry.wrapperModel;
      fields.push(`model: ${model}`, "subagent: true", `mainAgent: ${role === "leader"}`);
      const tools = dec.antigravityTools || [];
      if (reviewer && tools.length > 0) fields.push("tools:", ...tools.map((t) => `  - ${t}`));
      break;
    }
    case "toml": {
      // Codex — <https://learn.chatgpt.com/docs/agent-configuration/subagents>
      // Last verified: 2026-09-16 (akili-constitution.md:785-837, pin :810).
      const lines = [
        `name = ${JSON.stringify(`akili-${role}`)}`,
        `description = ${JSON.stringify(ROLE_DESC[role])}`,
        'developer_instructions = """',
        personaSentence(role) + '"""',
        `model = ${JSON.stringify(model)}`,
        `model_reasoning_effort = ${JSON.stringify(ROLE_EFFORT[role])}`,
      ];
      if (reviewer) lines.push('sandbox_mode = "read-only"');
      return { relPath, model, content: lines.join("\n") + "\n" };
    }
    default: {
      // Claude Code — akili-constitution.md:677-721 (no vendor URL, P-26);
      // OpenCode — :722-738 (agent dir only in v1, DD-13; no restriction, W9);
      // Cursor — <https://cursor.com/docs/context/subagents> Last verified:
      // 2026-10-01 (:838-890, pin :888): bracket only for a confirmed rung (S1).
      if (hr.wrapper.effortField === "bracket" && entry && Array.isArray(entry.effortRungs) && entry.effortRungs.includes(ROLE_EFFORT[role])) {
        model = `${cell.primary}[effort=${ROLE_EFFORT[role]}]`;
      }
      fields.push(`model: ${yamlScalar(model)}`);
      if (reviewer && hr.wrapper.restriction === "tools") fields.push("tools: Read, Grep, Glob");
      if (reviewer && hr.wrapper.restriction === "readonly") fields.push("readonly: true");
    }
  }
  const content = ["---", `name: akili-${role}`, `description: ${ROLE_DESC[role]}`, ...fields, "---", personaSentence(role)].join("\n");
  return { relPath, model, content };
}

// FR-5 / §7: { relPath, content } or null for a role that is not written.
function renderWrapper(host, role, mapping, decisions, registry) {
  const w = planWrapper(host, role, mapping, decisions, registry);
  return w.content === undefined ? null : { relPath: w.relPath, content: w.content };
}

// The `model` value a wrapper file declares (YAML `model:` or TOML `model =`).
function declaredModel(content) {
  const m = String(content).match(/^model\s*[:=]\s*(.*?)\s*$/m);
  return m ? m[1].replace(/^"(.*)"$/, "$1") : "(none)";
}

// ---- T3: buildPlan (design §7, DD-1, DD-8, DD-11) ----

const ANSWERS_PATH = ".agents/model-routing.json";
const DD9_HINT = "commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/";
const WRITING_TOKENS = ["created", "replaced", "appended", "adopted", "overwritten"];

// Selected host: the answers decide. Unselected host: keep what the answers
// (or the previous file) hold — `keep-previous-else-packaged` (C3).
function perHost(field, answers, prev, hosts) {
  const out = {};
  for (const h of HOST_KEYS) {
    const own = (answers[field] || {})[h];
    const v = hosts.includes(h) ? own : own !== undefined ? own : ((prev || {})[field] || {})[h];
    if (v !== undefined) out[h] = v;
  }
  return out;
}

// answers: the run's answers (§5.2 fields; `crossHost?` = `--t3-cross-host`).
// snapshot: { agentsMd, claudeMd, existingFiles: Map<relPath, content>,
// previousAnswers, sectionTemplate } — the packaged section template rides in
// the snapshot because this module reads no file (NFR-5). now: a Date.
// opts: { force, adopt }. Pure: returns the plan; applyPlan writes it.
function buildPlan(answers, registry, pkgVersion, snapshot, now, opts = {}) {
  const prev = snapshot.previousAnswers || null;
  const hosts = (answers.hosts || []).slice();
  const roster = perHost("roster", answers, prev, hosts);
  const cli = perHost("cli", answers, prev, hosts);
  const mapping = perHost("mapping", answers, prev, hosts);
  const authorAuditor = perHost("authorAuditor", answers, prev, hosts);
  const decisions = perHost("decisions", answers, prev, hosts);
  for (const h of hosts) {
    const recorded = (answers.authorAuditor || {})[h];
    const crossHost = (answers.crossHost || {})[h] || (typeof recorded === "string" && recorded.startsWith("cross-host: ") ? recorded.slice(12) : undefined);
    const d = deriveTiers(roster[h] || [], registry.hosts[h], { crossHost, selectedHosts: hosts, hostKey: h, crossHostT6Owner: registry.crossHost.T6 });
    mapping[h] = d.mapping;
    authorAuditor[h] = d.authorAuditor;
    const given = (answers.decisions || {})[h] || {};
    const restriction = registry.hosts[h].wrapper.restriction;
    const dec = {};
    if (h === "opencode") dec.agentDir = given.agentDir || path.posix.dirname(registry.hosts.opencode.wrapper.location);
    if (restriction === "none") dec.restriction = "omitted: restriction shape unconfirmed";
    else if (restriction === "tools-confirm") {
      const tools = given.antigravityTools || [];
      if (tools.length > 0) dec.antigravityTools = tools.slice();
      dec.restriction = tools.length > 0 ? "applied" : "omitted: names unconfirmed";
    } else dec.restriction = "applied";
    if (registry.hosts[h].wrapper.effortField === "bracket") {
      const bracket = WRAPPER_ROLES.some((r) => /\[effort=/.test(planWrapper(h, r, mapping[h], dec, registry).content || ""));
      dec.effortBracket = bracket ? "applied" : "omitted: rung unconfirmed";
    }
    decisions[h] = dec;
  }
  const core = {
    version: 1,
    generatedBy: pkgVersion,
    hosts,
    roster,
    cli,
    mapping,
    wrappers: answers.wrappers === "no" ? "no" : "yes",
    decisions,
    authorAuditor,
    unselectedHosts: "keep-previous-else-packaged",
  };
  // DD-8: updatedAt moves only when another field's canonical form moved.
  const changed = !prev || canonicalAnswers(core) !== canonicalAnswers(prev);
  const finalAnswers = { ...core, updatedAt: changed ? now.toISOString().slice(0, 10) : prev.updatedAt };

  const writes = [];
  const reports = [];
  const hints = [];

  // AGENTS.md — the six states (§5.6).
  const template = snapshot.sectionTemplate;
  const body = renderBody(finalAnswers, registry, template);
  const expectedBody = prev ? renderBody(prev, registry, template) : null;
  const sinceTag = `v${pkgVersion}`;
  const agentsMd = snapshot.agentsMd === undefined ? null : snapshot.agentsMd;
  const fence = replaceFencedSection(agentsMd, body, sinceTag, expectedBody, { force: opts.force === true, adopt: opts.adopt === true });
  const agentsWrite = { relPath: "AGENTS.md", token: fence.token, content: WRITING_TOKENS.includes(fence.token) ? fence.text : null };
  if (fence.notes.length > 0) agentsWrite.note = fence.notes.join("; ");
  if (fence.diff) agentsWrite.diff = fence.diff;
  writes.push(agentsWrite);
  if (fence.token === "created") hints.push("run /akili-constitution to complete AGENTS.md");
  const claudeMd = snapshot.claudeMd == null ? "" : String(snapshot.claudeMd).replace(/\r\n/g, "\n");
  if (/^## Model Routing\s*$/m.test(claudeMd)) reports.push("CLAUDE.md carries a Model Routing section — move it to AGENTS.md");

  // Wrappers (§5.5) — selected hosts only.
  const files = snapshot.existingFiles instanceof Map ? snapshot.existingFiles : new Map(Object.entries(snapshot.existingFiles || {}));
  for (const h of hosts) {
    const hl = label(registry, h);
    const planned = {};
    for (const role of WRAPPER_ROLES) {
      const w = planWrapper(h, role, mapping[h], decisions[h], registry);
      if (finalAnswers.wrappers === "no") {
        writes.push({ relPath: w.relPath, token: "skipped (wrappers=no)", content: null });
        continue;
      }
      if (authorAuditor[h] === "unsatisfiable") {
        writes.push({ relPath: w.relPath, token: "skipped (author ≠ auditor unsatisfiable)", content: null });
        continue;
      }
      if (w.skipKind === "cross-host") {
        const ol = label(registry, w.other);
        reports.push(`${hl} Reviewer: dispatched cross-host to ${ol} — no wrapper written${hosts.includes(w.other) ? "" : ` (${ol} is not selected in this run)`}`);
        continue;
      }
      if (w.content === undefined) {
        reports.push(`${hl} ${ROLE_LABEL[role]}: ${w.skipText}`);
        continue;
      }
      planned[role] = w;
      const existing = files.get(w.relPath);
      if (existing === undefined) writes.push({ relPath: w.relPath, token: "created", content: w.content });
      else if (existing === w.content) writes.push({ relPath: w.relPath, token: "unchanged", content: null });
      else if (opts.force === true) writes.push({ relPath: w.relPath, token: "overwritten", content: w.content });
      else {
        const entry = { relPath: w.relPath, token: "skipped (exists; --force to replace)", content: null };
        const was = declaredModel(existing);
        const now2 = declaredModel(w.content);
        if (was !== now2) entry.note = `— model drift: file says ${was}, mapping says ${now2}`;
        writes.push(entry);
      }
    }
    // DD-7: every omitted restriction / effort bracket is a summary line.
    if (planned.reviewer && registry.hosts[h].wrapper.restriction === "none") {
      reports.push(`${hl} Reviewer: read-only by instruction (restriction shape unconfirmed — Step 8E rule 2)`);
    }
    if (planned.reviewer && decisions[h].restriction === "omitted: names unconfirmed") {
      reports.push(`${hl} Reviewer: read-only by instruction (tools omitted — names unconfirmed)`);
    }
    if (h === "antigravity" && Object.keys(planned).length > 0) {
      reports.push("Antigravity: in-session `/agents` lists only `akili-leader` — that is the success condition");
    }
    if (Object.keys(planned).length > 0 && decisions[h].effortBracket === "omitted: rung unconfirmed") {
      reports.push(`${hl}: effort bracket omitted — rung unconfirmed`);
    }
    if (planned.tester && planned.implementer) {
      reports.push(`${hl} Tester: same model as the Implementer (\`${mapping[h].T2.primary}\`, T2 primary) — Step 8E default; Rule 1 allows it`);
    }
  }

  // The answers file — never run results (FR-6).
  const answersContent = JSON.stringify(sortKeys(finalAnswers), null, 2) + "\n";
  const prevContent = prev ? JSON.stringify(sortKeys(prev), null, 2) + "\n" : null;
  if (prevContent === null) writes.push({ relPath: ANSWERS_PATH, token: "created", content: answersContent });
  else if (prevContent === answersContent) writes.push({ relPath: ANSWERS_PATH, token: "unchanged", content: null });
  else writes.push({ relPath: ANSWERS_PATH, token: "replaced", content: answersContent });

  // Stale ids (§5.4 mode policy): packaged-sourced ids the roster no longer ships.
  const stale = [];
  for (const h of HOST_KEYS) {
    if (!mapping[h]) continue;
    const packaged = registry.hosts[h].models.map((m) => m.id);
    const userIds = (roster[h] || []).filter((e) => e.source === "user").map((e) => e.id);
    for (const t of TIERS) {
      for (const id of [mapping[h][t].primary, mapping[h][t].fallback]) {
        const line = `stale? ${id} not in packaged roster (${registry.hosts[h].lastVerified})`;
        if (isId(id) && !packaged.includes(id) && !userIds.includes(id) && !stale.includes(line)) stale.push(line);
      }
    }
  }

  if (writes.some((w) => w.relPath !== "AGENTS.md" && WRITING_TOKENS.includes(w.token))) hints.push(DD9_HINT);
  if (writes.every((w) => w.token === "unchanged" || w.token.startsWith("skipped"))) reports.push("no changes");
  const { table, cols } = tableParts(mapping, registry, roster);
  const eol = agentsMd ? detectEol(agentsMd) : "\n";
  return {
    writes,
    stale,
    authorAuditor,
    placeholdersByColumn: placeholdersByColumn(cols),
    sectionBytes: Buffer.byteLength(fencedBlock(body, sinceTag, eol), "utf8"),
    exitCode: writes.some((w) => w.token.startsWith("refused")) ? 1 : 0,
    hints,
    reports,
    registryTable: table,
    answers: finalAnswers,
  };
}

// ---- T4: the wizard behind an injected io (design §7 "Prompt seam", DD-6, DD-14) ----
//
// io = { ask(question, default) -> Promise<string> } — the terminal reader in
// production (T5), a scripted array in tests (W11). This module never touches
// a terminal: every question goes through io.ask, every answer comes back as
// data. An empty reply means Enter (the prompt's default).

const USAGE_FORM = "akili routing --hosts <h1,h2> --models <host>=<id>[@T<n>[+T<m>]],… --cli <host>=<binary> --wrappers yes|no --yes";

async function askLine(io, question, def) {
  const raw = await io.ask(question, def);
  return raw == null ? "" : String(raw).trim();
}

// Ask, parse; an invalid reply is re-asked once with its reason as the first
// line, a second invalid reply is an error. parse(s) -> { value } | { error }.
async function askValid(io, question, def, parse) {
  let q = question;
  for (let attempt = 0; ; attempt++) {
    const r = parse(await askLine(io, q, def));
    if (!r.error) return r;
    if (attempt === 1) return { error: r.error };
    q = `${r.error} — try again.\n${question}`;
  }
}

// "3,1" -> [2, 0] (0-based, typed order, duplicates dropped) or { error }.
function parseNumberList(s, max) {
  const items = splitList(s).filter((x) => x !== "");
  if (items.length === 0) return { error: "nothing selected" };
  const list = [];
  for (const x of items) {
    const n = /^\d+$/.test(x) ? Number(x) : NaN;
    if (!(n >= 1 && n <= max)) return { error: `\`${x}\` is not a number from 1 to ${max}` };
    if (!list.includes(n - 1)) list.push(n - 1);
  }
  return { value: list };
}

function parseOneNumber(s, max) {
  const r = parseNumberList(s, max);
  if (r.error) return r;
  if (r.value.length !== 1) return { error: `\`${s}\`: pick one number from 1 to ${max}` };
  return { value: r.value[0] };
}

// Numbered multi-select, `akili init`'s numbered style extended to comma lists
// (P-21): `[x]` marks the pre-checked options, Enter keeps them (in the order
// given), an invalid number is re-asked once, then an error.
// -> { picked: [0-based index] } | { error }.
async function promptMultiSelect(io, title, options, preChecked) {
  const checked = (preChecked || []).filter((i) => Number.isInteger(i) && i >= 0 && i < options.length);
  const hint = checked.length > 0 ? "comma-separated numbers; Enter keeps [x]" : "comma-separated numbers";
  const lines = options.map((o, i) => `  [${checked.includes(i) ? "x" : " "}] ${i + 1}) ${o}`);
  const question = `${title} (${hint})\n${lines.join("\n")}\n> `;
  const def = checked.map((i) => i + 1).join(",");
  const r = await askValid(io, question, def, (s) => (s === "" && checked.length > 0 ? { value: checked.slice() } : parseNumberList(s, options.length)));
  return r.error ? { error: `${title}: ${r.error}` } : { picked: r.value };
}

// Single choice over numbered options -> { value: 0-based } | { error }.
async function promptOne(io, title, options) {
  const question = `${title}\n${options.map((o, i) => `  ${i + 1}) ${o}`).join("\n")}\n> `;
  const r = await askValid(io, question, "", (s) => parseOneNumber(s, options.length));
  return r.error ? { error: `${title}: ${r.error}` } : r;
}

const REASON_T3_T2 = (id) => `T3 = T2 rejected: \`${id}\` is the Implementer's model (T2) — the Reviewer must run on a different model (author ≠ auditor)`;

// One tier per round (FR-1 *Adjust a tier*): which tier, then which roster
// model. The pick becomes a user placement on that tier (the head of its
// preference list, DD-4) and the tier moves off any other user placement. A
// pick that makes T3 = T2 is rejected with a one-line reason and re-asked.
// opts.packagedIds: a packaged id left with no placement reverts to packaged.
// -> { roster, tier, id } | { error }.
async function promptTierAdjust(io, mapping, roster, opts = {}) {
  const packagedIds = opts.packagedIds || [];
  const t = await askValid(io, `Adjust which tier? (1–6)\n${TIERS.map((x) => `  ${x}  ${mapping[x].primary}`).join("\n")}\n> `, "", (s) => parseOneNumber(s, 6));
  if (t.error) return { error: `Adjust which tier: ${t.error}` };
  const tier = TIERS[t.value];
  const ids = roster.map((e) => e.id);
  const question = `${tier} — pick a model:\n${ids.map((id, i) => `  ${i + 1}) ${id}${id === mapping[tier].primary ? " (current)" : ""}`).join("\n")}\n> `;
  let q = question;
  for (;;) {
    const r = await askValid(io, q, "", (s) => parseOneNumber(s, ids.length));
    if (r.error) return { error: `${tier} — pick a model: ${r.error}` };
    const id = ids[r.value];
    const reason = adjustRejection(tier, id, mapping, roster, packagedIds);
    if (!reason) return { roster: placeOnTier(roster, id, tier, packagedIds), tier, id };
    q = `${reason}\n${question}`;
  }
}

function adjustRejection(tier, id, mapping, roster, packagedIds) {
  if (tier === "T3" && id === mapping.T2.primary) return REASON_T3_T2(id);
  const own = roster.find((e) => e.id === id);
  const ownTiers = own.source === "user" ? own.tiers : [];
  if ((tier === "T2" && ownTiers.includes("T3")) || (tier === "T3" && ownTiers.includes("T2"))) {
    return `\`${id}\` cannot serve both T2 and T3 — T3 must differ from T2 (author ≠ auditor)`;
  }
  const orphan = roster.find((e) => e.id !== id && e.source === "user" && e.tiers.length === 1 && e.tiers[0] === tier && !packagedIds.includes(e.id));
  if (orphan) return `\`${orphan.id}\` serves only ${tier} — re-place it from the roster question first`;
  return null;
}

function placeOnTier(roster, id, tier, packagedIds) {
  return roster.map((e) => {
    if (e.id === id) {
      const tiers = (e.source === "user" ? e.tiers : []).filter((x) => x !== tier).concat(tier);
      return withReason({ id, source: "user", tiers }, e);
    }
    if (e.source !== "user" || !e.tiers.includes(tier)) return cloneEntry(e);
    const tiers = e.tiers.filter((x) => x !== tier);
    if (tiers.length === 0 && packagedIds.includes(e.id)) return withReason({ id: e.id, source: "packaged" }, e);
    return withReason({ id: e.id, source: "user", tiers }, e);
  });
}

function withReason(entry, from) {
  if (from && from.reason) entry.reason = from.reason;
  return entry;
}

function cloneEntry(e) {
  return withReason(e.source === "user" ? { id: e.id, source: "user", tiers: e.tiers.slice() } : { id: e.id, source: "packaged" }, e);
}

// "1,3" -> ["T1","T3"] (typed order) or { error }; T2 + T3 together is the
// same validation error as `@T2+T3` (§5.3).
function parsePlacement(s, id) {
  const r = parseNumberList(s, 6);
  if (r.error) return r;
  const tiers = r.value.map((i) => TIERS[i]);
  if (tiers.includes("T2") && tiers.includes("T3")) return { error: `\`${id}\` cannot serve both T2 and T3 — T3 must differ from T2 (author ≠ auditor)` };
  return { value: tiers };
}

function parseIds(s, single) {
  const ids = splitList(s).filter((x) => x !== "");
  if (ids.length === 0) return { error: "no id typed" };
  if (single && ids.length > 1) return { error: `\`${s}\`: type one id` };
  const bad = ids.find((x) => x.includes("@"));
  if (bad) return { error: `id \`${bad}\` contains \`@\`, which is reserved for the placement suffix` };
  return { value: ids };
}

function modelOptionText(m, entry) {
  let text = `${m.label} (${m.id})`;
  if (m.planGated) text += " (plan-gated — confirm in `/model`)";
  if (entry && entry.source === "user") text += ` — placed ${entry.tiers.join("+")}`;
  return text;
}

// Ask the reason for a dated id that has none (alias-first "record why").
async function fillReason(io, entry, packagedModel, reasons) {
  if (entry.reason || !needsPinReason(entry.id, packagedModel)) return {};
  if (reasons[entry.id]) {
    entry.reason = reasons[entry.id];
    return {};
  }
  const r = await askValid(io, `Why pin the dated id \`${entry.id}\`? (recorded as a registry footnote)\n> `, "", (s) => (s === "" ? { error: "a reason is required for a dated id" } : { value: s }));
  if (r.error) return r;
  entry.reason = r.value;
  return {};
}

// The per-host roster question: packaged ids, previous user ids (pre-checked,
// never re-typed — FR-6), Cursor-style families (type an id), *other*. A typed
// id outside the packaged roster gets its placement question, then its reason
// if dated. -> { entries } | { error }.
async function promptRoster(io, host, registry, current, reasons) {
  const hr = registry.hosts[host];
  const packaged = hr.models.filter((m) => m.id !== null);
  const options = [];
  for (const m of packaged) {
    const prior = current.find((e) => e.id === m.id);
    options.push({ text: modelOptionText(m, prior), entry: prior || { id: m.id, source: "packaged" } });
  }
  for (const e of current) {
    if (!packaged.some((m) => m.id === e.id)) options.push({ text: `${e.id} (your id${e.source === "user" ? `, placed ${e.tiers.join("+")}` : ""})`, entry: e });
  }
  for (const m of hr.models.filter((x) => x.id === null)) options.push({ text: `${m.label} — type its id`, family: m });
  options.push({ text: "other (type id)", other: true });
  const preChecked = current.map((e) => options.findIndex((o) => o.entry && o.entry.id === e.id)).filter((i) => i !== -1);
  const sel = await promptMultiSelect(io, `${hr.label} — which models do you have?`, options.map((o) => o.text), preChecked);
  if (sel.error) return sel;
  const entries = [];
  const add = (e) => {
    const i = entries.findIndex((x) => x.id === e.id);
    if (i === -1) entries.push(e);
    else entries[i] = e;
  };
  for (const i of sel.picked) {
    const o = options[i];
    if (o.entry) {
      const e = cloneEntry(o.entry);
      const r = await fillReason(io, e, packaged.find((m) => m.id === e.id), reasons);
      if (r.error) return r;
      add(e);
      continue;
    }
    const title = o.family ? `${hr.label} — model id for ${o.family.label}` : `${hr.label} — type the model id(s), comma-separated`;
    const typed = await askValid(io, `${title}\n> `, "", (s) => parseIds(s, Boolean(o.family)));
    if (typed.error) return { error: `${title}: ${typed.error}` };
    for (const id of typed.value) {
      const pm = packaged.find((m) => m.id === id);
      let e;
      if (pm) e = { id, source: "packaged" };
      else {
        const place = await askValid(io, `Which tier(s) does \`${id}\` serve? (1–6, comma-separated)\n> `, "", (s) => parsePlacement(s, id));
        if (place.error) return { error: place.error };
        e = { id, source: "user", tiers: place.value };
      }
      const r = await fillReason(io, e, pm, reasons);
      if (r.error) return r;
      add(e);
    }
  }
  return { entries };
}

// A previous answers file may be hand-edited: check the entries it pre-fills
// (they feed deriveTiers, which assumes `tiers` on every user entry).
function checkPreviousRoster(host, entries) {
  const where = (i, e) => `.agents/model-routing.json roster.${host}[${i}]${e && typeof e.id === "string" ? ` (\`${e.id}\`)` : ""}`;
  if (!Array.isArray(entries) || entries.length === 0) return { error: `.agents/model-routing.json roster.${host}: expected a non-empty list — fix the file or pass --models ${host}=…` };
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e || typeof e.id !== "string" || e.id === "") return { error: `${where(i, e)}: missing id — fix the file or pass --models ${host}=…` };
    if (e.source !== "packaged" && e.source !== "user") return { error: `${where(i, e)}: source must be "packaged" or "user" — fix the file or pass --models ${host}=…` };
    if (e.source === "user") {
      const ok = Array.isArray(e.tiers) && e.tiers.length > 0 && e.tiers.every((t) => TIERS.includes(t));
      if (!ok) return { error: `${where(i, e)}: source "user" needs tiers T1–T6 — fix the file or pass --models ${host}=…` };
      if (e.tiers.includes("T2") && e.tiers.includes("T3")) return { error: `${where(i, e)}: placed on both T2 and T3 — fix the file or pass --models ${host}=…` };
    }
  }
  return { entries: entries.map(cloneEntry) };
}

function deriveFor(host, entries, registry, hosts, crossHost) {
  return deriveTiers(entries, registry.hosts[host], { crossHost: crossHost[host], selectedHosts: hosts, hostKey: host, crossHostT6Owner: registry.crossHost.T6 });
}

function tableText(hosts, roster, registry, crossHost) {
  const out = ["Derived tier table:"];
  for (const h of hosts) {
    const d = deriveFor(h, roster[h], registry, hosts, crossHost);
    out.push(`${label(registry, h)} (author ≠ auditor: ${d.authorAuditor})`);
    for (const t of TIERS) {
      const c = d.mapping[t];
      out.push(`  ${t}  ${c.primary}  (fallback ${c.fallback})${c.note ? `  — ${c.note}` : ""}`);
    }
  }
  return out.join("\n");
}

function hostFlagGiven(models, host) {
  return (models || []).some((item) => String(item).split("=")[0].trim() === host);
}

// FR-1 / FR-2 / FR-6 — the answers buildPlan consumes: { hosts, roster, cli,
// wrappers, decisions, crossHost } (buildPlan computes version, generatedBy,
// mapping, authorAuditor, unselectedHosts, updatedAt itself).
//
// QUESTION ORDER — the contract /akili-constitution's fallback protocol copies
// (DD-6). Each step resolves flags -> previous answers -> io.ask; a step
// answered by a flag asks nothing. Previous answers (`.agents/model-routing.json`)
// are final under `--yes` or without a TTY, and pre-fill the prompt otherwise
// (FR-6 *Pre-fill*: `[x]` pre-checked, Enter keeps it).
//   1. hosts — multi-select over the five hosts                     (--hosts)
//   2. per selected host, in host order: roster — multi-select over the
//      packaged ids (+ previous user ids, pre-checked), Cursor-style
//      families and *other*; a typed id outside the packaged roster ->
//      its tiers (1–6); a dated id -> its reason                     (--models, --pin-reason)
//   3. per selected host, in host order: CLI invocation — default
//      previous.cli[host] ?? the packaged suggestion's leading binary;
//      Enter accepts, `-` leaves <CONFIRM>                           (--cli)
//   4. Antigravity tool names — only when Antigravity is selected    (--antigravity-tools)
//   5. OpenCode agent directory — only when OpenCode is selected     (--opencode-agent-dir)
//   6. wrappers — "Bind the personas with native wrappers (Step 8E)? [Y/n]"
//                                                                    (--wrappers; --yes -> yes)
//   7. derived tier table + [A]ccept / [t] adjust a tier / [q] quit  (--yes skips 7 and 8)
//      `t` -> host (when more than one) -> tier -> model; T3 = T2 rejected
//   8. per host still `unsatisfiable` after accept: add a model / dispatch
//      T3 cross-host / leave it; a change re-shows step 7          (--t3-cross-host)
// Without a TTY nothing is asked: answers still missing after flags and the
// previous file -> { error } naming the non-interactive form (W6).
// -> { answers } | { error } | { quit: true }.
async function collectAnswers(args, previous, registry, io, opts = {}) {
  const a = args || {};
  const prev = previous || null;
  const isTTY = opts.isTTY === true;
  const yes = a.yes === true;
  const usePrev = Boolean(prev) && (yes || !isTTY);
  const prevRoster = (h) => (prev && prev.roster && prev.roster[h] !== undefined ? prev.roster[h] : undefined);

  if (a.wrappers !== undefined && a.wrappers !== "yes" && a.wrappers !== "no") return { error: `--wrappers \`${a.wrappers}\`: accepted: yes, no` };
  if (prev && prev.wrappers !== undefined && prev.wrappers !== "yes" && prev.wrappers !== "no") return { error: `.agents/model-routing.json wrappers: \`${prev.wrappers}\` — accepted: yes, no` };

  // Non-interactive guard: never call io.ask without a TTY.
  if (!isTTY) {
    const missing = [];
    let knownHosts = null;
    if (a.hosts !== undefined) {
      const ph = parseHosts(a.hosts);
      if (ph.error) return { error: ph.error };
      knownHosts = ph.hosts;
    } else if (prev && Array.isArray(prev.hosts) && prev.hosts.length > 0) knownHosts = prev.hosts;
    if (!knownHosts) missing.push("--hosts", "--models");
    else for (const h of knownHosts) if (!hostFlagGiven(a.models, h) && prevRoster(h) === undefined) missing.push(`--models ${h}=…`);
    if (!yes) missing.push("--yes");
    if (missing.length > 0) return { error: `stdin is not a TTY and answers are still missing: ${missing.join(", ")} — use the non-interactive form: ${USAGE_FORM}` };
  }

  // 1. hosts
  let hosts;
  if (a.hosts !== undefined) {
    const ph = parseHosts(a.hosts);
    if (ph.error) return { error: ph.error };
    hosts = ph.hosts;
  } else {
    const prevHosts = prev && Array.isArray(prev.hosts) ? prev.hosts : [];
    const badHost = prevHosts.find((h) => !HOST_KEYS.includes(h));
    if (badHost !== undefined) return { error: `.agents/model-routing.json hosts: unknown host \`${badHost}\` — accepted: ${ACCEPTED_HOSTS}` };
    if (usePrev && prevHosts.length > 0) hosts = prevHosts.slice();
    else {
      const sel = await promptMultiSelect(io, "Which hosts do you use?", HOST_KEYS.map((h) => label(registry, h)), prevHosts.map((h) => HOST_KEYS.indexOf(h)));
      if (sel.error) return sel;
      hosts = sel.picked.map((i) => HOST_KEYS[i]);
    }
  }

  const pin = parsePinReasons(a.pinReason, hosts);
  if (pin.error) return pin;
  const cliFlags = parseCli(a.cli, hosts);
  if (cliFlags.error) return cliFlags;
  const cross = parseCrossHost(a.t3CrossHost, hosts);
  if (cross.error) return cross;
  const models = parseModels(a.models, hosts, registry, { reasons: pin.reasons, interactive: isTTY });
  if (models.error) return models;
  if (a.antigravityTools !== undefined && !hosts.includes("antigravity")) return { error: `--antigravity-tools: Antigravity is not selected — --hosts: ${hosts.join(", ")}` };
  if (a.opencodeAgentDir !== undefined && !hosts.includes("opencode")) return { error: `--opencode-agent-dir: OpenCode is not selected — --hosts: ${hosts.join(", ")}` };

  // Previous answers cover a host's optional answers (cli, decisions) when the
  // file configured that host: an absent cli there is a deliberate <CONFIRM>.
  const covered = (h) => usePrev && prevRoster(h) !== undefined;
  const crossHost = {};
  for (const h of hosts) {
    const recorded = prev && prev.authorAuditor ? prev.authorAuditor[h] : undefined;
    if (cross.crossHost[h]) crossHost[h] = cross.crossHost[h];
    else if (typeof recorded === "string" && recorded.startsWith("cross-host: ")) crossHost[h] = recorded.slice(12);
  }

  // 2. rosters
  const roster = {};
  for (const h of hosts) {
    const reasons = pin.reasons[h] || {};
    if (models.roster[h]) {
      const entries = models.roster[h];
      for (const e of entries) {
        const r = await fillReason(io, e, registry.hosts[h].models.find((m) => m.id !== null && m.id === e.id), reasons);
        if (r.error) return r;
      }
      roster[h] = entries;
      continue;
    }
    let prior = [];
    if (prevRoster(h) !== undefined) {
      const checked = checkPreviousRoster(h, prevRoster(h));
      if (checked.error) return checked;
      prior = checked.entries;
    }
    if (usePrev && prevRoster(h) !== undefined) {
      roster[h] = prior;
      continue;
    }
    const r = await promptRoster(io, h, registry, prior, reasons);
    if (r.error) return r;
    roster[h] = r.entries;
  }

  // 3. invocations
  const cli = {};
  for (const h of hosts) {
    if (cliFlags.cli[h] !== undefined) cli[h] = cliFlags.cli[h];
    else if (covered(h)) {
      const v = prev.cli ? prev.cli[h] : undefined;
      if (typeof v === "string" && v !== "") cli[h] = v;
    } else if (isTTY) {
      const parts = String(registry.hosts[h].cliSuggestion).split(" — ");
      const prevCli = prev && prev.cli && typeof prev.cli[h] === "string" ? prev.cli[h] : undefined;
      const def = prevCli !== undefined ? prevCli : parts[0];
      const help = parts.length > 1 ? `\n  ${parts.slice(1).join(" — ")}` : "";
      const s = await askLine(io, `${label(registry, h)} — CLI invocation [${def}] (Enter accepts, type another, \`-\` leaves <CONFIRM>)${help}\n> `, def);
      if (s === "") cli[h] = def;
      else if (s !== "-") cli[h] = s;
    }
  }

  // 4. Antigravity tool names, 5. OpenCode agent directory
  const decisions = {};
  if (hosts.includes("antigravity")) {
    const prevTools = prev && prev.decisions && prev.decisions.antigravity && Array.isArray(prev.decisions.antigravity.antigravityTools) ? prev.decisions.antigravity.antigravityTools : [];
    let tools = [];
    if (a.antigravityTools !== undefined) {
      tools = splitList(a.antigravityTools).filter((x) => x !== "");
      if (tools.length === 0) return { error: "--antigravity-tools is empty — expected <a,b>" };
    } else if (covered("antigravity")) tools = prevTools.slice();
    else if (isTTY) {
      const def = prevTools.join(",");
      const s = await askLine(io, `Antigravity — Reviewer tool names (comma-separated, as Antigravity lists them; \`-\` omits)${def ? ` [${def}]` : ""}\n  omitted -> the Reviewer is read-only by instruction, reported in the summary\n> `, def);
      if (s === "") tools = prevTools.slice();
      else if (s !== "-") tools = splitList(s).filter((x) => x !== "");
    }
    if (tools.length > 0) decisions.antigravity = { antigravityTools: tools };
  }
  if (hosts.includes("opencode")) {
    const packagedDir = path.posix.dirname(registry.hosts.opencode.wrapper.location);
    const prevDir = prev && prev.decisions && prev.decisions.opencode && typeof prev.decisions.opencode.agentDir === "string" ? prev.decisions.opencode.agentDir : undefined;
    let dir = packagedDir;
    if (a.opencodeAgentDir !== undefined) {
      dir = String(a.opencodeAgentDir).trim();
      if (dir === "") return { error: "--opencode-agent-dir is empty — expected <path>" };
    } else if (covered("opencode")) dir = prevDir || packagedDir;
    else if (isTTY) {
      const def = prevDir || packagedDir;
      const s = await askLine(io, `OpenCode — agent directory [${def}]\n> `, def);
      dir = s === "" ? def : s;
    }
    decisions.opencode = { agentDir: dir };
  }

  // 6. wrappers
  let wrappers;
  if (a.wrappers !== undefined) wrappers = a.wrappers;
  else if (usePrev && prev.wrappers !== undefined) wrappers = prev.wrappers;
  else if (yes) wrappers = "yes";
  else {
    const def = prev && prev.wrappers === "no" ? "no" : "yes";
    const r = await askValid(io, `Bind the personas with native wrappers (Step 8E)? ${def === "yes" ? "[Y/n]" : "[y/N]"}\n> `, def === "yes" ? "Y" : "N", (s) => {
      const v = s.toLowerCase();
      if (v === "") return { value: def };
      if (v === "y" || v === "yes") return { value: "yes" };
      if (v === "n" || v === "no") return { value: "no" };
      return { error: `\`${s}\`: answer y or n` };
    });
    if (r.error) return { error: `wrappers: ${r.error}` };
    wrappers = r.value;
  }

  // 7. confirm (+ adjust), 8. unsatisfiable hosts
  if (!yes) {
    const left = new Set();
    for (;;) {
      const r = await askValid(io, `${tableText(hosts, roster, registry, crossHost)}\n[A]ccept / [t] adjust a tier / [q] quit\n> `, "a", (s) => {
        const v = s.toLowerCase();
        if (v === "" || v === "a" || v === "accept") return { value: "a" };
        if (v === "t" || v === "q") return { value: v };
        return { error: `\`${s}\`: answer a, t or q` };
      });
      if (r.error) return { error: `confirm: ${r.error}` };
      if (r.value === "q") return { quit: true };
      if (r.value === "t") {
        let h = hosts[0];
        if (hosts.length > 1) {
          const pick = await promptOne(io, "Adjust which host?", hosts.map((x) => label(registry, x)));
          if (pick.error) return pick;
          h = hosts[pick.value];
        }
        const d = deriveFor(h, roster[h], registry, hosts, crossHost);
        const packagedIds = registry.hosts[h].models.filter((m) => m.id !== null).map((m) => m.id);
        const adj = await promptTierAdjust(io, d.mapping, roster[h], { packagedIds });
        if (adj.error) return adj;
        roster[h] = adj.roster;
        continue;
      }
      let changed = false;
      for (const h of hosts) {
        if (left.has(h) || deriveFor(h, roster[h], registry, hosts, crossHost).authorAuditor !== "unsatisfiable") continue;
        const hl = label(registry, h);
        const way = await promptOne(io, `${hl}: author ≠ auditor NOT satisfied — the Reviewer cannot differ from the Implementer`, ["add a model", "dispatch T3 cross-host", `leave it (no wrappers for ${hl})`]);
        if (way.error) return way;
        if (way.value === 0) {
          const more = await promptRoster(io, h, registry, roster[h], pin.reasons[h] || {});
          if (more.error) return more;
          roster[h] = more.entries;
          changed = true;
        } else if (way.value === 1) {
          const others = HOST_KEYS.filter((x) => x !== h);
          const to = await promptOne(io, `${hl} — dispatch the Reviewer (T3) to which host?`, others.map((x) => label(registry, x)));
          if (to.error) return to;
          crossHost[h] = others[to.value];
          changed = true;
        } else left.add(h);
      }
      if (!changed) break;
    }
  }

  return { answers: { hosts, roster, cli, wrappers, decisions, crossHost } };
}

module.exports = {
  HOST_KEYS,
  parseHosts,
  parseModels,
  parsePinReasons,
  parseCli,
  parseCrossHost,
  deriveTiers,
  canonicalAnswers,
  replaceFencedSection,
  renderRegistryTable,
  renderSection,
  renderWrapper,
  buildPlan,
  collectAnswers,
  promptMultiSelect,
  promptTierAdjust,
};

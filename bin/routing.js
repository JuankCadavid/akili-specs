// Pure flag-grammar and tier-derivation functions for `akili routing`
// (design.md §5.3, §5.7, §7). No I/O — required by test/routing.test.js and,
// from T3, by bin/akili.js (runRouting); kept out of bin/akili.js because that
// file runs main() on load, so nothing in it is unit-testable by require.
"use strict";

const path = require("path"); // eslint-disable-line no-unused-vars -- wrapper paths (T3)

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

module.exports = {
  HOST_KEYS,
  parseHosts,
  parseModels,
  parsePinReasons,
  parseCli,
  parseCrossHost,
  deriveTiers,
  canonicalAnswers,
};

"use strict";

// T2 / FR-2 (Validation errors) + FR-3 (all three scenarios) / design §5.3,
// §5.7, §7: bin/routing.js flag grammar and tier derivation, part 1. Expected
// values come from the FR-3 scenarios; the "every host" case loads the shipped
// .claude/templates/model-registry.json, never a hand-typed fixture.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const routing = require("../bin/routing.js");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, ".claude", "templates", "model-registry.json");
const REGISTRY = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const TIERS = ["T1", "T2", "T3", "T4", "T5", "T6"];

// ---- parseHosts (FR-2) ----

test("parseHosts: accepts the five keys, trims, keeps order, drops duplicates", () => {
  assert.deepEqual(routing.parseHosts("claude, cursor,claude"), { hosts: ["claude", "cursor"] });
});

test("parseHosts: the accepted set is the registry's host keys", () => {
  assert.deepEqual(routing.HOST_KEYS, Object.keys(REGISTRY.hosts));
});

test("parseHosts: unknown host -> error naming it and the accepted set (FR-2 `--hosts claude,vscode`)", () => {
  const r = routing.parseHosts("claude,vscode");
  assert.equal(r.hosts, undefined);
  assert.match(String(r.error), /`vscode`/);
  assert.match(String(r.error), /claude, opencode, antigravity, codex, cursor/);
});

test("parseHosts: empty value -> error", () => {
  assert.match(String(routing.parseHosts(" ").error), /--hosts/);
});

// ---- parsePinReasons / parseCli / parseCrossHost (FR-2, design §5.7) ----

test("parsePinReasons: host=id=text, text may contain `=`, last flag per host+id wins", () => {
  const r = routing.parsePinReasons(
    ["claude=claude-opus-4-20250514=old", "claude=claude-opus-4-20250514=pinned: eval a=b"],
    ["claude"],
  );
  assert.deepEqual(r, { reasons: { claude: { "claude-opus-4-20250514": "pinned: eval a=b" } } });
});

test("parsePinReasons: host not in --hosts -> error naming it", () => {
  const r = routing.parsePinReasons(["codex=x=why"], ["claude"]);
  assert.match(String(r.error), /`codex`/);
  assert.match(String(r.error), /--hosts: claude/);
});

test("parsePinReasons: missing id or text -> error naming the value", () => {
  assert.match(String(routing.parsePinReasons(["claude=x"], ["claude"]).error), /`claude=x`/);
  assert.match(String(routing.parsePinReasons(["claude==why"], ["claude"]).error), /`claude==why`/);
});

test("parseCli: host=binary map, last flag per host wins", () => {
  assert.deepEqual(routing.parseCli(["claude=claude", "cursor=agent", "claude=claude-beta"], ["claude", "cursor"]), {
    cli: { claude: "claude-beta", cursor: "agent" },
  });
});

test("parseCli: unknown host / host not selected / empty binary -> error naming the value", () => {
  assert.match(String(routing.parseCli(["vscode=code"], ["claude"]).error), /`vscode`.*accepted: claude, opencode, antigravity, codex, cursor/);
  assert.match(String(routing.parseCli(["codex=codex"], ["claude"]).error), /`codex`.*--hosts: claude/);
  assert.match(String(routing.parseCli(["claude="], ["claude"]).error), /`claude=`/);
});

test("parseCrossHost: host=other map", () => {
  assert.deepEqual(routing.parseCrossHost(["claude=antigravity"], ["claude"]), { crossHost: { claude: "antigravity" } });
});

test("parseCrossHost: other unknown, or other == host -> error naming the value", () => {
  assert.match(String(routing.parseCrossHost(["claude=vscode"], ["claude"]).error), /`vscode`.*accepted: claude, opencode/);
  assert.match(String(routing.parseCrossHost(["claude=claude"], ["claude"]).error), /`claude=claude`/);
  assert.match(String(routing.parseCrossHost(["codex=claude"], ["claude"]).error), /`codex`.*--hosts: claude/);
});

// ---- parseModels (FR-2 Validation errors, FR-3 Unknown model id, design §5.7) ----

const P = (id) => ({ id, source: "packaged" });
const U = (id, tiers, reason) => (reason ? { id, source: "user", tiers, reason } : { id, source: "user", tiers });

test("parseModels: packaged ids -> source packaged, roster order kept", () => {
  assert.deepEqual(routing.parseModels(["claude=opus, sonnet,haiku"], ["claude"], REGISTRY), {
    roster: { claude: [P("opus"), P("sonnet"), P("haiku")] },
  });
});

test("parseModels: last --models flag for a host wins", () => {
  assert.deepEqual(routing.parseModels(["claude=opus,sonnet,haiku", "claude=sonnet"], ["claude"], REGISTRY), {
    roster: { claude: [P("sonnet")] },
  });
});

test("parseModels: FR-2 fully-specified Cursor ids with `+`-joined placements parse as user ids", () => {
  const r = routing.parseModels(["cursor=claude-opus-4-7@T1+T3,composer-2@T2+T5,gpt-5.6-terra@T3"], ["cursor"], REGISTRY);
  assert.deepEqual(r, {
    roster: { cursor: [U("claude-opus-4-7", ["T1", "T3"]), U("composer-2", ["T2", "T5"]), U("gpt-5.6-terra", ["T3"])] },
  });
});

test("parseModels: a packaged id with a placement is a user placement (DD-4 head of its tiers)", () => {
  assert.deepEqual(routing.parseModels(["claude=opus,sonnet@T3"], ["claude"], REGISTRY), {
    roster: { claude: [P("opus"), U("sonnet", ["T3"])] },
  });
});

test("parseModels: unknown host -> error naming it and the accepted set", () => {
  const r = routing.parseModels(["vscode=x@T1"], ["claude"], REGISTRY);
  assert.equal(r.roster, undefined);
  assert.match(String(r.error), /`vscode`.*accepted: claude, opencode, antigravity, codex, cursor/);
});

test("parseModels: host not in --hosts -> error naming it and the selected set (FR-2 `--models codex=…`)", () => {
  assert.match(String(routing.parseModels(["codex=gpt-5.6-luna"], ["claude"], REGISTRY).error), /`codex`.*--hosts: claude/);
});

test("parseModels: empty list -> error naming the flag value (FR-2 `--models claude=`)", () => {
  assert.match(String(routing.parseModels(["claude="], ["claude"], REGISTRY).error), /`claude=`.*empty/);
  assert.match(String(routing.parseModels(["claude=opus,,haiku"], ["claude"], REGISTRY).error), /`claude=opus,,haiku`.*empty/);
});

test("parseModels: tier outside 1–6 -> error naming the suffix and the accepted set (FR-2 `@T9`)", () => {
  const r = routing.parseModels(["cursor=x@T1+T9"], ["cursor"], REGISTRY);
  assert.match(String(r.error), /`T9`/);
  assert.match(String(r.error), /T1–T6/);
  assert.match(String(routing.parseModels(["cursor=x@T0"], ["cursor"], REGISTRY).error), /`T0`.*T1–T6/);
});

test("parseModels: id absent from the packaged roster without @T… -> error naming it (FR-3 `--models cursor=my-new-model`)", () => {
  const r = routing.parseModels(["cursor=my-new-model"], ["cursor"], REGISTRY);
  assert.match(String(r.error), /`my-new-model`/);
  assert.match(String(r.error), /@T<n>\[\+T<m>\]/);
  assert.match(String(routing.parseModels(["claude=opus,gpt-9"], ["claude"], REGISTRY).error), /`gpt-9`.*packaged: opus, sonnet, haiku/);
});

test("parseModels: `@` inside an id -> error naming the id (`@` reserved)", () => {
  assert.match(String(routing.parseModels(["cursor=org@model@T1"], ["cursor"], REGISTRY).error), /`org@model`.*reserved/);
  assert.match(String(routing.parseModels(["cursor=org@model"], ["cursor"], REGISTRY).error), /`org@model`.*reserved/);
});

test("parseModels: one id placed on both T2 and T3 -> error naming the id", () => {
  const r = routing.parseModels(["cursor=x@T1+T2+T3"], ["cursor"], REGISTRY);
  assert.match(String(r.error), /`x`.*T2 and T3/);
});

test("parseModels: dated user id without a reason, non-interactive -> error naming the id and --pin-reason", () => {
  const r = routing.parseModels(["claude=sonnet,claude-opus-4-20250514@T1+T3"], ["claude"], REGISTRY);
  assert.match(String(r.error), /`claude-opus-4-20250514`/);
  assert.match(String(r.error), /--pin-reason claude=claude-opus-4-20250514=<text>/);
});

test("parseModels: dated id with --pin-reason carries the reason; interactive mode defers the reason to the wizard", () => {
  const reasons = { claude: { "claude-opus-4-20250514": "eval baseline" } };
  assert.deepEqual(routing.parseModels(["claude=sonnet,claude-opus-4-20250514@T1+T3"], ["claude"], REGISTRY, { reasons }), {
    roster: { claude: [P("sonnet"), U("claude-opus-4-20250514", ["T1", "T3"], "eval baseline")] },
  });
  assert.deepEqual(routing.parseModels(["claude=sonnet,claude-opus-4-20250514@T1+T3"], ["claude"], REGISTRY, { interactive: true }), {
    roster: { claude: [P("sonnet"), U("claude-opus-4-20250514", ["T1", "T3"])] },
  });
});

test("parseModels: a packaged `dated: true` id needs a reason too (registry flag drives it)", () => {
  const reg = JSON.parse(JSON.stringify(REGISTRY));
  reg.hosts.opencode.models.find((m) => m.id === "opencode-go/glm-5.3").dated = true;
  const r = routing.parseModels(["opencode=opencode-go/glm-5.3,opencode-go/deepseek-v4.1-flash"], ["opencode"], reg);
  assert.match(String(r.error), /`opencode-go\/glm-5.3`.*--pin-reason/);
  const ok = routing.parseModels(["opencode=opencode-go/glm-5.3"], ["opencode"], reg, {
    reasons: { opencode: { "opencode-go/glm-5.3": "pinned for parity" } },
  });
  assert.deepEqual(ok, { roster: { opencode: [{ id: "opencode-go/glm-5.3", source: "packaged", reason: "pinned for parity" }] } });
});

// ---- deriveTiers (FR-3, design §5.3) ----

const fullRoster = (host) => REGISTRY.hosts[host].models.filter((m) => m.id !== null).map((m) => P(m.id));
const derive = (host, roster, opts = {}) =>
  routing.deriveTiers(roster, REGISTRY.hosts[host], {
    crossHost: undefined,
    selectedHosts: [host],
    hostKey: host,
    crossHostT6Owner: REGISTRY.crossHost.T6,
    ...opts,
  });
const cells = (mapping) => Object.fromEntries(TIERS.map((t) => [t, [mapping[t].primary, mapping[t].fallback]]));

test("deriveTiers: FR-3 full Claude Code roster -> the scenario's primaries and fallbacks", () => {
  const r = derive("claude", [P("opus"), P("sonnet"), P("haiku")]);
  assert.deepEqual(cells(r.mapping), {
    T1: ["opus", "sonnet"],
    T2: ["sonnet", "haiku"],
    T3: ["opus", "sonnet"],
    T4: ["sonnet", "opus"],
    T5: ["haiku", "sonnet"],
    T6: ["sonnet", "opus"],
  });
  assert.equal(r.authorAuditor, "ok");
});

test("deriveTiers: for every host, the full packaged roster derives the packaged column (head, second ?? —)", () => {
  for (const host of Object.keys(REGISTRY.hosts)) {
    const r = derive(host, fullRoster(host));
    const pref = REGISTRY.hosts[host].tierPreference;
    for (const t of TIERS) {
      assert.equal(r.mapping[t].primary, pref[t][0], `${host} ${t} primary`);
      assert.equal(r.mapping[t].fallback, pref[t][1] === undefined ? "—" : pref[t][1], `${host} ${t} fallback`);
    }
    assert.equal(r.authorAuditor, host === "cursor" ? "unsatisfiable" : "ok", `${host} authorAuditor`);
  }
});

test("deriveTiers: a placeholder second entry survives as the fallback (Codex T4/T6, Antigravity T6), Cursor stays all-placeholder", () => {
  const codex = derive("codex", fullRoster("codex")).mapping;
  assert.deepEqual([codex.T4.primary, codex.T4.fallback], ["gpt-5.6-terra", "<CONFIRM SLUG>"]);
  assert.deepEqual([codex.T6.primary, codex.T6.fallback], ["gpt-5.6-terra", "<CONFIRM SLUG>"]);
  assert.equal(derive("antigravity", fullRoster("antigravity")).mapping.T6.fallback, "<CONFIRM ID>");
  const cursor = derive("cursor", []);
  assert.deepEqual(cells(cursor.mapping).T3, ["<CONFIRM SLUG>", "—"]);
  assert.match(cursor.mapping.T3.note, /^author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host/);
});

test("deriveTiers: deterministic — same input, same output; input not mutated", () => {
  const roster = [P("opus"), U("x", ["T1", "T3"]), P("sonnet")];
  const copy = JSON.parse(JSON.stringify(roster));
  assert.deepEqual(derive("claude", roster), derive("claude", roster));
  assert.deepEqual(roster, copy);
});

const NOTE_T3 = "author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host";

test("deriveTiers: FR-3 single-model roster `sonnet` -> unsatisfiable, T3 note verbatim, `single-model roster` note", () => {
  const r = derive("claude", [P("sonnet")]);
  assert.deepEqual(cells(r.mapping), {
    T1: ["sonnet", "—"],
    T2: ["sonnet", "—"],
    T3: ["sonnet", "—"],
    T4: ["sonnet", "—"],
    T5: ["sonnet", "—"],
    T6: ["sonnet", "—"],
  });
  assert.equal(r.authorAuditor, "unsatisfiable");
  assert.equal(r.mapping.T3.note, `${NOTE_T3}; *(must differ from T2)*`);
  assert.deepEqual(r.notes, ["single-model roster"]);
});

test("deriveTiers: roster `opus,sonnet` -> T2 sonnet (fallback —), T3 opus, T5 sonnet (fallback —)", () => {
  const r = derive("claude", [P("opus"), P("sonnet")]);
  assert.deepEqual(cells(r.mapping), {
    T1: ["opus", "sonnet"],
    T2: ["sonnet", "—"],
    T3: ["opus", "sonnet"],
    T4: ["sonnet", "opus"],
    T5: ["sonnet", "—"],
    T6: ["sonnet", "opus"],
  });
  assert.equal(r.authorAuditor, "ok");
  assert.deepEqual(r.notes, []);
});

test("deriveTiers: user id `x@T1+T3` on Claude -> T1 x, T3 x (≠ T2 sonnet), fallback opus", () => {
  const r = derive("claude", [P("opus"), P("sonnet"), P("haiku"), U("x", ["T1", "T3"])]);
  assert.deepEqual(cells(r.mapping).T1, ["x", "opus"]);
  assert.deepEqual(cells(r.mapping).T2, ["sonnet", "haiku"]);
  assert.deepEqual(cells(r.mapping).T3, ["x", "opus"]);
  assert.equal(r.authorAuditor, "ok");
});

test("deriveTiers: T2's pick placed at the T3 head (`sonnet@T3`) is skipped -> T3 opus (the ≠ T2 hard rule)", () => {
  const r = derive("claude", [P("opus"), U("sonnet", ["T3"])]);
  assert.equal(r.mapping.T2.primary, "sonnet");
  assert.equal(r.mapping.T3.primary, "opus");
  assert.equal(r.authorAuditor, "ok");
});

test("deriveTiers: user id on T2+T3 is a validation error, never derived (parseModels)", () => {
  assert.match(String(routing.parseModels(["claude=sonnet,x@T2+T3"], ["claude"], REGISTRY).error), /`x`.*T2 and T3/);
});

test("deriveTiers: --t3-cross-host claude=antigravity -> T3 primary `→ antigravity`, authorAuditor cross-host", () => {
  const r = derive("claude", [P("sonnet")], { crossHost: "antigravity" });
  assert.deepEqual(r.mapping.T3, { primary: "→ antigravity", fallback: "—", note: "*(must differ from T2)*", crossHost: "antigravity" });
  assert.equal(r.authorAuditor, "cross-host: antigravity");
});

test("deriveTiers: fixed per-tier notes from the registry are appended (full Claude roster)", () => {
  const m = derive("claude", fullRoster("claude")).mapping;
  assert.deepEqual(TIERS.map((t) => m[t].note), ["*(alias — always latest)*", "", "*(must differ from T2)*", "(long context)", "", "(vision)"]);
});

test("deriveTiers: empty T4 -> T2's pick + `no long-context model selected`", () => {
  const r = derive("antigravity", [P("gemini-3.8-flash-medium"), P("gemini-3.1-pro-high")]);
  assert.deepEqual(r.mapping.T4, { primary: "gemini-3.8-flash-medium", fallback: "—", note: "no long-context model selected" });
});

test("deriveTiers: empty T6 -> `<CONFIRM>`; note names the packaged owner when unselected / selected / is the host", () => {
  const unselected = derive("claude", [P("haiku")]).mapping.T6;
  assert.deepEqual(unselected, { primary: "<CONFIRM>", fallback: "—", note: "→ cross-host dispatch: antigravity; (vision)" });
  const selected = derive("claude", [P("haiku")], { selectedHosts: ["claude", "antigravity"] }).mapping.T6;
  assert.equal(selected.note, "→ cross-host dispatch: antigravity (selected); (vision)");
  const owner = derive("opencode", [P("opencode-go/glm-5.3")], { crossHostT6Owner: "opencode" }).mapping.T6;
  assert.deepEqual(owner, { primary: "<CONFIRM>", fallback: "—", note: "no vision model selected; (32,500 @ $15; **Exp**)" });
});

test("deriveTiers: empty T1/T5 -> `<CONFIRM SLUG>`; empty T3 -> T2's pick in the registry, unsatisfiable", () => {
  const r = derive("opencode", [P("opencode-go/deepseek-v4.1-flash"), P("opencode-go/deepseek-v4-flash-vision-exp")]);
  assert.deepEqual(cells(r.mapping), {
    T1: ["<CONFIRM SLUG>", "—"],
    T2: ["opencode-go/deepseek-v4.1-flash", "—"],
    T3: ["opencode-go/deepseek-v4.1-flash", "—"],
    T4: ["opencode-go/deepseek-v4.1-flash", "<CONFIRM>"],
    T5: ["<CONFIRM SLUG>", "—"],
    T6: ["opencode-go/deepseek-v4-flash-vision-exp", "—"],
  });
  assert.equal(r.authorAuditor, "unsatisfiable");
});

test("deriveTiers: empty T2 -> `<CONFIRM SLUG>`, so T3 cannot be checked ≠ T2 -> unsatisfiable (ids only)", () => {
  const r = derive("claude", [P("opus")]);
  assert.deepEqual(cells(r.mapping).T2, ["<CONFIRM SLUG>", "—"]);
  assert.deepEqual(cells(r.mapping).T3, ["opus", "—"]);
  assert.equal(r.authorAuditor, "unsatisfiable");
  assert.match(r.mapping.T3.note, /^author ≠ auditor NOT satisfied/);
});

// ---- canonicalAnswers (FR-6, DD-8) ----

test("canonicalAnswers: stable key order, `updatedAt` excluded, array order kept", () => {
  assert.equal(
    routing.canonicalAnswers({ version: 1, updatedAt: "2026-10-01", roster: { claude: [{ source: "packaged", id: "sonnet" }, { id: "opus", source: "packaged" }] }, hosts: ["claude"] }),
    '{"hosts":["claude"],"roster":{"claude":[{"id":"sonnet","source":"packaged"},{"id":"opus","source":"packaged"}]},"version":1}',
  );
});

test("canonicalAnswers: same answers in another key order and another updatedAt -> identical; a changed value -> different", () => {
  const a = { version: 1, generatedBy: "2.31.0", updatedAt: "2026-09-01", hosts: ["claude"], wrappers: "yes", cli: { claude: "claude" } };
  const b = { cli: { claude: "claude" }, wrappers: "yes", hosts: ["claude"], updatedAt: "2026-10-01", generatedBy: "2.31.0", version: 1 };
  assert.equal(routing.canonicalAnswers(a), routing.canonicalAnswers(b));
  assert.notEqual(routing.canonicalAnswers(a), routing.canonicalAnswers({ ...b, wrappers: "no" }));
  assert.doesNotMatch(routing.canonicalAnswers(a), /updatedAt/);
});

// ---- NFR-5: pure core ----

test("bin/routing.js is pure: requires only `path` (and ./persona.js from T3), reads no environment", () => {
  const src = fs.readFileSync(path.join(ROOT, "bin", "routing.js"), "utf8");
  const requires = [...src.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.deepEqual(requires.filter((r) => r !== "path" && r !== "./persona.js"), []);
  assert.doesNotMatch(src, /\bprocess\.|Math\.random|Date\.now|new Date\(/);
});

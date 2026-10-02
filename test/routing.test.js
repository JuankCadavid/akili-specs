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

// ===========================================================================
// T3 / FR-4 (Six states of `AGENTS.md`), FR-5, FR-6 / design §5.4–§5.6, §7:
// part 2 — fence replacer, section render, wrappers, buildPlan. Fixtures under
// test/fixtures/routing/ carry prose before and after every fence, so a write
// outside the fence is visible as a byte difference.
// ===========================================================================

const persona = require("../bin/persona.js");
const FIX = path.join(__dirname, "fixtures", "routing");
const fixture = (name) => fs.readFileSync(path.join(FIX, name), "utf8");

const OLD_BODY = "## Model Routing\n\nOld registry body, line one.\nOld registry body, line two.";
const NEW_BODY = "## Model Routing\n\nNew registry body.\n";
const OPEN_NEW = "<!-- akili:section id=model-routing since=v9.9.9 -->";
const CLOSE = "<!-- /akili:section -->";
const BLOCK_NEW = `${OPEN_NEW}\n## Model Routing\n\nNew registry body.\n${CLOSE}`;
const TOKEN_REFUSED_EDIT = "refused (hand-edited fence; --force to regenerate)";

// Bytes before the open marker and after the close marker, cut by the test.
function outside(text) {
  const open = text.indexOf("<!-- akili:section id=model-routing");
  const close = text.indexOf(CLOSE, open) + CLOSE.length;
  return { before: text.slice(0, open), after: text.slice(close) };
}

// ---- replaceFencedSection: the six states (FR-4) ----

test("replacer (a) clean fence, new body -> `replaced`, only the fence changes, since= bumped", () => {
  const src = fixture("agents-fenced-clean.md");
  const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", OLD_BODY, {});
  assert.equal(out.token, "replaced");
  const { before, after } = outside(src);
  assert.equal(out.text, before + BLOCK_NEW + after);
});

test("replacer (a) clean fence, same body -> `unchanged`, file byte-identical, since= kept", () => {
  const src = fixture("agents-fenced-clean.md");
  const out = routing.replaceFencedSection(src, OLD_BODY + "\n", "v9.9.9", OLD_BODY, {});
  assert.equal(out.token, "unchanged");
  assert.equal(out.text, src);
  assert.match(out.text, /since=v2\.30\.0 -->/);
});

test("replacer (a′) hand-edited fence -> refused with a unified diff, file untouched", () => {
  const src = fixture("agents-fenced-edited.md");
  const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", OLD_BODY, {});
  assert.equal(out.token, TOKEN_REFUSED_EDIT);
  assert.equal(out.text, src);
  assert.match(out.diff || "", /^--- /m);
  assert.match(out.diff || "", /^\+\+\+ /m);
  assert.match(out.diff || "", /^-HAND-EDITED: a user changed this line\.$/m);
  assert.match(out.diff || "", /^\+New registry body\.$/m);
});

test("replacer (a′) no answers file (expectedBody null) -> refused even on an untouched body", () => {
  const src = fixture("agents-fenced-clean.md");
  const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", null, {});
  assert.equal(out.token, TOKEN_REFUSED_EDIT);
  assert.equal(out.text, src);
});

test("replacer (a′) no answers file but the body already equals the new render -> `unchanged`, nothing refused", () => {
  const src = fixture("agents-fenced-clean.md");
  const out = routing.replaceFencedSection(src, OLD_BODY, "v9.9.9", null, {});
  assert.equal(out.token, "unchanged");
  assert.equal(out.text, src);
});

test("replacer (a′) with --force -> `overwritten`, bytes outside the fence untouched", () => {
  const src = fixture("agents-fenced-edited.md");
  const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", OLD_BODY, { force: true });
  assert.equal(out.token, "overwritten");
  const { before, after } = outside(src);
  assert.equal(out.text, before + BLOCK_NEW + after);
});

test("replacer (b) unfenced heading, no --adopt -> skipped with a diff; extent ignores headings in code fences", () => {
  const src = fixture("agents-unfenced.md");
  const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", null, {});
  assert.equal(out.token, "skipped (unfenced; --adopt to replace)");
  assert.equal(out.text, src);
  assert.match(out.diff || "", /^-Still part of the unfenced section\.$/m);
  assert.doesNotMatch(out.diff || "", /^-## Release Rules$/m);
});

test("replacer (b) unfenced heading with --adopt -> `adopted`, extent up to the next `## ` replaced", () => {
  const src = fixture("agents-unfenced.md");
  const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", null, { adopt: true });
  assert.equal(out.token, "adopted");
  const head = src.slice(0, src.indexOf("## Model Routing"));
  const tail = src.slice(src.indexOf("## Release Rules"));
  assert.equal(out.text, head + BLOCK_NEW + "\n\n" + tail);
});

test("replacer (c) no section -> `appended` after a blank line, existing bytes kept", () => {
  const src = fixture("agents-no-section.md");
  const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", null, {});
  assert.equal(out.token, "appended");
  assert.equal(out.text, src + "\n" + BLOCK_NEW + "\n");
});

test("replacer (d) no AGENTS.md (text null) -> `created` with the one-line header", () => {
  const out = routing.replaceFencedSection(null, NEW_BODY, "v9.9.9", null, {});
  assert.equal(out.token, "created");
  assert.equal(out.text, "# Agent Guidance\n\n" + BLOCK_NEW + "\n");
});

test("replacer (e) malformed: open without close / two blocks / close without open -> refused, untouched", () => {
  const cases = {
    "open without close": fixture("agents-malformed.md"),
    "two blocks": `# A\n\n${BLOCK_NEW}\n\n${BLOCK_NEW}\n`,
    "close without open": `# A\n\n## Model Routing\n\nx\n${CLOSE}\n`,
  };
  for (const [name, src] of Object.entries(cases)) {
    const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", OLD_BODY, { force: true, adopt: true });
    assert.equal(out.token, "refused (malformed fence)", name);
    assert.equal(out.text, src, name);
  }
});

test("replacer (f) fence + stray unfenced heading -> handled as (a), stray heading reported by line", () => {
  const src = fixture("agents-mixed.md");
  const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", OLD_BODY, {});
  assert.equal(out.token, "replaced");
  assert.deepEqual(out.notes, ['+ stray "## Model Routing" heading at line 5 — remove it']);
  const { before, after } = outside(src);
  assert.equal(out.text, before + BLOCK_NEW + after);
});

test("replacer: CRLF file -> fence detected, output keeps `\\r\\n`, outside bytes untouched (W14)", () => {
  const src = fixture("agents-crlf.md");
  const out = routing.replaceFencedSection(src, NEW_BODY, "v9.9.9", OLD_BODY, {});
  assert.equal(out.token, "replaced");
  const { before, after } = outside(src);
  assert.equal(out.text, before + BLOCK_NEW.replace(/\n/g, "\r\n") + after);
  assert.doesNotMatch(out.text, /[^\r]\n/);
});

test("replacer: the fence it writes is the grammar persona.js parses (NFR-8)", () => {
  assert.ok(persona.SECTION_OPEN_RE instanceof RegExp && persona.SECTION_CLOSE_RE instanceof RegExp);
  const lines = routing.replaceFencedSection(null, NEW_BODY, "v9.9.9", null, {}).text.split("\n");
  const open = lines.find((l) => persona.SECTION_OPEN_RE.test(l));
  assert.deepEqual(open && open.match(persona.SECTION_OPEN_RE).slice(1), ["model-routing", "v9.9.9"]);
  assert.ok(lines.some((l) => persona.SECTION_CLOSE_RE.test(l)));
});

// ---- shared fixtures for render / wrappers / buildPlan ----

const TEMPLATE = fs.readFileSync(path.join(ROOT, ".claude", "templates", "model-routing.section.md"), "utf8");
const PKG = "2.31.0";
const SEPT = new Date("2026-09-15T10:00:00Z");
const OCT = new Date("2026-10-02T08:00:00Z");
const ROLES = ["leader", "implementer", "reviewer", "tester"];
const ANS_PATH = ".agents/model-routing.json";
const DD9_HINT = "commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/";

// §5.5 / Step 8E rule 3: the body is one sentence referencing the persona.
const BODY = (role) => `Read \`.agents/${role}.md\` in the project root and adopt it fully as your persona and\noperating contract before doing anything else.\n`;
const DESC = {
  leader: "AKILI Leader — orchestrates the spec run, selects skills, adjudicates FAILs, and writes no code.",
  implementer: "AKILI Implementer — executes one spec task with strict scope and verification.",
  reviewer: "AKILI Reviewer — independent audit of the Implementer's diff against the spec.",
  tester: "AKILI Tester — authors and runs one test suite and reports PASS, FAIL, or PRODUCT_BUG.",
};
const md = (role, fields) => ["---", `name: akili-${role}`, `description: ${DESC[role]}`, ...fields, "---", BODY(role)].join("\n");
const toml = (role, model, effort, extra = []) =>
  [`name = "akili-${role}"`, `description = "${DESC[role]}"`, `developer_instructions = """`, BODY(role) + `"""`, `model = "${model}"`, `model_reasoning_effort = "${effort}"`, ...extra].join("\n") + "\n";

const packagedRoster = (host) => REGISTRY.hosts[host].models.filter((m) => m.id !== null).map((m) => ({ id: m.id, source: "packaged" }));
const deriveFor = (host, roster, extra = {}) =>
  routing.deriveTiers(roster, REGISTRY.hosts[host], { selectedHosts: [host], hostKey: host, crossHostT6Owner: REGISTRY.crossHost.T6, ...extra }).mapping;
const CURSOR_ROSTER = [
  { id: "claude-opus-4-7", source: "user", tiers: ["T1"] },
  { id: "composer-2", source: "user", tiers: ["T2", "T5"] },
  { id: "gpt-5.6-terra", source: "user", tiers: ["T3"] },
];

const W = (plan, rel) => ((plan && plan.writes) || []).find((w) => w.relPath === rel) || {};
const claudeAnswers = (over = {}) => ({ version: 1, hosts: ["claude"], roster: { claude: packagedRoster("claude") }, cli: { claude: "claude" }, wrappers: "yes", decisions: {}, ...over });
const snapshot = (over = {}) => ({ agentsMd: fixture("agents-no-section.md"), claudeMd: "@AGENTS.md\n", existingFiles: new Map(), previousAnswers: null, sectionTemplate: TEMPLATE, eol: "\n", ...over });
const plan = (answers = claudeAnswers(), snap = snapshot(), now = SEPT, opts = {}, pkg = PKG) => routing.buildPlan(answers, REGISTRY, pkg, snap, now, opts);
// What applyPlan would leave on disk, as the next run's snapshot.
function afterApply(p, base) {
  const files = new Map(base.existingFiles);
  let agentsMd = base.agentsMd;
  let previousAnswers = base.previousAnswers;
  for (const w of (p && p.writes) || []) {
    if (w.content == null) continue;
    if (w.relPath === "AGENTS.md") agentsMd = w.content;
    else if (w.relPath === ANS_PATH) previousAnswers = JSON.parse(w.content);
    else files.set(w.relPath, w.content);
  }
  return { ...base, agentsMd, existingFiles: files, previousAnswers };
}
// A row of the registry table (the section also has a tier-definitions table).
const rowOf = (text, label) => {
  const lines = String(text).split("\n");
  const head = lines.findIndex((l) => l.startsWith("| Tier | Claude Code |"));
  return lines.slice(head).find((l) => l.startsWith(`| **${label}**`)) || "";
};
const cellsOf = (row) => row.split("|").slice(1, -1).map((c) => c.trim());

// ---- renderSection / renderRegistryTable (FR-4, §5.4) ----

test("renderSection: fills the eight template placeholders; a missing value throws naming it", () => {
  const keys = ["registryTable", "updated", "pinReasons", "antigravityDialMap", "authorAuditorNotes", "cliInvocationRow", "crossHostLine", "regenerateHint"];
  const ctx = Object.fromEntries(keys.map((k) => [k, `<<${k}>>`]));
  const out = routing.renderSection(TEMPLATE, ctx);
  assert.doesNotMatch(out, /\{\{/);
  for (const k of keys) assert.ok(out.includes(`<<${k}>>`), k);
  const { cliInvocationRow, ...partial } = ctx; // eslint-disable-line no-unused-vars
  assert.throws(() => routing.renderSection(TEMPLATE, partial), /cliInvocationRow/);
});

test("renderRegistryTable: no mapping -> 7 columns, packaged default cells, Fallback lists `id` (Host)", () => {
  const lines = routing.renderRegistryTable({}, REGISTRY, {}).split("\n");
  assert.equal(lines[0], "| Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |");
  assert.equal(lines.length, 8);
  for (const l of lines.slice(2)) assert.equal(cellsOf(l).length, 7, l);
  const t1 = cellsOf(lines[2]);
  assert.equal(t1[0], "**T1 Architect**");
  assert.equal(t1[1], "`opus` *(alias — always latest)*");
  assert.equal(t1[2], "`opencode-go/deepseek-v4-pro` (5,200 @ $15)");
  assert.equal(t1[5], "`<CONFIRM SLUG>` Claude Opus family");
  for (const f of ["`sonnet` (Claude Code)", "`opencode-go/glm-5.3` (OpenCode)", "`gpt-5.6-sol` (Codex)"]) assert.ok(t1[6].includes(f), f);
});

test("renderRegistryTable: a host with a mapping renders it; the others keep packaged defaults (C3)", () => {
  const t = routing.renderRegistryTable({ claude: deriveFor("claude", [{ id: "opus", source: "packaged" }, { id: "sonnet", source: "packaged" }]) }, REGISTRY, {});
  assert.equal(cellsOf(rowOf(t, "T5 Fast-Cheap"))[1], "`sonnet`");
  assert.ok(!cellsOf(rowOf(t, "T2 Coder"))[6].includes("(Claude Code)"));
  assert.equal(cellsOf(rowOf(t, "T2 Coder"))[4], "`gpt-5.6-luna`");
});

// ---- renderWrapper: five host shapes, four roles (FR-5, §5.5) ----

test("renderWrapper Claude Code: md-yaml, aliases from the mapping, Reviewer-only `tools`", () => {
  const m = deriveFor("claude", packagedRoster("claude"));
  const want = { leader: ["model: opus"], implementer: ["model: sonnet"], reviewer: ["model: opus", "tools: Read, Grep, Glob"], tester: ["model: sonnet"] };
  for (const role of ROLES) {
    assert.deepEqual(routing.renderWrapper("claude", role, m, {}, REGISTRY), { relPath: `.claude/agents/akili-${role}.md`, content: md(role, want[role]) }, role);
  }
});

test("renderWrapper OpenCode: slugs, no Reviewer restriction, agent dir overridable", () => {
  const m = deriveFor("opencode", packagedRoster("opencode"));
  const want = { leader: "opencode-go/deepseek-v4-pro", implementer: "opencode-go/deepseek-v4.1-flash", reviewer: "opencode-go/deepseek-v4-pro", tester: "opencode-go/deepseek-v4.1-flash" };
  for (const role of ROLES) {
    assert.deepEqual(routing.renderWrapper("opencode", role, m, {}, REGISTRY), { relPath: `.opencode/agent/akili-${role}.md`, content: md(role, [`model: ${want[role]}`]) }, role);
  }
  assert.equal(routing.renderWrapper("opencode", "leader", m, { agentDir: "config/agents" }, REGISTRY).relPath, "config/agents/akili-leader.md");
});

test("renderWrapper Antigravity: wrapperModel, subagent, mainAgent Leader-only, `tools` only when confirmed", () => {
  const m = deriveFor("antigravity", packagedRoster("antigravity"));
  const want = {
    leader: ["model: flash", "subagent: true", "mainAgent: true"],
    implementer: ["model: flash", "subagent: true", "mainAgent: false"],
    reviewer: ["model: pro", "subagent: true", "mainAgent: false"],
    tester: ["model: flash", "subagent: true", "mainAgent: false"],
  };
  for (const role of ROLES) {
    assert.deepEqual(routing.renderWrapper("antigravity", role, m, {}, REGISTRY), { relPath: `.agents/agents/akili-${role}/agent.md`, content: md(role, want[role]) }, role);
  }
  assert.equal(
    routing.renderWrapper("antigravity", "reviewer", m, { antigravityTools: ["view_file", "grep_search"] }, REGISTRY).content,
    md("reviewer", [...want.reviewer, "tools:", "  - view_file", "  - grep_search"]),
  );
});

test("renderWrapper Codex: TOML, triple-quoted developer_instructions, effort per role, Reviewer sandbox", () => {
  const m = deriveFor("codex", packagedRoster("codex"));
  const want = {
    leader: toml("leader", "gpt-5.6-terra", "high"),
    implementer: toml("implementer", "gpt-5.6-luna", "medium"),
    reviewer: toml("reviewer", "gpt-5.6-terra", "high", ['sandbox_mode = "read-only"']),
    tester: toml("tester", "gpt-5.6-luna", "medium"),
  };
  for (const role of ROLES) {
    assert.deepEqual(routing.renderWrapper("codex", role, m, {}, REGISTRY), { relPath: `.codex/agents/akili-${role}.toml`, content: want[role] }, role);
  }
});

test("renderWrapper Cursor: Reviewer `readonly: true`; bracket only for a confirmed rung (S1)", () => {
  const m = deriveFor("cursor", CURSOR_ROSTER);
  const want = { leader: ["model: claude-opus-4-7"], implementer: ["model: composer-2"], reviewer: ["model: gpt-5.6-terra", "readonly: true"], tester: ["model: composer-2"] };
  for (const role of ROLES) {
    assert.deepEqual(routing.renderWrapper("cursor", role, m, {}, REGISTRY), { relPath: `.cursor/agents/akili-${role}.md`, content: md(role, want[role]) }, role);
  }
  const reg = JSON.parse(JSON.stringify(REGISTRY));
  reg.hosts.cursor.models.push({ id: "composer-2", effortRungs: ["low", "medium"] }, { id: "gpt-5.6-terra", effortRungs: ["low", "medium", "high"] });
  assert.equal(routing.renderWrapper("cursor", "implementer", m, {}, reg).content, md("implementer", ["model: composer-2[effort=medium]"]));
  assert.equal(routing.renderWrapper("cursor", "reviewer", m, {}, reg).content, md("reviewer", ["model: gpt-5.6-terra[effort=high]", "readonly: true"]));
  assert.equal(routing.renderWrapper("cursor", "leader", m, {}, reg).content, md("leader", ["model: claude-opus-4-7"]));
});

test("renderWrapper: null for a cross-host Reviewer, a placeholder tier, an Antigravity id without wrapperModel", () => {
  const cross = deriveFor("claude", [{ id: "sonnet", source: "packaged" }], { crossHost: "antigravity" });
  assert.equal(routing.renderWrapper("claude", "reviewer", cross, {}, REGISTRY), null);
  assert.equal(routing.renderWrapper("cursor", "leader", deriveFor("cursor", CURSOR_ROSTER.slice(1)), {}, REGISTRY), null);
  const agy = deriveFor("antigravity", [{ id: "gemini-3.8-flash-medium", source: "packaged" }, { id: "claude-sonnet-4-6", source: "packaged" }]);
  assert.equal(agy.T3.primary, "claude-sonnet-4-6");
  assert.equal(routing.renderWrapper("antigravity", "reviewer", agy, {}, REGISTRY), null);
});

// ---- buildPlan (FR-1 dry-run vocabulary, FR-4, FR-5, FR-6, DD-8) ----

test("buildPlan first run: `appended`, four wrappers `created`, answers `created`, DD-9 hint", () => {
  const p = plan();
  assert.equal(W(p, "AGENTS.md").token, "appended");
  for (const r of ROLES) assert.equal(W(p, `.claude/agents/akili-${r}.md`).token, "created", r);
  assert.equal(W(p, ANS_PATH).token, "created");
  assert.equal(W(p, ".claude/agents/akili-reviewer.md").content, md("reviewer", ["model: opus", "tools: Read, Grep, Glob"]));
  assert.equal(p.exitCode, 0);
  assert.ok((p.hints || []).includes(DD9_HINT));
});

test("buildPlan section: `Updated:` from updatedAt, 7 columns, CLI row confirmed-only, since=v<pkg>, no branch pins", () => {
  const p = plan();
  const text = W(p, "AGENTS.md").content || "";
  assert.ok(text.startsWith(fixture("agents-no-section.md")));
  assert.match(text, /^<!-- akili:section id=model-routing since=v2\.31\.0 -->$/m);
  assert.match(text, /^Updated: 2026-09$/m);
  assert.match(text, /^\| Tier \| Claude Code \| OpenCode \| Antigravity \| Codex \| Cursor \| Fallback \|$/m);
  assert.match(text, /^\| `claude` \| `<CONFIRM>` \| `<CONFIRM>` \| `<CONFIRM>` \| `<CONFIRM>` \|$/m);
  assert.doesNotMatch(text, /Default Branch:|Integration Branch:|\{\{/);
  assert.equal(JSON.parse(W(p, ANS_PATH).content || "{}").updatedAt, "2026-09-15");
});

test("buildPlan idempotent re-run across a month boundary: every token `unchanged`, `no changes`, Updated kept (DD-8)", () => {
  const s1 = snapshot();
  const s2 = afterApply(plan(claudeAnswers(), s1, SEPT), s1);
  const p2 = plan(claudeAnswers(), s2, OCT);
  assert.equal((p2.writes || []).length, 6);
  for (const w of p2.writes) assert.equal(w.token, "unchanged", w.relPath);
  assert.ok((p2.reports || []).includes("no changes"));
  assert.ok(!(p2.hints || []).includes(DD9_HINT));
  assert.match(s2.agentsMd, /^Updated: 2026-09$/m);
});

test("buildPlan changed answers: AGENTS.md `replaced` with since=v<new pkg>, Updated and updatedAt move to `now`", () => {
  const s1 = snapshot();
  const s2 = afterApply(plan(claudeAnswers(), s1, SEPT), s1);
  const p3 = plan(claudeAnswers({ cli: {} }), s2, OCT, {}, "2.32.0");
  assert.equal(W(p3, "AGENTS.md").token, "replaced");
  assert.match(W(p3, "AGENTS.md").content || "", /^<!-- akili:section id=model-routing since=v2\.32\.0 -->$/m);
  assert.match(W(p3, "AGENTS.md").content || "", /^Updated: 2026-10$/m);
  assert.equal(W(p3, ANS_PATH).token, "replaced");
  assert.equal(JSON.parse(W(p3, ANS_PATH).content || "{}").updatedAt, "2026-10-02");
});

test("buildPlan `hosts: [cursor]` after a Claude run keeps the Claude column and drops its CLI cell (FR-4 C3)", () => {
  const s1 = snapshot();
  const s = afterApply(plan(claudeAnswers({ roster: { claude: [{ id: "opus", source: "packaged" }, { id: "sonnet", source: "packaged" }] } }), s1, SEPT), s1);
  const p = plan({ version: 1, hosts: ["cursor"], roster: { cursor: CURSOR_ROSTER }, cli: { cursor: "agent" }, wrappers: "yes", decisions: {} }, s, OCT);
  const text = W(p, "AGENTS.md").content || "";
  assert.equal(cellsOf(rowOf(text, "T5 Fast-Cheap"))[1], "`sonnet`");
  assert.deepEqual(JSON.parse(W(p, ANS_PATH).content || "{}").mapping.claude, s.previousAnswers.mapping.claude);
  assert.match(text, /^\| `<CONFIRM>` \| `<CONFIRM>` \| `<CONFIRM>` \| `<CONFIRM>` \| `agent` \|$/m);
});

test("buildPlan skip-by-default: existing Reviewer `skipped (exists; --force to replace)` + model drift; --force -> `overwritten`", () => {
  const existing = new Map([[".claude/agents/akili-reviewer.md", fixture("reviewer-existing.md")]]);
  const p = plan(claudeAnswers(), snapshot({ existingFiles: existing }));
  assert.equal(W(p, ".claude/agents/akili-reviewer.md").token, "skipped (exists; --force to replace)");
  assert.equal(W(p, ".claude/agents/akili-reviewer.md").note, "— model drift: file says haiku, mapping says opus");
  assert.equal(W(p, ".claude/agents/akili-leader.md").token, "created");
  const pf = plan(claudeAnswers(), snapshot({ existingFiles: existing }), SEPT, { force: true });
  assert.equal(W(pf, ".claude/agents/akili-reviewer.md").token, "overwritten");
});

test("buildPlan `wrappers: no` -> every wrapper `skipped (wrappers=no)`, nothing to write", () => {
  const p = plan(claudeAnswers({ wrappers: "no" }));
  for (const r of ROLES) {
    assert.equal(W(p, `.claude/agents/akili-${r}.md`).token, "skipped (wrappers=no)", r);
    assert.equal(W(p, `.claude/agents/akili-${r}.md`).content, null, r);
  }
});

test("buildPlan single-model roster -> `skipped (author ≠ auditor unsatisfiable)` ×4, exit 0, T3 note in the table", () => {
  const p = plan(claudeAnswers({ roster: { claude: [{ id: "sonnet", source: "packaged" }] } }));
  for (const r of ROLES) assert.equal(W(p, `.claude/agents/akili-${r}.md`).token, "skipped (author ≠ auditor unsatisfiable)", r);
  assert.equal((p.authorAuditor || {}).claude, "unsatisfiable");
  assert.equal(p.exitCode, 0);
  assert.ok(cellsOf(rowOf(W(p, "AGENTS.md").content, "T3 Auditor"))[1].includes("author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host"));
});

test("buildPlan cross-host T3: three wrappers, no Reviewer, dispatch reported with the unselected target", () => {
  const p = plan(claudeAnswers({ roster: { claude: [{ id: "sonnet", source: "packaged" }] }, crossHost: { claude: "antigravity" } }));
  for (const r of ["leader", "implementer", "tester"]) assert.equal(W(p, `.claude/agents/akili-${r}.md`).token, "created", r);
  assert.equal(W(p, ".claude/agents/akili-reviewer.md").token, undefined);
  assert.equal((p.authorAuditor || {}).claude, "cross-host: antigravity");
  assert.ok((p.reports || []).includes("Claude Code Reviewer: dispatched cross-host to Antigravity — no wrapper written (Antigravity is not selected in this run)"));
  assert.match(W(p, "AGENTS.md").content || "", /Claude Code T3 Reviewer → Antigravity \(not selected in this run\)/);
});

test("buildPlan AGENTS.md states: (d) `created` + constitution hint; (e) refused, wrappers and answers still planned; (a′) refused", () => {
  const pd = plan(claudeAnswers(), snapshot({ agentsMd: null }));
  assert.equal(W(pd, "AGENTS.md").token, "created");
  assert.ok((pd.hints || []).includes("run /akili-constitution to complete AGENTS.md"));
  const pe = plan(claudeAnswers(), snapshot({ agentsMd: fixture("agents-malformed.md") }));
  assert.equal(W(pe, "AGENTS.md").token, "refused (malformed fence)");
  assert.equal(W(pe, "AGENTS.md").content, null);
  assert.equal(W(pe, ".claude/agents/akili-leader.md").token, "created");
  assert.equal(W(pe, ANS_PATH).token, "created");
  assert.equal(pe.exitCode, 1);
  const s1 = snapshot();
  const s2 = afterApply(plan(claudeAnswers(), s1, SEPT), s1);
  const edited = { ...s2, agentsMd: s2.agentsMd.replace("Updated: 2026-09", "Updated: 2026-08") };
  const pa = plan(claudeAnswers({ cli: {} }), edited, OCT);
  assert.equal(W(pa, "AGENTS.md").token, TOKEN_REFUSED_EDIT);
  assert.match(W(pa, "AGENTS.md").diff || "", /^-Updated: 2026-08$/m);
});

test("buildPlan (f) stray heading reported on the AGENTS.md line", () => {
  const s1 = snapshot();
  const s2 = afterApply(plan(claudeAnswers(), s1, SEPT), s1);
  const mixed = { ...s2, agentsMd: "# Agent Guidance\n\n## Model Routing\n\nstray\n\n" + s2.agentsMd.slice(s2.agentsMd.indexOf("<!-- akili:section")) };
  const p = plan(claudeAnswers(), mixed, OCT);
  assert.equal(W(p, "AGENTS.md").token, "unchanged");
  assert.equal(W(p, "AGENTS.md").note, '+ stray "## Model Routing" heading at line 3 — remove it');
});

test("buildPlan CLAUDE.md with a Model Routing section -> one report line, never a write", () => {
  const p = plan(claudeAnswers(), snapshot({ claudeMd: fixture("claude-with-routing.md") }));
  assert.ok((p.reports || []).includes("CLAUDE.md carries a Model Routing section — move it to AGENTS.md"));
  assert.ok(!(p.writes || []).some((w) => /CLAUDE\.md$/.test(w.relPath)));
  assert.ok((p.writes || []).length > 0);
});

test("buildPlan restrictions and effort: omitted + reported (OpenCode, Antigravity, Cursor); Tester collapse noted", () => {
  const answers = {
    version: 1, hosts: ["opencode", "antigravity", "codex", "cursor"], wrappers: "yes", cli: {}, decisions: {},
    roster: { opencode: packagedRoster("opencode"), antigravity: packagedRoster("antigravity"), codex: packagedRoster("codex"), cursor: CURSOR_ROSTER },
  };
  const p = plan(answers);
  const reports = p.reports || [];
  for (const line of [
    "OpenCode Reviewer: read-only by instruction (restriction shape unconfirmed — Step 8E rule 2)",
    "Antigravity Reviewer: read-only by instruction (tools omitted — names unconfirmed)",
    "Antigravity: in-session `/agents` lists only `akili-leader` — that is the success condition",
    "Cursor: effort bracket omitted — rung unconfirmed",
    "Codex Tester: same model as the Implementer (`gpt-5.6-luna`, T2 primary) — Step 8E default; Rule 1 allows it",
  ]) assert.ok(reports.includes(line), line);
  assert.doesNotMatch(W(p, ".agents/agents/akili-reviewer/agent.md").content || "", /tools:/);
  const dec = JSON.parse(W(p, ANS_PATH).content || "{}").decisions || {};
  assert.equal((dec.antigravity || {}).restriction, "omitted: names unconfirmed");
  assert.equal((dec.cursor || {}).effortBracket, "omitted: rung unconfirmed");
  const pt = plan({ ...answers, decisions: { antigravity: { antigravityTools: ["view_file", "grep_search"] } } });
  assert.match(W(pt, ".agents/agents/akili-reviewer/agent.md").content || "", /^tools:\n {2}- view_file\n {2}- grep_search$/m);
  assert.ok(!(pt.reports || []).some((l) => l.startsWith("Antigravity Reviewer: read-only")));
  assert.equal(JSON.parse(W(pt, ANS_PATH).content || "{}").decisions.antigravity.restriction, "applied");
});

test("buildPlan placeholdersByColumn: the packaged default carries 10 (OpenCode 1, Antigravity 1, Codex 2, Cursor 6 — P-27)", () => {
  assert.deepEqual(plan().placeholdersByColumn, { claude: 0, opencode: 1, antigravity: 1, codex: 2, cursor: 6 });
});

test("buildPlan stale ids: a mapping id absent from the packaged roster is reported, never edited", () => {
  const s1 = snapshot();
  const s2 = afterApply(plan(claudeAnswers(), s1, SEPT), s1);
  // An unselected OpenCode column kept from an earlier run, holding an id the package dropped.
  const opencode = deriveFor("opencode", packagedRoster("opencode"));
  opencode.T1 = { primary: "opencode-go/old-model", fallback: "—", note: "" };
  const answers = claudeAnswers({ mapping: { opencode }, roster: { claude: packagedRoster("claude"), opencode: [{ id: "opencode-go/old-model", source: "packaged" }] } });
  const p = plan(answers, s2, OCT);
  assert.deepEqual(p.stale, ["stale? opencode-go/old-model not in packaged roster (2026-09-17)"]);
  assert.equal(W(p, "AGENTS.md").token, "replaced");
  assert.equal(cellsOf(rowOf(W(p, "AGENTS.md").content, "T1 Architect"))[2], "`opencode-go/old-model`");
});

test("buildPlan answers file: only §5.2 fields, no run results; sectionBytes = the fenced block's byte length", () => {
  const p = plan();
  const ans = JSON.parse(W(p, ANS_PATH).content || "{}");
  assert.deepEqual(Object.keys(ans).sort(), ["authorAuditor", "cli", "decisions", "generatedBy", "hosts", "mapping", "roster", "unselectedHosts", "updatedAt", "version", "wrappers"]);
  assert.equal(ans.unselectedHosts, "keep-previous-else-packaged");
  assert.equal(ans.generatedBy, PKG);
  const text = W(p, "AGENTS.md").content || "";
  const block = text.slice(text.indexOf("<!-- akili:section"), text.indexOf(CLOSE) + CLOSE.length);
  assert.equal(p.sectionBytes, Buffer.byteLength(block, "utf8"));
});

test("buildPlan dated id: rendered with a pin marker and its recorded reason (C9)", () => {
  const roster = [...packagedRoster("claude"), { id: "claude-opus-4-6-20260101", source: "user", tiers: ["T1"], reason: "freeze for the audit window" }];
  const text = W(plan(claudeAnswers({ roster: { claude: roster } })), "AGENTS.md").content || "";
  assert.ok(cellsOf(rowOf(text, "T1 Architect"))[1].startsWith("`claude-opus-4-6-20260101` [pin 1]"));
  assert.ok(text.includes("[pin 1] `claude-opus-4-6-20260101` (Claude Code): freeze for the audit window"));
});

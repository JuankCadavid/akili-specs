"use strict";

// @akili-spec changes/akili-security-followup (Suite 2, /akili-test)
//
// Text-contract guard for the user-facing restatements of `/akili-security`
// (FR-10: "Every restatement of a changed rule SHALL match the command").
// The command text itself is pinned by test/akili-security-command.test.js;
// this file pins the docs that restate it, which the author loop checked only
// by manual grep. Expected wordings are literals copied from requirements.md
// at spec commit 4e566ba (FR-1, FR-2, FR-4, FR-6..FR-10, R-B), or read from
// the vendored source of truth (.claude/skills/security-audit/SKILL.md) --
// never from the doc under test. Nothing here reads docs/specs/ at runtime.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8").replace(/\r\n/g, "\n");
}

// `## Heading` up to the next `## ` heading (or end of file).
function section(text, heading) {
  const start = text.indexOf(`\n## ${heading}\n`);
  assert.ok(start >= 0, `section "## ${heading}" not found`);
  const rest = text.slice(start + 1);
  const end = rest.slice(3).search(/\n## /);
  return end < 0 ? rest : rest.slice(0, end + 3);
}

const README = read("README.md");
const FLOW = read("docs/flow.md");
const CMD_DOC = read("docs/commands/akili-security.md");
const SKILL_DOC = read("docs/skills/security-audit.md");
const CMDS_README = read("docs/commands/README.md");
const SKILL = read(".claude/skills/security-audit/SKILL.md");
const SKILL_AKILI = section(SKILL, "AKILI-SPECS Integration");

// Lines of a broad doc that talk about /akili-security or its outputs, so a
// phrase another command legitimately uses elsewhere cannot trip the guard.
const securityLines = (text) =>
  text.split("\n").filter((l) => /akili-security|security-audit|audits\/security-/.test(l));

// FR-10 scope: the five slug restatement sites named in requirements.md FR-10.
const SLUG_SITES = {
  "README.md": README,
  "docs/flow.md": FLOW,
  "docs/commands/akili-security.md": CMD_DOC,
  "docs/skills/security-audit.md": SKILL_DOC,
  "SKILL.md ## AKILI-SPECS Integration": SKILL_AKILI,
};

// FR-7 scope: the slug sites plus the commands index (docs/specs/ excluded).
const RUN_DIR_SITES = {
  "README.md (/akili-security lines)": securityLines(README).join("\n"),
  "docs/flow.md (/akili-security lines)": securityLines(FLOW).join("\n"),
  "docs/commands/README.md (/akili-security lines)": securityLines(CMDS_README).join("\n"),
  "docs/commands/akili-security.md": CMD_DOC,
  "docs/skills/security-audit.md": SKILL_DOC,
  "SKILL.md ## AKILI-SPECS Integration": SKILL_AKILI,
};

// ---------------------------------------------------------------- FR-8 / FR-10 slug

test("FR-8 / FR-10 Slug restated elsewhere: every routing-slug site reads -r<N>-s<n>", () => {
  for (const [name, text] of Object.entries(SLUG_SITES)) {
    assert.match(text, /bugfix\/security-<(?:YYYY-MM-DD|date)>-r<N>-s<n>/, `${name} has no routing slug of the form bugfix/security-<date>-r<N>-s<n>`);
  }
});

test("FR-8 / FR-10 BUT: no -s<n> occurrence in any restatement lacks the -r<N> prefix (every hit enumerated)", () => {
  const stale = [];
  for (const [name, text] of Object.entries(SLUG_SITES)) {
    for (const m of text.matchAll(/-s<n>/g)) {
      if (text.slice(m.index - 5, m.index) !== "-r<N>") {
        const line = text.slice(0, m.index).split("\n").length;
        stale.push(`${name}:${line}: …${text.slice(Math.max(0, m.index - 40), m.index + 5)}`);
      }
    }
  }
  assert.deepEqual(stale, [], `a routing slug restatement still reads -s<n> without -r<N>:\n${stale.join("\n")}`);
});

test("FR-8 / FR-10 BUT: no restated slug carries a non-template suffix (e.g. a title or path after -s<n>)", () => {
  const bad = [];
  for (const [name, text] of Object.entries(SLUG_SITES)) {
    for (const m of text.matchAll(/bugfix\/security-[^\s`)]*/g)) {
      if (!/^bugfix\/security-<(?:YYYY-MM-DD|date)>-r<N>-s<n>$/.test(m[0])) bad.push(`${name}: ${m[0]}`);
    }
  }
  assert.deepEqual(bad, [], `a restated slug is not exactly bugfix/security-<date>-r<N>-s<n>:\n${bad.join("\n")}`);
});

// ---------------------------------------------------------------- FR-7 / FR-10 run directory

test("FR-7 / FR-10 BUT: no restatement keeps an in-target run-directory option (phrase family keyed on the obligation)", () => {
  const family = [
    /ignored in-target/i,
    /in-target (?:run )?directory/i,
    /ignored directory/i,
    /ignored path/i,
    /outside the target by default/i,
    /repo-relative/i,
    /check-ignore/i,
    /inside the target[^.|]*\bif ignored\b/i,
  ];
  const hits = [];
  for (const [name, text] of Object.entries(RUN_DIR_SITES)) {
    text.split("\n").forEach((l, i) => {
      for (const re of family) if (re.test(l)) hits.push(`${name} line ${i + 1} matches ${re}: ${l.slice(0, 140)}`);
    });
  }
  assert.deepEqual(hits, [], `a restatement still offers an in-target run directory:\n${hits.join("\n")}`);
});

test("FR-7 / FR-10: each run-directory restatement says the run directory is always outside the target", () => {
  const sites = {
    "README.md": securityLines(README),
    "docs/flow.md": securityLines(FLOW),
    "docs/commands/README.md": securityLines(CMDS_README),
  };
  for (const [name, lines] of Object.entries(sites)) {
    const runDirLines = lines.filter((l) => /run directory/.test(l));
    assert.ok(runDirLines.length > 0, `${name} no longer restates where the run directory lives`);
    for (const l of runDirLines) {
      assert.match(l, /run directory \(always outside the target\)/, `${name} restates the run directory without "always outside the target": ${l.slice(0, 140)}`);
    }
  }
  const row = CMD_DOC.split("\n").find((l) => l.startsWith("| Full audit artifacts |"));
  assert.ok(row, "docs/commands/akili-security.md lost its Full audit artifacts row");
  assert.match(row, /Run directory, always outside the target/, "command page Outputs row no longer says always outside the target");
  assert.match(row, /refused when inside the target or containing it/, "command page Outputs row lost the two-way --out refusal");
});

test("FR-7 AND IT MUST: the command page names only the two run-path forms (~/… and <external>/run-<N>)", () => {
  assert.match(CMD_DOC, /The run path appears as `~\/…` \(under HOME\) or `<external>\/run-<N>` \(anywhere else\)\./,
    "command page no longer names exactly the two run-path forms");
});

// ---------------------------------------------------------------- FR-4 / FR-10 controls

// Expected text comes from the vendored source of truth (SKILL.md "Universal
// execution safety"), not from the doc. The doc quotes each control as an
// inline "…" string, so the bullet's list terminator ("; and", ";" or ".")
// is not part of the quoted control; every word of it is.
const safety = section(SKILL, "Universal execution safety");
const SKILL_BULLETS = safety.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
const UPSTREAM_EXPOSURE_START = "Never expose a retained output directory";

test("FR-4 / FR-10 (precondition): SKILL.md still holds exactly four execution-safety control bullets", () => {
  assert.equal(SKILL_BULLETS.length, 4, `SKILL.md Universal execution safety has ${SKILL_BULLETS.length} bullets, expected 4`);
});

test("FR-4 / FR-10: the command page quotes each of upstream's four control bullets in full, as a whole quoted string", () => {
  const residual = CMD_DOC.split("\n").find((l) => l.startsWith("| Static-only by default |"));
  assert.ok(residual, "command page lost its Static-only by default row");
  for (const b of SKILL_BULLETS) {
    const control = b.replace(/(?:; and|;|\.)$/, "");
    assert.ok(residual.includes(`"${control}"`), `command page dropped, truncated or paraphrased an upstream control (expected the full quoted string): "${control}"`);
  }
});

test("FR-4 / FR-10: the command page quotes upstream's exposure rule verbatim, full sentence", () => {
  const at = safety.indexOf(UPSTREAM_EXPOSURE_START);
  assert.ok(at >= 0, "SKILL.md no longer holds the exposure rule");
  const exposure = safety.slice(at, safety.indexOf(".", safety.indexOf("target code", at)) + 1);
  assert.ok(exposure.endsWith("to target code."), `could not extract the full exposure sentence from SKILL.md: ${exposure}`);
  assert.ok(CMD_DOC.includes(`"${exposure}"`), `command page lost or altered upstream's exposure rule: "${exposure}"`);
});

test("FR-4 / FR-10 BUT: no restatement paraphrases the controls as 'all four controls' / 'four upstream controls'", () => {
  for (const [name, text] of Object.entries({ ...RUN_DIR_SITES })) {
    assert.doesNotMatch(text, /all four controls|four upstream controls|four controls/i, `${name} paraphrases the controls by count instead of quoting them`);
  }
});

// ---------------------------------------------------------------- FR-2 / FR-10 restore

test("FR-2 / FR-10: the command page's restore restatement keeps all three containment terms and no --force", () => {
  const row = CMD_DOC.split("\n").find((l) => l.startsWith("| 0. Preflight |"));
  assert.ok(row, "command page lost its Preflight row");
  assert.match(row, /restore is offered only when the skills-root entry or its resolved path, and the restore destination, are each neither inside the target nor an ancestor of it/,
    "Preflight restatement dropped a containment term (entry, resolved path, destination) or the two-way rule");
  assert.match(row, /restore the pinned copy without `--force`/, "Preflight restatement no longer says restore is without --force");
  assert.match(row, /a restore ends the command before the plan gate so you re-run in a fresh session/, "Preflight restatement lost 'restore ends the command; re-run in a fresh session'");
});

test("FR-2 / FR-10 BUT: no /akili-security restatement offers `install --force` or an npx restore", () => {
  for (const [name, text] of Object.entries(RUN_DIR_SITES)) {
    assert.doesNotMatch(text, /install --force|--force` to restore|npx akili-specs[^\n]*--force/, `${name} offers a --force install`);
  }
});

// ---------------------------------------------------------------- FR-6 / FR-10 no git

test("FR-6 / FR-10 BUT: no restatement tells the agent to run git status / check-ignore / rev-parse in the target", () => {
  const sites = {
    "docs/commands/akili-security.md": CMD_DOC,
    "docs/skills/security-audit.md": SKILL_DOC,
    "docs/flow.md (/akili-security lines)": securityLines(FLOW).join("\n"),
    "README.md (/akili-security lines)": securityLines(README).join("\n"),
  };
  for (const [name, text] of Object.entries(sites)) {
    assert.doesNotMatch(text, /git (status|check-ignore|rev-parse)/, `${name} tells the agent to run a git command in the target`);
  }
});

test("FR-6 / FR-10: the command page says the source ref is read with no git command and the dirty state is asked", () => {
  const row = CMD_DOC.split("\n").find((l) => l.startsWith("| 0. Preflight |"));
  assert.match(row, /source ref and `<skill-dir>` with no git command \(the ref is read from files as data; what cannot be read is `not determined`\)/,
    "Preflight restatement no longer says the ref is read from files with no git command, `not determined` otherwise");
  assert.match(CMD_DOC.split("\n").find((l) => l.startsWith("| 1. Plan gate |")) || "", /the dirty state is asked of you here/,
    "Plan gate restatement no longer says the dirty state is asked of the user");
});

// ---------------------------------------------------------------- FR-1

test("FR-1 Pin sites agree AND: the re-sync procedure's pin-update step names \"the command's Step 0.1 pin\"", () => {
  const resync = section(SKILL_DOC, "Re-sync procedure");
  const stepLine = resync.split("\n").find((l) => l.startsWith("4. Update the pin everywhere it appears"));
  assert.ok(stepLine, "re-sync procedure lost its pin-update step");
  assert.match(stepLine, /the command's Step 0\.1 pin/, "re-sync pin-update step no longer names \"the command's Step 0.1 pin\"");
  assert.match(stepLine, /`UPSTREAM_SHA`/, "re-sync pin-update step no longer names UPSTREAM_SHA");
});

// ---------------------------------------------------------------- FR-9

test("FR-9 Re-sync at a pin with no Windows path: the re-sync procedure has the Windows gate step", () => {
  const resync = section(SKILL_DOC, "Re-sync procedure");
  const gate = resync.split("\n").find((l) => /^\d\. \*\*Windows gate\.\*\*/.test(l));
  assert.ok(gate, "re-sync procedure lost its Windows gate step");
  assert.match(gate, /still require `O_NOFOLLOW` and `O_NONBLOCK`, keep the preflight stop and the Windows test branch/, "Windows gate no longer keeps the stop and test branch while the validators need the constants");
  assert.match(gate, /candidate branch that removes the `win32` short-circuit/, "Windows gate lost the candidate-branch step");
  assert.match(gate, /Remove the preflight stop only when that branch passes the non-fallback cases on both Windows CI legs/, "Windows gate no longer lifts the stop only on both Windows CI legs passing");
  assert.match(gate, /Never add a wrapper, shim or patch to a vendored file/, "Windows gate lost the no-wrapper/shim/patch rule");
});

test("FR-9 BUT: the docs never present a wrapper, shim or validator patch as the Windows path; the upstream request is not filed", () => {
  const platform = section(SKILL_DOC, "Platform support");
  assert.match(platform, /deliberately not patched/, "Platform support no longer says the validators are deliberately not patched");
  assert.match(platform, /no wrapper, shim or patch to a vendored file ever substitutes for it/, "Platform support lost the no-wrapper/shim/patch rule");
  assert.match(platform, /it is not filed/, "Platform support no longer says the upstream request is not filed by the agent");
  const offers = (SKILL_DOC + "\n" + CMD_DOC).split(/(?<=\.)\s+/)
    .filter((s) => /(?:use|add|apply) (?:a|the) (?:wrapper|shim|patch)/i.test(s) && !/\bNever\b|\bnot\b|\bno\b/.test(s));
  assert.deepEqual(offers, [], `a doc suggests a wrapper, shim or patch for Windows:\n${offers.join("\n")}`);
});

// ---------------------------------------------------------------- FR-10 R-B

test("FR-10 R-B: the provenance check is stated necessary but not sufficient, because a hostile copy can forge adapted-for and source", () => {
  const resync = section(SKILL_DOC, "Re-sync procedure");
  assert.match(resync, /The provenance check is necessary but not sufficient\./, "skill doc no longer says the provenance check is necessary but not sufficient");
  assert.match(resync, /a hostile copy can forge `adapted-for` and `source`/, "skill doc no longer says a hostile copy can forge adapted-for and source");
  assert.match(resync, /a matching pin does not prove the loaded body is the vendored one/, "skill doc no longer says a matching pin proves nothing about the body");
});

test("FR-10 R-B BUT: no doc claims the pin/provenance check is sufficient or detects a hostile copy", () => {
  for (const [name, text] of Object.entries({ "docs/skills/security-audit.md": SKILL_DOC, "docs/commands/akili-security.md": CMD_DOC })) {
    const claims = text.split("\n").filter((l) =>
      /(?:provenance|pin)[^.]*\b(?:is|are) sufficient/i.test(l) ||
      /(?:provenance|pin)[^.]*\b(?:catches|detects|blocks|stops) (?:a |any )?(?:hostile|malicious|forged)/i.test(l) ||
      /(?:proves|guarantees) (?:the )?(?:copy|body|skill) is (?:the vendored|genuine|authentic)/i.test(l));
    const real = claims.filter((l) => !/not sufficient/.test(l) && !/not a hostile one/.test(l));
    assert.deepEqual(real, [], `${name} claims the provenance check suffices against a hostile copy:\n${real.join("\n")}`);
  }
});

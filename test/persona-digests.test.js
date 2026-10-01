"use strict";

// T5 / FR-3 / DD-3: the `legacy` seed generator (bin/persona.js's
// seedLegacySections) and the packaged digests.json it produced. Pure-
// function tests only, plus one assertion against the shipped file.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { parsePersona, hashBody, hashHead, hashOpen, seedLegacySections, sectionDigestEntry } = require("../bin/persona.js");

const TEMPLATE_PATH = path.join(__dirname, "..", ".claude", "templates", "implementer.md");
const FIXTURE_PATH = path.join(__dirname, "fixtures", "personas", "v2.29.0-template-verbatim.md");
const DIGESTS_PATH = path.join(__dirname, "..", ".claude", "templates", "digests.json");

const templateText = fs.readFileSync(TEMPLATE_PATH, "utf8");
const template = parsePersona(templateText);
const v2290Text = fs.readFileSync(FIXTURE_PATH, "utf8");

// §5.3 (amended at execute time, before T4): "each section entry is an
// object { body, head, open } ... head the sha256 of the section's first
// line normalized ... open the sha256 of the first 40 normalized characters
// of its opening sentence." Independent of the code under test: builds the
// expected object by hand from a plain text span, never by calling
// hashBody/hashHead/hashOpen through seedLegacySections itself.
function expectedEntry(span) {
  const lines = span.split("\n");
  const openLine = lines.slice(1).find((l) => l.trim() !== "");
  return {
    body: hashBody(span),
    head: hashHead(lines[0]),
    open: openLine ? hashOpen(openLine) : null,
  };
}

test("seedLegacySections: implementer.md's v2.29.0 tag — item 4 (verification) hashes to the independently line-extracted span", () => {
  // Independent of the code under test: the span is picked by hand from a
  // `grep -n` read of the fixture (item 4 starts at line 52; the trailing
  // blank line + `---` before "## Reporting Completion" at line 93 are
  // trimmed back to the real last content line, 89) — never by calling
  // buildCandidates/extentEnd, which is exactly what this test is proving.
  const lines = v2290Text.split("\n");
  const expectedSpan = lines.slice(51, 89).join("\n"); // 0-indexed: lines 52..89 (1-indexed)

  const entries = seedLegacySections(v2290Text, template.sections);
  assert.deepEqual(entries.verification, expectedEntry(expectedSpan));
});

test("seedLegacySections: implementer.md's v2.29.0 tag — item 4's entry is an object whose head/open equal hashHead/hashOpen of the same cut's first line and opening sentence", () => {
  const lines = v2290Text.split("\n");
  const expectedSpan = lines.slice(51, 89).join("\n");
  const spanLines = expectedSpan.split("\n");
  const expectedHead = hashHead(spanLines[0]);
  const expectedOpenLine = spanLines.slice(1).find((l) => l.trim() !== "");
  const expectedOpen = hashOpen(expectedOpenLine);

  const entries = seedLegacySections(v2290Text, template.sections);
  assert.ok(entries.verification && typeof entries.verification === "object", "entry must be an object, not a bare string");
  assert.equal(entries.verification.head, expectedHead);
  assert.equal(entries.verification.open, expectedOpen);
});

test("seedLegacySections: item-level ids are claimed by ordinal, restricted to candidates before the tag's first heading — a nested numbered list inside a later `##` section never steals a slot", () => {
  const tagText = [
    "# Role: AKILI Software Implementer",
    "",
    "## 🎯 Primary Instructions",
    "",
    "1.  **First item body.**",
    "    text",
    "2.  **Second item body.**",
    "    text",
    "",
    "## 📝 Reporting Completion",
    "",
    "1.  **Task Completed:** nested item, not a Primary Instructions item",
    "2.  **Verification Command Run:** also nested",
    "3.  **Verification Output/Evidence:** also nested",
    "4.  **Not Done / Assumptions:** also nested",
  ].join("\n");

  // Fake "today's template" sections: 4 item ids (only 2 exist in tagText's
  // Primary Instructions block) plus the reporting heading id.
  const fakeSections = [
    { id: "context-alignment", since: "v2.30.0", body: "1.  **Strict Context Alignment (Context & Skills):**\nbody" },
    { id: "scope-discipline", since: "v2.30.0", body: "2.  **Scope Discipline (Both Directions):**\nbody" },
    { id: "craft", since: "v2.30.0", body: "3.  **Aesthetics & Coding Best Practices:**\nbody" },
    { id: "verification", since: "v2.30.0", body: "4.  **Verification Rigor & Self-Correction (Pre-Review):**\nbody" },
    { id: "reporting", since: "v2.30.0", body: "## 📝 Reporting Completion\nbody" },
  ];

  const entries = seedLegacySections(tagText, fakeSections);

  assert.deepEqual(entries["context-alignment"], expectedEntry("1.  **First item body.**\n    text"));
  assert.deepEqual(entries["scope-discipline"], expectedEntry("2.  **Second item body.**\n    text"));
  // Ordinals 3 and 4 have no candidate in tagText's Primary Instructions
  // block (only 2 items) — must get NO entry, never the nested "3." / "4."
  // lines from Reporting's own numbered list.
  assert.equal(entries["craft"], undefined);
  assert.equal(entries["verification"], undefined);
  // The heading id is still claimed correctly, by heading equality, even
  // though its body holds numbered lines that also match the item regex.
  assert.deepEqual(
    entries["reporting"],
    expectedEntry(
      [
        "## 📝 Reporting Completion",
        "",
        "1.  **Task Completed:** nested item, not a Primary Instructions item",
        "2.  **Verification Command Run:** also nested",
        "3.  **Verification Output/Evidence:** also nested",
        "4.  **Not Done / Assumptions:** also nested",
      ].join("\n")
    )
  );
});

test("seedLegacySections: a `##` id whose heading text differs from today's gets no entry (DD-3: 'a tag whose template lacks a section simply has no entry')", () => {
  const tagText = [
    "## 🎯 Primary Instructions",
    "",
    "1.  **Only item.**",
    "    text",
    "",
    "## Some Other Heading Entirely",
    "",
    "prose",
  ].join("\n");

  const fakeSections = [
    { id: "only-item", since: "v2.30.0", body: "1.  **Only item.**\nbody" },
    { id: "reporting", since: "v2.30.0", body: "## 📝 Reporting Completion\nbody" },
  ];

  const entries = seedLegacySections(tagText, fakeSections);
  assert.deepEqual(entries["only-item"], expectedEntry("1.  **Only item.**\n    text"));
  assert.equal(entries["reporting"], undefined, "heading text does not match today's; no entry, never a wrong one");
});

test("digests.json (packaged): legacy.implementer.verification at v2.29.0 is an object {body,head,open} equal to hashing the v2.29.0 template's item 4 by the level rule", () => {
  const digests = JSON.parse(fs.readFileSync(DIGESTS_PATH, "utf8"));
  assert.ok(digests.legacy && digests.legacy.implementer, "legacy.implementer must exist");
  assert.ok(digests.legacy.implementer.verification, "legacy.implementer.verification must exist");
  const fromFile = digests.legacy.implementer.verification["v2.29.0"];
  assert.ok(fromFile, "legacy.implementer.verification must carry a v2.29.0 entry");
  assert.equal(typeof fromFile, "object", "the shipped entry must be the §5.3 object shape, not a bare string");

  const entries = seedLegacySections(v2290Text, template.sections);
  assert.deepEqual(fromFile, entries.verification, "the shipped digest must equal the generator's own output for this tag");
});

// Release step (DD-3): `writeReleaseDigests` in scripts/release.js builds
// each `releases[<version>][<role>][<id>]` entry from the same object shape
// — tested here on the pure part (`sectionDigestEntry`, the per-section
// entry builder persona.js exports for both generators to share) rather than
// by requiring scripts/release.js, which runs `main()` on load and touches
// git/package.json/CHANGELOG — never safe to import inside `npm test`
// (disqualifier: the release step must never run in the working checkout).
test("sectionDigestEntry: the release step's per-section entry shape is {body, head, open}, matching hashBody/hashHead/hashOpen of the section's own text — not a bare string", () => {
  const verificationSection = template.sections.find((s) => s.id === "verification");
  const entry = sectionDigestEntry(verificationSection.body);
  assert.deepEqual(entry, expectedEntry(verificationSection.body));
});

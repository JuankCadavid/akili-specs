#!/usr/bin/env node
"use strict";

// @akili-spec changes/akili-review
//
// Validates a review document (findings.json) against review-schema.json and the
// semantic rules JSON Schema cannot express (design 5.2). Plain Node core, no
// dependencies, no no-follow open flag, so it runs on Node >= 18 including native Windows.
//
// Usage: node validate-review.cjs <doc> [--manifest <manifest.json>] [--threshold <0-100>]
// Exit:  0 valid | 1 invalid (every violation printed with its index and field) | 2 usage

const fs = require("fs");
const path = require("path");

const SCHEMA_PATH = path.join(__dirname, "review-schema.json");
const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const MAX_ERRORS = 100;
const MAX_TOP_RISKS = 3;
const ID_PATTERN = /^F-\d+$/;
const FILE_CHARSET = /^[A-Za-z0-9._/@+-]+$/;
const UNSAFE_CHARS = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f\\u2028\\u2029]", "g");
const LIMITS = Object.freeze({ evidence: [1, 1200], why: [1, 800], fix: [0, 800] });

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const charLength = (value) => Array.from(value).length;

function typeOf(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function matchesType(value, type) {
  const actual = typeOf(value);
  return actual === type || (type === "number" && actual === "integer");
}

// Diagnostics echo agent-supplied text into job logs: quote it clipped and with
// control characters escaped.
function show(value) {
  const text = typeof value === "string" ? JSON.stringify(value.slice(0, 60)) : JSON.stringify(value);
  const clipped = text === undefined ? typeof value : text.length > 80 ? `${text.slice(0, 80)}...` : text;
  return clipped.replace(UNSAFE_CHARS, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

function join(base, key) {
  return base === "" ? key : `${base}.${key}`;
}

// Interprets the strict subset review-schema.json is limited to:
// type, enum, properties, required, items, additionalProperties.
function checkSchema(value, schema, where, errors) {
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : null;
  if (types && !types.some((t) => matchesType(value, t))) {
    errors.push(`${where || "(document)"}: expected ${types.join(" or ")}, got ${typeOf(value)}`);
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${where}: ${show(value)} is not one of ${schema.enum.map((v) => JSON.stringify(v)).join(", ")}`);
    return;
  }
  if (typeOf(value) === "object" && schema.properties) {
    for (const key of schema.required || []) {
      if (!hasOwn(value, key)) errors.push(`${join(where, key)}: required property is missing`);
    }
    for (const key of Object.keys(value)) {
      if (!hasOwn(schema.properties, key)) {
        if (schema.additionalProperties === false) errors.push(`${join(where, key)}: unexpected property`);
        continue;
      }
      checkSchema(value[key], schema.properties[key], join(where, key), errors);
    }
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) => checkSchema(item, schema.items, `${where}[${index}]`, errors));
  }
}

function checkFilePath(file) {
  if (file === "") return "must not be empty";
  if (!FILE_CHARSET.test(file)) return "contains a character outside [A-Za-z0-9._/@+-]";
  if (file.startsWith("/")) return "must be repo-relative (no leading /)";
  if (file.split("/").includes("..")) return "must not contain a .. segment";
  return null;
}

function checkLength(finding, field, where, errors) {
  const value = finding[field];
  if (typeof value !== "string") return; // null fix, or a type error already reported
  const [min, max] = LIMITS[field];
  const length = charLength(value);
  if (length < min || length > max) {
    errors.push(`${where}.${field}: length ${length} is outside ${min}-${max} characters`);
  }
}

// Semantic rules. Runs only on a document that already passed checkSchema, so the
// fields it reads have their declared types.
function checkSemantics(doc, manifest, threshold, errors) {
  if (doc.top_risks.length > MAX_TOP_RISKS) {
    errors.push(`top_risks: ${doc.top_risks.length} entries, at most ${MAX_TOP_RISKS} allowed`);
  }
  if (manifest && doc.tier !== manifest.tier) {
    errors.push(`tier: ${show(doc.tier)} does not match the manifest tier ${show(manifest.tier)}`);
  }
  const manifestFiles = manifest ? new Set(manifest.files.map((f) => f.path)) : null;
  const seenIds = new Set();

  doc.findings.forEach((finding, index) => {
    const where = `findings[${index}]`;
    if (!ID_PATTERN.test(finding.id)) {
      errors.push(`${where}.id: ${show(finding.id)} does not match F-<n>`);
    } else if (seenIds.has(finding.id)) {
      errors.push(`${where}.id: ${show(finding.id)} duplicates an earlier finding`);
    }
    seenIds.add(finding.id);

    if (finding.suspect && finding.severity === "critical") {
      errors.push(`${where}.suspect: a suspect finding must not have severity critical`);
    }
    if (finding.confidence < 0 || finding.confidence > 100) {
      errors.push(`${where}.confidence: ${finding.confidence} is outside 0-100`);
    } else if (threshold !== null && finding.confidence < threshold) {
      errors.push(`${where}.confidence: ${finding.confidence} is below the threshold ${threshold}`);
    }

    const fileProblem = checkFilePath(finding.file);
    if (fileProblem) {
      errors.push(`${where}.file: ${show(finding.file)} ${fileProblem}`);
    } else if (manifestFiles && !manifestFiles.has(finding.file)) {
      errors.push(`${where}.file: ${show(finding.file)} is not a file in the manifest`);
    }

    if (finding.line_start < 1) errors.push(`${where}.line_start: ${finding.line_start} is below 1`);
    if (finding.line_end < 1) errors.push(`${where}.line_end: ${finding.line_end} is below 1`);
    if (finding.line_start >= 1 && finding.line_end >= 1 && finding.line_start > finding.line_end) {
      errors.push(`${where}.line_start: ${finding.line_start} is after line_end ${finding.line_end}`);
    }

    for (const field of ["evidence", "why", "fix"]) checkLength(finding, field, where, errors);
  });
}

function usage(message) {
  if (message) process.stderr.write(`validate-review: ${message}\n`);
  process.stderr.write("usage: node validate-review.cjs <doc> [--manifest <manifest.json>] [--threshold <0-100>]\n");
  process.exit(2);
}

function parseArgs(argv) {
  const options = { doc: null, manifest: null, threshold: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--manifest" || arg === "--threshold") {
      const value = argv[++i];
      if (value === undefined) usage(`${arg} needs a value`);
      if (arg === "--manifest") {
        options.manifest = value;
      } else {
        if (!/^\d{1,3}$/.test(value) || Number(value) > 100) usage(`--threshold must be an integer from 0 to 100, got ${show(value)}`);
        options.threshold = Number(value);
      }
    } else if (arg.startsWith("--")) {
      usage(`unknown option ${show(arg)}`);
    } else if (options.doc === null) {
      options.doc = arg;
    } else {
      usage("exactly one document is expected");
    }
  }
  if (options.doc === null) usage("a document path is required");
  return options;
}

function readText(file, label) {
  try {
    if (fs.statSync(file).size > MAX_INPUT_BYTES) usage(`${label} is larger than ${MAX_INPUT_BYTES} bytes`);
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    return usage(`cannot read ${label} ${show(file)}: ${error.code || error.message}`);
  }
}

function loadManifest(file) {
  let manifest;
  try {
    manifest = JSON.parse(readText(file, "manifest"));
  } catch (error) {
    return usage(`manifest is not valid JSON: ${error.message}`);
  }
  const ok = manifest && typeof manifest === "object" && typeof manifest.tier === "string" &&
    Array.isArray(manifest.files) && manifest.files.every((f) => f && typeof f.path === "string");
  if (!ok) usage("manifest must carry a string `tier` and a `files` array of objects with a string `path`");
  return manifest;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifest = options.manifest === null ? null : loadManifest(options.manifest);
  let threshold = options.threshold;
  if (threshold === null && manifest && Number.isInteger(manifest.threshold)) threshold = manifest.threshold;

  const text = readText(options.doc, "document");
  const errors = [];
  let doc;
  try {
    doc = JSON.parse(text);
  } catch (error) {
    errors.push(`(document): not valid JSON: ${error.message}`);
  }

  if (doc !== undefined) {
    checkSchema(doc, JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")), "", errors);
    if (errors.length === 0) checkSemantics(doc, manifest, threshold, errors);
  }

  if (errors.length === 0) {
    process.stdout.write("validate-review: ok\n");
    return;
  }
  const shown = errors.slice(0, MAX_ERRORS);
  process.stderr.write(`validate-review: ${errors.length} problem(s) in ${show(path.basename(options.doc))}\n`);
  for (const message of shown) process.stderr.write(`  ${message}\n`);
  if (errors.length > shown.length) process.stderr.write(`  ... ${errors.length - shown.length} more not shown\n`);
  process.exit(1);
}

main();

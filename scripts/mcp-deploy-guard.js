#!/usr/bin/env node
"use strict";
// Deploy guards for .github/workflows/mcp-deploy.yml (FR-5). Each subcommand is
// a pure function over injected run(cmd, args), sleep(ms) and readFile; the CLI
// binds the real ones. npm is always called with an argument array, never a
// shell string, so a hostile version cannot inject anything.
const crypto = require("node:crypto");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const REGISTRY = "--registry=https://registry.npmjs.org/";
const COMMAND_COUNT = 14;

function checkVersion(v) {
  return typeof v === "string" && /^\d+\.\d+\.\d+$/.test(v);
}

function npmView(run, v, field) {
  return String(run("npm", ["view", `akili-specs@${v}`, field, REGISTRY])).trim();
}

function wait(v, { timeout, interval, run, sleep }) {
  const polls = Math.max(1, Math.floor(timeout / interval));
  for (let i = 0; i < polls; i++) {
    let seen = "";
    try {
      seen = npmView(run, v, "version");
    } catch {
      // Not published yet (E404) or a registry blip: keep polling.
    }
    if (seen === v) return 0;
    if (i < polls - 1) sleep(interval * 1000);
  }
  return 1;
}

function verify(tgz, v, { run, readFile }) {
  const actual = "sha512-" + crypto.createHash("sha512").update(readFile(tgz)).digest("base64");
  let expected = "";
  try {
    expected = npmView(run, v, "dist.integrity");
  } catch {
    return 1;
  }
  return expected !== "" && expected === actual ? 0 : 1;
}

function smoke(resultFile, v, { readFile }) {
  let r;
  try {
    r = JSON.parse(String(readFile(resultFile)));
  } catch {
    return 1;
  }
  const ok =
    r !== null &&
    typeof r === "object" &&
    r.error === undefined &&
    r.akiliVersion === v &&
    Array.isArray(r.commands) &&
    r.commands.length === COMMAND_COUNT;
  return ok ? 0 : 1;
}

function flag(args, name, fallback) {
  const i = args.indexOf(name);
  return i === -1 ? fallback : Number(args[i + 1]);
}

function main(argv, deps) {
  const [sub, ...rest] = argv;
  if (sub === "check-version") return checkVersion(rest[0]) ? 0 : 2;
  if (sub !== "wait" && sub !== "verify" && sub !== "smoke") return 2;
  const v = sub === "wait" ? rest[0] : rest[1];
  if (!checkVersion(v)) return 2;
  if (sub === "wait") {
    return wait(v, { timeout: flag(rest, "--timeout", 600), interval: flag(rest, "--interval", 15), ...deps });
  }
  return sub === "verify" ? verify(rest[0], v, deps) : smoke(rest[0], v, deps);
}

module.exports = { checkVersion, wait, verify, smoke, main };

if (require.main === module) {
  const deps = {
    run: (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }),
    sleep: (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms),
    readFile: (p) => fs.readFileSync(p),
  };
  process.exitCode = main(process.argv.slice(2), deps);
}

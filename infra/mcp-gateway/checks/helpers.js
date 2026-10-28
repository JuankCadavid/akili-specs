"use strict";
// Packs the checkout once, unpacks it, and synthesizes both stages offline
// (in process; no cdk CLI, no AWS call, no credentials).
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cdk = require("aws-cdk-lib");
const { Template } = require("aws-cdk-lib/assertions");
const { build } = require("../bin/app");

const REPO = path.resolve(__dirname, "../../..");
const EMAIL = "alerts@example.invalid";

function packCheckout() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "akili-mcp-infra-"));
  execFileSync("npm", ["pack", "--ignore-scripts", "--pack-destination", tmp, "--silent"], {
    cwd: REPO,
    stdio: ["ignore", "ignore", "inherit"],
    shell: process.platform === "win32",
  });
  const tgz = fs.readdirSync(tmp).find((f) => f.endsWith(".tgz"));
  execFileSync("tar", ["-xzf", path.join(tmp, tgz), "-C", tmp]);
  const packageDir = path.join(tmp, "package");
  return { tmp, packageDir, version: JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8")).version };
}

function synth(packed, stage, overrides = {}) {
  const app = new cdk.App({ outdir: fs.mkdtempSync(path.join(packed.tmp, "out-")), analyticsReporting: false });
  const { service, deployRole } = build(app, {
    packageDir: packed.packageDir,
    version: packed.version,
    stage,
    alertEmail: EMAIL,
    ...overrides,
  });
  return {
    service,
    deployRole,
    template: Template.fromStack(service),
    roleTemplate: deployRole && Template.fromStack(deployRole),
  };
}

module.exports = { EMAIL, packCheckout, synth };

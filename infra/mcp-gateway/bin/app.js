#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const cdk = require("aws-cdk-lib");
const { ServiceStack } = require("../lib/service-stack");
const { DeployRoleStack } = require("../lib/deploy-role-stack");

// Pure builder: no environment reads, so checks can drive it. The account comes
// only from the deploying credentials (no env.account anywhere).
function build(app, { packageDir, version, stage, alertEmail, oidcProvider = "import" }) {
  if (!["prod", "spike"].includes(stage)) throw new Error(`stage must be prod or spike, got ${stage}`);
  if (!packageDir) throw new Error("context packageDir is required");
  if (!alertEmail) throw new Error("AKILI_MCP_ALERT_EMAIL is required");
  const pkg = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));
  if (pkg.version !== version) {
    throw new Error(`version context ${version} does not match packageDir package.json ${pkg.version}`);
  }
  const { TOOL_DEFINITIONS } = require(path.resolve(packageDir, "bin/mcp-core.js"));
  const prod = stage === "prod";
  const service = new ServiceStack(app, prod ? "akili-mcp-service" : "akili-mcp-spike-service", {
    stage,
    packageDir,
    alertEmail,
    toolDefinitions: TOOL_DEFINITIONS,
  });
  // The deploy role is account-wide and exists once: prod only.
  const deployRole = prod ? new DeployRoleStack(app, "akili-mcp-deploy-role", { oidcProvider }) : undefined;
  return { service, deployRole };
}

if (require.main === module) {
  const app = new cdk.App();
  const ctx = (k) => app.node.tryGetContext(k);
  build(app, {
    packageDir: ctx("packageDir") && path.resolve(ctx("packageDir")),
    version: String(ctx("version")),
    stage: ctx("stage") || "prod",
    alertEmail: process.env.AKILI_MCP_ALERT_EMAIL,
    oidcProvider: ctx("oidcProvider") || "import",
  });
}

module.exports = { build };

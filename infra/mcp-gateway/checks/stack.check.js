"use strict";
// Synth assertions, one per FR-4 clause. Expected values are the spec's literals
// (FR-4 / D-3 / D-4 / D-7), not config.json, so a config edit that drifts from
// the spec turns a check red. Offline and in process: no cdk CLI, no AWS call.
const test = require("node:test");
const assert = require("node:assert/strict");
const cdk = require("aws-cdk-lib");
const { Match } = require("aws-cdk-lib/assertions");
const { build } = require("../bin/app");
const { EMAIL, packCheckout, synth } = require("./helpers");

const packed = packCheckout();
const prod = synth(packed, "prod");
const spike = synth(packed, "spike");
const { TOOL_DEFINITIONS } = require(`${packed.packageDir}/bin/mcp-core.js`);
const T = prod.template;
test.after(() => require("node:fs").rmSync(packed.tmp, { recursive: true, force: true }));
const SUB = "$.context.jwt.sub";

const only = (template, type) => {
  const found = Object.values(template.findResources(type));
  assert.equal(found.length, 1, `expected one ${type}`);
  return found[0].Properties;
};
const strings = (node, out = []) => {
  if (typeof node === "string") out.push(node);
  else if (node && typeof node === "object") Object.values(node).forEach((v) => strings(v, out));
  return out;
};
// Roles allowed to carry a managed policy, with the recorded reason. Empty: none are.
const MANAGED_POLICY_ALLOW = {};
// Every effective statement of a template. Fails on any role carrying a managed
// policy (its statements are invisible here), unless allow-listed with a reason.
const statements = (template) => {
  const res = Object.entries(template.toJSON().Resources).filter(([, r]) => r.Type === "AWS::IAM::Policy" || r.Type === "AWS::IAM::Role");
  for (const [id, r] of res) {
    if (r.Properties.ManagedPolicyArns?.length) {
      assert.ok(MANAGED_POLICY_ALLOW[id], `role ${id} carries managed policy ${JSON.stringify(r.Properties.ManagedPolicyArns)}`);
    }
  }
  return res.flatMap(([, r]) => {
    const docs = [r.Properties.PolicyDocument, ...(r.Properties.Policies || []).map((p) => p.PolicyDocument)];
    return docs.filter(Boolean).flatMap((d) => d.Statement);
  });
};
const list = (x) => (Array.isArray(x) ? x : [x]);

test("FR-4 function: Node 22, handler, concurrency 5, code is the packed directory", () => {
  const fn = T.findResources("AWS::Lambda::Function", { Properties: { FunctionName: "akili-mcp-content" } });
  const props = Object.values(fn)[0].Properties;
  assert.equal(props.Runtime, "nodejs22.x");
  assert.equal(props.Handler, "bin/mcp-lambda.handler");
  assert.equal(props.ReservedConcurrentExecutions, 5);
  assert.ok(props.Code.S3Key.endsWith(".zip"), "code is a staged asset");
  // The asset is the packed directory unchanged: its hash is the directory fingerprint.
  assert.equal(props.Code.S3Key, `${cdk.FileSystem.fingerprint(packed.packageDir)}.zip`);
});

test("FR-4 version and alias live", () => {
  T.resourceCountIs("AWS::Lambda::Version", 1);
  T.hasResourceProperties("AWS::Lambda::Alias", { Name: "live", FunctionVersion: Match.anyValue() });
});

test("FR-4 log group retention is 14 days", () => {
  T.hasResourceProperties("AWS::Logs::LogGroup", { LogGroupName: "/aws/lambda/akili-mcp-content", RetentionInDays: 14 });
});

test("FR-4 user pool: self sign-up, email only, verification, no federation", () => {
  const pool = only(T, "AWS::Cognito::UserPool");
  assert.equal(pool.AdminCreateUserConfig.AllowAdminCreateUserOnly, false);
  assert.deepEqual(pool.UsernameAttributes, ["email"]);
  assert.equal(pool.AliasAttributes, undefined);
  assert.deepEqual(pool.AutoVerifiedAttributes, ["email"]);
  assert.deepEqual(pool.Schema, [{ Mutable: true, Name: "email", Required: true }]);
  assert.equal(pool.DeletionProtection, "ACTIVE");
  T.resourceCountIs("AWS::Cognito::UserPoolIdentityProvider", 0);
});

test("FR-4 managed-login domain", () => {
  T.hasResourceProperties("AWS::Cognito::UserPoolDomain", { ManagedLoginVersion: 2 });
});

test("FR-4 public app client: no secret, code grant, localhost callback, openid+email", () => {
  const c = only(T, "AWS::Cognito::UserPoolClient");
  assert.equal(c.GenerateSecret, false);
  assert.deepEqual(c.AllowedOAuthFlows, ["code"]);
  assert.deepEqual(c.CallbackURLs, ["http://localhost:33418/callback"]);
  assert.deepEqual([...c.AllowedOAuthScopes].sort(), ["email", "openid"]);
  assert.deepEqual(c.SupportedIdentityProviders, ["COGNITO"]);
  assert.deepEqual(c.ExplicitAuthFlows, ["ALLOW_REFRESH_TOKEN_AUTH"]);
});

test("FR-4 gateway: MCP, CUSTOM_JWT, discovery URL, allowedClients = the client", () => {
  const g = only(T, "AWS::BedrockAgentCore::Gateway");
  assert.equal(g.ProtocolType, "MCP");
  assert.equal(g.AuthorizerType, "CUSTOM_JWT");
  const jwt = g.AuthorizerConfiguration.CustomJWTAuthorizer;
  assert.deepEqual(jwt.AllowedClients, [{ Ref: Object.keys(T.findResources("AWS::Cognito::UserPoolClient"))[0] }]);
  assert.match(JSON.stringify(jwt.DiscoveryUrl), /ProviderURL.*\/\.well-known\/openid-configuration/);
});

test("FR-4 target akili on the live alias with the seven inline tools equal to TOOL_DEFINITIONS", () => {
  const t = only(T, "AWS::BedrockAgentCore::GatewayTarget");
  assert.equal(t.Name, "akili");
  const lam = t.TargetConfiguration.Mcp.Lambda;
  const aliasId = Object.keys(T.findResources("AWS::Lambda::Alias"))[0];
  assert.deepEqual(lam.LambdaArn, { Ref: aliasId });
  // Independent inverse of the stack's mapping: PascalCase struct keys back to camelCase.
  const camel = (n, inProps = false) =>
    Array.isArray(n)
      ? n.map((x) => camel(x))
      : n && typeof n === "object"
        ? Object.fromEntries(
            Object.entries(n).map(([k, v]) => [inProps ? k : k[0].toLowerCase() + k.slice(1), camel(v, k === "Properties")])
          )
        : n;
  const tools = camel(lam.ToolSchema.InlinePayload);
  assert.equal(tools.length, 7);
  assert.deepEqual(tools, JSON.parse(JSON.stringify(TOOL_DEFINITIONS)));
});

test("FR-4 rate limits: 60/min per jwt sub and 20/s global", () => {
  T.hasResourceProperties("AWS::BedrockAgentCore::GatewayRateLimit", {
    DimensionKeys: [SUB],
    Entries: [{ Dimensions: { [SUB]: "*" }, Requests: [{ Period: "minute", Rate: 60 }] }],
  });
  T.hasResourceProperties("AWS::BedrockAgentCore::GatewayRateLimit", {
    DimensionKeys: ["targetName"],
    Entries: [{ Dimensions: { targetName: "akili" }, Requests: [{ Period: "second", Rate: 20 }] }],
  });
  T.resourceCountIs("AWS::BedrockAgentCore::GatewayRateLimit", 2);
});

test("FR-4 / FR-6 budget: $20 monthly on the project tag, 80 % email, 100 % email + kill switch", () => {
  const b = only(T, "AWS::Budgets::Budget");
  assert.deepEqual(b.Budget.BudgetLimit, { Amount: 20, Unit: "USD" });
  assert.equal(b.Budget.TimeUnit, "MONTHLY");
  assert.deepEqual(b.Budget.CostFilters, { TagKeyValue: ["user:project$akili-mcp"] });
  const [n80, n100] = b.NotificationsWithSubscribers;
  assert.equal(n80.Notification.Threshold, 80);
  assert.deepEqual(n80.Subscribers.map((s) => s.SubscriptionType), ["EMAIL"]);
  assert.equal(n100.Notification.Threshold, 100);
  assert.deepEqual(n100.Subscribers.map((s) => s.SubscriptionType).sort(), ["EMAIL", "SNS"]);
  assert.equal(b.NotificationsWithSubscribers.length, 2);
});

test("FR-6 kill switch: two brakes, least-privilege role, subscribed to the budget topic", () => {
  const ks = Object.values(T.findResources("AWS::Lambda::Function", { Properties: { FunctionName: "akili-mcp-kill-switch" } }))[0];
  assert.equal(JSON.parse(ks.Properties.Environment.Variables.BLOCK_ENTRIES)[0].requests[0].rate, 0);
  T.hasResourceProperties("AWS::SNS::Subscription", { Protocol: "lambda" });
  const acts = statements(T).flatMap((s) => list(s.Action));
  assert.ok(acts.includes("lambda:PutFunctionConcurrency") && acts.includes("bedrock-agentcore:UpdateGatewayRateLimit"));
});

test("FR-4 tags: project=akili-mcp on every taggable resource", () => {
  const taggable = prod.service.node
    .findAll()
    .filter((c) => cdk.CfnResource.isCfnResource(c) && cdk.TagManager.isTaggable(c))
    .map((c) => prod.service.resolve(c.logicalId));
  assert.ok(taggable.length >= 8, "found the taggable resources");
  const res = T.toJSON().Resources;
  for (const id of taggable) {
    const tags = res[id].Properties.Tags ?? res[id].Properties.UserPoolTags;
    const map = Array.isArray(tags) ? Object.fromEntries(tags.map((t) => [t.Key, t.Value])) : tags;
    assert.equal(map.project, "akili-mcp", `${id} (${res[id].Type}) carries project=akili-mcp`);
  }
  assert.deepEqual(only(T, "AWS::Budgets::Budget").ResourceTags[0], { Key: "project", Value: "akili-mcp" });
});

const NAMES = {
  "AWS::Lambda::Function": "FunctionName",
  "AWS::Logs::LogGroup": "LogGroupName",
  "AWS::Cognito::UserPool": "UserPoolName",
  "AWS::Cognito::UserPoolClient": "ClientName",
  "AWS::BedrockAgentCore::Gateway": "Name",
  "AWS::SNS::Topic": "TopicName",
  "AWS::IAM::Role": "RoleName",
};
const named = (template) =>
  Object.values(template.toJSON().Resources)
    .map((r) => (r.Type === "AWS::Budgets::Budget" ? r.Properties.Budget.BudgetName : r.Properties[NAMES[r.Type]]))
    .filter(Boolean)
    .map((n) => JSON.stringify(n));

test("FR-4 names: every named resource is prefixed akili-mcp", () => {
  assert.ok(named(T).length >= 10);
  for (const n of named(T)) assert.match(n, /^"(\/aws\/lambda\/)?akili-mcp/, n);
  assert.match(JSON.stringify(only(T, "AWS::Cognito::UserPoolDomain").Domain), /^\{"Fn::Join":\["-",\["akili-mcp",/);
  assert.equal(prod.service.stackName, "akili-mcp-service");
});

test("FR-4 spike: distinct stack and resource names, no deploy role", () => {
  assert.notEqual(spike.service.stackName, prod.service.stackName);
  assert.match(spike.service.stackName, /^akili-mcp-spike/);
  assert.equal(spike.deployRole, undefined);
  const p = new Set(named(T));
  assert.ok(named(spike.template).length >= 10);
  for (const n of named(spike.template)) {
    assert.ok(!p.has(n), `spike name ${n} must differ from prod`);
    assert.match(n, /^"(\/aws\/lambda\/)?akili-mcp-spike/, n);
  }
  assert.notDeepEqual(only(spike.template, "AWS::Cognito::UserPoolDomain").Domain, only(T, "AWS::Cognito::UserPoolDomain").Domain);
  assert.notEqual(only(spike.template, "AWS::Cognito::UserPool").DeletionProtection, "ACTIVE");
});

test("FR-4 deploy role: trust is the aws-mcp environment only", () => {
  const role = only(prod.roleTemplate, "AWS::IAM::Role");
  const trust = role.AssumeRolePolicyDocument.Statement;
  assert.equal(trust.length, 1);
  assert.equal(trust[0].Action, "sts:AssumeRoleWithWebIdentity");
  assert.deepEqual(trust[0].Condition.StringEquals, {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:JuankCadavid/akili-specs:environment:aws-mcp",
  });
});

test("FR-4 deploy role: only bootstrap-role assume and the function alias", () => {
  const stmts = statements(prod.roleTemplate).filter((s) => s.Action !== "sts:AssumeRoleWithWebIdentity");
  assert.deepEqual(
    stmts.flatMap((s) => list(s.Action)).sort(),
    ["lambda:GetAlias", "lambda:InvokeFunction", "lambda:ListVersionsByFunction", "lambda:UpdateAlias", "sts:AssumeRole"]
  );
});

test("FR-4 no wildcard action or resource, and no managed policy, in any role of either template", () => {
  const stmts = statements(prod.roleTemplate).filter((s) => s.Action !== "sts:AssumeRoleWithWebIdentity");
  for (const s of [...stmts, ...statements(T), ...statements(spike.template)]) {
    for (const a of list(s.Action)) assert.ok(!a.includes("*"), `Action ${a}`);
    for (const r of list(s.Resource)) assert.notEqual(r, "*", `Resource of ${list(s.Action)}`);
  }
});

test("NFR-7 template scan: no account id, no NONE authorizer, email only where passed", () => {
  for (const t of [T, spike.template, prod.roleTemplate]) {
    const json = JSON.stringify(t.toJSON());
    assert.doesNotMatch(json, /arn:[^"\s]*:\d{12}[:/]/, "12-digit account in an ARN");
    for (const s of strings(t.toJSON())) assert.doesNotMatch(s, /^\d{12}$/, "bare account id");
    assert.doesNotMatch(json, /"AccountId":"\d{12}"/);
    assert.ok(!strings(t.toJSON()).includes("NONE"), "authorizer NONE");
  }
  const json = JSON.stringify(T.toJSON());
  assert.equal(json.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g).join(","), `${EMAIL},${EMAIL}`);
  for (const t of [prod.roleTemplate]) assert.ok(!JSON.stringify(t.toJSON()).includes(EMAIL));
  const b = only(T, "AWS::Budgets::Budget");
  assert.equal(JSON.stringify(b).split(EMAIL).length - 1, 2);
});

test("synth throws when the version context differs from package.json", () => {
  const app = new cdk.App({ outdir: packed.tmp, analyticsReporting: false });
  assert.throws(
    () => build(app, { packageDir: packed.packageDir, version: "0.0.0", stage: "prod", alertEmail: EMAIL }),
    /does not match/
  );
});

test("synth throws without an alert email (never defaulted in code)", () => {
  const app = new cdk.App({ outdir: packed.tmp, analyticsReporting: false });
  assert.throws(() => build(app, { packageDir: packed.packageDir, version: packed.version, stage: "prod" }), /ALERT_EMAIL/);
});

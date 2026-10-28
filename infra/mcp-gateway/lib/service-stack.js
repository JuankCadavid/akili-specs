"use strict";
const fs = require("node:fs");
const path = require("node:path");
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const logs = require("aws-cdk-lib/aws-logs");
const iam = require("aws-cdk-lib/aws-iam");
const cognito = require("aws-cdk-lib/aws-cognito");
const sns = require("aws-cdk-lib/aws-sns");
const subs = require("aws-cdk-lib/aws-sns-subscriptions");
const budgets = require("aws-cdk-lib/aws-budgets");
const agentcore = require("aws-cdk-lib/aws-bedrockagentcore");
const config = require("../config.json");

const TARGET = "akili";
const SUB = "$.context.jwt.sub";

// Tool definitions (camelCase, from the package) to the L1 shape. Only the
// keys the Gateway documents (type, description, properties, required).
function schema(s) {
  const out = { type: s.type };
  if (s.description) out.description = s.description;
  if (s.required) out.required = s.required;
  if (s.properties) {
    out.properties = Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, schema(v)]));
  }
  return out;
}

class ServiceStack extends cdk.Stack {
  constructor(scope, id, { stage, packageDir, alertEmail, toolDefinitions }) {
    super(scope, id, { stackName: id });
    const prod = stage === "prod";
    const p = prod ? "akili-mcp" : "akili-mcp-spike";
    const keep = prod ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;
    cdk.Tags.of(this).add("project", "akili-mcp");
    cdk.Tags.of(this).add("stage", stage);

    // Lambda: the unpacked tarball, unchanged; alias `live` is what the target calls.
    const fnName = `${p}-content`;
    const logGroup = new logs.LogGroup(this, "ContentLogs", {
      logGroupName: `/aws/lambda/${fnName}`,
      retention: config.logRetentionDays,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // Explicit roles: no managed policy (AWSLambdaBasicExecutionRole is logs:* on "*").
    const lambdaRole = (id, group) => {
      const r = new iam.Role(this, id, { assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com") });
      group.grantWrite(r);
      return r;
    };
    const fn = new lambda.Function(this, "Content", {
      role: lambdaRole("ContentRole", logGroup),
      functionName: fnName,
      runtime: new lambda.Runtime(config.nodeRuntime, lambda.RuntimeFamily.NODEJS),
      handler: "bin/mcp-lambda.handler",
      code: lambda.Code.fromAsset(packageDir),
      memorySize: config.memoryMb,
      timeout: cdk.Duration.seconds(config.timeoutSeconds),
      reservedConcurrentExecutions: config.reservedConcurrency,
      logGroup,
    });
    const alias = new lambda.Alias(this, "Live", { aliasName: "live", version: fn.currentVersion });

    // Cognito: self sign-up, email only, no federation, public PKCE client.
    const pool = new cognito.UserPool(this, "Pool", {
      userPoolName: `${p}-users`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: { email: { required: true, mutable: true } },
      featurePlan: cognito.FeaturePlan.ESSENTIALS,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      deletionProtection: prod,
      removalPolicy: keep,
    });
    const suffix = cdk.Fn.select(0, cdk.Fn.split("-", cdk.Fn.select(2, cdk.Fn.split("/", cdk.Aws.STACK_ID))));
    const domain = pool.addDomain("Domain", {
      cognitoDomain: { domainPrefix: cdk.Fn.join("-", [p, suffix]) },
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });
    const client = pool.addClient("Client", {
      userPoolClientName: `${p}-client`,
      generateSecret: false,
      authFlows: { userSrp: true },
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
      oAuth: {
        flows: { authorizationCodeGrant: true },
        callbackUrls: [`http://localhost:${config.callbackPort}/callback`],
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
      },
      accessTokenValidity: cdk.Duration.minutes(60),
      idTokenValidity: cdk.Duration.minutes(60),
      refreshTokenValidity: cdk.Duration.days(30),
      enableTokenRevocation: true,
      preventUserExistenceErrors: true,
    });
    const branding = new cognito.CfnManagedLoginBranding(this, "Branding", {
      userPoolId: pool.userPoolId,
      clientId: client.userPoolClientId,
      useCognitoProvidedValues: true,
    });
    branding.node.addDependency(domain);

    // Gateway: MCP, CUSTOM_JWT against the pool, Lambda target on `live`.
    const gwRole = new iam.Role(this, "GatewayRole", {
      roleName: `${p}-gateway`,
      assumedBy: new iam.ServicePrincipal("bedrock-agentcore.amazonaws.com", {
        conditions: { StringEquals: { "aws:SourceAccount": cdk.Aws.ACCOUNT_ID } },
      }),
    });
    alias.grantInvoke(gwRole);
    const gateway = new agentcore.CfnGateway(this, "Gateway", {
      name: p,
      protocolType: "MCP",
      authorizerType: "CUSTOM_JWT",
      authorizerConfiguration: {
        customJwtAuthorizer: {
          discoveryUrl: cdk.Fn.join("", [pool.userPoolProviderUrl, "/.well-known/openid-configuration"]),
          allowedClients: [client.userPoolClientId],
        },
      },
      roleArn: gwRole.roleArn,
    });
    const target = new agentcore.CfnGatewayTarget(this, "Target", {
      gatewayIdentifier: gateway.attrGatewayIdentifier,
      name: TARGET,
      credentialProviderConfigurations: [{ credentialProviderType: "GATEWAY_IAM_ROLE" }],
      targetConfiguration: {
        mcp: {
          lambda: {
            lambdaArn: alias.functionArn,
            toolSchema: {
              inlinePayload: toolDefinitions.map((t) => ({
                name: t.name,
                description: t.description,
                inputSchema: schema(t.inputSchema),
              })),
            },
          },
        },
      },
    });
    target.node.addDependency(gwRole);

    // Rate limits (AWS::BedrockAgentCore::GatewayRateLimit). "Global" is one shared
    // bucket for the single target; the kill switch rewrites its entry to rate 0.
    const entry = (rate) => [
      { dimensions: { targetName: TARGET }, requests: [{ period: "second", rate }] },
    ];
    new agentcore.CfnGatewayRateLimit(this, "RatePerUser", {
      gatewayIdentifier: gateway.attrGatewayIdentifier,
      rateLimitId: `${p}-per-user`,
      dimensionKeys: [SUB],
      entries: [
        {
          dimensions: { [SUB]: "*" },
          requests: [{ period: "minute", rate: config.rateLimits.perUserPerMinute }],
        },
      ],
    });
    new agentcore.CfnGatewayRateLimit(this, "RateGlobal", {
      gatewayIdentifier: gateway.attrGatewayIdentifier,
      rateLimitId: `${p}-global`,
      dimensionKeys: ["targetName"],
      entries: entry(config.rateLimits.globalPerSecond),
    });

    // Kill switch: SNS (from Budgets only) -> Lambda with two brakes.
    const topic = new sns.Topic(this, "BudgetTopic", { topicName: `${p}-budget` });
    topic.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.ServicePrincipal("budgets.amazonaws.com")],
        actions: ["sns:Publish"],
        resources: [topic.topicArn],
        conditions: { StringEquals: { "aws:SourceAccount": cdk.Aws.ACCOUNT_ID } },
      })
    );
    const ksName = `${p}-kill-switch`;
    const ksLogs = new logs.LogGroup(this, "KillSwitchLogs", {
      logGroupName: `/aws/lambda/${ksName}`,
      retention: config.logRetentionDays,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const ks = new lambda.Function(this, "KillSwitch", {
      functionName: ksName,
      runtime: new lambda.Runtime(config.nodeRuntime, lambda.RuntimeFamily.NODEJS, { supportsInlineCode: true }),
      handler: "index.handler",
      code: lambda.Code.fromInline(fs.readFileSync(path.join(__dirname, "kill-switch.js"), "utf8")),
      timeout: cdk.Duration.seconds(30),
      role: lambdaRole("KillSwitchRole", ksLogs),
      logGroup: ksLogs,
      environment: {
        FUNCTION_NAME: fn.functionName,
        GATEWAY_ID: gateway.attrGatewayIdentifier,
        RATE_LIMIT_ID: `${p}-global`,
        BLOCK_ENTRIES: JSON.stringify(entry(0)),
      },
    });
    ks.addToRolePolicy(
      new iam.PolicyStatement({ actions: ["lambda:PutFunctionConcurrency"], resources: [fn.functionArn] })
    );
    ks.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock-agentcore:UpdateGatewayRateLimit"],
        resources: [gateway.attrGatewayArn],
      })
    );
    topic.addSubscription(new subs.LambdaSubscription(ks));

    // Budget: monthly cost on the activated `project` tag; 80 % email, 100 % email + kill switch.
    const email = { subscriptionType: "EMAIL", address: alertEmail };
    const at = (threshold, subscribers) => ({
      notification: {
        notificationType: "ACTUAL",
        comparisonOperator: "GREATER_THAN",
        thresholdType: "PERCENTAGE",
        threshold,
      },
      subscribers,
    });
    new budgets.CfnBudget(this, "Budget", {
      budget: {
        budgetName: `${p}-monthly`,
        budgetType: "COST",
        timeUnit: "MONTHLY",
        budgetLimit: { amount: config.budgetUsd, unit: "USD" },
        costFilters: { TagKeyValue: ["user:project$akili-mcp"] },
      },
      resourceTags: [
        { key: "project", value: "akili-mcp" },
        { key: "stage", value: stage },
      ],
      notificationsWithSubscribers: [
        at(config.alertThresholds.emailPercent, [email]),
        at(config.alertThresholds.killSwitchPercent, [
          email,
          { subscriptionType: "SNS", address: topic.topicArn },
        ]),
      ],
    });

    new cdk.CfnOutput(this, "GatewayUrl", { value: gateway.attrGatewayUrl });
    new cdk.CfnOutput(this, "ClientId", { value: client.userPoolClientId });
    new cdk.CfnOutput(this, "CognitoDomain", { value: domain.baseUrl() });
    new cdk.CfnOutput(this, "KillSwitchFunction", { value: ks.functionName });
  }
}

module.exports = { ServiceStack };

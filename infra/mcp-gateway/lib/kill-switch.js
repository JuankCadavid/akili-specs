// Kill-switch Lambda source, deployed inline (CloudFormation ZipFile, 4 KB cap).
// Two independent brakes (each tried even if the other fails): Lambda reserved
// concurrency 0, and the global Gateway rate entry set to 0. Uses the AWS SDK v3
// bundled in the Node runtime. If the bundled SDK lacks the Gateway client, the
// rate brake fails loudly and the concurrency brake still applies.
const { LambdaClient, PutFunctionConcurrencyCommand } = require("@aws-sdk/client-lambda");

exports.handler = async () => {
  const failures = [];
  try {
    await new LambdaClient({}).send(
      new PutFunctionConcurrencyCommand({
        FunctionName: process.env.FUNCTION_NAME,
        ReservedConcurrentExecutions: 0,
      })
    );
  } catch (e) {
    failures.push(`concurrency: ${e.name}`);
  }
  try {
    const sdk = require("@aws-sdk/client-bedrock-agentcore-control");
    await new sdk.BedrockAgentCoreControlClient({}).send(
      new sdk.UpdateGatewayRateLimitCommand({
        gatewayIdentifier: process.env.GATEWAY_ID,
        rateLimitId: process.env.RATE_LIMIT_ID,
        entries: JSON.parse(process.env.BLOCK_ENTRIES),
      })
    );
  } catch (e) {
    failures.push(`gateway rate: ${e.name}`);
  }
  console.log(JSON.stringify({ killSwitch: failures.length ? "partial" : "applied", failures }));
  if (failures.length) throw new Error(`kill switch incomplete: ${failures.join("; ")}`);
};

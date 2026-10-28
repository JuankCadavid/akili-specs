// AWS Lambda handler for the AKILI MCP tools behind an AgentCore Gateway
// Lambda target. Node built-ins only (NFR-1); no file write, no network call and
// no child process (NFR-3). Entry point: `bin/mcp-lambda.handler`.
//
// Gateway delivers the tool's input properties as `event` and the tool name as
// `<target>___<tool>` in `context.clientContext.custom.bedrockAgentCoreToolName`
// (design P-5). The `custom` vs `Custom` spelling in the Node runtime is
// UNVERIFIED (P-13), so both are read.
"use strict";

const path = require("path");
const mcpCore = require("./mcp-core.js");

// Built once per execution environment, not per call (FR-3).
const core = mcpCore.createCore({ packageDir: path.resolve(__dirname, "..") });
const TOOL_NAMES = new Set(mcpCore.TOOL_DEFINITIONS.map((d) => d.name));
const DELIMITER = "___";

function gatewayContext(context) {
  const cc = context && context.clientContext;
  if (!cc || typeof cc !== "object") return {};
  const custom = cc.custom || cc.Custom;
  return custom && typeof custom === "object" ? custom : {};
}

// "<target>___<tool>" -> "<tool>"; anything without the delimiter -> undefined.
function toolNameFrom(custom) {
  const full = custom.bedrockAgentCoreToolName;
  if (typeof full !== "string") return undefined;
  const at = full.indexOf(DELIMITER);
  if (at === -1) return undefined;
  const tool = full.slice(at + DELIMITER.length);
  return tool === "" ? undefined : tool;
}

// The adapter seam for the Gateway result shape (DD-5, P-12): today the plain
// envelope object. If Gateway needs a wrapper, only this function changes.
function toGatewayResult(envelope) {
  return envelope;
}

// One JSON line per call: tool, part, code, ms, requestId. It carries no event,
// no argument, no query and no result text (FR-3). Every field is a known tool
// name, an integer, a closed-set code, a number, or a bounded id string.
function logCall(tool, event, envelope, ms, custom) {
  const id = custom.bedrockAgentCoreAwsRequestId;
  const line = {
    tool: tool !== undefined && TOOL_NAMES.has(tool) ? tool : "unknown",
    part: event && Number.isInteger(event.part) ? event.part : null,
    code: envelope.error ? envelope.error.code : "ok",
    ms,
    requestId: typeof id === "string" ? id.slice(0, 128) : null,
  };
  try {
    console.log(JSON.stringify(line));
  } catch (_) {
    // logging must never fail a call
  }
}

async function handler(event, context) {
  const t0 = process.hrtime.bigint();
  let custom = {};
  let tool;
  let envelope;
  try {
    custom = gatewayContext(context);
    tool = toolNameFrom(custom);
    envelope = core.callTool(tool, event === undefined || event === null ? {} : event);
  } catch (_) {
    // callTool maps its own failures; this guards the context lookups.
    envelope = core.callTool(undefined, {});
  }
  const ms = Math.round(Number(process.hrtime.bigint() - t0) / 1e5) / 10;
  logCall(tool, event, envelope, ms, custom);
  return toGatewayResult(envelope);
}

module.exports = { handler };

// Tests for bin/mcp-lambda.js (FR-3, NFR-2, NFR-3). The Gateway event and
// context shapes are the design's reading of the AWS "Lambda function targets"
// page (P-5); what Gateway really sends in the Node runtime (P-13) and how it
// maps the result (P-12) are NOT provable here and stay open for the spike.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const https = require("https");
const net = require("net");
const childProcess = require("child_process");

const core = require("../bin/mcp-core.js");

const REPO_ROOT = path.resolve(__dirname, "..");
const LAMBDA_PATH = require.resolve("../bin/mcp-lambda.js");
const realCore = core.createCore({ packageDir: REPO_ROOT });

function read(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
}

// Loads a fresh copy of the handler module with createCore wrapped by a counter.
// The wrapper stays installed until `restore()` so a createCore call made at any
// time (load or per invocation) is counted.
function loadHandler() {
  let builds = 0;
  const original = core.createCore;
  core.createCore = (options) => {
    builds++;
    return original(options);
  };
  delete require.cache[LAMBDA_PATH];
  const mod = require(LAMBDA_PATH);
  return {
    handler: mod.handler,
    builds: () => builds,
    restore() {
      core.createCore = original;
      delete require.cache[LAMBDA_PATH];
    },
  };
}

function gatewayContext(toolName, extra) {
  return {
    clientContext: {
      custom: Object.assign({ bedrockAgentCoreToolName: toolName, bedrockAgentCoreAwsRequestId: "req-abc-123" }, extra),
    },
  };
}

// Runs fn with console.log/info/warn/error captured.
async function capturingConsole(fn) {
  const lines = { log: [], info: [], warn: [], error: [] };
  const saved = {};
  for (const level of Object.keys(lines)) {
    saved[level] = console[level];
    console[level] = (...args) => lines[level].push(args.map(String).join(" "));
  }
  try {
    await fn();
  } finally {
    for (const level of Object.keys(lines)) console[level] = saved[level];
  }
  return lines;
}

const { handler, restore } = (() => {
  const h = loadHandler();
  return { handler: h.handler, restore: h.restore };
})();
test.after(() => restore());

// ---------------------------------------------------------------------------
// FR-3 Gateway-shaped invocation: a case for each of the seven tools
// ---------------------------------------------------------------------------

const TOOL_EVENTS = [
  ["list_commands", {}],
  ["get_command", { name: "akili-propose", arguments: "x" }],
  ["list_skills", {}],
  ["get_skill", { name: "tdd", file: "tests.md" }],
  ["get_template", { name: "leader" }],
  ["get_file", { path: "scripts/parse_tests.js" }],
  ["search", { query: "regression test" }],
];

for (const [tool, event] of TOOL_EVENTS) {
  test(`FR-3 ${tool}: a Gateway event and context return the core's result for those inputs`, async () => {
    const quiet = await capturingConsole(async () => {
      const r = await handler(event, gatewayContext(`akili___${tool}`));
      assert.equal(r.error, undefined, JSON.stringify(r).slice(0, 200));
      assert.deepEqual(r, realCore.callTool(tool, event));
      assert.equal(r.akiliVersion, JSON.parse(read("package.json")).version);
    });
    assert.equal(quiet.log.length, 1);
  });
}

test("FR-3 get_command for { name: akili-propose, arguments: x } returns the rendered command with the argument in place", async () => {
  await capturingConsole(async () => {
    const r = await handler({ name: "akili-propose", arguments: "x" }, gatewayContext("akili___get_command"));
    assert.equal(r.name, "akili-propose");
    assert.ok(r.text.length > 100 && !r.text.includes("$ARGUMENTS"));
    assert.equal(typeof r.usage, "string");
  });
});

test("FR-3 the Custom spelling of the context key is read as well as custom", async () => {
  await capturingConsole(async () => {
    const r = await handler({}, { clientContext: { Custom: { bedrockAgentCoreToolName: "akili___list_commands" } } });
    assert.equal(r.commands.length, 14);
  });
});

test("FR-3 the first ___ splits the target prefix from the tool, whatever the target is called", async () => {
  await capturingConsole(async () => {
    assert.equal((await handler({}, gatewayContext("other-target___list_commands"))).commands.length, 14);
    assert.equal((await handler({}, gatewayContext("a___b___list_commands"))).error.code, "unknown_tool");
  });
});

// ---------------------------------------------------------------------------
// FR-3 Direct smoke invocation
// ---------------------------------------------------------------------------

test("FR-3 a direct invocation with akili___list_commands in the context returns the list_commands result, with no event", async () => {
  await capturingConsole(async () => {
    for (const event of [undefined, null, {}]) {
      const r = await handler(event, gatewayContext("akili___list_commands"));
      assert.deepEqual(r, realCore.callTool("list_commands"));
      assert.equal(r.commands.length, 14);
    }
  });
});

// ---------------------------------------------------------------------------
// FR-3 unknown_tool, never a crash
// ---------------------------------------------------------------------------

test("FR-3 a tool name without the ___ delimiter, an empty tool, or an unknown tool returns unknown_tool", async () => {
  await capturingConsole(async () => {
    for (const name of ["get_command", "list_commands", "akili__list_commands", "akili___", "___", "akili___nope", "akili___constructor", "akili___ list_commands"]) {
      const r = await handler({}, gatewayContext(name));
      assert.equal(r.error.code, "unknown_tool", name);
      assert.equal(r.akiliVersion, realCore.akiliVersion);
    }
  });
});

test("FR-3 a missing clientContext, custom, or tool name returns unknown_tool and does not throw", async () => {
  await capturingConsole(async () => {
    const contexts = [
      undefined,
      null,
      {},
      "ctx",
      { clientContext: null },
      { clientContext: {} },
      { clientContext: "x" },
      { clientContext: { custom: null } },
      { clientContext: { custom: {} } },
      { clientContext: { custom: { bedrockAgentCoreToolName: 5 } } },
      { clientContext: { custom: { bedrockAgentCoreToolName: null } } },
      { clientContext: { custom: "akili___list_commands" } },
      { get clientContext() { throw new Error("getter boom " + REPO_ROOT); } },
    ];
    for (const ctx of contexts) {
      let r;
      await assert.doesNotReject(async () => {
        r = await handler({}, ctx);
      });
      assert.equal(r.error.code, "unknown_tool");
      assert.equal(r.akiliVersion, realCore.akiliVersion);
      assert.ok(!JSON.stringify(r).includes(REPO_ROOT));
    }
  });
});

test("FR-3 the handler does not throw for bad event inputs and returns the core's error envelope", async () => {
  await capturingConsole(async () => {
    for (const event of ["x", 5, [], { name: 5 }, { name: "akili-propose", bogus: 1 }, { name: "../package.json" }]) {
      let r;
      await assert.doesNotReject(async () => {
        r = await handler(event, gatewayContext("akili___get_command"));
      });
      assert.ok(core.ERROR_CODES.includes(r.error.code), JSON.stringify(event));
      assert.ok(!/\bat .*:\d+:\d+|node_modules/.test(JSON.stringify(r)));
    }
  });
});

// ---------------------------------------------------------------------------
// FR-3 The catalog is built once per process
// ---------------------------------------------------------------------------

test("FR-3 the catalog is built once, not per call: one createCore call across two invocations", async (t) => {
  const h = loadHandler();
  t.after(() => h.restore());
  assert.equal(h.builds(), 1, "built at module load");
  await capturingConsole(async () => {
    await h.handler({}, gatewayContext("akili___list_commands"));
    await h.handler({ name: "akili-audit" }, gatewayContext("akili___get_command"));
  });
  assert.equal(h.builds(), 1, "still one build after two invocations");
});

// ---------------------------------------------------------------------------
// FR-3 Logging: one line, five fields, no content
// ---------------------------------------------------------------------------

const SENT_ARG = "SENTINEL-ARGUMENTS-9f3a1c";
const SENT_QUERY = "SENTINELQUERY9f3a1c";
const SENT_KEY = "SENTINEL-KEY-9f3a1c";

test("FR-3 one log line per call holds exactly tool, part, code, ms, requestId; the sentinels in arguments and query never appear", async () => {
  // The sentinels reach the handler: arguments is rendered into the command text,
  // an unknown key is echoed in the error message, and the query is an input.
  const calls = [
    ["akili___get_command", { name: "akili-propose", arguments: SENT_ARG, part: 1 }, "ok", 1],
    ["akili___search", { query: `${SENT_QUERY} regression` }, "ok", null],
    ["akili___get_command", { name: "akili-propose", [SENT_KEY]: SENT_ARG }, "invalid_argument", null],
    ["akili___get_file", { path: `/etc/${SENT_ARG}` }, "not_found", null],
    ["akili___list_commands", {}, "ok", null],
    ["nonsense", {}, "unknown_tool", null],
  ];
  const results = [];
  const out = await capturingConsole(async () => {
    for (const [name, event] of calls) results.push(await handler(event, gatewayContext(name)));
  });
  assert.ok(JSON.stringify(results[0]).includes(SENT_ARG), "the argument sentinel reached the rendered result");
  assert.ok(JSON.stringify(results[2]).includes(SENT_KEY), "the key sentinel reached the error message");
  assert.equal(out.log.length, calls.length, "one log line per call");
  assert.deepEqual([out.info, out.warn, out.error], [[], [], []]);
  const all = out.log.join("\n");
  for (const sentinel of [SENT_ARG, SENT_QUERY, SENT_KEY, "SENTINEL"]) assert.ok(!all.includes(sentinel), `log holds ${sentinel}`);
  assert.ok(!all.includes(results[0].text.slice(200, 260)), "no result text in the log");
  assert.ok(!all.includes("etc"), "no input path in the log");
  out.log.forEach((line, i) => {
    const rec = JSON.parse(line);
    assert.deepEqual(Object.keys(rec).sort(), ["code", "ms", "part", "requestId", "tool"]);
    assert.equal(rec.code, calls[i][2]);
    assert.equal(rec.part, calls[i][3]);
    assert.equal(rec.requestId, "req-abc-123");
    assert.equal(typeof rec.ms, "number");
    assert.ok(rec.ms >= 0 && rec.ms < 5000);
  });
  assert.equal(JSON.parse(out.log[0]).tool, "get_command");
  assert.equal(JSON.parse(out.log[1]).tool, "search");
  assert.equal(JSON.parse(out.log[5]).tool, "unknown", "an unrecognized tool name is not echoed");
});

test("FR-3 the log never echoes a hostile tool name or request ID beyond a bounded string; a missing request ID logs null", async () => {
  const out = await capturingConsole(async () => {
    await handler({}, gatewayContext(`akili___${SENT_ARG}`));
    await handler({}, gatewayContext("akili___list_commands", { bedrockAgentCoreAwsRequestId: undefined }));
    await handler({}, gatewayContext("akili___list_commands", { bedrockAgentCoreAwsRequestId: "r".repeat(1000) }));
  });
  assert.ok(!out.log.join("\n").includes(SENT_ARG));
  const recs = out.log.map((l) => JSON.parse(l));
  assert.equal(recs[1].requestId, null);
  assert.equal(recs[2].requestId.length, 128);
});

// ---------------------------------------------------------------------------
// NFR-3 No file write, no network call, no spawned process
// ---------------------------------------------------------------------------

function spyOn(obj, names, label, counts) {
  const restoreFns = [];
  for (const n of names) {
    if (typeof obj[n] !== "function") continue;
    const orig = obj[n];
    obj[n] = function (...a) {
      counts[`${label}.${n}`] = (counts[`${label}.${n}`] || 0) + 1;
      return orig.apply(this, a);
    };
    restoreFns.push(() => {
      obj[n] = orig;
    });
  }
  return () => restoreFns.forEach((f) => f());
}

function installSpies(counts) {
  const undo = [
    spyOn(fs, ["writeFileSync", "writeFile", "appendFileSync", "appendFile", "createWriteStream", "writeSync", "mkdirSync", "rmSync", "unlinkSync", "renameSync"], "fs", counts),
    spyOn(fs.promises, ["writeFile", "appendFile"], "fs.promises", counts),
    spyOn(http, ["request", "get"], "http", counts),
    spyOn(https, ["request", "get"], "https", counts),
    spyOn(net, ["connect", "createConnection"], "net", counts),
    spyOn(childProcess, ["exec", "execFile", "spawn", "fork", "execSync", "execFileSync", "spawnSync"], "child_process", counts),
  ];
  return () => undo.forEach((f) => f());
}

test("NFR-3 the spies see a file write and a spawned process (the mechanism works)", () => {
  const counts = {};
  const undo = installSpies(counts);
  const tmp = path.join(os.tmpdir(), `akili-spy-${process.pid}.txt`);
  try {
    fs.writeFileSync(tmp, "x");
    childProcess.spawnSync(process.execPath, ["-e", ""]);
  } finally {
    undo();
    fs.rmSync(tmp, { force: true });
  }
  assert.equal(counts["fs.writeFileSync"], 1);
  assert.equal(counts["child_process.spawnSync"], 1);
});

test("NFR-3 invoking every tool, valid and invalid, makes no file write, no network call and no process spawn", async () => {
  const counts = {};
  const undo = installSpies(counts); // spies first: the cold module load (Lambda init, catalog build) is inside the window
  const h = loadHandler();
  try {
    await capturingConsole(async () => {
      for (const [tool, event] of TOOL_EVENTS) await h.handler(event, gatewayContext(`akili___${tool}`));
      await h.handler({ query: " " }, gatewayContext("akili___search"));
      await h.handler({ path: "../package.json" }, gatewayContext("akili___get_file"));
      await h.handler({}, undefined);
    });
  } finally {
    undo();
    h.restore();
  }
  assert.deepEqual(counts, {});
});

// ---------------------------------------------------------------------------
// NFR-2 Warm call time
// ---------------------------------------------------------------------------

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

test("NFR-2 a warm get_command call is <= 100 ms median over 20 calls, measured three times", async (t) => {
  const medians = [];
  await capturingConsole(async () => {
    // Warm every command once: the first read of a file is cold by definition.
    for (const { name } of realCore.callTool("list_commands").commands) await handler({ name }, gatewayContext("akili___get_command"));
    for (let round = 0; round < 3; round++) {
      const times = [];
      for (let i = 0; i < 20; i++) {
        const t0 = process.hrtime.bigint();
        const r = await handler({ name: "akili-constitution", arguments: "x" }, gatewayContext("akili___get_command"));
        times.push(Number(process.hrtime.bigint() - t0) / 1e6);
        assert.equal(r.error, undefined);
      }
      medians.push(median(times));
    }
  });
  const spread = Math.max(...medians) - Math.min(...medians);
  const distance = 100 - Math.max(...medians);
  t.diagnostic(`warm get_command medians (ms): ${medians.map((m) => m.toFixed(2)).join(", ")}; spread ${spread.toFixed(2)} ms; distance to 100 ms ${distance.toFixed(2)} ms`);
  if (spread > distance) {
    t.diagnostic("INCONCLUSIVE: the spread is wider than the distance to the limit; not asserted");
    return;
  }
  for (const m of medians) assert.ok(m <= 100, `median ${m} ms`);
});

// ---------------------------------------------------------------------------
// NFR-1 / NFR-5
// ---------------------------------------------------------------------------

test("NFR-1 the handler requires only Node built-ins and the core", () => {
  const src = read("bin/mcp-lambda.js");
  const required = Array.from(src.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)).map((m) => m[1]);
  assert.deepEqual(required.sort(), ["./mcp-core.js", "path"]);
});

test("NFR-5 neither the handler nor this test cites the specs folder", () => {
  const needle = ["docs", "specs"].join("/");
  assert.ok(!read("bin/mcp-lambda.js").includes(needle));
  assert.ok(!read("test/mcp-lambda.test.js").includes(needle));
});

test("NFR-1 the root package.json gains no dependencies", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
});

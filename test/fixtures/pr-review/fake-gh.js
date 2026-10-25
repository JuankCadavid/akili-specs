#!/usr/bin/env node
"use strict";

// @akili-spec changes/akili-review (T3)
//
// A stand-in for `gh`, driven by the tests through AKILI_GH_BIN. It records every call and
// serves canned responses; it never touches the network.
//
//   FAKE_GH_LOG     JSONL file; one {method, path, query, body} per call
//   FAKE_GH_ROUTES  JSON file: {"routes": [{"method","path","contains"?,"status"?,"body"?,"responses"?}]}
//                   `path` is matched without its query string; `contains` must occur in a GraphQL
//                   query; `responses` is consumed one entry per call (the last repeats).
//   FAKE_GH_STATE   JSON file the fake keeps its per-route call counters in
//
// A call that is not `api <path> --method M --input -`, or that matches no route, exits 3 or 4
// and is recorded, so a test can never pass on a call it did not expect.

const fs = require("fs");

const argv = process.argv.slice(2);
if (argv.length === 0) process.exit(0); // `node --test` also runs files under test/; a bare run is a no-op
const log = (entry) => fs.appendFileSync(process.env.FAKE_GH_LOG, `${JSON.stringify(entry)}\n`);
const bail = (code, message, entry) => { log({ ...entry, unexpected: message }); process.stderr.write(`fake-gh: ${message}\n`); process.exit(code); };

const shapeOk = argv[0] === "api" && argv.length === 6 && argv[2] === "--method" && argv[4] === "--input" && argv[5] === "-";
if (!shapeOk) bail(3, `unexpected argv ${JSON.stringify(argv)}`, { argv });

const [, target, , method] = argv;
const [route, query = ""] = target.split("?");
const raw = fs.readFileSync(0, "utf8");
let body = null;
if (raw.trim() !== "") { try { body = JSON.parse(raw); } catch (error) { body = { unparsable: raw }; } }
const entry = { method, path: route, query, body };
log(entry);

const routes = JSON.parse(fs.readFileSync(process.env.FAKE_GH_ROUTES, "utf8")).routes;
const index = routes.findIndex((r) => r.method === method && r.path === route &&
  (r.contains === undefined || (body && typeof body.query === "string" && body.query.includes(r.contains))));
if (index < 0) bail(4, `no route for ${method} ${route}`, entry);

const stateFile = process.env.FAKE_GH_STATE;
let state = {};
try { state = JSON.parse(fs.readFileSync(stateFile, "utf8")); } catch (error) { /* first call */ }
const n = state[index] || 0;
state[index] = n + 1;
fs.writeFileSync(stateFile, JSON.stringify(state));

const r = routes[index];
const reply = r.responses ? r.responses[Math.min(n, r.responses.length - 1)] : r;
const status = reply.status || 200;
let out = reply.body === undefined ? {} : reply.body;
const page = Number(new URLSearchParams(query).get("page") || 1);
if (Array.isArray(out) && page > 1) out = []; // canned lists fit on page one
if (status >= 300) {
  process.stderr.write(`gh: ${JSON.stringify(out)} (HTTP ${status})\n`);
  process.stdout.write(JSON.stringify(out));
  process.exit(1);
}
process.stdout.write(JSON.stringify(out));

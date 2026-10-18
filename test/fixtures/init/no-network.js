"use strict";

// bugfix/init-ctrlc-abort DD-4 — a `--require` preload (via NODE_OPTIONS) that
// records every outbound https call: `get` or `request` is appended to the
// file named by $AKILI_NET_MARKER, then the original function runs unchanged.
// The test asserts that file is absent after the run (NFR-1).
const fs = require("fs");
const https = require("https");

for (const name of ["get", "request"]) {
  const original = https[name];
  https[name] = function (...args) {
    if (process.env.AKILI_NET_MARKER) fs.appendFileSync(process.env.AKILI_NET_MARKER, `${name}\n`);
    return original.apply(this, args);
  };
}

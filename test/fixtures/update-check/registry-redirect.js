"use strict";

// bugfix/update-check-deadline DD-4 — a `--require` preload that sends every
// https.get to the local http server named by $AKILI_TEST_REGISTRY instead of
// registry.npmjs.org. Options and callback pass through unchanged, so the
// request's own `timeout` still applies.
const http = require("http");
const https = require("https");

https.get = function (_url, options, callback) {
  return http.get(process.env.AKILI_TEST_REGISTRY, options, callback);
};

# Upstream request (DRAFT, not filed)

> **Status: draft.** Not filed. It must be filed by the maintainer, never by the agent (outward-facing action; spec `changes/akili-security-followup`, FR-9). Target: `cloudflare/security-audit-skill`, skill `security-audit`, pinned here at `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`.

## Title

`validate-findings.cjs` and `validate-coverage-ledger.cjs` cannot run on native Windows

## Problem

Both validators open their input through `readFileWithinLimit` and reject every input when `fs.constants.O_NOFOLLOW` or `fs.constants.O_NONBLOCK` is not a nonzero integer. Neither constant exists on native Windows, so on Windows the validators always fail closed with `OS no-follow and nonblocking input protection is unavailable` (exit 1) and no finding or coverage ledger can be validated.

`validate-coverage-ledger.cjs`, lines 721-726 at the pin:

```js
function readFileWithinLimit(file) {
  const noFollow = fs.constants.O_NOFOLLOW;
  const nonBlock = fs.constants.O_NONBLOCK;
  if (!Number.isInteger(noFollow) || noFollow === 0 || !Number.isInteger(nonBlock) || nonBlock === 0) {
    // Node exposes no race-safe fallback on these platforms, so reject all inputs.
    throw new SafeInputError("OS no-follow and nonblocking input protection is unavailable");
```

`validate-findings.cjs`, lines 604-608 at the pin:

```js
function readFileWithinLimit(file) {
  const noFollow = fs.constants.O_NOFOLLOW;
  const nonBlock = fs.constants.O_NONBLOCK;
  if (!Number.isInteger(noFollow) || noFollow === 0 || !Number.isInteger(nonBlock) || nonBlock === 0) {
    throw new SafeInputError("OS no-follow and nonblocking input protection is unavailable");
```

Evidence: the quoted code is what produces the message and exit 1 on a host without those constants. GitHub Actions run 39160826587 recorded that both Windows legs (Node 18 and 22) failed exactly `validate-findings.cjs exits 0 on [] and 1 on an incomplete finding`; the recorded evidence (CHANGELOG 2.33.0) names only the failing test.

## Request

One of:

1. A Windows-capable read path that keeps the existing guarantee: the input is never followed through a symbolic link or reparse point and a read of a special file (device, pipe) never blocks. The comment at the check says Node offers no race-safe fallback; if that is still true, a documented best-effort path with its residual risk stated would let downstream users decide.
2. A documented position that native Windows is unsupported (for example in `SKILL.md` or the README), with WSL, Linux or macOS named as the supported platforms, so downstream wrappers can cite it.

## Downstream state

The downstream wrapper stops in its preflight on native Windows and tells the user to run from WSL, Linux or macOS. It does not patch, shim or wrap the vendored validators, and it will not until a new pin passes its non-fallback test cases on both Windows CI legs.

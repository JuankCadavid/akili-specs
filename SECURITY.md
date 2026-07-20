# Security Policy

## Supported Versions

Only the latest version published to npm as [`akili-specs`](https://www.npmjs.com/package/akili-specs) is supported with security fixes. If you found an issue in an older version, please verify it still exists in the latest release before reporting.

## What Counts as a Vulnerability Here

This project ships **prompt files that AI agents execute** (commands, skills, templates) plus a Node.js installer. Reports we especially want:

- **Prompt-injection vectors** in any file under `.claude/` — instructions (visible, hidden, or obfuscated) that could make an agent exfiltrate secrets, execute untrusted remote content, or bypass the methodology's human-in-the-loop confirmation steps.
- **Installer issues** in `bin/akili.js` — path traversal, overwriting files outside the intended install targets, or violating skip-by-default behavior.
- **Supply-chain issues** — compromised or typosquatted dependencies, or discrepancies between this repository and the published npm package.
- **Leaked credentials** anywhere in the repository or package.

## How to Report

**Do not open a public issue for vulnerabilities.**

1. **Preferred:** use GitHub's private vulnerability reporting — [Report a vulnerability](https://github.com/JuankCadavid/akili-specs/security/advisories/new) on this repository's Security tab.
2. Alternatively, contact the maintainer privately via [jcadavid.com](https://jcadavid.com).

Please include: the affected file or component, reproduction steps or the injected/malicious content, the impact you foresee, and the version you tested.

## What to Expect

- Acknowledgment of your report within **72 hours**.
- An assessment and remediation plan within **7 days** for confirmed issues.
- A fix released as a new npm version, credited to you in the changelog and advisory (unless you prefer to stay anonymous).

Thank you for helping keep the AKILI-SPECS community safe.

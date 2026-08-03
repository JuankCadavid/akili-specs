## 2026-07-29 - Uncontrolled Resource Consumption in NPM Registry Checks
**Vulnerability:** The CLI fetches package updates from the npm registry using `https.get` but does not bound the size of the HTTP response or properly dispose of unread stream chunks on error statuses.
**Learning:** This exposes the tool to Uncontrolled Resource Consumption (DoS) and potential socket memory leaks if the registry responds unexpectedly or maliciously.
**Prevention:** Always implement a maximum chunk length check in `res.on('data')` when consuming external data, call `req.destroy()` to abort oversized streams, and remember to call `res.resume()` on error paths to release socket resources.

## 2024-05-18 - [CRITICAL] Prevent Command Injection via `execSync`
**Vulnerability:** Found uses of `child_process.execSync` in `bin/akili.js` building shell commands by interpolating variables (like package manager strings). While in this specific context `process.env.npm_config_user_agent` is somewhat restricted, constructing shell commands via string concatenation and evaluating them with `execSync` is a classic Command Injection vector (CWE-78).
**Learning:** Shell evaluation is risky because any dynamically sourced input in the string can be manipulated to execute arbitrary shell commands.
**Prevention:** Replaced `execSync` with `execFileSync` to invoke executables directly, passing arguments as a safe array instead of a concatenated shell string. This prevents the shell from interpreting special characters and prevents arbitrary code execution vulnerabilities.

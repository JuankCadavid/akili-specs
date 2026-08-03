## 2026-07-29 - Uncontrolled Resource Consumption in NPM Registry Checks
**Vulnerability:** The CLI fetches package updates from the npm registry using `https.get` but does not bound the size of the HTTP response or properly dispose of unread stream chunks on error statuses.
**Learning:** This exposes the tool to Uncontrolled Resource Consumption (DoS) and potential socket memory leaks if the registry responds unexpectedly or maliciously.
**Prevention:** Always implement a maximum chunk length check in `res.on('data')` when consuming external data, call `req.destroy()` to abort oversized streams, and remember to call `res.resume()` on error paths to release socket resources.
## 2026-07-30 - Arbitrary File Overwrite via Symlink Attack
**Vulnerability:** The `install` command used `fs.cpSync` and `fs.copyFileSync` with `--force` without unlinking symlinks, potentially allowing an attacker to overwrite arbitrary sensitive files on the user's filesystem (like `~/.ssh/authorized_keys`) if they place a symlink in the target directory (e.g., `~/.claude/commands/akili-audit.md`).
**Learning:** When writing files recursively and allowing existing files to be overwritten, using `fs.cpSync` or `fs.copyFileSync` on a symlink target rewrites the referenced file rather than replacing the link. Checking existence with `fs.existsSync` is not enough because it follows symlinks.
**Prevention:** Use `fs.lstatSync` to check if a file exists, and if it is a symbolic link, remove it first using `fs.rmSync(targetPath, { force: true })` before copying.

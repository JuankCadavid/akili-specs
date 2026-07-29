## 2026-07-29 - Uncontrolled Resource Consumption in NPM Registry Checks
**Vulnerability:** The CLI fetches package updates from the npm registry using `https.get` but does not bound the size of the HTTP response or properly dispose of unread stream chunks on error statuses.
**Learning:** This exposes the tool to Uncontrolled Resource Consumption (DoS) and potential socket memory leaks if the registry responds unexpectedly or maliciously.
**Prevention:** Always implement a maximum chunk length check in `res.on('data')` when consuming external data, call `req.destroy()` to abort oversized streams, and remember to call `res.resume()` on error paths to release socket resources.

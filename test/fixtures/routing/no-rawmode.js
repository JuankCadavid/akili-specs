"use strict";
// changes/routing-keyboard-select T3 — preload for the FR-4 row *stdin TTY
// without setRawMode*: `node -r <this file> bin/akili.js routing …` on a pty.
delete require("tty").ReadStream.prototype.setRawMode;

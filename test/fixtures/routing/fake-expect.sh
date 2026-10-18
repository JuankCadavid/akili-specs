#!/bin/sh
# bugfix/pty-harness-ubuntu-flake (design §5.4, DD-4) — a fake `expect` for the
# FR-4 regression test (test/routing-pty-evidence.test.js) and the CI inject
# step. It opens no pty: it writes a canned transcript (list rendered, prompt
# back, then a wait that never matched, no RC= and no TTY= line) to the log
# path the suite passes as the sixth argument, and exits 2 like a fixture whose
# `expect_after` timeout fired. Installed at runtime with chmod 0755, never
# committed as an executable.
cat > "$6" <<'TRANSCRIPT'
Which hosts do you use?
❯ [ ] 1) Claude Code
Enter confirms

<<BACK-IN 5 ms>>

<<AKILI-EVIDENCE-SENTINEL 7f3a>>

<<TIMEOUT: unmatched wait>>
TRANSCRIPT
exit 2

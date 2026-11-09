#!/bin/bash
# Re-runs the pane probe. Usage, from the repository root:
#   docs/specs/changes/akili-panel-polish/probe/run.sh <claude binary> <work dir> <out dir> [full|clear]
# Needs tmux. <work dir> must be a folder Claude Code trusts. Nothing here touches the plugin.
BIN=$1; CWD=$2; OUT=$3; MODE=${4:-full}; S=akili-probe
MOD="$(cd "$(dirname "$0")" && pwd)/mod"
mkdir -p "$OUT"
snap() { tmux capture-pane -t $S -e -p > "$OUT/$1.ansi"; tmux capture-pane -t $S -p > "$OUT/$1.txt"; }
send() { tmux send-keys -t $S -l "$1"; sleep 1; tmux send-keys -t $S Enter; sleep 4; }
tmux kill-session -t $S 2>/dev/null
tmux new-session -d -s $S -x 170 -y 40 -c "$CWD" "'$BIN' --plugin-dir '$MOD' --model haiku"
sleep 8
if [ "$MODE" = full ]; then
  send /probe-gray; snap gray
  send /probe-clear; snap clear
  send /probe-focus; snap focus-before
  tmux send-keys -t $S Tab; sleep 1; snap focus-on-chip
  tmux send-keys -t $S Escape; sleep 1
else
  send /probe-clear; snap "$MODE"
fi
send /exit; sleep 1
tmux kill-session -t $S 2>/dev/null

# T8 validation evidence — cases 3–9 (non-TTY, scratch project)

Recorded verbatim by the T8 Implementer on 2026-10-01; appended to the spec folder by the Leader (the file is the FR-11 record `execution.md` → T8 points at). Scratch projects: `/var/folders/.../tmp.jjgWhSYPfU` (cases 3–8; `git rev-parse --show-toplevel` failed there before `git init` — not inside the repo) and `.../tmp.ntKABk8hLg` (case 9, fresh, no answers file).

# T8 — non-TTY live cases 3–9 (changes/model-routing-configurator)

Run 2026-10-01 against `/Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js` at HEAD `08ab78d`.
Scratch project (cases 3–8): `/var/folders/g8/8wqxv48d60737hm79glkxx0w0000gn/T/tmp.jjgWhSYPfU` (a `mktemp -d`, outside the repository — `git rev-parse --show-toplevel` fails there before `git init`).
Case 9 runs in a second fresh `mktemp -d`: `/var/folders/g8/8wqxv48d60737hm79glkxx0w0000gn/T/tmp.ntKABk8hLg` (no git, no `.agents/`, no answers file).
Every block below is verbatim terminal output (stdout+stderr merged; ANSI escape bytes kept as printed). `exit=<n>` is the exit status of the whole block's command line.

### Setup
```
$ pwd; git -C /Users/jcadavid/Development/sdd-jc-methodology rev-parse --show-toplevel; git rev-parse --show-toplevel 2>&1 || true
/var/folders/g8/8wqxv48d60737hm79glkxx0w0000gn/T/tmp.jjgWhSYPfU
/Users/jcadavid/Development/sdd-jc-methodology
fatal: not a git repository (or any of the parent directories): .git
```
exit=0

```
$ git init -q && mkdir -p .agents && cp /Users/jcadavid/Development/sdd-jc-methodology/.claude/templates/{leader,implementer,reviewer,tester}.md .agents/ && ls .agents
implementer.md
leader.md
reviewer.md
tester.md
```
exit=0

```
$ printf "# Scratch Project\n\nThis is a scratch project used to exercise akili routing.\nIt has prose in its agent guide but no model routing section yet.\nAgents should follow the conventions below.\n\n## Conventions\n\n- Keep it simple.\n" > AGENTS.md && cat AGENTS.md
# Scratch Project

This is a scratch project used to exercise akili routing.
It has prose in its agent guide but no model routing section yet.
Agents should follow the conventions below.

## Conventions

- Keep it simple.
```
exit=0

```
$ git add -A && git commit -qm scaffold && git log --oneline
84e457b scaffold
```
exit=0


### Baseline (stands in for case 1)
```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --project . --hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=claude-opus-4-6@T1+T3,composer-2@T2+T5,claude-sonnet-4-6@T4+T6 --cli claude=claude --cli cursor=agent --wrappers yes --yes
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
appended  AGENTS.md
created  .claude/agents/akili-leader.md
created  .claude/agents/akili-implementer.md
created  .claude/agents/akili-reviewer.md
created  .claude/agents/akili-tester.md
created  .cursor/agents/akili-leader.md
created  .cursor/agents/akili-implementer.md
created  .cursor/agents/akili-reviewer.md
created  .cursor/agents/akili-tester.md
created  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it
[36mhint:[0m commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/
```
exit=0

```
$ ls .claude/agents .cursor/agents .agents
.agents:
implementer.md
leader.md
model-routing.json
reviewer.md
tester.md

.claude/agents:
akili-implementer.md
akili-leader.md
akili-reviewer.md
akili-tester.md

.cursor/agents:
akili-implementer.md
akili-leader.md
akili-reviewer.md
akili-tester.md
```
exit=0

```
$ cat AGENTS.md
# Scratch Project

This is a scratch project used to exercise akili routing.
It has prose in its agent guide but no model routing section yet.
Agents should follow the conventions below.

## Conventions

- Keep it simple.

<!-- akili:section id=model-routing since=v2.31.0 -->
## Model Routing

**Criteria first, model second:** each phase declares what it needs, the tier names that need, and only the registry below names models. Principles: match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; reserve deep reasoning for propose, specify, verify, **and the orchestrating Leader**; fast & cheap for archive and formatting only — **`tasks.md` decomposition is T1, not cheap formatting**.

### Capability tiers

| Tier | Definition |
|---|---|
| **T1 Architect** | Deep reasoning for architecture, trade-offs, intent, **task decomposition**, and **live orchestration judgment** (decomposition in flight, runtime skill selection, FAIL adjudication, pivot). |
| **T2 Coder** | Maximum coding throughput and instruction-following for writing and editing code and tests. |
| **T3 Auditor** | Independent critical review — conformance, bug-finding, drift; must differ from the author model. |
| **T4 Context-Ingest** | Large-context absorption of legacy codebases and baseline docs — window size over depth. |
| **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
| **T6 Multimodal** | Visual / UI-UX reasoning over images, screenshots, and design references. |

### Phase → tier mapping

| Phase / Role | Tier(s) |
|---|---|
| `/akili-constitution` | T4 + T1 |
| `/akili-propose` | T1 |
| `/akili-quick` | T2 |
| `/akili-specify` → requirements.md / design.md / tasks.md | T1 |
| `/akili-specify` → UX/UI design | T6 |
| `/akili-execute` → **Leader** (writes no code; selects skills, adjudicates FAILs, decides pivots) | T1 |
| `/akili-execute` → **Implementer** | T2 |
| `/akili-execute` → **Reviewer** | T3 |
| `/akili-execute` → **Verifier** (evidence re-run) | T5 |
| `/akili-test` → **Leader** (orchestration; writes no tests) | T1 |
| `/akili-test` → **Tester(s)** (test authoring) | T2 |
| `/akili-validate` | T3 |
| `/akili-audit` | T4 + T3 |
| `/akili-archive`, `/akili-resume` | T5 |
| `/akili-seo` | T3 + T5 |

**The Reviewer model MUST differ from the Implementer model** (author ≠ auditor): T2 and T3 resolve to different concrete models; if they collapse, escalate the Reviewer one tier. Prefer a Tester model different from the Implementer's (author ≠ tester).

### Model registry

Updated: 2026-10

**Alias-first rule:** the Claude Code column uses floating aliases (`opus`, `sonnet`, `haiku`), so it survives model churn with zero edits. Pin a dated model ID only when you deliberately want to freeze a version, and record why next to the pin. OpenCode slugs are concrete (no alias mechanism); a roster that is unknown takes a `<CONFIRM SLUG>` placeholder rather than a guess.

| Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |
|---|---|---|---|---|---|---|
| **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` Claude Opus family | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `composer-2` Composer family (Cursor-native) | `haiku` (Claude Code) · `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
| **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` GPT-5.6 Sol/Terra family *(≠ T2 — different vendor)* | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `claude-sonnet-4-6` Claude Sonnet family (1M context) | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
| **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `claude-sonnet-4-6` Gemini 3.8 Flash family (vision) | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |

No dated model ID is pinned.

**Antigravity** names the family and effort ID: Gemini 3.8 Flash for the volume tiers, Gemini 3.1 Pro as the T3 auditor, confirmed with `agy models`. Dial → ID map:

| Dial | `low` | `medium` | `high` / `xhigh` / `max` |
|---|---|---|---|
| Antigravity effort ID | `-low` | `-medium` | `-high` |

**Codex** names a tier family (Astra, Sol, Terra, Luna); the exact slug for the wrapper's `model =` is confirmed against the project's own `/model` roster **and account plan** — Astra and Sol are plan-gated. Where they are gated, keep author ≠ auditor with Reviewer `gpt-5.6-terra` ≠ Implementer `gpt-5.6-luna`.

**Cursor** names a tier family, not a slug — the roster is multi-vendor with no floating alias besides `auto`. Confirm the exact ID against the `/model` picker in the `agent` CLI; an effort parameter maps the dial as `low`→`[effort=low]`, `medium`→`[effort=medium]`, `high`/`xhigh`/`max`→`[effort=high]` `<CONFIRM>`; a model whose picker shows no effort parameter takes no bracket.

**Every host column stays, including hosts this session is not running in** — the registry belongs to the project, not to the session that wrote it. An unknown roster is a `<CONFIRM SLUG>` placeholder, never a dropped column.

**Author ≠ auditor per host:**

- **Claude Code:** Implementer (T2) `sonnet` ≠ Reviewer (T3) `opus`.
- **OpenCode:** packaged defaults — Implementer (T2) `opencode-go/deepseek-v4.1-flash` ≠ Reviewer (T3) `opencode-go/deepseek-v4-pro`.
- **Antigravity:** packaged defaults — Implementer (T2) `gemini-3.8-flash-medium` ≠ Reviewer (T3) `gemini-3.1-pro-high`.
- **Codex:** packaged defaults — Implementer (T2) `gpt-5.6-luna` ≠ Reviewer (T3) `gpt-5.6-terra`.
- **Cursor:** Implementer (T2) `composer-2` ≠ Reviewer (T3) `claude-opus-4-6`.

**CLI invocation per host** (confirmed with the user, never probed; unconfirmed values stay `<CONFIRM>`):

| Claude Code | OpenCode | Antigravity | Codex | Cursor |
|---|---|---|---|---|
| `claude` | `<CONFIRM>` | `<CONFIRM>` | `<CONFIRM>` | `agent` |

**Cross-host dispatch:** T6 Multimodal → Antigravity (packaged default) (not selected in this run). The line records the routing preference only, never the dispatcher. Reach across hosts before degrading within one, but only for a real capability gap — a cross-host spawn costs a fresh context, which a one-tier difference does not repay.

To change models, re-run `akili routing` — it regenerates only this fenced section — or remove the fence and edit the table by hand. Never pin a dated model name where a floating alias exists. Never add `model:` to command frontmatter; enforced bindings live only in the Step 8E agent wrappers.

*Generated by `akili routing` from `.agents/model-routing.json`; a hand edit inside this fence is refused on the next run unless `--force`.*

**Rate limits are per-generation, not per-family:** a new top-tier generation draws on its own quota, so moving T1/T3 onto it neither frees nor inherits headroom. **A frontier escalation pin** (e.g. `claude-fable-5` on T1/T3) is re-justified whenever the `opus` alias advances a generation: try the alias at `xhigh`/`max` before renewing the pin, and record the reason for the pin.

### Effort dial

Effort is the second, **per-task** routing dimension, orthogonal to the tier: the tier picks the model, effort picks how hard it thinks on *this* task. The `/akili-execute` and `/akili-test` Leaders read this subsection to set each worker's effort.

| Signal | Effort |
|---|---|
| Trivial / mechanical (copy, rename, style) | `low` |
| Standard task, clear scope | `medium` |
| Complex (algorithm, concurrency, security, ambiguity) | `xhigh` |
| Correctness-critical (can't be wrong, hard to revert) | `max` |

| Role / Phase | Default effort |
|---|---|
| T1 `/akili-propose` / `/akili-specify` / **Leader** | `high` |
| T2 **Implementer / Tester** | `medium` — flex by task |
| T3 **Reviewer** / `/akili-validate` | `high` |
| T5 `/akili-archive` / setup steps | `low` |

- **Rework:** bump effort one level on every retry.
- **Tier ↔ effort:** never `max` a cheaper tier — escalate the tier instead.
- **Re-baseline:** effort defaults are per-generation — sweep them (`medium`/`high`/`xhigh` on a real spec) whenever the model generation changes; the tier mapping survives churn, these defaults do not. A task that arrives under-specified (a `[~]` resume or a post-Pivot retry) starts one level higher.
- **Effort is not a verbosity dial:** lowering effort does not reliably shorten output — fix long reports in the brief (`caveman` / `cognitive-doc-design`), never by dropping effort.
<!-- /akili:section -->
```
exit=0

```
$ git add -A && git commit -qm baseline && git status --porcelain && git log --oneline
85d7a2e baseline
84e457b scaffold
```
exit=0


**Observed:** `appended  AGENTS.md`, `created` ×8 wrappers, `created  .agents/model-routing.json`, exit 0 — the Cursor ids were accepted as given (no reason/placement error, no adjustment needed). Committed as `baseline`.

### Case 3 — `no changes`; `git status --porcelain` empty

```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --yes
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
unchanged  AGENTS.md
unchanged  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
unchanged  .claude/agents/akili-tester.md
unchanged  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
unchanged  .cursor/agents/akili-tester.md
unchanged  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it
no changes
```
exit=0

```
$ git status --porcelain; echo "porcelain-lines=$(git status --porcelain | wc -l | tr -d " ")"
porcelain-lines=0
```
exit=0

**Observed:** `unchanged` on all 10 paths, final line `no changes`, exit 0; porcelain empty (0 lines) — matches expectation.

### Case 4 — `refused (hand-edited fence; --force to regenerate)`, exit 1; `--force` → `overwritten`

Setup edit: the Claude Code cell of the T5 row inside the fence, `` `haiku` `` → `` `sonnet` `` (line 61), via the `sed` below.

```
$ sed -i '' 's/^| \*\*T5 Fast-Cheap\*\* | `haiku` |/| **T5 Fast-Cheap** | `sonnet` |/' AGENTS.md && grep -n 'T5 Fast-Cheap\*\* |' AGENTS.md
24:| **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
61:| **T5 Fast-Cheap** | `sonnet` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
```
exit=0

```
$ git diff AGENTS.md
diff --git a/AGENTS.md b/AGENTS.md
index 9d43ab3..8935f5a 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -58,7 +58,7 @@ Updated: 2026-10
 | **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `composer-2` Composer family (Cursor-native) | `haiku` (Claude Code) · `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
 | **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` GPT-5.6 Sol/Terra family *(≠ T2 — different vendor)* | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
 | **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `claude-sonnet-4-6` Claude Sonnet family (1M context) | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
-| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
+| **T5 Fast-Cheap** | `sonnet` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
 | **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `claude-sonnet-4-6` Gemini 3.8 Flash family (vision) | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
 
 No dated model ID is pinned.
```
exit=0

```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --yes
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
refused (hand-edited fence; --force to regenerate)  AGENTS.md
unchanged  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
unchanged  .claude/agents/akili-tester.md
unchanged  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
unchanged  .cursor/agents/akili-tester.md
unchanged  .agents/model-routing.json
    --- AGENTS.md (current)
    +++ AGENTS.md (akili routing)
    @@ -1,110 +1,110 @@
     ## Model Routing
     
     **Criteria first, model second:** each phase declares what it needs, the tier names that need, and only the registry below names models. Principles: match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; reserve deep reasoning for propose, specify, verify, **and the orchestrating Leader**; fast & cheap for archive and formatting only — **`tasks.md` decomposition is T1, not cheap formatting**.
     
     ### Capability tiers
     
     | Tier | Definition |
     |---|---|
     | **T1 Architect** | Deep reasoning for architecture, trade-offs, intent, **task decomposition**, and **live orchestration judgment** (decomposition in flight, runtime skill selection, FAIL adjudication, pivot). |
     | **T2 Coder** | Maximum coding throughput and instruction-following for writing and editing code and tests. |
     | **T3 Auditor** | Independent critical review — conformance, bug-finding, drift; must differ from the author model. |
     | **T4 Context-Ingest** | Large-context absorption of legacy codebases and baseline docs — window size over depth. |
     | **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
     | **T6 Multimodal** | Visual / UI-UX reasoning over images, screenshots, and design references. |
     
     ### Phase → tier mapping
     
     | Phase / Role | Tier(s) |
     |---|---|
     | `/akili-constitution` | T4 + T1 |
     | `/akili-propose` | T1 |
     | `/akili-quick` | T2 |
     | `/akili-specify` → requirements.md / design.md / tasks.md | T1 |
     | `/akili-specify` → UX/UI design | T6 |
     | `/akili-execute` → **Leader** (writes no code; selects skills, adjudicates FAILs, decides pivots) | T1 |
     | `/akili-execute` → **Implementer** | T2 |
     | `/akili-execute` → **Reviewer** | T3 |
     | `/akili-execute` → **Verifier** (evidence re-run) | T5 |
     | `/akili-test` → **Leader** (orchestration; writes no tests) | T1 |
     | `/akili-test` → **Tester(s)** (test authoring) | T2 |
     | `/akili-validate` | T3 |
     | `/akili-audit` | T4 + T3 |
     | `/akili-archive`, `/akili-resume` | T5 |
     | `/akili-seo` | T3 + T5 |
     
     **The Reviewer model MUST differ from the Implementer model** (author ≠ auditor): T2 and T3 resolve to different concrete models; if they collapse, escalate the Reviewer one tier. Prefer a Tester model different from the Implementer's (author ≠ tester).
     
     ### Model registry
     
     Updated: 2026-10
     
     **Alias-first rule:** the Claude Code column uses floating aliases (`opus`, `sonnet`, `haiku`), so it survives model churn with zero edits. Pin a dated model ID only when you deliberately want to freeze a version, and record why next to the pin. OpenCode slugs are concrete (no alias mechanism); a roster that is unknown takes a `<CONFIRM SLUG>` placeholder rather than a guess.
     
     | Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |
     |---|---|---|---|---|---|---|
     | **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` Claude Opus family | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `composer-2` Composer family (Cursor-native) | `haiku` (Claude Code) · `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
     | **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` GPT-5.6 Sol/Terra family *(≠ T2 — different vendor)* | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `claude-sonnet-4-6` Claude Sonnet family (1M context) | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
    +| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
    -| **T5 Fast-Cheap** | `sonnet` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
     | **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `claude-sonnet-4-6` Gemini 3.8 Flash family (vision) | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     
     No dated model ID is pinned.
     
     **Antigravity** names the family and effort ID: Gemini 3.8 Flash for the volume tiers, Gemini 3.1 Pro as the T3 auditor, confirmed with `agy models`. Dial → ID map:
     
     | Dial | `low` | `medium` | `high` / `xhigh` / `max` |
     |---|---|---|---|
     | Antigravity effort ID | `-low` | `-medium` | `-high` |
     
     **Codex** names a tier family (Astra, Sol, Terra, Luna); the exact slug for the wrapper's `model =` is confirmed against the project's own `/model` roster **and account plan** — Astra and Sol are plan-gated. Where they are gated, keep author ≠ auditor with Reviewer `gpt-5.6-terra` ≠ Implementer `gpt-5.6-luna`.
     
     **Cursor** names a tier family, not a slug — the roster is multi-vendor with no floating alias besides `auto`. Confirm the exact ID against the `/model` picker in the `agent` CLI; an effort parameter maps the dial as `low`→`[effort=low]`, `medium`→`[effort=medium]`, `high`/`xhigh`/`max`→`[effort=high]` `<CONFIRM>`; a model whose picker shows no effort parameter takes no bracket.
     
     **Every host column stays, including hosts this session is not running in** — the registry belongs to the project, not to the session that wrote it. An unknown roster is a `<CONFIRM SLUG>` placeholder, never a dropped column.
     
     **Author ≠ auditor per host:**
     
     - **Claude Code:** Implementer (T2) `sonnet` ≠ Reviewer (T3) `opus`.
     - **OpenCode:** packaged defaults — Implementer (T2) `opencode-go/deepseek-v4.1-flash` ≠ Reviewer (T3) `opencode-go/deepseek-v4-pro`.
     - **Antigravity:** packaged defaults — Implementer (T2) `gemini-3.8-flash-medium` ≠ Reviewer (T3) `gemini-3.1-pro-high`.
     - **Codex:** packaged defaults — Implementer (T2) `gpt-5.6-luna` ≠ Reviewer (T3) `gpt-5.6-terra`.
     - **Cursor:** Implementer (T2) `composer-2` ≠ Reviewer (T3) `claude-opus-4-6`.
     
     **CLI invocation per host** (confirmed with the user, never probed; unconfirmed values stay `<CONFIRM>`):
     
     | Claude Code | OpenCode | Antigravity | Codex | Cursor |
     |---|---|---|---|---|
     | `claude` | `<CONFIRM>` | `<CONFIRM>` | `<CONFIRM>` | `agent` |
     
     **Cross-host dispatch:** T6 Multimodal → Antigravity (packaged default) (not selected in this run). The line records the routing preference only, never the dispatcher. Reach across hosts before degrading within one, but only for a real capability gap — a cross-host spawn costs a fresh context, which a one-tier difference does not repay.
     
     To change models, re-run `akili routing` — it regenerates only this fenced section — or remove the fence and edit the table by hand. Never pin a dated model name where a floating alias exists. Never add `model:` to command frontmatter; enforced bindings live only in the Step 8E agent wrappers.
     
     *Generated by `akili routing` from `.agents/model-routing.json`; a hand edit inside this fence is refused on the next run unless `--force`.*
     
     **Rate limits are per-generation, not per-family:** a new top-tier generation draws on its own quota, so moving T1/T3 onto it neither frees nor inherits headroom. **A frontier escalation pin** (e.g. `claude-fable-5` on T1/T3) is re-justified whenever the `opus` alias advances a generation: try the alias at `xhigh`/`max` before renewing the pin, and record the reason for the pin.
     
     ### Effort dial
     
     Effort is the second, **per-task** routing dimension, orthogonal to the tier: the tier picks the model, effort picks how hard it thinks on *this* task. The `/akili-execute` and `/akili-test` Leaders read this subsection to set each worker's effort.
     
     | Signal | Effort |
     |---|---|
     | Trivial / mechanical (copy, rename, style) | `low` |
     | Standard task, clear scope | `medium` |
     | Complex (algorithm, concurrency, security, ambiguity) | `xhigh` |
     | Correctness-critical (can't be wrong, hard to revert) | `max` |
     
     | Role / Phase | Default effort |
     |---|---|
     | T1 `/akili-propose` / `/akili-specify` / **Leader** | `high` |
     | T2 **Implementer / Tester** | `medium` — flex by task |
     | T3 **Reviewer** / `/akili-validate` | `high` |
     | T5 `/akili-archive` / setup steps | `low` |
     
     - **Rework:** bump effort one level on every retry.
     - **Tier ↔ effort:** never `max` a cheaper tier — escalate the tier instead.
     - **Re-baseline:** effort defaults are per-generation — sweep them (`medium`/`high`/`xhigh` on a real spec) whenever the model generation changes; the tier mapping survives churn, these defaults do not. A task that arrives under-specified (a `[~]` resume or a post-Pivot retry) starts one level higher.
     - **Effort is not a verbosity dial:** lowering effort does not reliably shorten output — fix long reports in the brief (`caveman` / `cognitive-doc-design`), never by dropping effort.
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it
```
exit=1

```
$ git status --porcelain; grep -n "T5 Fast-Cheap\*\* |" AGENTS.md
 M AGENTS.md
24:| **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
61:| **T5 Fast-Cheap** | `sonnet` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
```
exit=0

```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --yes --force
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
overwritten  AGENTS.md
unchanged  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
unchanged  .claude/agents/akili-tester.md
unchanged  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
unchanged  .cursor/agents/akili-tester.md
unchanged  .agents/model-routing.json
    --- AGENTS.md (current)
    +++ AGENTS.md (akili routing)
    @@ -1,110 +1,110 @@
     ## Model Routing
     
     **Criteria first, model second:** each phase declares what it needs, the tier names that need, and only the registry below names models. Principles: match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; reserve deep reasoning for propose, specify, verify, **and the orchestrating Leader**; fast & cheap for archive and formatting only — **`tasks.md` decomposition is T1, not cheap formatting**.
     
     ### Capability tiers
     
     | Tier | Definition |
     |---|---|
     | **T1 Architect** | Deep reasoning for architecture, trade-offs, intent, **task decomposition**, and **live orchestration judgment** (decomposition in flight, runtime skill selection, FAIL adjudication, pivot). |
     | **T2 Coder** | Maximum coding throughput and instruction-following for writing and editing code and tests. |
     | **T3 Auditor** | Independent critical review — conformance, bug-finding, drift; must differ from the author model. |
     | **T4 Context-Ingest** | Large-context absorption of legacy codebases and baseline docs — window size over depth. |
     | **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
     | **T6 Multimodal** | Visual / UI-UX reasoning over images, screenshots, and design references. |
     
     ### Phase → tier mapping
     
     | Phase / Role | Tier(s) |
     |---|---|
     | `/akili-constitution` | T4 + T1 |
     | `/akili-propose` | T1 |
     | `/akili-quick` | T2 |
     | `/akili-specify` → requirements.md / design.md / tasks.md | T1 |
     | `/akili-specify` → UX/UI design | T6 |
     | `/akili-execute` → **Leader** (writes no code; selects skills, adjudicates FAILs, decides pivots) | T1 |
     | `/akili-execute` → **Implementer** | T2 |
     | `/akili-execute` → **Reviewer** | T3 |
     | `/akili-execute` → **Verifier** (evidence re-run) | T5 |
     | `/akili-test` → **Leader** (orchestration; writes no tests) | T1 |
     | `/akili-test` → **Tester(s)** (test authoring) | T2 |
     | `/akili-validate` | T3 |
     | `/akili-audit` | T4 + T3 |
     | `/akili-archive`, `/akili-resume` | T5 |
     | `/akili-seo` | T3 + T5 |
     
     **The Reviewer model MUST differ from the Implementer model** (author ≠ auditor): T2 and T3 resolve to different concrete models; if they collapse, escalate the Reviewer one tier. Prefer a Tester model different from the Implementer's (author ≠ tester).
     
     ### Model registry
     
     Updated: 2026-10
     
     **Alias-first rule:** the Claude Code column uses floating aliases (`opus`, `sonnet`, `haiku`), so it survives model churn with zero edits. Pin a dated model ID only when you deliberately want to freeze a version, and record why next to the pin. OpenCode slugs are concrete (no alias mechanism); a roster that is unknown takes a `<CONFIRM SLUG>` placeholder rather than a guess.
     
     | Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |
     |---|---|---|---|---|---|---|
     | **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` Claude Opus family | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `composer-2` Composer family (Cursor-native) | `haiku` (Claude Code) · `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
     | **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` GPT-5.6 Sol/Terra family *(≠ T2 — different vendor)* | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `claude-sonnet-4-6` Claude Sonnet family (1M context) | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
    +| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
    -| **T5 Fast-Cheap** | `sonnet` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
     | **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `claude-sonnet-4-6` Gemini 3.8 Flash family (vision) | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     
     No dated model ID is pinned.
     
     **Antigravity** names the family and effort ID: Gemini 3.8 Flash for the volume tiers, Gemini 3.1 Pro as the T3 auditor, confirmed with `agy models`. Dial → ID map:
     
     | Dial | `low` | `medium` | `high` / `xhigh` / `max` |
     |---|---|---|---|
     | Antigravity effort ID | `-low` | `-medium` | `-high` |
     
     **Codex** names a tier family (Astra, Sol, Terra, Luna); the exact slug for the wrapper's `model =` is confirmed against the project's own `/model` roster **and account plan** — Astra and Sol are plan-gated. Where they are gated, keep author ≠ auditor with Reviewer `gpt-5.6-terra` ≠ Implementer `gpt-5.6-luna`.
     
     **Cursor** names a tier family, not a slug — the roster is multi-vendor with no floating alias besides `auto`. Confirm the exact ID against the `/model` picker in the `agent` CLI; an effort parameter maps the dial as `low`→`[effort=low]`, `medium`→`[effort=medium]`, `high`/`xhigh`/`max`→`[effort=high]` `<CONFIRM>`; a model whose picker shows no effort parameter takes no bracket.
     
     **Every host column stays, including hosts this session is not running in** — the registry belongs to the project, not to the session that wrote it. An unknown roster is a `<CONFIRM SLUG>` placeholder, never a dropped column.
     
     **Author ≠ auditor per host:**
     
     - **Claude Code:** Implementer (T2) `sonnet` ≠ Reviewer (T3) `opus`.
     - **OpenCode:** packaged defaults — Implementer (T2) `opencode-go/deepseek-v4.1-flash` ≠ Reviewer (T3) `opencode-go/deepseek-v4-pro`.
     - **Antigravity:** packaged defaults — Implementer (T2) `gemini-3.8-flash-medium` ≠ Reviewer (T3) `gemini-3.1-pro-high`.
     - **Codex:** packaged defaults — Implementer (T2) `gpt-5.6-luna` ≠ Reviewer (T3) `gpt-5.6-terra`.
     - **Cursor:** Implementer (T2) `composer-2` ≠ Reviewer (T3) `claude-opus-4-6`.
     
     **CLI invocation per host** (confirmed with the user, never probed; unconfirmed values stay `<CONFIRM>`):
     
     | Claude Code | OpenCode | Antigravity | Codex | Cursor |
     |---|---|---|---|---|
     | `claude` | `<CONFIRM>` | `<CONFIRM>` | `<CONFIRM>` | `agent` |
     
     **Cross-host dispatch:** T6 Multimodal → Antigravity (packaged default) (not selected in this run). The line records the routing preference only, never the dispatcher. Reach across hosts before degrading within one, but only for a real capability gap — a cross-host spawn costs a fresh context, which a one-tier difference does not repay.
     
     To change models, re-run `akili routing` — it regenerates only this fenced section — or remove the fence and edit the table by hand. Never pin a dated model name where a floating alias exists. Never add `model:` to command frontmatter; enforced bindings live only in the Step 8E agent wrappers.
     
     *Generated by `akili routing` from `.agents/model-routing.json`; a hand edit inside this fence is refused on the next run unless `--force`.*
     
     **Rate limits are per-generation, not per-family:** a new top-tier generation draws on its own quota, so moving T1/T3 onto it neither frees nor inherits headroom. **A frontier escalation pin** (e.g. `claude-fable-5` on T1/T3) is re-justified whenever the `opus` alias advances a generation: try the alias at `xhigh`/`max` before renewing the pin, and record the reason for the pin.
     
     ### Effort dial
     
     Effort is the second, **per-task** routing dimension, orthogonal to the tier: the tier picks the model, effort picks how hard it thinks on *this* task. The `/akili-execute` and `/akili-test` Leaders read this subsection to set each worker's effort.
     
     | Signal | Effort |
     |---|---|
     | Trivial / mechanical (copy, rename, style) | `low` |
     | Standard task, clear scope | `medium` |
     | Complex (algorithm, concurrency, security, ambiguity) | `xhigh` |
     | Correctness-critical (can't be wrong, hard to revert) | `max` |
     
     | Role / Phase | Default effort |
     |---|---|
     | T1 `/akili-propose` / `/akili-specify` / **Leader** | `high` |
     | T2 **Implementer / Tester** | `medium` — flex by task |
     | T3 **Reviewer** / `/akili-validate` | `high` |
     | T5 `/akili-archive` / setup steps | `low` |
     
     - **Rework:** bump effort one level on every retry.
     - **Tier ↔ effort:** never `max` a cheaper tier — escalate the tier instead.
     - **Re-baseline:** effort defaults are per-generation — sweep them (`medium`/`high`/`xhigh` on a real spec) whenever the model generation changes; the tier mapping survives churn, these defaults do not. A task that arrives under-specified (a `[~]` resume or a post-Pivot retry) starts one level higher.
     - **Effort is not a verbosity dial:** lowering effort does not reliably shorten output — fix long reports in the brief (`caveman` / `cognitive-doc-design`), never by dropping effort.
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it
```
exit=0

```
$ git status --porcelain; echo "porcelain-lines=$(git status --porcelain | wc -l | tr -d " ")"; grep -n "T5 Fast-Cheap\*\* |" AGENTS.md
porcelain-lines=0
24:| **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
61:| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
```
exit=0

**Observed:** hand-edited run printed `refused (hand-edited fence; --force to regenerate)  AGENTS.md` plus the diff, exit 1, file left as edited (` M AGENTS.md`, cell still `sonnet`); `--force` run printed `overwritten  AGENTS.md`, exit 0, cell back to `haiku`, porcelain empty — matches expectation.

### Case 5 — `--yes` → `skipped (unfenced; --adopt to replace)`; `--adopt --yes` → `adopted`

Setup edit: deleted the two fence-marker lines (`<!-- akili:section id=model-routing since=v2.31.0 -->` and `<!-- /akili:section -->`), leaving an unfenced `## Model Routing` with the same body.

```
$ sed -i '' -e '/^<!-- akili:section id=model-routing since=v2.31.0 -->$/d' -e '/^<!-- \/akili:section -->$/d' AGENTS.md && grep -n -e 'akili:section' -e '^## ' AGENTS.md; git diff --stat
7:## Conventions
11:## Model Routing
 AGENTS.md | 2 --
 1 file changed, 2 deletions(-)
```
exit=0

```
$ git diff AGENTS.md
diff --git a/AGENTS.md b/AGENTS.md
index 9d43ab3..e495a69 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -8,7 +8,6 @@ Agents should follow the conventions below.
 
 - Keep it simple.
 
-<!-- akili:section id=model-routing since=v2.31.0 -->
 ## Model Routing
 
 **Criteria first, model second:** each phase declares what it needs, the tier names that need, and only the registry below names models. Principles: match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; reserve deep reasoning for propose, specify, verify, **and the orchestrating Leader**; fast & cheap for archive and formatting only — **`tasks.md` decomposition is T1, not cheap formatting**.
@@ -119,4 +118,3 @@ Effort is the second, **per-task** routing dimension, orthogonal to the tier: th
 - **Tier ↔ effort:** never `max` a cheaper tier — escalate the tier instead.
 - **Re-baseline:** effort defaults are per-generation — sweep them (`medium`/`high`/`xhigh` on a real spec) whenever the model generation changes; the tier mapping survives churn, these defaults do not. A task that arrives under-specified (a `[~]` resume or a post-Pivot retry) starts one level higher.
 - **Effort is not a verbosity dial:** lowering effort does not reliably shorten output — fix long reports in the brief (`caveman` / `cognitive-doc-design`), never by dropping effort.
-<!-- /akili:section -->
```
exit=0

```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --yes
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
skipped (unfenced; --adopt to replace)  AGENTS.md
unchanged  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
unchanged  .claude/agents/akili-tester.md
unchanged  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
unchanged  .cursor/agents/akili-tester.md
unchanged  .agents/model-routing.json
    --- AGENTS.md (current)
    +++ AGENTS.md (akili routing)
    @@ -1,110 +1,112 @@
    +<!-- akili:section id=model-routing since=v2.31.0 -->
     ## Model Routing
     
     **Criteria first, model second:** each phase declares what it needs, the tier names that need, and only the registry below names models. Principles: match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; reserve deep reasoning for propose, specify, verify, **and the orchestrating Leader**; fast & cheap for archive and formatting only — **`tasks.md` decomposition is T1, not cheap formatting**.
     
     ### Capability tiers
     
     | Tier | Definition |
     |---|---|
     | **T1 Architect** | Deep reasoning for architecture, trade-offs, intent, **task decomposition**, and **live orchestration judgment** (decomposition in flight, runtime skill selection, FAIL adjudication, pivot). |
     | **T2 Coder** | Maximum coding throughput and instruction-following for writing and editing code and tests. |
     | **T3 Auditor** | Independent critical review — conformance, bug-finding, drift; must differ from the author model. |
     | **T4 Context-Ingest** | Large-context absorption of legacy codebases and baseline docs — window size over depth. |
     | **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
     | **T6 Multimodal** | Visual / UI-UX reasoning over images, screenshots, and design references. |
     
     ### Phase → tier mapping
     
     | Phase / Role | Tier(s) |
     |---|---|
     | `/akili-constitution` | T4 + T1 |
     | `/akili-propose` | T1 |
     | `/akili-quick` | T2 |
     | `/akili-specify` → requirements.md / design.md / tasks.md | T1 |
     | `/akili-specify` → UX/UI design | T6 |
     | `/akili-execute` → **Leader** (writes no code; selects skills, adjudicates FAILs, decides pivots) | T1 |
     | `/akili-execute` → **Implementer** | T2 |
     | `/akili-execute` → **Reviewer** | T3 |
     | `/akili-execute` → **Verifier** (evidence re-run) | T5 |
     | `/akili-test` → **Leader** (orchestration; writes no tests) | T1 |
     | `/akili-test` → **Tester(s)** (test authoring) | T2 |
     | `/akili-validate` | T3 |
     | `/akili-audit` | T4 + T3 |
     | `/akili-archive`, `/akili-resume` | T5 |
     | `/akili-seo` | T3 + T5 |
     
     **The Reviewer model MUST differ from the Implementer model** (author ≠ auditor): T2 and T3 resolve to different concrete models; if they collapse, escalate the Reviewer one tier. Prefer a Tester model different from the Implementer's (author ≠ tester).
     
     ### Model registry
     
     Updated: 2026-10
     
     **Alias-first rule:** the Claude Code column uses floating aliases (`opus`, `sonnet`, `haiku`), so it survives model churn with zero edits. Pin a dated model ID only when you deliberately want to freeze a version, and record why next to the pin. OpenCode slugs are concrete (no alias mechanism); a roster that is unknown takes a `<CONFIRM SLUG>` placeholder rather than a guess.
     
     | Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |
     |---|---|---|---|---|---|---|
     | **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` Claude Opus family | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `composer-2` Composer family (Cursor-native) | `haiku` (Claude Code) · `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
     | **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` GPT-5.6 Sol/Terra family *(≠ T2 — different vendor)* | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `claude-sonnet-4-6` Claude Sonnet family (1M context) | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
     | **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `claude-sonnet-4-6` Gemini 3.8 Flash family (vision) | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     
     No dated model ID is pinned.
     
     **Antigravity** names the family and effort ID: Gemini 3.8 Flash for the volume tiers, Gemini 3.1 Pro as the T3 auditor, confirmed with `agy models`. Dial → ID map:
     
     | Dial | `low` | `medium` | `high` / `xhigh` / `max` |
     |---|---|---|---|
     | Antigravity effort ID | `-low` | `-medium` | `-high` |
     
     **Codex** names a tier family (Astra, Sol, Terra, Luna); the exact slug for the wrapper's `model =` is confirmed against the project's own `/model` roster **and account plan** — Astra and Sol are plan-gated. Where they are gated, keep author ≠ auditor with Reviewer `gpt-5.6-terra` ≠ Implementer `gpt-5.6-luna`.
     
     **Cursor** names a tier family, not a slug — the roster is multi-vendor with no floating alias besides `auto`. Confirm the exact ID against the `/model` picker in the `agent` CLI; an effort parameter maps the dial as `low`→`[effort=low]`, `medium`→`[effort=medium]`, `high`/`xhigh`/`max`→`[effort=high]` `<CONFIRM>`; a model whose picker shows no effort parameter takes no bracket.
     
     **Every host column stays, including hosts this session is not running in** — the registry belongs to the project, not to the session that wrote it. An unknown roster is a `<CONFIRM SLUG>` placeholder, never a dropped column.
     
     **Author ≠ auditor per host:**
     
     - **Claude Code:** Implementer (T2) `sonnet` ≠ Reviewer (T3) `opus`.
     - **OpenCode:** packaged defaults — Implementer (T2) `opencode-go/deepseek-v4.1-flash` ≠ Reviewer (T3) `opencode-go/deepseek-v4-pro`.
     - **Antigravity:** packaged defaults — Implementer (T2) `gemini-3.8-flash-medium` ≠ Reviewer (T3) `gemini-3.1-pro-high`.
     - **Codex:** packaged defaults — Implementer (T2) `gpt-5.6-luna` ≠ Reviewer (T3) `gpt-5.6-terra`.
     - **Cursor:** Implementer (T2) `composer-2` ≠ Reviewer (T3) `claude-opus-4-6`.
     
     **CLI invocation per host** (confirmed with the user, never probed; unconfirmed values stay `<CONFIRM>`):
     
     | Claude Code | OpenCode | Antigravity | Codex | Cursor |
     |---|---|---|---|---|
     | `claude` | `<CONFIRM>` | `<CONFIRM>` | `<CONFIRM>` | `agent` |
     
     **Cross-host dispatch:** T6 Multimodal → Antigravity (packaged default) (not selected in this run). The line records the routing preference only, never the dispatcher. Reach across hosts before degrading within one, but only for a real capability gap — a cross-host spawn costs a fresh context, which a one-tier difference does not repay.
     
     To change models, re-run `akili routing` — it regenerates only this fenced section — or remove the fence and edit the table by hand. Never pin a dated model name where a floating alias exists. Never add `model:` to command frontmatter; enforced bindings live only in the Step 8E agent wrappers.
     
     *Generated by `akili routing` from `.agents/model-routing.json`; a hand edit inside this fence is refused on the next run unless `--force`.*
     
     **Rate limits are per-generation, not per-family:** a new top-tier generation draws on its own quota, so moving T1/T3 onto it neither frees nor inherits headroom. **A frontier escalation pin** (e.g. `claude-fable-5` on T1/T3) is re-justified whenever the `opus` alias advances a generation: try the alias at `xhigh`/`max` before renewing the pin, and record the reason for the pin.
     
     ### Effort dial
     
     Effort is the second, **per-task** routing dimension, orthogonal to the tier: the tier picks the model, effort picks how hard it thinks on *this* task. The `/akili-execute` and `/akili-test` Leaders read this subsection to set each worker's effort.
     
     | Signal | Effort |
     |---|---|
     | Trivial / mechanical (copy, rename, style) | `low` |
     | Standard task, clear scope | `medium` |
     | Complex (algorithm, concurrency, security, ambiguity) | `xhigh` |
     | Correctness-critical (can't be wrong, hard to revert) | `max` |
     
     | Role / Phase | Default effort |
     |---|---|
     | T1 `/akili-propose` / `/akili-specify` / **Leader** | `high` |
     | T2 **Implementer / Tester** | `medium` — flex by task |
     | T3 **Reviewer** / `/akili-validate` | `high` |
     | T5 `/akili-archive` / setup steps | `low` |
     
     - **Rework:** bump effort one level on every retry.
     - **Tier ↔ effort:** never `max` a cheaper tier — escalate the tier instead.
     - **Re-baseline:** effort defaults are per-generation — sweep them (`medium`/`high`/`xhigh` on a real spec) whenever the model generation changes; the tier mapping survives churn, these defaults do not. A task that arrives under-specified (a `[~]` resume or a post-Pivot retry) starts one level higher.
     - **Effort is not a verbosity dial:** lowering effort does not reliably shorten output — fix long reports in the brief (`caveman` / `cognitive-doc-design`), never by dropping effort.
    +<!-- /akili:section -->
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it
no changes
```
exit=0

```
$ git status --porcelain; grep -n -e "akili:section" -e "^## " AGENTS.md
 M AGENTS.md
7:## Conventions
11:## Model Routing
```
exit=0

```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --adopt --yes
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
adopted  AGENTS.md
unchanged  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
unchanged  .claude/agents/akili-tester.md
unchanged  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
unchanged  .cursor/agents/akili-tester.md
unchanged  .agents/model-routing.json
    --- AGENTS.md (current)
    +++ AGENTS.md (akili routing)
    @@ -1,110 +1,112 @@
    +<!-- akili:section id=model-routing since=v2.31.0 -->
     ## Model Routing
     
     **Criteria first, model second:** each phase declares what it needs, the tier names that need, and only the registry below names models. Principles: match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; reserve deep reasoning for propose, specify, verify, **and the orchestrating Leader**; fast & cheap for archive and formatting only — **`tasks.md` decomposition is T1, not cheap formatting**.
     
     ### Capability tiers
     
     | Tier | Definition |
     |---|---|
     | **T1 Architect** | Deep reasoning for architecture, trade-offs, intent, **task decomposition**, and **live orchestration judgment** (decomposition in flight, runtime skill selection, FAIL adjudication, pivot). |
     | **T2 Coder** | Maximum coding throughput and instruction-following for writing and editing code and tests. |
     | **T3 Auditor** | Independent critical review — conformance, bug-finding, drift; must differ from the author model. |
     | **T4 Context-Ingest** | Large-context absorption of legacy codebases and baseline docs — window size over depth. |
     | **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
     | **T6 Multimodal** | Visual / UI-UX reasoning over images, screenshots, and design references. |
     
     ### Phase → tier mapping
     
     | Phase / Role | Tier(s) |
     |---|---|
     | `/akili-constitution` | T4 + T1 |
     | `/akili-propose` | T1 |
     | `/akili-quick` | T2 |
     | `/akili-specify` → requirements.md / design.md / tasks.md | T1 |
     | `/akili-specify` → UX/UI design | T6 |
     | `/akili-execute` → **Leader** (writes no code; selects skills, adjudicates FAILs, decides pivots) | T1 |
     | `/akili-execute` → **Implementer** | T2 |
     | `/akili-execute` → **Reviewer** | T3 |
     | `/akili-execute` → **Verifier** (evidence re-run) | T5 |
     | `/akili-test` → **Leader** (orchestration; writes no tests) | T1 |
     | `/akili-test` → **Tester(s)** (test authoring) | T2 |
     | `/akili-validate` | T3 |
     | `/akili-audit` | T4 + T3 |
     | `/akili-archive`, `/akili-resume` | T5 |
     | `/akili-seo` | T3 + T5 |
     
     **The Reviewer model MUST differ from the Implementer model** (author ≠ auditor): T2 and T3 resolve to different concrete models; if they collapse, escalate the Reviewer one tier. Prefer a Tester model different from the Implementer's (author ≠ tester).
     
     ### Model registry
     
     Updated: 2026-10
     
     **Alias-first rule:** the Claude Code column uses floating aliases (`opus`, `sonnet`, `haiku`), so it survives model churn with zero edits. Pin a dated model ID only when you deliberately want to freeze a version, and record why next to the pin. OpenCode slugs are concrete (no alias mechanism); a roster that is unknown takes a `<CONFIRM SLUG>` placeholder rather than a guess.
     
     | Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |
     |---|---|---|---|---|---|---|
     | **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` Claude Opus family | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `composer-2` Composer family (Cursor-native) | `haiku` (Claude Code) · `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
     | **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` GPT-5.6 Sol/Terra family *(≠ T2 — different vendor)* | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `claude-sonnet-4-6` Claude Sonnet family (1M context) | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     | **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
     | **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `claude-sonnet-4-6` Gemini 3.8 Flash family (vision) | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
     
     No dated model ID is pinned.
     
     **Antigravity** names the family and effort ID: Gemini 3.8 Flash for the volume tiers, Gemini 3.1 Pro as the T3 auditor, confirmed with `agy models`. Dial → ID map:
     
     | Dial | `low` | `medium` | `high` / `xhigh` / `max` |
     |---|---|---|---|
     | Antigravity effort ID | `-low` | `-medium` | `-high` |
     
     **Codex** names a tier family (Astra, Sol, Terra, Luna); the exact slug for the wrapper's `model =` is confirmed against the project's own `/model` roster **and account plan** — Astra and Sol are plan-gated. Where they are gated, keep author ≠ auditor with Reviewer `gpt-5.6-terra` ≠ Implementer `gpt-5.6-luna`.
     
     **Cursor** names a tier family, not a slug — the roster is multi-vendor with no floating alias besides `auto`. Confirm the exact ID against the `/model` picker in the `agent` CLI; an effort parameter maps the dial as `low`→`[effort=low]`, `medium`→`[effort=medium]`, `high`/`xhigh`/`max`→`[effort=high]` `<CONFIRM>`; a model whose picker shows no effort parameter takes no bracket.
     
     **Every host column stays, including hosts this session is not running in** — the registry belongs to the project, not to the session that wrote it. An unknown roster is a `<CONFIRM SLUG>` placeholder, never a dropped column.
     
     **Author ≠ auditor per host:**
     
     - **Claude Code:** Implementer (T2) `sonnet` ≠ Reviewer (T3) `opus`.
     - **OpenCode:** packaged defaults — Implementer (T2) `opencode-go/deepseek-v4.1-flash` ≠ Reviewer (T3) `opencode-go/deepseek-v4-pro`.
     - **Antigravity:** packaged defaults — Implementer (T2) `gemini-3.8-flash-medium` ≠ Reviewer (T3) `gemini-3.1-pro-high`.
     - **Codex:** packaged defaults — Implementer (T2) `gpt-5.6-luna` ≠ Reviewer (T3) `gpt-5.6-terra`.
     - **Cursor:** Implementer (T2) `composer-2` ≠ Reviewer (T3) `claude-opus-4-6`.
     
     **CLI invocation per host** (confirmed with the user, never probed; unconfirmed values stay `<CONFIRM>`):
     
     | Claude Code | OpenCode | Antigravity | Codex | Cursor |
     |---|---|---|---|---|
     | `claude` | `<CONFIRM>` | `<CONFIRM>` | `<CONFIRM>` | `agent` |
     
     **Cross-host dispatch:** T6 Multimodal → Antigravity (packaged default) (not selected in this run). The line records the routing preference only, never the dispatcher. Reach across hosts before degrading within one, but only for a real capability gap — a cross-host spawn costs a fresh context, which a one-tier difference does not repay.
     
     To change models, re-run `akili routing` — it regenerates only this fenced section — or remove the fence and edit the table by hand. Never pin a dated model name where a floating alias exists. Never add `model:` to command frontmatter; enforced bindings live only in the Step 8E agent wrappers.
     
     *Generated by `akili routing` from `.agents/model-routing.json`; a hand edit inside this fence is refused on the next run unless `--force`.*
     
     **Rate limits are per-generation, not per-family:** a new top-tier generation draws on its own quota, so moving T1/T3 onto it neither frees nor inherits headroom. **A frontier escalation pin** (e.g. `claude-fable-5` on T1/T3) is re-justified whenever the `opus` alias advances a generation: try the alias at `xhigh`/`max` before renewing the pin, and record the reason for the pin.
     
     ### Effort dial
     
     Effort is the second, **per-task** routing dimension, orthogonal to the tier: the tier picks the model, effort picks how hard it thinks on *this* task. The `/akili-execute` and `/akili-test` Leaders read this subsection to set each worker's effort.
     
     | Signal | Effort |
     |---|---|
     | Trivial / mechanical (copy, rename, style) | `low` |
     | Standard task, clear scope | `medium` |
     | Complex (algorithm, concurrency, security, ambiguity) | `xhigh` |
     | Correctness-critical (can't be wrong, hard to revert) | `max` |
     
     | Role / Phase | Default effort |
     |---|---|
     | T1 `/akili-propose` / `/akili-specify` / **Leader** | `high` |
     | T2 **Implementer / Tester** | `medium` — flex by task |
     | T3 **Reviewer** / `/akili-validate` | `high` |
     | T5 `/akili-archive` / setup steps | `low` |
     
     - **Rework:** bump effort one level on every retry.
     - **Tier ↔ effort:** never `max` a cheaper tier — escalate the tier instead.
     - **Re-baseline:** effort defaults are per-generation — sweep them (`medium`/`high`/`xhigh` on a real spec) whenever the model generation changes; the tier mapping survives churn, these defaults do not. A task that arrives under-specified (a `[~]` resume or a post-Pivot retry) starts one level higher.
     - **Effort is not a verbosity dial:** lowering effort does not reliably shorten output — fix long reports in the brief (`caveman` / `cognitive-doc-design`), never by dropping effort.
    +<!-- /akili:section -->
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it
```
exit=0

```
$ git status --porcelain; echo "porcelain-lines=$(git status --porcelain | wc -l | tr -d " ")"; grep -n -e "akili:section" -e "^## " AGENTS.md
porcelain-lines=0
7:## Conventions
11:<!-- akili:section id=model-routing since=v2.31.0 -->
12:## Model Routing
122:<!-- /akili:section -->
```
exit=0

**Observed:** `skipped (unfenced; --adopt to replace)  AGENTS.md`, exit 0, file not modified; `--adopt --yes` printed `adopted  AGENTS.md`, exit 0, fence markers restored at lines 11/122, porcelain empty (byte-identical to baseline) — matches expectation.

### Case 6 — `rm AGENTS.md` → `created` + constitution hint; malformed fence → `refused (malformed fence)`, wrappers still written

Setup edits: 6a `rm AGENTS.md`. 6b deleted the close marker `<!-- /akili:section -->` from the recreated file, and removed `.claude/agents` and `.cursor/agents` so that a wrapper write is observable as `created` (with them present the run would print `unchanged`). 6c `git checkout -- AGENTS.md` restores the baseline before case 7.

#### 6a — AGENTS.md absent
```
$ rm AGENTS.md && ls
```
exit=0

```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --yes
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
created  AGENTS.md
unchanged  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
unchanged  .claude/agents/akili-tester.md
unchanged  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
unchanged  .cursor/agents/akili-tester.md
unchanged  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it
[36mhint:[0m run /akili-constitution to complete AGENTS.md
```
exit=0

```
$ git status --porcelain; head -3 AGENTS.md; grep -n -e "akili:section" -e "^## " AGENTS.md
 M AGENTS.md
# Agent Guidance

<!-- akili:section id=model-routing since=v2.31.0 -->
3:<!-- akili:section id=model-routing since=v2.31.0 -->
4:## Model Routing
114:<!-- /akili:section -->
```
exit=0

#### 6b — malformed fence (close marker deleted); wrappers removed first so a write is observable
```
$ sed -i '' '/^<!-- \/akili:section -->$/d' AGENTS.md && grep -n -e 'akili:section' AGENTS.md; rm -rf .claude/agents .cursor/agents && ls -a .claude .cursor
3:<!-- akili:section id=model-routing since=v2.31.0 -->
.claude:
.
..

.cursor:
.
..
```
exit=0

```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --yes
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
refused (malformed fence)  AGENTS.md
created  .claude/agents/akili-leader.md
created  .claude/agents/akili-implementer.md
created  .claude/agents/akili-reviewer.md
created  .claude/agents/akili-tester.md
created  .cursor/agents/akili-leader.md
created  .cursor/agents/akili-implementer.md
created  .cursor/agents/akili-reviewer.md
created  .cursor/agents/akili-tester.md
unchanged  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it
[36mhint:[0m commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/
```
exit=1

```
$ ls .claude/agents .cursor/agents; git status --porcelain
.claude/agents:
akili-implementer.md
akili-leader.md
akili-reviewer.md
akili-tester.md

.cursor/agents:
akili-implementer.md
akili-leader.md
akili-reviewer.md
akili-tester.md
 M AGENTS.md
```
exit=0

#### 6c — restore AGENTS.md from git before case 7
```
$ git checkout -- AGENTS.md && git status --porcelain; echo "porcelain-lines=$(git status --porcelain | wc -l | tr -d " ")"
porcelain-lines=0
```
exit=0

**Observed:** 6a `created  AGENTS.md` + `hint: run /akili-constitution to complete AGENTS.md`, exit 0. 6b `refused (malformed fence)  AGENTS.md`, exit 1, all 8 wrappers `created` and present in `ls` (byte-identical to the committed ones — porcelain shows only ` M AGENTS.md`). 6c tree clean — matches expectation.

### Case 7 — `--dry-run` on a changed roster → tree unchanged

Changed roster: `--models claude=opus,sonnet` (baseline was `opus,sonnet,haiku`). Tree compared by `shasum` of every non-`.git` file before and after.

```
$ find . -path ./.git -prune -o -type f -print | sort | xargs shasum > /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c7-before.sha; wc -l < /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c7-before.sha; ls -la .agents/model-routing.json AGENTS.md
      14
-rw-r--r--@ 1 jcadavid  staff  2800 Oct  1 22:29 .agents/model-routing.json
-rw-r--r--@ 1 jcadavid  staff  9770 Oct  1 22:29 AGENTS.md
```
exit=0

```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --dry-run --yes --models claude=opus,sonnet
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
[dry-run] replaced  AGENTS.md
[dry-run] unchanged  .claude/agents/akili-leader.md
[dry-run] unchanged  .claude/agents/akili-implementer.md
[dry-run] unchanged  .claude/agents/akili-reviewer.md
[dry-run] unchanged  .claude/agents/akili-tester.md
[dry-run] unchanged  .cursor/agents/akili-leader.md
[dry-run] unchanged  .cursor/agents/akili-implementer.md
[dry-run] unchanged  .cursor/agents/akili-reviewer.md
[dry-run] unchanged  .cursor/agents/akili-tester.md
[dry-run] replaced  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it

| Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |
|---|---|---|---|---|---|---|
| **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` Claude Opus family | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `composer-2` Composer family (Cursor-native) | `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
| **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` GPT-5.6 Sol/Terra family *(≠ T2 — different vendor)* | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `claude-sonnet-4-6` Claude Sonnet family (1M context) | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T5 Fast-Cheap** | `sonnet` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` Composer (Fast) family | `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
| **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `claude-sonnet-4-6` Gemini 3.8 Flash family (vision) | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
```
exit=0

```
$ find . -path ./.git -prune -o -type f -print | sort | xargs shasum > /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c7-after.sha; diff /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c7-before.sha /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c7-after.sha && echo "tree identical (shasum of every non-.git file)"; git status --porcelain; echo "porcelain-lines=$(git status --porcelain | wc -l | tr -d " ")"; ls -la .agents/model-routing.json AGENTS.md
tree identical (shasum of every non-.git file)
porcelain-lines=0
-rw-r--r--@ 1 jcadavid  staff  2800 Oct  1 22:29 .agents/model-routing.json
-rw-r--r--@ 1 jcadavid  staff  9770 Oct  1 22:29 AGENTS.md
```
exit=0

**Observed:** plan printed with `[dry-run] replaced` for `AGENTS.md` and `.agents/model-routing.json` (the roster change is real: T5 Claude Code becomes `sonnet`), exit 0; shasum lists identical, porcelain empty, mtimes unchanged — matches expectation.

### Case 8 — single model: exit 0, `skipped (author ≠ auditor unsatisfiable)`, no Claude wrappers; `--t3-cross-host claude=antigravity` → three wrappers, no Reviewer

Setup edit: `rm -rf .claude/agents` before 8a, so "no Claude wrappers" is observable by `ls` rather than masked by the baseline files.

#### 8a — single model, no cross-host
```
$ rm -rf .claude/agents && ls -a .claude
.
..
```
exit=0

```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --hosts claude --models claude=sonnet --yes
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
replaced  AGENTS.md
skipped (author ≠ auditor unsatisfiable)  .claude/agents/akili-leader.md
skipped (author ≠ auditor unsatisfiable)  .claude/agents/akili-implementer.md
skipped (author ≠ auditor unsatisfiable)  .claude/agents/akili-reviewer.md
skipped (author ≠ auditor unsatisfiable)  .claude/agents/akili-tester.md
replaced  .agents/model-routing.json
[36mhint:[0m commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/
```
exit=0

```
$ ls .claude/agents 2>&1; ls -a .claude; git status --porcelain
ls: .claude/agents: No such file or directory
.
..
 M .agents/model-routing.json
 D .claude/agents/akili-implementer.md
 D .claude/agents/akili-leader.md
 D .claude/agents/akili-reviewer.md
 D .claude/agents/akili-tester.md
 M AGENTS.md
```
exit=0

#### 8b — single model, Reviewer dispatched cross-host
```
$ node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing --hosts claude --models claude=sonnet --t3-cross-host claude=antigravity --yes
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
replaced  AGENTS.md
created  .claude/agents/akili-leader.md
created  .claude/agents/akili-implementer.md
created  .claude/agents/akili-tester.md
replaced  .agents/model-routing.json
Claude Code Reviewer: dispatched cross-host to Antigravity — no wrapper written (Antigravity is not selected in this run)
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
[36mhint:[0m commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/
```
exit=0

```
$ ls .claude/agents; git status --porcelain
akili-implementer.md
akili-leader.md
akili-tester.md
 M .agents/model-routing.json
 M .claude/agents/akili-leader.md
 D .claude/agents/akili-reviewer.md
 M AGENTS.md
```
exit=0

```
$ grep -n "^model:" .claude/agents/*.md; grep -n -i "cross-host" AGENTS.md | head -5
.claude/agents/akili-implementer.md:4:model: sonnet
.claude/agents/akili-leader.md:4:model: sonnet
.claude/agents/akili-tester.md:4:model: sonnet
62:| **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `claude-sonnet-4-6` Gemini 3.8 Flash family (vision) | `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
80:- **Claude Code:** Reviewer (T3) dispatched cross-host to Antigravity.
92:**Cross-host dispatch:** T6 Multimodal → Antigravity (packaged default) (not selected in this run). Claude Code T3 Reviewer → Antigravity (not selected in this run). The line records the routing preference only, never the dispatcher. Reach across hosts before degrading within one, but only for a real capability gap — a cross-host spawn costs a fresh context, which a one-tier difference does not repay.
```
exit=0

**Observed:** 8a exit 0, `skipped (author ≠ auditor unsatisfiable)` on all four Claude wrappers, `ls: .claude/agents: No such file or directory`. 8b exit 0, `created` leader/implementer/tester only, `ls` shows exactly three files (no `akili-reviewer.md`), line `Claude Code Reviewer: dispatched cross-host to Antigravity — no wrapper written (Antigravity is not selected in this run)` — matches expectation.

### Case 9 — `printf '' | akili routing`, no answers file → usage error naming the non-interactive form, < 2 s (three runs)

```
$ pwd; ls -A; ls -A .agents 2>&1; git rev-parse --show-toplevel 2>&1
/var/folders/g8/8wqxv48d60737hm79glkxx0w0000gn/T/tmp.ntKABk8hLg
ls: .agents: No such file or directory
fatal: not a git repository (or any of the parent directories): .git
```
exit=128

```
$ printf '' | node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
[31mERROR: stdin is not a TTY and answers are still missing: --hosts, --models, --yes — use the non-interactive form: akili routing --hosts <h1,h2> --models <host>=<id>[@T<n>[+T<m>]],… --cli <host>=<binary> --wrappers yes|no --yes[0m
```
exit=1

```
$ python3 /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c9time.py
run 1: exit=1 wall=127.0 ms
  stdout: '\x1b[36m █████╗ ██╗  ██╗██╗██╗     ██╗\n██╔══██╗██║ ██╔╝██║██║     ██║\n███████║█████╔╝ ██║██║     ██║\n██╔══██║██╔═██╗ ██║██║     ██║\n██║  ██║██║  ██╗██║███████╗██║\n╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝\x1b[0m\n'
  stderr: '\x1b[31mERROR: stdin is not a TTY and answers are still missing: --hosts, --models, --yes — use the non-interactive form: akili routing --hosts <h1,h2> --models <host>=<id>[@T<n>[+T<m>]],… --cli <host>=<binary> --wrappers yes|no --yes\x1b[0m\n'
run 2: exit=1 wall=75.1 ms
  stdout: '\x1b[36m █████╗ ██╗  ██╗██╗██╗     ██╗\n██╔══██╗██║ ██╔╝██║██║     ██║\n███████║█████╔╝ ██║██║     ██║\n██╔══██║██╔═██╗ ██║██║     ██║\n██║  ██║██║  ██╗██║███████╗██║\n╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝\x1b[0m\n'
  stderr: '\x1b[31mERROR: stdin is not a TTY and answers are still missing: --hosts, --models, --yes — use the non-interactive form: akili routing --hosts <h1,h2> --models <host>=<id>[@T<n>[+T<m>]],… --cli <host>=<binary> --wrappers yes|no --yes\x1b[0m\n'
run 3: exit=1 wall=90.0 ms
  stdout: '\x1b[36m █████╗ ██╗  ██╗██╗██╗     ██╗\n██╔══██╗██║ ██╔╝██║██║     ██║\n███████║█████╔╝ ██║██║     ██║\n██╔══██║██╔═██╗ ██║██║     ██║\n██║  ██║██║  ██╗██║███████╗██║\n╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝\x1b[0m\n'
  stderr: '\x1b[31mERROR: stdin is not a TTY and answers are still missing: --hosts, --models, --yes — use the non-interactive form: akili routing --hosts <h1,h2> --models <host>=<id>[@T<n>[+T<m>]],… --cli <host>=<binary> --wrappers yes|no --yes\x1b[0m\n'
min=75.1 ms max=127.0 ms spread=51.9 ms all<2000ms=True
```
exit=0

```
$ ls -A; echo "files-after=$(ls -A | wc -l | tr -d " ")"
files-after=0
```
exit=0

**Observed:** exit 1 on every run, `ERROR: stdin is not a TTY and answers are still missing: --hosts, --models, --yes — use the non-interactive form: akili routing --hosts …` on stderr; three timings 127.0 / 75.1 / 90.0 ms (min 75.1, max 127.0, spread 51.9 ms — all far below 2000 ms; the spread does not approach the threshold, so the reading is conclusive); no files written — matches expectation. (The first block exit=128 is `git rev-parse` confirming the dir is not a repo.)

### Repository untouched

```
$ git status --porcelain; echo "repo-porcelain-lines=$(git status --porcelain | wc -l | tr -d " ")"; git log --oneline -1
repo-porcelain-lines=0
08ab78d [SPEC:changes/model-routing-configurator] T7: docs/cli.md Routing section + 13 option rows, docs/model-routing.md (How to apply/How to update/Cross-tool safety carve-out), AGENTS.md:37 carve-out, README + flow fourth tenant, /akili-audit third drift signal, release-checklist roster line, CHANGELOG minor entry; closure sweep (write target = fenced root AGENTS.md via akili routing)
```
exit=0

### Summary

| Case | Expected | Observed | Match |
|---|---|---|---|
| 3 | `no changes`; porcelain empty | `no changes`, exit 0; porcelain 0 lines | yes |
| 4 | `refused (hand-edited fence; --force to regenerate)` exit 1; `--force` → `overwritten` | refused + diff, exit 1, edit kept; `overwritten`, exit 0, cell restored | yes |
| 5 | `skipped (unfenced; --adopt to replace)`; `--adopt --yes` → `adopted` | skipped, exit 0, file untouched; `adopted`, exit 0, fence restored byte-identical | yes |
| 6 | `created` + constitution hint; malformed → `refused (malformed fence)`, wrappers still written | `created` + `hint: run /akili-constitution to complete AGENTS.md`; `refused (malformed fence)`, exit 1, 8 wrappers `created` | yes |
| 7 | `--dry-run` on changed roster → tree unchanged | `[dry-run] replaced` ×2 printed; shasum identical, porcelain empty | yes |
| 8 | exit 0, `skipped (author ≠ auditor unsatisfiable)`, no Claude wrappers; cross-host → 3 wrappers, no Reviewer | exit 0, skipped ×4, no `.claude/agents`; exit 0, 3 wrappers, no reviewer | yes |
| 9 | usage error naming non-interactive form, < 2 s, three runs | exit 1, names `use the non-interactive form: akili routing --hosts …`; 127.0 / 75.1 / 90.0 ms (spread 51.9 ms) | yes |

# `/akili-security`

Run a full repository security audit with the packaged [`security-audit`](../skills/security-audit.md) skill, behind a plan gate and an execution gate, and write a redacted index. Confirmed findings are routed to Bug proposals; nothing is fixed silently.

## Usage

```text
/akili-security [<path>…] [--profile quick|standard|deep] [--budget <N>] [--out <dir>]
```

| Invocation | Meaning |
|---|---|
| `/akili-security` | Whole repository |
| `/akili-security src/auth api/` | Scoped run — named paths only; labelled partial coverage |
| `/akili-security --profile quick` | Bounded first pass |

The command runs outside any spec. It has no Approval Mode and no pre-approved mode: the plan gate and the routing gate stop on every run.

## Flow

| Step | What happens |
|---|---|
| 0. Preflight | Checks the loaded `security-audit` copy carries `adapted-for: "AKILI-SPECS"` and a pinned `source`; runs `node --version`; resolves the target, source ref, dirty state and `<skill-dir>`; checks whether an independent sub-agent can be spawned |
| 1. Plan gate | Shows target, scope, profile, budget, run directory, execution policy, host capability and disclosure; stops until the user answers **Run**, **Adjust** or **Stop** |
| 2. Run | Runs the skill in full audit mode (all six phases) in the next unused `run-<N>`, passing every prior run so re-runs are additive; every delegated prompt carries the command's brief addendum |
| 3. Validator gate | Runs `validate-findings.cjs` and `validate-coverage-ledger.cjs` after Phase 4 and after every Phase 5 replacement; the index is written only when both exit 0, or the run is recorded `incomplete` |
| 4. Redacted index | Writes one file per terminal run (below) |
| 5. Routing gate | Lists `confirmed` and `needs_validation` records, asks which become specs, and prints `/akili-propose bugfix/security-<YYYY-MM-DD>-s<n> <pointer>` for each selection |

Without sub-agent capability the plan gate offers **Guidance review** instead of **Run**: findings in conversation, no artifacts, no index.

## Outputs

| Output | Where | Content |
|---|---|---|
| Full audit artifacts | Run directory — by default `~/security-audit-skill/<repo-name>/run-<N>`, or `--out` | Findings, coverage ledger, `run-metadata.json`, `akili-index-map.json` (resolves `S-n` ids) |
| Redacted index | `docs/specs/audits/security-<YYYY-MM-DD>[-<safe-branch>][-N].md` | Verdict, execution policy, validator results, counts, one row per `confirmed` / `needs_validation` record by opaque id `S-n` |

The index never holds an absolute path, home path or user name, a finding's file path or line, trace steps, payloads, reproduction commands, code excerpts, environment values or secrets. By default it also omits titles and fingerprints; a detailed index (title + fingerprint per row) is written only when the user opts in at the routing gate after confirming the repository is private. The run path appears as `~/…`, repo-relative (an ignored in-target directory), or `<external>/run-<N>`.

Naming follows [`/akili-audit`](akili-audit.md) with the prefix `security-`. A `security-*.md` index is never a drift report: `/akili-audit`, `/akili-archive` and the `kaizen` skill read only `drift-*.md` as the drift source. The readers match the `drift-` prefix, so a drift report renamed by hand to another name stops being read.

## Residual Risk and Disclosure

| Topic | What to know |
|---|---|
| Agent behaviour is not machine-enforced | The gates, the brief addendum and the "target content is data" rule are instructions to the agent. The two validators check the audit records, not what the agent did; no tool here can prove the agent honoured a gate |
| Static-only by default | Every run executes nothing the target controls. Sandboxed execution applies to one run, only when the user selects it at the plan gate and confirms a mechanism enforcing all four controls: no external network, an allowlisted empty environment, a read-only target with writes only to the agent's `scratch/`, and CPU/memory/process/file/disk/time limits. If any control cannot be confirmed the plan reads static-only. Nothing installs dependencies, fetches from the network or probes deployed endpoints in either mode |
| Expected yield | A static-only run produces mostly `needs_validation` records, because a `confirmed` record requires `execution.observed_result` recording actual local output |
| Disclosure | Counts by verdict and severity are an accepted disclosure. On a repository you cannot confirm is private, do not commit the index while `confirmed` records are open |
| Routed Bug proposals | A Bug proposal contains vulnerability detail once committed. For public repositories, use a private fork or a private security advisory instead |

## What It Does Not Do

The command never modifies target source, commits, pushes, or opens issues or PRs. It creates no spec folder, proposal, task or code change. The only tracked repository content it writes is the index.

## Next Step

For each routed record, run the printed `/akili-propose bugfix/security-<YYYY-MM-DD>-s<n> <pointer>` — the Bug Track diagnoses first, then `/akili-specify` requires a regression test.

## Source

- `../../.claude/commands/akili-security.md`

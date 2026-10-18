# Test Walkthrough — Held-out Prompt Behaviour (Suite 2)

| Field | Value |
|---|---|
| Spec | `changes/video-deliverable-track` |
| Suite | Manual verification — held-out prompt-behaviour walkthrough (`requirements.md` §8: "Prompt behaviour … No automated check — substitute: walkthrough with held-out cases") |
| System under test | Working-tree text of `.claude/commands/akili-{propose,specify,test,validate,quick,execute,archive,audit,resume}.md`, `.claude/templates/leader.md`, `.claude/skills/video-production/**` |
| Method | For each case, play an agent that reads only the shipped text; record input → outcome → deciding sentence(s) verbatim with `file:line` → verdict against the requirement clause |
| Date | 2026-10-18 |
| Result | **FAIL** — 32 cases: 29 PASS, 3 FAIL (all three are ambiguities where two readings give different outcomes); 0 contradictions of a requirement under every reading |

## Verdict

Detection, the availability gate, Video Mode, final look, and the software path all work as specified, every decision traced to shipped text. Three cases are decided differently depending on how you read the text:

| # | Case | Requirement clause | Why it fails |
|---|---|---|---|
| F1 | C6 — `/akili-quick` called directly on a copy typo in a video composition | FR-1 *Trivial video tweak* — "`/akili-quick`, invoked directly on a video composition, escalates" + its `BUT` | The video escalation bullet sits in a list that applies only "If the change fails **any** gate criterion", and a copy typo fails none of the criteria. A nearby line also lets a "visible typo" stay in quick |
| F2 | C15 — draft render at `/akili-test` for a spec with video tasks **and** a software suite | FR-3 *Render is approval-gated and quiet-tree* `BUT` ("no render — draft or delivery — may run while a delegated agent is active") | The Deployment Rule spawns independent suites in parallel. The render-evidence suite's quiet-tree rule is never applied to that spawn decision |
| F3 | C24 — target 12 s, no tolerance stated, `ffprobe` 12.08 s | FR-6 default tolerance ± 0.1 s, and DD-12's two comparisons | The ± 0.1 s default is attached only to the target comparison. The `data-duration` comparison states no tolerance, so 12.08 vs `data-duration="12"` fails if the comparison is exact and passes if the default applies |

## Disqualifier check (inert-fixture grep)

Each case's distinctive wording was grepped (`grep -n -i -F`) over every shipped file listed above. Terms searched: `45-second`, `onboarding`, `walkthrough`, `autoplay`, `<video>`, `landing page`, `voiceover`, `voice-over`, `out of sync`, `0:12`, `one-pager`, `PDF`, `investor`, `closing card`, `demo reel`, `typo`, `20 s`, `20.4`, `0.25`, `12.08`, `12.15`, `12 s`, `is my project`, `fresh`, `slide deck`, `deck`.

| Term | Hits | Bearing on a case |
|---|---|---|
| `walkthrough` | `akili-specify.md:443`, `akili-execute.md:231` | Methodology rules about walkthroughs; neither cites a video case |
| `voice-over` | `acceptance-criteria.md:16` (Audio row value list) | Criterion vocabulary, not a worked example; does not decide C3/C11 |
| `typo` | `akili-quick.md:26` (`/akili-quick hero-title fix the typo in the homepage hero title`), `:52` | `:26` is a usage example for a **software** typo; `:52` is a decision sentence (cited in F1), not an example of a video case |
| `fresh` | Unrelated uses (greenfield, fresh context, refresh) | None |
| all other terms | 0 | — |

**No case is decided by an example the shipped text itself cites.** The execute-time cases named in the brief were not reused.

## Cases

Legend: **P** = `akili-propose.md`, **S** = `akili-specify.md`, **T** = `akili-test.md`, **V** = `akili-validate.md`, **Q** = `akili-quick.md`, **L** = `.claude/templates/leader.md`, **SK** = `video-production/SKILL.md`, **AC** = `references/acceptance-criteria.md`, **RE** = `references/render-evidence.md`.

### FR-1 — Deliverable detected and recorded

| ID | Input | Outcome (agent reading only shipped text) | Deciding sentence(s), verbatim | Verdict |
|---|---|---|---|---|
| C1 | `/akili-propose` "record a 45-second onboarding walkthrough video of our app" | `Type: Change` (an intent) · `Deliverable: video` · Next Step `/akili-specify <path>` with the note that Video Mode applies there | P:96 "Detect the requested deliverable, not a word in passing. Record `video` when what the user wants produced, changed, or repaired is a rendered video file or a composition that renders to one" · P:272 "**`Deliverable: video` (any type):** the next command is still `/akili-specify $SPEC_PATH`, and the note beside it says Video Mode applies there" | PASS — FR-1 *Video request* |
| C2 | "add a `<video>` autoplay tag to the landing page" | `Deliverable: software`. What gets produced is a landing-page edit; "video" is a word in passing | P:96 (above: "not a word in passing") · P:97 "`software`. An absent row reads as `software` for every downstream reader" | PASS — FR-1 *Software request that mentions video* incl. `BUT` |
| C3 | "our explainer's voiceover is out of sync at 0:12" | `Type: Bug` (a symptom, "wrong") · `Deliverable: video` (what is repaired is a rendered video). If "explainer" is unclear (page or video), there is **one** question that names both. Bug Track; Next Step specify in Bug + Video Mode | P:88 "**Bug** \| A symptom ("X is broken/failing/wrong" …)" · P:99 "Resolved inside the **one** classification question above, never a second one: when the deliverable is the unclear part, that question also names it (*"…and is the result software or a video?"*). A request that settles `Type` but leaves `Deliverable` open still asks at most that one question in total" · P:272 "(alongside Bug Mode for a Bug)" | PASS — FR-1 *Orthogonal to Type* incl. `AND IT MUST` (≤ 1 question) |
| C4 | "make a one-pager PDF for investors" | `Type: Change` · `Deliverable: software` · the proposal notes the kind is "PDF document". Specify does not enter Video Mode | P:98 "A deliverable that is neither software nor video records `Deliverable: software` and the proposal **notes the deliverable kind**; Video Mode does not apply" · S:63 "When the proposal's Document Control says `Deliverable: video`, specify runs in **Video Mode**" | PASS — FR-1 *Neither software nor video* incl. `BUT` |
| C5 | `/akili-propose` "fix a typo in the closing card of the demo reel" | `Type: Trivial` (copy-only) · `Deliverable: video`. Continues as a **Lite proposal**; Next Step `/akili-specify`, never quick. Read as a cosmetic Bug instead, the outcome is the same | P:86 "Exception: `Deliverable: video` (below) continues as a Lite proposal." · P:100 "`Type: Trivial` with `Deliverable: video` continues with a **Lite proposal** — never recommend `/akili-quick`, which has no render gate. This overrides the Trivial row above, and the cosmetic-fix route in the Bug Track and Next Step" · P:113 "(never with `Deliverable: video`)" · P:271 "Exception: with `Deliverable: video`, the Lite proposal is the deliverable of this command; end it with `/akili-specify $SPEC_PATH`." | PASS — FR-1 *Trivial video tweak* (propose half) |
| C6 | `/akili-quick closing-card-typo fix the typo in the closing card of the demo reel` (direct, no propose) | **Ambiguous.** Reading A (the gate structure): the change passes all five criteria (copy-only, no behaviour, small, token-safe). Escalation runs only "If the change fails **any** gate criterion", and Q:52 says a visible typo "may stay in `/akili-quick`", so quick edits the composition. Reading B (the escalation bullet as a standalone rule): "it is never fast-tracked" → escalate to `/akili-propose` | Q:39 "A change is eligible ONLY if **all** of these hold:" (five criteria, none about video) · Q:49 "If the change fails **any** gate criterion, do **not** fast-track it. Stop and recommend the right entry point:" · Q:52 "A purely cosmetic bug (e.g. a visible typo) may stay in `/akili-quick`." · Q:55 "Edits a **video** composition (…) → `/akili-propose <change-name>`; a video edit needs render evidence that `/akili-quick` cannot produce, so it is never fast-tracked." | **FAIL (F1)** — FR-1 *Trivial video tweak* `AND` ("`/akili-quick`, invoked directly on a video composition, escalates") and `BUT` ("must NOT edit a composition without the render evidence of FR-6") hold only under Reading B |
| C7 | `/akili-specify` on a proposal written before this change (no `Deliverable` row); then test/validate on its `requirements.md` | Software in every reader; no Video Mode, no render suite, no `video-production` load | P:97 "An absent row reads as `software` for every downstream reader" · S:63 "An absent `Deliverable` row means `software`: Video Mode does not apply and nothing below changes." · T:108 "(an absent row means software)" · V:68 "(an absent row means software)" | PASS — FR-1 *Default* |
| C8 | `/akili-specify` on a `Deliverable: video` proposal | `requirements.md` Document Control gets the `Deliverable: video` row, checked again in the Verification Checklist | S:66 "**Copy the `Deliverable: video` row into `requirements.md` Document Control**, beside `Type`. `/akili-test` and `/akili-validate` read `requirements.md`, not the proposal, so this row is how they learn the deliverable." · S:506 "If `Deliverable: video`: `requirements.md` Document Control carries the `Deliverable` row" | PASS — FR-1 *The field reaches every reader* |
| C9 | "the intro animation on our product is off" (Type unclear: bug or tweak; Deliverable unclear: site animation or intro video) | One question that covers both: "Is this a bug to fix, a new feature/change, or a trivial cosmetic tweak … and is the result software or a video?" No second question | P:82 "if it is ambiguous, ask **one** short question" · P:99 "when the deliverable is the unclear part, that question also names it … never a second one" | PASS — FR-1 *Orthogonal to Type* `AND IT MUST` (both unclear at once) |

### FR-2 — Specify Video Mode

| ID | Input | Outcome | Deciding sentence(s), verbatim | Verdict |
|---|---|---|---|---|
| C10 | `/akili-specify` on a `Deliverable: video` Change (social clip, no audio, no captions) | Loads `video-production`; writes 10 criteria rows (container/codec, resolution, fps, duration + tolerance, message, beats, captions, audio, brand, delivery quality), each with a value or `n/a` + reason (captions and audio → `n/a — <reason>`); writes the defect-class → gate table | S:65 "Load `video-production` before writing `requirements.md`" · S:67 "each criterion carries a measurable value or an explicit `n/a - <reason>`, and the defect-class table maps each video defect class to its gate." · AC:3 "Every row becomes a requirement with a **measurable value** or an explicit `n/a — <reason>`." · AC:9-18 (rows 1-10) · AC:24-32 (defect class → gate) | PASS — FR-2 *Acceptance criteria present* (note: S:67 writes `n/a -` with a hyphen, AC:3 and FR-2 use an em dash — cosmetic, both mean the same) |
| C11 | `/akili-specify` on `Type: Bug` + `Deliverable: video` (the C3 voiceover drift at 0:12) | Regression task = snapshot or `ffprobe` check at 0:12, red before the fix and green after. A unit test of the composition HTML alone is rejected | S:69 "**Bug x video:** … the regression test is a frame or metadata check at the failing timestamp (snapshot or `ffprobe` …), red before the fix and green after. A unit test of composition source alone does not satisfy the Bug Mode regression requirement." · AC:36 "A unit test of composition source alone does not qualify." · RE:43 "Record the red output verbatim in `execution.md`." | PASS — FR-2 *Bug Mode on a video* incl. `BUT` |

### FR-3 — Execute through the Leader; render gating

| ID | Input | Outcome | Deciding sentence(s), verbatim | Verdict |
|---|---|---|---|---|
| C12 | `/akili-execute` Leader picks a task from a video spec whose skills list `video-production` | Leader keeps `video-production` (the task list is its default). The Implementer loads the skill, runs the gate, and loads the router `hyperframes` first | S:418 "If `Deliverable: video`, every task of the spec lists `video-production` in its skills (task skill lists are the Leader's defaults at `/akili-execute`)." · L:25 "The task's recommended skills … are **defaults you may augment, narrow, or override** — … swap in the better match (… video deliverable → `video-production` …)" · SK:22 "Router found \| Load it first; it picks the workflow and points to its domain skills." · SK:88-89 | PASS — FR-3 *Skills assigned* |
| C13 | Leader drops `video-production` for a task and assigns `gsap-animation` | Allowed, with a one-line reason recorded in `execution.md` | L:25 "When you deviate from the task's list, record a one-line reason in `execution.md`." | PASS — FR-3 *Skills assigned* `AND IT MUST` |
| C14 | The user asks for the delivery render while an Implementer is still running | Refused: the delivery render waits for final-look approval (a validate step) and the quiet tree. Offered after the completion report, and only once the final look is approved | SK:80 "The delivery render is the deliverable and waits for the final-look approval" · SK:82 "No render, draft or delivery, while a delegated agent is active: a render is a measurement … Render in the window after the completion report" · V:143 "never while one is active" · L:293 "**Never run a measurement command while a delegated agent is active**" | PASS — FR-3 *quiet-tree* `BUT` (advisory A3: L:293 lists "Builds, benchmarks, Lighthouse, and E2E" but not render. A Leader that has not loaded `video-production` learns that render is a measurement only from SK:82) |
| C15 | `/akili-test` on a spec with video tasks **and** a software task (e.g. a landing-page embed). The Leader plans a render-evidence suite and a frontend-unit suite on different files | **Ambiguous.** Reading A: the Leader applies RE:3's quiet-tree rule at planning time and runs the render suite alone, after the other Tester reports. Reading B: the Leader applies the Deployment Rule ("independent … in parallel"), so the render Tester runs `render --quality draft` while a sibling Tester (a delegated agent) is active. Neither text names the render suite in the spawn decision, and the render Tester cannot see its sibling | T:75 "Multiple suites that are **independent** (touch different domains/files …) \| Spawn **one Tester per suite, in parallel**." · T:108 "plan a **render evidence** suite for the video tasks in place of unit/E2E" · RE:3 "run the quiet-tree rule first (no delegated agent active)." · SK:82 "No render, draft or delivery, while a delegated agent is active" | **FAIL (F2)** — FR-3 `BUT` holds only under Reading A. A spec with only video tasks has one render suite (one Tester or inline) and is unaffected |
| C16 | `check` exits 0 at execute; Implementer or Leader proposes "checks pass, render the final" | Refused: draft for evidence only; delivery after the final look in validate | SK:81 "A passing `check` never justifies a delivery render" · V:92 "A passing `check` is not approval: it never replaces the final look in Phase 6." · SK:52 "Delivery render only after the final-look approval" | PASS — FR-3 *Render is approval-gated* THEN |

### FR-4 — Availability gate

| ID | Input | Outcome | Deciding sentence(s), verbatim | Verdict |
|---|---|---|---|---|
| C17 | Video task starts; no `hyperframes` skill under any name | STOP. Prints all four install routes (host plugin; project-scoped core set without `-g`; interactive picker; consent-gated global `skills update`) and the project directories per host, then waits. Builds no pipeline, copies nothing, installs nothing | SK:23 "**STOP.** Print the install routes below and wait. Do not hand-write a video pipeline, do not copy HyperFrames text into the repo, do not install anything without the user's consent" · SK:30 "From the project root, **without `-g`** (project-scoped)" · SK:32 "Run only with the user's explicit consent" · SK:36-39 (Claude Code `.claude/skills`; OpenCode, Codex, Cursor, Antigravity `.agents/skills`) | PASS — FR-4 *Not installed* THEN + `BUT` |
| C18 | Only the Claude Code plugin is installed; the router loads as `/hyperframes:hyperframes` | Gate passes; continue | SK:18 "The gate passes when the router skill is loadable under either name: `hyperframes` (standalone install) or a plugin-namespaced router such as `/hyperframes:hyperframes`." | PASS — FR-4 *Not installed* `AND IT MUST` |
| C19 | HyperFrames installed; first draft render on a fresh machine | Before rendering, tells the user about the ~200 MB browser download to `~/.cache/hyperframes`, run state in `~/.hyperframes`, and the network need; renders only after consent; treats these as runtime caches, not a skill install | SK:83 "Before the first render, draft or delivery, tell the user that HyperFrames may download its own headless browser (~200 MB) into `~/.cache/hyperframes`, keeps run state in `~/.hyperframes`, and that rendering needs network (CDN scripts, web fonts); render only after the user consents. These home writes are the tool's runtime caches, not a skill install: the project-scoped rule governs skills only" | PASS — FR-4 *First render fetches a browser* (advisory A5: a delegated Tester cannot ask the user. `tester.md` "Never override a pending confirmation" keeps it from rendering, but no report status is named for "awaiting consent") |
| C20 | User: "is my project install of HyperFrames fresh?" | Does not use `npx hyperframes skills check`. Checks the project's `skills-lock.json` or reinstalls project-scoped. `skills update` is named only as the consent-gated global route | SK:67 "`npx hyperframes skills check` \| Reads only the user's global skills directory; it never certifies a project install. Check a project install against its `skills-lock.json`, or reinstall with the project-scoped route; `skills update` is the consent-gated global route above" | PASS — FR-4 *Freshness check scope* |
| C21 | `/akili-validate` on a video spec on a teammate's machine without HyperFrames | `video-production` loads in Phase 0; the gate stops; validation is BLOCKED (not PASS, not a substitute check) | V:68 "load the `video-production` skill now so its availability gate fires here too; if the gate stops, validation is BLOCKED." | PASS — FR-4 *Not installed* (validate leg) and FR-7 statement |
| C22 | `Deliverable: software` spec; `/akili-test` and `/akili-validate` on a machine without HyperFrames | Behaves as before: no gate, no STOP, normal suites and build integrity | T:111 "(applies only when `Deliverable: video`)" · T:108 / V:68 / V:92 conditions | PASS — FR-4 *Software unaffected* |

### FR-6 — Render evidence

| ID | Input | Outcome | Deciding sentence(s), verbatim | Verdict |
|---|---|---|---|---|
| C23 | Target 20 s ± 0.25 s; `ffprobe` `format.duration` 20.4; `check` exit 0 | \|20.4 − 20\| = 0.4 > 0.25 → suite **FAIL** citing 20.4, 20 and 0.25. The zero `check` exit does not offset it | RE:24 "The requirement's target duration, within its stated tolerance" · RE:27 "Report FAIL citing both values and the tolerance if either comparison fails. A zero exit from `check` never offsets a duration failure." | PASS — FR-6 duration comparison and the *Duration drift* `BUT` pattern |
| C24 | Target 12 s, **no tolerance stated**; root `data-duration="12"`; `ffprobe` 12.08 | Target comparison: 0.08 ≤ default 0.1 → holds. `data-duration` comparison is **ambiguous**. Reading A: no tolerance is stated for it, so 12.08 ≠ 12 → FAIL ("render defect"). Reading B: the ± 0.1 s default carries over → holds → overall PASS. T12 itself used Reading B (`t12-smoke-evidence.md` §9 used one `tol` for both comparisons) | RE:24 "(default **± 0.1 s** when none is stated)" — attached only to the target row · RE:25 "The composition's root `data-duration` \| A render defect (truncation, extra tail)" — no tolerance · RE:27 "if either comparison fails" | **FAIL (F3)** — FR-6 "When the requirement states no tolerance, the default is ± 0.1 s" gives PASS only under Reading B. The requirement text has the same gap (it gives no tolerance for the `data-duration` comparison either) |
| C25 | Same as C24, `ffprobe` 12.15 | 0.15 > 0.1 → target comparison fails → FAIL citing 12.15, 12 and ± 0.1 (under both readings) | RE:24, RE:27 (above) | PASS — FR-6 default tolerance |
| C26 | `/akili-test` plans the render-evidence suite; HyperFrames not installed | STOP at planning: tell the user the install route; write no substitute test | T:111 "**Missing HyperFrames is the same STOP** … treat it as missing test infrastructure — stop, tell the user the install route from `video-production`, and write no substitute test." · RE:31 "Do not improvise a substitute test." | PASS — FR-6 *HyperFrames missing at test time* |

### FR-7 — Validate ends in a final look

| ID | Input | Outcome | Deciding sentence(s), verbatim | Verdict |
|---|---|---|---|---|
| C27 | Video spec at `/akili-validate`; `check` 0, all render evidence green, test-report PASS; no final look recorded | Validate does not report PASS; the video requirements are at best BLOCKED until a final look (HITL or T6) is recorded and approved | V:141 "validate MUST NOT report PASS for the spec without a final look, whatever else is green. … until it is recorded and approved, the video requirements are at best BLOCKED." · RE:37 "No PASS without it, even when every automated item is green." | PASS — FR-7 *Plausible but wrong* |
| C28 | Final look approved by the user at the HITL pause; no delegated agent active | Runs the local `render --quality delivery` now, then re-runs output-present, metadata and duration checks on the delivery file | V:143 "only after the final look is approved, run the local `render --quality delivery` as `video-production` instructs, in the window after any delegated agent's completion report, never while one is active." · RE:38 "Only after the approval, run the delivery render and re-run items 4-6 on its output." | PASS — FR-7 statement ("the delivery render follows that approval") |

### NFR-1 — Software path untouched

| ID | Input | Outcome | Deciding sentence(s) — each new block's condition | Verdict |
|---|---|---|---|---|
| C29 | A `Deliverable: software` spec through specify → test → validate | No video sentence fires. Each added block's condition: S:63 Video Mode "When the proposal's Document Control says `Deliverable: video`" (covers S:65-69) · S:232 "If `Deliverable: video`" · S:418 "If `Deliverable: video`" · S:506 "If `Deliverable: video`:" · T:108 "When `requirements.md` Document Control has `Deliverable: video`" · T:111 "(applies only when `Deliverable: video`)" · T:193 descriptive parenthetical only ("the `Deliverable: video` render evidence suite is separate") — changes no behaviour · V:68 "When `requirements.md` records `Deliverable: video`" · V:92 "When `Deliverable: video`" · V:141 "(when `Deliverable: video`)" · V:143 "(when `Deliverable: video`)" · L:25 example "video deliverable → `video-production`" — only a swap-in for a video deliverable. Carve-outs (per NFR-1): P:92-100 (detection; the software outcome is unchanged: P:97 default `software`) and Q:55 (keyed on "Edits a **video** composition") | as listed | PASS — NFR-1 |

### KZ-004 fall-throughs (design §3)

| ID | Input | Outcome | Deciding text | Verdict |
|---|---|---|---|---|
| C30 | `/akili-archive` on a validated video spec | Archives like any spec. Readiness looks at the reports and FAIL findings, not suite types; no video text exists to contradict this | `akili-archive.md:93-95` "`test-report.md` exists, or the absence is explicitly accepted · `validation-report.md` exists, or the absence is explicitly accepted · no unresolved FAIL findings remain in `validation-report.md`"; grep `deliverable\|video\|render` → 0 hits | PASS — design §3 archive row |
| C31 | `/akili-audit` on a project holding compositions from a video spec | Compositions are scanned as project files. They may surface as "Undocumented Feature" if the TRD does not name them — this is the risk accepted in design P-20; no text contradicts it | `akili-audit.md:51` "**Undocumented Feature (Codebase > Documentation):** Modules, … integrations added to the codebase but completely missing from the PRD, UX/UI Design, or TRD."; grep → 0 hits | PASS — design §3 audit row (accepted P-20 risk) |
| C32 | `/akili-resume` with a video spec mid-execution | Phase detected from the spec files present, same as any spec | `akili-resume.md:31-38` "For each spec directory, read available files to determine current phase: … `test-report.md` exists → tested · `validation-report.md` exists → validated"; grep for video/deliverable → 0 hits | PASS — design §3 resume row |

## Findings

### F1 — Direct `/akili-quick` on a copy-only video edit (C6)

- **Requirement:** FR-1 *Trivial video tweak is not fast-tracked*. "AND `/akili-quick`, invoked directly on a video composition, escalates to `/akili-propose`. BUT it must NOT edit a composition without the render evidence of FR-6."
- **Text:** Q:49 makes the escalation list depend on a failed gate criterion, and none of the five criteria at Q:41-45 names video. Q:52 explicitly lets "a visible typo" stay in quick. Only the trailing clause of Q:55 ("so it is never fast-tracked") says otherwise.
- **Reading A:** quick edits the composition (violates FR-1). **Reading B:** quick escalates (meets FR-1).
- **Suggested fix (one line, for the Leader to decide on):** make video a gate criterion ("Not a video composition") in Q:39-45, or open Q:55 with "Regardless of the criteria above". This mirrors how P:100 states its override.

### F2 — Parallel Testers with a render-evidence suite (C15)

- **Requirement:** FR-3 `BUT`: "no render — draft or delivery — may run while a delegated agent is active".
- **Text:** T:75 spawns independent suites in parallel. RE:3 and SK:82 state the quiet tree, but nothing in T:105-115 says the render suite must run alone.
- **Reading A:** the Leader runs the render suite on its own (meets FR-3). **Reading B:** it runs in parallel with a sibling Tester (violates FR-3).
- **Scope:** only specs that mix video tasks with software suites; T:108's "for the video tasks" allows this.
- **Suggested fix:** one clause at T:108 — "run it alone, after any other Tester's report (quiet tree)".

### F3 — Tolerance of the `data-duration` comparison (C24)

- **Requirement:** FR-6 — `format.duration` is compared with "both the requirement's target ± tolerance and the composition's root `data-duration`"; the default is ± 0.1 s when no tolerance is stated.
- **Text:** RE:24 attaches the default only to the target row. RE:25 states no tolerance, and RE:27 fails on "either comparison".
- **Reading A:** the comparison is exact, so 12.08 vs 12 fails. **Reading B:** the default applies, so it passes. T12 evidence used Reading B.
- **Note:** the gap starts in the requirement itself, which gives no tolerance for the second comparison either. Fixing it needs a requirement amendment (Pivot Protocol), not a text-only edit.

### Advisories (recorded, no scope change)

| ID | Observation | Requirement touched |
|---|---|---|
| A1 | Video Mode triggers only on the proposal's `Deliverable` row (S:63). Bug Mode also triggers when "the user frames it as a defect" (S:54). So `/akili-specify` run directly on a video request with no proposal falls back to software | None in scope (FR-1 assumes propose writes the row) |
| A2 | propose's Bug Track for a video bug (C3) does diagnosis and reproduction before any command loads `video-production`. If reproduction runs a HyperFrames command, the telemetry and consent rules (SK:72-73) are in context only if the skill auto-triggers from its description | FR-5 (outside this slice) |
| A3 | L:293 lists measurement commands as "Builds, benchmarks, Lighthouse, and E2E" and does not name render. Only SK:82 says render is a measurement | FR-3 (C14 still PASS) |
| A4 | `n/a - <reason>` with a hyphen (S:67) vs `n/a — <reason>` with an em dash (AC:3, FR-2) | FR-2 (cosmetic) |
| A5 | A delegated Tester that reaches the first-render consent cannot ask the user, and the Tester contract names no status for "awaiting consent" | FR-4 (C19 still PASS: the render is withheld) |

## Coverage slice

| Requirement | Scenario | Case IDs | Result |
|---|---|---|---|
| FR-1 | Video request | C1 | PASS |
| FR-1 | Software request that mentions video (`BUT`) | C2 | PASS |
| FR-1 | Orthogonal to Type (`AND IT MUST` ≤ 1 question) | C3, C9 | PASS |
| FR-1 | Trivial video tweak — propose half | C5 | PASS |
| FR-1 | Trivial video tweak — quick escalation (`AND`) + `BUT` | C6 | **FAIL (F1)** |
| FR-1 | Neither software nor video (`BUT`) | C4 | PASS |
| FR-1 | Default | C7 | PASS |
| FR-1 | The field reaches every reader | C8 | PASS |
| FR-2 | Acceptance criteria present | C10 | PASS |
| FR-2 | Bug Mode on a video (`BUT`) | C11 | PASS |
| FR-3 | Skills assigned (+ `AND IT MUST` deviation) | C12, C13 | PASS |
| FR-3 | Render approval-gated (THEN) | C14, C16 | PASS |
| FR-3 | Quiet tree (`BUT`) — execute | C14 | PASS |
| FR-3 | Quiet tree (`BUT`) — test-time parallel suites | C15 | **FAIL (F2)** |
| FR-4 | Not installed (THEN, `AND IT MUST`, `BUT`) | C17, C18, C21 | PASS |
| FR-4 | First render fetches a browser (amended) | C19 | PASS |
| FR-4 | Freshness check scope (amended) | C20 | PASS |
| FR-4 | Software unaffected | C22 | PASS |
| FR-6 | Duration comparison with stated tolerance; `check` 0 does not offset | C23 | PASS |
| FR-6 | Default tolerance ± 0.1 s (outside it) | C25 | PASS |
| FR-6 | Default tolerance ± 0.1 s (inside it, `data-duration` comparison) | C24 | **FAIL (F3)** |
| FR-6 | HyperFrames missing at test time | C26 | PASS |
| FR-7 | Plausible but wrong — no PASS without final look | C27 | PASS |
| FR-7 | Delivery render follows approval | C28 | PASS |
| NFR-1 | Software path untouched | C29 (+ C22, C7) | PASS |
| Design §3 / KZ-004 | archive, audit, resume fall-throughs | C30, C31, C32 | PASS |

## Not done / assumptions

- No HyperFrames, `npx` or network command was run; this is a reading of the text only. Render behaviour itself is T12's evidence.
- Line numbers are from the working tree at `e78d4c6` (clean). `test/` was not touched and `npm` was not run (a concurrent Tester owns that suite).
- The text was judged by an agent reading only the shipped text (with the skill's `SKILL.md` loaded whenever the skill is loaded). Skill auto-triggering by description was **not** counted as a guarantee — see A2.
- FR-5, FR-8, FR-9 and FR-10 are outside this slice.

## Re-walk after A4 (2026-10-18, Leader inline — Deployment Rule: 3 trivial cases)

| Case | New outcome (single reading) | Deciding shipped sentence | Result |
|---|---|---|---|
| C6 | Direct `/akili-quick` on a closing-card typo in a video composition → fails the gate → `/akili-propose` | `akili-quick.md:45` "**Not a video composition:** the change does not edit a HyperFrames composition or a file that renders to a video deliverable, however small or cosmetic the edit." + `:53` cosmetic line now limited to changes that pass "every gate criterion, including *Not a video composition*" + `:56` escalation | **PASS** (was FAIL F1) |
| C15 | Video + software suites → render-evidence Tester runs alone, after every other Tester has reported | `akili-test.md:108` "The render evidence suite runs alone, after every other Tester has reported — it renders, so never beside an active agent, even when it is independent of the other suites." | **PASS** (was FAIL F2) |
| C24 | Target 12 s, no tolerance, `data-duration` 12, ffprobe 12.08 → both comparisons within ± 0.1 s → PASS; C25 (12.15) still FAIL | `render-evidence.md:25` "The composition's root `data-duration`, within that same tolerance (stated, else default **± 0.1 s**)" — FR-6 amended (A4) | **PASS** (was FAIL F3) |

Totals after A4: **32 cases, 32 PASS.**

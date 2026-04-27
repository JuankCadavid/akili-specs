# Validate SDD Implementation

Validate that a module's implementation matches its SDD specification. Checks task completion, file existence, build integrity, linting, requirement coverage, and code quality. Produces a `validation-report.md` with pass/fail results and remediation steps.

## Usage

```
/sdd-validate <module-name>
```

**Example:** `/sdd-validate dashboard` reads the SDD documents in `docs/specs/dashboard/` and validates the implementation.

## Arguments

- `$ARGUMENTS` — The module name matching a directory under `docs/specs/` containing `requirements.md`, `design.md`, `tasks.md`, and optionally `execution.md`.

---

## Behavior

### Phase 0: Load Context

1. Read all SDD documents:
   - `docs/specs/$ARGUMENTS/requirements.md`
   - `docs/specs/$ARGUMENTS/design.md`
   - `docs/specs/$ARGUMENTS/tasks.md`
   - `docs/specs/$ARGUMENTS/execution.md` (if exists)
2. Read project conventions:
   - Root `CLAUDE.md`
   - `apps/backend/CLAUDE.md`
   - `apps/frontend/CLAUDE.md`
3. Parse `tasks.md` to extract: all task IDs, statuses, file scopes, requirement mappings
4. Parse `requirements.md` to extract: all FR-* and NFR-* IDs
5. Parse `design.md` to extract: file tree (new/modified files), entity definitions, API endpoints, component hierarchy

---

### Phase 1: Task Completion Check

Verify that all tasks in `tasks.md` are marked `[x]` (complete).

**For each task:**
- Status is `[x]` → PASS
- Status is `[~]` → WARN (in progress, not complete)
- Status is `[ ]` → FAIL (not started)

**Output:** Table of all tasks with PASS/WARN/FAIL status.

If any tasks are not `[x]`, flag them but continue with remaining checks — partial implementations can still be verified.

---

### Phase 2: File Existence Check

Parse the **Extended Directory Structure** from `design.md` and verify:

- Every file marked `[N]` (new) exists on disk
- Every file marked `[M]` (modified) exists on disk
- Every file marked `[D]` (delete) does NOT exist on disk

**For each file:**
- Use `Glob` or `Read` to verify existence
- For `[N]` files: verify they are non-empty
- For `[M]` files: verify they contain the expected changes (e.g., new imports, new methods)
- For `[D]` files: verify they are deleted

**Output:** Table of expected files with EXISTS/MISSING/SHOULD_BE_DELETED status.

---

### Phase 3: Build Integrity

Run build and lint checks to verify the implementation compiles:

```bash
turbo build 2>&1 | tail -30
turbo lint 2>&1 | tail -30
```

**Check:**
- `turbo build` exits with code 0 → PASS
- `turbo build` fails → FAIL (capture error output)
- `turbo lint` exits with code 0 → PASS
- `turbo lint` has warnings only → WARN
- `turbo lint` fails → FAIL

**Output:** Build status with error details if failed.

---

### Phase 4: Requirement Coverage Verification

For every `FR-*` and `NFR-*` in `requirements.md`, verify implementation evidence:

#### 4.1 — Task Mapping
Cross-reference the **Requirement Coverage Matrix** from `tasks.md`:
- Every FR-* must appear in at least one task
- Every task mapped to a requirement must be `[x]` (complete)

#### 4.2 — Code Evidence
For each requirement, search the codebase for implementation evidence:

- **Entity requirements** (e.g., "SHALL create an installment entity"): Grep for the entity class, verify columns exist
- **Enum requirements** (e.g., "SHALL export TipoCredito enum"): Grep for the enum definition and its values
- **API endpoint requirements** (e.g., "SHALL expose GET /collections/dashboard"): Grep for the route decorator in controllers
- **Frontend requirements** (e.g., "SHALL display KPI summary cards"): Verify the component file exists and imports the expected hooks
- **Business logic requirements** (e.g., "SHALL compute delinquency status"): Grep for the method name or logic pattern
- **DTO requirements**: Verify the interface exists in the shared package

**Output:** Table of all requirements with IMPLEMENTED/PARTIAL/MISSING status and evidence file path.

---

### Phase 5: Linting & Code Quality Audit

Run linters and specialized skills against the implementation files.

#### 5.0 — Lint All Changed Files
Run the project linter against all files created or modified by this module:

```bash
# Lint the specific packages that were changed
pnpm --filter @credinova/shared lint 2>&1
pnpm --filter @credinova/backend lint 2>&1
pnpm --filter @credinova/frontend lint 2>&1
```

**Additionally**, run ESLint directly on the specific files from the design's file tree to get per-file results:

```bash
# For each [N]ew or [M]odified file from design.md
npx eslint --no-error-on-unmatched-pattern <file-path> 2>&1
```

**Check:**
- Zero errors → PASS
- Warnings only → WARN (list them)
- Errors → FAIL (list each error with file:line and rule name)

**Auto-fix attempt:** If lint errors are found, run `eslint --fix` on the affected files and re-check. Report which errors were auto-fixed and which remain.

**Output:** Table of linted files with error/warning counts and specific rule violations.

#### 5.1 — Backend Quality (NestJS)
**Use skill:** `nestjs-expert`

Audit the backend files created/modified by this module:
- Module follows NestJS Module → Controller → Service pattern
- Dependency injection is correct (no circular deps)
- TypeORM entities have proper decorators and relations
- Guards are applied correctly
- Error handling follows project patterns

#### 5.2 — Frontend Quality (React)
**Use skill:** `react-doctor`

Audit the frontend files created/modified by this module:
- Components follow React best practices (no unnecessary re-renders)
- Hooks follow rules of hooks
- TanStack Query hooks have proper queryKeys and options
- No client/server component mismatches
- Proper loading/error states

#### 5.3 — API Design Quality
**Use skill:** `api-design-principles`

Verify API endpoints follow REST conventions:
- Proper HTTP methods for operations
- Consistent response format (ApiResponse<T>)
- Proper error codes and messages
- Auth guards applied

#### 5.4 — Design System Compliance
**Use skill:** `tailwind-design-system` + `frontend-design`

Check frontend components against system design spec:
- Color tokens match design system (no hardcoded hex values)
- Component styling follows established patterns
- Mobile-first responsive approach
- Dark mode support

**Output:** List of quality findings categorized as: CRITICAL, WARNING, INFO.

---

### Phase 6: Design Conformance

Compare the actual implementation against the design specification:

#### 6.1 — Data Model
- Compare entity fields in code vs design.md table schemas
- Flag any missing columns, wrong types, or missing relations

#### 6.2 — API Endpoints
- Compare controller routes vs design.md endpoint table
- Verify response types match the specified interfaces

#### 6.3 — Component Hierarchy
- Compare actual component tree vs design.md component hierarchy
- Flag missing components or unexpected additions

#### 6.4 — Shared Package
- Verify all enums from design exist in shared package
- Verify all DTOs from design exist in shared package
- Verify route constants are updated

**Output:** Conformance checklist with MATCH/MISMATCH/EXTRA items.

---

### Phase 7: Generate Test Report

Create `docs/specs/$ARGUMENTS/validation-report.md` with all findings:

```markdown
# Test Report — {Module Name}

## Document Control

| Field | Value |
|-------|-------|
| Module | {Module Name} |
| Date | {ISO date} |
| SDD Reference | docs/specs/{module}/ |
| Overall Status | PASS / PARTIAL / FAIL |

---

## Summary

| Check | Status | Details |
|-------|--------|---------|
| Task Completion | {PASS/FAIL} | {X}/{Y} tasks complete |
| File Existence | {PASS/FAIL} | {X}/{Y} files verified |
| Build Integrity | {PASS/FAIL} | turbo build passes |
| Requirement Coverage | {PASS/FAIL} | {X}/{Y} requirements implemented |
| Linting | {PASS/WARN/FAIL} | {N} errors, {N} warnings across {N} files |
| Code Quality | {PASS/WARN/FAIL} | {N} findings ({critical}/{warnings}/{info}) |
| Design Conformance | {PASS/FAIL} | {X}/{Y} design elements match |

## Overall Score: {X}% ({passed checks} / {total checks})

---

## Phase 1: Task Completion

| Task | Title | Status | Result |
|------|-------|--------|--------|
| TASK-{ID} | {title} | [x] | PASS |
| ... | ... | ... | ... |

## Phase 2: File Existence

| File | Expected | Actual | Result |
|------|----------|--------|--------|
| `path/to/file` | [N] New | Exists | PASS |
| ... | ... | ... | ... |

## Phase 3: Build Integrity

| Check | Result | Output |
|-------|--------|--------|
| turbo build | PASS/FAIL | {error details if failed} |
| turbo lint | PASS/FAIL | {error details if failed} |

## Phase 4: Requirement Coverage

| Requirement | Task(s) | Task Status | Code Evidence | Result |
|-------------|---------|-------------|---------------|--------|
| FR-{ID} | TASK-{ID} | [x] | `path/to/file:line` | IMPLEMENTED |
| ... | ... | ... | ... | ... |

## Phase 5: Linting & Code Quality

### Lint Results

| File | Errors | Warnings | Auto-fixed | Rule Violations |
|------|--------|----------|------------|-----------------|
| `path/to/file` | 0 | 1 | 0 | {rule-name} |
| ... | ... | ... | ... | ... |

### Skill-Based Quality Audit

### Critical
- {finding description} — `file:line`

### Warnings
- {finding description} — `file:line`

### Info
- {finding description} — `file:line`

## Phase 6: Design Conformance

### Data Model
| Entity | Field | Design | Code | Result |
|--------|-------|--------|------|--------|
| ... | ... | ... | ... | MATCH/MISMATCH |

### API Endpoints
| Endpoint | Design | Code | Result |
|----------|--------|------|--------|
| ... | ... | ... | MATCH/MISMATCH |

### Components
| Component | Design | Code | Result |
|-----------|--------|------|--------|
| ... | ... | ... | MATCH/MISSING |

---

## Remediation

{If overall status is not PASS, list specific actions needed to reach full compliance:}

1. {Action item with file path and description}
2. ...
```

---

### Phase 8: Report to User

Present the overall results:

- **Overall status:** PASS (100%), PARTIAL (>70%), or FAIL (<70%)
- **Key findings:** Top 3 critical issues (if any)
- **Remediation count:** Number of actions needed

If status is PARTIAL or FAIL, ask:

**"Found {N} issues. Want me to fix them now?"**

Options:
- **Fix all** — Auto-fix all issues that can be resolved programmatically
- **Fix critical only** — Only address CRITICAL findings
- **Just the report** — Save the report, don't fix anything

---

## Error Handling

- If SDD documents are missing, report which files are needed and stop
- If build fails, still continue with other checks (file existence, requirement coverage)
- If a skill fails to load, skip that quality check and note it in the report
- If the module has no tasks marked `[x]`, report "No tasks completed — nothing to verify" and stop

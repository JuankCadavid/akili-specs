# Test SDD Implementation

Run automated tests against a module's implementation. Executes unit tests, integration tests, and end-to-end functional tests using Playwright. Produces a `test-report.md` with results, coverage, and failing test details.

## Usage

```
/sdd-test <module-name>
```

**Example:** `/sdd-test dashboard` runs all tests for the dashboard module and creates `docs/specs/dashboard/test-report.md`.

## Arguments

- `$ARGUMENTS` — The module name matching a directory under `docs/specs/` that contains `requirements.md`, `design.md`, and `tasks.md`.

---

## Behavior

### Phase 0: Load Context

1. Read the SDD documents:
   - `docs/specs/$ARGUMENTS/requirements.md` — to understand what needs testing
   - `docs/specs/$ARGUMENTS/design.md` — to understand API endpoints, components, and flows
   - `docs/specs/$ARGUMENTS/tasks.md` — to identify which files were created/modified
2. Read project conventions:
   - Root `CLAUDE.md` — test commands
   - `apps/backend/CLAUDE.md` — backend test setup (Jest)
   - `apps/frontend/CLAUDE.md` — frontend test setup
3. Identify test scope from the design document:
   - Backend: controllers, services, entities, business logic
   - Frontend: components, hooks, pages
   - E2E: user flows that span frontend + backend

---

### Phase 1: Unit Tests (Backend)

**Tool:** Jest (configured in `apps/backend/`)
**Skill:** `nestjs-expert`, `systematic-debugging`

#### 1.1 — Identify Test Targets

From `design.md`, extract backend files that need unit tests:
- Services (business logic) — highest priority
- Controllers (route handling)
- Utilities (e.g., BusinessDayCalculator)
- Entity validation (if applicable)

#### 1.2 — Create Missing Test Files

For each service/controller without a `.spec.ts` file, create one:

```
apps/backend/src/domain/{module}/services/{service}.service.spec.ts
apps/backend/src/domain/{module}/controllers/{controller}.controller.spec.ts
apps/backend/src/common/utils/{utility}.util.spec.ts
```

**Test patterns for NestJS:**

```typescript
// Service test pattern
describe('DashboardService', () => {
  let service: DashboardService;
  let paymentRepo: MockRepository<Payment>;
  let installmentRepo: MockRepository<Installment>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Payment), useFactory: mockRepository },
        { provide: getRepositoryToken(Installment), useFactory: mockRepository },
      ],
    }).compile();
    service = module.get(DashboardService);
  });

  // Test each method against requirements
});
```

#### 1.3 — Write Tests Based on Requirements

Map each FR-* requirement to specific test cases:

- **Business logic requirements** → Test the service method with various inputs
  - Happy path (expected data)
  - Edge cases (empty data, boundary values)
  - Error cases (invalid input, missing dependencies)
- **Computation requirements** (e.g., delinquency calculation) → Test each classification rule:
  - UPCOMING: dueDate in the future
  - DUE_TODAY: dueDate is today
  - GRACE_PERIOD: 1-3 business days past due
  - OVERDUE: 4+ business days past due
  - Weekend/holiday exclusion
- **Data filtering requirements** → Test query conditions
- **Default value requirements** → Test fallback behavior

#### 1.4 — Run Tests

```bash
pnpm --filter @credinova/backend test -- --testPathPattern="domain/{module}" --verbose 2>&1
```

Also run utility tests if modified:

```bash
pnpm --filter @credinova/backend test -- --testPathPattern="common/utils" --verbose 2>&1
```

**Output:** Test results with pass/fail per test case.

---

### Phase 2: Unit Tests (Frontend)

**Tool:** Jest or Vitest (configured in `apps/frontend/`)
**Skill:** `vercel-react-best-practices`, `react-doctor`

#### 2.1 — Identify Test Targets

From `design.md`, extract frontend files that need tests:
- Hooks (TanStack Query wrappers)
- Components with business logic (data transformation, conditional rendering)
- Service functions (API client wrappers)

#### 2.2 — Create Missing Test Files

```
apps/frontend/src/features/{module}/hooks/{hook}.test.ts
apps/frontend/src/features/{module}/components/{component}.test.tsx
apps/frontend/src/features/{module}/services/{service}.test.ts
```

**Test patterns for React:**

```typescript
// Hook test with React Testing Library + MSW or mock
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

describe('useDashboardKpis', () => {
  it('fetches KPI data successfully', async () => {
    // Mock API response
    // Render hook within QueryClientProvider
    // Assert data shape
  });
});

// Component test
import { render, screen } from '@testing-library/react';

describe('KpiCards', () => {
  it('displays collected amount and daily goal', () => {
    render(<KpiCards data={mockKpiData} />);
    expect(screen.getByText('$1,250.00')).toBeInTheDocument();
  });

  it('shows skeleton loader when loading', () => {
    render(<KpiCards isLoading={true} />);
    expect(screen.getByTestId('kpi-skeleton')).toBeInTheDocument();
  });
});
```

#### 2.3 — Run Tests

```bash
pnpm --filter @credinova/frontend test -- --testPathPattern="features/{module}" --verbose 2>&1
```

**Output:** Test results with pass/fail per test case.

---

### Phase 3: Integration Tests (Backend API)

**Tool:** Jest + Supertest
**Skill:** `nestjs-expert`, `api-design-principles`

#### 3.1 — Create API Integration Tests

Test each endpoint from the design's API table end-to-end through the NestJS request pipeline (guards, pipes, interceptors, controller, service):

```typescript
// e2e test pattern
describe('Dashboard API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    // Apply same global config as main.ts
    await app.init();
  });

  describe('GET /collections/dashboard', () => {
    it('returns 401 without JWT', () => {
      return request(app.getHttpServer())
        .get('/collections/dashboard')
        .expect(401);
    });

    it('returns KPI data with valid JWT', () => {
      return request(app.getHttpServer())
        .get('/collections/dashboard')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('totalCollected');
          expect(res.body.data).toHaveProperty('dailyGoal');
          expect(res.body.data).toHaveProperty('progressPercentage');
        });
    });
  });
});
```

#### 3.2 — Run Integration Tests

```bash
pnpm --filter @credinova/backend test:e2e -- --testPathPattern="{module}" --verbose 2>&1
```

**Output:** Endpoint test results with response validation.

---

### Phase 4: End-to-End Tests (Playwright)

**Tool:** Playwright
**Skill:** `frontend-design`, `systematic-debugging`

#### 4.0 — Setup Playwright (if not already configured)

Check if Playwright is installed:

```bash
ls apps/frontend/playwright.config.ts 2>/dev/null || echo "NOT INSTALLED"
```

If not installed, set it up:

```bash
cd apps/frontend && npx playwright install --with-deps chromium
```

Create `apps/frontend/playwright.config.ts` if it doesn't exist:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 390, height: 844 }, // Mobile-first (iPhone 14 Pro)
  },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: true,
    cwd: '../../', // monorepo root for turbo dev
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 720 } } },
  ],
});
```

#### 4.1 — Create E2E Test Files

Create test files in `apps/frontend/e2e/{module}/`:

```
apps/frontend/e2e/{module}/
├── {module}.spec.ts          # Main user flow tests
└── {module}.helpers.ts       # Page objects and test utilities
```

#### 4.2 — Write E2E Tests Based on Requirements

Map user-facing FR-* requirements to Playwright test scenarios:

```typescript
// e2e/dashboard/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Module', () => {

  test.beforeEach(async ({ page }) => {
    // Login flow: navigate to /login, fill credentials, submit
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.E2E_TEST_EMAIL!);
    await page.fill('[name="password"]', process.env.E2E_TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    // Wait for redirect to /dashboard
    await page.waitForURL('/dashboard');
  });

  test('displays KPI summary cards (FR-DASH-20)', async ({ page }) => {
    // Verify "Total Collected" card exists
    await expect(page.getByText('COLLECTED')).toBeVisible();
    // Verify "Daily Goal" card exists
    await expect(page.getByText('DAILY GOAL')).toBeVisible();
  });

  test('displays progress bar (FR-DASH-21)', async ({ page }) => {
    // Verify progress bar element exists
    const progressBar = page.locator('[data-testid="collection-progress"]');
    await expect(progressBar).toBeVisible();
  });

  test('displays priority collections list (FR-DASH-22)', async ({ page }) => {
    // Wait for priority list to load (skeleton disappears)
    await page.waitForSelector('[data-testid="priority-list"]');
    // Verify at least one collection item exists (if seeded data)
    const items = page.locator('[data-testid="priority-card"]');
    await expect(items.first()).toBeVisible();
  });

  test('shows correct delinquency status colors (FR-DASH-23)', async ({ page }) => {
    await page.waitForSelector('[data-testid="priority-list"]');
    // Check for status badges with correct colors
    const overdueBadge = page.locator('text=OVERDUE').first();
    if (await overdueBadge.isVisible()) {
      await expect(overdueBadge).toHaveClass(/text-red-400/);
    }
  });

  test('shows colored left border on priority cards (FR-DASH-24)', async ({ page }) => {
    await page.waitForSelector('[data-testid="priority-card"]');
    const card = page.locator('[data-testid="priority-card"]').first();
    // Verify left border exists (4px border)
    await expect(card).toHaveCSS('border-left-width', '4px');
  });

  test('is mobile-first with bottom nav clearance (FR-DASH-26)', async ({ page }) => {
    // On mobile viewport (390px), verify bottom padding
    const content = page.locator('main');
    await expect(content).toBeVisible();
    // Verify bottom nav is visible
    const bottomNav = page.locator('[data-testid="mobile-nav"]');
    await expect(bottomNav).toBeVisible();
  });

  test('auto-refreshes data (NFR-DASH-03)', async ({ page }) => {
    // Intercept API calls to track refetch
    let fetchCount = 0;
    await page.route('**/collections/dashboard', (route) => {
      fetchCount++;
      route.continue();
    });
    // Wait for initial fetch
    await page.waitForTimeout(2000);
    const initialCount = fetchCount;
    // Wait for refetch (60s interval — use shorter for test or check network)
    // For practical testing, verify the query hook config instead
    expect(initialCount).toBeGreaterThanOrEqual(1);
  });

  test('redirects unauthenticated users to login', async ({ page, context }) => {
    // Clear auth state
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/dashboard');
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

});
```

#### 4.3 — Write Page Object Helpers

```typescript
// e2e/dashboard/dashboard.helpers.ts
import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async waitForLoad() {
    await this.page.waitForSelector('[data-testid="kpi-cards"]');
    await this.page.waitForSelector('[data-testid="priority-list"]');
  }

  async getCollectedAmount(): Promise<string> {
    return this.page.locator('[data-testid="collected-amount"]').innerText();
  }

  async getGoalAmount(): Promise<string> {
    return this.page.locator('[data-testid="goal-amount"]').innerText();
  }

  async getProgressPercentage(): Promise<string> {
    return this.page.locator('[data-testid="progress-percentage"]').innerText();
  }

  async getPriorityCardCount(): Promise<number> {
    return this.page.locator('[data-testid="priority-card"]').count();
  }

  async getFirstCardStatus(): Promise<string> {
    return this.page.locator('[data-testid="delinquency-badge"]').first().innerText();
  }
}
```

#### 4.4 — Run Playwright Tests

```bash
# Run against local dev server
cd apps/frontend && npx playwright test e2e/{module}/ --reporter=html 2>&1

# Or run against deployed environment
E2E_BASE_URL=https://your-cloudfront-url.com npx playwright test e2e/{module}/ 2>&1
```

**Output:** Playwright HTML report with screenshots on failure.

---

### Phase 5: Coverage Analysis

#### 5.1 — Backend Coverage

```bash
pnpm --filter @credinova/backend test -- --coverage --testPathPattern="domain/{module}" 2>&1
```

Check that critical files have adequate coverage:
- Services: target 80%+
- Controllers: target 70%+
- Utilities: target 90%+

#### 5.2 — Requirement-to-Test Mapping

Create a traceability matrix: every FR-* should have at least one test that verifies it.

| Requirement | Unit Test | Integration Test | E2E Test |
|-------------|-----------|-----------------|----------|
| FR-DASH-XX | `service.spec.ts:line` | `e2e.spec.ts:line` | `dashboard.spec.ts:line` |

Flag any requirements with zero test coverage.

---

### Phase 6: Generate Test Report

Create `docs/specs/$ARGUMENTS/test-report.md`:

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

| Test Suite | Tests | Passed | Failed | Skipped | Coverage |
|------------|-------|--------|--------|---------|----------|
| Backend Unit | {N} | {N} | {N} | {N} | {X}% |
| Frontend Unit | {N} | {N} | {N} | {N} | {X}% |
| Backend Integration | {N} | {N} | {N} | {N} | — |
| E2E (Playwright) | {N} | {N} | {N} | {N} | — |
| **Total** | **{N}** | **{N}** | **{N}** | **{N}** | — |

---

## Phase 1: Backend Unit Tests

| Test File | Tests | Pass | Fail | Duration |
|-----------|-------|------|------|----------|
| `{service}.service.spec.ts` | {N} | {N} | {N} | {Xs} |
| `{controller}.controller.spec.ts` | {N} | {N} | {N} | {Xs} |

### Failed Tests
{If any:}
- **{test name}** — `{file}:{line}` — {error message}

---

## Phase 2: Frontend Unit Tests

| Test File | Tests | Pass | Fail | Duration |
|-----------|-------|------|------|----------|
| `{component}.test.tsx` | {N} | {N} | {N} | {Xs} |
| `{hook}.test.ts` | {N} | {N} | {N} | {Xs} |

---

## Phase 3: Backend Integration Tests

| Endpoint | Method | Status | Auth | Response |
|----------|--------|--------|------|----------|
| `/collections/dashboard` | GET | {PASS/FAIL} | JWT validated | {status code} |
| `/collections/priority` | GET | {PASS/FAIL} | JWT validated | {status code} |

---

## Phase 4: E2E Tests (Playwright)

| Test | Viewport | Status | Duration | Screenshot |
|------|----------|--------|----------|------------|
| displays KPI summary cards | mobile | {PASS/FAIL} | {Xs} | {link if failed} |
| displays priority list | mobile | {PASS/FAIL} | {Xs} | {link if failed} |
| correct status colors | mobile | {PASS/FAIL} | {Xs} | {link if failed} |
| mobile-first layout | mobile | {PASS/FAIL} | {Xs} | {link if failed} |
| unauthenticated redirect | mobile | {PASS/FAIL} | {Xs} | {link if failed} |

### Playwright Report
HTML report saved to: `apps/frontend/playwright-report/index.html`

---

## Phase 5: Coverage & Traceability

### Coverage Summary

| Package | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| Backend ({module}) | {X}% | {X}% | {X}% | {X}% |
| Frontend ({module}) | {X}% | {X}% | {X}% | {X}% |

### Requirement Traceability

| Requirement | Unit | Integration | E2E | Status |
|-------------|------|-------------|-----|--------|
| FR-{ID} | {test name or —} | {test name or —} | {test name or —} | COVERED / GAP |

**Coverage: {X}/{Y} requirements have at least one test ({Z}%)**

---

## Remediation

{If any tests failed or requirements are uncovered:}

### Failed Tests
1. {Fix description for each failed test}

### Uncovered Requirements
1. {FR-XX}: {Suggested test to add}
```

---

### Phase 7: Report to User

Present results:
- **Overall status:** PASS (all tests pass, >80% coverage), PARTIAL (some failures or gaps), FAIL (critical failures)
- **Test counts:** total, passed, failed
- **Coverage gaps:** requirements without tests
- **Failed test details:** top 3 failures

If failures exist, ask:

**"Found {N} test failures and {M} uncovered requirements. What should I do?"**

Options:
- **Fix failures** — Debug and fix the failing tests or code
- **Add missing tests** — Write tests for uncovered requirements
- **Fix all** — Fix failures + add missing tests
- **Just the report** — Save the report without fixing

---

## Data-TestId Convention

To support E2E testing, the following `data-testid` attributes should be added to components during `/sdd-execute`:

| Component | data-testid |
|-----------|-------------|
| KPI cards container | `kpi-cards` |
| Collected amount | `collected-amount` |
| Goal amount | `goal-amount` |
| Progress bar | `collection-progress` |
| Progress percentage | `progress-percentage` |
| Priority list container | `priority-list` |
| Priority card | `priority-card` |
| Delinquency badge | `delinquency-badge` |
| Mobile nav | `mobile-nav` |
| Skeleton loader | `{component}-skeleton` |

---

## Environment Variables for E2E

Tests require these environment variables:

```bash
E2E_BASE_URL=http://localhost:3000    # or deployed URL
E2E_TEST_EMAIL=test@credinova.co      # Cognito test user
E2E_TEST_PASSWORD=TestPassword123!    # Cognito test password
```

---

## Error Handling

- **Playwright not installed:** Install it automatically with `npx playwright install chromium`
- **Backend test DB:** If tests need a database, use the test database URL or mock repositories
- **Auth in E2E:** Login via UI in `beforeEach` or inject tokens directly via localStorage
- **Flaky E2E tests:** Use `test.retry(2)` for network-dependent tests
- **No seed data:** If E2E tests find an empty dashboard, note it as a prerequisite (run seed script first)

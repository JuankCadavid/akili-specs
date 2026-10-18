# Views & Documentation — C4, View Selection, ADRs, Interfaces

Documenting an architecture = documenting the relevant **views**, then adding what applies across views (rationale, mapping, roadmap). Views are chosen by stakeholder need, never by habit. Basis: C4 (Simon Brown) as notation + SEI Views & Beyond as method.

## C4 — the default notation

| Level | Diagram | Shows | Use |
|---|---|---|---|
| 1 | **System Context** | The system as one box + users/personas + neighboring systems. People and systems, not tech | Always — first diagram of every TRD |
| 2 | **Container** | Separately deployable/runnable units (web app, API, DB, queue, function) + tech choices + comm links | Always |
| 3 | **Component** | Major building blocks inside ONE container + responsibilities | Only for complex containers |
| 4 | Code (UML class) | Classes inside a component | Almost never; generate on demand |

Rules: every element carries name + type tag + one-line description (`[Container: NestJS/Node]`); every relationship is a labeled directed arrow; **every diagram has a legend** — shared abstractions matter more than notation. Supplementary diagrams reuse the same elements: a **deployment view** (containers → AWS infrastructure) and, when async flows exist, a **runtime/sequence view** for the 1–3 most critical scenarios. Mermaid is the default renderer in AKILI docs. The `diagram-design` skill owns diagram slots, storage, and the optional interactive view.

## Which views, for whom (selection method)

1. List stakeholders; keep candidate views having at least one vested stakeholder; 2. combine/drop overview-only views; 3. prioritize — 80% done breadth-first beats one perfect view; **never defer rationale**.

| Stakeholder | Needs (detail) |
|---|---|
| Developers / AKILI Implementer | Module structure + layer rules (d), their container's components (d), interfaces (d) |
| Tech lead / future architect | Everything + candid rationale (d) |
| Ops / infra | Deployment view (d), container view (s) |
| Testers / AKILI Tester | C&C behavior + interfaces + scenario measures (d) |
| PM / customer | Context (o), container (o), cost/tier decision (o) |

Quality-attribute → view mapping: performance → runtime + deployment views; security → deployment + data-flow + trust boundaries; modifiability → module/dependency view; availability → deployment + failover behavior. If a scenario matters, some view must let a reader analyze it.

## View documentation template (per view, compact)

1. **Primary presentation** (the diagram, with legend)
2. **Element catalog** — one line per element: responsibility + key properties
3. **Context** — what's in/out of scope for this view
4. **Variability** — variation points and binding times (config, flags, plugins)
5. **Rationale** — why this shape; link scenario/ADR IDs

Mark unused sections "n/a" — never silently omit. Avoid repetition: define an element once, cross-reference elsewhere.

## ADR — Architecture Decision Record (compact 8-field AKILI profile)

Full SEI template has 12 fields; AKILI uses 8 (drop bureaucracy, keep traceability):

```markdown
### ADR-NNN: <decision title>
- **Status:** proposed | accepted | superseded by ADR-MMM
- **Issue:** the forcing problem (link Scenario IDs)
- **Decision:** what was chosen
- **Alternatives:** options seriously considered
- **Argument:** why this one — cost, TCO, time-to-market, measures
- **Implications:** new constraints, renegotiated scope, revisit triggers
- **Related:** ADRs / requirements / affected artifacts
```

Document a decision when it is hard to undo, took real evaluation effort, is confusing without context, or is unusual enough to be "fixed" by mistake. ROI test: capture now if that's cheaper than rediscovery later. For contested choices, a trade-study table (rows = concerns/scenarios, columns = alternatives, cells = ✓/✗/?) replaces prose.

Keep an ADR index table at the top of Architecture Overview & Decisions: `ID | Title | Status | Scenarios`.

## Interface / contract documentation (per exposed interface)

1. Identity & version · 2. Resources/operations (syntax, semantics, errors) · 3. Data types · 4. Error model (shared) · 5. Variability · 6. Quality characteristics (SLO/SLA: latency, rate limits) · 7. Rationale · 8. Usage examples. In practice: OpenAPI/GraphQL schema covers 1–4; the TRD adds 5–8 — especially 6, where interface SLOs inherit from scenario measures.

## Seven rules for sound documentation (package checklist)

1. Write for the reader · 2. Avoid repetition · 3. Explain every notation (legends) · 4. Standard organization (templates above; mark gaps "TBD") · 5. Record rationale while fresh, including rejected options · 6. Version and release docs; avoid perpetual-draft drift · 7. Review with the real stakeholders (in AKILI: `judgment-day` is the structured review).

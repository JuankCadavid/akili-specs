# Slot Catalog

Read at a slot step only. One row per slot. Fill a slot only when its condition holds; a false condition leaves nothing in the document.

## Slots

| Document · Section | Slot (id stem) | Condition | Archify type | Mermaid type | Question answered |
|---|---|---|---|---|---|
| `docs/prd.md` · User Stories | Core user journey (`prd-user-journey`) | when the product has a multi-step primary flow | `workflow` | `flowchart` | What steps does the primary user take to get value? |
| `docs/ux-ui/design.md` · Primary User Flows | One flow per primary flow (`ux-flow-<flow>`) | when the product has a UI | `workflow` | `flowchart` | How does the user move through this flow, including branches? |
| `docs/ux-ui/design.md` · Navigation Model | Screen hierarchy (`ux-screen-hierarchy`) | when the product has ≥ 2 screens | `tree` | `flowchart TD` | How are screens nested and reached? |
| `docs/trd/trd.md` · Architecture Overview & Decisions | C4 Context (`trd-c4-context`) | always | `architecture` | `flowchart` | Who and what talks to the system? |
| `docs/trd/trd.md` · Architecture Overview & Decisions | C4 Container (`trd-c4-container`) | always | `architecture` | `flowchart` | What runs separately, and how do the parts talk? |
| `docs/trd/trd.md` · Architecture Overview & Decisions | Deployment view (`trd-deployment`) | when there is more than one runtime environment or host | `architecture` | `flowchart` | What runs where? |
| `docs/trd/trd.md` · Data Model & Entities | Entity-relationship (`trd-erd`) | when the system persists structured data | `erd` | `erDiagram` | What entities exist and how do they relate? |
| `docs/trd/trd.md` · Backend Workflows & Business Rules | Critical runtime sequence, 1–3 (`trd-sequence-<flow>`) | when a flow crosses ≥ 3 participants or is asynchronous | `sequence` | `sequenceDiagram` | Who calls whom, in what order? |
| `docs/trd/trd.md` · Backend Workflows & Business Rules | Entity lifecycle (`trd-lifecycle-<entity>`) | when an entity has ≥ 3 states | `lifecycle` | `stateDiagram-v2` | Which states can the entity be in, and what moves it? |
| spec `design.md` · Architecture Overview | Changed-component view, and any of sequence / lifecycle / ERD the change alters (stem: `<slot-id>`, e.g. `changed-components`) | when `/akili-specify` classes the design as architecturally significant | per the matching row's type | per the matching row's type | What does this change touch, and how? |

Slot ids are kebab-case, stable, and are the file stems under the paths in `SKILL.md` section 4. TRD C4 Context and C4 Container each carry a legend and are always filled.

## Type Mapping

| Archify type | Mermaid type |
|---|---|
| `architecture`, `workflow` | `flowchart` |
| `sequence` | `sequenceDiagram` |
| `lifecycle` | `stateDiagram-v2` |
| `erd` | `erDiagram` |
| `tree` | `flowchart TD` |

C4 shapes are drawn with subgraphs plus a legend in a Mermaid `flowchart`.

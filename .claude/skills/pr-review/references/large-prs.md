# Large PRs: Defaults and Configuration
> AKILI-authored. The approach (filter noise first, size the review by risk, split by token budget) follows the public description in Cloudflare's "Orchestrating AI Code Review at scale"; the architecture is credited, no text is taken.

`post-review.cjs prepare` computes every number on this page. The coordinator reads the results from `manifest.json`; it never re-derives them. The values below are copied from the constants at the top of `post-review.cjs`, so when the script changes, this page changes with it.

## Pipeline in one view

1. **Filter** the diff: drop noise files, keep migrations. Each drop is recorded in `skipped_files` with its reason.
2. **Tier** the kept files: `trivial`, `lite` or `full`.
3. **Chunk** the kept files by estimated tokens. One lens reviewer runs per (lens, chunk).
4. An **empty** filtered diff means there is nothing to review (the run is skipped).

## Noise filter

Rules apply in this order; the first that matches decides.

| Order | Rule | Effect |
|---|---|---|
| 1 | `exclude` in `.akili/review.yml` matches | dropped, reason `excluded by .akili/review.yml` |
| 2 | `include` in `.akili/review.yml` matches | kept, and no later rule can drop it |
| 3 | Migration globs match | kept |
| 4 | Noise globs below match | dropped, reason is the category |

| Category | Globs |
|---|---|
| lockfile | `package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `bun.lock`, `Cargo.lock`, `Gemfile.lock`, `poetry.lock`, `Pipfile.lock`, `composer.lock`, `go.sum`, `uv.lock`, `pdm.lock`, `Podfile.lock`, `mix.lock`, `pubspec.lock`, `gradle.lockfile` |
| vendored | `**/vendor/**`, `**/node_modules/**`, `**/third_party/**`, `**/third-party/**`, `**/bower_components/**`, `**/Pods/**`, `**/.yarn/**` |
| minified | `*.min.js`, `*.min.css`, `*.min.mjs` |
| source map | `*.js.map`, `*.mjs.map`, `*.css.map`, `*.ts.map` |
| generated | `*.generated.*`, `*.gen.*`, `*.pb.go`, `*_pb2.py`, `*_pb2_grpc.py`, `*.g.dart`, `**/__generated__/**`, `**/generated/**`, `**/dist/**`, `**/.next/**` |
| migrations (kept) | `**/migrations/**`, `**/migrate/**`, `**/alembic/versions/**` |

Glob rules: `**/` crosses directories; `*` and `?` stay inside one path segment; a pattern with no slash matches the file name at any depth; a trailing slash means `/**`.

## Risk tier

Changed lines are added plus removed, counted over the kept files only.

| Tier | Condition (defaults) | Lenses | Verification |
|---|---|---|---|
| `full` | any kept file matches a security-sensitive glob, or larger than `lite` | `spec`, `correctness`, `tests`, `maintainability`, `security`, plus `docs` when a kept file matches a docs glob | two blind judges per critical |
| `trivial` | at most 10 changed lines (`TRIVIAL_MAX_LINES`) | `spec`, `correctness` | none |
| `lite` | at most 100 changed lines (`LITE_MAX_LINES`) and at most 20 files (`LITE_MAX_FILES`) | `spec`, `correctness`, `tests` | one verifier pass over criticals |

Evaluation order in `prepare`: sensitive path first (always `full`), then `trivial`, then `lite`, otherwise `full`. `--tier` forces a tier; the derived value is otherwise authoritative.

Docs globs (add the `docs` lens): `docs/**`, `**/*.md`, `**/*.mdx`, `**/*.rst`.

### Security-sensitive globs

A match forces `full` and fills `recommend_security`, which the summary turns into a `/akili-security <paths> --profile quick` suggestion.

| Area | Globs |
|---|---|
| Authentication and authorization | `**/auth/**`, `**/authn/**`, `**/authz/**`, `**/oauth/**`, `**/authentication/**`, `**/authorization/**`, `**/auth.*` |
| Cryptography | `**/crypto/**`, `**/cryptography/**`, `**/crypto.*`, `**/*.pem`, `**/*.key` |
| Secrets and credentials | `**/secret/**`, `**/secrets/**`, `**/secret.*`, `**/secrets.*`, `**/credential/**`, `**/credentials/**`, `**/credentials.*`, `**/.env`, `**/.env.*` |
| Sessions | `**/session/**`, `**/sessions/**`, `**/session*`, `**/*Session*`, `**/*-session*`, `**/*_session*`, `**/*.session.*` |
| Tokens | `**/token/**`, `**/tokens/**`, `**/token*`, `**/*Token*`, `**/*-token*`, `**/*_token*`, `**/*.token.*`, `**/jwt/**`, `**/jwt.*` |
| IPC | `**/ipc/**`, `**/ipc-*`, `**/ipc.*` |
| Deserialization | `**/deserializ*`, `**/deserializ*/**`, `**/serialization/**` |
| CI workflows | `.github/workflows/**` |
| Dependency manifests | `**/package.json`, `**/requirements*.txt`, `**/pyproject.toml`, `**/Pipfile`, `**/Cargo.toml`, `**/go.mod`, `**/Gemfile`, `**/pom.xml`, `**/build.gradle`, `**/build.gradle.kts`, `**/composer.json` |

The session and token prefixes (`**/session*`, `**/token*`) over-match on purpose (for example `tokenizer.js`): a false positive costs a deeper review, a miss would hide a sensitive file.

## Chunking

| Constant | Value | Meaning |
|---|---|---|
| `CHUNK_TOKEN_BUDGET` | 12000 | estimated tokens per chunk |
| `CHARS_PER_TOKEN` | 4 | estimate = patch characters divided by 4, rounded up |

Files are taken in diff order. A file that would push the running chunk over the budget starts a new chunk. A single file larger than the budget gets a chunk of its own (it is not split by `prepare`). In `full`, the coordinator re-splits a chunk whose lens report still overflows; nothing is truncated.

`prepare` writes, under the run or input directory: `manifest.json`, `context.md`, and `files/0001.patch`, `files/0002.patch`, and so on, one patch per kept file.

## Confidence threshold

| Constant | Value | Who does what |
|---|---|---|
| `DEFAULT_THRESHOLD` | 80 | `prepare` records it in the manifest. The coordinator drops findings below it. `render` and `post` reject a document that still holds one (validator), so `post` posts nothing. |

## Output caps (applied by `render` and `post`)

| Constant | Value | Meaning |
|---|---|---|
| `INLINE_CAP` | 10 | inline comments per review |
| `SUMMARY_CAP` | 60000 | characters in the summary comment |
| `INLINE_BODY_CAP` | 4000 | characters in one inline comment |
| `FIELD_MAX` | evidence 1200, why 800, fix 800 | per-field maxima, the validator's |
| `NOTE_MAX` | 500 | characters in one note |

## `.akili/review.yml`

Flat keys only: no nesting, no anchors. A list is `[a, b]` or `- item` lines; `#` starts a comment. An unknown key, a duplicate key, a bad value or an indented line is a usage error (exit 2), never ignored. CI reads the file from the base-SHA checkout, so a PR cannot weaken its own review.

| Key | Type | Default | Effect |
|---|---|---|---|
| `include` | list of globs | none | keep matching files even when a noise glob matches |
| `exclude` | list of globs | none | drop matching files; wins over `include` |
| `trusted_posters` | list of logins | the CI bot only | accounts whose prior summaries are trusted for re-review state |
| `threshold` | integer 0 to 100 | 80 | confidence floor |
| `trivial_max_lines` | integer 0 to 1000000 | 10 | upper bound of `trivial` |
| `lite_max_lines` | integer 0 to 1000000 | 100 | upper bound of `lite` |
| `lite_max_files` | integer 0 to 100000 | 20 | file bound of `lite` |
| `chunk_tokens` | integer 100 to 1000000 | 12000 | chunk budget |
| `history` | `true` or `false` | none | accepted by the parser; `prepare` and `post` do not read it |

Each list entry is at most 200 characters with no control characters. The manifest records which file the numbers came from in `config_source` (`default`, or `.akili/review.yml@<base_sha>`).

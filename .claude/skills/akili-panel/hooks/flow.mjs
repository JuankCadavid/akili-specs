// akili-panel: the pure rules behind the pane (changes/akili-panel, T4).
//
// No `$`, no Node import: Claude Code's plugin worker loads this file, and so
// does `node --test`. Everything that touches a disk goes through an injected
// io `{ list(path), exists(path), read(path) }`, all async, and every path the
// io receives is ABSOLUTE (the root joined with the relative part, DD-17/J-5).
// `list` resolves to entries shaped like the host's `FsEntry`: `{ name, kind:
// 'file' | 'dir' | 'other', size, mtimeMs }`.

// ---------------------------------------------------------------- data (DD-15)

export const MARKS = Object.freeze({ done: '✓', current: '▶', todo: '○' })

export const PHASES = Object.freeze(['propose', 'specify', 'execute', 'test', 'validate', 'archive'])

export const SPEC_FILES = Object.freeze([
  'proposal.md', 'requirements.md', 'design.md', 'tasks.md',
  'execution.md', 'test-report.md', 'validation-report.md',
])

export const CARVE_OUTS = Object.freeze(['archive', 'general-setup', 'quick', 'kaizen', 'audits', 'reviews'])

// The 13 baseline files of FR-6; `legacy` is the alternate path some rows accept.
export const CONSTITUTION_FILES = Object.freeze([
  { path: 'docs/prd.md' },
  { path: 'docs/ux-ui/design.md', legacy: 'docs/system-design/design.md' },
  { path: 'docs/trd/trd.md', legacy: 'docs/detailed-design/detailed-design.md' },
  { path: 'docs/infrastructure.md' },
  { path: 'docs/specs/general-setup/requirements.md' },
  { path: 'docs/specs/general-setup/design.md' },
  { path: 'docs/specs/general-setup/task.md' },
  { path: 'docs/specs/general-setup/family.md' },
  { path: 'AGENTS.md' },
  { path: '.agents/leader.md' },
  { path: '.agents/implementer.md' },
  { path: '.agents/reviewer.md' },
  { path: '.agents/tester.md' },
])

export const SPECS_DIR = 'docs/specs'
export const MAX_SPEC_DEPTH = 4
export const MAX_GIT_LEVELS = 20
export const MAX_KEPT = 50

export const STRINGS = Object.freeze({
  noSpecsFolder: 'No docs/specs/ folder yet.',
  noActive: 'No active spec.',
  noGit: '(no git)',
  archived: 'archived',
  blocked: '(blocked)',
  noTaskStatus: '(no task status)',
  constitution: 'Constitution',
  next: 'Next: ',
  ctxMissing: 'ctx —',
  readError: (path, reason) => `Could not read ${path}: ${reason}`,
  moreActive: (n) => `(${n} more active)`,
  detached: (sha) => `detached @${sha}`,
  paneOpened: 'Akili pane opened.',
  paneNotShown: (reason) => `Akili pane not shown: ${reason}`,
  runRefused: (command, reason) => `Could not run /${command}: ${reason}`,
})

// FR-7: the state -> command table, as data. `args: 'spec'` means "the displayed spec".
export const NEXT_TABLE = Object.freeze({
  noSpecsConstitutionDone: { command: 'akili-propose', args: '' },
  noSpecsConstitutionOpen: { command: 'akili-constitution', args: '' },
  noActiveConstitutionDone: { command: 'akili-propose', args: '' },
  noActiveConstitutionOpen: { command: 'akili-constitution', args: '' },
  archivedOthers: { command: 'akili-resume', args: '' },
  archivedNone: { command: 'akili-propose', args: '' },
  phase: Object.freeze({
    propose: 'akili-propose', specify: 'akili-specify', execute: 'akili-execute',
    test: 'akili-test', validate: 'akili-validate', archive: 'akili-archive',
  }),
})

// ---------------------------------------------------------------- paths

const SEP = /[\\/]/

export function joinPath(root, rel) {
  const base = String(root).replace(/[\\/]+$/, '')
  return `${base}/${String(rel).replace(/^[\\/]+/, '')}`
}

function isAbsoluteLike(p) {
  return /^[\\/]/.test(p) || /^[A-Za-z]:[\\/]/.test(p)
}

// The folder itself first, then each parent, cut as strings (Windows safe).
export function ancestors(root, limit = MAX_GIT_LEVELS) {
  const parts = String(root).replace(/[\\/]+$/, '').split(SEP)
  const out = []
  for (let i = parts.length; i >= 1 && out.length < limit; i--) {
    out.push(parts.slice(0, i).join('/'))
  }
  return out
}

function errReason(e) {
  return (e && e.message ? String(e.message) : String(e)).replace(/\s+/g, ' ').trim()
}

function isNotFound(e) {
  return !!e && (e.code === 'ENOENT' || /ENOENT|no such file|not found|does not exist/i.test(errReason(e)))
}

// ---------------------------------------------------------------- FR-5 safe path and observers

const SEGMENT = /^[A-Za-z0-9._-]+$/

export function safeSpecPath(arg) {
  if (typeof arg !== 'string' || arg === '') return null
  const segments = arg.split('/')
  for (const s of segments) {
    if (!SEGMENT.test(s) || s === '.' || s === '..') return null
  }
  return arg
}

const SPEC_TAKING = new Set(['akili-specify', 'akili-execute', 'akili-test', 'akili-validate', 'akili-archive'])
const KEBAB_WITH_HYPHEN = /^[a-z0-9]+(?:-[a-z0-9]+)+$/

// The spec a typed or Skill-tool run names, or null when it keeps nothing.
export function keptSpecFor(command, args) {
  const name = String(command || '').replace(/^\//, '')
  const first = String(args || '').trim().split(/\s+/)[0] || ''
  if (SPEC_TAKING.has(name)) return safeSpecPath(first)
  if (name === 'akili-propose') {
    if (first.includes('/')) return safeSpecPath(first)
    if (KEBAB_WITH_HYPHEN.test(first)) return safeSpecPath(`changes/${first}`)
  }
  return null
}

export function storeKey(root) {
  return `spec:${String(root).replace(/[\\/]+$/, '')}`
}

// `entries` is `{ [key]: { path, at } }`; returns a copy with `value` set and at most 50 keys kept.
export function keepSpec(entries, root, path, at) {
  const next = { ...entries, [storeKey(root)]: { path, at } }
  const keys = Object.keys(next)
  if (keys.length > MAX_KEPT) {
    keys.sort((a, b) => next[a].at - next[b].at)
    for (const k of keys.slice(0, keys.length - MAX_KEPT)) delete next[k]
  }
  return next
}

// ---------------------------------------------------------------- FR-6 task tokens

const TOKEN_RULES = [
  // (a) a `Status` table row's value cell
  /^\s*\|\s*(?:\*\*)?Status:?(?:\*\*)?\s*\|\s*`?\[([ xX~])\]/,
  // (b) a list item
  /^\s*[-*+]\s+`?\[([ xX~])\]/,
  // (c) the value after **Status:**
  /\*\*Status:?\*\*:?\s*`?\[([ xX~])\]/,
  // (d) the end of a heading
  /^#{1,6}\s.*?`?\[([ xX~])\]`?\s*$/,
]

export function parseTaskTokens(text) {
  const out = { done: 0, open: 0, blocked: 0, total: 0 }
  let inControl = false
  for (const line of String(text).split(/\r?\n/)) {
    const heading = /^#{1,6}\s+(.*)$/.exec(line)
    if (heading) {
      // `## Document Control` is skipped up to the next heading of any level.
      inControl = /^(?:\d+\.\s*)?Document Control\b/i.test(heading[1])
      if (inControl) continue
    }
    if (inControl) continue
    for (const rule of TOKEN_RULES) {
      const m = rule.exec(line)
      if (!m) continue
      const c = m[1]
      if (c === ' ') out.open++
      else if (c === '~') out.blocked++
      else out.done++
      out.total++
      break
    }
  }
  return out
}

// ---------------------------------------------------------------- io helpers (fail soft, FR-16)

async function tryExists(io, path, errors) {
  try {
    return !!(await io.exists(path))
  } catch (e) {
    errors.push({ path, reason: errReason(e) })
    return false
  }
}

async function tryRead(io, path, errors) {
  try {
    return await io.read(path)
  } catch (e) {
    if (errors) errors.push({ path, reason: errReason(e) })
    return null
  }
}

// ---------------------------------------------------------------- constitution

export async function readConstitution(io, root, errors = []) {
  const counts = await Promise.all(CONSTITUTION_FILES.map(async (row) => {
    if (await tryExists(io, joinPath(root, row.path), errors)) return 1
    if (row.legacy && (await tryExists(io, joinPath(root, row.legacy), errors))) return 1
    return 0
  }))
  return { present: counts.reduce((a, b) => a + b, 0), total: CONSTITUTION_FILES.length }
}

export function constitutionMark(c) {
  if (c.present >= c.total) return 'done'
  return c.present === 0 ? 'todo' : 'current'
}

// ---------------------------------------------------------------- scan of docs/specs

// One `list` per folder visited. A spec is a folder holding a spec file (not entered
// further); any other folder is a container (family or taxonomy) and is entered.
export async function scanSpecs(io, root, errors = []) {
  const base = joinPath(root, SPECS_DIR)
  const specs = []
  const bare = []
  let rootEntries
  try {
    rootEntries = await io.list(base)
  } catch (e) {
    if (!isNotFound(e)) errors.push({ path: base, reason: errReason(e) })
    return { present: false, specs, bare }
  }

  async function visit(rel, entries, depth) {
    const subdirs = entries.filter((x) => x.kind === 'dir')
    const files = entries.filter((x) => x.kind !== 'dir')
    const specFiles = files.filter((x) => SPEC_FILES.includes(x.name))
    if (specFiles.length > 0) {
      specs.push({
        path: rel,
        files: specFiles.map((x) => x.name),
        mtimeMs: Math.max(...specFiles.map((x) => x.mtimeMs || 0)),
      })
      return
    }
    if (subdirs.length === 0) {
      if (!files.some((x) => x.name === 'family.md')) bare.push(rel)
      return
    }
    if (depth >= MAX_SPEC_DEPTH) return
    await Promise.all(subdirs.map((d) => enter(`${rel}/${d.name}`, depth + 1)))
  }

  async function enter(rel, depth) {
    const abs = joinPath(base, rel)
    let entries
    try {
      entries = await io.list(abs)
    } catch (e) {
      errors.push({ path: abs, reason: errReason(e) })
      return
    }
    await visit(rel, entries, depth)
  }

  const top = rootEntries.filter((x) => x.kind === 'dir' && !CARVE_OUTS.includes(x.name))
  await Promise.all(top.map((d) => enter(d.name, 1)))
  specs.sort((a, b) => (a.path < b.path ? -1 : 1))
  return { present: true, specs, bare }
}

export function archiveSafeName(specPath) {
  return String(specPath).replace(/\//g, '--')
}

export function isArchiveName(name, specPath) {
  const safe = archiveSafeName(specPath).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${safe}$`).test(name)
}

export async function isArchived(io, root, specPath, errors = []) {
  const dir = joinPath(root, `${SPECS_DIR}/archive`)
  try {
    const entries = await io.list(dir)
    return entries.some((x) => x.kind === 'dir' && isArchiveName(x.name, specPath))
  } catch (e) {
    if (!isNotFound(e)) errors.push({ path: dir, reason: errReason(e) })
    return false
  }
}

// ---------------------------------------------------------------- branch (FR-11, DD-17)

export function parseHead(text) {
  const t = String(text == null ? '' : text).trim()
  const ref = /^ref:\s*refs\/heads\/(.+)$/.exec(t)
  if (ref) return { kind: 'branch', name: ref[1].trim(), sha: '' }
  if (/^(?:[0-9a-fA-F]{40}|[0-9a-fA-F]{64})$/.test(t)) return { kind: 'detached', name: '', sha: t.slice(0, 7) }
  return { kind: 'none', name: '', sha: '' }
}

const NO_BRANCH = Object.freeze({ kind: 'none', name: '', sha: '' })

// At most 20 `exists`, 2 `read`, no process. The `.git` probe read may fail silently; a failing HEAD read is recorded.
export async function readBranch(io, root, errors = []) {
  let folder = null
  for (const dir of ancestors(root)) {
    if (await tryExists(io, `${dir}/.git`, errors)) { folder = dir; break }
  }
  if (folder === null) return { ...NO_BRANCH }
  const dotGit = `${folder}/.git`
  let headPath = `${dotGit}/HEAD`
  const file = await tryRead(io, dotGit, null)
  const pointer = file == null ? null : /^gitdir:\s*(.+?)\s*$/m.exec(String(file))
  if (pointer) {
    const target = pointer[1]
    const gitDir = isAbsoluteLike(target) ? target : `${folder}/${target}`
    headPath = `${gitDir.replace(/[\\/]+$/, '')}/HEAD`
  }
  const head = await tryRead(io, headPath, errors)
  return head == null ? { ...NO_BRANCH } : parseHead(head)
}

// ---------------------------------------------------------------- FR-5 choice

function newest(list) {
  return [...list].sort((a, b) => b.mtimeMs - a.mtimeMs || (a.path < b.path ? -1 : 1))[0]
}

// Pure: picks the displayed spec from a scan, the kept spec and the branch.
export function chooseSpec({ kept, specs, bare, keptArchived, branch }) {
  if (kept) {
    const found = specs.find((s) => s.path === kept)
    if (found) return { path: found.path, archived: false, spec: found }
    if (bare.includes(kept)) return { path: kept, archived: false, spec: { path: kept, files: [], mtimeMs: 0 } }
    if (keptArchived) return { path: kept, archived: true, spec: null }
  }
  if (branch && branch.kind === 'branch') {
    const last = branch.name.split('/').pop()
    const matches = specs.filter((s) => s.path.split('/').pop() === last)
    if (matches.length) {
      const s = newest(matches)
      return { path: s.path, archived: false, spec: s }
    }
  }
  if (specs.length) {
    const s = newest(specs)
    return { path: s.path, archived: false, spec: s }
  }
  return null
}

// ---------------------------------------------------------------- FR-6 phases

// Pure: the six phases, first-not-done is current, everything later is not reached.
export function derivePhases({ files, tokens, archived }) {
  if (archived) {
    return { phases: PHASES.map((id) => ({ id, mark: 'done', note: null })), blocked: false, current: null }
  }
  const has = (f) => files.includes(f)
  const done = {
    propose: files.length > 0 && ['proposal.md', 'requirements.md', 'design.md', 'tasks.md'].some(has),
    specify: has('requirements.md') && has('design.md') && has('tasks.md'),
    execute: !!tokens && tokens.total > 0 && tokens.done === tokens.total,
    test: has('test-report.md'),
    validate: has('validation-report.md'),
    archive: false,
  }
  const currentIdx = PHASES.findIndex((id) => !done[id])
  const blocked = !!tokens && tokens.blocked > 0
  const phases = PHASES.map((id, i) => {
    if (i < currentIdx) return { id, mark: 'done', note: null }
    if (i > currentIdx) return { id, mark: 'todo', note: null }
    let note = null
    if (blocked) note = 'blocked'
    else if (id === 'execute' && has('tasks.md') && tokens && tokens.total === 0) note = 'no-task-status'
    return { id, mark: 'current', note }
  })
  return { phases, blocked, current: PHASES[currentIdx] }
}

// ---------------------------------------------------------------- FR-7 next button

export function nextButton(view) {
  const done = view.constitution && constitutionMark(view.constitution) === 'done'
  if (view.status === 'no-specs') return { ...(done ? NEXT_TABLE.noSpecsConstitutionDone : NEXT_TABLE.noSpecsConstitutionOpen) }
  if (view.status === 'no-active') return { ...(done ? NEXT_TABLE.noActiveConstitutionDone : NEXT_TABLE.noActiveConstitutionOpen) }
  if (view.archived) return { ...(view.moreActive > 0 ? NEXT_TABLE.archivedOthers : NEXT_TABLE.archivedNone) }
  const current = (view.phases.find((p) => p.mark === 'current') || {}).id
  if (!current) return null
  return { command: NEXT_TABLE.phase[current], args: view.spec }
}

export function formatNext(next) {
  if (!next) return ''
  return `${STRINGS.next}/${next.command}${next.args ? ` ${next.args}` : ''}`
}

// ---------------------------------------------------------------- refresh

// One refresh: reads through `io`, never throws, returns the `view-1` snapshot (design §5.2).
export async function refresh(io, root, keptPath) {
  const errors = []
  const scan = await scanSpecs(io, root, errors)
  const kept = keptPath && safeSpecPath(keptPath) ? keptPath : null
  const keptHere = !!kept && (scan.specs.some((s) => s.path === kept) || scan.bare.includes(kept))
  const keptArchived = !!kept && !keptHere ? await isArchived(io, root, kept, errors) : false
  const branch = await readBranch(io, root, errors)
  const constitution = await readConstitution(io, root, errors)

  const chosen = scan.present ? chooseSpec({ kept, specs: scan.specs, bare: scan.bare, keptArchived, branch }) : null
  const view = {
    status: !scan.present ? 'no-specs' : chosen ? 'ok' : 'no-active',
    spec: chosen ? chosen.path : null,
    archived: !!(chosen && chosen.archived),
    moreActive: scan.specs.filter((s) => !chosen || s.path !== chosen.path).length,
    constitution,
    phases: [],
    blocked: false,
    branch,
    next: null,
    errors,
  }
  if (chosen) {
    let tokens = null
    if (!chosen.archived && chosen.spec.files.includes('tasks.md')) {
      const text = await tryRead(io, joinPath(root, `${SPECS_DIR}/${chosen.path}/tasks.md`), errors)
      tokens = text == null ? null : parseTaskTokens(text)
    }
    const d = derivePhases({ files: chosen.spec ? chosen.spec.files : [], tokens, archived: chosen.archived })
    view.phases = d.phases
    view.blocked = d.blocked
  }
  view.next = nextButton(view)
  return view
}

// ---------------------------------------------------------------- formatters (FR-12, FR-16, §8)

export function shortenCount(value) {
  const n = Math.round(Number(value) || 0)
  if (n < 1000) return String(n)
  if (n < 1e6) {
    const k = n / 1000
    if (k < 9.95) return `${k.toFixed(1)}k`
    const r = Math.round(k)
    if (r < 1000) return `${r}k`
  }
  return `${(n / 1e6).toFixed(1)}M`
}

// in = input + cache-read + cache-write, out = output, from one `turn.complete` usage.
export function turnTokens(usage) {
  const u = usage || {}
  const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : 0)
  return {
    in: num(u.input_tokens) + num(u.cache_read_input_tokens) + num(u.cache_creation_input_tokens),
    out: num(u.output_tokens),
  }
}

export function shortenMiddle(text, max) {
  const s = String(text)
  if (max <= 0) return ''
  if (s.length <= max) return s
  if (max === 1) return '…'
  const head = Math.ceil((max - 1) / 2)
  const tail = Math.floor((max - 1) / 2)
  return `${s.slice(0, head)}…${tail ? s.slice(s.length - tail) : ''}`
}

export function fitLine(text, cols) {
  const s = String(text)
  if (!(cols > 0) || s.length <= cols) return s
  return cols === 1 ? '…' : `${s.slice(0, cols - 1)}…`
}

export function branchLabel(branch) {
  if (!branch || branch.kind === 'none') return STRINGS.noGit
  if (branch.kind === 'detached') return STRINGS.detached(branch.sha)
  return branch.name
}

export function formatHeader(view, cols) {
  const label = branchLabel(view.branch)
  const branchText = view.branch && view.branch.kind !== 'none' ? `⎇ ${label}` : label
  const tail = `${view.archived ? ` · ${STRINGS.archived}` : ''}${view.moreActive > 0 && view.spec ? ` ${STRINGS.moreActive(view.moreActive)}` : ''}`
  if (!view.spec) return fitLine(`Akili · ${branchText}${tail}`, cols)
  const fixed = 'Akili · '.length + ' · '.length + tail.length
  const avail = (cols > 0 ? cols : Infinity) - fixed
  let spec = view.spec
  let branchPart = branchText
  if (spec.length + branchPart.length > avail) {
    spec = shortenMiddle(spec, Math.max(5, avail - branchPart.length))
    branchPart = shortenMiddle(branchPart, Math.max(1, avail - spec.length))
  }
  return fitLine(`Akili · ${spec} · ${branchPart}${tail}`, cols)
}

export function formatConstitution(c) {
  const mark = constitutionMark(c)
  const tail = mark === 'done' ? MARKS.done : mark === 'todo' ? MARKS.todo : `${MARKS.current} (${c.present}/${c.total})`
  return `01 ${STRINGS.constitution}  ${tail}`
}

// Lines of the flow block; `current` marks the line to draw bold.
export function formatPhaseLines(phases) {
  const width = Math.max(...PHASES.map((p) => p.length))
  return phases.map((p, i) => {
    let mark = MARKS[p.mark]
    if (p.note === 'blocked') mark += ` ${STRINGS.blocked}`
    if (p.note === 'no-task-status') mark += ` ${STRINGS.noTaskStatus}`
    return { text: `${i === 0 ? '02' : '  '} ${p.id.padEnd(width)}  ${mark}`, current: p.mark === 'current' }
  })
}

export function emptyStateText(view) {
  if (view.status === 'no-specs') return STRINGS.noSpecsFolder
  if (view.status === 'no-active') return STRINGS.noActive
  return null
}

export function errorLines(errors, cols, max = 3) {
  return (errors || []).slice(0, max).map((e) => fitLine(STRINGS.readError(e.path, String(e.reason).replace(/\s+/g, ' ').trim()), cols))
}

// `usage`: { ctxPercent?, ctxTokens?, ctxWindow?, usd? }; `sums`: { in, out }.
// Narrow panes drop parts right to left: `$`, then `session`.
export function formatTokens(usage, sums, cols) {
  const u = usage || {}
  const s = sums || { in: 0, out: 0 }
  const ctx = typeof u.ctxPercent === 'number'
    ? `ctx ${Math.round(u.ctxPercent)}% (${shortenCount(u.ctxTokens)}/${shortenCount(u.ctxWindow)})`
    : STRINGS.ctxMissing
  const session = `session ${shortenCount(s.in)} in / ${shortenCount(s.out)} out`
  const usd = typeof u.usd === 'number' ? `$${u.usd.toFixed(2)}` : null
  const tryParts = [[ctx, session, usd], [ctx, session], [ctx]]
  for (const parts of tryParts) {
    const line = `Tokens: ${parts.filter(Boolean).join(' · ')}`
    if (!(cols > 0) || line.length <= cols) return line
  }
  return fitLine(`Tokens: ${ctx}`, cols)
}

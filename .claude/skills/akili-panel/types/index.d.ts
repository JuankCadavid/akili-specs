// State contract for the akili-panel plugin (design §5.2). Self-contained: no import.
export type AkiliPanelView = {
  status: 'ok' | 'no-specs' | 'no-active'
  spec: string | null
  archived: boolean
  moreActive: number
  constitution: { present: number; total: number }
  phases: { id: string; mark: 'done' | 'current' | 'todo'; note?: string }[]
  blocked: boolean
  branch: { kind: 'branch' | 'detached' | 'none'; name?: string; sha?: string }
  next: { command: string; args: string } | null
  errors: { path: string; reason: string }[]
  refreshedAt: number
}
export type AkiliPanelTokens = { in: number; out: number }
export type AkiliPanelUsage = { ctxPercent?: number; ctxTokens?: number; ctxWindow?: number; usd?: number }
export type AkiliPanelPending = { since: number; command: string }
export type AkiliPanelHost = { model: string | null; skills: string[] | null }
export type AkiliPanelSkillsUi = { open: boolean; group: 'core' | 'conditional' | 'stack' | null }

declare module 'claude-code' {
  interface PluginState {
    'akili-panel': {
      view: Shaped<AkiliPanelView | null>
      tokens: Shaped<AkiliPanelTokens>
      usage: Shaped<AkiliPanelUsage>
      opened: boolean
      pending: AkiliPanelPending | null
      host: Shaped<AkiliPanelHost>
      skillsUi: AkiliPanelSkillsUi
    }
  }
}

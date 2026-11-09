const draw = async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const cols = e.props && e.props.bodyColumns
    return (
      <Box flexDirection="column">
        <Text>cols={String(cols)} surface={e.surface}</Text>
        <Text color="subtle" dimColor>──────────</Text>
        <Text><Text color="inactive">02 Cycle  </Text><Text color="success">━━━━</Text><Text color="suggestion">━━</Text><Text color="subtle">──────</Text><Text color="inactive"> 2/6</Text></Text>
        <Text color="success">done ✓</Text>
        <Text color="suggestion" bold>current ▶</Text>
        <Text color="warning" bold>blocked ▶</Text>
        <Text color="error">error</Text>
        <Text color="inactive">pending ○</Text>
        <Button key="chip" plain onPress={() => {}}><Text backgroundColor="suggestion" color="inverseText" bold> Next: chip </Text></Button>
        <Button key="prim" variant="primary" onPress={() => {}}>Next: primary</Button>
      </Box>
    )
  }

export const register = (on) => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await $.command.register({ name: 'probe-gray', description: 'open default' })
    await $.command.register({ name: 'probe-clear', description: 'open transparent' })
    await $.command.register({ name: 'probe-focus', description: 'open transparent, focused' })
    return r
  })
  on('command.run', { command: 'probe-gray' }, async ($) => {
    const o = await $.ui.open({ id: 'pg', title: 'Gray' })
    return { text: `gray placed=${o.isPlaced} ${o.reason || ''}` }
  })
  on('command.run', { command: 'probe-clear' }, async ($) => {
    const o = await $.ui.open({ id: 'pc', title: 'Clear', backgroundColor: 'transparent' })
    return { text: `clear placed=${o.isPlaced} ${o.reason || ''}` }
  })
  on('command.run', { command: 'probe-focus' }, async ($) => {
    const o = await $.ui.open({ id: 'pf', title: 'Focus', backgroundColor: 'transparent', focus: true })
    return { text: `focus placed=${o.isPlaced} ${o.reason || ''}` }
  })
  on('ui.render', { component: 'Pane', requestId: 'pg' }, draw)
  on('ui.render', { component: 'Pane', requestId: 'pc' }, draw)
  on('ui.render', { component: 'Pane', requestId: 'pf' }, draw)
}

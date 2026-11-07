import { expect, test } from 'claude-code/testing'
const PANE = { plugin: 'probe-pane', component: 'Pane', requestId: 'pc', props: { title: 'x', isFocused: false, bodyColumns: 40, placement: 'dock', scroll: { offset: 0, bodyRows: 20 }, view: {} } } as const
test('tree mounts on every surface; button text and press', async ($, on) => {
  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const chip = await ui.find({ key: 'chip' })
    console.log(surface, JSON.stringify(chip && chip.text))
    expect(chip?.text).toMatch(/Next: chip/)
    await ui.press({ key: 'chip' })
    const row = await ui.find({ type: 'Text', text: /2\/6/ })
    console.log(surface, 'row', JSON.stringify(row && row.text))
    await ui.unmount()
  }
})

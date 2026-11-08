// Production-preview acceptance using an already running local Chrome/Edge CDP.
// Does not overwrite the older kids-* evidence. All waits are bounded.
import fs from 'node:fs/promises'
import path from 'node:path'
const base = process.env.APP_URL ?? 'http://127.0.0.1:4173/'
const out = path.resolve('artifacts', `game-${Date.now()}`)
await fs.mkdir(out, { recursive: true })
const pages = await (
  await fetch(process.env.CDP_URL ?? 'http://127.0.0.1:9222/json/list')
).json()
const ws = new WebSocket(
  pages.find((p) => p.type === 'page').webSocketDebuggerUrl,
)
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})
let id = 0
const pending = new Map(),
  errors = [],
  requests = [],
  passes = []
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id) {
    const p = pending.get(m.id)
    if (!p) return
    pending.delete(m.id)
    clearTimeout(p.timer)
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result)
  } else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params)
  else if (m.method === 'Network.requestWillBeSent')
    requests.push(m.params.request.url)
}
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const key = ++id
    const timer = setTimeout(() => {
      pending.delete(key)
      reject(new Error(`CDP timeout: ${method}`))
    }, 30000)
    pending.set(key, { resolve, reject, timer })
    ws.send(JSON.stringify({ id: key, method, params }))
  })
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails))
  return r.result.value
}
const wait = async (expression) => {
  const start = Date.now()
  while (Date.now() - start < 120000) {
    if (await ev(expression)) return
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`Timeout: ${expression}`)
}
const check = async (expression, label) => {
  if (!(await ev(expression))) throw new Error(label)
  passes.push(label)
  console.log('PASS', label)
}
const click = (text) =>
  ev(
    `(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!b||b.disabled)throw Error('Unavailable button '+${JSON.stringify(text)});b.click()})()`,
  )
const code = async (text) => {
  await ev(`document.querySelector('.cm-content').focus()`)
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
  })
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
  })
  await send('Input.insertText', { text })
}
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', {
    captureBeyondViewport: true,
  })
  await fs.writeFile(
    path.join(out, `${name}.png`),
    Buffer.from(r.data, 'base64'),
  )
}
try {
  await send('Runtime.enable')
  await send('Page.enable')
  await send('Network.enable')
  for (const motion of ['reduce', 'no-preference']) {
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: motion }],
    })
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await send('Page.navigate', { url: base })
    await wait(`!!document.querySelector('#trial-stack-guide')`)
    await ev(`localStorage.removeItem('algonavigator.stack-ruins.progress')`)
    requests.length = 0
    await send('Page.reload')
    await wait(`!!document.querySelector('#trial-stack-guide')`)
    await new Promise((r) => setTimeout(r, 400))
    await check(
      `!${JSON.stringify(requests.some((u) => /node-|badge-stack|fx-sparkle/.test(u)))}`,
      `${motion}: no premature room-three or reward requests`,
    )
    for (let i = 0; i < 7; i++) {
      await click('Step forward')
      await new Promise((r) => setTimeout(r, 80))
    }
    await wait(`document.body.innerText.includes('Secret discovered')`)
    await click('Continue to Stairway Repair →')
    const loadStart = Date.now()
    await wait(
      `[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Run'&&!b.disabled)`,
    )
    passes.push(
      `${motion}: Python ready in ${Date.now() - loadStart} ms (existing browser cache, not cold-load benchmark)`,
    )
    if (motion === 'reduce') {
      await code('while True:\n    pass\n')
      await click('Run')
      await wait(`!!document.querySelector('[role="alert"]')`)
      await check(
        `document.querySelector('.cm-content').innerText.includes('while True')`,
        'Timeout preserves edited code',
      )
      await wait(
        `[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Run'&&!b.disabled)`,
      )
    }
    await code(
      "stack = MyStack()\nstack.push(1, 'base')\nstack.push(2, 'moon')\nstack.push(3, 'star')\n",
    )
    await click('Run')
    await wait(`document.body.innerText.includes('Stairway repaired!')`)
    passes.push(
      `${motion}: real Python completion${motion === 'reduce' ? ' after timeout without refresh' : ''}`,
    )
    await click('Continue to Forked Path →')
    await wait(`!!document.querySelector('.forked-map')`)
    await check(
      `[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Backtrack (pop)').disabled`,
      `${motion}: entrance protected`,
    )
    // Read rendered topology, not private React state. Edges and node positions are DOM.
    const graph = await ev(
      `(()=>{const ns=[...document.querySelectorAll('[data-room-node]')].map(n=>({id:n.dataset.roomNode,label:n.getAttribute('aria-label'),xy:n.getAttribute('transform').match(/[-\\d.]+/g).map(Number)}));const g={};for(const n of ns)g[n.id]={label:n.label,edges:[]};for(const l of document.querySelectorAll('[data-path-edge]')){const a=ns.find(n=>n.xy[0]===+l.getAttribute('x1')&&n.xy[1]===+l.getAttribute('y1'));const b=ns.find(n=>n.xy[0]===+l.getAttribute('x2')&&n.xy[1]===+l.getAttribute('y2'));g[a.id].edges.push(b.id);g[b.id].edges.push(a.id)}return g})()`,
    )
    const entrance = Object.keys(graph).find((k) =>
      graph[k].label.startsWith('Entrance'),
    )
    const exit = Object.keys(graph).find((k) =>
      graph[k].label.startsWith('Exit'),
    )
    const route = (from, target, parent) => {
      if (from === target) return []
      for (const next of graph[from].edges.filter((n) => n !== parent)) {
        const rest = route(next, target, from)
        if (rest) return [next, ...rest]
      }
      return null
    }
    const move = async (target) => {
      await wait(
        `document.querySelector('[data-room-node="${target}"]').getAttribute('aria-disabled')==='false'`,
      )
      await ev(`document.querySelector('[data-room-node="${target}"]').focus()`)
      await send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        key: 'Enter',
        code: 'Enter',
        windowsVirtualKeyCode: 13,
      })
      await send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key: 'Enter',
        code: 'Enter',
        windowsVirtualKeyCode: 13,
      })
      await wait(
        `document.querySelector('[data-room-node="${target}"]').getAttribute('aria-label').includes(', current')`,
      )
      await new Promise((r) => setTimeout(r, 500))
    }
    const dead = Object.keys(graph).find((k) =>
      graph[k].label.startsWith('Dead end'),
    )
    const deadRoute = route(entrance, dead)
    for (const n of deadRoute) await move(n)
    await click('Backtrack (pop)')
    await new Promise((r) => setTimeout(r, 500))
    await move(dead)
    await check(
      `document.querySelector('[data-room-node="${dead}"]').getAttribute('aria-label').includes('explored')`,
      `${motion}: dead end, pop, keyboard revisit`,
    )
    for (let i = 0; i < deadRoute.length; i++) {
      await click('Backtrack (pop)')
      await new Promise((r) => setTimeout(r, 500))
    }
    for (const n of route(entrance, exit)) await move(n)
    await wait(`document.body.innerText.includes('Stack Ruins complete!')`)
    await check(
      `[...document.querySelectorAll('[data-room-node]')].every(n=>n.getAttribute('aria-disabled')==='true')`,
      `${motion}: exit freezes navigation`,
    )
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await check(
      `document.documentElement.scrollWidth<=390`,
      `${motion}: 390px no horizontal overflow`,
    )
    await shot(`complete-${motion}`)
    await click('Replay with a new maze')
    await check(
      `!document.body.innerText.includes('Stack Ruins complete!')`,
      `${motion}: replay resets maze`,
    )
    await send('Page.reload')
    await wait(`!!document.querySelector('#trial-stack-guide')`)
    await check(
      `[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='03 · Forked Path')`,
      `${motion}: reload starts Trial with room three unlocked`,
    )
  }
  if (errors.length)
    throw new Error(`${errors.length} browser runtime exceptions`)
} finally {
  await fs.writeFile(
    path.join(out, 'results.json'),
    JSON.stringify(
      {
        base,
        browser: await (
          await fetch(
            (process.env.CDP_URL ?? 'http://127.0.0.1:9222/json/list').replace(
              '/json/list',
              '/json/version',
            ),
          )
        ).json(),
        passes,
        errors,
        requests,
        limitations: [
          'No Firefox/Edge separate run or school hardware claim',
          'Art composite quality and state anchor alignment not visually approved',
          'No controlled Worker crash injection in this script',
        ],
      },
      null,
      2,
    ),
  )
  ws.close()
  console.log('Evidence:', out)
}

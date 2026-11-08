// Source-preserving export using the existing local Chrome CDP endpoint.
// No background removal, guessed crops, source writes, downloads or dependencies.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const groups = [
  [['stone-door-closed', 'stone-door-open'], 768, 1024],
  [
    [
      'switch-inactive',
      'switch-active',
      'node-entrance',
      'node-hall',
      'node-corridor',
      'node-dead-end',
      'node-exit',
      'quest-scroll',
    ],
    256,
    256,
  ],
  [
    [
      'block-base',
      'block-moon',
      'block-sun',
      'block-star',
      'block-cracked',
      'fx-dust',
    ],
    512,
    256,
  ],
  [
    [
      'sprite-idle',
      'sprite-guide',
      'sprite-thinking',
      'sprite-happy',
      'badge-stack-apprentice',
      'magic-code-book',
      'fx-magic-glow',
    ],
    512,
    512,
  ],
  [['magic-stairs'], 1024, 768],
  [['fx-sparkle'], 128, 128],
]
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
const pending = new Map()
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id) {
    const p = pending.get(m.id)
    if (!p) return
    pending.delete(m.id)
    clearTimeout(p.timer)
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result)
  }
}
const send = (method, params) =>
  new Promise((resolve, reject) => {
    const key = ++id
    const timer = setTimeout(() => {
      pending.delete(key)
      reject(new Error('CDP timeout'))
    }, 30000)
    pending.set(key, { resolve, reject, timer })
    ws.send(JSON.stringify({ id: key, method, params }))
  })
const manifest = []
try {
  for (const [names, width, height] of groups)
    for (const name of names) {
      // Prefer the original cracked filename; the alternate is retained untouched.
      const source = name === 'node-hall' ? 'node-hall (1).png' : `${name}.png`
      const bytes = await fs.readFile(path.join(root, 'picture', source))
      const format = bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        ? 'png'
        : bytes[0] === 255 && bytes[1] === 216
          ? 'jpeg'
          : null
      if (!format) throw new Error(`Unsupported actual format: ${source}`)
      const expression = `(async()=>{const image=new Image();image.src=${JSON.stringify(`data:image/${format};base64,${bytes.toString('base64')}`)};await image.decode();const c=document.createElement('canvas');c.width=${width};c.height=${height};const ctx=c.getContext('2d');const scale=Math.min(c.width/image.width,c.height/image.height);ctx.drawImage(image,(c.width-image.width*scale)/2,(c.height-image.height*scale)/2,image.width*scale,image.height*scale);const data=ctx.getImageData(0,0,c.width,c.height).data;let transparent=0;for(let i=3;i<data.length;i+=4)if(data[i]<255)transparent++;return {sourceWidth:image.width,sourceHeight:image.height,transparentPixels:transparent,png:c.toDataURL('image/png').split(',')[1]}})()`
      const result = await send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      })
      if (result.exceptionDetails)
        throw new Error(JSON.stringify(result.exceptionDetails))
      const { png, ...metadata } = result.result.value
      await fs.writeFile(
        path.join(root, 'public', 'assets', `${name}.png`),
        Buffer.from(png, 'base64'),
      )
      manifest.push({
        source,
        actualFormat: format,
        output: `${name}.png`,
        width,
        height,
        ...metadata,
      })
    }
  await fs.writeFile(
    path.join(root, 'public', 'assets', 'export-manifest.json'),
    JSON.stringify(
      {
        policy:
          'Full source contain-fit; no crop or background removal. Alpha count is not a visual quality approval. Deleted backgrounds not restored.',
        assets: manifest,
      },
      null,
      2,
    ) + '\n',
  )
  console.log(`Exported ${manifest.length} PNGs; source files untouched.`)
} finally {
  ws.close()
}

// Losslessly recompress exported PNGs. Source art and PNG filter bytes stay intact.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync, inflateSync } from 'node:zlib'
import { createHash } from 'node:crypto'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const directory = path.join(root, 'public', 'assets')
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunks(bytes) {
  if (!bytes.subarray(0, 8).equals(signature)) throw new Error('Invalid PNG')
  const result = []
  let offset = 8
  while (offset < bytes.length) {
    const size = bytes.readUInt32BE(offset)
    const end = offset + size + 12
    if (end > bytes.length) throw new Error('Truncated PNG chunk')
    const chunk = bytes.subarray(offset, end)
    if (crc32(chunk.subarray(4, -4)) !== chunk.readUInt32BE(chunk.length - 4))
      throw new Error('Invalid PNG CRC')
    result.push({ type: chunk.toString('ascii', 4, 8), bytes: chunk })
    offset = end
  }
  if (result.at(-1)?.type !== 'IEND') throw new Error('Missing PNG end')
  return result
}

function imageData(parts) {
  return inflateSync(
    Buffer.concat(
      parts
        .filter(({ type }) => type === 'IDAT')
        .map(({ bytes }) => bytes.subarray(8, -4)),
    ),
  )
}

const assets = []
// Prepare and verify every export before writing any of them.
for (const name of (await fs.readdir(directory))
  .filter((name) => name.endsWith('.png'))
  .sort()) {
  const original = await fs.readFile(path.join(directory, name))
  const parts = chunks(original)
  const data = imageData(parts)
  const compressed = deflateSync(data, { level: 9 })
  const idat = Buffer.alloc(compressed.length + 12)
  idat.writeUInt32BE(compressed.length)
  idat.write('IDAT', 4)
  compressed.copy(idat, 8)
  idat.writeUInt32BE(crc32(idat.subarray(4, -4)), idat.length - 4)
  let inserted = false
  const output = Buffer.concat([
    signature,
    ...parts.flatMap(({ type, bytes }) => {
      if (type !== 'IDAT') return [bytes]
      if (inserted) return []
      inserted = true
      return [idat]
    }),
  ])
  if (!imageData(chunks(output)).equals(data))
    throw new Error(`Image data changed: ${name}`)
  const selected = output.length < original.length ? output : original
  assets.push({ name, original, selected, imageDataSha256: hash(data) })
}

for (const { name, original, selected } of assets) {
  if (selected !== original)
    await fs.writeFile(path.join(directory, name), selected)
}
const report = {
  policy:
    'Lossless IDAT recompression; identical decompressed filter/pixel bytes; all non-IDAT chunks preserved. Source art untouched.',
  beforeBytes: assets.reduce((sum, asset) => sum + asset.original.length, 0),
  afterBytes: assets.reduce((sum, asset) => sum + asset.selected.length, 0),
  assets: assets.map(({ name, original, selected, imageDataSha256 }) => ({
    name,
    beforeBytes: original.length,
    afterBytes: selected.length,
    imageDataSha256,
    outputSha256: hash(selected),
  })),
}
await fs.mkdir(path.join(root, 'artifacts'), { recursive: true })
await fs.writeFile(
  path.join(root, 'artifacts', 'asset-optimization.json'),
  JSON.stringify(report, null, 2) + '\n',
)
console.log(
  JSON.stringify({
    beforeBytes: report.beforeBytes,
    afterBytes: report.afterBytes,
    savedBytes: report.beforeBytes - report.afterBytes,
  }),
)

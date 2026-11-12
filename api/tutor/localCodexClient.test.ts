// @vitest-environment node
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import path from 'node:path'
import { askLocalCodex } from './localCodexClient.js'

vi.mock('node:child_process', () => ({ spawn: vi.fn() }))

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

function fakeProcess(code = 0) {
  const child = Object.assign(new EventEmitter(), {
    stdin: new PassThrough(),
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    kill: vi.fn(),
  })
  let prompt = ''
  child.stdin.setEncoding('utf8')
  child.stdin.on('data', (text) => {
    prompt += text
  })
  child.stdin.on('finish', () => {
    child.stdout.write(
      JSON.stringify({
        type: 'item.completed',
        item: { type: 'agent_message', text: '先看看栈顶是哪块石头？' },
      }) + '\n',
    )
    child.emit('close', code)
  })
  vi.mocked(spawn).mockReturnValue(child as unknown as ReturnType<typeof spawn>)
  return { child, prompt: () => prompt }
}

describe('local Codex tutor', () => {
  it('passes the canonical Codex directory when the desktop environment omits it, preserving explicit overrides', async () => {
    vi.stubEnv('CODEX_HOME', '')
    fakeProcess()
    await askLocalCodex({
      system: 'Tutor',
      userContent: 'Why do array items move?',
    })
    expect(vi.mocked(spawn).mock.calls.at(-1)![2]!.env!.CODEX_HOME).toBe(
      path.join(homedir(), '.codex'),
    )
    vi.stubEnv('CODEX_HOME', 'D:\\explicit-codex-profile')
    fakeProcess()
    await askLocalCodex({
      system: 'Tutor',
      userContent: 'Why do array items move?',
    })
    expect(vi.mocked(spawn).mock.calls.at(-1)![2]!.env!.CODEX_HOME).toBe(
      'D:\\explicit-codex-profile',
    )
  })
  it('uses stdin for untrusted questions, disables sensitive tools and returns only final text', async () => {
    const process = fakeProcess()
    const question = '$(do-not-execute) 中文'
    expect(
      await askLocalCodex({
        system: 'Tutor instructions',
        userContent: question,
      }),
    ).toBe('先看看栈顶是哪块石头？')
    const [, args, options] = vi.mocked(spawn).mock.calls[0]
    expect(args).toContain('--ignore-user-config')
    expect(args).toContain('read-only')
    expect(args).toContain('respect_system_proxy')
    expect(args).not.toContain(question)
    expect(options).toMatchObject({ shell: false, windowsHide: true })
    expect(process.prompt()).toContain(question)
  })
  it('rejects failed CLI runs rather than presenting partial output as an answer', async () => {
    fakeProcess(1)
    await expect(
      askLocalCodex({ system: 'Tutor', userContent: 'pop?' }),
    ).rejects.toThrow('Local Codex exited (1)')
  })
})

import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { AskModelInput } from './handler.js'

/** Local development only. Uses the installed CLI's login, never reads auth files. */
export async function askLocalCodex({
  system,
  userContent,
}: AskModelInput): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'algonav-tutor-'))
  const relative = path.relative(
    path.resolve(tmpdir()),
    path.resolve(directory),
  )
  if (!relative.startsWith('algonav-tutor-') || relative.includes(path.sep)) {
    throw new Error('Unexpected tutor temporary directory')
  }
  try {
    return await new Promise<string>((resolve, reject) => {
      const args = [
        'exec',
        '--ignore-user-config',
        '--ignore-rules',
        '--ephemeral',
        '--skip-git-repo-check',
        '--sandbox',
        'read-only',
        '--color',
        'never',
        '--json',
        '--enable',
        'respect_system_proxy',
        '-C',
        directory,
        '-c',
        'approval_policy="never"',
        '-c',
        'web_search="disabled"',
        '-c',
        'project_doc_max_bytes=0',
        '-c',
        'model_reasoning_effort="low"',
        ...[
          'shell_tool',
          'unified_exec',
          'apps',
          'browser_use',
          'computer_use',
          'multi_agent',
          'remote_plugin',
          'skill_search',
        ].flatMap((feature) => ['--disable', feature]),
        '-',
      ]
      const child = spawn(process.env.ALGONAV_CODEX_PATH ?? 'codex', args, {
        cwd: directory,
        shell: false,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      let output = ''
      let size = 0
      child.stdout.setEncoding('utf8')
      const timer = setTimeout(() => {
        child.kill()
        reject(new Error('Local Codex tutor timed out'))
      }, 55_000)
      child.on('error', (error) => {
        clearTimeout(timer)
        reject(error)
      })
      child.stdout.on('data', (text: string) => {
        size += Buffer.byteLength(text)
        if (size > 256_000) {
          child.kill()
          reject(new Error('Local Codex response exceeded limit'))
          return
        }
        output += text
      })
      // CLI diagnostics can contain local paths. Do not forward them to students.
      child.stderr.resume()
      child.stdin.on('error', () => {})
      child.stdin.end(
        `${system}\n\nAnswer only from the supplied lesson data. Do not use tools or inspect files.\n\n${userContent}`,
      )
      child.on('close', (code) => {
        clearTimeout(timer)
        if (code !== 0)
          return reject(
            new Error(`Local Codex exited (${code}); check codex login status`),
          )
        try {
          const events = output
            .trim()
            .split('\n')
            .map((line) => JSON.parse(line))
          const replies = events.filter(
            (event) =>
              event.type === 'item.completed' &&
              event.item?.type === 'agent_message',
          )
          const reply = replies.at(-1)?.item.text
          if (typeof reply !== 'string' || !reply.trim())
            throw new Error('Local Codex returned no answer')
          resolve(reply)
        } catch (error) {
          reject(error)
        }
      })
    })
  } finally {
    // Only this fresh OS temp directory is removed; no user-provided path.
    await rm(directory, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    }).catch(() => {
      console.warn(
        '[tutor] Temporary directory cleanup deferred because it is still in use.',
      )
    })
  }
}

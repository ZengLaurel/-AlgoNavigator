import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import { python } from '@codemirror/lang-python'
import { useEffect, useRef, useState } from 'react'
import { usePyodide } from '../engine/pyodide/pyodideContext'
import type { ExecResult } from '../engine/pyodide/types'

interface CodeEditorPanelProps {
  starterCode: string
  onResult: (result: ExecResult) => void
}

export function CodeEditorPanel({
  starterCode,
  onResult,
}: CodeEditorPanelProps) {
  const editorParentRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [code, setCode] = useState(starterCode)
  const { status, run } = usePyodide()

  useEffect(() => {
    if (!editorParentRef.current) return
    const state = EditorState.create({
      doc: starterCode,
      extensions: [
        basicSetup,
        keymap.of([...defaultKeymap, indentWithTab]),
        python(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) setCode(update.state.doc.toString())
        }),
      ],
    })
    const view = new EditorView({
      state,
      parent: editorParentRef.current,
    })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [starterCode])

  const reset = () => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: starterCode },
    })
    setCode(starterCode)
  }

  const execute = async () => {
    onResult(await run(code))
  }

  const statusMessage = {
    idle: 'Ready when you are.',
    loading: 'Loading Python…',
    ready: 'Python is ready.',
    running: 'Running your code…',
    error: 'Python needs a reset. Run again to restart it.',
  }[status]

  return (
    <section aria-labelledby="code-editor-heading">
      <h2 id="code-editor-heading">Try it with Python</h2>
      <div
        className="code-editor"
        ref={editorParentRef}
        aria-label="Python code editor"
      />
      <p aria-live="polite">{statusMessage}</p>
      <button type="button" onClick={execute} disabled={status === 'running'}>
        Run
      </button>
      <button type="button" onClick={reset} disabled={status === 'running'}>
        Reset
      </button>
    </section>
  )
}

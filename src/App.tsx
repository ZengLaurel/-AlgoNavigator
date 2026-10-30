import { useState } from 'react'
import { AnimationStage } from './components/AnimationStage'
import { CodeEditorPanel } from './components/CodeEditorPanel'
import { StackRenderer } from './components/StackRenderer'
import { stackAnimationSteps } from './content/stackAnimationSteps'
import { stackExercise } from './content/stackExercise'
import { PyodideProvider } from './engine/pyodide/PyodideProvider'
import type { ExecResult } from './engine/pyodide/types'

function AppContent() {
  const [result, setResult] = useState<ExecResult | null>(null)
  const liveState = result?.finalState ?? { elements: [] }
  const output = result?.stdout.trim()

  return (
    <main>
      <header className="lesson-header">
        <p className="eyebrow">Learn by seeing and doing</p>
        <h1>AlgoNavigator</h1>
        <p>Explore stacks, then try the same idea with real Python.</p>
      </header>

      <section
        className="lesson-card animation-card"
        aria-labelledby="scripted-stack-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Step 1 · Watch</p>
            <h2 id="scripted-stack-heading">How a stack works</h2>
          </div>
          <span className="section-badge">Demo</span>
        </div>
        <AnimationStage
          steps={stackAnimationSteps}
          render={(state, maxSlotCount) => (
            <StackRenderer state={state} slotCount={maxSlotCount} />
          )}
        />
      </section>

      <section className="lesson-card code-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Step 2 · Try</p>
            <h2>Write Python</h2>
          </div>
          <span className="section-badge">Your turn</span>
        </div>
        <CodeEditorPanel
          starterCode={stackExercise.starterCode}
          onResult={setResult}
        />
      </section>

      <section
        className="lesson-card live-result-card"
        aria-labelledby="live-stack-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Step 3 · See the result</p>
            <h2 id="live-stack-heading">Your stack</h2>
          </div>
          <span className="section-badge">Live result</span>
        </div>
        <p className="helper-text">
          This picture updates when your Python code runs.
        </p>
        <StackRenderer state={liveState} slotCount={3} />

        {output && (
          <div className="program-output" aria-label="Program output">
            <p className="output-label">Program output</p>
            <p>Your program peeked at the top item:</p>
            <pre className="output-value">{output}</pre>
          </div>
        )}
        {result?.error && (
          <p className="error-message" role="alert">
            {result.error}
          </p>
        )}
      </section>
    </main>
  )
}

function App() {
  return (
    <PyodideProvider>
      <AppContent />
    </PyodideProvider>
  )
}

export default App

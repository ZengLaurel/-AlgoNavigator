import { AnimationStage } from './components/AnimationStage'
import { StackRenderer } from './components/StackRenderer'
import { stackAnimationSteps } from './content/stackAnimationSteps'

function App() {
  return (
    <main>
      <h1>AlgoNavigator</h1>
      <h2>Stack</h2>
      <AnimationStage
        steps={stackAnimationSteps}
        render={(state, maxSlotCount) => (
          <StackRenderer state={state} slotCount={maxSlotCount} />
        )}
      />
    </main>
  )
}

export default App

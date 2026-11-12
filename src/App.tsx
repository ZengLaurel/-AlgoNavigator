import { useCallback, useEffect, useState } from 'react'
import { AdventureMap } from './components/AdventureMap'
import { GameStage } from './components/game/GameStage'
import { lazy, Suspense } from 'react'
import { createProgressStore } from './engine/modules/progress'
import { ModuleProgressContext } from './engine/modules/progressContext'
import './adventure-map.css'
const ArrayGame = lazy(() =>
  import('./components/game/ArrayGame').then((page) => ({
    default: page.ArrayGame,
  })),
)

const LinkedGame = lazy(() =>
  import('./components/game/LinkedGame').then((page) => ({
    default: page.LinkedGame,
  })),
)

const QueueGame = lazy(() =>
  import('./components/game/QueueGame').then((page) => ({
    default: page.QueueGame,
  })),
)

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash)
  const [progressStore] = useState(() => createProgressStore())
  const [progress, setProgress] = useState(() => progressStore.read())
  const [storageFailed, setStorageFailed] = useState(
    () => !progressStore.available(),
  )

  useEffect(
    () =>
      progressStore.subscribe(() => {
        setProgress(progressStore.read())
        setStorageFailed(!progressStore.available())
      }),
    [progressStore],
  )

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash)
    const handleStorage = () => setProgress(progressStore.read())
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [progressStore])

  const inStack = route === '#/stack'
  const inArray = route === '#/array'
  const inLinked = route === '#/linked-list'
  const inQueue = route === '#/queue'
  const handleComplete = useCallback(() => {
    setStorageFailed(!progressStore.complete('stack'))
    setProgress(progressStore.read())
  }, [progressStore])

  useEffect(() => {
    document.title = inStack
      ? 'Stack Ruins · Stack | AlgoNavigator'
      : inArray
        ? 'Supply Camp · Array | AlgoNavigator'
        : inLinked
          ? 'Misty Forest · Linked List | AlgoNavigator'
          : inQueue
            ? 'Harbor Pier · Queue | AlgoNavigator'
            : 'World Adventure Map | AlgoNavigator'
    document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
  }, [inStack, inArray, inLinked, inQueue])

  return (
    <ModuleProgressContext.Provider value={progressStore}>
      {inStack ? (
        <>
          <nav className="lesson-map-nav" aria-label="Map navigation">
            <a href="#/">← Back to the adventure map</a>
            <span>Stack Ruins / Stack</span>
          </nav>
          <GameStage onComplete={handleComplete} />
        </>
      ) : inArray ? (
        <Suspense fallback={<p role="status">Loading Supply Camp…</p>}>
          <ArrayGame />
        </Suspense>
      ) : inLinked ? (
        <Suspense fallback={<p role="status">Loading Misty Forest…</p>}>
          <LinkedGame />
        </Suspense>
      ) : inQueue ? (
        <Suspense fallback={<p role="status">Loading Harbor Pier…</p>}>
          <QueueGame />
        </Suspense>
      ) : (
        <AdventureMap
          stackCompleted={progress.modules.stack.completed}
          completedModules={
            Object.values(progress.modules).filter((module) => module.completed)
              .length
          }
        />
      )}
      {storageFailed && (
        <p className="map-storage-warning" role="alert">
          This browser cannot save your progress. Progress stays available this
          session, but may be lost after a refresh. Please check your browser
          storage permissions.
        </p>
      )}
    </ModuleProgressContext.Provider>
  )
}

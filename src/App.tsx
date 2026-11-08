import { useCallback, useEffect, useState } from 'react'
import { AdventureMap } from './components/AdventureMap'
import { GameStage } from './components/game/GameStage'
import { readStackCompleted, saveStackCompleted } from './adventureProgress'
import './adventure-map.css'

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash)
  const [stackCompleted, setStackCompleted] = useState(readStackCompleted)
  const [storageFailed, setStorageFailed] = useState(false)

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash)
    const handleStorage = () => setStackCompleted(readStackCompleted())
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const inStack = route === '#/stack'
  const handleComplete = useCallback(() => {
    setStackCompleted(true)
    setStorageFailed(!saveStackCompleted())
  }, [])

  useEffect(() => {
    document.title = inStack
      ? 'Stack Ruins · Stack | AlgoNavigator'
      : 'World Adventure Map | AlgoNavigator'
    document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
  }, [inStack])

  return (
    <>
      {inStack ? (
        <>
          <nav className="lesson-map-nav" aria-label="Map navigation">
            <a href="#/">← Back to the adventure map</a>
            <span>Stack Ruins / Stack</span>
          </nav>
          <GameStage onComplete={handleComplete} />
        </>
      ) : (
        <AdventureMap stackCompleted={stackCompleted} />
      )}
      {storageFailed && (
        <p className="map-storage-warning" role="alert">
          This browser cannot save your progress. Your gem is earned for this
          session, but may be lost after a refresh. Please check your browser
          storage permissions.
        </p>
      )}
    </>
  )
}

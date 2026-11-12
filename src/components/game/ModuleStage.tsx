import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useModuleProgressStore } from '../../engine/modules/progressContext'
import { moduleCatalog, moduleKnowledge } from '../../content/modules/catalog'
import type { NewModuleId } from '../../engine/modules/structures'

/** Shared shell for upcoming modules. Registration does not publish a region. */
export function ModuleStage(props: Parameters<typeof ModuleStageContent>[0]) {
  return <ModuleStageContent key={props.moduleId} {...props} />
}
function ModuleStageContent({
  moduleId,
  renderRoom,
  tutor,
}: {
  moduleId: NewModuleId
  renderRoom: (
    room: 1 | 2 | 3 | 4,
    actions: {
      advance: () => void
      complete: () => void
      master: (exerciseId: string) => void
    },
  ) => ReactNode
  tutor: ReactNode
}) {
  const store = useModuleProgressStore()
  const [progress, setProgress] = useState(() => store.read().modules[moduleId])
  const [storageFailed, setStorageFailed] = useState(false)
  const [room, setRoom] = useState<1 | 2 | 3 | 4>(1)
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const heading = root.current?.querySelector<HTMLElement>(
      room === 1 ? 'h1' : '[data-room] h2',
    )
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }, [room])
  return (
    <main className="game-root" ref={root}>
      <a href="#/">Back to the adventure map</a>
      <h1 tabIndex={-1}>{moduleCatalog[moduleId].title}</h1>
      <nav aria-label="Learning stages">
        {(['Observe', 'Python', 'Apply', 'Teach Xiao Tuo'] as const).map(
          (label, index) => {
            const target = (index + 1) as 1 | 2 | 3 | 4
            return (
              <button
                key={label}
                disabled={
                  target === 4
                    ? !progress.teachingUnlocked
                    : target > progress.unlockedThrough
                }
                aria-current={room === target ? 'step' : undefined}
                onClick={() => setRoom(target)}
              >
                {target} · {label}
              </button>
            )
          },
        )}
      </nav>
      {storageFailed && (
        <p role="alert">
          Progress is available this session, but cannot be saved in this
          browser.
        </p>
      )}
      <section data-room key={`${moduleId}-${room}`}>
        {renderRoom(room, {
          advance: () => {
            if (room >= 3) return
            const target = (room + 1) as 2 | 3
            setStorageFailed(
              !store.update(moduleId, { unlockedThrough: target }),
            )
            setProgress(store.read().modules[moduleId])
            setRoom(target)
          },
          complete: () => {
            if (room !== 3) return
            setStorageFailed(!store.complete(moduleId))
            setProgress(store.read().modules[moduleId])
          },
          master: (exerciseId) => {
            if (room !== 4) return
            setStorageFailed(!store.master(moduleId, exerciseId))
            setProgress(store.read().modules[moduleId])
          },
        })}
      </section>
      <section aria-label="Tutor">{tutor}</section>
      <details>
        <summary>Knowledge handbook</summary>
        {moduleKnowledge[moduleId].map((topic) => (
          <section id={`${moduleId}-${topic.id}`} key={topic.id}>
            <h2>{topic.title}</h2>
            {topic.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </section>
        ))}
      </details>
    </main>
  )
}

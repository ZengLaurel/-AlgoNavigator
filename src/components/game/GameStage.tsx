import { TrialOfStonesRoom } from './TrialOfStonesRoom'

export function GameStage() {
  return (
    <main className="game-root">
      <header className="game-header">
        <p className="game-kicker">
          AlgoNavigator · A data structure adventure
        </p>
        <h1>Stack Ruins</h1>
        <p>Discover the secret of the stones, one step at a time.</p>
      </header>
      <nav className="room-trail" aria-label="Adventure rooms">
        <span aria-current="step">01 · Trial of Stones</span>
        <span>02 · Stairway Repair · Coming next</span>
        <span>03 · Forked Path · Coming later</span>
      </nav>
      <TrialOfStonesRoom />
      <p className="game-art-note">
        Prototype artwork · Final stone and guide images will replace these
        placeholders. No AI connection or Python installation is needed in this
        room.
      </p>
    </main>
  )
}

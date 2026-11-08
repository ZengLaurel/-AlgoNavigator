import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onReturnToTrial: () => void
}

/** Keyed by room in GameStage: changing rooms clears the error, not progress.
 * Rejected lazy imports stay rejected until a real page reload. */
export class RoomLoadBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <section role="alert" aria-labelledby="room-load-error-heading">
          <h2 id="room-load-error-heading">This room could not open</h2>
          <p>
            Check your connection. You can return to Trial of Stones or reload
            the page to try loading this room again.
          </p>
          <p>
            Reloading keeps your saved room unlocks, but loses unsaved code and
            your current room activity.
          </p>
          <button type="button" onClick={this.props.onReturnToTrial}>
            Return to Trial of Stones
          </button>
          <button type="button" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </section>
      )
    }
    return this.props.children
  }
}

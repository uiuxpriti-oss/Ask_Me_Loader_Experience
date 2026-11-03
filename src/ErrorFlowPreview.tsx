import { useEffect, useState } from "react"
import ErrorFlow from "./ErrorFlow"
import { assetUrl } from "./assets"

const errorDuration = 12.6

export default function ErrorFlowPreview({ onClose }: { onClose: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [runKey, setRunKey] = useState(0)
  const [loaderOpen, setLoaderOpen] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    const start = performance.now()
    const timer = window.setInterval(() => {
      setElapsed(Math.min((performance.now() - start) / 1000, errorDuration))
    }, 100)

    return () => window.clearInterval(timer)
  }, [runKey])

  function restart() {
    setElapsed(0)
    setLoaderOpen(false)
    setRunKey((value) => value + 1)
  }

  return (
    <section
      className="error-preview"
      role="dialog"
      aria-modal="true"
      aria-label="Error flow prototype"
    >
      <div className="error-preview__background" aria-hidden="true">
        <img
          src={assetUrl("assets/chat-background/aacac.svg")}
          alt=""
          width="1387"
          height="358"
        />
      </div>

      <header className="error-preview__header">
        <div>
          <strong>Error flow prototype</strong>
          <span>Independent preview layer</span>
        </div>
        <button
          type="button"
          className="flow-preview__close"
          aria-label="Close error flow"
          onClick={onClose}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m4.5 4.5 9 9m0-9-9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <main className="error-preview__content">
        <div className="error-preview__question">
          <p>What are the different loan types and their counts?</p>
          <span>
            <strong>sample_banking_data 1.xlsx</strong>
            <code>XLSX</code>
          </span>
        </div>

        <ErrorFlow
          elapsed={elapsed}
          loaderOpen={loaderOpen}
          onLoaderToggle={() => setLoaderOpen((value) => !value)}
          onRetry={restart}
        />
      </main>
    </section>
  )
}

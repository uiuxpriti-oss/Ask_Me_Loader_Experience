import { type FormEvent, useEffect, useState } from "react"
import ErrorFlow from "./ErrorFlow"
import ErrorFlowPreview from "./ErrorFlowPreview"
import Sidebar from "./Sidebar"
import { Button, CheckIcon, Chevron, LoaderGlyph } from "./LoaderPrimitives"
import { assetUrl } from "./assets"

type RunMode = "standard" | "error"

type AgentStep = {
  name: string
  sub: string
  input: string
  output: string
  depth?: number
  total?: number
  card?: {
    label: string
    lang: string
    lines: string
    code: string
  }
}

type Phase = {
  active: string
  done: string
  duration: number
  description: string
  agents: AgentStep[]
}

const phases: Phase[] = [
  {
    active: "Understanding your request",
    done: "Understood your request",
    duration: 3.4,
    description:
      "Reading the question against sample_banking_data 1.xlsx: this is a grouped count over loan types, so one GROUP BY answers it. Resolving the Banking schema before querying.",
    agents: [
      {
        name: "Agent: Data Query Agent",
        sub: "Understanding data questions",
        input: "What are the different loan types and their counts?",
        output:
          "The analysis of loan types shows that the most common type is Home loans, with 38 applications, followed by Personal loans with 32 applications, and Auto loans with 30 applications. This distribution indicates a strong preference for home financing among applicants in this dataset.",
      },
      {
        name: "Schema Resolver",
        sub: "Resolving the dataset schema",
        depth: 1,
        input: "sample_banking_data 1.xlsx",
        output: 'schema (Banking) · 1 sheet · "LOAN TYPE", "COUNT" available',
      },
    ],
  },
  {
    active: "Running data queries",
    done: "Ran data queries",
    duration: 6,
    description:
      "Running the grouped count against the banking dataset and reading back the distribution — 3 rows, 100 applications in total, with per-column statistics for the spread.",
    agents: [
      {
        name: "Tool: Query Executor",
        sub: "Running SQL queries",
        total: 1,
        input:
          'sql_query = SELECT "LOAN TYPE", COUNT(*) AS "COUNT" FROM lumenore_data GROUP BY "LOAN TYPE" ORDER BY "COUNT" DESC;\nschema_name = sample_banking_data 1.xlsx-2026-08-04 11:37:52.074664-schema (Banking)',
        output:
          "Result generated successfully. (3 rows returned) · 3 rows × 2 columns · sum=100.00, mean=33.33, std=4.16",
        card: {
          label: "Executed code",
          lang: "sql",
          lines: "4 lines",
          code: 'SELECT "LOAN TYPE", COUNT(*) AS "COUNT"\nFROM lumenore_data\nGROUP BY "LOAN TYPE"\nORDER BY "COUNT" DESC;',
        },
      },
    ],
  },
  {
    active: "Charting the distribution",
    done: "Charted the distribution",
    duration: 5.4,
    description:
      "Three categories of a fixed total read best as a donut, so the visualization agent hands the fetched result to the chart tool rather than re-querying.",
    agents: [
      {
        name: "Agent: Visualization",
        sub: "Choosing how to show the result",
        input:
          "Chart the distribution of loan types based on the following data: Home loans with 38 applications, Personal loans with 32 applications, and Auto loans with 30 applications.\nUPSTREAM DATA REFS (this task's already-fetched data): pass this uuid as source_ref",
        output: "<CHART>89089c17-f3a9-4663-b27b-dd92f650be81</CHART>",
      },
      {
        name: "Tool: Create Chart",
        sub: "Rendering the chart",
        depth: 1,
        total: 1,
        input:
          "query = Chart the distribution of loan types…\nsource_ref = e05caaff-bfa0-460a-9ac9-94993cec15e7",
        output:
          'Result: {"chart_type": "Donut", "title": "Count of Loans by Loan Type"}',
        card: {
          label: "Executed code",
          lang: "json",
          lines: "2 lines",
          code: 'query = "Chart the distribution of loan types: Home 38, Personal 32, Auto 30"\nsource_ref = "e05caaff-bfa0-460a-9ac9-94993cec15e7"',
        },
      },
    ],
  },
  {
    active: "Generating insights",
    done: "Generated insights",
    duration: 8.8,
    description:
      "Drafting the answer: Home loans lead at 38%, the spread across types is narrow, and the sample size keeps the gaps directional. Embedding the chart tag alongside the counts.",
    agents: [
      {
        name: "Synthesis Agent",
        sub: "Drafting summary and recommendations",
        input: "query result (3 rows) + chart tag",
        output: "3 claims · 1 chart embedded · 1 source cited",
      },
    ],
  },
]

const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0)

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand("copy")
    textarea.remove()
    return copied
  }
}

function PhaseIcon({ title, done }: { title: string done: boolean }) {
  if (done) return <CheckIcon />

  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }

  if (title.includes("Understanding")) {
    return (
      <svg {...common}>
        <path d="M7.4 2.6C5.9 2 4.3 2.7 4 4.1c-1.1.3-1.7 1.3-1.4 2.3-.9.6-1 1.9-.2 2.6-.3 1.2.6 2.3 1.9 2.3.2 1.1 1.3 1.8 2.4 1.5.3.5.5.9.7 1.6V2.6zM8.6 2.6C10.1 2 11.7 2.7 12 4.1c1.1.3 1.7 1.3 1.4 2.3.9.6 1 1.9.2 2.6.3 1.2-.6 2.3-1.9 2.3-.2 1.1-1.3 1.8-2.4 1.5-.3.5-.5.9-.7 1.6V2.6zM8 2.4V14" />
      </svg>
    )
  }

  if (title.includes("queries")) {
    return (
      <svg {...common}>
        <ellipse cx="8" cy="4" rx="5" ry="1.9" />
        <path d="M3 4v4c0 1.05 2.24 1.9 5 1.9s5-.85 5-1.9V4M3 8v4c0 1.05 2.24 1.9 5 1.9s5-.85 5-1.9V8" />
      </svg>
    )
  }

  if (title.includes("Charting")) {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="5.6" />
        <path d="M8 2.4V8l4.9 2.7" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="m6.2 2.2.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4ZM11.4 8.4l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6.6-1.5Z" />
    </svg>
  )
}

function HighlightedCode({ code }: { code: string }) {
  const tokens =
    /(\b(?:SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|COUNT|SUM|AVG|MIN|MAX|AS|DESC|ASC|AND|OR|ON|JOIN|LIMIT)\b|"[^"]*"|'[^']*')/g
  const isKeyword =
    /^(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|COUNT|SUM|AVG|MIN|MAX|AS|DESC|ASC|AND|OR|ON|JOIN|LIMIT)$/
  const parts = code.split(tokens)

  return (
    <>
      {parts.map((part, index) => {
        if (isKeyword.test(part)) {
          return (
            <span className="loader-code__keyword" key={`${part}-${index}`}>
              {part}
            </span>
          )
        }

        if (part.startsWith('"')) {
          return (
            <span className="loader-code__identifier" key={`${part}-${index}`}>
              {part}
            </span>
          )
        }

        if (part.startsWith("'")) {
          return (
            <span className="loader-code__string" key={`${part}-${index}`}>
              {part}
            </span>
          )
        }

        return <span key={`${part}-${index}`}>{part}</span>
      })}
    </>
  )
}

function PhaseAgents({
  phase,
  seconds,
  complete,
}: {
  phase: Phase
  seconds: number
  complete: boolean
}) {
  const [openAgents, setOpenAgents] = useState<Record<number, boolean>>({})
  const [copiedAgent, setCopiedAgent] = useState<number | null>(null)
  const segment = phase.duration / phase.agents.length

  async function copyAgentCode(code: string, index: number) {
    if (!(await copyToClipboard(code))) return
    setCopiedAgent(index)
    window.setTimeout(
      () => setCopiedAgent((current) => (current === index ? null : current)),
      1800,
    )
  }

  return (
    <div className="loader-agents">
      {phase.agents.map((agent, index) => {
        const start = segment * index
        const agentSeconds = Math.max(0, seconds - start)
        const agentDone = complete || agentSeconds >= segment
        const visible = complete || seconds >= start
        const open = openAgents[index] ?? false
        const count = agent.total
          ? `${
              agentDone
                ? agent.total
                : Math.max(
                    1,
                    Math.round(
                      agent.total * Math.min(1, agentSeconds / segment),
                    ),
                  )
            }/${agent.total}`
          : null

        if (!visible) return null

        return (
          <div
            className={`loader-agent nested-reveal ${
              agent.depth ? "loader-agent--nested" : ""
            }`}
            key={agent.name}
          >
            <span className="loader-agent__glyph">
              {agentDone ? (
                <CheckIcon size={11} />
              ) : (
                <span className="agent__pulse" />
              )}
            </span>
            <div className="loader-agent__content">
              <button
                type="button"
                className="loader-agent__heading"
                aria-expanded={open}
                onClick={() =>
                  setOpenAgents((current) => ({
                    ...current,
                    [index]: !open,
                  }))
                }
              >
                <span>{agent.name}</span>
                {count && <span className="pill pill--small">{count}</span>}
                <Chevron open={open} />
              </button>
              <p className="loader-agent__sub">{agent.sub}</p>

              {open &&
                (agent.card ? (
                  <div className="loader-code-wrap nested-reveal">
                    <div className="loader-code-label">
                      <span>{agent.card.label}</span>
                      <span className="pill pill--small">
                        {agent.card.lines}
                      </span>
                    </div>
                    <div className="loader-code">
                      <div className="loader-code__header">
                        <span>{agent.card.lang}</span>
                        <button
                          type="button"
                          className={`loader-code__copy ${
                            copiedAgent === index
                              ? "loader-code__copy--copied"
                              : ""
                          }`}
                          aria-label={
                            copiedAgent === index
                              ? "Code copied"
                              : `Copy ${agent.card.lang} code`
                          }
                          onClick={() => copyAgentCode(agent.card!.code, index)}
                        >
                          {copiedAgent === index ? (
                            <CheckIcon size={13} />
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden="true"
                            >
                              <rect
                                x="5.5"
                                y="2.5"
                                width="8"
                                height="8"
                                rx="1.6"
                                stroke="currentColor"
                                strokeWidth="1.2"
                              />
                              <path
                                d="M10.5 13.5H4A1.5 1.5 0 0 1 2.5 12V5.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                          {copiedAgent === index && (
                            <span
                              className="loader-code__copy-feedback"
                              role="status"
                            >
                              Copied
                            </span>
                          )}
                        </button>
                      </div>
                      <pre>
                        <code>
                          <HighlightedCode code={agent.card.code} />
                        </code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="loader-io nested-reveal">
                    <div>
                      <span>IN</span>
                      <code>{agent.input}</code>
                    </div>
                    <i />
                    <div>
                      <span>OUT</span>
                      <code>{agentDone ? agent.output : "running…"}</code>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getActivePhase(elapsed: number, complete: boolean) {
  if (complete) return phases.length
  let boundary = 0
  for (let index = 0; index < phases.length; index += 1) {
    boundary += phases[index].duration
    if (elapsed < boundary) return index
  }
  return phases.length
}

function StandardLoader({
  elapsed,
  complete,
  loaderOpen,
  openPhase,
  instanceId,
  onLoaderToggle,
  onPhaseToggle,
}: {
  elapsed: number
  complete: boolean
  loaderOpen: boolean
  openPhase: number | null
  instanceId: string
  onLoaderToggle: () => void
  onPhaseToggle: (index: number, open: boolean) => void
}) {
  const activeIndex = getActivePhase(elapsed, complete)
  const visibleCount = Math.min(activeIndex + 1, phases.length)
  const heading = complete
    ? `Analysis complete in ${Math.round(totalDuration)}s`
    : `${phases[activeIndex].active}…`

  return (
    <section className="loader" aria-live="polite" data-flow="standard">
      <button
        className="loader__header"
        onClick={onLoaderToggle}
        aria-expanded={loaderOpen}
        aria-controls={`${instanceId}-phases`}
      >
        <span className="loader__status-icon">
          {complete ? <CheckIcon size={16} /> : <LoaderGlyph />}
        </span>
        <span className={`loader__heading ${!complete ? "shimmer" : ""}`}>
          {heading}
        </span>
        <span className="loader__elapsed">{formatTime(elapsed)}</span>
        <Chevron open={loaderOpen} />
      </button>

      <div
        id={`${instanceId}-phases`}
        className={`phase-list ${loaderOpen ? "phase-list--open" : ""}`}
      >
        <div>
          {phases.slice(0, visibleCount).map((phase, index) => {
            const isDone = index < activeIndex
            const isActive = index === activeIndex
            const isOpen = openPhase === index
            const phaseStart = phases
              .slice(0, index)
              .reduce((sum, item) => sum + item.duration, 0)
            const phaseSeconds = isDone
              ? phase.duration
              : Math.max(0, elapsed - phaseStart)
            const phaseProgress = Math.min(1, phaseSeconds / phase.duration)
            const visibleDescription = isDone
              ? phase.description
              : phase.description.slice(
                  0,
                  Math.ceil(
                    phase.description.length * Math.min(1, phaseProgress * 1.3),
                  ),
                )

            return (
              <article className="phase" key={phase.active}>
                <button
                  className="phase__row"
                  onClick={() => onPhaseToggle(index, isOpen)}
                  aria-expanded={isOpen}
                >
                  <span
                    className={`phase__icon ${
                      isActive ? "phase__icon--active" : ""
                    }`}
                  >
                    <PhaseIcon title={phase.active} done={isDone} />
                  </span>
                  <span className={`phase__title ${isActive ? "shimmer" : ""}`}>
                    {isDone ? phase.done : phase.active}
                  </span>
                  <span className="pill">{formatTime(phaseSeconds)}</span>
                  <span className="phase__spacer" />
                  <Chevron open={isOpen} />
                </button>

                {isOpen && (
                  <div className="phase__body">
                    <p>{visibleDescription}</p>
                    <PhaseAgents
                      phase={phase}
                      seconds={phaseSeconds}
                      complete={isDone}
                    />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function NormalFlowPreview({ onClose }: { onClose: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [runKey, setRunKey] = useState(0)
  const [loaderOpen, setLoaderOpen] = useState(false)
  const [openPhase, setOpenPhase] = useState<number | null>(0)
  const complete = elapsed >= totalDuration
  const activeIndex = getActivePhase(elapsed, complete)

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
      setElapsed(Math.min((performance.now() - start) / 1000, totalDuration))
    }, 100)
    return () => window.clearInterval(timer)
  }, [runKey])

  useEffect(() => {
    if (complete) {
      setOpenPhase(null)
      setLoaderOpen(false)
    } else {
      setOpenPhase(activeIndex)
    }
  }, [activeIndex, complete])

  function replayPreview() {
    setElapsed(0)
    setLoaderOpen(false)
    setOpenPhase(0)
    setRunKey((value) => value + 1)
  }

  return (
    <section
      className="error-preview"
      role="dialog"
      aria-modal="true"
      aria-label="Normal flow prototype"
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
          <strong>Normal flow prototype</strong>
          <span>Independent preview layer</span>
        </div>
        <div className="flow-preview__actions">
          <Button onClick={replayPreview}>
            <span aria-hidden="true">↻</span> Replay
          </Button>
          <button
            type="button"
            className="flow-preview__close"
            aria-label="Close normal flow"
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
        </div>
      </header>

      <main className="error-preview__content">
        <div className="error-preview__question">
          <p>What are the different loan types and their counts?</p>
          <span>
            <strong>sample_banking_data 1.xlsx</strong>
            <code>XLSX</code>
          </span>
        </div>

        <StandardLoader
          elapsed={elapsed}
          complete={complete}
          loaderOpen={loaderOpen}
          openPhase={openPhase}
          instanceId="normal-preview-loader"
          onLoaderToggle={() => setLoaderOpen((value) => !value)}
          onPhaseToggle={(index, open) => setOpenPhase(open ? null : index)}
        />
      </main>
    </section>
  )
}

export default function App() {
  const [elapsed, setElapsed] = useState(0)
  const [runKey, setRunKey] = useState(0)
  const [mode, setMode] = useState<RunMode>("standard")
  const [loaderOpen, setLoaderOpen] = useState(false)
  const [openPhase, setOpenPhase] = useState<number | null>(0)
  const [draft, setDraft] = useState("")
  const [question, setQuestion] = useState("")
  const [normalPreviewOpen, setNormalPreviewOpen] = useState(false)
  const [errorPreviewOpen, setErrorPreviewOpen] = useState(false)
  const [stopped, setStopped] = useState(false)

  const complete =
    Boolean(question) && mode === "standard" && elapsed >= totalDuration

  const activeIndex = getActivePhase(elapsed, complete)

  useEffect(() => {
    if (!question || stopped) return

    const start = performance.now()
    const timer = window.setInterval(() => {
      const next = (performance.now() - start) / 1000
      setElapsed(
        mode === "error" ? Math.min(next, 12.6) : Math.min(next, totalDuration),
      )
    }, 100)
    return () => window.clearInterval(timer)
  }, [mode, question, runKey, stopped])

  useEffect(() => {
    if (complete) {
      setOpenPhase(null)
      setLoaderOpen(false)
    } else if (activeIndex < phases.length) {
      setOpenPhase(activeIndex)
    }
  }, [activeIndex, complete])

  function replay(nextMode: RunMode) {
    if (!question) setQuestion(draft.trim())
    setMode(nextMode)
    setStopped(false)
    setElapsed(0)
    setRunKey((value) => value + 1)
    setLoaderOpen(false)
    setOpenPhase(0)
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextQuestion = draft.trim()
    if (!nextQuestion) return

    setQuestion(nextQuestion)
    setDraft("")
    setMode("standard")
    setStopped(false)
    setElapsed(0)
    setRunKey((value) => value + 1)
    setLoaderOpen(false)
    setOpenPhase(0)
  }

  const isGenerating =
    Boolean(question) &&
    !stopped &&
    ((mode === "standard" && !complete) || (mode === "error" && elapsed < 12.6))

  return (
    <div className="app-shell">
      <Sidebar />
      <div
        className="chat-background"
        aria-hidden="true"
        data-node-id="8008:1880"
      >
        <img
          src={assetUrl("assets/chat-background/aacac.svg")}
          alt=""
          width="1387"
          height="358"
        />
      </div>

      <main className="workspace">
        <section className="intro">
          <div>
            <p className="eyebrow">Ideation 1 · Narrated phases</p>
            <p className="intro__description">
              Agents while it works · only the SQL used once it’s done.
            </p>
          </div>
          <div className="actions">
            <Button
              onClick={() => {
                setErrorPreviewOpen(false)
                setNormalPreviewOpen(true)
              }}
            >
              Normal flow
            </Button>
            <Button
              danger
              onClick={() => {
                setNormalPreviewOpen(false)
                setErrorPreviewOpen(true)
              }}
            >
              Error flow
            </Button>
          </div>
        </section>

        <form className="question-composer" onSubmit={submitQuestion}>
          <div className="question-composer__box">
            <label className="sr-only" htmlFor="analysis-question">
              Ask a question
            </label>
            <input
              id="analysis-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a question"
            />

            <div className="question-composer__controls">
              <div className="question-composer__left">
                <button
                  type="button"
                  className="composer-icon"
                  aria-label="Add"
                >
                  <img
                    src={assetUrl("assets/composer-icons/add.svg")}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
                <button type="button" className="source-pill">
                  <span className="source-pill__marks" aria-hidden="true">
                    <span className="source-mark source-mark--word">
                      <img
                        src={assetUrl("assets/composer-icons/word.svg")}
                        alt=""
                      />
                    </span>
                    <span className="source-mark source-mark--data">
                      <img
                        src={assetUrl("assets/composer-icons/schema.svg")}
                        alt=""
                      />
                    </span>
                    <span className="source-mark source-mark--count">+5</span>
                  </span>
                  <span>Sales Data Pool</span>
                  <img
                    className="composer-chevron"
                    src={assetUrl("assets/composer-icons/source-chevron.svg")}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
                <button type="button" className="tools-pill" aria-label="Tools">
                  <img
                    src={assetUrl("assets/composer-icons/tools.svg")}
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className="composer-chevron"
                    src={assetUrl("assets/composer-icons/tools-chevron.svg")}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="question-composer__right">
                <button type="button" aria-label="Preview data">
                  <img
                    src={assetUrl("assets/composer-icons/data-preview.svg")}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
                <button type="button" aria-label="Data information">
                  <img
                    src={assetUrl("assets/composer-icons/data-info.svg")}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
                <span className="composer-separator" />
                {draft.trim() ? (
                  <button
                    className="composer-submit composer-submit--active"
                    type="submit"
                    aria-label="Send question"
                  >
                    <img
                      src={assetUrl("assets/composer-icons/send.svg")}
                      alt=""
                      aria-hidden="true"
                    />
                  </button>
                ) : isGenerating ? (
                  <button
                    className="composer-submit composer-submit--stop"
                    type="button"
                    aria-label="Stop generating"
                    onClick={() => setStopped(true)}
                  >
                    <span aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    className="composer-submit"
                    type="button"
                    aria-label="Start voice input"
                  >
                    <img
                      src={assetUrl("assets/composer-icons/voice.svg")}
                      alt=""
                      aria-hidden="true"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
          <p className="question-composer__disclaimer">
            Lumenore AI can make mistakes. Please double-check responses.
          </p>
        </form>

        {question && (
          <section className="question" aria-label="User question">
            <p>{question}</p>
          </section>
        )}

        {question && mode === "error" ? (
          <ErrorFlow
            elapsed={elapsed}
            loaderOpen={loaderOpen}
            onLoaderToggle={() => setLoaderOpen((value) => !value)}
            onRetry={() => replay("standard")}
          />
        ) : question ? (
          <StandardLoader
            elapsed={elapsed}
            complete={complete}
            loaderOpen={loaderOpen}
            openPhase={openPhase}
            instanceId="main-loader"
            onLoaderToggle={() => setLoaderOpen((value) => !value)}
            onPhaseToggle={(index, open) => setOpenPhase(open ? null : index)}
          />
        ) : null}

        {mode === "standard" && complete && (
          <section className="answer">
            <div className="answer__section">
              <h1>Executive Summary (Last 30 Days)</h1>
              <p>Overall business performance is stable, but we are seeing:</p>
              <ul>
                <li>Revenue +6.8%</li>
                <li>Profit Margin -3.2%</li>
                <li>Return Rate +1.4%</li>
              </ul>
            </div>

            <div className="answer__divider" />

            <div className="answer__section">
              <h2>Deep Dive: Category Profit Pressure</h2>
              <p>
                I checked category-wise margin and found Electronics margin is
                critically low.
                <br />
                This is not due to low sales — it’s primarily driven by:
              </p>
              <ul>
                <li>higher COGS</li>
                <li>increased returns</li>
                <li>aggressive discounting</li>
              </ul>
            </div>

            <div className="profit-card">
              <div className="profit-card__header">
                <strong>Profit Margin by Category (%)</strong>
                <span>Last 30 days | Source: Finance_Fact</span>
              </div>

              <div
                className="profit-chart"
                role="img"
                aria-label="Profit margin by category: Electronics 18 percent, Furniture 31 percent, Office Supplies 34 percent, Appliances 29 percent, and Accessories 32 percent"
              >
                <div className="profit-chart__axis">
                  <span>40</span>
                  <span>30</span>
                  <span>20</span>
                  <span>10</span>
                  <span>0</span>
                </div>
                <div className="profit-chart__plot">
                  {[10, 20, 30, 40].map((line) => (
                    <span
                      className="profit-chart__grid"
                      style={{ bottom: `${line * 2}%` }}
                      key={line}
                    />
                  ))}
                  {[
                    ["Electronics", 18],
                    ["Furniture", 31],
                    ["Office Supplies", 34],
                    ["Appliances", 29],
                    ["Accessories", 32],
                  ].map(([label, value]) => (
                    <div className="profit-chart__column" key={label}>
                      <span className="profit-chart__value">{value}%</span>
                      <span
                        className="profit-chart__bar"
                        style={{ height: `${Number(value) * 2}%` }}
                      />
                      <span className="profit-chart__label">{label}</span>
                    </div>
                  ))}
                </div>
                <span className="profit-chart__y-label">Profit Margin %</span>
              </div>
            </div>
          </section>
        )}
      </main>

      {normalPreviewOpen && (
        <NormalFlowPreview onClose={() => setNormalPreviewOpen(false)} />
      )}

      {errorPreviewOpen && (
        <ErrorFlowPreview onClose={() => setErrorPreviewOpen(false)} />
      )}
    </div>
  )
}

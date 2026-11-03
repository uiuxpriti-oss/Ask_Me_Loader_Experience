import { useEffect, useState } from "react"
import { Button, CheckIcon, Chevron, LoaderGlyph } from "./LoaderPrimitives"

type ErrorFlowProps = {
  elapsed: number
  loaderOpen: boolean
  onLoaderToggle: () => void
  onRetry: () => void
}

type ErrorAgentProps = {
  name: string
  sub: string
  input: string
  output: string
  done: boolean
  error?: boolean
  nested?: boolean
}

const understandingDuration = 3.4
const errorAt = 6
const retryAt = 8.8
const failureAt = 11.8
const totalDuration = 12.6

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
}

function ErrorPhaseIcon({
  type,
  done = false,
  error = false,
}: {
  type: "understanding" | "query"
  done?: boolean
  error?: boolean
}) {
  if (done) return <CheckIcon />
  if (error) return <span className="error-phase-mark">!</span>

  return type === "understanding" ? (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7.4 2.6C5.9 2 4.3 2.7 4 4.1c-1.1.3-1.7 1.3-1.4 2.3-.9.6-1 1.9-.2 2.6-.3 1.2.6 2.3 1.9 2.3.2 1.1 1.3 1.8 2.4 1.5.3.5.5.9.7 1.6V2.6zM8.6 2.6C10.1 2 11.7 2.7 12 4.1c1.1.3 1.7 1.3 1.4 2.3.9.6 1 1.9.2 2.6.3 1.2-.6 2.3-1.9 2.3-.2 1.1-1.3 1.8-2.4 1.5-.3.5-.5.9-.7 1.6V2.6zM8 2.4V14" />
    </svg>
  ) : (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <ellipse cx="8" cy="4" rx="5" ry="1.9" />
      <path d="M3 4v4c0 1.05 2.24 1.9 5 1.9s5-.85 5-1.9V4M3 8v4c0 1.05 2.24 1.9 5 1.9s5-.85 5-1.9V8" />
    </svg>
  )
}

function ErrorAgent({
  name,
  sub,
  input,
  output,
  done,
  error = false,
  nested = false,
}: ErrorAgentProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`loader-agent nested-reveal ${
        nested ? "loader-agent--nested" : ""
      }`}
    >
      <span
        className={`loader-agent__glyph ${
          error ? "loader-agent__glyph--error" : ""
        }`}
      >
        {error ? (
          <span className="agent__dot--error" />
        ) : done ? (
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
          onClick={() => setOpen((value) => !value)}
        >
          <span>{name}</span>
          <Chevron open={open} />
        </button>
        <p className="loader-agent__sub">{sub}</p>
        {open && (
          <div className="loader-io nested-reveal">
            <div>
              <span>IN</span>
              <code>{input}</code>
            </div>
            <i />
            <div>
              <span>OUT</span>
              <code className={error ? "loader-io__error" : ""}>
                {done || error ? output : "running…"}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ErrorFlow({
  elapsed,
  loaderOpen,
  onLoaderToggle,
  onRetry,
}: ErrorFlowProps) {
  const [openPhase, setOpenPhase] = useState(0)
  const queryActive = elapsed >= understandingDuration
  const firstAttemptFailed = elapsed >= errorAt
  const retrying = elapsed >= retryAt
  const failed = elapsed >= failureAt
  const querySeconds = Math.max(0, elapsed - understandingDuration)

  useEffect(() => {
    if (queryActive) setOpenPhase(1)
  }, [queryActive])

  const queryProse =
    "Running the grouped count against the banking dataset. The warehouse dropped the connection mid-query, so the executor retried once — the second attempt failed the same way, so the run was stopped rather than answering from partial rows."
  const proseProgress = Math.min(1, querySeconds / 7)
  const visibleQueryProse = failed
    ? queryProse
    : queryProse.slice(0, Math.ceil(queryProse.length * proseProgress))
  const errorTitle = failed
    ? "Query failed after 2 attempts"
    : retrying
      ? "Attempt 1 failed · attempt 2 in progress"
      : "Attempt 1 failed — retrying automatically"
  const note = failed
    ? "Stopped — both attempts failed. Nothing was answered from partial data."
    : retrying
      ? "Retrying — reconnecting to the warehouse (attempt 2 of 2)…"
      : "A query hit a connection error — retrying automatically…"

  return (
    <>
      <section
        className={`loader ${failed ? "loader--failed" : ""}`}
        aria-live="polite"
        data-flow="error"
      >
        <button
          className="loader__header"
          onClick={onLoaderToggle}
          aria-expanded={loaderOpen}
          aria-controls="error-flow-phases"
        >
          <span className="loader__status-icon">
            {failed ? <span className="error-mark">!</span> : <LoaderGlyph />}
          </span>
          <span className={`loader__heading ${failed ? "" : "shimmer"}`}>
            {failed
              ? `Stopped after ${Math.round(elapsed)}s — data query failed`
              : queryActive
                ? "Running data queries…"
                : "Understanding your request…"}
          </span>
          <span className="loader__elapsed">
            {formatTime(Math.min(elapsed, totalDuration))}
          </span>
          <Chevron open={loaderOpen} />
        </button>

        <div
          id="error-flow-phases"
          className={`phase-list ${loaderOpen ? "phase-list--open" : ""}`}
        >
          <div>
            <article className="phase">
              <button
                className="phase__row"
                onClick={() => setOpenPhase(openPhase === 0 ? -1 : 0)}
                aria-expanded={openPhase === 0}
              >
                <span className="phase__icon">
                  <ErrorPhaseIcon type="understanding" done={queryActive} />
                </span>
                <span
                  className={`phase__title ${queryActive ? "" : "shimmer"}`}
                >
                  {queryActive
                    ? "Understood your request"
                    : "Understanding your request"}
                </span>
                <span className="pill">
                  {formatTime(
                    queryActive
                      ? understandingDuration
                      : Math.min(elapsed, understandingDuration),
                  )}
                </span>
                <span className="phase__spacer" />
                <Chevron open={openPhase === 0} />
              </button>

              {openPhase === 0 && (
                <div className="phase__body">
                  <p>
                    Reading the question against sample_banking_data 1.xlsx:
                    this is a grouped count over loan types, so one GROUP BY
                    answers it. Resolving the Banking schema before querying.
                  </p>
                  <div className="loader-agents">
                    <ErrorAgent
                      name="Agent: Data Query Agent"
                      sub="Understanding data questions"
                      input="What are the different loan types and their counts?"
                      output="The analysis of loan types shows that the most common type is Home loans, with 38 applications, followed by Personal loans with 32 applications, and Auto loans with 30 applications."
                      done={elapsed >= 1.7}
                    />
                    {elapsed >= 1.7 && (
                      <ErrorAgent
                        name="Schema Resolver"
                        sub="Resolving the dataset schema"
                        input="sample_banking_data 1.xlsx"
                        output={
                          'schema (Banking) · 1 sheet · "LOAN TYPE", "COUNT" available'
                        }
                        done={queryActive}
                        nested
                      />
                    )}
                  </div>
                </div>
              )}
            </article>

            {queryActive && (
              <article className="phase nested-reveal">
                <button
                  className="phase__row"
                  onClick={() => setOpenPhase(openPhase === 1 ? -1 : 1)}
                  aria-expanded={openPhase === 1}
                >
                  <span className="phase__icon">
                    <ErrorPhaseIcon type="query" error={firstAttemptFailed} />
                  </span>
                  <span
                    className={`phase__title ${
                      firstAttemptFailed ? "phase__title--error" : "shimmer"
                    }`}
                  >
                    Running data queries
                  </span>
                  <span className="pill">
                    {formatTime(Math.min(querySeconds, 9.2))}
                  </span>
                  <span className="phase__spacer" />
                  <Chevron open={openPhase === 1} />
                </button>

                {openPhase === 1 && (
                  <div className="phase__body">
                    <p>{visibleQueryProse}</p>
                    <div className="loader-agents">
                      <ErrorAgent
                        name="Tool: Query Executor"
                        sub={
                          failed ? "Reconnect failed" : "Running SQL queries"
                        }
                        input={
                          'sql_query = SELECT "LOAN TYPE", COUNT(*) AS "COUNT" FROM lumenore_data GROUP BY "LOAN TYPE" ORDER BY "COUNT" DESC;\nschema_name = sample_banking_data 1.xlsx (Banking)'
                        }
                        output={
                          failed
                            ? "Failed after 2 attempts · no rows returned"
                            : firstAttemptFailed
                              ? "ECONNRESET · warehouse closed the connection mid-query"
                              : "running…"
                        }
                        done={false}
                        error={firstAttemptFailed}
                      />

                      {firstAttemptFailed && (
                        <div className="error-card nested-reveal">
                          <strong>{errorTitle}</strong>
                          <dl>
                            <dt>code</dt>
                            <dd>
                              {failed
                                ? "ECONNREFUSED (warehouse unreachable)"
                                : "ECONNRESET (warehouse connection reset)"}
                            </dd>
                            <dt>where</dt>
                            <dd>
                              Query Executor → lumenore_data · statement 1 of 1
                            </dd>
                            {failed ? (
                              <>
                                <dt>attempt 1</dt>
                                <dd>
                                  ECONNRESET after 2.9s — connection closed
                                  while streaming rows
                                </dd>
                                <dt>attempt 2</dt>
                                <dd>
                                  ECONNREFUSED after 1.1s — reconnect refused by
                                  warehouse
                                </dd>
                                <dt>impact</dt>
                                <dd>
                                  No rows returned. Charting and insights were
                                  not run, so no answer was produced from
                                  partial data.
                                </dd>
                              </>
                            ) : (
                              <>
                                <dt>detail</dt>
                                <dd>
                                  Connection closed by warehouse after 2.9s
                                  while streaming rows. No partial data was
                                  used.
                                </dd>
                                <dt>action</dt>
                                <dd>
                                  Reconnecting via Warehouse Connector · attempt
                                  2 of 2
                                </dd>
                              </>
                            )}
                          </dl>
                        </div>
                      )}

                      {firstAttemptFailed && (
                        <ErrorAgent
                          name="Warehouse Connector"
                          sub={
                            failed
                              ? "Reconnect failed"
                              : "Re-establishing connection"
                          }
                          input="retry attempt 2 of 2"
                          output={
                            failed
                              ? "ECONNREFUSED · warehouse unreachable"
                              : retrying
                                ? "reconnecting…"
                                : "waiting to retry…"
                          }
                          done={false}
                          error={failed}
                          nested
                        />
                      )}
                    </div>

                    {firstAttemptFailed && (
                      <div
                        className={`error-flow-note ${
                          failed ? "error-flow-note--failed" : ""
                        }`}
                      >
                        <span />
                        <p>{note}</p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            )}
          </div>
        </div>
      </section>

      {failed && (
        <section className="failure">
          <strong>Couldn’t finish this analysis</strong>
          <p>
            The data query failed twice — the warehouse connection was reset,
            then refused. Nothing was answered from partial rows, so there’s no
            result to show. Your upload is unaffected.
          </p>
          <div className="actions">
            <Button danger onClick={onRetry}>
              Try again
            </Button>
          </div>
        </section>
      )}
    </>
  )
}

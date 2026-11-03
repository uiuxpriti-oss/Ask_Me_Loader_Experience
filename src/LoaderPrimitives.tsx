import type { ReactNode } from "react"

export function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`chevron ${open ? "chevron--open" : ""}`}
      width="14"
      height="14"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LoaderGlyph() {
  return (
    <span className="loader-glyph" aria-hidden="true">
      <span className="glyph glyph--bars">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="glyph glyph--lines">
        <i />
        <i />
        <i />
      </span>
      <span className="glyph glyph--dots">
        {Array.from({ length: 9 }, (_, index) => (
          <i key={index} />
        ))}
      </span>
    </span>
  )
}

export function Button({
  children,
  onClick,
  danger = false,
}: {
  children: ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      className={`button ${danger ? "button--danger" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

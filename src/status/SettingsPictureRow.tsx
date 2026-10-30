import React from 'react'
import {
  StatusIcon,
  type AppIconPlacement,
  type DockBackgroundPreference,
  type RingStrokeStyle,
  type StatusIconState,
  type VolumeDisplayStyle,
} from './StatusIcon'

export interface PictureOption<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  title: string
  subtitle: string
  label: string
  options: PictureOption<T>[]
  value: T
  onChange: (value: T) => void
  glyph: React.ReactNode
  renderPreview: (option: PictureOption<T>) => React.ReactNode
  optionColumns?: number
}

/**
 * A compact browser equivalent of macOS Settings' picture-card picker.
 *
 * The card and its caption are one native radio target. Arrow keys wrap inside
 * the row, Home/End jump to its edges, and the selection ring is separate from
 * the keyboard focus ring.
 */
export function SettingsPictureRow<T extends string>({
  title,
  subtitle,
  label,
  options,
  value,
  onChange,
  glyph,
  renderPreview,
  optionColumns,
}: Props<T>) {
  const radioRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const groupId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const resolvedOptionColumns = Math.max(
    1,
    optionColumns ?? Math.min(options.length, 3),
  )

  const selectAt = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    radioRefs.current[index]?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let next = -1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (index + 1) % options.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (index - 1 + options.length) % options.length
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = options.length - 1
    }
    if (next < 0) return
    event.preventDefault()
    selectAt(next)
  }

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )

  return (
    <div
      className={
        'set-picture-row' +
        (resolvedOptionColumns === 2 ? ' is-two-up' : '')
      }
    >
      <div className="set-picture-copy">
        <span className="set-picture-glyph" aria-hidden>
          {glyph}
        </span>
        <div className="set-picture-text">
          <h4>{title}</h4>
          <p>{subtitle}</p>
        </div>
      </div>

      <div
        className="set-picture-options"
        data-columns={resolvedOptionColumns}
        role="radiogroup"
        aria-label={label}
        style={
          {
            '--set-picture-columns': resolvedOptionColumns,
          } as React.CSSProperties
        }
      >
        {options.map((option, index) => {
          const optionId = `${groupId}-${option.value}`
          const selected = option.value === value
          return (
            <button
              key={option.value}
              ref={(node) => {
                radioRefs.current[index] = node
              }}
              type="button"
              role="radio"
              className="set-picture-option"
              aria-checked={selected}
              aria-labelledby={`${optionId}-caption`}
              tabIndex={index === selectedIndex ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="set-picture-preview" aria-hidden>
                {renderPreview(option)}
              </span>
              <span className="set-picture-caption" id={`${optionId}-caption`}>
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Miniature placement illustration; the active location uses the system accent. */
export function PlacementPreview({ placement }: { placement: AppIconPlacement }) {
  const showsMenuBar = placement === 'menuBar' || placement === 'both'
  const showsDock = placement === 'dock' || placement === 'both'

  return (
    <svg
      className="set-placement-preview"
      viewBox="0 0 64 42"
      role="presentation"
      focusable="false"
    >
      <rect className="set-placement-screen" x="1.5" y="1.5" width="61" height="39" rx="5" />
      <path className="set-placement-menubar" d="M7 2.5h50" />
      <circle className="set-placement-apple" cx="7" cy="5.8" r="1.15" />
      <rect
        className={showsMenuBar ? 'set-placement-active' : 'set-placement-inactive'}
        x="49.5"
        y="4.5"
        width="9.5"
        height="2.8"
        rx="1.4"
      />
      <rect className="set-placement-body" x="6" y="10" width="52" height="24" rx="2.5" />
      <rect
        className="set-placement-dock"
        x="18"
        y="34"
        width="28"
        height="4.6"
        rx="2.3"
      />
      <rect
        className="set-placement-inactive"
        x="22"
        y="35"
        width="3.5"
        height="3"
        rx="1"
      />
      <rect
        className={showsDock ? 'set-placement-active' : 'set-placement-inactive'}
        x="30"
        y="34"
        width="5"
        height="4.6"
        rx="1.3"
      />
      <rect
        className="set-placement-inactive"
        x="39"
        y="35"
        width="3.5"
        height="3"
        rx="1"
      />
    </svg>
  )
}

/** Reuse the live renderer and only change the stroke style for this preview. */
export function RingPreview({
  state,
  ringStrokeStyle,
}: {
  state: StatusIconState
  ringStrokeStyle: RingStrokeStyle
}) {
  return (
    <span className="set-ring-preview">
      <StatusIcon state={{ ...state, ringStrokeStyle }} size={28} />
    </span>
  )
}

/** Native volume-style preview: the full status icon on an audible menu-bar tile. */
export function VolumePreview({
  state,
  volumeStyle,
}: {
  state: StatusIconState
  volumeStyle: VolumeDisplayStyle
}) {
  const previewState: StatusIconState = {
    ...state,
    volume: state.muted || state.volume <= 0 ? 75 : state.volume,
    muted: false,
    btReplace: false,
    btVolumeColor: false,
    volumeStyle,
  }

  return (
    <span className="set-volume-preview" data-volume-style={volumeStyle}>
      <StatusIcon state={previewState} size={28} />
    </span>
  )
}

/** Reuse the live renderer on the three native Dock background choices. */
export function DockPreview({
  state,
  background,
}: {
  state: StatusIconState
  background: DockBackgroundPreference
}) {
  const previewState = { ...state }

  if (background === 'system') {
    return (
      <span className="set-dock-preview is-system">
        <span className="set-dock-tile set-dock-half is-light">
          <StatusIcon state={previewState} size={24} />
        </span>
        <span className="set-dock-tile set-dock-half is-dark">
          <StatusIcon state={previewState} size={24} />
        </span>
        <span className="set-dock-divider" />
      </span>
    )
  }

  return (
    <span className={`set-dock-preview is-${background}`}>
      <span className={`set-dock-tile is-${background}`}>
        <StatusIcon state={previewState} size={24} />
      </span>
    </span>
  )
}

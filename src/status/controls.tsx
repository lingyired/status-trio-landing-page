import React from 'react'

/** 控制台里的小控件：滑杆 / 开关 / 分段选择 / 下拉。刻意做成 macOS 设置面板的观感，
 *  不引入 UI 库——整个 landing 只有 React 一个运行时依赖。 */

export function Slider(props: {
  id?: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** 右侧读数，例如 "75%" */
  display: string
  disabled?: boolean
  onChange: (value: number) => void
}) {
  const generatedId = React.useId()
  const id = props.id ?? `ctl-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  // 已填充比例：交给 CSS 用 linear-gradient 画进度色（原生 range 无法直接表达）
  const fill = props.max > props.min ? ((props.value - props.min) / (props.max - props.min)) * 100 : 0
  return (
    <div className="ctl-field">
      <div className="ctl-field-head">
        <label className="ctl-label" htmlFor={id}>
          {props.label}
        </label>
        <output className="ctl-readout" htmlFor={id}>
          {props.display}
        </output>
      </div>
      <input
        id={id}
        className="ctl-slider"
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        disabled={props.disabled}
        aria-label={props.label}
        style={{ '--pg-fill': `${fill}%` } as React.CSSProperties}
        onChange={(e) => props.onChange(Number(e.currentTarget.value))}
      />
    </div>
  )
}

export function Toggle(props: {
  label: string
  /** 右侧说明文字 */
  note?: string
  pressed: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="ctl-toggle"
      role="switch"
      aria-checked={props.pressed}
      disabled={props.disabled}
      onClick={props.onToggle}
    >
      <span className="ctl-toggle-text">
        <span className="ctl-toggle-label">{props.label}</span>
        {props.note ? <span className="ctl-toggle-note">{props.note}</span> : null}
      </span>
      <span className="ctl-switch" aria-hidden>
        <span className="ctl-switch-knob" />
      </span>
    </button>
  )
}

export interface SegmentOption<T extends string | number> {
  value: T
  label: string
}

export function Segmented<T extends string | number>(props: {
  label: string
  value: T
  options: SegmentOption<T>[]
  disabled?: boolean
  onChange: (value: T) => void
}) {
  return (
    <div className="ctl-field">
      <span className="ctl-label">{props.label}</span>
      <div className="ctl-segmented" role="group" aria-label={props.label}>
        {props.options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            className="ctl-segment"
            aria-pressed={option.value === props.value}
            disabled={props.disabled}
            onClick={() => props.onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Select<T extends string>(props: {
  id?: string
  label: string
  value: T
  options: SegmentOption<T>[]
  disabled?: boolean
  onChange: (value: T) => void
}) {
  const generatedId = React.useId()
  const id = props.id ?? `ctl-select-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <div className="ctl-field">
      <label className="ctl-label" htmlFor={id}>
        {props.label}
      </label>
      <div className="ctl-select-wrap">
        <select
          id={id}
          className="ctl-select"
          value={props.value}
          disabled={props.disabled}
          onChange={(e) => props.onChange(e.currentTarget.value as T)}
        >
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg className="ctl-select-chevron" viewBox="0 0 12 8" aria-hidden focusable="false">
          <path
            d="M1.5 2 L6 6.2 L10.5 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

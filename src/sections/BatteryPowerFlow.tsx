import { useId, type ReactNode } from 'react'
import type { BatteryPowerFlowValues } from '../status/demo-state'

const FLOW_WIDTH = 302
const INPUT_CARD_WIDTH = 62
const DESTINATION_CARD_WIDTH = 94
const DESTINATION_CARD_HEIGHT = 60
const MAX_RIBBON_THICKNESS = 46

interface Props {
  flow: BatteryPowerFlowValues
  showInput: boolean
  showBattery: boolean
  showSystem: boolean
  labels: {
    input: string
    battery: string
    system: string
  }
}

interface Ribbon {
  color: 'battery' | 'system'
  thickness: number
  startY: number
  endY: number
}

const watts = (value: number) => `${value.toFixed(2)} W`

function ribbonPath(ribbon: Ribbon): string {
  const start = 66
  const end = FLOW_WIDTH - 98
  const control = (end - start) / 2
  const half = ribbon.thickness / 2
  return [
    `M ${start} ${ribbon.startY - half}`,
    `C ${start + control} ${ribbon.startY - half}, ${end - control} ${ribbon.endY - half}, ${end} ${ribbon.endY - half}`,
    `L ${end} ${ribbon.endY + half}`,
    `C ${end - control} ${ribbon.endY + half}, ${start + control} ${ribbon.startY + half}, ${start} ${ribbon.startY + half}`,
    'Z',
  ].join(' ')
}

function PlugIcon({ x, y }: { x: number; y: number }) {
  return (
    <g className="sp-flow-icon sp-flow-icon--input" transform={`translate(${x - 7.5} ${y - 7.5})`}>
      <path d="M5.2 2.2v4.1M9.8 2.2v4.1M3.4 6.3h8.2v1.4a4.1 4.1 0 0 1-8.2 0z" />
      <path d="M7.5 11.8v1.9" />
    </g>
  )
}

function BatteryBoltIcon({ x, y }: { x: number; y: number }) {
  return (
    <g className="sp-flow-icon sp-flow-icon--battery" transform={`translate(${x - 7.5} ${y - 7.5})`}>
      <rect x="1.2" y="3.4" width="11.5" height="8.2" rx="2.3" />
      <path d="M13.7 6.2v2.6M7.8 4.1 5.2 8h2.7l-1.2 3.4L9.8 7H7.1z" />
    </g>
  )
}

function LaptopIcon({ x, y }: { x: number; y: number }) {
  return (
    <g className="sp-flow-icon sp-flow-icon--system" transform={`translate(${x - 7.5} ${y - 7.5})`}>
      <rect x="2" y="2.6" width="11" height="8.2" rx="1.4" />
      <path d="M1 13h13M5.7 12.3h3.6" />
    </g>
  )
}

export function BatteryPowerFlow({
  flow,
  showInput,
  showBattery,
  showSystem,
  labels,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const destinationCount = Number(showBattery) + Number(showSystem)
  const height = destinationCount > 1 ? 132 : 76
  const centerY = height / 2
  const batteryY = destinationCount > 1 ? 31 : centerY
  const systemY = destinationCount > 1 ? 101 : centerY
  const visibleDestinationSum =
    (showBattery ? flow.batteryChargingWatts : 0) +
    (showSystem ? flow.systemWatts : 0)
  const scale = Math.max(
    flow.chargerInputWatts,
    visibleDestinationSum,
    1,
  )
  const batteryFraction = showBattery ? flow.batteryChargingWatts / scale : 0
  const systemFraction = showSystem ? flow.systemWatts / scale : 0
  const batteryGradient = `${uid}-battery-ribbon`
  const systemGradient = `${uid}-system-ribbon`

  const ribbons: Ribbon[] =
    showInput && destinationCount > 0
      ? [
          ...(showBattery
            ? [
                {
                  color: 'battery' as const,
                  thickness: MAX_RIBBON_THICKNESS * batteryFraction,
                  startY: centerY - systemFraction * 23,
                  endY: batteryY,
                },
              ]
            : []),
          ...(showSystem
            ? [
                {
                  color: 'system' as const,
                  thickness: MAX_RIBBON_THICKNESS * systemFraction,
                  startY: centerY + batteryFraction * 23,
                  endY: systemY,
                },
              ]
            : []),
        ]
      : []

  const inputCardWidth = destinationCount === 0 ? FLOW_WIDTH : INPUT_CARD_WIDTH
  const inputCardHeight = height - 8
  const inputCenterX = destinationCount === 0 ? FLOW_WIDTH / 2 : 31
  const destinationWidth = showInput ? DESTINATION_CARD_WIDTH : FLOW_WIDTH
  const destinationCenterX = showInput ? FLOW_WIDTH - 47 : FLOW_WIDTH / 2
  const inputIconY = centerY - 18
  const inputValueY = centerY + 1
  const inputLabelY = centerY + 16

  const accessibleMetrics = [
    showInput ? `${labels.input}: ${watts(flow.chargerInputWatts)}` : null,
    showBattery ? `${labels.battery}: ${watts(flow.batteryChargingWatts)}` : null,
    showSystem ? `${labels.system}: ${watts(flow.systemWatts)}` : null,
  ].filter((value): value is string => value !== null)

  const card = (
    x: number,
    y: number,
    width: number,
    cardHeight: number,
    className: string,
    icon: ReactNode,
    value: string,
    valueY: number,
    label: string,
    labelY: number,
  ) => (
    <g>
      <rect
        className={`sp-flow-card ${className}`}
        x={x}
        y={y}
        width={width}
        height={cardHeight}
        rx={className === 'sp-flow-card--input' ? 14 : 12}
      />
      {icon}
      <text className={`sp-flow-value ${className}-value`} x={x + width / 2} y={valueY} textAnchor="middle">
        {value}
      </text>
      <text className={`sp-flow-card-label ${className}-label`} x={x + width / 2} y={labelY} textAnchor="middle">
        {label}
      </text>
    </g>
  )

  return (
    <figure
      className="sp-flow"
      role="img"
      aria-label={accessibleMetrics.join(', ')}
      data-destinations={destinationCount}
      style={{ height }}
    >
      <svg viewBox={`0 0 ${FLOW_WIDTH} ${height}`} aria-hidden focusable="false">
        <defs>
          <linearGradient id={batteryGradient} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--sp-green)" stopOpacity="0.08" />
            <stop offset="1" stopColor="var(--sp-green)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={systemGradient} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--sp-blue)" stopOpacity="0.08" />
            <stop offset="1" stopColor="var(--sp-blue)" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {ribbons.map((ribbon) =>
          ribbon.thickness > 0 ? (
            <path
              key={ribbon.color}
              d={ribbonPath(ribbon)}
              fill={`url(#${ribbon.color === 'battery' ? batteryGradient : systemGradient})`}
            />
          ) : null,
        )}

        {showInput
          ? card(
              inputCenterX - inputCardWidth / 2,
              centerY - inputCardHeight / 2,
              inputCardWidth,
              inputCardHeight,
              'sp-flow-card--input',
              <PlugIcon x={inputCenterX} y={inputIconY} />,
              watts(flow.chargerInputWatts),
              inputValueY,
              labels.input,
              inputLabelY,
            )
          : null}

        {showBattery
          ? card(
              destinationCenterX - destinationWidth / 2,
              batteryY - DESTINATION_CARD_HEIGHT / 2,
              destinationWidth,
              DESTINATION_CARD_HEIGHT,
              'sp-flow-card--battery',
              <BatteryBoltIcon x={destinationCenterX} y={batteryY - 17} />,
              watts(flow.batteryChargingWatts),
              batteryY + 1,
              labels.battery,
              batteryY + 15,
            )
          : null}

        {showSystem
          ? card(
              destinationCenterX - destinationWidth / 2,
              systemY - DESTINATION_CARD_HEIGHT / 2,
              destinationWidth,
              DESTINATION_CARD_HEIGHT,
              'sp-flow-card--system',
              <LaptopIcon x={destinationCenterX} y={systemY - 17} />,
              watts(flow.systemWatts),
              systemY + 1,
              labels.system,
              systemY + 15,
            )
          : null}
      </svg>
    </figure>
  )
}

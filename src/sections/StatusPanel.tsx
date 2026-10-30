import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { RELEASE } from '../app'
import {
  AUDIO_OUTPUTS,
  HIGH_ENERGY_EXAMPLES,
  batteryPowerFlowValues,
  headsetInputIsAvailable,
  isBluetoothOutputId,
  volumeControlsAreEditable,
  wifiExampleRssi,
  wifiLinkIsAssociated,
  type AudioInputId,
  type StatusIconState,
} from '../status/StatusIcon'
import { AirPodsGlyph } from '../status/AirPodsGlyph'
import { useI18n } from '../i18n'
import { BatteryPowerFlow } from './BatteryPowerFlow'

interface Props {
  state: StatusIconState
}

/* ── 小图标：全部内联 SVG，不引资源。尺寸统一 17px 左右，颜色跟文字走，
      只有几处用产品色（电池绿 / 代理橙 / 蓝牙蓝 / 打勾蓝）。 ── */

const S = { width: 17, height: 17, 'aria-hidden': true } as const

function GearIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.25 2.4h3.5l.44 2.1c.5.2.97.46 1.4.78l1.77-1.3 2.48 2.47-1.3 1.77c.32.43.58.9.78 1.4l2.1.44v3.5l-2.1.44c-.2.5-.46.97-.78 1.4l1.3 1.77-2.47 2.48-1.77-1.3c-.43.32-.9.58-1.4.78l-.45 2.1h-3.5l-.44-2.1a8.4 8.4 0 0 1-1.4-.78l-1.77 1.3-2.48-2.47 1.3-1.77a8.4 8.4 0 0 1-.78-1.4l-2.1-.44v-3.5l2.1-.44c.2-.5.46-.97.78-1.4l-1.3-1.77 2.47-2.48 1.77 1.3c.43-.32.9-.58 1.4-.78z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  )
}

function ChevronIcon({ up = false }: { up?: boolean }) {
  return (
    <svg
      {...S}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={up ? { transform: 'rotate(-90deg)' } : undefined}
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="var(--sp-blue)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

function EthernetIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5h14v10H5zM8 15v3h8v-3M9 9h6M9 12h3" />
    </svg>
  )
}

function VolumeMutedIcon({ muted }: { muted: boolean }) {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke={muted ? 'var(--sp-red)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      {muted ? <path d="M17 9l4 6M21 9l-4 6" /> : <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />}
    </svg>
  )
}

function BatteryIcon({ level, power }: { level: number; power: StatusIconState['batteryPower'] }) {
  return (
    <svg viewBox="0 0 30 15" width="27" height="14" aria-hidden>
      <rect x="1" y="1.5" width="24" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.52" />
      <rect x="3" y="3.5" width={Math.max(1, Math.round(level * 0.18))} height="8" rx="2" fill="currentColor" />
      <path d="M26.6 5.2v4.6c1.6-.3 2.4-1.2 2.4-2.3s-.8-2-2.4-2.3z" fill="currentColor" opacity="0.52" />
      {power !== 'battery' ? <path d="M13 3l-3 5h3l-1 4 4-6h-3z" fill="var(--accent)" /> : null}
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <path d="M8.4 14.4a5.4 5.4 0 0 1 7.2 0M5.4 11a9.8 9.8 0 0 1 13.2 0M2.6 7.7a14 14 0 0 1 18.8 0" />
    </svg>
  )
}

function BtIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="var(--sp-blue)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7.5l10 9-5 4.5V3l5 4.5-10 9" />
    </svg>
  )
}

function ProxyIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="var(--sp-orange)">
      <path d="M12 2l8 3.2v6.1c0 4.9-3.3 8.4-8 10.7-4.7-2.3-8-5.8-8-10.7V5.2z" />
      <circle cx="12" cy="11" r="3.1" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" />
    </svg>
  )
}

function KeyboardIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2.5" y="6" width="19" height="12" rx="2.4" />
      <path d="M6 9.5h.01M9.5 9.5h.01M13 9.5h.01M16.5 9.5h.01M6 12.5h.01M9.5 12.5h.01M13 12.5h.01M16.5 12.5h.01M7.5 15.5h9" />
    </svg>
  )
}

function HeadphoneIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13.5" width="4" height="6.5" rx="1.8" fill="currentColor" stroke="none" />
      <rect x="17" y="13.5" width="4" height="6.5" rx="1.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function EarbudIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="currentColor">
      <AirPodsGlyph x={2} y={3.25} width={20} />
    </svg>
  )
}

function DisplayIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2.5" y="4" width="19" height="13" rx="2.2" />
      <path d="M9 20.5h6M12 17v3.5" />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 4h10l1.5 16h-13z" />
      <circle cx="12" cy="14" r="3" />
      <circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function MicIcon({ blue = false }: { blue?: boolean }) {
  const ink = blue ? 'var(--sp-blue)' : 'currentColor'
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round">
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5" />
    </svg>
  )
}

function AppleDeviceIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6.5" y="2.8" width="11" height="18.4" rx="2.8" />
      <path d="M10 5.8h4M11.2 18.4h1.6" />
    </svg>
  )
}

function EnergyAppIcon({ app }: { app: string }) {
  let glyph: ReactNode

  switch (app) {
    case 'Xcode':
      glyph = (
        <>
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.2" fill="#2f8cff" />
          <path d="M4.4 10.9 9.8 5.5m-1.3-1.2 2.4 2.4M7 12l2.2-2.2" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" />
        </>
      )
      break
    case 'Safari':
      glyph = (
        <>
          <circle cx="8" cy="8" r="6.6" fill="#eaf5ff" stroke="#1684d8" strokeWidth="1.2" />
          <path d="m10.7 5.3-1.6 3.8-3.8 1.6 1.6-3.8z" fill="#f24b4b" />
        </>
      )
      break
    case 'Figma':
      glyph = (
        <>
          <path d="M5.3 1.6h2.7v4H5.3a2 2 0 1 1 0-4z" fill="#f24e1e" />
          <path d="M8 1.6h2.7a2 2 0 1 1 0 4H8z" fill="#ff7262" />
          <path d="M5.3 5.7h2.7v4H5.3a2 2 0 1 1 0-4z" fill="#a259ff" />
          <circle cx="10.7" cy="7.7" r="2" fill="#1abcfe" />
          <path d="M5.3 9.8h2.7v2.1a2 2 0 1 1-2.7-2.1z" fill="#0acf83" />
        </>
      )
      break
    case 'Codex':
      glyph = (
        <>
          <circle cx="8" cy="8" r="6.5" fill="#16181d" stroke="#f4f5f7" strokeWidth="1.1" />
          <path d="M5 6.2h6M5 9.8h6M8 4v8" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".85" />
        </>
      )
      break
    default:
      glyph = (
        <>
          <rect x="1.4" y="1.4" width="13.2" height="13.2" rx="3.2" fill="#fb4d6d" />
          <path d="M9.7 3.9v6.2a2.5 2.5 0 1 1-1.7-2.4M9.7 4l2.7-.7v2.1L9.7 6" fill="none" stroke="#fff" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )
  }

  return (
    <span className="sp-energy-icon" data-app={app} aria-hidden>
      <svg viewBox="0 0 16 16">{glyph}</svg>
    </span>
  )
}

/** A static native action glyph. The browser panel previews App content and
 * must not offer writes, focus stops, or pressed-state affordances. */
function StaticGear() {
  return (
    <span className="sp-static-glyph" aria-hidden>
      <GearIcon />
    </span>
  )
}

function RefreshGlyph() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.2 8A8 8 0 1 0 20 14" />
      <path d="M19.2 3.5V8h-4.5" />
    </svg>
  )
}

function RadioPowerGlyph() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0" />
    </svg>
  )
}

function EllipsisIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg {...S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19.5 4.5C12 4.5 6 8.2 6 14.2c0 2.9 2.1 5.3 5.2 5.3 6 0 8.3-7.1 8.3-15z" />
      <path d="M4.5 20c2.8-5.4 6.5-8.8 11.4-11.2" />
    </svg>
  )
}

/** One native summary/detail row: glyph, title/subtitle, and static trailing art. */
function Row(props: {
  icon: ReactNode
  title: string
  sub?: string
  dim?: boolean
  actions?: ReactNode
  statusLabel?: string
}) {
  return (
    <div className="sp-row">
      <span className="sp-ico" aria-hidden>{props.icon}</span>
      <span className={'sp-main' + (props.dim ? ' is-dim' : '')}>
        <span className="sp-title">{props.title}</span>
        {props.sub ? <span className="sp-sub">{props.sub}</span> : null}
        {props.statusLabel ? (
          <span className="sp-visually-hidden">{props.statusLabel}</span>
        ) : null}
      </span>
      {props.actions ? <span className="sp-actions" aria-hidden>{props.actions}</span> : null}
    </div>
  )
}

/** Device/input/output row. Every native list uses the same circle marker;
 * audio selection and Bluetooth connection both fill it with the product blue. */
function DeviceRow(props: {
  icon: ReactNode
  name: string
  meta?: string
  circle?: boolean
  selected?: boolean
  markerActive?: boolean
  dim?: boolean
  statusLabel?: string
}) {
  const markerActive = props.markerActive ?? props.selected
  return (
    <div className={
      'sp-row sp-dev' +
      (props.dim ? ' is-dim' : '') +
      (props.selected ? ' is-selected' : '')
    }>
      <span className={
        'sp-ico' +
        (props.circle ? ' is-circle' : '') +
        (markerActive ? ' is-selected' : '')
      } aria-hidden>
        {props.icon}
      </span>
      <span className="sp-main">
        <span className="sp-title">{props.name}</span>
        {props.statusLabel ? (
          <span className="sp-visually-hidden">{props.statusLabel}</span>
        ) : null}
      </span>
      <span className="sp-actions">
        {props.meta ? <span className="sp-meta">{props.meta}</span> : null}
      </span>
    </div>
  )
}

function DetailHeader(props: {
  title: string
  back: string
  onBack: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <button
      type="button"
      className="sp-detail-head"
      ref={props.buttonRef}
      aria-label={`${props.back}: ${props.title}`}
      onClick={props.onBack}
    >
      <BackIcon />
      <span className="sp-detail-title">{props.title}</span>
    </button>
  )
}

/** Native audio rows are one compact line: mute glyph, track, percentage, gear. */
function AudioControlRow(props: {
  icon: ReactNode
  label: string
  value: number
  muted: boolean
  mutedLabel: string
  available?: boolean
}) {
  const available = props.available !== false
  const value = Math.max(0, Math.min(100, Math.round(props.value)))
  const valueLabel = available ? `${value}%` : '—'
  const accessibleValue = !available
    ? valueLabel
    : `${valueLabel}${props.muted ? ` · ${props.mutedLabel}` : ''}`

  return (
    <div
      className={'sp-audio-control' + (props.muted ? ' is-muted' : '') + (!available ? ' is-unavailable' : '')}
      role="img"
      aria-label={`${props.label}: ${accessibleValue}`}
    >
      <span className="sp-audio-mute" aria-hidden>{props.icon}</span>
      <span className="sp-audio-track" aria-hidden>
        <span style={{ width: available ? `${value}%` : '0%' }}>
          {available ? <span className="sp-audio-thumb" /> : null}
        </span>
      </span>
      <span className="sp-audio-value" aria-hidden>{valueLabel}</span>
      <span className="sp-audio-gear" aria-hidden><GearIcon /></span>
    </div>
  )
}

function StaticSettingsRow({ children }: { children: ReactNode }) {
  return <div className="sp-static-action-row">{children}</div>
}

type DetailPage = 'summary' | 'battery' | 'network' | 'inputSource'

interface SectionFrameProps {
  children: ReactNode
  divider: boolean
}

function SectionFrame({ children, divider }: SectionFrameProps) {
  return (
    <div className={'sp-sec' + (divider ? ' sp-sec--divided' : '')}>
      {children}
    </div>
  )
}

/**
 * Read-only browser reproduction of the native status popover. The summary can
 * open three local detail pages, but every switch, slider, radio action, device
 * action, and settings affordance is presentation only. Display values come from
 * the same shared page state used by Settings and the menu-bar icon.
 */
export function StatusPanel({ state }: Props) {
  const { t } = useI18n()
  const p = t.statusPanel
  const [detail, setDetail] = useState<DetailPage>('summary')
  const panelRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const sectionTriggerRefs = useRef<
    Partial<Record<Exclude<DetailPage, 'summary'>, HTMLButtonElement | null>>
  >({})
  const returnDetailRef = useRef<Exclude<DetailPage, 'summary'> | null>(null)
  const focusDetailOnOpen = useRef(false)
  const headingId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (detail !== 'summary') panelRef.current?.scrollTo({ top: 0 })
  }, [detail])

  useLayoutEffect(() => {
    if (detail === 'summary' && returnDetailRef.current) {
      sectionTriggerRefs.current[returnDetailRef.current]?.focus({ preventScroll: true })
      returnDetailRef.current = null
      return
    }
    if (detail !== 'summary' && focusDetailOnOpen.current) {
      focusDetailOnOpen.current = false
      backRef.current?.focus({ preventScroll: true })
    }
  }, [detail])

  const openDetail = (
    page: Exclude<DetailPage, 'summary'>,
    trigger: HTMLButtonElement,
  ) => {
    returnDetailRef.current = page
    sectionTriggerRefs.current[page] = trigger
    focusDetailOnOpen.current = true
    setDetail(page)
  }

  const closeDetail = () => setDetail('summary')

  const visibleSections = state.panelSectionOrder.filter(
    (id) => state.panelSectionVisibility[id],
  )
  const powerFlow = batteryPowerFlowValues(state.batteryPower)
  const wifiAssociated = wifiLinkIsAssociated(state)
  const wifiRssi = wifiExampleRssi(state)
  const localIPAddress = '192.168.1.42'
  const connectedBluetooth = state.bluetoothDevices.filter((device) => device.connected)
  const disconnectedBluetooth = state.bluetoothDevices.filter((device) => !device.connected)
  const volumeAvailable = volumeControlsAreEditable(state)
  const bluetoothSub = !state.bluetoothPower
    ? p.bluetoothOff
    : connectedBluetooth.length === 0
      ? p.noBluetoothAudio
      : state.showBluetoothDeviceList
        ? undefined
        : connectedBluetooth.map((device) => p.devices[device.id]).join(' · ')

  const batterySub =
    state.batteryPower === 'charging'
      ? p.charging
      : state.batteryPower === 'pluggedIn'
        ? state.lowPower
          ? p.lowPowerPluggedIn
          : p.pluggedIn
        : state.lowPower
          ? p.lowPower
          : p.onBattery

  const networkTitle =
    state.networkKind === 'ethernet'
      ? p.ethernet
      : state.wifiState === 'connected'
        ? p.wifiName
        : p.wifiState[state.wifiState]

  const networkSubParts: string[] = []
  if (state.networkKind === 'ethernet') {
    if (state.localIPVisible) networkSubParts.push(localIPAddress)
    networkSubParts.push(p.ethernetLink)
  } else if (wifiAssociated) {
    if (state.localIPVisible) networkSubParts.push(localIPAddress)
    if (wifiRssi !== undefined) networkSubParts.push(`5 GHz · ${wifiRssi} dBm`)
  }
  const networkSub = networkSubParts.length > 0 ? networkSubParts.join(' · ') : undefined

  const chargeState =
    state.chargeDemoPhase === 'charging'
      ? p.batteryDetails.chargeStateCharging
      : state.chargeDemoPhase === 'complete'
        ? p.batteryDetails.chargeStateComplete
        : state.chargeDemoPhase === 'restored'
          ? p.batteryDetails.chargeStateRestored
          : undefined

  if (detail === 'battery') {
    const showsPowerMetric =
      state.showChargerInputPower ||
      state.showBatteryChargingPower ||
      state.showSystemPower

    return (
      <div
        className="sp card"
        id="status-panel"
        ref={panelRef}
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
      >
        <h2 className="sp-visually-hidden" id={headingId}>{p.batteryDetails.title}</h2>
        <p className="sp-visually-hidden" id={descriptionId}>{p.readOnlyPreview}</p>
        <DetailHeader
          title={`${p.battery} · ${state.battery}%`}
          back={p.back}
          onBack={closeDetail}
          buttonRef={backRef}
        />

        {powerFlow && showsPowerMetric ? (
          <section className="sp-power-section" aria-labelledby={`${headingId}-power-flow`}>
            <h3 className="sp-visually-hidden" id={`${headingId}-power-flow`}>
              {p.batteryDetails.powerFlow}
            </h3>
            <BatteryPowerFlow
              flow={powerFlow}
              showInput={state.showChargerInputPower}
              showBattery={state.showBatteryChargingPower}
              showSystem={state.showSystemPower}
              labels={{
                input: p.batteryDetails.powerInput,
                battery: p.batteryDetails.powerBattery,
                system: p.batteryDetails.powerSystem,
              }}
            />
          </section>
        ) : null}

        <dl className="sp-battery-metrics">
          <div>
            <dt>{p.batteryDetails.condition}</dt>
            <dd>{p.batteryDetails.normal}</dd>
          </div>
          <div>
            <dt>{p.batteryDetails.maximumCapacity}</dt>
            <dd>91%</dd>
          </div>
          <div>
            <dt>{p.batteryDetails.cycleCount}</dt>
            <dd>184</dd>
          </div>
          <div>
            <dt>{p.batteryDetails.adapter}</dt>
            <dd>
              {state.batteryPower === 'battery'
                ? p.batteryDetails.none
                : `67 W · ${p.batteryDetails.connected}`}
            </dd>
          </div>
          <div>
            <dt>{p.batteryDetails.chargingState}</dt>
            <dd>{batterySub}</dd>
          </div>
        </dl>

        {powerFlow && showsPowerMetric ? (
          <p className="sp-note sp-estimate-note">{p.batteryDetails.powerFlowEstimate}</p>
        ) : null}

        {state.showHighEnergyApps ? (
          <section className="sp-detail-block sp-energy-section" aria-labelledby={`${headingId}-energy`}>
            <h3 className="sp-detail-section" id={`${headingId}-energy`}>
              {p.batteryDetails.highEnergyApps}
            </h3>
            <div className="sp-energy-list">
              {HIGH_ENERGY_EXAMPLES.map((example) => (
                <div className="sp-energy-row" key={example.app}>
                  <EnergyAppIcon app={example.app} />
                  <span className="sp-energy-name">{example.app}</span>
                  <span className="sp-energy-value">{example.value}</span>
                </div>
              ))}
            </div>
            <p className="sp-note">{p.batteryDetails.energyBasis}</p>
          </section>
        ) : null}

        <section className="sp-detail-block sp-low-power-block">
          <div
            className="sp-static-switch-row"
            role="img"
            aria-label={`${p.lowPower}: ${state.lowPower ? p.on : p.off}`}
          >
            <span aria-hidden>{p.lowPower}</span>
            <span
              className={'sp-switch-track' + (state.lowPower ? ' is-on' : '')}
              aria-hidden
            >
              <span />
            </span>
          </div>
        </section>

        {state.showChargeToFull ? (
          <section className="sp-charge-static">
            <div
              className="sp-static-charge"
              role="img"
              aria-label={chargeState ?? p.batteryDetails.chargeActionIdle}
            >
              <span aria-hidden>{chargeState ?? p.batteryDetails.chargeActionIdle}</span>
            </div>
          </section>
        ) : null}

        <div className="sp-panel-actions">
          <StaticSettingsRow>{p.openSystemPowerSettings}</StaticSettingsRow>
          <StaticSettingsRow>{p.openAppBatterySettings}</StaticSettingsRow>
        </div>
      </div>
    )
  }

  if (detail === 'network') {
    return (
      <div
        className="sp card"
        id="status-panel"
        ref={panelRef}
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
      >
        <h2 className="sp-visually-hidden" id={headingId}>{p.networkDetails.title}</h2>
        <p className="sp-visually-hidden" id={descriptionId}>{p.readOnlyPreview}</p>
        <DetailHeader
          title={p.networkDetails.title}
          back={p.back}
          onBack={closeDetail}
          buttonRef={backRef}
        />

        <div className="sp-network-power">
          <span>{p.networkDetails.connection}</span>
          <span className="sp-status-text">
            {state.networkKind === 'ethernet'
              ? p.networkDetails.connected
              : p.wifiState[state.wifiState]}
          </span>
        </div>

        {state.networkKind === 'wifi' ? (
          <>
            <h3 className="sp-detail-section">{p.networkDetails.knownNetworks}</h3>
            <div className="sp-network-list" role="list">
              {[
                { value: 'connected' as const, name: p.wifiName, note: p.networkDetails.connectedLocked },
                { value: 'noInternet' as const, name: p.networkDetails.openNetwork, note: p.networkDetails.open },
                { value: 'notAssociated' as const, name: p.wifiState.notAssociated, note: undefined },
              ].map((item) => {
                const selected = state.wifiState === item.value
                return (
                  <div
                    className={'sp-network-row sp-static-network-row' + (selected ? ' is-selected' : '')}
                    role="listitem"
                    key={item.value}
                  >
                    <span aria-hidden>{selected ? <CheckIcon /> : <WifiIcon />}</span>
                    <span className="sp-network-row-main">
                      <span>{item.name}</span>
                      {item.note ? <span className="sp-sub">{item.note}</span> : null}
                      {selected ? (
                        <span className="sp-visually-hidden">{p.currentNetwork}</span>
                      ) : null}
                    </span>
                  </div>
                )
              })}
            </div>
            <dl className="sp-details">
              <div>
                <dt>{p.networkDetails.status}</dt>
                <dd>{p.wifiState[state.wifiState]}</dd>
              </div>
              {wifiAssociated ? (
                <>
                  <div>
                    <dt>{p.networkDetails.rssi}</dt>
                    <dd>{wifiRssi} dBm</dd>
                  </div>
                  <div>
                    <dt>{p.networkDetails.channel}</dt>
                    <dd>149 · 5 GHz</dd>
                  </div>
                  <div>
                    <dt>{p.networkDetails.localIP}</dt>
                    <dd>{localIPAddress}</dd>
                  </div>
                </>
              ) : null}
            </dl>
          </>
        ) : (
          <dl className="sp-details">
            <div>
              <dt>{p.networkDetails.link}</dt>
              <dd>{p.networkDetails.connected}</dd>
            </div>
            <div>
              <dt>{p.networkDetails.speed}</dt>
              <dd>1 Gbit/s</dd>
            </div>
            <div>
              <dt>{p.networkDetails.localIP}</dt>
              <dd>{localIPAddress}</dd>
            </div>
          </dl>
        )}

        <div className="sp-panel-actions">
          <StaticSettingsRow>{p.openNetworkSettings}</StaticSettingsRow>
        </div>
      </div>
    )
  }

  if (detail === 'inputSource') {
    const rows = (['english', 'pinyin', 'japanese'] as const).map((id) => ({
      id,
      marker: id === 'english' ? 'A' : id === 'pinyin' ? '拼' : 'あ',
    }))

    return (
      <div
        className="sp card"
        id="status-panel"
        ref={panelRef}
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
      >
        <h2 className="sp-visually-hidden" id={headingId}>{p.inputSource}</h2>
        <p className="sp-visually-hidden" id={descriptionId}>{p.readOnlyPreview}</p>
        <DetailHeader
          title={p.inputSource}
          back={p.back}
          onBack={closeDetail}
          buttonRef={backRef}
        />

        <div className="sp-input-list" role="list">
          {rows.map((row) => {
            const selected = state.inputSource === row.id
            return (
              <div
                className={'sp-input-list-row' + (selected ? ' is-selected' : '')}
                role="listitem"
                key={row.id}
              >
                <span className="sp-input-marker" aria-hidden>{row.marker}</span>
                <span className="sp-input-list-name">{p.inputSources[row.id]}</span>
                {selected ? (
                  <span className="sp-visually-hidden">{p.currentInputSource}</span>
                ) : null}
                {selected ? <span className="sp-check" aria-hidden><CheckIcon /></span> : null}
              </div>
            )
          })}
        </div>

        <div className="sp-panel-actions">
          <StaticSettingsRow>{p.openKeyboardSettings}</StaticSettingsRow>
        </div>
      </div>
    )
  }

  return (
    <div
      className="sp card"
      id="status-panel"
      ref={panelRef}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      <h2 className="sp-visually-hidden" id={headingId}>{p.title}</h2>
      <p className="sp-visually-hidden" id={descriptionId}>{p.readOnlyPreview}</p>
      {visibleSections.length === 0 ? <p className="sp-empty">{p.noSections}</p> : null}

      {visibleSections.map((section, index) => {
        const divider = index > 0
        if (section === 'battery') {
          return (
            <SectionFrame key={section} divider={divider}>
              <div className="sp-row">
                <button
                  type="button"
                  className="sp-row-main"
                  ref={(node) => {
                    sectionTriggerRefs.current.battery = node
                  }}
                  onClick={(event) => openDetail('battery', event.currentTarget)}
                >
                  <span className="sp-ico" aria-hidden>
                    <BatteryIcon level={state.battery} power={state.batteryPower} />
                  </span>
                  <span className="sp-main">
                    <span className="sp-title">{p.battery} · {state.battery}%</span>
                    <span className="sp-sub">{batterySub}</span>
                  </span>
                  {state.lowPower ? (
                    <span className="sp-summary-leaf" aria-hidden><LeafIcon /></span>
                  ) : null}
                  <ChevronIcon />
                </button>
                <StaticGear />
              </div>
            </SectionFrame>
          )
        }
        if (section === 'network') {
          return (
            <SectionFrame key={section} divider={divider}>
              <div className="sp-row">
                <button
                  type="button"
                  className="sp-row-main"
                  ref={(node) => {
                    sectionTriggerRefs.current.network = node
                  }}
                  onClick={(event) => openDetail('network', event.currentTarget)}
                >
                  <span className="sp-ico" aria-hidden>
                    {state.networkKind === 'ethernet' ? <EthernetIcon /> : <WifiIcon />}
                  </span>
                  <span className={'sp-main' + (state.wifiState === 'off' && state.networkKind === 'wifi' ? ' is-dim' : '')}>
                    <span className="sp-title">{networkTitle}</span>
                    {networkSub ? <span className="sp-sub">{networkSub}</span> : null}
                  </span>
                  <ChevronIcon />
                </button>
                <StaticGear />
              </div>
            </SectionFrame>
          )
        }
        if (section === 'vpn') {
          return (
            <SectionFrame key={section} divider={divider}>
              <Row icon={<ProxyIcon />} title={p.proxy} sub={p.proxyExample} />
            </SectionFrame>
          )
        }
        if (section === 'bluetooth') {
          return (
            <SectionFrame key={section} divider={divider}>
              <Row
                icon={<BtIcon />}
                title={p.bluetooth}
                sub={bluetoothSub}
                actions={
                  <>
                    {state.showsBluetoothPowerControl ? (
                      <span className={'sp-radio-glyph' + (state.bluetoothPower ? ' is-on' : '')}>
                        <RadioPowerGlyph />
                      </span>
                    ) : null}
                    <RefreshGlyph />
                    <GearIcon />
                  </>
                }
                statusLabel={`${p.bluetoothPowerState}: ${state.bluetoothPower ? p.on : p.off}`}
              />
              {!state.bluetoothPower ? null : state.showBluetoothDeviceList ? (
                <>
                  {[...connectedBluetooth, ...disconnectedBluetooth].map((device) => (
                    <DeviceRow
                      key={device.id}
                      icon={
                        device.kind === 'headphones' ? (
                          <HeadphoneIcon />
                        ) : device.kind === 'speaker' ? (
                          <SpeakerIcon />
                        ) : (
                          <EarbudIcon />
                        )
                      }
                      name={p.devices[device.id]}
                      meta={state.showBluetoothLevels ? `${device.battery}%` : undefined}
                      circle
                      markerActive={device.connected}
                      selected={device.connected}
                      dim={!device.connected}
                      statusLabel={device.connected ? p.connected : undefined}
                    />
                  ))}
                  {state.showAppleDevicesAndBattery ? (
                    <>
                      <DeviceRow
                        icon={<AppleDeviceIcon />}
                        name={p.appleWatchExample}
                        meta="71%"
                        circle
                        dim
                      />
                      <DeviceRow
                        icon={<AppleDeviceIcon />}
                        name={p.iPhoneExample}
                        meta="62%"
                        circle
                        dim
                      />
                    </>
                  ) : null}
                </>
              ) : null}
            </SectionFrame>
          )
        }
        if (section === 'volume') {
          return (
            <SectionFrame key={section} divider={divider}>
              <AudioControlRow
                icon={<VolumeMutedIcon muted={state.muted} />}
                label={p.volume}
                value={state.volume}
                muted={state.muted}
                mutedLabel={p.muted}
                available={volumeAvailable}
              />
              <div className="sp-device-list" role="list">
                {AUDIO_OUTPUTS.map((candidate) => {
                  const available =
                    !isBluetoothOutputId(candidate.id) ||
                    (state.bluetoothPower &&
                      state.bluetoothDevices.find((device) => device.id === candidate.id)?.connected)
                  const selected = state.selectedOutputId === candidate.id
                  return (
                    <div role="listitem" key={candidate.id}>
                      <DeviceRow
                        circle
                        icon={
                          candidate.id === 'macbookSpeakers' ? (
                            <SpeakerIcon />
                          ) : candidate.id === 'deskDisplay' ? (
                            <DisplayIcon />
                          ) : candidate.kind === 'headphones' ? (
                            <HeadphoneIcon />
                          ) : candidate.kind === 'speaker' ? (
                            <SpeakerIcon />
                          ) : (
                            <EarbudIcon />
                          )
                        }
                        name={p.outputs[candidate.id]}
                        meta={selected && volumeAvailable ? `${state.volume}%` : undefined}
                        selected={selected}
                        dim={!available}
                        statusLabel={selected ? p.selected : undefined}
                      />
                    </div>
                  )
                })}
              </div>
            </SectionFrame>
          )
        }
        if (section === 'audioInput') {
          return (
            <SectionFrame key={section} divider={divider}>
              <AudioControlRow
                icon={<MicIcon blue={!state.inputMuted} />}
                label={p.inputVolume}
                value={state.inputVolume}
                muted={state.inputMuted}
                mutedLabel={p.muted}
              />
              <div className="sp-device-list" role="list">
                {([
                  ['macbookMicrophone', p.micBook],
                  ['headsetMicrophone', p.headsetMic],
                ] as [AudioInputId, string][]).map(([id, name]) => {
                  const available = id !== 'headsetMicrophone' || headsetInputIsAvailable(state)
                  return (
                    <div role="listitem" key={id}>
                      <DeviceRow
                        circle
                        icon={<MicIcon />}
                        name={name}
                        selected={state.selectedInputId === id}
                        dim={!available}
                        statusLabel={state.selectedInputId === id ? p.selected : undefined}
                      />
                    </div>
                  )
                })}
              </div>
            </SectionFrame>
          )
        }
        if (section === 'inputSource') {
          return (
            <SectionFrame key={section} divider={divider}>
              <div className="sp-row">
                <button
                  type="button"
                  className="sp-row-main"
                  ref={(node) => {
                    sectionTriggerRefs.current.inputSource = node
                  }}
                  onClick={(event) => openDetail('inputSource', event.currentTarget)}
                >
                  <span className="sp-ico" aria-hidden><KeyboardIcon /></span>
                  <span className="sp-main">
                    <span className="sp-title">{p.inputSource}</span>
                    <span className="sp-sub">{p.inputSources[state.inputSource]}</span>
                  </span>
                  <ChevronIcon />
                </button>
                <StaticGear />
              </div>
            </SectionFrame>
          )
        }
        return null
      })}

      <div className="sp-footer">
        <span className="sp-footer-settings">
          <span className="sp-static-glyph" aria-hidden><GearIcon /></span>
          <span>{p.settings}</span>
        </span>
        <span className="sp-ver">{RELEASE.tag.slice(1)}</span>
        <span className="sp-static-glyph" aria-hidden><EllipsisIcon /></span>
      </div>
    </div>
  )
}

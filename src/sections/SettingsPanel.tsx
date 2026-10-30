import { useEffect, useId, useRef, type ReactNode } from 'react'
import { APP, RELEASE } from '../app'
import {
  AUDIO_OUTPUTS,
  HIGH_ENERGY_EXAMPLES,
  PANEL_SECTIONS,
  activeVolumeSource,
  batteryPowerFlowValues,
  externalVolumeConfigurationIsEditable,
  patchBluetoothIconReplacement,
  patchChargeDemoVisibility,
  patchSelectedInput,
  patchSelectedOutput,
  volumeControlsAreEditable,
  clamp,
  type AppIconPlacement,
  type AudioInputId,
  type AudioOutputId,
  type BatteryPowerMode,
  type BetterDisplayAssociation,
  type BetterDisplayDisplayId,
  type BetterDisplayRuntime,
  type BluetoothGlyph,
  type ConnectionCenterSource,
  type DockBackgroundPreference,
  type ExternalVolumeBackend,
  type InputSourceId,
  type NetworkKind,
  type RingStrokeStyle,
  type StatusIconState,
  type VolumeDisplayStyle,
  type WifiState,
} from '../status/StatusIcon'
import {
  DockPreview,
  PlacementPreview,
  RingPreview,
  SettingsPictureRow,
  VolumePreview,
} from '../status/SettingsPictureRow'
import { Segmented, Select, Slider, Toggle } from '../status/controls'
import { useI18n } from '../i18n'
import { AppLogo } from '../components/AppLogo'

export type SettingsCategoryId =
  | 'appIcon'
  | 'battery'
  | 'network'
  | 'bluetooth'
  | 'audio'
  | 'panel'
  | 'general'
  | 'about'

const CATEGORY_ORDER: SettingsCategoryId[] = [
  'appIcon',
  'battery',
  'network',
  'bluetooth',
  'audio',
  'panel',
  'general',
  'about',
]

interface Props {
  state: StatusIconState
  activeCategory: SettingsCategoryId
  scrollRequest: number
  onChange: (patch: Partial<StatusIconState>) => void
  onSelectCategory: (category: SettingsCategoryId) => void
}

function SectionGroup(props: { title?: string; children: ReactNode; footnote?: string }) {
  return (
    <section className="set-group">
      {props.title ? <h3 className="set-group-title">{props.title}</h3> : null}
      <div className="set-group-body">{props.children}</div>
      {props.footnote ? <p className="set-footnote">{props.footnote}</p> : null}
    </section>
  )
}

function Hint(props: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return <p className={'set-hint' + (props.tone === 'warn' ? ' is-warn' : '')}>{props.children}</p>
}

function PictureRowGlyph({ kind }: { kind: 'ring' | 'dock' | 'waveform' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      {kind === 'ring' ? (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4" />
        </>
      ) : kind === 'waveform' ? (
        <path d="M3 11.5v1M6 8.5v7M9 5.5v13M12 9.5v5M15 4v16M18 7v10M21 10.5v3" />
      ) : (
        <>
          <rect x="3" y="6" width="18" height="12" rx="3" />
          <path d="M7 12h10" />
        </>
      )}
    </svg>
  )
}

function CategoryGlyph({ category }: { category: SettingsCategoryId }) {
  const paths: Record<SettingsCategoryId, ReactNode> = {
    appIcon: (
      <>
        <rect x="3" y="5" width="18" height="13" rx="2.5" />
        <path d="M6 22h12M9 18v4M15 18v4" />
      </>
    ),
    battery: (
      <>
        <rect x="3" y="7" width="16" height="10" rx="3" />
        <path d="M21 10v4M7 11v2M10 11v2" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
        <path d="M8.5 14.5a5 5 0 0 1 7 0M5.5 11a9.2 9.2 0 0 1 13 0M2.5 7.5a14 14 0 0 1 19 0" />
      </>
    ),
    bluetooth: <path d="M7 7.5l10 9-5 4.5V3l5 4.5-10 9" />,
    audio: (
      <>
        <path d="M5 9v6M9 6v12M13 8v8M17 10.5v3" />
        <path d="M20 7l1-1M21 12h1M20 17l1 1" />
      </>
    ),
    panel: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </>
    ),
    general: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
      </>
    ),
    about: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10.5v6M12 7.5h.01" />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      {paths[category]}
    </svg>
  )
}

/** Browser-only settings reproduction. Every enabled control changes the menu
 * bar, Dock preview, or status panel. Native-only capabilities are described
 * as capabilities rather than shown as fake controls. */
export function SettingsPanel({
  state,
  activeCategory,
  scrollRequest,
  onChange,
  onSelectCategory,
}: Props) {
  const { t } = useI18n()
  const p = t.settingsDemo
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<SettingsCategoryId, HTMLButtonElement | null>>>({})
  const previousRequest = useRef(scrollRequest)

  useEffect(() => {
    if (previousRequest.current === scrollRequest) return
    previousRequest.current = scrollRequest
    panelRef.current?.scrollIntoView({ block: 'start' })
    tabRefs.current[activeCategory]?.focus({ preventScroll: true })
  }, [activeCategory, scrollRequest])

  const category = p.categories[activeCategory]
  const powerFlow = batteryPowerFlowValues(state.batteryPower)
  const volumeSource = activeVolumeSource(state)
  const volumeEditable = volumeControlsAreEditable(state)
  const externalConfigEditable = externalVolumeConfigurationIsEditable(state)
  const manualDisplayName = p.audio[state.betterDisplayDisplay]
  const wifiStateOptions = (Object.keys(t.wifiState) as WifiState[]).map((value) => ({
    value,
    label: t.wifiState[value],
  }))

  const moveCategoryFocus = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    current: SettingsCategoryId,
  ) => {
    const { key } = event
    const index = CATEGORY_ORDER.indexOf(current)
    const next =
      key === 'Home'
        ? 0
        : key === 'End'
          ? CATEGORY_ORDER.length - 1
          : key === 'ArrowDown'
            ? (index + 1) % CATEGORY_ORDER.length
            : key === 'ArrowUp'
              ? (index - 1 + CATEGORY_ORDER.length) % CATEGORY_ORDER.length
              : -1
    if (next < 0) return
    event.preventDefault()
    const nextCategory = CATEGORY_ORDER[next]
    onSelectCategory(nextCategory)
    tabRefs.current[nextCategory]?.focus({ preventScroll: true })
  }

  return (
    <div className="pg-panel settings-demo card" id="settings-panel" ref={panelRef}>
      <div className="set-layout">
        <nav className="set-sidebar" aria-labelledby={titleId}>
          <h2 className="set-sidebar-title" id={titleId}>
            {p.title}
          </h2>
          <div className="set-tabs" role="tablist" aria-orientation="vertical" aria-label={p.title}>
            {CATEGORY_ORDER.map((id) => (
              <button
                key={id}
                ref={(node) => {
                  tabRefs.current[id] = node
                }}
                type="button"
                role="tab"
                id={`settings-tab-${id}`}
                className="set-tab"
                aria-selected={id === activeCategory}
                aria-controls={`settings-pane-${id}`}
                tabIndex={id === activeCategory ? 0 : -1}
                onClick={() => onSelectCategory(id)}
                onKeyDown={(event) => moveCategoryFocus(event, id)}
              >
                <span className="set-tab-icon" aria-hidden>
                  <CategoryGlyph category={id} />
                </span>
                <span>{p.categories[id].title}</span>
                {id === 'about' ? <span className="set-tab-version">{RELEASE.tag}</span> : null}
              </button>
            ))}
          </div>
        </nav>

        <section
          className="set-content"
          role="tabpanel"
          id={`settings-pane-${activeCategory}`}
          aria-labelledby={`settings-tab-${activeCategory}`}
        >
          <header className="set-head">
            <p className="set-eyebrow">{p.demoLabel}</p>
            <h2>{category.title}</h2>
            <p>{category.desc}</p>
          </header>

          {activeCategory === 'appIcon' ? (
            <>
              <SectionGroup title={p.appIcon.placementTitle}>
                <SettingsPictureRow<AppIconPlacement>
                  title={p.appIcon.placement}
                  subtitle={p.appIcon.placementDescription}
                  label={p.appIcon.placement}
                  value={state.appIconPlacement}
                  options={[
                    { value: 'menuBar', label: p.appIcon.menuBar },
                    { value: 'dock', label: p.appIcon.dock },
                    { value: 'both', label: p.appIcon.both },
                  ]}
                  onChange={(appIconPlacement) => onChange({ appIconPlacement })}
                  glyph={<CategoryGlyph category="appIcon" />}
                  renderPreview={({ value }) => <PlacementPreview placement={value} />}
                />
              </SectionGroup>

              <SectionGroup title={p.appIcon.menuBarGroup}>
                <Slider
                  label={p.appIcon.iconSize}
                  value={state.iconSize}
                  min={16}
                  max={36}
                  display={`${state.iconSize} pt`}
                  onChange={(iconSize) => onChange({ iconSize: Math.round(clamp(iconSize, 16, 36)) })}
                />
                <Hint>{p.appIcon.iconSizeHint}</Hint>
              </SectionGroup>

              <SectionGroup title={p.appIcon.statusIconGroup}>
                <SettingsPictureRow<RingStrokeStyle>
                  title={p.appIcon.ringStroke}
                  subtitle={p.appIcon.ringStrokeDescription}
                  label={p.appIcon.ringStroke}
                  value={state.ringStrokeStyle}
                  options={[
                    { value: 'light', label: p.appIcon.light },
                    { value: 'regular', label: p.appIcon.regular },
                    { value: 'bold', label: p.appIcon.bold },
                  ]}
                  onChange={(ringStrokeStyle) => onChange({ ringStrokeStyle })}
                  glyph={<PictureRowGlyph kind="ring" />}
                  renderPreview={({ value }) => <RingPreview state={state} ringStrokeStyle={value} />}
                />
              </SectionGroup>

              <SectionGroup title={p.appIcon.dockGroup}>
                <SettingsPictureRow<DockBackgroundPreference>
                  title={p.appIcon.dockBackground}
                  subtitle={p.appIcon.dockDescription}
                  label={p.appIcon.dockBackground}
                  value={state.dockBackground}
                  options={[
                    { value: 'system', label: p.appIcon.followSystem },
                    { value: 'dark', label: p.appIcon.dark },
                    { value: 'light', label: p.appIcon.lightBackground },
                  ]}
                  onChange={(dockBackground) => onChange({ dockBackground })}
                  glyph={<PictureRowGlyph kind="dock" />}
                  renderPreview={({ value }) => <DockPreview state={state} background={value} />}
                />
              </SectionGroup>
              <p className="set-picker-hint">{p.appIcon.pickerHint}</p>
            </>
          ) : null}

          {activeCategory === 'battery' ? (
            <>
              <SectionGroup title={p.battery.previewTitle}>
                <Slider
                  label={p.battery.level}
                  value={state.battery}
                  min={0}
                  max={100}
                  display={`${state.battery}%`}
                  onChange={(battery) => onChange({ battery: Math.round(clamp(battery, 0, 100)) })}
                />
                <Select<BatteryPowerMode>
                  label={p.battery.power}
                  value={state.batteryPower}
                  options={[
                    { value: 'battery', label: p.battery.onBattery },
                    { value: 'charging', label: p.battery.charging },
                    { value: 'pluggedIn', label: p.battery.pluggedIn },
                  ]}
                  onChange={(batteryPower) => onChange({ batteryPower })}
                />
                <Toggle
                  label={p.battery.lowPower}
                  note={p.battery.lowPowerNote}
                  pressed={state.lowPower}
                  onToggle={() => onChange({ lowPower: !state.lowPower })}
                />
              </SectionGroup>

              <SectionGroup title={p.battery.displayGroup}>
                <Toggle
                  label={p.battery.showPercentage}
                  pressed={state.showBatteryValue}
                  onToggle={() => onChange({ showBatteryValue: !state.showBatteryValue })}
                />
                <Toggle
                  label={p.battery.connectionSlot}
                  note={p.battery.connectionSlotNote}
                  pressed={state.showBatteryInConnectionSlot}
                  onToggle={() =>
                    onChange({ showBatteryInConnectionSlot: !state.showBatteryInConnectionSlot })
                  }
                />
                <Toggle
                  label={p.battery.showChargingIndicator}
                  pressed={state.showChargingIndicator}
                  onToggle={() =>
                    onChange({ showChargingIndicator: !state.showChargingIndicator })
                  }
                />
              </SectionGroup>

              <SectionGroup title={p.battery.colorsGroup}>
                <Toggle
                  label={p.battery.statusColors}
                  pressed={state.usesBatteryStatusColors}
                  onToggle={() =>
                    onChange({ usesBatteryStatusColors: !state.usesBatteryStatusColors })
                  }
                />
                <Slider
                  label={p.battery.criticalThreshold}
                  value={state.criticalThreshold}
                  min={0}
                  max={100}
                  display={`${state.criticalThreshold}%`}
                  onChange={(criticalThreshold) =>
                    onChange({ criticalThreshold: Math.round(clamp(criticalThreshold, 0, 100)) })
                  }
                />
                <Slider
                  label={p.battery.fullThreshold}
                  value={state.fullThreshold}
                  min={50}
                  max={100}
                  display={`${state.fullThreshold}%`}
                  onChange={(fullThreshold) =>
                    onChange({ fullThreshold: Math.round(clamp(fullThreshold, 50, 100)) })
                  }
                />
                <Hint>{p.battery.fullThresholdHint}</Hint>
              </SectionGroup>

              <SectionGroup title={p.battery.powerFlowGroup}>
                <Toggle
                  label={p.battery.chargerInput}
                  pressed={state.showChargerInputPower}
                  onToggle={() =>
                    onChange({ showChargerInputPower: !state.showChargerInputPower })
                  }
                />
                <Toggle
                  label={p.battery.batteryCharging}
                  pressed={state.showBatteryChargingPower}
                  onToggle={() =>
                    onChange({ showBatteryChargingPower: !state.showBatteryChargingPower })
                  }
                />
                <Toggle
                  label={p.battery.systemPower}
                  pressed={state.showSystemPower}
                  onToggle={() => onChange({ showSystemPower: !state.showSystemPower })}
                />
                <div className="set-demo-list" aria-live="polite">
                  {powerFlow ? (
                    <>
                      {state.showChargerInputPower ? (
                        <span>{powerFlow.chargerInputWatts} W · {p.battery.chargerInput}</span>
                      ) : null}
                      {state.showBatteryChargingPower ? (
                        <span>
                          {powerFlow.batteryChargingWatts} W · {p.battery.batteryCharging}
                        </span>
                      ) : null}
                      {state.showSystemPower ? (
                        <span>{powerFlow.systemWatts} W · {p.battery.systemPower}</span>
                      ) : null}
                      {!state.showChargerInputPower &&
                      !state.showBatteryChargingPower &&
                      !state.showSystemPower ? (
                        <span>{p.battery.powerFlowUnavailable}</span>
                      ) : null}
                    </>
                  ) : (
                    <span>{p.battery.powerFlowOnBattery}</span>
                  )}
                </div>
                <Hint>{p.battery.powerFlowHint}</Hint>
              </SectionGroup>

              <SectionGroup title={p.battery.highEnergyApps}>
                <Toggle
                  label={p.battery.highEnergyApps}
                  note={p.battery.energyHint}
                  pressed={state.showHighEnergyApps}
                  onToggle={() =>
                    onChange({ showHighEnergyApps: !state.showHighEnergyApps })
                  }
                />
                {state.showHighEnergyApps ? (
                  <>
                    <Slider
                      label={p.battery.energyInterval}
                      value={state.energySampleSeconds}
                      min={10}
                      max={60}
                      step={5}
                      display={`${state.energySampleSeconds} s`}
                      onChange={(energySampleSeconds) =>
                        onChange({
                          energySampleSeconds:
                            Math.round(clamp(energySampleSeconds, 10, 60) / 5) * 5,
                        })
                      }
                    />
                    <div className="set-energy-examples">
                      {HIGH_ENERGY_EXAMPLES.map((example) => (
                        <div className="set-energy-row" key={example.app}>
                          <span>{example.app}</span>
                          <span className="set-energy-track" aria-hidden>
                            <span style={{ width: `${example.level}%` }} />
                          </span>
                          <span>{example.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </SectionGroup>

              <SectionGroup title={p.battery.chargeToFull}>
                <Toggle
                  label={p.battery.chargeToFull}
                  note={p.battery.chargeToFullNote}
                  pressed={state.showChargeToFull}
                  onToggle={() =>
                    onChange(
                      patchChargeDemoVisibility(state, !state.showChargeToFull),
                    )
                  }
                />
              </SectionGroup>
            </>
          ) : null}

          {activeCategory === 'network' ? (
            <>
              <SectionGroup title={p.network.previewTitle}>
                <Segmented<NetworkKind>
                  label={p.network.type}
                  value={state.networkKind}
                  options={[
                    { value: 'wifi', label: p.network.wifi },
                    { value: 'ethernet', label: p.network.ethernet },
                  ]}
                  onChange={(networkKind) => onChange({ networkKind })}
                />
                {state.networkKind === 'wifi' ? (
                  <>
                    <Segmented
                      label={p.network.signal}
                      value={state.wifi}
                      options={[
                        { value: 0, label: p.network.none },
                        { value: 1, label: '1' },
                        { value: 2, label: '2' },
                        { value: 3, label: '3' },
                      ]}
                      onChange={(wifi) => onChange({ wifi: clamp(wifi, 0, 3) })}
                    />
                    <Select<WifiState>
                      label={p.network.state}
                      value={state.wifiState}
                      options={wifiStateOptions}
                      onChange={(wifiState) => onChange({ wifiState })}
                    />
                  </>
                ) : null}
                <Toggle
                  label={p.network.localIP}
                  pressed={state.localIPVisible}
                  onToggle={() => onChange({ localIPVisible: !state.localIPVisible })}
                />
              </SectionGroup>

              <SectionGroup title={p.network.centerGroup}>
                <Segmented<ConnectionCenterSource>
                  label={p.network.centerSource}
                  value={state.connectionCenterSource}
                  options={[
                    { value: 'automatic', label: p.network.automatic },
                    { value: 'inputSource', label: p.network.inputSource },
                  ]}
                  onChange={(connectionCenterSource) => onChange({ connectionCenterSource })}
                />
                {state.connectionCenterSource === 'inputSource' ? (
                  <>
                    <Select<InputSourceId>
                      label={p.network.inputExample}
                      value={state.inputSource}
                      options={[
                        { value: 'english', label: p.network.english },
                        { value: 'pinyin', label: p.network.pinyin },
                        { value: 'japanese', label: p.network.japanese },
                      ]}
                      onChange={(inputSource) => onChange({ inputSource })}
                    />
                    <Toggle
                      label={p.network.warningPriority}
                      pressed={state.prioritizeNetworkWarnings}
                      onToggle={() =>
                        onChange({
                          prioritizeNetworkWarnings: !state.prioritizeNetworkWarnings,
                        })
                      }
                    />
                  </>
                ) : null}
                <Hint>{p.network.priorityHint}</Hint>
              </SectionGroup>
            </>
          ) : null}

          {activeCategory === 'bluetooth' ? (
            <>
              <SectionGroup title={p.bluetooth.iconGroup}>
                <Toggle
                  label={p.bluetooth.replaceNetwork}
                  note={p.bluetooth.replaceNetworkNote}
                  pressed={state.btReplace}
                  onToggle={() =>
                    onChange(patchBluetoothIconReplacement(state, !state.btReplace))
                  }
                />
                {state.btReplace ? (
                  <Select<BluetoothGlyph>
                    label={p.bluetooth.glyph}
                    value={state.btGlyph}
                    options={[
                      { value: 'automatic', label: p.bluetooth.automatic },
                      { value: 'earbuds', label: p.bluetooth.earbuds },
                      { value: 'headphones', label: p.bluetooth.headphones },
                      { value: 'speaker', label: p.bluetooth.speaker },
                    ]}
                    onChange={(btGlyph) => onChange({ btGlyph })}
                  />
                ) : null}
                <Toggle
                  label={p.bluetooth.blueVolume}
                  note={p.bluetooth.blueVolumeNote}
                  pressed={state.btVolumeColor}
                  onToggle={() => onChange({ btVolumeColor: !state.btVolumeColor })}
                />
                {state.btReplace ? (
                  <Toggle
                    label={p.bluetooth.warningPriority}
                    pressed={state.btNetworkPriority}
                    onToggle={() => onChange({ btNetworkPriority: !state.btNetworkPriority })}
                  />
                ) : null}
              </SectionGroup>

              <SectionGroup title={p.bluetooth.panelGroup}>
                <Toggle
                  label={p.bluetooth.showInPanel}
                  pressed={state.panelSectionVisibility.bluetooth}
                  onToggle={() =>
                    onChange({
                      panelSectionVisibility: {
                        ...state.panelSectionVisibility,
                        bluetooth: !state.panelSectionVisibility.bluetooth,
                      },
                    })
                  }
                />
                <Toggle
                  label={p.bluetooth.showBattery}
                  pressed={state.showBluetoothLevels}
                  onToggle={() =>
                    onChange({ showBluetoothLevels: !state.showBluetoothLevels })
                  }
                />
                <Toggle
                  label={p.bluetooth.showDeviceList}
                  pressed={state.showBluetoothDeviceList}
                  onToggle={() =>
                    onChange({ showBluetoothDeviceList: !state.showBluetoothDeviceList })
                  }
                />
                <Toggle
                  label={p.bluetooth.powerControl}
                  note={p.bluetooth.powerControlNote}
                  pressed={state.showsBluetoothPowerControl}
                  onToggle={() =>
                    onChange({
                      showsBluetoothPowerControl: !state.showsBluetoothPowerControl,
                    })
                  }
                />
                <Toggle
                  label={p.bluetooth.appleDevices}
                  note={p.bluetooth.appleDevicesNote}
                  pressed={state.showAppleDevicesAndBattery}
                  onToggle={() =>
                    onChange({
                      showAppleDevicesAndBattery: !state.showAppleDevicesAndBattery,
                    })
                  }
                />
                {state.showAppleDevicesAndBattery ? (
                  <div className="set-example-consent">
                    <strong>{p.bluetooth.appleExamples}</strong>
                    <span>{p.bluetooth.applePairingHint}</span>
                  </div>
                ) : null}
                <Hint>{p.bluetooth.permissionHint}</Hint>
              </SectionGroup>
            </>
          ) : null}

          {activeCategory === 'audio' ? (
            <>
              <SectionGroup title={p.audio.displayGroup}>
                <SettingsPictureRow<VolumeDisplayStyle>
                  title={p.audio.style}
                  subtitle={p.audio.styleHint}
                  label={p.audio.style}
                  value={state.volumeStyle}
                  options={[
                    { value: 'dots', label: p.audio.dots },
                    { value: 'arc', label: p.audio.arc },
                  ]}
                  onChange={(volumeStyle) => onChange({ volumeStyle })}
                  optionColumns={2}
                  glyph={<PictureRowGlyph kind="waveform" />}
                  renderPreview={({ value }) => (
                    <VolumePreview state={state} volumeStyle={value} />
                  )}
                />
              </SectionGroup>

              <SectionGroup title={p.audio.outputGroup}>
                <Slider
                  label={p.audio.volume}
                  value={state.volume}
                  min={0}
                  max={100}
                  display={state.muted ? p.audio.muted : `${state.volume}%`}
                  disabled={!volumeEditable}
                  onChange={(volume) => onChange({ volume: Math.round(clamp(volume, 0, 100)) })}
                />
                <Toggle
                  label={p.audio.mute}
                  pressed={state.muted}
                  disabled={!volumeEditable}
                  onToggle={() => onChange({ muted: !state.muted })}
                />
                <Select<AudioOutputId>
                  label={p.audio.output}
                  value={state.selectedOutputId}
                  options={AUDIO_OUTPUTS.map((output) => ({
                    value: output.id,
                    label: p.audio.outputs[output.id],
                  }))}
                  onChange={(selectedOutputId) =>
                    onChange(patchSelectedOutput(state, selectedOutputId))
                  }
                />
                {!volumeEditable ? (
                  <Hint tone="warn">{p.audio.volumeUnavailable}</Hint>
                ) : null}
                {volumeSource === 'directDDC' ? (
                  <Hint tone="warn">{p.audio.ddcHint}</Hint>
                ) : null}
                {volumeSource === 'betterDisplay' ? (
                  <Hint>{p.audio.betterDisplayHint}</Hint>
                ) : null}
              </SectionGroup>

              <SectionGroup title={p.audio.externalGroup}>
                <Segmented<ExternalVolumeBackend>
                  label={p.audio.externalBackend}
                  value={state.externalVolumeBackend}
                  disabled={!externalConfigEditable}
                  options={[
                    { value: 'directDDC', label: p.audio.directDDC },
                    { value: 'betterDisplay', label: p.audio.betterDisplay },
                  ]}
                  onChange={(externalVolumeBackend) => onChange({ externalVolumeBackend })}
                />
                {state.externalVolumeBackend === 'betterDisplay' ? (
                  <>
                    <Segmented<BetterDisplayRuntime>
                      label={p.audio.betterRuntime}
                      value={state.betterDisplayRuntime}
                      disabled={!externalConfigEditable}
                      options={[
                        { value: 'running', label: p.audio.running },
                        { value: 'unavailable', label: p.audio.unavailable },
                      ]}
                      onChange={(betterDisplayRuntime) => onChange({ betterDisplayRuntime })}
                    />
                    <Segmented<BetterDisplayAssociation>
                      label={p.audio.association}
                      value={state.betterDisplayAssociation}
                      disabled={!externalConfigEditable}
                      options={[
                        { value: 'automatic', label: p.audio.automatic },
                        { value: 'manual', label: p.audio.manual },
                      ]}
                      onChange={(betterDisplayAssociation) =>
                        onChange({ betterDisplayAssociation })
                      }
                    />
                    {state.betterDisplayAssociation === 'manual' ? (
                      <Select<BetterDisplayDisplayId>
                        label={p.audio.display}
                        value={state.betterDisplayDisplay}
                        disabled={!externalConfigEditable}
                        options={[
                          { value: 'studioDisplay', label: p.audio.studioDisplay },
                          { value: 'portableDisplay', label: p.audio.portableDisplay },
                        ]}
                        onChange={(betterDisplayDisplay) => onChange({ betterDisplayDisplay })}
                      />
                    ) : null}
                  </>
                ) : null}
                <div className="set-external-status" aria-live="polite">
                  <strong>
                    {volumeSource === 'native'
                      ? p.audio.externalNative
                      : volumeSource === 'directDDC'
                        ? p.audio.externalStandard
                        : volumeSource === 'unavailable'
                          ? p.audio.externalUnavailable
                          : state.betterDisplayAssociation === 'manual'
                            ? p.audio.externalManualReady.replace('{display}', manualDisplayName)
                            : p.audio.externalReady}
                  </strong>
                  <span>{p.audio.externalHint}</span>
                </div>
                {!externalConfigEditable ? (
                  <Hint>{p.audio.externalNeedsDisplay}</Hint>
                ) : null}
              </SectionGroup>

              <SectionGroup title={p.audio.inputGroup}>
                <Slider
                  label={p.audio.inputVolume}
                  value={state.inputVolume}
                  min={0}
                  max={100}
                  display={state.inputMuted ? p.audio.muted : `${state.inputVolume}%`}
                  onChange={(inputVolume) =>
                    onChange({ inputVolume: Math.round(clamp(inputVolume, 0, 100)) })
                  }
                />
                <Toggle
                  label={p.audio.inputMute}
                  pressed={state.inputMuted}
                  onToggle={() => onChange({ inputMuted: !state.inputMuted })}
                />
                <Select<AudioInputId>
                  label={p.audio.input}
                  value={state.selectedInputId}
                  options={[
                    { value: 'macbookMicrophone', label: p.audio.macbookMic },
                    { value: 'headsetMicrophone', label: p.audio.headsetMic },
                  ]}
                  onChange={(selectedInputId) =>
                    onChange(patchSelectedInput(state, selectedInputId))
                  }
                />
              </SectionGroup>
            </>
          ) : null}

          {activeCategory === 'panel' ? (
            <>
              <SectionGroup title={p.panel.itemsGroup} footnote={p.panel.defaults}>
                <div className="set-section-list">
                  {state.panelSectionOrder.map((id, index) => (
                    <div className="set-section-row" key={id}>
                      <Toggle
                        label={p.panel.sections[id]}
                        pressed={state.panelSectionVisibility[id]}
                        onToggle={() =>
                          onChange({
                            panelSectionVisibility: {
                              ...state.panelSectionVisibility,
                              [id]: !state.panelSectionVisibility[id],
                            },
                          })
                        }
                      />
                      <div className="set-order-buttons">
                        <button
                          type="button"
                          className="set-order-btn"
                          disabled={index === 0}
                          aria-label={`${p.panel.moveUp}: ${p.panel.sections[id]}`}
                          onClick={() => {
                            const order = [...state.panelSectionOrder]
                            ;[order[index - 1], order[index]] = [order[index], order[index - 1]]
                            onChange({ panelSectionOrder: order })
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="set-order-btn"
                          disabled={index === state.panelSectionOrder.length - 1}
                          aria-label={`${p.panel.moveDown}: ${p.panel.sections[id]}`}
                          onClick={() => {
                            const order = [...state.panelSectionOrder]
                            ;[order[index + 1], order[index]] = [order[index], order[index + 1]]
                            onChange({ panelSectionOrder: order })
                          }}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionGroup>
              <SectionGroup title={p.panel.demoPresetGroup}>
                <button
                  type="button"
                  className="set-action"
                  onClick={() =>
                    onChange({
                      panelSectionOrder: [...PANEL_SECTIONS],
                      panelSectionVisibility: {
                        battery: true,
                        network: true,
                        vpn: true,
                        bluetooth: true,
                        volume: true,
                        audioInput: true,
                        inputSource: true,
                      },
                    })
                  }
                >
                  {p.panel.enableAll}
                </button>
                <button
                  type="button"
                  className="set-action"
                  onClick={() =>
                    onChange({
                      panelSectionOrder: [...PANEL_SECTIONS],
                      panelSectionVisibility: {
                        battery: true,
                        network: true,
                        vpn: true,
                        bluetooth: false,
                        volume: true,
                        audioInput: false,
                        inputSource: false,
                      },
                    })
                  }
                >
                  {p.panel.nativeDefaults}
                </button>
              </SectionGroup>
            </>
          ) : null}

          {activeCategory === 'general' ? (
            <>
              <SectionGroup title={p.general.nativeGroup}>
                <ul className="set-capability-list">
                  {p.general.capabilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </SectionGroup>
              <SectionGroup title={p.general.privacyGroup}>
                <p className="set-copy">{p.general.privacy}</p>
                <a
                  className="set-link"
                  href={`${APP.repo}/blob/${RELEASE.tag}/docs/privacy-telemetry.md`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {p.general.privacyLink}
                </a>
              </SectionGroup>
              <SectionGroup title={p.general.languageGroup}>
                <p className="set-copy">{p.general.language}</p>
              </SectionGroup>
            </>
          ) : null}

          {activeCategory === 'about' ? (
            <>
              <SectionGroup>
                <div className="set-about">
                  <AppLogo size={64} />
                  <div>
                    <strong>Status Trio</strong>
                    <span>
                      {RELEASE.tag} · build {RELEASE.build}
                    </span>
                    <p>{p.about.description}</p>
                  </div>
                </div>
              </SectionGroup>
              <SectionGroup title={p.about.factsGroup}>
                <ul className="set-capability-list">
                  {p.about.facts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="set-links">
                  <a className="set-link" href={APP.repo} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a className="set-link" href={APP.site} target="_blank" rel="noreferrer">
                    {p.about.website}
                  </a>
                  <a className="set-link" href={APP.releases} target="_blank" rel="noreferrer">
                    {t.footer.links.releases}
                  </a>
                </div>
              </SectionGroup>
            </>
          ) : null}

          {activeCategory === 'appIcon' ? null : (
            <p className="set-panel-hint">{p.browserOnly}</p>
          )}
        </section>
      </div>
    </div>
  )
}

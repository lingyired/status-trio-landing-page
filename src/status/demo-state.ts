/** Shared in-memory state for the 1.8.0 settings and status-panel demos.
 *
 * Everything here is illustrative. No value is read from, or written to, the
 * host Mac. The shape intentionally follows the native SettingsStore closely
 * enough that the settings, menu bar icon, status panel and Dock preview all
 * stay on one source of truth.
 */

export type WifiState =
  | 'connected'
  | 'notAssociated'
  | 'off'
  | 'noInternet'
  | 'hotspot'
  | 'temporary'
  | 'shared'

export type NetworkKind = 'wifi' | 'ethernet'
export type BatteryPowerMode = 'battery' | 'charging' | 'pluggedIn'
export type AppIconPlacement = 'menuBar' | 'dock' | 'both'
export type RingStrokeStyle = 'light' | 'regular' | 'bold'
export type DockBackgroundPreference = 'system' | 'dark' | 'light'
export type VolumeDisplayStyle = 'dots' | 'arc'
export type ConnectionCenterSource = 'automatic' | 'inputSource'
export type InputSourceId = 'english' | 'pinyin' | 'japanese'
export type BluetoothGlyph = 'automatic' | 'earbuds' | 'headphones' | 'speaker'
export type CenterSymbolMode = 'battery' | 'inputSource' | 'bluetooth' | 'network'
export type ExternalVolumeBackend = 'directDDC' | 'betterDisplay'
export type BetterDisplayRuntime = 'running' | 'unavailable'
export type BetterDisplayAssociation = 'automatic' | 'manual'
export type BetterDisplayDisplayId = 'studioDisplay' | 'portableDisplay'
export type ChargeDemoPhase = 'idle' | 'charging' | 'complete' | 'restored'
export type ActiveVolumeSource = 'native' | 'directDDC' | 'betterDisplay' | 'unavailable'

export type PanelSectionId =
  | 'battery'
  | 'network'
  | 'vpn'
  | 'bluetooth'
  | 'volume'
  | 'audioInput'
  | 'inputSource'

export type BluetoothDeviceId = 'studioHeadphones' | 'pocketEarbuds' | 'deskSpeaker'
export type AudioOutputId =
  | 'macbookSpeakers'
  | 'deskDisplay'
  | BluetoothDeviceId
export type AudioInputId = 'macbookMicrophone' | 'headsetMicrophone'

export type BluetoothDeviceKind = 'headphones' | 'earbuds' | 'speaker'

export interface DemoBluetoothDevice {
  id: BluetoothDeviceId
  kind: BluetoothDeviceKind
  battery: number
  connected: boolean
  notAssociated: boolean
}

export interface AudioOutputDefinition {
  id: AudioOutputId
  kind: 'builtIn' | 'display' | BluetoothDeviceKind
  nativeVolumeWritable: boolean
  supportsVolumeControl: boolean
  ddcRequired?: boolean
}

export interface ChargeDemoSnapshot {
  battery: number
  batteryPower: BatteryPowerMode
}

export interface StatusIconState {
  battery: number
  batteryPower: BatteryPowerMode
  lowPower: boolean
  showBatteryValue: boolean
  showBatteryInConnectionSlot: boolean
  showChargingIndicator: boolean
  usesBatteryStatusColors: boolean
  criticalThreshold: number
  fullThreshold: number
  showChargerInputPower: boolean
  showBatteryChargingPower: boolean
  showSystemPower: boolean
  showHighEnergyApps: boolean
  energySampleSeconds: number
  showChargeToFull: boolean
  chargeDemoPhase: ChargeDemoPhase
  chargeDemoSnapshot: ChargeDemoSnapshot | null

  networkKind: NetworkKind
  wifi: number
  wifiState: WifiState
  localIPVisible: boolean
  connectionCenterSource: ConnectionCenterSource
  inputSource: InputSourceId
  prioritizeNetworkWarnings: boolean

  btReplace: boolean
  btGlyph: BluetoothGlyph
  btVolumeColor: boolean
  btNetworkPriority: boolean
  showBluetoothLevels: boolean
  showBluetoothDeviceList: boolean
  showsBluetoothPowerControl: boolean
  bluetoothPower: boolean
  bluetoothDevices: DemoBluetoothDevice[]
  showAppleDevicesAndBattery: boolean

  volume: number
  muted: boolean
  volumeStyle: VolumeDisplayStyle
  selectedOutputId: AudioOutputId
  selectedInputId: AudioInputId
  inputVolume: number
  inputMuted: boolean
  externalVolumeBackend: ExternalVolumeBackend
  betterDisplayRuntime: BetterDisplayRuntime
  betterDisplayAssociation: BetterDisplayAssociation
  betterDisplayDisplay: BetterDisplayDisplayId

  appIconPlacement: AppIconPlacement
  iconSize: number
  ringStrokeStyle: RingStrokeStyle
  dockBackground: DockBackgroundPreference

  panelSectionOrder: PanelSectionId[]
  panelSectionVisibility: Record<PanelSectionId, boolean>
}

export const PANEL_SECTIONS: PanelSectionId[] = [
  'battery',
  'network',
  'vpn',
  'bluetooth',
  'volume',
  'audioInput',
  'inputSource',
]

export const DEFAULT_BLUETOOTH_DEVICES: DemoBluetoothDevice[] = [
  {
    id: 'studioHeadphones',
    kind: 'headphones',
    battery: 82,
    connected: false,
    notAssociated: false,
  },
  {
    id: 'pocketEarbuds',
    kind: 'earbuds',
    battery: 64,
    connected: true,
    notAssociated: false,
  },
  {
    id: 'deskSpeaker',
    kind: 'speaker',
    battery: 100,
    connected: false,
    notAssociated: false,
  },
]

export const AUDIO_OUTPUTS: AudioOutputDefinition[] = [
  {
    id: 'macbookSpeakers',
    kind: 'builtIn',
    nativeVolumeWritable: true,
    supportsVolumeControl: true,
  },
  {
    id: 'studioHeadphones',
    kind: 'headphones',
    nativeVolumeWritable: true,
    supportsVolumeControl: true,
  },
  {
    id: 'pocketEarbuds',
    kind: 'earbuds',
    nativeVolumeWritable: true,
    supportsVolumeControl: true,
  },
  {
    id: 'deskSpeaker',
    kind: 'speaker',
    nativeVolumeWritable: true,
    supportsVolumeControl: true,
  },
  {
    id: 'deskDisplay',
    kind: 'display',
    nativeVolumeWritable: false,
    supportsVolumeControl: true,
    ddcRequired: true,
  },
]

export interface HighEnergyExample {
  app: string
  value: string
  level: number
}

/** Fixed page values. The browser never samples processes or energy counters. */
export const HIGH_ENERGY_EXAMPLES: HighEnergyExample[] = [
  { app: 'Xcode', value: '62%', level: 100 },
  { app: 'Safari', value: '38%', level: 61 },
  { app: 'Figma', value: '24%', level: 39 },
  { app: 'Codex', value: '17%', level: 27 },
  { app: 'Music', value: '9%', level: 15 },
]

export const DEFAULT_STATUS: StatusIconState = {
  battery: 75,
  batteryPower: 'charging',
  lowPower: false,
  showBatteryValue: true,
  showBatteryInConnectionSlot: false,
  showChargingIndicator: true,
  usesBatteryStatusColors: true,
  criticalThreshold: 20,
  fullThreshold: 100,
  showChargerInputPower: true,
  showBatteryChargingPower: true,
  showSystemPower: true,
  showHighEnergyApps: false,
  energySampleSeconds: 10,
  showChargeToFull: true,
  chargeDemoPhase: 'idle',
  chargeDemoSnapshot: null,

  networkKind: 'wifi',
  wifi: 3,
  wifiState: 'connected',
  localIPVisible: false,
  connectionCenterSource: 'automatic',
  inputSource: 'pinyin',
  prioritizeNetworkWarnings: true,

  btReplace: false,
  btGlyph: 'automatic',
  btVolumeColor: false,
  btNetworkPriority: true,
  showBluetoothLevels: true,
  showBluetoothDeviceList: true,
  showsBluetoothPowerControl: true,
  bluetoothPower: true,
  bluetoothDevices: DEFAULT_BLUETOOTH_DEVICES,
  showAppleDevicesAndBattery: false,

  volume: 75,
  muted: false,
  volumeStyle: 'dots',
  selectedOutputId: 'pocketEarbuds',
  selectedInputId: 'macbookMicrophone',
  inputVolume: 50,
  inputMuted: false,
  externalVolumeBackend: 'directDDC',
  betterDisplayRuntime: 'running',
  betterDisplayAssociation: 'automatic',
  betterDisplayDisplay: 'studioDisplay',

  appIconPlacement: 'menuBar',
  iconSize: 24,
  ringStrokeStyle: 'regular',
  dockBackground: 'system',

  panelSectionOrder: [...PANEL_SECTIONS],
  // The live app starts with Battery, Network, VPN and Volume. The landing
  // demo starts with all seven visible so Bluetooth, audio input and the input
  // source are discoverable; the Status Panel category states that difference.
  panelSectionVisibility: {
    battery: true,
    network: true,
    vpn: true,
    bluetooth: true,
    volume: true,
    audioInput: true,
    inputSource: true,
  },
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number(value)))

export const RING_STROKE_SCALE: Record<RingStrokeStyle, number> = {
  light: 1,
  regular: 1.25,
  bold: 1.5,
}

export const isBluetoothOutputId = (id: AudioOutputId): id is BluetoothDeviceId =>
  id !== 'macbookSpeakers' && id !== 'deskDisplay'

export function selectedOutput(state: StatusIconState): AudioOutputDefinition {
  return AUDIO_OUTPUTS.find((output) => output.id === state.selectedOutputId) ?? AUDIO_OUTPUTS[0]
}

/** Native writable output wins. The demo display can use Standard/DDC, a
 * running BetterDisplay integration, or no writable route. */
export function activeVolumeSource(state: StatusIconState): ActiveVolumeSource {
  const output = selectedOutput(state)
  if (output.nativeVolumeWritable && output.supportsVolumeControl) return 'native'
  if (!output.supportsVolumeControl) return 'unavailable'
  if (output.ddcRequired && state.externalVolumeBackend === 'directDDC') return 'directDDC'
  if (output.ddcRequired && state.betterDisplayRuntime === 'running') return 'betterDisplay'
  return 'unavailable'
}

export function volumeControlsAreEditable(state: StatusIconState): boolean {
  return activeVolumeSource(state) !== 'unavailable'
}

/** The native configuration only applies to a non-native external output.
 * Changing it for a built-in or Bluetooth route has no effect. */
export function externalVolumeConfigurationIsEditable(state: StatusIconState): boolean {
  const output = selectedOutput(state)
  return output.kind === 'display' && !output.nativeVolumeWritable
}

export interface BatteryPowerFlowValues {
  chargerInputWatts: number
  batteryChargingWatts: number
  systemWatts: number
}

/** Coherent page examples for the selected power source. On battery there is
 * no external power flow to display. */
export function batteryPowerFlowValues(
  batteryPower: BatteryPowerMode,
): BatteryPowerFlowValues | null {
  if (batteryPower === 'battery') return null
  return {
    chargerInputWatts: 67,
    batteryChargingWatts: batteryPower === 'charging' ? 42 : 0,
    systemWatts: 21,
  }
}

export function chargeLimitForPhase(phase: ChargeDemoPhase): 80 | 100 {
  return phase === 'charging' || phase === 'complete' ? 100 : 80
}

export function canStartChargeToFull(state: StatusIconState): boolean {
  return state.batteryPower !== 'battery' && state.battery < 100
}

export function patchChargeDemoVisibility(
  state: StatusIconState,
  showChargeToFull: boolean,
): Partial<StatusIconState> {
  if (state.showChargeToFull === showChargeToFull) return {}
  if (showChargeToFull) return { showChargeToFull }
  return {
    showChargeToFull,
    chargeDemoPhase: 'idle',
    chargeDemoSnapshot: null,
  }
}

export function patchChargeDemoPrimaryAction(
  state: StatusIconState,
): Partial<StatusIconState> {
  if (state.chargeDemoPhase === 'idle') {
    if (!canStartChargeToFull(state)) return {}
    return {
      chargeDemoPhase: 'charging',
      ...(state.batteryPower === 'pluggedIn'
        ? { batteryPower: 'charging' as const }
        : {}),
      chargeDemoSnapshot: {
        battery: state.battery,
        batteryPower: state.batteryPower,
      },
    }
  }
  if (state.chargeDemoPhase === 'charging') {
    return {
      chargeDemoPhase: 'complete',
      battery: 100,
      batteryPower: 'pluggedIn',
    }
  }
  if (state.chargeDemoPhase === 'complete') return { chargeDemoPhase: 'restored' }
  return patchChargeDemoReset(state)
}

/** Cancelling or restoring the simulated charge limit never changes the
 * battery reading or the selected power source. */
export function patchChargeDemoCancel(state: StatusIconState): Partial<StatusIconState> {
  if (state.chargeDemoPhase === 'idle') return {}
  return { chargeDemoPhase: 'restored' }
}

/** This is explicitly a page reset, not the native cancel action. It restores
 * the battery/source snapshot captured when the demo started. */
export function patchChargeDemoReset(state: StatusIconState): Partial<StatusIconState> {
  const snapshot = state.chargeDemoSnapshot
  return {
    chargeDemoPhase: 'idle',
    chargeDemoSnapshot: null,
    ...(snapshot
      ? {
          battery: snapshot.battery,
          batteryPower: snapshot.batteryPower,
        }
      : {}),
  }
}

/** Keep the simulated charge-limit phase coherent when visibility, power, or
 * battery controls change elsewhere. The limit is represented by the phase;
 * the battery reading is independent. */
export function normalizeChargeDemoState(
  state: StatusIconState,
): Partial<StatusIconState> {
  if (!state.showChargeToFull && state.chargeDemoPhase !== 'idle') {
    return { chargeDemoPhase: 'idle', chargeDemoSnapshot: null }
  }
  if (state.chargeDemoPhase === 'charging') {
    if (state.batteryPower === 'battery') return { chargeDemoPhase: 'restored' }
    if (state.batteryPower === 'pluggedIn') return { chargeDemoPhase: 'restored' }
    if (state.battery >= 100) {
      return { chargeDemoPhase: 'complete', batteryPower: 'pluggedIn' }
    }
  }
  return {}
}

export function selectedBluetoothDevice(
  state: StatusIconState,
): DemoBluetoothDevice | undefined {
  if (!isBluetoothOutputId(state.selectedOutputId)) return undefined
  return state.bluetoothDevices.find((device) => device.id === state.selectedOutputId)
}

export function bluetoothRouteIsActive(state: StatusIconState): boolean {
  return state.bluetoothPower && selectedBluetoothDevice(state)?.connected === true
}

/** Example measurements that agree with the native Wi-Fi bar thresholds:
 * 0/1/2/3 bars map to 0/1/2/3 bars at -90/-84/-68/-40 dBm. */
export const WIFI_EXAMPLE_RSSI: Record<number, number> = {
  0: -90,
  1: -84,
  2: -68,
  3: -40,
}

export function wifiLinkIsAssociated(state: StatusIconState): boolean {
  return (
    state.networkKind === 'wifi' &&
    (state.wifiState === 'connected' ||
      state.wifiState === 'noInternet' ||
      state.wifiState === 'hotspot' ||
      state.wifiState === 'temporary' ||
      state.wifiState === 'shared')
  )
}

export function wifiExampleRssi(state: StatusIconState): number | undefined {
  if (!wifiLinkIsAssociated(state)) return undefined
  return WIFI_EXAMPLE_RSSI[Math.round(clamp(state.wifi, 0, 3))]
}

export function networkHasWarning(state: StatusIconState): boolean {
  return (
    state.networkKind === 'wifi' &&
    (state.wifiState === 'notAssociated' ||
      state.wifiState === 'off' ||
      state.wifiState === 'noInternet')
  )
}

export function bluetoothIconShouldTakeOver(state: StatusIconState): boolean {
  return (
    !inputSourceShouldTakeOver(state) &&
    state.btReplace &&
    bluetoothRouteIsActive(state) &&
    (!state.btNetworkPriority || !networkHasWarning(state))
  )
}

export function inputSourceShouldTakeOver(state: StatusIconState): boolean {
  return (
    state.connectionCenterSource === 'inputSource' &&
    !state.showBatteryInConnectionSlot &&
    (!state.prioritizeNetworkWarnings || !networkHasWarning(state))
  )
}

/** Native centre-slot priority from v1.7.4:
 * connection-slot battery, current input source, Bluetooth audio, then the
 * active Ethernet or Wi-Fi link. */
export function centerSymbolMode(state: StatusIconState): CenterSymbolMode {
  if (state.showBatteryInConnectionSlot) return 'battery'
  if (inputSourceShouldTakeOver(state)) return 'inputSource'
  if (bluetoothIconShouldTakeOver(state)) return 'bluetooth'
  return 'network'
}

/** Native StatusMappings.volumeSteps: muted and zero show no dots; every
 * positive quarter rounds up so 1–25, 26–50, 51–75, and 76–100 produce 1–4. */
export function volumeStepCount(percent: number, muted: boolean): number {
  const clamped = clamp(percent, 0, 100)
  if (muted || clamped === 0) return 0
  return Math.ceil(clamped / 25)
}

export function bluetoothVolumeIsBlue(state: StatusIconState): boolean {
  return (
    state.btVolumeColor &&
    isBluetoothOutputId(state.selectedOutputId) &&
    bluetoothRouteIsActive(state) &&
    state.volume > 0
  )
}

export function headsetInputIsAvailable(state: StatusIconState): boolean {
  return (
    state.bluetoothPower &&
    state.bluetoothDevices.some(
      (device) =>
        device.connected && (device.kind === 'headphones' || device.kind === 'earbuds'),
    )
  )
}

export function patchBluetoothDeviceConnection(
  state: StatusIconState,
  id: BluetoothDeviceId,
): Partial<StatusIconState> {
  const bluetoothDevices = state.bluetoothDevices.map((device) => {
    if (device.id !== id) return device
    return { ...device, connected: !device.connected }
  })
  const candidate = { ...state, bluetoothDevices }
  return {
    bluetoothDevices,
    ...normalizeUnavailableBluetoothSelections(candidate),
  }
}

export function patchSelectedOutput(
  state: StatusIconState,
  id: AudioOutputId,
): Partial<StatusIconState> {
  if (!isBluetoothOutputId(id)) return { selectedOutputId: id }
  const bluetoothDevices = state.bluetoothDevices.map((device) =>
    device.id === id ? { ...device, connected: true } : device,
  )
  return { selectedOutputId: id, bluetoothDevices, bluetoothPower: true }
}

/** Enabling Bluetooth icon replacement needs a real Bluetooth audio route.
 * Preserve an already-active route; otherwise connect/select the AirPods demo. */
export function patchBluetoothIconReplacement(
  state: StatusIconState,
  enabled: boolean,
): Partial<StatusIconState> {
  if (!enabled) return { btReplace: false }
  if (bluetoothRouteIsActive(state)) return { btReplace: true }
  return {
    btReplace: true,
    ...patchSelectedOutput(state, 'pocketEarbuds'),
  }
}

export function patchSelectedInput(
  state: StatusIconState,
  id: AudioInputId,
): Partial<StatusIconState> {
  if (id === 'macbookMicrophone') return { selectedInputId: id }
  if (headsetInputIsAvailable(state)) return { selectedInputId: id }
  // Choosing an example headset microphone makes that example route real:
  // power on Bluetooth and connect the first available headset-like device.
  const headsetIndex = state.bluetoothDevices.findIndex(
    (device) => device.kind === 'headphones' || device.kind === 'earbuds',
  )
  if (headsetIndex < 0) return { selectedInputId: 'macbookMicrophone' }
  const bluetoothDevices = state.bluetoothDevices.map((device, index) =>
    index === headsetIndex
      ? { ...device, connected: true }
      : device,
  )
  return { selectedInputId: id, bluetoothPower: true, bluetoothDevices }
}

export function patchBluetoothPower(
  state: StatusIconState,
  bluetoothPower: boolean,
): Partial<StatusIconState> {
  const candidate = { ...state, bluetoothPower }
  return {
    bluetoothPower,
    ...normalizeUnavailableBluetoothSelections(candidate),
  }
}

/** Normalize output and input independently when their example Bluetooth source
 * is no longer available. A built-in output does not make a headset microphone
 * available, so each route needs its own fallback. */
export function normalizeUnavailableBluetoothSelections(
  state: StatusIconState,
): Partial<StatusIconState> {
  const outputUnavailable =
    isBluetoothOutputId(state.selectedOutputId) &&
    (!state.bluetoothPower ||
      !state.bluetoothDevices.find((device) => device.id === state.selectedOutputId)?.connected)
  const inputUnavailable =
    state.selectedInputId === 'headsetMicrophone' && !headsetInputIsAvailable(state)
  if (!outputUnavailable && !inputUnavailable) return {}
  return {
    ...(outputUnavailable ? { selectedOutputId: 'macbookSpeakers' as const } : {}),
    ...(inputUnavailable ? { selectedInputId: 'macbookMicrophone' as const } : {}),
  }
}

export function movePanelSection(
  state: StatusIconState,
  id: PanelSectionId,
  direction: -1 | 1,
): Partial<StatusIconState> {
  const index = state.panelSectionOrder.indexOf(id)
  const nextIndex = index + direction
  if (index < 0 || nextIndex < 0 || nextIndex >= state.panelSectionOrder.length) return {}
  const panelSectionOrder = [...state.panelSectionOrder]
  ;[panelSectionOrder[index], panelSectionOrder[nextIndex]] = [
    panelSectionOrder[nextIndex],
    panelSectionOrder[index],
  ]
  return { panelSectionOrder }
}

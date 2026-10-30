import React from 'react'
import {
  RING_STROKE_SCALE,
  bluetoothRouteIsActive,
  bluetoothVolumeIsBlue,
  centerSymbolMode,
  clamp,
  selectedBluetoothDevice,
  volumeStepCount,
  type InputSourceId,
  type StatusIconState,
  type WifiState,
} from './demo-state'
import { AirPodsGlyph } from './AirPodsGlyph'
import './status-icon.css'

export {
  AUDIO_OUTPUTS,
  DEFAULT_STATUS,
  HIGH_ENERGY_EXAMPLES,
  PANEL_SECTIONS,
  activeVolumeSource,
  batteryPowerFlowValues,
  bluetoothRouteIsActive,
  canStartChargeToFull,
  chargeLimitForPhase,
  clamp,
  externalVolumeConfigurationIsEditable,
  headsetInputIsAvailable,
  isBluetoothOutputId,
  normalizeChargeDemoState,
  normalizeUnavailableBluetoothSelections,
  networkHasWarning,
  patchChargeDemoCancel,
  patchChargeDemoPrimaryAction,
  patchChargeDemoReset,
  patchChargeDemoVisibility,
  patchBluetoothPower,
  patchBluetoothDeviceConnection,
  patchBluetoothIconReplacement,
  patchSelectedInput,
  patchSelectedOutput,
  selectedOutput,
  volumeControlsAreEditable,
  volumeStepCount,
  wifiExampleRssi,
  wifiLinkIsAssociated,
} from './demo-state'
export type {
  ActiveVolumeSource,
  AppIconPlacement,
  AudioInputId,
  AudioOutputId,
  BatteryPowerMode,
  BetterDisplayAssociation,
  BetterDisplayDisplayId,
  BetterDisplayRuntime,
  BluetoothDeviceId,
  BluetoothGlyph,
  ChargeDemoSnapshot,
  ChargeDemoPhase,
  ConnectionCenterSource,
  DockBackgroundPreference,
  ExternalVolumeBackend,
  InputSourceId,
  NetworkKind,
  PanelSectionId,
  RingStrokeStyle,
  StatusIconState,
  VolumeDisplayStyle,
  WifiState,
} from './demo-state'

/* ── 电池弧几何 ──
 * 圆弧是一条 242.6° 的大弧（不是整圈），两端落在圆心下方；缺口开在弧顶，
 * 用来放电量数字或充电闪电。所有长度都以 pathLength=100 为基准，所以下面
 * 的数值都是「百分比长度」，由弧长换算得出。 */
const BATTERY_ARC = 'M15.5 88.25 A51.5 51.5 0 1 1 103.5 88.25'
const BATTERY_ARC_LENGTH = 51.5 * (2 * Math.PI - 2 * Math.asin(88 / (2 * 51.5)))
const BATTERY_VALUE_GAP_WIDTH = 64
const BATTERY_BOLT_GAP_WIDTH = 36
/** 多留一点点，避免 dash 首尾在舍入后出现 1px 缝隙 */
const BATTERY_DASH_GUARD = 4

/* ── 充电闪电 ──
 * 路径按 120 画布的原尺寸绘制，渲染时以锚点 (59.5, 2.1) 等比放大。
 * 这里按网页小尺寸预览的光学平衡取 1.1×，避免闪电压过电池弧。 */
const BOLT_SCALE = 1.1
const BOLT_PIVOT_X = 59.5
const BOLT_PIVOT_Y = 2.1
const BOLT_TRANSFORM =
  `translate(${BOLT_PIVOT_X} ${BOLT_PIVOT_Y}) scale(${BOLT_SCALE}) ` +
  `translate(${-BOLT_PIVOT_X} ${-BOLT_PIVOT_Y})`

/* ── 中心图形缩放 ──
 * Wi-Fi 在网页预览中按光学平衡取 1.2×。蓝牙和输入源继续使用原来的
 * 1.6× 变换，因此不能共享 Wi-Fi 的缩放。热点 / 临时 / 共享覆盖图形
 * 和遮罩仍与 Wi-Fi 信号同组，保持原有对齐。 */
const WIFI_PIVOT_X = 60
const WIFI_PIVOT_Y = 64
const WIFI_SCALE = 1.2
const WIFI_TRANSFORM =
  `translate(${WIFI_PIVOT_X} ${WIFI_PIVOT_Y}) scale(${WIFI_SCALE}) ` +
  `translate(${-WIFI_PIVOT_X} ${-WIFI_PIVOT_Y})`
const CENTER_SYMBOL_SCALE = 1.6
const CENTER_SYMBOL_TRANSFORM =
  `translate(${WIFI_PIVOT_X} ${WIFI_PIVOT_Y}) scale(${CENTER_SYMBOL_SCALE}) ` +
  `translate(${-WIFI_PIVOT_X} ${-WIFI_PIVOT_Y})`

/* ── 缺口为什么用 mask 而不是写进 dasharray ──
 * 电量数字 / 充电闪电顶在弧顶，弧要在这里断开一段。早先把「断开」直接编进
 * stroke-dasharray，但填充弧的段数会随电量变化：
 *   电量跨过缺口下沿 → 填充被缺口劈成两段，dasharray 是 4 段；
 *   电量低于缺口下沿 → 只有一段，dasharray 是 2 段。
 * .sti-fill 上挂着 `transition: stroke-dasharray 260ms`，而浏览器对长度不同的
 * dash 列表做插值时会先把短的那条循环补齐，于是 4 段 ↔ 2 段 之间过渡时会多出
 * 一个白段沿圆弧滑走（幽灵动画）。
 * 现在改成：弧只画实线，缺口由一层 mask 挖掉。填充弧的 dasharray 恒为 2 段，
 * 过渡只做等比伸缩，幽灵段消失；缺口边缘的圆头靠 mask 里的虚线端点保留。 */

/** 缺口在弧上的 dasharray（只跟缺口宽度有关，与电量无关），给 mask 里的白色虚线用。 */
function batteryGapDash(gapWidth: number): string {
  const gap = (gapWidth / BATTERY_ARC_LENGTH) * 100
  const firstEnd = 50 - gap / 2
  const remainingTrack = 100 - (50 + gap / 2)
  return `${firstEnd} ${gap} ${remainingTrack + BATTERY_DASH_GUARD}`
}

/** 填充弧的 dasharray：恒定两段（点亮长度 + 余量 + guard），段数不随电量变化。 */
function batteryFillDash(fillPercent: number): string {
  const fill = clamp(fillPercent, 0, 100)
  return `${fill} ${100 - fill + BATTERY_DASH_GUARD}`
}

/** Wi-Fi 三段弧被点亮的下标（信号 0 格时全灭，1 格只留中心点）。 */
const WIFI_VISIBLE: Record<number, number[]> = { 0: [], 1: [3], 2: [2, 3], 3: [1, 2, 3] }

/** 这三种状态下信号弧整组隐藏，改画自己的图形。 */
const SPECIAL_WIFI_STATES: WifiState[] = ['hotspot', 'temporary', 'shared']

const ROUNDED_FONT =
  "ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif"

const INPUT_SOURCE_GLYPH: Record<InputSourceId, string> = {
  english: 'EN',
  pinyin: '拼',
  japanese: 'あ',
}

/** Native volumeArcStartAngle 121.82° to volumeArcEndAngle 59.12° on the
 * 51.5-unit ring. In the SVG's y-down plane that is the small counter-clockwise
 * sweep across the bottom of the battery ring. */
const VOLUME_ARC =
  'M32.351 105.240 A51.5 51.5 0 0 0 85.923 105.669'

/** Frozen StatusIconGeometry ethernetSource/TargetBounds mapped to canvas
 * points, using the native wired-port stroke width and dot radius. */
const ETHERNET_CHEVRON_PATHS = [
  'M46.300401 53.642929 L33.943330 66 L46.300401 78.357071',
  'M72.699599 53.642929 L85.056670 66 L72.699599 78.357071',
] as const
const ETHERNET_DOT_X = [49.726680, 59.5, 69.273320] as const
const ETHERNET_DOT_Y = 66
const ETHERNET_STROKE_WIDTH = 4.886659979939819
const ETHERNET_DOT_RADIUS = 2.4433299899699095

export interface StatusIconProps {
  state: StatusIconState
  /** 渲染宽度（px），高度按 1:1 等比 */
  size?: number
  /** 无障碍标签；不传则视为纯装饰，对读屏隐藏 */
  label?: string
  className?: string
}

/**
 * Status Trio 的菜单栏图标：Wi-Fi + 电池 + 音量三段合成一个 120×120 的矢量图形。
 * 颜色全部走 CSS 变量，父级只要改 `color`（→ --sti-ink）就能适配菜单栏深浅。
 */
export function StatusIcon({ state, size = 30, label, className }: StatusIconProps) {
  // 同一页面会同时渲染多个实例（菜单栏小图标 + 控制台大图），mask/filter 的 id 必须隔离
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '')
  const { battery, wifi, wifiState, lowPower, networkKind, showBatteryValue } = state
  const charging = state.batteryPower === 'charging'
  const connectedToPower = state.batteryPower !== 'battery'
  const showConnectionSymbol = connectedToPower && state.showChargingIndicator && !charging
  const showBatteryInGap = showBatteryValue && (!connectedToPower || !state.showChargingIndicator)
  const fillPercent = clamp((battery / state.fullThreshold) * 100, 0, 100)

  const critical = battery < state.criticalThreshold
  const arcColor = !state.usesBatteryStatusColors
    ? 'var(--sti-ink)'
    : critical
      ? 'var(--sti-critical)'
      : lowPower
        ? 'var(--sti-warning)'
        : connectedToPower
          ? 'var(--sti-charging)'
          : 'var(--sti-ink)'

  // 数字与闪电都会顶在弧的缺口里，所以两者共用一套「开缺口」的逻辑
  const showsIndicatorGap =
    state.showChargingIndicator && (charging || showConnectionSymbol)
  const showsGap = showBatteryInGap || showsIndicatorGap
  const gapDash = batteryGapDash(
    showsIndicatorGap ? BATTERY_BOLT_GAP_WIDTH : BATTERY_VALUE_GAP_WIDTH,
  )
  const fillDash = batteryFillDash(fillPercent)

  const centerMode = centerSymbolMode(state)
  const usesNetwork = centerMode === 'network'
  const usesSignal = usesNetwork && wifiState === 'connected'
  const specialWifi = SPECIAL_WIFI_STATES.includes(wifiState)
  const visibleWifi = WIFI_VISIBLE[wifi] ?? []
  const bluetoothTakeover = centerMode === 'bluetooth'
  const inputSourceTakeover = centerMode === 'inputSource'
  const batteryInCenter = centerMode === 'battery'
  const bluetoothDevice = selectedBluetoothDevice(state)
  const bluetoothVolumeBlue = bluetoothVolumeIsBlue(state)
  const bluetoothGlyph =
    state.btGlyph === 'automatic'
      ? bluetoothDevice?.kind ?? 'earbuds'
      : state.btGlyph
  const ringScale = RING_STROKE_SCALE[state.ringStrokeStyle]
  const volumeSteps = volumeStepCount(state.volume, state.muted)
  const volumeProgress = state.muted ? 0 : clamp(state.volume, 0, 100)
  const volumeArcDash = `${volumeProgress} ${100 - volumeProgress + BATTERY_DASH_GUARD}`
  const inputSourceGlyph = INPUT_SOURCE_GLYPH[state.inputSource]
  const volumeArcScale = ringScale
  const dotRadiusScale = 1 + (ringScale - 1) * 0.5

  return (
    <svg
      className={
        'sti' +
        (bluetoothVolumeBlue ? ' is-bt-volume' : '') +
        (className ? ` ${className}` : '')
      }
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-network-kind={state.networkKind}
      data-center-mode={centerMode}
      data-bluetooth-route={bluetoothRouteIsActive(state) || undefined}
      style={
        {
          '--sti-battery': arcColor,
          '--sti-ring-scale': ringScale,
        } as React.CSSProperties
      }
    >
      {label ? <title>{label}</title> : null}
      <defs>
        <filter
          id={`${uid}-value-shadow`}
          x="-30%"
          y="-60%"
          width="160%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow className="sti-value-shadow" dx="0" dy="0.75" stdDeviation="0.75" />
        </filter>
        {/* 电池弧顶的缺口：黑色铺底 + 白色虚线（= 要保留的弧段），虚线两端的圆头
            就是缺口边缘的圆头，和以前直接写 dasharray 的外观完全一致。
            只套在弧上，不含数字 / 闪电，否则缺口会一起把它们抹掉。 */}
        {showsGap ? (
          <mask
            id={`${uid}-battery-gap`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="120"
            height="120"
          >
            <rect x="0" y="0" width="120" height="120" fill="black" />
            <path
              d={BATTERY_ARC}
              pathLength={100}
              fill="none"
              stroke="white"
              strokeWidth={8 * ringScale}
              strokeLinecap="round"
              strokeDasharray={gapDash}
            />
          </mask>
        ) : null}
        <mask
          id={`${uid}-wifi-temporary-mask`}
          maskUnits="userSpaceOnUse"
          x="24"
          y="40"
          width="72"
          height="48"
        >
          <path
            d="M38.5 55.5 A31 31 0 0 1 80.5 55.5 L59.5 77.45 Z"
            fill="white"
            stroke="white"
            strokeWidth={7}
            strokeLinejoin="round"
          />
          <rect
            x="50.5"
            y="53.5"
            width="18"
            height="12"
            rx="2.5"
            fill="none"
            stroke="black"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <path d="M57.5 65.5 H61.5 V67.5 H63 V70.5 H56 V67.5 H57.5 Z" fill="black" />
        </mask>
        <mask
          id={`${uid}-wifi-shared-mask`}
          maskUnits="userSpaceOnUse"
          x="24"
          y="40"
          width="72"
          height="48"
        >
          <path
            d="M38.5 55.5 A31 31 0 0 1 80.5 55.5 L59.5 77.45 Z"
            fill="white"
            stroke="white"
            strokeWidth={7}
            strokeLinejoin="round"
          />
          <path d="M59.5 51.5 L67.5 59.5 H63 V72.5 H56 V59.5 H51.5 Z" fill="black" />
        </mask>
      </defs>

      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g className="sti-battery" strokeWidth={8 * ringScale}>
          {/* 弧本体只画实线，缺口交给 mask 挖；dash 段数恒定，过渡不会再插值出幽灵段 */}
          <g mask={showsGap ? `url(#${uid}-battery-gap)` : undefined}>
            <path className="sti-track" d={BATTERY_ARC} />
            <path
              className="sti-fill"
              d={BATTERY_ARC}
              pathLength={100}
              strokeDasharray={fillDash}
              opacity={battery === 0 ? 0 : 1}
            />
          </g>
          <text
            className="sti-value"
            x="59.5"
            y="24"
            fill="var(--sti-value)"
            stroke="none"
            textAnchor="middle"
            fontFamily={ROUNDED_FONT}
            fontSize={32}
            fontWeight={700}
            letterSpacing="-0.04em"
            filter={`url(#${uid}-value-shadow)`}
            opacity={showBatteryInGap ? 1 : 0}
          >
            {battery}
          </text>
          <text
            className="sti-center-battery"
            x="59.5"
            y="76"
            fill="var(--sti-value)"
            stroke="none"
            textAnchor="middle"
            fontFamily={ROUNDED_FONT}
            fontSize="52"
            fontWeight={700}
            letterSpacing="-0.05em"
            opacity={batteryInCenter ? 1 : 0}
          >
            {battery}
          </text>
          <path
            className="sti-bolt"
            d="M62.1 2.2 Q62.8 2.5 62.6 3.3 L61.2 7.8 H65.9 Q66.9 7.8 67.3 8.6 Q67.6 9.3 67 10 L57 21.3 Q56.4 22 55.6 21.6 Q55 21.3 55.3 20.5 L57.4 14.1 H52.9 Q52 14.1 51.6 13.3 Q51.3 12.6 51.9 12 L61.1 2.7 Q61.6 2.1 62.1 2.2 Z"
            transform={BOLT_TRANSFORM}
            fill="var(--sti-value)"
            stroke="none"
            filter={`url(#${uid}-value-shadow)`}
            opacity={charging && state.showChargingIndicator ? 1 : 0}
          />
          <g
            className="sti-connection-symbol"
            data-kind={state.batteryPower}
            opacity={showConnectionSymbol ? 1 : 0}
          >
            <path
              data-symbol="plug"
              d="M55 5h10v5h3v5h-5v7h-6v-7h-5v-10h3z"
              fill="var(--sti-value)"
              stroke="none"
              filter={`url(#${uid}-value-shadow)`}
            />
            <path
              data-symbol="battery"
              d="M53 7h14M60 5v4M60 9v10"
              stroke="var(--sti-value)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
        </g>

        <g
          className="sti-wifi"
          data-state={wifiState}
          data-replaced={bluetoothTakeover || undefined}
          data-network-kind={networkKind}
          strokeWidth={7}
          opacity={inputSourceTakeover || batteryInCenter ? 0 : 1}
        >
          <g className="sti-wifi-glyph" transform={WIFI_TRANSFORM}>
            <g
              className="sti-wifi-signal"
              opacity={specialWifi || bluetoothTakeover || networkKind === 'ethernet' ? 0 : 1}
            >
              {[1, 2, 3].map((index) => {
                const muted = !usesSignal || !visibleWifi.includes(index)
                const hidden = wifiState === 'noInternet' && index === 3
                return (
                  <path
                    key={index}
                    className={muted ? 'is-muted' : undefined}
                    data-index={index}
                    opacity={hidden ? 0 : 1}
                    d={
                      index === 1
                        ? 'M38.5 55.5 A31 31 0 0 1 80.5 55.5'
                        : index === 2
                          ? 'M47 65.25 A18.5 18.5 0 0 1 72 65.25'
                          : 'M59.5 69.9 C61.0 69.9 65.2 70.8 66.5 73 C66.7 73.8 66.7 74.3 66.5 75 C63.8 78.8 61.15 80.95 59.5 80.95 C57.85 80.95 55.2 78.8 52.5 75 C52.3 74.3 52.3 73.8 52.5 73 C53.8 70.8 58.0 69.9 59.5 69.9 Z'
                    }
                    fill={index === 3 ? 'currentColor' : 'none'}
                    stroke={index === 3 ? 'none' : undefined}
                  />
                )
              })}
            </g>

            <g
              className="sti-wifi-overlays"
              strokeWidth={5}
              opacity={networkKind === 'ethernet' ? 0 : 1}
            >
              <path className="sti-wifi-off" data-state="off" d="M39 46 L81 79" strokeWidth={6} />
              <g data-state="noInternet">
                <path d="M59.5 54.5 V67" />
                <circle cx="59.5" cy="75.5" r="2.6" stroke="none" />
              </g>
              <g data-state="hotspot" stroke="currentColor">
                <path d="M53 66 H49 A8 8 0 0 1 49 50 H54" />
                <path d="M66 50 H70 A8 8 0 0 1 70 66 H65" />
                <path d="M51 58 H68" />
              </g>
              <path
                data-state="temporary"
                d="M38.5 55.5 A31 31 0 0 1 80.5 55.5 L59.5 77.45 Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={7}
                mask={`url(#${uid}-wifi-temporary-mask)`}
              />
              <path
                data-state="shared"
                d="M38.5 55.5 A31 31 0 0 1 80.5 55.5 L59.5 77.45 Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={7}
                mask={`url(#${uid}-wifi-shared-mask)`}
              />
            </g>
          </g>

          {/* 蓝牙音频设备图标（AirPods 一对）：接管整个中部图形，连同上面的信号弧
              与状态覆盖层一起隐藏。蓝牙保持原有中心图形尺寸；只有 Wi-Fi
              使用独立的 1.2× 光学平衡缩放。
              颜色走 --sti-bt（浅 #0066cc / 深 #4da3ff，对齐 App 的蓝牙蓝）。 */}
          <g
            className="sti-bt-device"
            transform={CENTER_SYMBOL_TRANSFORM}
            fill="var(--sti-bt)"
            stroke="none"
          >
            {bluetoothGlyph === 'earbuds' ? (
              <AirPodsGlyph x={38} y={44.5} width={44} fill="var(--sti-bt)" />
            ) : bluetoothGlyph === 'speaker' ? (
              <g stroke="var(--sti-bt)" strokeWidth={6}>
                <path d="M48 50 L48 82" />
                <path d="M48 56 L61 48 V72 L48 64" fill="var(--sti-bt)" />
                <path d="M67 55 Q73 59 67 65" fill="none" />
                <path d="M72 50 Q81 59 72 70" fill="none" />
              </g>
            ) : (
              <g stroke="var(--sti-bt)" fill="none" strokeWidth={6}>
                <path d="M41 49 A16 16 0 0 1 78 49" />
                <rect x="38" y="56" width="13" height="22" rx="5" fill="var(--sti-bt)" />
                <rect x="68" y="56" width="13" height="22" rx="5" fill="var(--sti-bt)" />
              </g>
            )}
          </g>
        </g>

        <g
          className="sti-input-source"
          transform={CENTER_SYMBOL_TRANSFORM}
          opacity={inputSourceTakeover ? 1 : 0}
          aria-hidden={!inputSourceTakeover}
        >
          <rect
            x="44"
            y="47"
            width="31"
            height="31"
            rx="7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          />
          <text
            x="59.5"
            y="68.5"
            fill="currentColor"
            stroke="none"
            textAnchor="middle"
            fontFamily={ROUNDED_FONT}
            fontSize={inputSourceGlyph.length > 1 ? 12.5 : 19}
            fontWeight={700}
          >
            {inputSourceGlyph}
          </text>
        </g>
      </g>

      {/* Native wired-port artwork uses scale 1, unlike the Wi-Fi symbol.
          Higher-priority battery, input-source, and Bluetooth modes hide it. */}
      <g
        className="sti-wired"
        fill="none"
        stroke="currentColor"
        strokeWidth={ETHERNET_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={centerMode === 'network' && networkKind === 'ethernet' ? 1 : 0}
        aria-hidden={centerMode !== 'network' || networkKind !== 'ethernet'}
      >
        {ETHERNET_CHEVRON_PATHS.map((path) => (
          <path key={path} d={path} />
        ))}
        {ETHERNET_DOT_X.map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy={ETHERNET_DOT_Y}
            r={ETHERNET_DOT_RADIUS}
            fill="currentColor"
            stroke="none"
          />
        ))}
      </g>

      {state.volumeStyle === 'dots' ? (
        <g className="sti-level" fill="currentColor">
          {[1, 2, 3, 4].map((index) => (
            <circle
              key={index}
              data-index={index}
              className={index <= volumeSteps ? undefined : 'is-muted'}
              cx={[33, 50.5, 68.5, 86][index - 1]}
              cy={[104.2, 111.2, 111.7, 105.8][index - 1]}
              r={5.5 * dotRadiusScale}
            />
          ))}
        </g>
      ) : (
        <g className="sti-volume-arc" fill="none" strokeLinecap="round">
          <path
            className="sti-volume-track"
            d={VOLUME_ARC}
            pathLength={100}
            strokeWidth={7 * volumeArcScale}
          />
          <path
            className="sti-volume-fill"
            d={VOLUME_ARC}
            pathLength={100}
            strokeWidth={7 * volumeArcScale}
            strokeDasharray={volumeArcDash}
            opacity={volumeProgress > 0 ? 1 : 0}
          />
        </g>
      )}
    </svg>
  )
}

import React from 'react'
import './status-icon.css'

/** 图标状态：与 demo 页、「设置」里的选项一一对应。 */
export type WifiState =
  | 'connected'
  | 'notAssociated'
  | 'off'
  | 'noInternet'
  | 'hotspot'
  | 'temporary'
  | 'shared'

export interface StatusIconState {
  battery: number
  wifi: number
  wifiState: WifiState
  volume: number
  lowPower: boolean
  charging: boolean
  showBatteryValue: boolean
}

export const DEFAULT_STATUS: StatusIconState = {
  battery: 75,
  wifi: 3,
  wifiState: 'connected',
  volume: 4,
  lowPower: false,
  charging: false,
  showBatteryValue: true,
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number(value)))

/* ── 电池弧几何 ──
 * 圆弧是一条 242.6° 的大弧（不是整圈），两端落在圆心下方；缺口开在弧顶，
 * 用来放电量数字或充电闪电。所有长度都以 pathLength=100 为基准，所以下面
 * 的数值都是「百分比长度」，由弧长换算得出。 */
const BATTERY_ARC = 'M15.5 88.25 A51.5 51.5 0 1 1 103.5 88.25'
const BATTERY_ARC_LENGTH = 51.5 * (2 * Math.PI - 2 * Math.asin(88 / (2 * 51.5)))
const BATTERY_VALUE_GAP_WIDTH = 64
const BATTERY_BOLT_GAP_WIDTH = 50
/** 多留一点点，避免 dash 首尾在舍入后出现 1px 缝隙 */
const BATTERY_DASH_GUARD = 4

/* ── 充电闪电 ──
 * 路径按 120 画布的原尺寸绘制，渲染时以锚点 (59.5, 2.1) 等比放大。
 * 原生 App 会把闪电高度标定到「电池数字的字形高度」上
 * （StatusIconRenderer.batteryChargingBoltScale：字形高 / 闪电高 × 220÷180），
 * 默认 textScale 1.8 时算出来约 1.66×；这里取 1.6×。 */
const BOLT_SCALE = 1.6
const BOLT_PIVOT_X = 59.5
const BOLT_PIVOT_Y = 2.1
const BOLT_TRANSFORM =
  `translate(${BOLT_PIVOT_X} ${BOLT_PIVOT_Y}) scale(${BOLT_SCALE}) ` +
  `translate(${-BOLT_PIVOT_X} ${-BOLT_PIVOT_Y})`

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
function batteryFillDash(battery: number): string {
  return `${battery} ${100 - battery + BATTERY_DASH_GUARD}`
}

/** Wi-Fi 三段弧被点亮的下标（信号 0 格时全灭，1 格只留中心点）。 */
const WIFI_VISIBLE: Record<number, number[]> = { 0: [], 1: [3], 2: [2, 3], 3: [1, 2, 3] }

/** 这三种状态下信号弧整组隐藏，改画自己的图形。 */
const SPECIAL_WIFI_STATES: WifiState[] = ['hotspot', 'temporary', 'shared']

const ROUNDED_FONT =
  "ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif"

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
  const { battery, wifi, wifiState, volume, lowPower, charging, showBatteryValue } = state

  const critical = battery < 20
  const arcColor = critical
    ? 'var(--sti-critical)'
    : lowPower
      ? 'var(--sti-warning)'
      : charging
        ? 'var(--sti-charging)'
        : 'var(--sti-ink)'

  // 数字与闪电都会顶在弧的缺口里，所以两者共用一套「开缺口」的逻辑
  const showsGap = showBatteryValue || charging
  const gapDash = batteryGapDash(charging ? BATTERY_BOLT_GAP_WIDTH : BATTERY_VALUE_GAP_WIDTH)
  const fillDash = batteryFillDash(battery)

  const usesSignal = wifiState === 'connected'
  const specialWifi = SPECIAL_WIFI_STATES.includes(wifiState)
  const visibleWifi = WIFI_VISIBLE[wifi] ?? []

  return (
    <svg
      className={'sti' + (className ? ` ${className}` : '')}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ '--sti-battery': arcColor } as React.CSSProperties}
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
              strokeWidth={8}
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
        <g className="sti-battery" strokeWidth={8}>
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
            opacity={charging || !showBatteryValue ? 0 : 1}
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
            opacity={charging ? 1 : 0}
          />
        </g>

        <g className="sti-wifi" data-state={wifiState} strokeWidth={7}>
          <g className="sti-wifi-signal" opacity={specialWifi ? 0 : 1}>
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

          <g className="sti-wifi-overlays" strokeWidth={5}>
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
      </g>

      <g className="sti-level" fill="currentColor">
        {[1, 2, 3, 4].map((index) => (
          <circle
            key={index}
            data-index={index}
            className={index <= volume ? undefined : 'is-muted'}
            cx={[33, 50.5, 68.5, 86][index - 1]}
            cy={[104.2, 111.2, 111.7, 105.8][index - 1]}
            r={5.5}
          />
        ))}
      </g>
    </svg>
  )
}

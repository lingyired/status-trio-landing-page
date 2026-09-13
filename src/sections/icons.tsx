import React from 'react'

/** 线条图标统一规格：24×24 viewBox、圆头圆角、默认 1.7 描边，描边吃 currentColor。 */
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  /** 三合一：几条线收拢成一个点 */
  combo: (
    <>
      <path d="M4 5h16" />
      <path d="M6 10h12" />
      <path d="M8.5 15h7" />
      <circle cx="12" cy="19.4" r="1.5" />
    </>
  ),
  /** 尺寸可调：对角缩放箭头 */
  size: (
    <>
      <path d="M9.5 3.5H3.5v6" />
      <path d="M14.5 20.5h6v-6" />
      <path d="M3.5 3.5l7 7" />
      <path d="M20.5 20.5l-7-7" />
    </>
  ),
  /** 电池 */
  battery: (
    <>
      <rect x="2.5" y="7" width="16" height="10" rx="2.8" />
      <path d="M21.2 10.6v2.8" />
      <path d="M6.2 10.2h5.4v3.6H6.2z" fill="currentColor" stroke="none" />
    </>
  ),
  /** Wi-Fi */
  wifi: (
    <>
      <path d="M3.2 9.2a13 13 0 0 1 17.6 0" />
      <path d="M6.6 13a8.4 8.4 0 0 1 10.8 0" />
      <path d="M10 16.6a3.6 3.6 0 0 1 4 0" />
      <circle cx="12" cy="19.6" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  /** 音量 */
  volume: (
    <>
      <path d="M4 9.5h3.2L11.5 6v12L7.2 14.5H4z" />
      <path d="M15 9.6a3.6 3.6 0 0 1 0 4.8" />
      <path d="M18 7a7.2 7.2 0 0 1 0 10" />
    </>
  ),
  /** 原生交互：指针 + 点击波纹 */
  click: (
    <>
      <path d="M8 4.5v5" />
      <path d="M4.6 7.2l2.6 1.4" />
      <path d="M11.4 7.2l-2.6 1.4" />
      <path d="M5.6 13.4l8.4 3.4-2.3 1.1-1.1 2.3z" />
      <path d="M13.5 13.5l5 5" />
    </>
  ),
  /** 安静更新：闪电 */
  bolt: <path d="M13.4 2.8L5.6 13.2h5.2l-1 8 7.8-10.4h-5.2z" />,
  /** 语言：地球 */
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.6 12h16.8" />
      <path d="M12 3.4c2.4 2.6 3.6 5.5 3.6 8.6s-1.2 6-3.6 8.6c-2.4-2.6-3.6-5.5-3.6-8.6S9.6 6 12 3.4z" />
    </>
  ),
  /** 登录时启动：电源符 */
  login: (
    <>
      <path d="M12 3.6v7.8" />
      <path d="M7.4 6.6a7.4 7.4 0 1 0 9.2 0" />
    </>
  ),
}

export function FeatureIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...stroke} aria-hidden>
      {FEATURE_ICONS[name] ?? FEATURE_ICONS.combo}
    </svg>
  )
}

/** Apple logo（实心） */
export function AppleMark({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 384 512" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

/** GitHub mark（实心） */
export function GitHubMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  )
}

/** 下载箭头 */
export function DownloadMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} {...stroke} strokeWidth={1.9} aria-hidden>
      <path d="M12 3.4v11.4" />
      <path d="M7.6 10.8L12 15.2l4.4-4.4" />
      <path d="M4.4 19.6h15.2" />
    </svg>
  )
}

/** 警示三角：排障卡片用 */
export function AlertMark({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} {...stroke} strokeWidth={2} aria-hidden>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.4v4.2" />
      <path d="M12 17.2h.01" />
    </svg>
  )
}

/** 复制到剪贴板 */
export function CopyMark({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} {...stroke} strokeWidth={1.9} aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2.6" />
      <path d="M5.4 15H4.6A2.6 2.6 0 0 1 2 12.4V4.6A2.6 2.6 0 0 1 4.6 2h7.8A2.6 2.6 0 0 1 15 4.6v.8" />
    </svg>
  )
}

/** 菜单栏：顶部一条状态栏 + 右侧一个状态项 */
export function MenuBarMark({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} {...stroke} aria-hidden>
      <rect x="2.6" y="3.6" width="18.8" height="16.8" rx="3.2" />
      <path d="M2.6 8.4h18.8" />
      <circle cx="17.6" cy="6" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** 复制按钮：点击写入剪贴板，短暂切换成「已复制」。 */
export function CopyButton({ text, labels }: { text: string; labels: { copy: string; copied: string } }) {
  const [copied, setCopied] = React.useState(false)

  return (
    <button
      type="button"
      className="fix-copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          // 剪贴板被拒（非 https / 无权限）时保持原样，命令本身仍可手动选中
          return
        }
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }}
    >
      <CopyMark size={13} />
      {copied ? labels.copied : labels.copy}
    </button>
  )
}

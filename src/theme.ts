/** Landing page 主题偏好：dark（默认）/ light，写入 <html data-theme>，localStorage 持久化。
 *  与 fund01 landing 的做法一致：在 React 挂载前同步应用，避免第一帧按亮色绘制。 */

export type ThemePref = 'dark' | 'light'

const STORAGE_KEY = 'status-trio.landing.theme'

function readStored(): ThemePref | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'dark' || v === 'light' ? v : null
  } catch {
    return null
  }
}

/** 当前偏好：localStorage → 系统偏好 → dark */
export function getThemePref(): ThemePref {
  const stored = readStored()
  if (stored) return stored
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTheme(pref: ThemePref): void {
  const root = document.documentElement
  root.dataset.theme = pref
  root.style.colorScheme = pref
  try {
    localStorage.setItem(STORAGE_KEY, pref)
  } catch {
    /* 隐私模式下 localStorage 可能不可写，忽略 */
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', pref === 'light' ? '#dfe7f2' : '#141b28')
}

/** React 挂载前调用：先把主题写到 DOM，避免白闪。 */
export function initTheme(): ThemePref {
  const pref = getThemePref()
  applyTheme(pref)
  return pref
}

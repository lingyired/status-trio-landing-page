/** Landing page 主题偏好：dark（默认）/ light，写入 <html data-theme>，localStorage 持久化。
 *
 *  首帧主题由 index.html 里的内联脚本负责（不依赖打包产物，在样式表生效前落定）。
 *  这里保留同一套判定逻辑，供 React 侧读取与切换主题使用；两者必须保持口径一致。 */

export type ThemePref = 'dark' | 'light'

/** localStorage 键。⚠️ index.html 里的内联主题脚本也硬编码了这个字符串，
 *  两边必须一起改，否则「首帧主题」和「React 侧主题」会不一致。 */
const STORAGE_KEY = 'status-trio.landing.theme'

/** 壁纸 URL。刻意走 public/ 而不是 `import`：
 *  - `import` 会把它挂进 JS 依赖图，浏览器要等 260 KB JS 下载 + 执行 + React 渲染
 *    出 <img> 之后才知道图片地址，图片请求平白晚了一整段（二次请求瀑布）；
 *  - 放进 public/ 后文件名不参与打包哈希，index.html 的内联脚本能在首帧前
 *    直接 <link rel=preload>，图片与 JS 并行下载。
 *  ⚠️ 这两个路径同样被 index.html 的内联脚本引用，改目录要一起改。 */
export const WALLPAPER: Record<ThemePref, string> = {
  dark: './wallpaper/dark.webp',
  light: './wallpaper/light.webp',
}

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

/** React 挂载前调用。首帧主题已由 index.html 的内联脚本落定，这里是一次幂等的
 *  重放（结果必然相同），负责把偏好持久化并同步 theme-color。 */
export function initTheme(): ThemePref {
  const pref = getThemePref()
  applyTheme(pref)
  return pref
}

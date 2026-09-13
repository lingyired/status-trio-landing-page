import type { RefObject } from 'react'
import { APP } from '../app'
import { StatusIcon, type StatusIconState } from '../status/StatusIcon'
import { useI18n } from '../i18n'
import type { ThemePref } from '../theme'
import { useTimeLabel } from './time'

interface Props {
  status: StatusIconState
  /** 图标按钮本身：设置面板要靠它算对齐位置 */
  iconRef: RefObject<HTMLButtonElement | null>
  /** 设置面板是否展开：图标按钮据此显示按下态 */
  settingsOpen: boolean
  /** 点击菜单栏里的 Status Trio 图标 → 开合菜单栏下方的设置面板 */
  onToggleSettings: () => void
  theme: ThemePref
  onToggleTheme: () => void
  /** 桌面区已滚动：给菜单栏补一条分割线，避免内容从底下透上来糊在一起 */
  scrolled: boolean
}

/**
 * macOS 菜单栏：左侧 Apple logo + 应用菜单，右侧系统图标区。
 * Status Trio 的图标就长在右侧系统图标区里（和真实使用时一样），
 * 它既是状态显示，也是设置面板的开关。
 */
export function MacMenuBar({
  status,
  iconRef,
  settingsOpen,
  onToggleSettings,
  theme,
  onToggleTheme,
  scrolled,
}: Props) {
  const { t, lang, toggleLang } = useI18n()
  const time = useTimeLabel(lang)

  return (
    <header className={'lp-menubar' + (scrolled ? ' is-scrolled' : '')}>
      <span className="lp-menubar-item lp-menubar-apple" aria-hidden>
        <svg viewBox="0 0 384 512" width="16" height="16" fill="currentColor">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
      </span>
      <span className="lp-menubar-item lp-menubar-item--active">{APP.name}</span>
      {t.menu.map((item) => (
        <span key={item} className="lp-menubar-item">
          {item}
        </span>
      ))}

      <span className="lp-menubar-spacer" />

      <button
        type="button"
        className="lp-menubar-btn lp-menubar-lang"
        onClick={toggleLang}
        title={t.langLabel}
        aria-label={`${t.langLabel}: ${lang === 'zh' ? 'English' : '中文'}`}
      >
        {lang === 'zh' ? '中' : 'EN'}
      </button>
      <button
        type="button"
        className="lp-menubar-btn"
        onClick={onToggleTheme}
        title={t.themeLabel}
        aria-label={t.themeLabel}
      >
        {theme === 'light' ? '☀' : '☾'}
      </button>

      {/* 主角：Status Trio 就住在系统图标区，紧挨着控制中心。
          面板展开时按钮保持按下态，和真实的菜单栏高亮一致。 */}
      <button
        type="button"
        className="lp-menubar-app"
        ref={iconRef}
        data-open={settingsOpen}
        onClick={onToggleSettings}
        title={`${t.appLabel} — ${t.appHint}`}
        aria-label={`${t.appLabel} — ${t.appHint}`}
        aria-expanded={settingsOpen}
        aria-controls="settings-panel"
      >
        <StatusIcon state={status} size={APP.iconSize} />
      </button>

      <span className="lp-menubar-sysicon" aria-hidden>
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="8" x2="20" y2="8" />
          <circle cx="9" cy="8" r="2.4" fill="currentColor" stroke="none" />
          <line x1="4" y1="16" x2="20" y2="16" />
          <circle cx="15" cy="16" r="2.4" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="lp-menubar-sysicon lp-menubar-clock">{time}</span>
    </header>
  )
}

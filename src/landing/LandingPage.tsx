import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_STATUS,
  normalizeChargeDemoState,
  normalizeUnavailableBluetoothSelections,
  type StatusIconState,
} from '../status/StatusIcon'
import { MacMenuBar } from '../stage/MacMenuBar'
import { Hero } from '../sections/Hero'
import { StatusDock } from '../sections/StatusDock'
import { Features } from '../sections/Features'
import { MenubarPreview } from '../sections/MenubarPreview'
import { Screenshots } from '../sections/Screenshots'
import { Details } from '../sections/Details'
import type { SettingsCategoryId } from '../sections/SettingsPanel'
import { applyTheme, getThemePref, WALLPAPER, type ThemePref } from '../theme'
import '../styles/tokens.css'
import '../styles/landing.css'

/** 窄屏断点：与 landing.css 里 .pg-dock 那个媒体查询必须保持一致 */
const NARROW = '(max-width: 860px)'

/**
 * 页面根组件：一整张 macOS 桌面。
 * - 顶部是真实比例的菜单栏，Status Trio 的图标就长在右侧系统图标区；
 * - 点图标开合状态面板（默认打开）：App 弹层的模样，钉在图标正下方；
 * - 桌面区可滚动，放着首屏文案、功能列表、尺寸预览（右侧固定设置控件）与隐私说明；
 * - 图标状态提升到这里，菜单栏小图标、状态面板、设置控件与预览大图永远同源。
 *
 * 版本号 / 下载链接等发布信息是 `src/app.ts` 里的常量（发版手动改），这里不再有异步状态。
 */
export function LandingPage() {
  // 菜单栏上那个图标：状态面板停靠时要对准它的中心
  const iconRef = useRef<HTMLButtonElement>(null)
  const [theme, setTheme] = useState<ThemePref>(getThemePref)
  const [status, setStatus] = useState<StatusIconState>(DEFAULT_STATUS)
  const [scrolled, setScrolled] = useState(false)
  const [activeSettingsCategory, setActiveSettingsCategory] =
    useState<SettingsCategoryId>('appIcon')
  const settingsCategoryRequest = 0
  // 窄屏下面板退化成文档流里的一长条（见 landing.css 的 860px 断点），默认收起来，
  // 让首屏直接是文案；宽屏则默认打开，钉在菜单栏图标下方当主角。断点两处必须一致。
  const [panelOpen, setPanelOpen] = useState(() => !window.matchMedia(NARROW).matches)

  const patchStatus = useCallback((patch: Partial<StatusIconState>) => {
    setStatus((prev) => {
      const next = { ...prev, ...patch }
      const chargeNormalized = { ...next, ...normalizeChargeDemoState(next) }
      return {
        ...chargeNormalized,
        ...normalizeUnavailableBluetoothSelections(chargeNormalized),
      }
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemePref = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }, [])

  /** 点菜单栏里的图标 → 开合状态面板 */
  const togglePanel = useCallback(() => {
    const next = !panelOpen
    setPanelOpen(next)
    if (next && window.matchMedia(NARROW).matches) {
      requestAnimationFrame(() => {
        document.querySelector('.pg-dock')?.scrollIntoView({ block: 'start' })
      })
    }
  }, [panelOpen])

  // Ordinary popover dismissal: Escape anywhere, or a pointer outside the
  // panel and outside the menu-bar trigger. No timers or polling.
  useEffect(() => {
    if (!panelOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return
      if (iconRef.current?.contains(event.target)) return
      if (document.getElementById('status-panel')?.closest('.pg-dock-body')?.contains(event.target)) {
        return
      }
      setPanelOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanelOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [panelOpen])

  // 滚动阈值：只在跨越 2px 时改动 state。函数式 updater 返回同一个值，
  // React 会直接 bailout 掉这次更新，所以滚动过程中不会有多余的渲染。
  const onDesktopScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const next = e.currentTarget.scrollTop > 2
    setScrolled((prev) => (prev === next ? prev : next))
  }, [])

  // 壁纸 URL 在 public/ 里是固定路径，直接查表；主题切换时改 src，
  // 此时另一张图已在缓存中（首帧的 preload 只预热当前主题那张）。
  const wallpaper = WALLPAPER[theme]

  return (
    <div className="lp-stage">
      <img
        className="lp-wallpaper"
        src={wallpaper}
        alt=""
        fetchPriority="high"
        decoding="async"
        draggable={false}
      />
      <div className="lp-scrim" aria-hidden />

      <MacMenuBar
        status={status}
        iconRef={iconRef}
        panelOpen={panelOpen}
        onTogglePanel={togglePanel}
        theme={theme}
        onToggleTheme={toggleTheme}
        scrolled={scrolled}
      />

      <div className="lp-desktop" onScroll={onDesktopScroll}>
        <div className="lp-column">
          <StatusDock
            open={panelOpen}
            state={status}
            anchorRef={iconRef}
          />
          <Hero />
          <Features />
          <MenubarPreview
            state={status}
            activeSettingsCategory={activeSettingsCategory}
            settingsCategoryRequest={settingsCategoryRequest}
            onChange={patchStatus}
            onSelectSettingsCategory={setActiveSettingsCategory}
          />
          {/* 截图区：只有它需要知道主题（图标状态那张有浅 / 深两版） */}
          <Screenshots theme={theme} />
          <Details />
        </div>
      </div>
    </div>
  )
}

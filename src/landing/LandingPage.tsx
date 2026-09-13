import React, { useCallback, useEffect, useRef, useState } from 'react'
import { RELEASE_FALLBACK, fetchLatestRelease, type ReleaseInfo } from '../app'
import { DEFAULT_STATUS, type StatusIconState } from '../status/StatusIcon'
import { MacMenuBar } from '../stage/MacMenuBar'
import { Hero } from '../sections/Hero'
import { SettingsDock } from '../sections/SettingsDock'
import { Features } from '../sections/Features'
import { MenubarPreview } from '../sections/MenubarPreview'
import { Details } from '../sections/Details'
import { applyTheme, getThemePref, WALLPAPER, type ThemePref } from '../theme'
import '../styles/tokens.css'
import '../styles/landing.css'

/** 窄屏断点：与 landing.css 里 .pg-dock 那个媒体查询必须保持一致 */
const NARROW = '(max-width: 860px)'

const FALLBACK_RELEASE: ReleaseInfo = {
  tag: RELEASE_FALLBACK.tag,
  dmg: RELEASE_FALLBACK.dmg,
  size: RELEASE_FALLBACK.size,
  publishedAt: null,
}

/**
 * 页面根组件：一整张 macOS 桌面。
 * - 顶部是真实比例的菜单栏，Status Trio 的图标就长在右侧系统图标区；
 * - 设置面板默认钉在菜单栏正下方，往下滚会滑到「菜单栏实际尺寸」卡片右侧落位，
 *   之后跟着卡片一起滚，回到顶部再反向滑回来；
 * - 桌面区可滚动，放着首屏文案、功能列表、尺寸预览与隐私说明；
 * - 图标状态提升到这里，菜单栏小图标、设置面板与预览大图永远同源。
 */
export function LandingPage() {
  // 菜单栏上那个图标：设置面板停靠时要对准它的中心
  const iconRef = useRef<HTMLButtonElement>(null)
  // 预览卡右侧的落位槽：面板滚到那儿就滑进去（见 SettingsDock / MenubarPreview）
  const slotRef = useRef<HTMLDivElement>(null)
  // 面板实测宽度，预览行按它给落位槽留宽
  const [panelWidth, setPanelWidth] = useState(0)
  // 面板实测高度，预览卡按它对齐（两张卡上下沿齐平）
  const [panelHeight, setPanelHeight] = useState(0)
  const [theme, setTheme] = useState<ThemePref>(getThemePref)
  const [status, setStatus] = useState<StatusIconState>(DEFAULT_STATUS)
  const [release, setRelease] = useState<ReleaseInfo>(FALLBACK_RELEASE)
  const [scrolled, setScrolled] = useState(false)
  // 窄屏下面板退化成文档流里的一长条（见 landing.css 的 860px 断点），默认收起来，
  // 让首屏直接是文案；宽屏则默认展开，挂着菜单栏下方当主角。断点两处必须一致。
  const [settingsOpen, setSettingsOpen] = useState(() => !window.matchMedia(NARROW).matches)

  // 版本号 / DMG 直链取 GitHub 最新发布；失败则静默回落到内置兜底
  useEffect(() => {
    let alive = true
    void fetchLatestRelease().then((info) => {
      if (alive) setRelease(info)
    })
    return () => {
      alive = false
    }
  }, [])

  const patchStatus = useCallback((patch: Partial<StatusIconState>) => {
    setStatus((prev) => ({ ...prev, ...patch }))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemePref = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }, [])

  /** 点菜单栏里的图标 → 开合挂在菜单栏下方的设置面板。
   *  面板要是正跟着预览卡待在视野外（往下滚过它之后），先把那一行叫回视野再展开——
   *  不然这一下点下去什么都不会发生。 */
  const toggleSettings = useCallback(() => {
    const slot = slotRef.current
    const scroller = slot?.closest('.lp-desktop')
    if (slot && scroller) {
      const rect = slot.getBoundingClientRect()
      const box = scroller.getBoundingClientRect()
      if (rect.top < box.top - 1 || rect.top > box.bottom) {
        // block: 'start' 才会正好落在「面板已经落位」的那条线上（见 SettingsDock 的落位线）
        slot.scrollIntoView({ block: 'start' })
        setSettingsOpen(true)
        return
      }
    }
    setSettingsOpen((prev) => !prev)
  }, [])

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
        settingsOpen={settingsOpen}
        onToggleSettings={toggleSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
        scrolled={scrolled}
      />

      <div className="lp-desktop" onScroll={onDesktopScroll}>
        <div className="lp-column">
          <SettingsDock
            open={settingsOpen}
            state={status}
            onChange={patchStatus}
            anchorRef={iconRef}
            slotRef={slotRef}
            onWidth={setPanelWidth}
            onHeight={setPanelHeight}
          />
          <Hero release={release} />
          <Features />
          <MenubarPreview
            state={status}
            slotRef={slotRef}
            panelWidth={panelWidth}
            panelHeight={panelHeight}
          />
          <Details release={release} />
        </div>
      </div>
    </div>
  )
}

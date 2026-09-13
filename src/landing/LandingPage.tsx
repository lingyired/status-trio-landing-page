import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RELEASE_FALLBACK, fetchLatestRelease, type ReleaseInfo } from '../app'
import { DEFAULT_STATUS, type StatusIconState } from '../status/StatusIcon'
import { MacMenuBar } from '../stage/MacMenuBar'
import { Hero } from '../sections/Hero'
import { Playground } from '../sections/Playground'
import { Features } from '../sections/Features'
import { Details } from '../sections/Details'
import { applyTheme, getThemePref, type ThemePref } from '../theme'
import wallpaperDark from '../assets/wallpaper/dark.webp'
import wallpaperLight from '../assets/wallpaper/light.webp'
import '../styles/tokens.css'
import '../styles/landing.css'

const FALLBACK_RELEASE: ReleaseInfo = {
  tag: RELEASE_FALLBACK.tag,
  dmg: RELEASE_FALLBACK.dmg,
  size: RELEASE_FALLBACK.size,
  publishedAt: null,
}

/**
 * 页面根组件：一整张 macOS 桌面。
 * - 顶部是真实比例的菜单栏，Status Trio 的图标就长在右侧系统图标区；
 * - 桌面区可滚动，放着首屏文案、图标控制台、功能与隐私说明；
 * - 图标状态提升到这里，菜单栏小图标与控制台大图永远同源。
 */
export function LandingPage() {
  const [theme, setTheme] = useState<ThemePref>(getThemePref)
  const [status, setStatus] = useState<StatusIconState>(DEFAULT_STATUS)
  const [release, setRelease] = useState<ReleaseInfo>(FALLBACK_RELEASE)
  const [scrolled, setScrolled] = useState(false)
  const desktopRef = useRef<HTMLDivElement>(null)

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

  /** 点菜单栏里的图标 → 滚到控制台，顺便把焦点交给它 */
  const goToPlayground = useCallback(() => {
    desktopRef.current?.querySelector('#playground')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const onDesktopScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 2)
  }, [])

  const wallpaper = useMemo(
    () => (theme === 'light' ? wallpaperLight : wallpaperDark),
    [theme],
  )

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
        onIconClick={goToPlayground}
        theme={theme}
        onToggleTheme={toggleTheme}
        scrolled={scrolled}
      />

      <div className="lp-desktop" ref={desktopRef} onScroll={onDesktopScroll}>
        <div className="lp-column">
          <Hero release={release} />
          <Playground state={status} onChange={patchStatus} />
          <Features />
          <Details release={release} />
        </div>
      </div>
    </div>
  )
}

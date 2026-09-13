import React, { useCallback, useEffect, useRef, useState } from 'react'
import { RELEASE_FALLBACK, fetchLatestRelease, type ReleaseInfo } from '../app'
import { DEFAULT_STATUS, type StatusIconState } from '../status/StatusIcon'
import { MacMenuBar } from '../stage/MacMenuBar'
import { Hero } from '../sections/Hero'
import { Playground } from '../sections/Playground'
import { Features } from '../sections/Features'
import { Details } from '../sections/Details'
import { applyTheme, getThemePref, WALLPAPER, type ThemePref } from '../theme'
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

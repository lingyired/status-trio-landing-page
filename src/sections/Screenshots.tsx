import React, { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import type { ThemePref } from '../theme'
import { CloseMark } from './icons'

/**
 * 截图区：排在「菜单栏实际尺寸」预览下面，展示真机截图。
 *
 * 三个理由让它单独成组件（而不是塞进 MenubarPreview）：
 *  1. 它有交互（点图看大图），需要一个自己的弹层状态；
 *  2. 图不少，全部 `loading="lazy"` —— 滚动到跟前才开始下载，首屏不受影响；
 *  3. 图标状态那张有浅 / 深两版，按当前主题**只挂一张**（不是两张都塞进 DOM
 *     再靠 CSS 藏一张 —— 那样另一张迟早也会被浏览器拉下来，白花 120 KB）。
 *
 * 图片走 `public/screenshots/`：原样拷进 dist、文件名不带哈希，所以这里写死路径。
 * 换图 → 改下面的 `SHOTS` 表，再按 skill `release-netdisk-mirror` 同级那套
 * 转 webp 的流程重新压一遍。
 */

/** ⚠️ `w` / `h` 必须是与文件一致的**原始像素**：`<img>` 上给了宽高比，
 *  浏览器才能在图片到达之前把位置占好（懒加载 + 长列表最容易抖的就是这里）。 */
type Shot = { src: string; w: number; h: number }

const SHOTS = {
  dockDark: { src: './screenshots/dock-dark.webp', w: 1440, h: 810 },
  dockLight: { src: './screenshots/dock-light.webp', w: 1440, h: 810 },
  dockBt: { src: './screenshots/dock-bt.webp', w: 1440, h: 810 },
  dockIcons: { src: './screenshots/dock-icons.webp', w: 1400, h: 752 },
  iconStates: { src: './screenshots/icon-states.webp', w: 1788, h: 1844 },
  iconStatesDark: { src: './screenshots/icon-states-dark.webp', w: 1788, h: 1844 },
} satisfies Record<string, Shot>

export const Screenshots = React.memo(function Screenshots({ theme }: { theme: ThemePref }) {
  const { t } = useI18n()
  const s = t.screenshots
  /** 正在放大的那张；null = 没开 */
  const [zoom, setZoom] = useState<{ shot: Shot; caption: string } | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  // 与更新日志弹层同一套：Esc 关闭、打开期间锁住背景滚动、焦点交给关闭按钮
  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(null)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [zoom])

  const dock: { shot: Shot; caption: string }[] = [
    { shot: SHOTS.dockDark, caption: s.captions.dockDark },
    { shot: SHOTS.dockLight, caption: s.captions.dockLight },
    { shot: SHOTS.dockBt, caption: s.captions.dockBt },
  ]

  const iconsShot = { shot: SHOTS.dockIcons, caption: s.captions.dockIcons }
  // 浅色主题配浅底那张、深色主题配深底那张 —— 图是 app 自己渲的，两版都现成
  const statesShot = {
    shot: theme === 'light' ? SHOTS.iconStates : SHOTS.iconStatesDark,
    caption: s.captions.iconStates,
  }

  const card = ({ shot, caption }: { shot: Shot; caption: string }) => (
    <div className="shot" key={shot.src}>
      <button className="shot-btn" type="button" title={s.zoom} onClick={() => setZoom({ shot, caption })}>
        <img
          src={shot.src}
          width={shot.w}
          height={shot.h}
          alt={caption}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </button>
      <p className="shot-cap">{caption}</p>
    </div>
  )

  return (
    <section className="sec" id="screenshots">
      <header className="sec-head">
        <p className="sec-eyebrow">{s.eyebrow}</p>
        <h2 className="sec-title">{s.title}</h2>
        <p className="sec-desc">{s.desc}</p>
      </header>

      <div className="shot-group">
        <h3 className="shot-group-label">{s.dockGroup}</h3>
        <div className="shot-stack">{dock.map(card)}</div>
      </div>

      <div className="shot-group">
        <h3 className="shot-group-label">{s.iconsGroup}</h3>
        <div className="shot-stack">{card(iconsShot)}</div>
      </div>

      <div className="shot-group">
        <h3 className="shot-group-label">{s.statesGroup}</h3>
        <div className="shot-stack">{card(statesShot)}</div>
      </div>

      {zoom && (
        <div className="shot-overlay" onClick={() => setZoom(null)}>
          <button
            ref={closeRef}
            className="shot-close"
            type="button"
            aria-label={s.close}
            title={s.close}
            onClick={() => setZoom(null)}
          >
            <CloseMark size={16} />
          </button>
          {/* 点图不关：图比视口大时要能在里面拖动/滚动查看 */}
          <div
            className="shot-zoom"
            role="dialog"
            aria-modal="true"
            aria-label={zoom.caption}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={zoom.shot.src} width={zoom.shot.w} height={zoom.shot.h} alt={zoom.caption} />
          </div>
        </div>
      )}
    </section>
  )
})

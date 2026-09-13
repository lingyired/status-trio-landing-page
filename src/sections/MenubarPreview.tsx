import type { CSSProperties, RefObject } from 'react'
import { APP } from '../app'
import { StatusIcon, type StatusIconState } from '../status/StatusIcon'
import { useI18n } from '../i18n'
import { timeLabel } from '../stage/time'

interface Props {
  state: StatusIconState
  /** 设置面板滚过来时的落位槽：面板以它的左上角为自己的位置（见 SettingsDock） */
  slotRef: RefObject<HTMLDivElement | null>
  /** 面板实测宽度：槽位按它留宽，两者并排才不会挤到 */
  panelWidth: number
  /** 面板实测高度：卡片按它对齐高度，并排时上下沿齐平（没量到就是 0 → 走自适应） */
  panelHeight: number
}

/**
 * 菜单栏实际尺寸 + 放大预览：标签与说明同一行（说明靠右）→ 真实尺寸条带 → 放大图。
 * 右列空着等设置面板滚进来落位——滚到底时这一行就是「卡片 + 设置面板」两张并排，
 * 也就是原来控制台那一版的 layout；卡片高度由面板实测高度写进 --panel-h 撑起，
 * 所以落位后两张卡是齐平的（大图那一栏吸收多出来/差出来的高度）。
 * 「实际尺寸」那条带子与顶部菜单栏同尺寸、同来源（APP.iconSize），所见即所得。
 */
export function MenubarPreview({ state, slotRef, panelWidth, panelHeight }: Props) {
  const { t, lang } = useI18n()
  const p = t.preview

  return (
    <section className="sec" id="menubar-preview">
      <div
        className="pv-row"
        style={
          {
            '--panel-w': `${panelWidth}px`,
            // 首帧还没量到 → 不写这个变量，卡片走 height: auto（见 landing.css）
            '--panel-h': panelHeight ? `${panelHeight}px` : undefined,
          } as CSSProperties
        }
      >
        <div className="pg-preview card">
          <div className="pg-preview-head">
            <p className="pg-bar-label">{p.label}</p>
            <p className="pg-caption">{p.caption}</p>
          </div>

          <div className="pg-bar" aria-hidden>
            <span className="pg-bar-right">
              <StatusIcon state={state} size={APP.iconSize} />
              <svg className="pg-bar-cc" viewBox="0 0 24 24" width="17" height="17">
                <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <circle cx="9" cy="8" r="2.4" fill="currentColor" stroke="none" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                  <circle cx="15" cy="16" r="2.4" fill="currentColor" stroke="none" />
                </g>
              </svg>
              <span className="pg-bar-time">{timeLabel(lang)}</span>
            </span>
          </div>

          <div className="pg-hero">
            <StatusIcon state={state} size={216} className="pg-hero-icon" />
          </div>
        </div>

        {/* 空槽：只提供一个坐标，面板本体仍然长在 SettingsDock 里（一份状态，不分叉） */}
        <div className="pv-slot" ref={slotRef} aria-hidden />
      </div>
    </section>
  )
}

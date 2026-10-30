import { StatusIcon, type StatusIconState } from '../status/StatusIcon'
import {
  SettingsPanel,
  type SettingsCategoryId,
} from './SettingsPanel'
import { useI18n } from '../i18n'
import { timeLabel } from '../stage/time'

interface Props {
  state: StatusIconState
  activeSettingsCategory: SettingsCategoryId
  settingsCategoryRequest: number
  onChange: (patch: Partial<StatusIconState>) => void
  onSelectSettingsCategory: (category: SettingsCategoryId) => void
}

/**
 * 菜单栏实际尺寸 + 放大预览：标签与说明同一行（说明靠右）→ 真实尺寸条带 → 放大图。
 * 右列固定放着设置控件（.pv-slot）——曾经设置面板浮在菜单栏下方、滚到这里落位，
 * 现在那儿换成状态面板，这套控件就常驻在大图标右边，同一份状态两处实时联动。
 * 宽屏下两张卡等高靠 grid 拉伸（互相取最大行高），大图那栏用 flex-grow 吸收差值。
 * 「实际尺寸」那条带子与顶部菜单栏同尺寸、同来源（APP.iconSize），所见即所得。
 */
export function MenubarPreview({
  state,
  activeSettingsCategory,
  settingsCategoryRequest,
  onChange,
  onSelectSettingsCategory,
}: Props) {
  const { t, lang } = useI18n()
  const p = t.preview
  const showInMenuBar = state.appIconPlacement !== 'dock'
  const showInDock = state.appIconPlacement !== 'menuBar'

  return (
    <section className="sec" id="menubar-preview">
      <div className="pv-row">
        <div className="pg-preview card">
          <div className="pg-preview-head">
            <p className="pg-bar-label">{p.label}</p>
            <p className="pg-caption">{p.caption}</p>
          </div>

          <div className="pg-bar" aria-hidden>
            <span className="pg-bar-right">
              {showInMenuBar ? (
                <StatusIcon state={state} size={state.iconSize} />
              ) : (
                <span className="pg-placement-hidden">{p.menuBarHidden}</span>
              )}
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

          <div className="pg-dock-demo" data-background={state.dockBackground}>
            <p className="pg-bar-label">{p.dockLabel}</p>
            {showInDock ? (
              <div
                className="pg-dock-icon"
                data-background={state.dockBackground === 'system' ? 'system' : state.dockBackground}
              >
                <StatusIcon
                  state={state}
                  size={58}
                  label={`${p.dockLabel}: ${state.battery}%`}
                />
              </div>
            ) : (
              <p className="pg-placement-hidden">{p.dockHidden}</p>
            )}
          </div>
        </div>

        {/* 设置控件常驻右侧（窄屏退到卡片下面整宽排） */}
        <div className="pv-slot">
          <SettingsPanel
            state={state}
            activeCategory={activeSettingsCategory}
            onChange={onChange}
            onSelectCategory={onSelectSettingsCategory}
            scrollRequest={settingsCategoryRequest}
          />
        </div>
      </div>
    </section>
  )
}

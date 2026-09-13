import { StatusIcon, clamp, type StatusIconState, type WifiState } from '../status/StatusIcon'
import { Segmented, Select, Slider, Toggle } from '../status/controls'
import { APP } from '../app'
import { WIFI_STATE_ORDER } from '../copy'
import { useI18n } from '../i18n'
import { timeLabel } from '../stage/time'

interface Props {
  state: StatusIconState
  onChange: (patch: Partial<StatusIconState>) => void
}

/** 图标控制台：把 demo 页的选项原样搬过来，改动实时反映到顶部菜单栏的图标上。 */
export function Playground({ state, onChange }: Props) {
  const { t, lang } = useI18n()
  const p = t.playground

  return (
    <section className="sec" id="playground">
      <header className="sec-head">
        <p className="sec-eyebrow">{p.eyebrow}</p>
        <h2 className="sec-title">{p.title}</h2>
        <p className="sec-desc">{p.desc}</p>
      </header>

      <div className="pg-grid">
        <div className="pg-preview card">
          <p className="pg-bar-label">{p.previewBarLabel}</p>

          {/* 真实尺寸的菜单栏条带：让访客知道这图标平时有多小 */}
          <div className="pg-bar" aria-hidden>
            <span className="pg-bar-right">
              {/* 与顶部菜单栏同尺寸，所见即所得 */}
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
          <p className="pg-caption">{p.previewBarCaption}</p>

          <div className="pg-hero">
            <StatusIcon state={state} size={216} className="pg-hero-icon" />
          </div>
        </div>

        <div className="pg-controls card">
          <div className="pg-group">
            <h3 className="pg-group-title">{p.battery}</h3>
            <Slider
              label={p.batteryLevel}
              value={state.battery}
              min={0}
              max={100}
              display={`${state.battery}%`}
              onChange={(battery) => onChange({ battery: clamp(battery, 0, 100) })}
            />
            <Toggle
              label={p.lowPower}
              pressed={state.lowPower}
              onToggle={() => onChange({ lowPower: !state.lowPower })}
            />
            <Toggle
              label={p.charging}
              pressed={state.charging}
              onToggle={() => onChange({ charging: !state.charging })}
            />
            <Toggle
              label={p.showValue}
              pressed={state.showBatteryValue}
              onToggle={() => onChange({ showBatteryValue: !state.showBatteryValue })}
            />
            <p className="pg-hint">{p.lowPowerNote}</p>
          </div>

          <div className="pg-group">
            <h3 className="pg-group-title">{p.wifi}</h3>
            <Segmented
              label={p.wifiSignal}
              value={state.wifi}
              options={[
                { value: 0, label: p.none },
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
              ]}
              onChange={(wifi) => onChange({ wifi: clamp(wifi, 0, 3) })}
            />
            <Select
              label={p.wifiState}
              value={state.wifiState}
              options={WIFI_STATE_ORDER.map((key) => ({ value: key, label: t.wifiState[key] }))}
              onChange={(wifiState) => onChange({ wifiState: wifiState as WifiState })}
            />
          </div>

          <div className="pg-group">
            <h3 className="pg-group-title">{p.volume}</h3>
            <Segmented
              label={p.volume}
              value={state.volume}
              options={[
                { value: 0, label: p.muted },
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
              ]}
              onChange={(volume) => onChange({ volume: clamp(volume, 0, 4) })}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

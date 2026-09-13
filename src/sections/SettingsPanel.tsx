import { clamp, type StatusIconState, type WifiState } from '../status/StatusIcon'
import { Segmented, Select, Slider, Toggle } from '../status/controls'
import { WIFI_STATE_ORDER } from '../copy'
import { useI18n } from '../i18n'

interface Props {
  state: StatusIconState
  onChange: (patch: Partial<StatusIconState>) => void
}

/** 浮动设置面板的内容：App 设置里的三组选项原样搬过来，三列并排——正好对应产品名里的「三态」。
 *  改动实时反映到菜单栏图标上（同一份状态由页面根持有）。 */
export function SettingsPanel({ state, onChange }: Props) {
  const { t } = useI18n()
  const p = t.settings

  return (
    <div className="pg-panel card" id="settings-panel">
      <div className="pg-cols">
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

      <p className="pg-panel-hint">{p.hint}</p>
    </div>
  )
}

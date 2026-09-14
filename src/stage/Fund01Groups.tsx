import { FUND01_SITE } from '../app'
import { useI18n } from '../i18n'

/** 涨跌幅文本：上行带 `+`、下行带 `-`（负数自带），归零时既不带符号也不染色。 */
function pctText(pct: number): string {
  return `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`
}

/** 涨跌档位 → 配色类（涨红跌绿，与 Fund01 菜单栏同口径）。 */
function pctClass(pct: number): string {
  if (pct === 0) return 'lp-g-flat'
  return pct > 0 ? 'lp-g-rise' : 'lp-g-fall'
}

/**
 * 菜单栏里的 Fund01 联动分组：两个并排的两行小签（上行分组名、下行当日涨跌幅），
 * 排在 Status Trio 图标左边 —— 同一台 Mac 上，两个菜单栏小工具本来就这么挨着。
 * 点一下开新标签去 Fund01 落地页；文案缺失（英文页）时整块不渲染。
 */
export function Fund01Groups() {
  const { t } = useI18n()
  const f = t.fund01
  // 闸门就在文案本身：`en.fund01 = null` → 英文页一个节点都不多
  if (!f) return null

  return (
    <div className="lp-menubar-groups">
      {f.groups.map((g) => (
        <a
          key={g.name}
          className="lp-menubar-group"
          href={FUND01_SITE}
          target="_blank"
          rel="noreferrer"
          data-gname={g.name}
          title={f.hint}
          aria-label={`${f.groupAria} ${g.name}，${pctText(g.pct)}`}
        >
          <span className="lp-g-name">{g.name}</span>
          <span className={'lp-g-pct ' + pctClass(g.pct)}>{pctText(g.pct)}</span>
        </a>
      ))}
    </div>
  )
}

import React from 'react'
import { useI18n } from '../i18n'

/** 功能：一句话主标题 + 蓝牙音频补充。
 *  无 props → memo 之后只在语言切换时重渲染，图标状态怎么变都跟它无关。 */
export const Features = React.memo(function Features() {
  const { t } = useI18n()
  const f = t.features

  return (
    <section className="sec" id="features">
      <header className="sec-head">
        <p className="sec-eyebrow">{f.eyebrow}</p>
        <h2 className="sec-title">{f.line}</h2>
        <p className="sec-desc">{f.desc}</p>
      </header>
    </section>
  )
})

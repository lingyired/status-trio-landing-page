import React from 'react'
import { useI18n } from '../i18n'

/** 功能：只剩一句话 —— 一个图标三个状态（Wi-Fi、电池、音量）。
 *  无 props → memo 之后只在语言切换时重渲染，图标状态怎么变都跟它无关。 */
export const Features = React.memo(function Features() {
  const { t } = useI18n()
  const f = t.features

  return (
    <section className="sec" id="features">
      <header className="sec-head">
        <p className="sec-eyebrow">{f.eyebrow}</p>
        <h2 className="sec-title">{f.line}</h2>
      </header>
    </section>
  )
})

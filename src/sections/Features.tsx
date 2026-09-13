import React from 'react'
import { useI18n } from '../i18n'
import { FeatureIcon } from './icons'

/** 功能列表：只留产品名里的那三个状态（电池 / Wi-Fi / 音量），一个图标配一句话。
 *  无 props → memo 之后只在语言切换时重渲染，图标状态怎么变都跟它无关。 */
export const Features = React.memo(function Features() {
  const { t } = useI18n()
  const f = t.features

  return (
    <section className="sec" id="features">
      <header className="sec-head">
        <p className="sec-eyebrow">{f.eyebrow}</p>
        <h2 className="sec-title">{f.title}</h2>
      </header>

      <ul className="feat-grid">
        {f.items.map((item) => (
          <li className="feat card" key={item.icon}>
            <span className="feat-icon">
              <FeatureIcon name={item.icon} />
            </span>
            <p className="feat-text">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
})

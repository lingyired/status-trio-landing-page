import { useI18n } from '../i18n'
import { FeatureIcon } from './icons'

/** 功能列表：文案来自 README 的 Highlights，改写成面向使用者的说法。 */
export function Features() {
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
            <h3 className="feat-title">{item.title}</h3>
            <p className="feat-desc">{item.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

import appIcon from '../assets/app-icon.svg'
import { APP, type ReleaseInfo } from '../app'
import { useI18n } from '../i18n'
import { AppleMark, GitHubMark } from './icons'

/** 首屏：品牌 + 一句话定位 + 下载入口。 */
export function Hero({ release }: { release: ReleaseInfo }) {
  const { t } = useI18n()
  const h = t.hero

  return (
    <section className="sec hero">
      <div className="hero-brand">
        <img className="hero-icon" src={appIcon} width={54} height={54} alt="" draggable={false} />
        <span className="hero-brand-name">{APP.name}</span>
        <span className="hero-brand-tag">{h.eyebrow}</span>
      </div>

      <h1 className="hero-title">{h.title}</h1>
      <p className="hero-desc">{h.desc}</p>

      <div className="hero-cta">
        <a className="btn btn--primary" href={release.dmg} target="_blank" rel="noreferrer">
          <AppleMark size={15} />
          <span className="btn-body">
            <span className="btn-main">{h.ctaPrimary}</span>
            <span className="btn-sub">
              {release.tag} · {release.size}
            </span>
          </span>
        </a>
        <a className="btn btn--ghost" href={APP.repo} target="_blank" rel="noreferrer">
          <GitHubMark size={16} />
          <span className="btn-body">
            <span className="btn-main">{h.ctaSecondary}</span>
          </span>
        </a>
      </div>

      <a className="hero-all" href={APP.releases} target="_blank" rel="noreferrer">
        {h.ctaAll}
      </a>

      <ul className="hero-meta">
        <li>{h.metaOs}</li>
        <li>{h.metaArch}</li>
        <li>{h.metaNative}</li>
      </ul>

      <p className="hero-note">{h.disclaimer}</p>
    </section>
  )
}

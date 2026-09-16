import React from 'react'
import appIcon from '../assets/app-icon.svg'
import { APP, MIRRORS, RELEASE } from '../app'
import { useI18n } from '../i18n'
import { ChangelogDialog } from './ChangelogDialog'
import { AppleMark, BaiduMark, ClockMark, GitHubMark, QuarkMark } from './icons'

/** 首屏：品牌 + 一句话定位 + 下载入口。
 *  用 memo 包住：status（图标状态）由页面根持有，控制台滑杆每动一格都会让根重渲染，
 *  而这里读的全是常量 —— memo 把这些与它无关的更新挡在外面。 */
export const Hero = React.memo(function Hero() {
  const { t } = useI18n()
  const h = t.hero
  /** 更新日志弹层：版本号徽标点开 */
  const [changelogOpen, setChangelogOpen] = React.useState(false)
  const closeChangelog = React.useCallback(() => setChangelogOpen(false), [])

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
        <a className="btn btn--primary" href={RELEASE.dmg} target="_blank" rel="noreferrer">
          <AppleMark size={15} />
          <span className="btn-body">
            <span className="btn-main">{h.ctaPrimary}</span>
            <span className="btn-sub">
              {RELEASE.tag} · {RELEASE.size}
            </span>
          </span>
        </a>
        <a className="btn btn--ghost" href={APP.repo} target="_blank" rel="noreferrer">
          <GitHubMark size={16} />
          <span className="btn-body">
            <span className="btn-main">{h.ctaSecondary}</span>
          </span>
        </a>
        {/* 国内网盘镜像：与下方「系统要求」段同一份链接，只有中文文案带这段 */}
        {t.mirrors && (
          <>
            <a className="btn btn--ghost" href={MIRRORS.quark} target="_blank" rel="noreferrer">
              <QuarkMark size={16} />
              <span className="btn-body">
                <span className="btn-main">{t.mirrors.quark}</span>
              </span>
            </a>
            <a className="btn btn--ghost" href={MIRRORS.baidu} target="_blank" rel="noreferrer">
              <BaiduMark size={16} />
              <span className="btn-body">
                <span className="btn-main">{t.mirrors.baidu}</span>
              </span>
            </a>
          </>
        )}
      </div>

      <div className="hero-verline">
        <a className="hero-all" href={APP.releases} target="_blank" rel="noreferrer">
          {h.ctaAll}
        </a>
        {/* 版本号：点开是全部版本的更新日志（数据在 src/release-notes.json，不联网） */}
        <button
          type="button"
          className="hero-ver"
          onClick={() => setChangelogOpen(true)}
          title={t.changelog.hint}
          aria-haspopup="dialog"
        >
          <ClockMark size={12} />
          {RELEASE.tag} · {t.changelog.cta}
        </button>
      </div>

      <ul className="hero-meta">
        <li>{h.metaOs}</li>
        <li>{h.metaArch}</li>
        <li>{h.metaNative}</li>
        <li>{h.metaSafe}</li>
      </ul>

      <p className="hero-note">{h.disclaimer}</p>

      <ChangelogDialog open={changelogOpen} onClose={closeChangelog} />
    </section>
  )
})

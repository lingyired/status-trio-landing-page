import React from 'react'
import { APP, MIRRORS, type ReleaseInfo } from '../app'
import { useI18n } from '../i18n'
import { AlertMark, AppleMark, DownloadMark, GitHubMark } from './icons'
import { Troubleshoot } from './Troubleshoot'

/** 隐私说明 + 系统要求（含下载收尾）+ 页脚。
 *  用 memo 包住：子树最重（内含 Troubleshoot 的两张排障卡片），而它只依赖 release，
 *  不该跟着控制台滑杆的高频更新一起 reconcile。 */
export const Details = React.memo(function Details({ release }: { release: ReleaseInfo }) {
  const { t } = useI18n()

  return (
    <>
      <section className="sec" id="privacy">
        <header className="sec-head">
          <p className="sec-eyebrow">{t.privacy.eyebrow}</p>
          <h2 className="sec-title">{t.privacy.title}</h2>
        </header>
        <ul className="bullets card">
          {t.privacy.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="sec" id="requirements">
        <header className="sec-head">
          <p className="sec-eyebrow">{t.requirements.eyebrow}</p>
          <h2 className="sec-title">{t.requirements.title}</h2>
        </header>

        <div className="req card">
          <ul className="req-list">
            {t.requirements.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="req-source-hint">{t.requirements.sourceHint}</p>
          <pre className="req-code">
            <code>{t.requirements.sourceCmd}</code>
          </pre>
        </div>

        <div className="req-cta">
          <a className="btn btn--primary btn--lg" href={release.dmg} target="_blank" rel="noreferrer">
            <AppleMark size={16} />
            <span className="btn-body">
              <span className="btn-main">{t.requirements.cta}</span>
              <span className="btn-sub">
                {release.tag} · {t.requirements.ctaSub} · {release.size}
              </span>
            </span>
          </a>
          <a className="req-all" href={APP.releases} target="_blank" rel="noreferrer">
            <DownloadMark size={14} /> {t.hero.ctaAll}
          </a>
          <a className="req-trouble" href="#troubleshoot">
            <AlertMark size={14} /> {t.troubleshoot.navHint}
          </a>
        </div>

        {/* 国内网盘镜像：只有中文文案带这段（t.mirrors 为 null 时整块不渲染） */}
        {t.mirrors && (
          <div className="req-mirrors">
            <span className="req-mirrors-label">{t.mirrors.label}</span>
            <a className="req-mirror" href={MIRRORS.quark} target="_blank" rel="noreferrer">
              <DownloadMark size={14} />
              {t.mirrors.quark}
            </a>
            <a className="req-mirror" href={MIRRORS.baidu} target="_blank" rel="noreferrer">
              <DownloadMark size={14} />
              {t.mirrors.baidu}
              <span className="req-mirror-code">
                {t.mirrors.code} {MIRRORS.baiduCode}
              </span>
            </a>
          </div>
        )}
      </section>

      <Troubleshoot />

      <footer className="lp-footer">
        <div className="lp-footer-left">
          <a className="lp-footer-link" href={APP.repo} target="_blank" rel="noreferrer">
            <GitHubMark size={14} /> {t.footer.links.repo}
          </a>
          <a className="lp-footer-link" href={APP.releases} target="_blank" rel="noreferrer">
            {t.footer.links.releases}
          </a>
          <a className="lp-footer-link" href={APP.site} target="_blank" rel="noreferrer">
            {t.footer.links.site}
          </a>
        </div>
        <p className="lp-footer-note">
          {t.footer.note}
          <span className="lp-footer-sep">·</span>
          <a className="lp-footer-link lp-footer-link--plain" href={APP.author} target="_blank" rel="noreferrer">
            {t.footer.madeBy}
          </a>
        </p>
      </footer>
    </>
  )
})

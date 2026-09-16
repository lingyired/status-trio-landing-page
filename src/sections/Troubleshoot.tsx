import { useI18n } from '../i18n'
import { rich } from '../rich'
import { AlertMark, CopyButton, MenuBarMark } from './icons'

/**
 * 排障：安装后打不开。
 * 两种情形 —— ① 未公证被 Gatekeeper 拦下；② 纯菜单栏应用（LSUIElement）
 * 打开后没有窗口和 Dock 图标，容易被当成「没启动」。
 */
export function Troubleshoot() {
  const { t } = useI18n()
  const p = t.troubleshoot

  return (
    <section className="sec" id="troubleshoot">
      <header className="sec-head">
        <p className="sec-eyebrow">{p.eyebrow}</p>
        <h2 className="sec-title">{p.title}</h2>
        <p className="sec-desc">{p.desc}</p>
      </header>

      <div className="fix-list">
        <article className="fix card">
          <header className="fix-head">
            <span className="fix-icoframe" aria-hidden>
              <AlertMark size={15} />
            </span>
            <h3 className="fix-title">{p.gatekeeper.title}</h3>
          </header>

          <p className="fix-p">{rich(p.gatekeeper.body)}</p>
          <p className="fix-warn">{p.gatekeeper.warn}</p>

          <ol className="fix-steps" aria-label={p.stepsLabel}>
            {p.gatekeeper.steps.map((step, i) => (
              <li key={step}>
                <span className="fix-stepnum" aria-hidden>
                  {i + 1}
                </span>
                <span>{rich(step)}</span>
              </li>
            ))}
          </ol>

          <p className="fix-p">{rich(p.gatekeeper.cmdIntro)}</p>

          <div className="fix-codepill">
            <code className="fix-codepill-text">{p.gatekeeper.cmd}</code>
            <CopyButton text={p.gatekeeper.cmd} labels={{ copy: p.copy, copied: p.copied }} />
          </div>

          <p className="fix-p">{rich(p.gatekeeper.cmdNote)}</p>
        </article>

        <article className="fix card">
          <header className="fix-head fix-head--menubar">
            <span className="fix-icoframe" aria-hidden>
              <MenuBarMark size={15} />
            </span>
            <h3 className="fix-title">{p.menubar.title}</h3>
          </header>

          {p.menubar.paras.map((para) => (
            <p className="fix-p" key={para}>
              {rich(para)}
            </p>
          ))}
        </article>
      </div>
    </section>
  )
}

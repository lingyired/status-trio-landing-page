import { useEffect, useMemo, useRef } from 'react'
import { APP } from '../app'
import { RELEASE_NOTES, toChangelog } from '../changelog'
import { useI18n } from '../i18n'
import { rich } from '../rich'
import { ClockMark, CloseMark } from './icons'

/**
 * 更新日志弹层：首屏那个版本号徽标点开就是它。
 *
 * 数据是仓库里 `src/release-notes.json` 的快照（发版时手动刷，见 `scripts/snapshot-releases.sh`），
 * **不联网、没有加载态** —— 打开即渲染。拿到的是中英混排原文，按当前语言拆好再渲染，
 * 所以切换语言时列表会立刻跟着换（解析结果走 memo）。
 *
 * 关闭方式：Esc / 点遮罩 / 右上角按钮。
 */
export function ChangelogDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n()
  const c = t.changelog
  const closeRef = useRef<HTMLButtonElement | null>(null)

  // Esc 关闭；打开期间锁住背景滚动，并把焦点交给关闭按钮
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  const entries = useMemo(() => toChangelog(RELEASE_NOTES, lang), [lang])

  if (!open) return null

  return (
    <div className="cl-overlay" onClick={onClose}>
      <div
        className="cl"
        role="dialog"
        aria-modal="true"
        aria-label={c.title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cl-head">
          <span className="cl-icoframe" aria-hidden>
            <ClockMark size={14} />
          </span>
          <div className="cl-headtext">
            <h2 className="cl-title">{c.title}</h2>
            <p className="cl-sub">{c.sub}</p>
          </div>
          <button
            ref={closeRef}
            className="cl-close"
            type="button"
            aria-label={c.close}
            title={c.close}
            onClick={onClose}
          >
            <CloseMark size={15} />
          </button>
        </header>

        <div className="cl-list">
          {/* 快照万一为空（被人删了 / 解析不出内容）时的兜底 */}
          {entries.length === 0 && (
            <p className="cl-empty">
              {c.empty}{' '}
              <a href={APP.releases} target="_blank" rel="noreferrer">
                {c.emptyLink}
              </a>
            </p>
          )}

          {entries.map((entry, i) => (
            <article className="cl-entry" key={entry.tag}>
              <header className="cl-entry-head">
                <span className="cl-ver">{entry.tag}</span>
                {i === 0 && <span className="cl-latest">{c.latest}</span>}
                {entry.date && (
                  <span className="cl-date">
                    {c.published} {entry.date}
                  </span>
                )}
              </header>

              {entry.blocks.map((block, j) => {
                if (block.kind === 'h') {
                  return (
                    <h3 className="cl-h" key={j}>
                      {rich(block.text)}
                    </h3>
                  )
                }
                if (block.kind === 'p') {
                  return (
                    <p className="cl-p" key={j}>
                      {rich(block.text)}
                    </p>
                  )
                }
                return (
                  <ul className="cl-notes" key={j}>
                    {block.items.map((item, k) => (
                      <li key={k}>{rich(item)}</li>
                    ))}
                  </ul>
                )
              })}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

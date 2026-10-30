import { useEffect, useId, useRef, useState } from 'react'
import { CloseMark, CopyMark } from './icons'

const QQ_GROUP_NUMBER = '735856753'
const WECHAT_QR_SRC = './community/wechat-group-2026-10-30.png'
const WECHAT_QR_EXPIRY = Date.parse('2026-11-06T00:00:00+08:00')

type CopyState = 'idle' | 'copied' | 'failed'

export function wechatQrIsExpired(now: Date): boolean {
  return now.getTime() >= WECHAT_QR_EXPIRY
}

/**
 * Chinese-only community entry. QQ uses the clipboard only; WeChat opens the
 * supplied invitation image in a native modal dialog. No group URL is implied.
 */
export function CommunityLinks() {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const wechatButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const resetTimer = useRef<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [qrExpired, setQrExpired] = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    },
    [],
  )

  useEffect(() => {
    if (!dialogOpen) return
    const dialog = dialogRef.current
    if (!dialog) return

    if (!dialog.open) dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      if (dialog.open) dialog.close()
    }
  }, [dialogOpen])

  const copyQQ = async () => {
    try {
      await navigator.clipboard.writeText(QQ_GROUP_NUMBER)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopyState('idle'), 2400)
  }

  const openWechatDialog = () => {
    setQrExpired(wechatQrIsExpired(new Date()))
    setDialogOpen(true)
  }

  const closeWechatDialog = () => dialogRef.current?.close()

  const handleDialogClosed = () => {
    setDialogOpen(false)
    window.requestAnimationFrame(() => wechatButtonRef.current?.focus())
  }

  const copyMessage =
    copyState === 'copied'
      ? '群号已复制'
      : copyState === 'failed'
        ? `复制失败，请手动记录 ${QQ_GROUP_NUMBER}`
        : ''

  return (
    <div className="community-links">
      <div className="community-links-head">
        <span className="community-links-label">交流反馈</span>
        <div className="community-links-actions">
          <button
            type="button"
            className="community-action community-action--qq"
            aria-label={`复制 QQ 群号 ${QQ_GROUP_NUMBER}`}
            onClick={copyQQ}
          >
            <span className="community-service">QQ</span>
            <span className="community-number">{QQ_GROUP_NUMBER}</span>
            <CopyMark size={12} />
          </button>
          <button
            ref={wechatButtonRef}
            type="button"
            className="community-action community-action--wechat"
            aria-haspopup="dialog"
            aria-expanded={dialogOpen}
            onClick={openWechatDialog}
          >
            <WechatMark />
            <span>微信群</span>
            <span className="community-action-meta">扫码加入</span>
          </button>
        </div>
      </div>
      <p className="community-links-status" role="status" aria-live="polite">
        {copyMessage}
      </p>

      <dialog
        ref={dialogRef}
        className="community-dialog"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={handleDialogClosed}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeWechatDialog()
        }}
      >
        <div className="community-dialog-panel">
          <header className="community-dialog-head">
            <div>
              <p className="community-dialog-kicker">微信社区</p>
              <h2 id={titleId}>Status trio 微信交流群</h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="community-dialog-close"
              aria-label="关闭微信群二维码"
              onClick={closeWechatDialog}
            >
              <CloseMark size={16} />
            </button>
          </header>

          {dialogOpen && !qrExpired ? (
            <figure className="community-qr">
              <img
                src={WECHAT_QR_SRC}
                width={720}
                height={1094}
                alt="Status trio 微信群邀请二维码"
                draggable={false}
              />
              <figcaption id={descriptionId}>
                该二维码 <strong>2026年11月6日前有效</strong>。请在有效期内使用微信扫码加入。
              </figcaption>
            </figure>
          ) : qrExpired ? (
            <div className="community-dialog-expired">
              <strong>微信群邀请已过期</strong>
              <p id={descriptionId}>
                该二维码仅在 2026年11月6日前有效，现已停止显示。可继续添加 QQ 群。
              </p>
            </div>
          ) : null}

          <div className="community-dialog-qq">
            <span>QQ 群</span>
            <code>{QQ_GROUP_NUMBER}</code>
            <button type="button" onClick={copyQQ}>
              <CopyMark size={12} />
              复制
            </button>
          </div>
          <p className="community-dialog-status" role="status" aria-live="polite">
            {copyMessage}
          </p>
        </div>
      </dialog>
    </div>
  )
}

function WechatMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M10.1 5.2c-4.1 0-7.4 2.7-7.4 6 0 1.9 1.1 3.6 2.9 4.7l-.7 2.5 2.8-1.4c.8.2 1.6.4 2.4.4 4.1 0 7.4-2.7 7.4-6.1s-3.3-6.1-7.4-6.1z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.3 10.3c3.1 0 5.6 2 5.6 4.6 0 1.4-.8 2.7-2.1 3.6l.5 1.9-2.1-1.1c-.6.2-1.2.3-1.9.3-3.1 0-5.6-2-5.6-4.7 0-2.5 2.5-4.6 5.6-4.6z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="7.7" cy="10.2" r=".8" fill="currentColor" />
      <circle cx="12.4" cy="10.2" r=".8" fill="currentColor" />
      <circle cx="12.6" cy="14.5" r=".7" fill="currentColor" />
      <circle cx="16.4" cy="14.5" r=".7" fill="currentColor" />
    </svg>
  )
}

import { useEffect, useRef, useState } from 'react'
import { HOMEBREW } from '../app'
import { useI18n } from '../i18n'
import { CopyMark } from './icons'

type CopyState = 'idle' | 'copied' | 'failed'

interface Props {
  variant?: 'compact' | 'full'
}

/** Website-only command helper. It copies the official cask command and never
 * runs Homebrew or asks for elevated privileges. */
export function HomebrewInstall({ variant = 'compact' }: Props) {
  const { t } = useI18n()
  const p = t.homebrew
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const resetTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    },
    [],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(HOMEBREW.command)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopyState('idle'), 2200)
  }

  const result =
    copyState === 'copied' ? p.copied : copyState === 'failed' ? p.copyFailed : p.copyHint

  return (
    <div className={`brew-install is-${variant}`}>
      <div className="brew-install-copy">
        <span className="brew-install-kicker">{p.kicker}</span>
        <code className="brew-install-command">{HOMEBREW.command}</code>
      </div>
      <button
        type="button"
        className="brew-install-button"
        aria-label={`${p.copy}: ${HOMEBREW.command}`}
        onClick={copy}
      >
        <CopyMark size={13} />
        {p.copy}
      </button>
      <p className="brew-install-result" role="status" aria-live="polite">
        {result}
      </p>
    </div>
  )
}

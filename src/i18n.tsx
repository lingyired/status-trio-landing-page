import React, { useCallback, useContext, useEffect, useMemo, useState, createContext } from 'react'
import { COPY, type Copy, type Lang } from './copy'

interface LangContextValue {
  lang: Lang
  t: Copy
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const LangContext = createContext<LangContextValue | null>(null)

const STORAGE_KEY = 'status-trio.landing.lang'

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') return stored
  } catch {
    /* localStorage 不可写时忽略 */
  }
  const candidates = [navigator.language, ...(navigator.languages ?? [])]
  return candidates.some((l) => l.toLowerCase().startsWith('zh')) ? 'zh' : 'en'
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* 忽略写入失败 */
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === 'zh' ? 'en' : 'zh'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* 忽略写入失败 */
      }
      return next
    })
  }, [])

  useEffect(() => {
    const t = COPY[lang]
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    document.title = t.html.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', t.html.description)
  }, [lang])

  const value = useMemo<LangContextValue>(
    () => ({ lang, t: COPY[lang], setLang, toggleLang }),
    [lang, setLang, toggleLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useI18n(): LangContextValue {
  const value = useContext(LangContext)
  if (!value) throw new Error('useI18n 必须在 <LangProvider> 内使用')
  return value
}

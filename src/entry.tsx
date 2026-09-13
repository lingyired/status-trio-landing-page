import React from 'react'
import { createRoot } from 'react-dom/client'
import { LandingPage } from './landing/LandingPage'
import { LangProvider } from './i18n'
import { initTheme } from './theme'

// 主题在 React 挂载前同步写入 <html data-theme>，避免第一帧按错误的色阶绘制
initTheme()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <LandingPage />
    </LangProvider>
  </React.StrictMode>,
)

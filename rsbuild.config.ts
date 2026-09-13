import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

// Status Trio landing page —— 单页应用，无外部依赖（仅 React）。
// 页面本身是一张 macOS 桌面：顶部菜单栏里嵌着 Status Trio 图标，桌面区是可滚动的内容。
export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/entry.tsx',
    },
  },
  output: {
    distPath: { root: 'dist' },
    assetPrefix: './',
    // WorkBuddy fs shim 与 rspack 的「先清空再 mkdir」时序冲突（clean 后并行 mkdir
    // dist/static/js 撞 ENOENT）。关掉自动清理，构建前由 prebuild 脚本清产物目录。
    cleanDistPath: false,
  },
  html: {
    template: './src/index.html',
    title: 'Status Trio · 三个系统状态，一个菜单栏图标',
    favicon: './src/assets/favicon/app-icon-128.png',
  },
})

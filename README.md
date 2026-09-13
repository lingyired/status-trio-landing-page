# Status Trio Landing Page

[Status Trio](https://github.com/lingyired/status-trio) 的产品落地页。

形态是一张 macOS 桌面：顶部是真实的菜单栏，**Status Trio 的状态图标就长在右侧系统图标区里**，跟着桌面区「图标控制台」的状态实时变化；桌面区域可滚动，承载 Hero、可调图标 demo、特性、隐私、系统要求、排障与页脚。没有 Windows 任务栏。

图标本身来自 [`status-menubar-demo.html`](https://github.com/lingyired/status-trio)，按逐像素等价的几何移植为 React 组件（见下文「图标几何」）。

## 技术栈

Rsbuild + React 19 + TypeScript。样式为本地 CSS（`src/styles/tokens.css` 设计变量 + `src/styles/landing.css`），运行时依赖只有 `react` / `react-dom`。

## 开发

```bash
corepack pnpm dev          # 本机 pnpm 不在 PATH，走 corepack
corepack pnpm run typecheck
corepack pnpm run build
corepack pnpm preview
```

若 pnpm 全局 store 不可写，用项目内 store 安装后删掉该目录：

```bash
corepack pnpm install --store-dir "$PWD/.pnpm-store"
```

## 结构

```
src/
  app.ts                  品牌常量 + GitHub 发布信息（版本 / 体积 / 下载链接运行时拉取，失败回落内置值）
  copy.ts                 中英双语文案字典（zh 为基准，en 由 Copy 类型约束，键必须成对）
  i18n.tsx                语言上下文：默认跟随浏览器语言，localStorage 持久化
  theme.ts                深浅主题：默认跟随系统，可手动切换
  status/StatusIcon.tsx   120×120 状态图标（电池弧 + Wi-Fi 三档 + 音量五档），纯数据驱动
  status/controls.tsx     控制台控件（滑杆 / 开关 / 分段 / 下拉）
  stage/MacMenuBar.tsx    macOS 菜单栏，含系统图标区里的 Status Trio 图标
  stage/time.ts           菜单栏时钟
  sections/               Hero / Playground / Features / Troubleshoot / Details
  styles/                 tokens.css（设计变量，含 dark / light 两套）+ landing.css
```

## 图标几何

电池弧是一条 242.6° 的大弧（`pathLength=100`），缺口开在弧顶用来放电量数字或充电闪电。

**缺口用 `<mask>` 挖，不要编进 `stroke-dasharray`。** 曾经的做法是把缺口直接写进 dash 列表，导致填充弧的段数随电量在 2 段 / 4 段之间跳；浏览器对长度不同的 dash 列表插值时会把短的那条循环补齐再逐段插值，于是多出一个白段沿圆弧滑走（幽灵动画）。现在的实现：

- 弧外用一层 mask：黑底 rect + 白色虚线（同一条弧、`strokeLinecap="round"`、dash 只与缺口宽度有关），白虚线两端的圆头即缺口圆头；
- 填充弧的 dash 恒定 `${battery} ${100 - battery + 4}`，**永远两段**，过渡只会等比伸缩；
- mask 只套弧线本体，不含数字与闪电 —— 缺口位置正是它们待的地方。

**通用规则**：给 SVG 加 `transition: stroke-dasharray` 之前，先确认所有状态下的段数一致。段数会变的场合，把「挖洞」交给 mask / clip。

## 许可

[Apache-2.0](./LICENSE)

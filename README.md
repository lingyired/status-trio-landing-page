# Status Trio Landing Page

**在线预览**：<https://statustrio.lingai.net/>（镜像入口：<https://lingai.net/statustrio/>）

[Status Trio](https://github.com/lingyired/status-trio) 的产品落地页。

形态是一张 macOS 桌面：顶部是真实的菜单栏，**Status Trio 的状态图标就长在右侧系统图标区里**；菜单栏正下方浮着一块设置面板，**以那个图标的中心为锚点、贴边时用尖角指回去**（宽屏默认展开，点菜单栏图标开合），面板里改什么，菜单栏图标立刻跟着变；一进页面**首屏文案就顶在内容列最上沿、与面板顶端齐平**（面板浮在右上、文案只占左边的空档，够宽时才并排，放不下就退回排在面板下面）。往下滚到「菜单栏实际尺寸」那张卡时，面板会跟着滚动滑到它右边落位、之后随卡片一起滚，回到顶部再反向滑回来 —— 也就是恢复卡片与设置并排的那版 layout（卡片高度取面板实测高度，两张卡上下沿齐平）。桌面区域可滚动，依次是 Hero、一句话说明功能（一个图标三个状态）、菜单栏尺寸预览、隐私、系统要求、排障与页脚。没有 Windows 任务栏。

图标本身来自 [`status-menubar-demo.html`](https://github.com/lingyired/status-trio)，按逐像素等价的几何移植为 React 组件（见下文「图标几何」）。

## 技术栈

Rsbuild + React 19 + TypeScript。样式为本地 CSS（`src/styles/tokens.css` 设计变量 + `src/styles/landing.css`），运行时依赖只有 `react` / `react-dom`。

卡片与面板的材质（底色 + 不透明度）是**对着 App 真实弹层截图实测标定**的，不靠手感：弹层内部实测 rgb(30,35,44)、在 20px 跨度内完全恒定，也就是说它是一块近乎不透明的板子，于是卡片定为深色 `rgba(30,34,44,0.9)` / 浅色 `rgba(255,255,255,0.9)`，观感均值与弹层基本重合（壁纸透上来的色阶跨度从 4 压到 1）。边框保持 `rgba(255,255,255,0.10)` —— 弹层边线实测就是这个值。**菜单栏反过来保持半透明**（0.7 / 0.76），因为真 macOS 菜单栏本来就能透出后面的窗口，这层反差正是原生质感的一部分。

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

## 发布新版

页面**不连任何第三方接口**：版本号、下载链接、更新日志全部是仓库里的快照，发版后手动同步三处。

```bash
./scripts/snapshot-releases.sh     # 刷新 src/release-notes.json（更新日志弹层的数据源）
corepack pnpm run build
./deploy.sh
```

1. `src/app.ts` 的 `RELEASE` —— `tag` / `size`（口径 = 资产字节 ÷ 1048576 保留 1 位）/ `dmg` 链接；
2. `src/app.ts` 的 `MIRRORS` —— 重新上传两个网盘并换上新的分享链接（**旧链接会挂着旧版 DMG**）；
3. `src/release-notes.json` —— 由上面的脚本从 GitHub releases 重新快照，弹层直接读它；
4. 界面有变化时：换 `public/screenshots/*.webp`，并**回头看一眼文案有没有过期**
   （v1.1.0 加了程序坞模式，「没有 Dock 图标」那套说法就是这时候改掉的）。

## 结构

```
src/
  app.ts                  品牌常量 + 当前发布快照（版本 / 体积 / DMG 链接 / 网盘镜像，发版手动改）
  release-notes.json      更新日志弹层的数据源：release 正文的本地快照，由脚本刷新
  changelog.ts            把 release note（中英混排 markdown）按语言拆成可渲染的块
  copy.ts                 中英双语文案字典（zh 为基准，en 由 Copy 类型约束，键必须成对）
  rich.tsx                极简行内富文本（`**粗体**` + `` `行内代码` ``）
  i18n.tsx                语言上下文：默认跟随浏览器语言，localStorage 持久化
  theme.ts                深浅主题：默认跟随系统，可手动切换
  status/StatusIcon.tsx   120×120 状态图标（电池弧 + Wi-Fi 三档 + 音量五档），纯数据驱动
  status/controls.tsx     设置面板控件（滑杆 / 开关 / 分段 / 下拉）
  stage/MacMenuBar.tsx    macOS 菜单栏，含系统图标区里的 Status Trio 图标（兼设置面板开关）
  stage/time.ts           菜单栏时钟
  sections/               Hero（含更新日志弹层 ChangelogDialog）/ SettingsDock + SettingsPanel
                          （浮动设置面板，滚动时落到 MenubarPreview 右侧的槽位）/ Features（一句话）/
                          MenubarPreview / Screenshots（真机截图，懒加载 + 点开看大图）/ Troubleshoot / Details
  styles/                 tokens.css（设计变量，含 dark / light 两套）+ landing.css
```

`public/` 里的东西原样拷进 `dist/` 根、文件名不带哈希，所以代码里按固定路径引用：

```
public/
  og.jpg                  社交分享图（`src/index.html` 里写的是绝对 URL）
  wallpaper/*.webp        桌面壁纸，首帧由 index.html 的内联脚本按主题预加载
  screenshots/*.webp      截图区素材；源图在 App 仓库的 `screenshots/`，压成 WebP 后放这儿
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

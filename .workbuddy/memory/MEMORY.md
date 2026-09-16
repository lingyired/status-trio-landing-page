# status-trio-landing-page — 项目约定

`lingyired/status-trio`（macOS 菜单栏小工具 Status Trio）的落地页：Rsbuild + React，无 UI 库。
**布局 / 浮动面板几何见同目录 `LAYOUT.md`，改布局前必读。**

## 硬约定

1. 运行时只有 react / react-dom，样式全本地 CSS（对齐 fund01 landing）。
2. **视觉常量回源 App 源码**（`duo-menubar/Sources/StatusTrioCore/`）：`defaultIconSize = 28`、
   范围 `20...32`；画布 120 / 弧半径 51.5 / 缺口宽 数字 64、闪电 50；闪电倍率 = 字形高 ÷ 闪电高
   × 220 ÷ 180。图标尺寸统一走 `APP.iconSize`（`src/app.ts`），栏高留余量（28px → 36px）。
3. **不开浏览器自测**。验证链 = `tsc --noEmit` + `corepack pnpm run build` + 产物 grep
   +（几何类）数值核算；视觉交用户目视。
4. **部署 / 提交是红线**：没说「部署」不动 nginx / rsync；git 只在用户说了才 commit / push。
5. 中英双语（`src/copy.ts`，zh 为基准、en 受 `Copy` 约束）；主题默认跟随系统。
6. **同一文件的多处修改必须串行 Edit**（并行会互相覆盖），跨文件才并行。
7. SVG 上做 `transition: stroke-dasharray` 前先确认各状态 dash 段数一致，否则虚线段沿路径滑动
   → 挖洞交给 `<mask>`，dash 列表保持恒定段数（`StatusIcon.tsx`）。
8. **产品事实回源核对**：DMG 内是 `Status Trio.app`（带空格，命令行要引号）；**ad-hoc 签名未公证**
   → Gatekeeper 会拦；无主窗口，「打开没反应」属正常（1.1 起图标可放菜单栏 / 程序坞 / 两处，
   默认菜单栏）—— 排障章节只写 macOS，**不写 Windows SmartScreen**。
   ⚠️ 2026-09-16：v1.1.0 加了程序坞模式，「纯菜单栏应用 / 没有 Dock 图标」那套说法**已全部改掉**
   （`hero` 段 + `troubleshoot.menubar` + `html.description`），别再写回去。
9. **页面不连任何第三方接口**（2026-09-16 起；之前那套运行时拉 `api.github.com` 已整个拿掉）。
   发布信息全是仓库里的手动快照，**发新版要动三处**：`src/app.ts` 的 `RELEASE`（tag / 体积 /
   DMG 链接）+ 同文件的 `MIRRORS`（重传网盘、换链接）+ `./scripts/snapshot-releases.sh` 刷新
   `src/release-notes.json`。`size` = 资产字节 / 1048576 保留 1 位（v1.1.0 的 3313040 B → `3.2 MB`）。
   改完 grep 产物核对。
10. 要提前被 HTML 引用的静态资源放 `public/`（原样拷到 `dist/` 根、文件名不带哈希）。
    ⚠️ 构建摘要**不列** public 拷的文件 → 核对直接 `find dist`。
11. **首帧主题由 `src/index.html` 内联脚本负责**（早于 Rsbuild 注入的 CSS），同时按主题预加载壁纸。
    ⚠️ 与 `src/theme.ts` 是**两套必须同口径的实现**（localStorage 键 `status-trio.landing.theme`
    两边硬编码）→ 改一边必须同步另一边。
12. `LandingPage` 的 state 重渲染整棵子树；不依赖 state 的 section 用 `React.memo`
    （Hero / Features / Details / Screenshots 已 memo；Screenshots 只吃 `theme` 一个 prop）。
13. **毛玻璃是刻意保留的成本**，别以性能为名去掉：`.card` `blur(26px) saturate(1.5)`、
    `.lp-menubar` `blur(22px) saturate(1.7)`；`--card-bg` = 深 `rgba(30,34,44,0.9)` /
    浅 `rgba(255,255,255,0.9)`（实测值，**别退回 0.6 / 0.72**），边框不动、菜单栏保持半透明。
14. **og 图 = `public/og.jpg` + `src/index.html` 里的绝对 URL**（爬虫不解析 base URL；别用
    `<base href>` 绕过 —— 会把 `./static/*` 一起重指）；**刻意不写 `og:url`**（双入口共用产物）。
    换图见 skill `screenshot-to-og-image`。⚠️ 平台卡片有缓存，改完让用户去 Sharing Debugger
    重抓 —— **线上正确 ≠ 分享方立刻看到**。

## 仅中文页的两块内容

`Copy` = `Omit<typeof zh, 'mirrors' | 'fund01'> & { mirrors: MirrorsCopy | null; fund01:
Fund01Copy | null }` —— 可空的理由都是「只有中文页用得到」；**闸门就是这个字段本身，别再叠
一层 `lang === 'zh'`**。

- **`mirrors`（网盘镜像）**：链接在 `src/app.ts` 的 `MIRRORS`（`quark` / `baidu` / `baiduCode`），
  与 `RELEASE` 同源 —— **发新版必须重传两个网盘并换链接**。百度提取码拼进 URL
  （`?pwd=dp90`，点开自动填码），`baiduCode` 只为展示。渲染两处：首屏 `.hero-cta` 追加两个
  `.btn--ghost`（`QuarkMark` / `BaiduMark`，标签复用 `t.mirrors.*`）+ 「系统要求」段
  （`Details.tsx` `#requirements`）CTA 下方的 `.req-mirrors*`。流程见 skill `release-netdisk-mirror`。
  ✅ **2026-09-16 已重传 v1.1.0**：夸克 `s/e28ddb4cf8da`（公开、无码）、百度
  `s/1HU-0RoFm2rMrlQ4TuPmjPw?pwd=18kk`（码 `18kk`），两个都是永久分享，已与页面版本号对齐。
  旧版 v1.0.2 的文件与分享仍留在两个网盘上（**没删**），只是页面不再引用。
- **`fund01`（菜单栏联动）**：顶部多两个分组签（`总览 +2.71%` / `海外投资 +2.25%`）→ 去
  `https://lingai.net/fund01/`。**位置：语言 / 主题按钮左边**（放 Status Trio 图标左边被否过）。
  组件 `src/stage/Fund01Groups.tsx`，类名沿用 fund01 landing；**涨红跌绿**（`--rise` / `--fall`：
  深 `#ff4f44` / `#34c759`，浅 `#d70015` / `#178236`）；`pct` 是**静态快照**。窄屏 **≤860px
  整块隐藏**（写进现有 860 媒体查询）。`MenubarPreview` 的 `.pg-bar` **没加**这两签。

## 更新日志弹层（2026-09-16 加）

首屏版本徽标点开 = 全部版本 release note。对照实现 fund01 landing 那份是静态数组，本仓起初也
照着「实时拉 GitHub」做过一版，**当天就被用户否掉**（原话：不需要实时更新版本，每次发版都是手动
操作）→ 现在数据也在仓库里，**打开即渲染、没有加载态**。

- 数据：`src/release-notes.json`（release 正文 + tag + publishedAt 的本地快照，新 → 旧）。
  刷新靠 `./scripts/snapshot-releases.sh`（curl GitHub releases → 过滤 prerelease → 按时间倒序
  写回，python3 只用标准库）。**发版后必须跑一次**，见硬约定 9。
- 解析：`src/changelog.ts` 的 `toChangelog(RELEASE_NOTES, lang)` → `{tag, date, blocks[]}`，
  block 只有 `h` / `list` / `p`。按 `## English` / `## 中文` 取对应语言，**没有分区标记的
  （≤v1.0.2）两种语言都显示**；丢掉「First launch / 首次启动」整段、围栏代码块，以及 v1.0.2 那种
  没有小标题的裸安装说明（`INSTALL_NOTE` 特征词 `xattr` / `quarantine` / `Privacy & Security` /
  `隐私与安全性` / `Open Anyway`）。
- 组件 `src/sections/ChangelogDialog.tsx`（挂在 Hero 里，无 props 之外的状态）：遮罩 + 面板
  （沿用 `.card` 毛玻璃）、头部固定 + 列表内部滚动；Esc / 点遮罩 / 右上角关闭，锁 `body.overflow`、
  焦点交给关闭按钮；语言切换即时跟随（`useMemo`）。入口 `.hero-verline` = `.hero-all` 链接 +
  徽标 `.hero-ver`（形态抄 `.hero-brand-tag`）。
- `rich()`（`**粗体**` + `` `行内代码` ``）已提到 `src/rich.tsx` 共用。
- `z-index: 80` 够用；Hero 祖先链上**没有 transform / filter / backdrop-filter**，`.cl-overlay`
  的 `fixed` 相对视口 —— **以后再往 Hero 外层加 transform 要回来复核**。

## 截图区（2026-09-16 加）

排在 `MenubarPreview` 之后、`Details` 之前。`src/sections/Screenshots.tsx`，
**唯一需要知道主题的 section**（图标状态那张有浅 / 深两版）→ `LandingPage` 传 `theme`。

- **图在 `public/screenshots/*.webp`**（固定路径、不参与哈希 → 组件里写死 `./screenshots/x.webp`）。
  素材源在 App 仓库 `~/Documents/aiwork/status-trio/screenshots/`，**不在本仓**。
  转 webp 用托管 venv 的 Pillow（LANCZOS、quality 80–84、method 6）：全屏截图保持 1440 宽，
  文档式长图 1400（图标背景）/ 1788（图标状态，要留住小字）。六张 413 KB，源图 1.32 MB（**-69%**）。
- **lazyload**：`<img>` 带 `loading="lazy" decoding="async"` **加原始宽高**
  （`SHOTS` 表里的 `w`/`h` 必须与文件一致，否则加载前占位比例不对、滚动会抖）。
- **主题切图只挂一张**：`icon-states.webp`（白底）/ `icon-states-dark.webp`（#252529 底）按 `theme`
  条件渲染 —— **不是**两张都进 DOM 再用 CSS 藏一张（藏的那张照样会被拉下来，白花 120 KB）。
  `dock-icons.webp` 只有浅底一版，深色主题下就是一块白，可接受。
- 点图 → `.shot-overlay`（`z-index: 90`，压过更新日志的 80）：Esc / 点遮罩 / 右上角关闭，
  锁 `body.overflow`；图按容器宽等比缩放，比视口高的内部滚动。
- **没纳入**：`normal.png` / `popup.png` / `status-style.png` 是旧版视觉（菜单栏模式、英文界面、
  旧弹窗布局）且分辨率低（494 / 646 / 288 宽），与 1.1 的 UI 对不上。

## 仓库 / 部署 / 命令

- 远端 `github.com/lingyired/status-trio-landing-page`（public，main），LICENSE Apache-2.0。
  **`gh` 不在 PATH** → `/opt/homebrew/bin/gh`；git 身份是**仓库级** `Ling Yired <lingyired@gmail.com>`。
  入库：源码 + `src/assets/**` + `public/**` + `.workbuddy/memory/**`；忽略 `node_modules/`、
  `dist/`、`.pnpm-store/`（**`dist/` 不入库 → 不能直接开 Pages**）。commit 风格 `feat:` / `fix:` /
  `docs:` / `chore:`，末尾带 trailer `Co-authored-by: WorkBuddy <noreply@workbuddy.ai>`。
- **两个入口同一份产物**（`/www/wwwroot/statustrio-landing/dist`）：`statustrio.lingai.net/` 与
  `lingai.net/statustrio/`（**不带尾斜杠必须 301**）。`./deploy.sh` = typecheck + build +
  `rsync -avz --delete dist/ lingai-vps:…`（SSH 别名见 lingai-server 仓库 `.workbuddy/VPS_ACCESS.md`，
  nginx / 证书细节在同一份 **§14**）。产物必须保持 `assetPrefix: './'`。
- **页面不连任何第三方接口**（`index.html` 里的 `api.github.com` preconnect 也已移除）：
  版本 / 下载链接 / 更新日志全取自仓库快照，`src/index.html` 里唯一写死的域名是 og 图。
- 命令：`corepack pnpm dev` / `corepack pnpm run build`（pnpm 不在 PATH，必须走 corepack）、
  `./node_modules/.bin/tsc --noEmit`、`./deploy.sh`。装依赖加 `--store-dir "$PWD/.pnpm-store"`
  （全局 store 沙箱外写不进去），装完删该目录。
- 壁纸 `public/wallpaper/{dark,light}.webp`：**必须 1920×1080 WebP**，源图
  `~/Pictures/Golden_Dark_6k.png` / `GoldenGate_6k.png`（6016×4147 → 16:9 中心裁切 + LANCZOS
  缩放，不许非等比拉伸）。sips 编不了 WebP 且 `-c` 是原生分辨率裁切 → 用托管 venv：
  `/Users/lingsmbp/.workbuddy/binaries/python/envs/default/bin/python`。

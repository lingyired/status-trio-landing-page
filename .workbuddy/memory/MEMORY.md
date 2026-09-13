# status-trio-landing-page — 项目约定

给 `lingyired/status-trio`（duo-menubar，macOS 菜单栏小工具 Status Trio）做的落地页。

## 硬约定

1. **不引入 UI 库**：运行时只有 react / react-dom，样式全本地 CSS（对齐 fund01 landing 的做法）。
2. **视觉常量必须来自 App 源码，不许拍脑袋**。改尺寸/几何前先读：
   - `duo-menubar/Sources/StatusTrioCore/Settings/SettingsStore.swift`（`defaultIconSize = 28`，`iconSizeRange = 20...32`）
   - `duo-menubar/Sources/StatusTrioCore/UI/Icon/StatusIconGeometry.swift`（画布 120、弧半径 51.5、
     缺口宽 数字 64 / 闪电 50、`batteryChargingBoltCalibration = 220/180`）
   - `duo-menubar/Sources/StatusTrioCore/UI/Icon/StatusIconRenderer.swift`（闪电倍率 = 字形高/闪电高×220÷180）
   - 图标形状的参照源是 `duo-menubar/status-menubar-demo.html`。
3. **菜单栏图标尺寸统一走 `APP.iconSize`**（`src/app.ts`），菜单栏与预览条带必须同尺寸。
   栏高 `.lp-menubar` / `.pg-bar` 要跟着图标尺寸留余量（当前 28px 图标 → 36px 栏高）。
4. **不开浏览器自测**：用户 2026-09-03 定的偏好。前端改动的验证走
   `tsc --noEmit` + `pnpm run build` + 产物 grep +（几何类改动）Swift/CoreGraphics 数值核算，
   视觉效果交给用户目视。
5. **部署是红线**：未经用户明确说"部署"不动 nginx/rsync/VPS。git 也只在用户说了才 init/commit。

## 仓库

- **远端 `https://github.com/lingyired/status-trio-landing-page`**（public，默认分支 main），
  2026-09-13 首次推送（`a965b7a`，35 files）。LICENSE = Apache-2.0（对齐产品主仓）。
- **`gh` 不在 PATH**，用绝对路径 `/opt/homebrew/bin/gh`。git 身份是**仓库级**配置
  （全局为空）：`Ling Yired <lingyired@gmail.com>`。
- 入库范围：源码 + `src/assets/**` + **`public/**`** + `.workbuddy/memory/**`；
  忽略 `node_modules/` `dist/` `.pnpm-store/`。**`dist/` 不入库 → 不能直接开 Pages**。
- commit 风格：`feat:` / `fix:` / `docs:` / `chore:` 前缀，正文说明动机；
  末尾带 trailer **`Co-authored-by: WorkBuddy <noreply@workbuddy.ai>`**。
6. 中英双语（`src/copy.ts`，zh 为基准，en 用 `Copy` 类型约束）；主题默认跟随系统。
7. **SVG 上 `transition: stroke-dasharray` 之前，先确认所有状态下 dash 列表段数一致**。
   段数会变的场合（例如电池弧的缺口会让填充弧在 2 段/4 段之间跳），浏览器会把短列表循环补齐
   再逐段插值 → 多出虚线段沿路径滑动（幽灵动画）。解法：把「挖洞」交给 `<mask>`
   （黑底 + 白色虚线，虚线圆头即缺口圆头），dash 列表保持恒定段数。
   `StatusIcon.tsx` 的电池弧就是这么做的，见 `batteryGapDash` / `batteryFillDash`。
8. **同一文件的多处修改必须串行提交 Edit**，并行会互相覆盖（本轮 `tokens.css` 的 dark/light
   两处 `--warn` 并行，浅色那条被静默冲掉）。跨文件才并行。
9. **页面上的产品事实必须回源核对，不许照抄别的项目**。已知口径：
   - 发布版 DMG 内是 **`Status Trio.app`（带空格，命令行里要加引号）**，containing `Applications`
     软链；当前是 **ad-hoc 签名、未公证**（`spctl` rejected），所以 Gatekeeper 会拦。
   - `Info.plist` `LSUIElement = true` → **无窗口、无 Dock 图标**，「打开后没反应」是正常表现。
   - 因此排障章节（`src/sections/Troubleshoot.tsx`，锚点 `#troubleshoot`）只有 macOS 两种情形，
     **不写 Windows SmartScreen**。
10. **需要在 HTML 里被提前引用的静态资源放 `public/`**，不要 `import` 进 bundle。
   Rsbuild `server.publicDir` 默认 `{ name: 'public', copyOnBuild: 'auto' }` → 构建时原样拷到
   `dist/` 根，**文件名不带哈希**，所以 `index.html` 能写死路径去 preload。
   ⚠️ 构建摘要（`File (web) / Total` 那张表）**不列** public 拷贝的文件 —— 核对产物要直接 `find dist`，
   否则会误判成「没拷过去」。
11. **首帧主题由 `src/index.html` 的内联脚本负责**（刻意不依赖打包产物，位置在 head 里、
   早于 Rsbuild 注入的 CSS `<link>`，所以样式表生效前 `data-theme` 已落定）。
   它同时按主题注入壁纸的 `<link rel=preload as=image fetchpriority=high>`，
   让壁纸与 260 KB JS **并行**下载，而不是等 JS 执行完渲染出 `<img>` 才发现图片地址。
   ⚠️ 这段脚本与 `src/theme.ts` 的 `getThemePref` / `WALLPAPER` 是**两套必须同口径的实现**
   （localStorage 键 `status-trio.landing.theme` 两边都硬编码）→ 改一边必须同步另一边。
12. **`LandingPage` 持有的 state 重渲染整棵子树**（`status` 随滑杆高频变化）。
   新增 section 若只依赖 `release`、或不依赖任何 state，用 `React.memo` 包住，别让它跟着滑杆 reconcile。
   当前 Hero / Features / Details 已 memo（`Troubleshoot` 在 `Details` 内部，一起被跳过）。
13. **毛玻璃是刻意保留的视觉成本，不要以性能为名去掉**：`.card` 的
   `backdrop-filter: blur(26px) saturate(1.5)`（`landing.css:233`）与 `.lp-menubar` 的
   `blur(22px) saturate(1.7)`（`:52`）用户在 2026-09-13 明确表态保留。
   它们确实让滚动路径多一层合成开销，但这是**已知且接受**的取舍，别再提「降级/去掉」。
   **不透明度另有一套已定的口径（2026-09-13 晚，对着 App 弹层截图实测）**：
   - `--card-bg` = **深色 `rgba(30,34,44,0.9)` / 浅色 `rgba(255,255,255,0.9)`**。
     参考图实测：App 弹层内部 rgb(30,35,44)、20px 跨度内完全恒定（σ≈0.3）——是一块**近乎不透明**
     的板子，不是「更暗」。改后观感 rgb(28.2,32.0,42.2)、跨度 1（改前 0.6 是跨度 4）。
     ⚠️ 别再退回 0.6 / 0.72——那种透明度下壁纸的浅紫飘带会透上来，正是「太透明」的观感来源。
   - **边框不用动**：参考图的边线实测就是 `rgba(255,255,255,0.10)`（`#ffffff1a`），与现值一致。
   - `.lp-menubar` **保持半透明**（深 0.7 / 浅 0.76）：真 macOS 菜单栏本来就是透的，
     参考图里菜单栏底下能看见蓝色窗口、而弹层不透——两者反差正是原生质感的一部分。
   - 影响范围只有 `.card` 与 `.pg-caret`（尖角也用 `--card-bg`），两处都跟着变。
14. **页面结构（2026-09-13 定）**：菜单栏正下方浮着设置面板 → Hero → Features（**只剩一句话**：
   「一个图标三个状态：Wi-Fi、电池、音量」，渲染成一个 `h2.sec-title`）→
   尺寸预览 card（`.pv-row` = 卡片 + 面板落位槽）→ Details。面板由
   `sections/SettingsDock.tsx`（定位/落位/开合/尺寸上报）+ `SettingsPanel.tsx`（三列控件）组成，
   **宽屏默认展开、点菜单栏图标开合**；`.lp-column` 必须是 `display: flex`（column）——
   **grid item 的包含块是自己那一行，`position: sticky` 会失效**。
   - 功能那三张小卡（`.feat-grid` / `.feat` / `.feat-icon` / `.feat-text`）与
     `FeatureIcon`、`FeatureIconKey`、`FeatureItem` **已在 2026-09-13 深夜删掉**，
     别照着旧记忆往回加。⚠️ `sections/icons.tsx` 里还留着 `AppleMark` / `GitHubMark` /
     `DownloadMark` / `AlertMark` / `CopyMark` / `MenuBarMark` / `CopyButton`（Hero / Details /
     Troubleshoot 在用），**整文件不能删**。
15. **浮动面板的定位与宽度（2026-09-13 晚定）**：
   - 定位在 JS 里算（`SettingsDock.sync()`），写进 **`translate`**（不是 `transform`：
     收起动画的 `transform` 要留着，独立属性才互不覆盖）。停靠位 = 图标中心对准面板中心，
     再夹进视口 12px 白边；图标贴屏幕右边没法让，所以顶上有个 `.pg-caret` 尖角指回图标
     （caret 夹在 `[24, 宽-24]`）。量宽度必须用 `offsetWidth`（收起态的 scale 会污染 rect）。
     重算时机：**无依赖的 `useLayoutEffect`**（任何导致重排的渲染都在绘制前收尾）+ body 的
     `ResizeObserver` + 滚动区 `scroll`（rAF 合帧）+ `window.resize` + **菜单栏的
     `MutationObserver`**（时钟/语言变会让图标平移）。滚动帧里只写样式、不动 React state。
   - **宽度是「贴内容」的，不是定值**：`.pg-dock-body { width: max-content; max-width: min(100%, 700px) }`
     + `.pg-cols { grid-template-columns: repeat(3, auto) }` → 实测中文 592 / 英文 688。
     ⚠️ 别把 `.pg-cols` 改回等分 `1fr`，也别把 `.ctl-segmented` 改回 `minmax(0, 1fr)` 五等分：
     那两处会把「最长的那条文案」变成整块面板的宽度下限（840px 就是这么来的）。
     `.pg-hint` 的 `max-width: 9.5rem` 同理——它是三列里最长的一句，会撑宽电池列。
16. **滚动落位：面板滑到「菜单栏实际尺寸」卡右侧（2026-09-13 深夜定）**：
   一份面板 DOM，两个落位，位置全由滚动进度插值（`SettingsDock.sync()`）——
   停靠（菜单栏下、对准图标）→ 落位（`MenubarPreview` 里那个 `.pv-slot`）。
   - **落位线不能放在菜单栏下沿**（`LOCK_DEPTH = 340`）：放那儿的话要滚到卡片顶天立地
     才并排，用户停在中途只会看见面板还挂在顶上。放在视口头 340px 处，
     「滚到卡片跟前停下」就已经并排了。
   - **缓动必须用 smoothstep**（`t = p²(3-2p)`，`TRAVEL = 320`）：两端速度都是 0，
     起步接得上停靠态的静止、落定那一刻接得上随行态的 1:1。线性插值落定处速度 0.06
     （面板静止而卡片在高速上滚）会梗一下。逐像素验算：最大位置跳变 1.0px、速度突变 0.038。
   - **槽宽来自实测**：`--panel-w` 由 `SettingsDock` 量 `offsetWidth` 后经 `LandingPage`
     传给 `MenubarPreview`；`.pv-row` 是 `minmax(0,1fr) var(--panel-w)`，
     **闸门 `@media (min-width: 1024px)`** 才空出槽位（英文面板 688 + 卡片 ≥200 的最小宽度）。
     放不下时 `.pv-slot` 是 `display: none` → 宽度 0 → `sync()` 判定不可用，保持停靠，
     `LandingPage.toggleSettings()` 里的「面板在视野外就先滚过去」也一并兜住。
   - **卡片还原成竖排**（标签 → 条带 → 说明 → 大图），大图与光晕改成 `min(216px,100%)` /
     `min(300px,82%)`，否则卡片被挤到 220px 时会被顶出边界。
   - 面板随卡片滚出视野时会给 `translate` 兜底（`minY`）+ 摘 `visibility`，
     免得离屏还在跑 backdrop-filter、Tab 还能走到看不见的控件上。
17. **窄屏断点 860px 是两处硬编码，改一处必须同步另一处**：
   `LandingPage.tsx` 的 `NARROW` 常量（决定面板默认开合）与 `landing.css` 里
   `.pg-dock` 的媒体查询（`sticky` → `relative`，让面板退回文档流）。
   落位那道 `min-width: 1024px` 闸门只写在 CSS 里，JS 侧靠「槽宽够不够」自判，不用同步。

18. **预览卡与设置面板等高（2026-09-13 深夜）**：
   - 面板 `offsetHeight` 由 `SettingsDock.reportSize()` 经 `onHeight` 上报 → `LandingPage` 的
     `panelHeight` → `MenubarPreview` 写进 `--panel-h`；卡片 `height: var(--panel-h, auto)`
     **只写在 `@media (min-width: 1024px)` 里**（与落位槽同一道闸门）。全局
     `box-sizing: border-box`，所以两边同口径、对齐误差 0。首帧没量到就不写该变量
     （`panelHeight ? ... : undefined`），卡片退回 `auto`，不会塌。
   - 卡片是 `display: flex; flex-direction: column` + `.pg-hero { flex: 1 1 auto }`：
     等高后多出/差掉的高度整块落在大图那栏。**别改回 grid** —— auto 行会把空隙均摊，
     标签与条带之间会被白白撑开。
   - head 是 `.pg-preview-head`（flex + `flex-wrap: wrap` + `align-items: baseline`），
     caption 用 `margin-left: auto; text-align: right` 实现「float right」。
     ⚠️ **`.pg-preview` 是 grid/flex 容器时，子元素上的 `float` 会被忽略**（float 不适用于
     grid/flex item），所以 float right 只能用 flex 表达。英文文案（304px）在卡片内宽
     195px 里必然折到第二行，属预期。

19. **首屏与面板「并排 / 占位」两态（2026-09-13 深夜定）**：一进页面首屏顶端与面板顶端
   **严格齐平**（都在 26px），首屏只占面板左边的空档。
   - 判定在 `SettingsDock.sync()` 第 ③ 步：`freeLeft = dockDx - HERO_GAP(28)`，
     `lifted = !full && freeLeft >= MIN_HERO_W(380)`。**`full` 同时就是「窄屏」**（≤860 时面板
     `width:100%`），所以**没有把 860 这个断点硬编码第三遍**。门槛：中文视口 ≥1091 / 英文 ≥1283。
   - 写入全部命令式：`dock.style.height`（并排时 0）、`dock.dataset.lifted`、
     `dock.parentElement.style.setProperty('--hero-w', …)`；用 `liftKeyRef` 挡重复写。
   - `.hero { max-width: var(--hero-w, none) }`。⚠️ **这个宽度 CSS 算不出来** —— 面板是夹到
     **视口**右边（12px 白边）的，不在内容列右边缘，所以只能由 JS 实测给。
   - 占位槽高度**只能命令式写**：`.pg-dock` 上不能再出现 React 的 `style={{height}}` ——
     React 会在下次渲染把没列出的内联属性清掉，两者互相覆盖。（顺带把只服务于它的
     `panelHeight` state 删了，ResizeObserver 现在不再触发父级重渲染。）
   - `.pg-dock[data-lifted=true] { margin-bottom: calc(-1 * var(--col-gap)) }`（≥861px）：
     抵消「占位槽 → 首屏」那道 flex gap。`--col-gap` 定义在 `.lp-column` 上，与 `gap` 同源。
   - 首屏顶端对齐靠 `.hero { padding-top: 10px }` —— **与 `TOP_GAP` 同值**（`.pg-dock-body` 的
     `top: 10px` 也是），**三处必须一起改**。
   - 顶部间距：`.lp-column` padding-top = `clamp(0.5rem, 1.5vw, 1rem)`（原 24–48px 太大）。
   - 门槛以下退回老布局（占位槽占高度、首屏排在面板下面）——首屏被挤成一条比不并排更难看。

## 命令

```bash
corepack pnpm dev      # 本机 pnpm 不在 PATH，必须走 corepack
corepack pnpm run build
./node_modules/.bin/tsc --noEmit
```

pnpm 全局 store 在沙箱外写不进去 → 装依赖用 `--store-dir "$PWD/.pnpm-store"`，装完删掉该目录。

## 壁纸资源

- 位置 **`public/wallpaper/{dark,light}.webp`**，**规格必须 1920×1080 / WebP**。
  （2026-09-13 七轮从 `src/assets/wallpaper/` 移来 —— 为了脱离 JS 依赖图、能被 `index.html`
  预加载；`src/assets/wallpaper/` 目录已不存在，别再往那儿放。）
- 来源是 `~/Pictures/Golden_Dark_6k.png`（→ dark）与 `~/Pictures/GoldenGate_6k.png`（→ light），
  源图 6016×4147（≈29:20）→ **16:9 中心裁切后 LANCZOS 缩放**（不许非等比拉伸），
  Pillow `quality=95, method=6`，文件约 70 / 78 KB。
- 生成脚本 `make_wallpaper.py`（本轮在 /tmp/st-wp/）—— 本机 sips 编不了 WebP、
  且 `sips -c` 是原生分辨率裁切不是缩放，所以走托管 venv 的 Pillow：
  `/Users/lingsmbp/.workbuddy/binaries/python/envs/default/bin/python`。
- 别在文件名里带具体壁纸品牌（原来的 `tahoe-*` 换图后就成了假信息）。

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

# status-trio-landing-page — 项目约定

`lingyired/status-trio`（duo-menubar，macOS 菜单栏小工具 Status Trio）的落地页。

> 布局 / 浮动面板几何（原第 14–19 条）已移到同目录 **`LAYOUT.md`**，改布局前必读。

## 硬约定

1. **不引 UI 库**：运行时只有 react / react-dom，样式全本地 CSS（对齐 fund01 landing）。
2. **视觉常量回源 App 源码，不许拍脑袋**（前缀 `duo-menubar/Sources/StatusTrioCore/`）：
   - `Settings/SettingsStore.swift`：`defaultIconSize = 28`、`iconSizeRange = 20...32`
   - `UI/Icon/StatusIconGeometry.swift`：画布 120、弧半径 51.5、缺口宽 数字 64 / 闪电 50、
     `batteryChargingBoltCalibration = 220/180`
   - `UI/Icon/StatusIconRenderer.swift`：闪电倍率 = 字形高 / 闪电高 × 220 ÷ 180
   - 形状参照源：`duo-menubar/status-menubar-demo.html`
3. **菜单栏图标尺寸统一走 `APP.iconSize`**（`src/app.ts`）；栏高 `.lp-menubar` / `.pg-bar`
   跟着图标留余量（28px 图标 → 36px 栏高）。
4. **不开浏览器自测**（用户 2026-09-03 定）。验证链：`tsc --noEmit` + `corepack pnpm run build`
   + 产物 grep +（几何类改动）Swift/CoreGraphics 数值核算；视觉效果交用户目视。
5. **部署是红线**：未明确说"部署"不动 nginx/rsync/VPS；git 也只在用户说了才 init/commit。
6. 中英双语（`src/copy.ts`，zh 为基准，en 受 `Copy` 类型约束）；主题默认跟随系统。
7. **SVG 上做 `transition: stroke-dasharray` 前先确认各状态 dash 段数一致**：段数会变时浏览器
   把短列表循环补齐再逐段插值 → 虚线段沿路径滑动（幽灵动画）。解法是把「挖洞」交给 `<mask>`
   （黑底 + 白色虚线，圆头即缺口圆头），dash 列表保持恒定段数。见 `StatusIcon.tsx` 的
   `batteryGapDash` / `batteryFillDash`。
8. **同一文件的多处修改必须串行提交 Edit**，并行会互相覆盖（`tokens.css` dark/light 两处
   `--warn` 曾被静默冲掉）。跨文件才并行。
9. **产品事实必须回源核对，不许照抄别的项目**：
   - DMG 内是 **`Status Trio.app`（带空格，命令行要引号）**，含 `Applications` 软链；
     当前 **ad-hoc 签名、未公证**（`spctl` rejected）→ Gatekeeper 会拦。
   - `Info.plist` `LSUIElement = true` → **无窗口、无 Dock 图标**，「打开没反应」属正常表现。
   - 排障章节（`src/sections/Troubleshoot.tsx`，锚点 `#troubleshoot`）只写 macOS 两种情形，
     **不写 Windows SmartScreen**。
   - **版本 / 体积 / 下载链接只集中在 `src/app.ts` 的 `RELEASE_FALLBACK`**（`tag` + `size` +
     `dmg` 三处，发新版一起改；别处不硬编码版本，改完 grep 产物核对）。真实值运行时从
     `api.github.com/repos/lingyired/status-trio/releases/latest` 拉，失败才回落。
     `size` 口径 = 资产字节 / 1048576 保留 1 位（v1.0.2 的 2276356 B → `2.2 MB`）。
10. **要在 HTML 里被提前引用的静态资源放 `public/`**，不要 `import` 进 bundle。Rsbuild
    `server.publicDir` 默认 `{ name: 'public', copyOnBuild: 'auto' }` → 原样拷到 `dist/` 根、
    **文件名不带哈希**，故 `index.html` 能写死路径 preload。⚠️ 构建摘要（`File (web) / Total`
    表）**不列** public 拷贝的文件 —— 核对产物直接 `find dist`。
11. **首帧主题由 `src/index.html` 的内联脚本负责**（不依赖打包产物，位于 head 且早于 Rsbuild
    注入的 CSS `<link>`，样式表生效前 `data-theme` 已落定）。它同时按主题注入壁纸的
    `<link rel=preload as=image fetchpriority=high>`，让壁纸与 JS 并行下载。
    ⚠️ 它与 `src/theme.ts` 的 `getThemePref` / `WALLPAPER` 是**两套必须同口径的实现**
    （localStorage 键 `status-trio.landing.theme` 两边硬编码）→ 改一边必须同步另一边。
12. **`LandingPage` 的 state 重渲染整棵子树**（`status` 随滑杆高频变）。只依赖 `release` 或
    不依赖 state 的 section 用 `React.memo` 包住。当前 Hero / Features / Details 已 memo
    （Troubleshoot 在 Details 内部，一起跳过）。
13. **毛玻璃是刻意保留的视觉成本，别以性能为名去掉**：`.card` 的
    `backdrop-filter: blur(26px) saturate(1.5)`（`landing.css:233`）与 `.lp-menubar` 的
    `blur(22px) saturate(1.7)`（`:52`）用户 2026-09-13 明确保留。不透明度口径（对 App 弹层
    截图实测）：
    - `--card-bg` = **深 `rgba(30,34,44,0.9)` / 浅 `rgba(255,255,255,0.9)`**（参考图弹层内部
      rgb(30,35,44)、20px 跨度内 σ≈0.3 → 近乎不透明的板子）。
      ⚠️ 别退回 0.6 / 0.72（壁纸浅紫飘带会透上来，正是「太透明」的来源）。
    - **边框不动**：参考图边线实测就是 `rgba(255,255,255,0.10)`（`#ffffff1a`）。
    - `.lp-menubar` **保持半透明**（深 0.7 / 浅 0.76）：真菜单栏本来就是透的，反差即原生质感。
    - 影响面只有 `.card` 与 `.pg-caret`（尖角同用 `--card-bg`）。

## 网盘镜像（2026-09-14 加，**仅中文页**）

- 目的：国内直连 GitHub 慢，中文页多给夸克 / 百度两个网盘入口；英文页**刻意不展示**。
- **链接集中在 `src/app.ts` 的 `MIRRORS`**（`quark` / `baidu` / `baiduCode`），与
  `RELEASE_FALLBACK` 同源管理 —— **发新版必须重新上传两个网盘并换链接**（旧链接会挂着旧版 DMG）。
- **百度提取码拼进 URL**（`https://pan.baidu.com/s/xxx?pwd=dp90`），点开自动填码、用户不用手输
  —— 这是百度官方支持的写法（fund01 landing 也是这么干的）。`baiduCode` 另存一份只为页面上展示。
- 文案在 `src/copy.ts`：`MirrorsCopy` 接口 + `mirrorsZh`；**`Copy` 类型是
  `Omit<typeof zh, 'mirrors'> & { mirrors: MirrorsCopy | null }`**，en 侧显式写 `mirrors: null`。
  这是「zh 为基准、en 受 Copy 约束」的唯一例外（可空的理由：只有中文页用得到）。
- **两处渲染，都拿 `t.mirrors` 当闸门（不要再叠 `lang === 'zh'`）**：
  - 首屏 `.hero-cta`（`src/sections/Hero.tsx`）：主下载按钮 + GitHub 之后追加两个 `.btn--ghost`
    按钮，图标 `QuarkMark` / `BaiduMark`，标签复用 `t.mirrors.quark` / `.baidu`（**不新增 hero 键**，
    免得 en 里多出用不到的死字符串）。照 fund01 landing 的次级按钮做法。
  - 「系统要求」段（`src/sections/Details.tsx` 的 `#requirements`）：CTA 下方一行细链接 + 提取码。
- 品牌图标 `QuarkMark`（云朵+下落箭头）/ `BaiduMark`（熊猫脸线稿）在 `src/sections/icons.tsx`，
  抄自 `fund01-langding-page/src/content/icons.tsx`，但描边统一走本仓的 `stroke`
  常量（1.7，fund01 原版是 2 / 1.8）。
- 样式：`.req-mirrors` / `.req-mirror` / `.req-mirror-code`（`landing.css`，`.req-trouble:hover` 之后）。
  **首屏那两个按钮复用现成的 `.btn--ghost`，没有新样式**。

## 布局与浮动面板

见 **`LAYOUT.md`**（编号 14–19）：页面结构；浮动面板定位/宽度（`translate` 而非 `transform`、
宽度贴内容）；滚动落位（`LOCK_DEPTH=340` / smoothstep / `--panel-w` 闸门 1024px）；窄屏断点
860px 两处硬编码；预览卡与面板等高；首屏「并排 / 占位」两态。

## 仓库与提交

- 远端 `https://github.com/lingyired/status-trio-landing-page`（public，默认 main），
  2026-09-13 首推（`a965b7a`，35 files）。LICENSE = Apache-2.0（对齐产品主仓）。
- **`gh` 不在 PATH**，用 `/opt/homebrew/bin/gh`。git 身份是**仓库级**配置（全局为空）：
  `Ling Yired <lingyired@gmail.com>`。
- 入库范围：源码 + `src/assets/**` + **`public/**`** + `.workbuddy/memory/**`；忽略
  `node_modules/` `dist/` `.pnpm-store/`。**`dist/` 不入库 → 不能直接开 Pages**。
- commit 风格：`feat:` / `fix:` / `docs:` / `chore:` 前缀，正文说明动机；末尾带 trailer
  **`Co-authored-by: WorkBuddy <noreply@workbuddy.ai>`**。

## 部署（2026-09-13 上线）

- **两个入口，同一份产物**（`/www/wwwroot/statustrio-landing/dist`）：
  `https://statustrio.lingai.net/`（子域根）+ `https://lingai.net/statustrio/`（主域子路径）。
- **一条命令** `./deploy.sh` = typecheck + build + `rsync -avz --delete dist/ lingai-vps:…`。
  前置：`~/.ssh/config` 有 `lingai-vps` 别名（见 lingai-server 仓库 `.workbuddy/VPS_ACCESS.md`）。
- **产物必须保持 `./` 相对路径**（`rsbuild.config.ts` 的 `assetPrefix: './'`）→ 双入口零额外配置。
  代价：**`/statustrio` 不带尾斜杠必须 301 到 `/statustrio/`**，否则 `./static/...` 会解析到
  `/static/...`。
- nginx 路由与证书细节全在 lingai-server 仓库 `.workbuddy/VPS_ACCESS.md` **§14**（不在这边重复）。
- 版本 / 体积 / 下载链接运行时从 `api.github.com` 拉，**不走 lingai-api** → 子域 vhost 无 API 代理。

## 命令与环境

```bash
corepack pnpm dev            # 本机 pnpm 不在 PATH，必须走 corepack
corepack pnpm run build
./node_modules/.bin/tsc --noEmit
./deploy.sh                  # 构建 + 推到 lingai-vps（双入口同时更新）
```

pnpm 全局 store 在沙箱外写不进去 → 装依赖用 `--store-dir "$PWD/.pnpm-store"`，装完删掉该目录。

## 壁纸资源

- 位置 **`public/wallpaper/{dark,light}.webp`**，**规格必须 1920×1080 / WebP**。
  （2026-09-13 从 `src/assets/wallpaper/` 移来 —— 为了脱离 JS 依赖图、能被 `index.html` 预加载；
  旧目录已不存在。）源图 `~/Pictures/Golden_Dark_6k.png`（dark）/ `GoldenGate_6k.png`（light），
  6016×4147 → **16:9 中心裁切后 LANCZOS 缩放**（不许非等比拉伸），Pillow `quality=95, method=6`，
  约 70 / 78 KB。
- 生成脚本 `make_wallpaper.py`（本轮在 /tmp/st-wp/）—— 本机 sips 编不了 WebP、且 `sips -c` 是
  原生分辨率裁切不是缩放，所以走托管 venv 的 Pillow：
  `/Users/lingsmbp/.workbuddy/binaries/python/envs/default/bin/python`。
- 别在文件名里带具体壁纸品牌（原 `tahoe-*` 换图后就成了假信息）。

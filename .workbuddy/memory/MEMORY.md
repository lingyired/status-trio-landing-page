# status-trio-landing-page — 项目约定

`lingyired/status-trio`（duo-menubar，macOS 菜单栏小工具 Status Trio）的落地页。
布局 / 浮动面板几何见同目录 **`LAYOUT.md`**（原 14–19 条），改布局前必读。

## 硬约定

1. **不引 UI 库**：运行时只有 react / react-dom，样式全本地 CSS（对齐 fund01 landing）。
2. **视觉常量回源 App 源码**（`duo-menubar/Sources/StatusTrioCore/`），不许拍脑袋：
   `SettingsStore.swift` → `defaultIconSize = 28`、范围 `20...32`；`StatusIconGeometry.swift` →
   画布 120、弧半径 51.5、缺口宽 数字 64 / 闪电 50、`batteryChargingBoltCalibration = 220/180`；
   `StatusIconRenderer.swift` → 闪电倍率 = 字形高 / 闪电高 × 220 ÷ 180。
   形状参照源 `duo-menubar/status-menubar-demo.html`。
3. **菜单栏图标尺寸统一走 `APP.iconSize`**（`src/app.ts`）；栏高 `.lp-menubar` / `.pg-bar`
   跟着图标留余量（28px 图标 → 36px 栏高）。
4. **不开浏览器自测**（2026-09-03 定）。验证链：`tsc --noEmit` + `corepack pnpm run build`
   + 产物 grep +（几何类改动）Swift/CoreGraphics 数值核算；视觉效果交用户目视。
5. **部署是红线**：未明确说"部署"不动 nginx/rsync/VPS；git 也只在用户说了才 init/commit。
6. 中英双语（`src/copy.ts`，zh 为基准，en 受 `Copy` 类型约束）；主题默认跟随系统。
7. **SVG 上做 `transition: stroke-dasharray` 前先确认各状态 dash 段数一致**：段数变了浏览器
   会把短列表循环补齐再逐段插值 → 虚线段沿路径滑动（幽灵动画）。解法：挖洞交给 `<mask>`
   （黑底 + 白色虚线，圆头即缺口圆头），dash 列表保持恒定段数（`StatusIcon.tsx`）。
8. **同一文件的多处修改必须串行 Edit**，并行会互相覆盖（`tokens.css` dark/light 两处 `--warn`
   曾被静默冲掉）。跨文件才并行。
9. **产品事实必须回源核对**：
   - DMG 内是 **`Status Trio.app`（带空格，命令行要引号）**，含 `Applications` 软链；当前
     **ad-hoc 签名、未公证**（`spctl` rejected）→ Gatekeeper 会拦。
   - `Info.plist` `LSUIElement = true` → **无窗口、无 Dock 图标**，「打开没反应」属正常表现。
   - 排障章节（`src/sections/Troubleshoot.tsx`，`#troubleshoot`）只写 macOS 两种情形，
     **不写 Windows SmartScreen**。
   - **版本 / 体积 / 下载链接只集中在 `src/app.ts` 的 `RELEASE_FALLBACK`**（`tag` + `size` +
     `dmg`，发新版一起改；别处不硬编码，改完 grep 产物核对）。真实值运行时从
     `api.github.com/repos/lingyired/status-trio/releases/latest` 拉，失败才回落。
     `size` 口径 = 资产字节 / 1048576 保留 1 位（v1.0.2 的 2276356 B → `2.2 MB`）。
10. **要在 HTML 里被提前引用的静态资源放 `public/`**（`import` 进 bundle 的拿不到固定路径）；
    Rsbuild `publicDir` 原样拷到 `dist/` 根、**文件名不带哈希**。⚠️ 构建摘要（`File (web) /
    Total` 表）**不列** public 拷贝的文件 —— 核对产物直接 `find dist`。
11. **首帧主题由 `src/index.html` 内联脚本负责**（head 内、早于 Rsbuild 注入的 CSS，样式表生效前
    `data-theme` 已落定），同时按主题注入壁纸 `<link rel=preload as=image fetchpriority=high>`。
    ⚠️ 它与 `src/theme.ts` 的 `getThemePref` / `WALLPAPER` 是**两套必须同口径的实现**
    （localStorage 键 `status-trio.landing.theme` 两边硬编码）→ 改一边必须同步另一边。
12. **`LandingPage` 的 state 重渲染整棵子树**（`status` 随滑杆高频变）。只依赖 `release` 或不依赖
    state 的 section 用 `React.memo` 包住（现 Hero / Features / Details 已 memo，Troubleshoot
    在 Details 内部一起跳过）。
13. **毛玻璃是刻意保留的视觉成本**（用户 2026-09-13 明确），别以性能为名去掉：`.card`
    `backdrop-filter: blur(26px) saturate(1.5)`（`landing.css:233`）、`.lp-menubar`
    `blur(22px) saturate(1.7)`（`:52`）。`--card-bg` = **深 `rgba(30,34,44,0.9)` /
    浅 `rgba(255,255,255,0.9)`**（对 App 弹层截图实测：内部 rgb(30,35,44)、20px 跨度 σ≈0.3，
    **别退回 0.6 / 0.72**）；**边框不动**（`rgba(255,255,255,0.10)`）；`.lp-menubar` **保持
    半透明**（深 0.7 / 浅 0.76）。影响面只有 `.card` 与 `.pg-caret`。
14. **社交分享图 = `public/og.jpg` + `src/index.html` 里的绝对 URL**（2026-09-14 加）。
    此前只有 `og:title` / `description`、**没有 `og:image`** → 分享只有文字卡；
    `twitter:card` 还停在 `summary`（方形小图卡）。现在 `og:image` =
    `https://statustrio.lingai.net/og.jpg`（1200×630 / JPG q88 / 82 KB）——
    **爬虫不做 base URL 解析、必须绝对 URL**（不是"解析后失败"，是压根不解析）。相对路径
    没有绕法：`/statustrio` 不带尾斜杠时基准会掉到主域根；**更别用 `<base href>` 绕过**——
    它会把 `./static/*.js|css` 一起重指到子域，主域入口直接跨域拉资源。这是整套
    `assetPrefix: './'` 产物里 **唯一写死域名**的地方；
    `og:image:width/height`、`og:image:alt`、`twitter:image:alt`
    已补，`twitter:card = summary_large_image`。**刻意不写 `og:url`**：双入口共用一份产物，
    写哪个都会让另一个指错。图是**英文版**（og 图全站只能一张）。换图流程见用户级 skill
    `screenshot-to-og-image`。
    **2026-09-14 已部署上线**：`og.jpg` 82156 B / md5 `5cae8946…`，双入口均 200，
    三种爬虫 UA 实测可抓（nginx 无需改动）。⚠️ 平台卡片有缓存，改完要让用户在
    Facebook Sharing Debugger 手动"再次抓取"，微信/Telegram 需重发 ——
    **线上图正确 ≠ 分享方立刻看到图**，别把它当部署失败去反复重推。

## 仅中文页的两块内容（闸门是 copy.ts 的字段，别再叠 `lang === 'zh'`）

`Copy` 类型 = `Omit<typeof zh, 'mirrors' | 'fund01'> & { mirrors: MirrorsCopy | null;
fund01: Fund01Copy | null }` —— **可空的理由都是「只有中文页用得到」**。

**`mirrors`（网盘镜像）**：国内直连 GitHub 慢 → 中文页加夸克 / 百度入口。链接集中在 `src/app.ts`
的 `MIRRORS`（`quark` / `baidu` / `baiduCode`），与 `RELEASE_FALLBACK` 同源 —— **发新版必须重传
两个网盘并换链接**（旧链接会挂旧 DMG）。百度提取码拼进 URL（`?pwd=dp90`，官方支持，点开自动
填码），`baiduCode` 只为页面展示。渲染两处：首屏 `.hero-cta` 追加两个 `.btn--ghost`（图标
`QuarkMark` / `BaiduMark`，标签复用 `t.mirrors.quark` / `.baidu`，**不新增 hero 键**）；「系统要求」
段（`Details.tsx` 的 `#requirements`）CTA 下方一行细链接 + 提取码。图标在 `src/sections/icons.tsx`
（描边统一走本仓 `stroke` 常量 1.7）。样式 `.req-mirrors` / `.req-mirror` / `.req-mirror-code`；
首屏按钮**复用现成 `.btn--ghost`，无新样式**。

**`fund01`（菜单栏联动）**：顶部菜单栏多出两个分组签（`总览 +2.71%` / `海外投资 +2.25%`），点击
新标签去 `https://lingai.net/fund01/`。**位置：语言 / 主题按钮的左边**（`.lp-menubar-spacer`
之后、`.lp-menubar-lang` 之前）；⚠️ 第一版放在 Status Trio 图标左边**被否掉**。组件
`src/stage/Fund01Groups.tsx`，类名沿用 fund01 landing（`.lp-menubar-groups` /
`.lp-menubar-group` / `.lp-g-name` / `.lp-g-pct` / `.lp-g-rise|fall|flat`），`pct > 0` 走上行 /
`< 0` 走下行 / `= 0` 走 flat（不染色）。**涨红跌绿**：`tokens.css` 新增 `--rise` / `--fall`，深色
用 fund01 原值 `#ff4f44` / `#34c759`，**浅色压深到 `#d70015` / `#178236`**。文案 + 数值在
`src/copy.ts` 的 `fund01`（`groups[{name,pct}]` / `groupAria` / `hint`）；链接常量 `FUND01_SITE`
在 `src/app.ts`（**URL 在 app.ts、文案在 copy.ts**）。⚠️ `pct` 是**静态快照**，行情一变就过期，
没接数据接口。窄屏 **≤860px 整块 `display: none`**（写进现有 860 媒体查询，**不新增断点**）。
`MenubarPreview` 的 `.pg-bar` **没加**这两签 —— 那条带子演示 Status Trio 自己的占地，要加先问用户。

## 仓库与提交

- 远端 `https://github.com/lingyired/status-trio-landing-page`（public，默认 main），2026-09-13
  首推（`a965b7a`，35 files）。LICENSE = Apache-2.0（对齐产品主仓）。
- **`gh` 不在 PATH**，用 `/opt/homebrew/bin/gh`。git 身份是**仓库级**配置（全局为空）：
  `Ling Yired <lingyired@gmail.com>`。
- 入库范围：源码 + `src/assets/**` + `public/**` + `.workbuddy/memory/**`；忽略 `node_modules/`
  `dist/` `.pnpm-store/`。**`dist/` 不入库 → 不能直接开 Pages**。
- commit 风格：`feat:` / `fix:` / `docs:` / `chore:` 前缀，正文说明动机；末尾带 trailer
  **`Co-authored-by: WorkBuddy <noreply@workbuddy.ai>`**。

## 部署（2026-09-13 上线）

- **两个入口，同一份产物**（`/www/wwwroot/statustrio-landing/dist`）：
  `https://statustrio.lingai.net/`（子域根）+ `https://lingai.net/statustrio/`（主域子路径）。
- **一条命令** `./deploy.sh` = typecheck + build + `rsync -avz --delete dist/ lingai-vps:…`。
  前置：`~/.ssh/config` 有 `lingai-vps` 别名（见 lingai-server 仓库 `.workbuddy/VPS_ACCESS.md`）。
- **产物必须保持 `./` 相对路径**（`rsbuild.config.ts` 的 `assetPrefix: './'`）→ 双入口零额外配置。
  代价：**`/statustrio` 不带尾斜杠必须 301 到 `/statustrio/`**。
- nginx 路由与证书细节全在 lingai-server 仓库 `.workbuddy/VPS_ACCESS.md` **§14**（不在这边重复）。
- 版本 / 体积 / 下载链接运行时从 `api.github.com` 拉，**不走 lingai-api**。

## 命令与环境

```bash
corepack pnpm dev            # 本机 pnpm 不在 PATH，必须走 corepack
corepack pnpm run build
./node_modules/.bin/tsc --noEmit
./deploy.sh                  # 构建 + 推到 lingai-vps（双入口同时更新）
```

装依赖用 `--store-dir "$PWD/.pnpm-store"`（全局 store 沙箱外写不进去），装完删掉该目录。

## 壁纸资源

- `public/wallpaper/{dark,light}.webp`，**规格必须 1920×1080 / WebP**（2026-09-13 从
  `src/assets/wallpaper/` 移来 —— 脱离 JS 依赖图、能被 `index.html` 预加载；旧目录已不存在）。
  源图 `~/Pictures/Golden_Dark_6k.png`（dark）/ `GoldenGate_6k.png`（light），6016×4147 →
  **16:9 中心裁切后 LANCZOS 缩放**（不许非等比拉伸），Pillow `quality=95, method=6`，约 70 / 78 KB。
- 本机 sips 编不了 WebP、且 `sips -c` 是原生分辨率裁切不是缩放 → 走托管 venv 的 Pillow：
  `/Users/lingsmbp/.workbuddy/binaries/python/envs/default/bin/python`。
- 别在文件名里带具体壁纸品牌（原 `tahoe-*` 换图后就成了假信息）。

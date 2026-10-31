# status-trio-landing-page — 项目约定

`lingyired/status-trio`（macOS 菜单栏小工具 Status Trio）的落地页：Rsbuild + React，无 UI 库。
**布局 / 状态面板几何见同目录 `LAYOUT.md`，改布局前必读。**
⚠️ 2026-09-27 大改版：菜单栏图标下浮的是**状态面板**（`StatusPanel.tsx`，App 弹层 mock，
点图标开合、默认开）；**设置控件常驻**预览卡右侧 `.pv-slot`（旧的「设置面板滚动落位」
整套已删，勿照旧记忆复活 `SettingsDock` / `--panel-w` / `--panel-h`）。

## 硬约定

1. 运行时只有 react / react-dom，样式全本地 CSS（对齐 fund01 landing）。
2. **视觉常量回源 App 源码**（`Sources/StatusTrioCore/`）：`APP.iconSize = 24`（源码默认 24、
   范围 16…36）、`defaultStatusCenterSymbolScale = 1.6` 由 `.sti-wifi` 的
   `translate(60 64) scale(1.6) translate(-60 -64)` 落实。画布 120 / 弧半径 51.5 / 缺口宽
   数字 64、闪电 50；**BOLT_SCALE 1.6 不随 Wi-Fi 缩放变**（电池 textScale 仍 1.8）。
   图标尺寸统一走 `APP.iconSize`（`src/app.ts`），栏高留余量（`.lp-menubar` 36px 未缩）。
3. **不开浏览器自测**。验证链 = `tsc --noEmit` + `corepack pnpm run build` + 产物 grep
   +（几何类）数值核算；视觉交用户目视。
4. **部署 / 提交是红线**：没说「部署」不动 nginx / rsync；git 只在用户说了才 commit / push。
5. 中英双语（`src/copy.ts`，zh 为基准、en 受 `Copy` 约束）；主题默认跟随系统。
6. **同一文件的多处修改必须串行 Edit**（并行会互相覆盖），跨文件才并行。
7. SVG 上做 `transition: stroke-dasharray` 前先确认各状态 dash 段数一致，否则虚线段沿路径滑动
   → 挖洞交给 `<mask>`，dash 列表保持恒定段数（`StatusIcon.tsx`）。
8. **产品事实**：DMG 内是 `Status Trio.app`（带空格）；**ad-hoc 签名未公证** → Gatekeeper 会拦；
   无主窗口，「打开没反应」属正常（1.1 起图标可放菜单栏 / 程序坞，默认菜单栏）——排障章节只写
   macOS，**不写 Windows SmartScreen**。
9. **页面不连任何第三方接口**（2026-09-16 起，`api.github.com` preconnect 已移除）。发布信息全是
   仓库手动快照，**发新版动三处**：`src/app.ts` 的 `RELEASE`（tag/体积/DMG 链接）+ 同文件
   `MIRRORS`（重传网盘换链接）+ `./scripts/snapshot-releases.sh` 刷 `src/release-notes.json`。
   `size` = 资产字节 / 1048576 保留 1 位。改完 grep 产物核对。
   ⚠️ 2026-10-21 例外：网盘按钮点击会 fire-and-forget 上报到**自己的** lingai-api
   （`DL_STATS` 端点 + `src/stats.ts`，sendBeacon text/plain 免预检、失败静默、
   不阻断跳转）——不是第三方接口，但页面自此有了一个运行时请求。
10. 要提前被 HTML 引用的静态资源放 `public/`（原样拷到 `dist/` 根、不带哈希）；构建摘要不列
    public 拷的文件 → 核对直接 `find dist`。
11. **首帧主题由 `src/index.html` 内联脚本负责**（早于 Rsbuild 注入的 CSS），与 `src/theme.ts`
    是**两套必须同口径的实现**（localStorage 键 `status-trio.landing.theme` 两边硬编码）
    → 改一边必须同步另一边。
12. `LandingPage` 的 state 重渲染整棵子树；不依赖 state 的 section 用 `React.memo`
    （Hero / Features / Details / Screenshots 已 memo）。
13. **毛玻璃是刻意保留的成本**：`.card` `blur(26px) saturate(1.5)`、`.lp-menubar`
    `blur(22px) saturate(1.7)`；`--card-bg` = 深 `rgba(30,34,44,0.9)` / 浅 `rgba(255,255,255,0.9)`
    （实测值，别退回 0.6/0.72）。
14. **og 图 = `public/og.jpg` + `src/index.html` 绝对 URL**（爬虫不解析 base URL，禁用
    `<base href>` 绕过）；刻意不写 `og:url`。平台卡片有缓存，改完让用户去 Sharing Debugger 重抓。

## 仅中文页的两块内容

`Copy` = `Omit<typeof zh, 'mirrors' | 'fund01'> & { mirrors: … | null; fund01: … | null }`
—— 可空的理由都是「只有中文页用得到」；**闸门就是字段本身，别再叠 `lang === 'zh'`**。

- **`mirrors`（网盘镜像）**：链接在 `src/app.ts` 的 `MIRRORS`（`quark`/`baidu`/`baiduCode`），
  与 `RELEASE` 同源 —— **发新版必须重传两个网盘并换链接**。百度提取码拼进 URL（`?pwd=`），
  `baiduCode` 只为展示。渲染两处：首屏 `.hero-cta` 两个 `.btn--ghost` + 「系统要求」段
  （`Details.tsx`）CTA 下方 `.req-mirrors*`。流程见 skill `release-netdisk-mirror`。
  ✅ 2026-10-23 随 v1.7.2 重传：夸克 `s/4d5ae020c732`（公开无码）、百度
  `s/15FGLqzXPC6i_02BtvuxejQ?pwd=trsw`（码 `trsw`），永久分享。
  （v1.6.0 旧链 `68a9d97fa8ef` / `52xc` 仍在网盘，页面已不再引用。）
  坑：① 夸克 CLI 首次调用前跑 `bash scripts/install.sh`（**升级后 SKILL 强制**）；若报
  `code:-104` 就 `export QK_AGENT_ID=workbuddy`。install 返回 `updated:true` 时首个业务命令带
  `--skill-updated`（会吐一条升级 notice.text，照原样展示即可）；② **上传撞重名会静默改名**
  `xxx(1).dmg` → 建专属目录（`create-folder --dir-path StatusTrio-x.y.z`）再传，文件名干净；
  ③ **两个网盘都没有可用的下载次数 API** → 网盘下载量只能靠 landing page 点击自建统计（见下节）。
- **`fund01`（菜单栏联动）**：顶部多两个分组签（`总览 +2.71%` / `海外投资 +2.25%`）→
  `https://lingai.net/fund01/`。位置：语言/主题按钮左边。组件 `src/stage/Fund01Groups.tsx`；
  **涨红跌绿**；`pct` 是静态快照；≤860px 整块隐藏。

## 更新日志弹层（2026-09-16 加）

首屏版本徽标点开 = 全部版本 release note，**数据在仓库里、无加载态**（实时拉 GitHub 的方案
当天被用户否掉）。数据 `src/release-notes.json`，刷新 `./scripts/snapshot-releases.sh`
（优先 `/opt/homebrew/bin/gh api`，匿名 curl 本机恒 403）；**发版后必须跑一次**。
解析 `src/changelog.ts` 的 `toChangelog(RELEASE_NOTES, lang)` → `{tag,date,blocks[]}`，
block 只有 `h`/`list`/`p`；按 `## English`/`## 中文` 取语言，无分区的（≤v1.0.2）双语都显示；
丢「First launch」整段、围栏代码块、裸安装说明（`INSTALL_NOTE` 特征词）；`>` 引用块当普通段落。
新正文形态要**拿真数据实测**（编成 commonjs 跑断言，别用 `grep '# '` 当残留检查 ——
v1.2.0 有合法 `issue #30` 会假阳性）。组件 `src/sections/ChangelogDialog.tsx`，
`.cl-overlay` `z-index: 80`；Hero 祖先链无 transform/filter —— **加外层 transform 前回来复核**。

## 截图区（2026-09-16 加）

`MenubarPreview` 之后、`Details` 之前。`src/sections/Screenshots.tsx`，**唯一需要主题的
section**（`icon-states.webp` 白底 / `icon-states-dark.webp` 深底按 `theme` 只挂一张，
不是 CSS 藏两张）。图在 `public/screenshots/*.webp`（写死相对路径、不参与哈希），
`<img>` 带 `loading="lazy" decoding="async"` + 原始宽高（`SHOTS` 表 `w`/`h` 必须与文件一致）。
点图 → `.shot-overlay`（`z-index: 90`）：Esc / 遮罩 / 关闭按钮，锁 `body.overflow`。

## 仓库 / 部署 / 命令

- 远端 `github.com/lingyired/status-trio-landing-page`（public, main），Apache-2.0。
  **`gh` 不在 PATH** → `/opt/homebrew/bin/gh`；git 身份仓库级 `Ling Yired <lingyired@gmail.com>`。
  commit 风格 `feat:`/`fix:`/`docs:`/`chore:`，带 trailer `Co-authored-by: WorkBuddy <noreply@workbuddy.ai>`。
- **两个入口≠同一台机器**（2026-10-01 实测）：`./deploy.sh` 只 rsync 到 `lingai-vps`
  （64.90.31.192）服务 `statustrio.lingai.net/`；`lingai.net/statustrio/` DNS 指向另一台
  106.52.85.160，不在本仓部署范围。`./deploy.sh` = typecheck + build + rsync dist/。
  产物保持 `assetPrefix: './'`。
- 命令：`corepack pnpm dev` / `corepack pnpm run build`、`./node_modules/.bin/tsc --noEmit`、
  `./deploy.sh`。装依赖 `--store-dir "$PWD/.pnpm-store"`，装完删。
- **「产物是不是这棵树编的」不用重跑构建**：比 mtime —— 源文件 mtime ≤ `dist/` 即是。
- 壁纸 `public/wallpaper/{dark,light}.webp` 必须 1920×1080 WebP，源图
  `~/Pictures/Golden_Dark_6k.png` / `GoldenGate_6k.png`（16:9 中心裁切 + LANCZOS，
  用托管 venv Pillow：`/Users/lingsmbp/.workbuddy/binaries/python/envs/default/bin/python`）。

## 网盘下载监控链（2026-10-21 建，未部署）

网盘厂商无下载数 API → 监控 = **landing page 点击自建统计**：`src/stats.ts`
`reportDownloadClick('quark'|'baidu')` 挂在 Hero / Details 四个网盘按钮上，
sendBeacon POST 到 `https://lingai.net/api/dl/statustrio/<channel>`（lingai-api
新增端点：`download_events` 表、10 秒同 IP 去重、GET 聚合 + GitHub Release 下载数
10 分钟缓存；nginx 需放行 `/api/dl/`）。**服务端代码已写好但未部署**（在
`lingai-server` 仓库 `lingai.net/api/`，等 ling 批准）。读取方是 ai-underlay 的
「下载监控」数据源（默认关，5 分钟轮询，弹窗 section + 设置页）。计数口径 =
**点击**而非完成下载；广告拦截会漏计，天然是下限。待拍板：部署、公网聚合口
（推翻原「统计不暴露 HTTP」原则，只暴露次数无明细）、默认开关。

## 待拍板

- 上游正文缺节：v1.2.0 英文区没有 `## 更新下载`（镜像回退）那节 → 英文页日志少一条，
  是 App 仓库正文的问题，不是解析器的锅。

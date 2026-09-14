# 页面结构 / 浮动面板几何

`status-trio-landing-page` 的布局细则；编号与 `MEMORY.md` 的「硬约定」保持连续（14–19）。

14. **页面结构**：菜单栏下浮设置面板 → Hero → Features（**只剩一句**「一个图标三个状态：
    Wi-Fi、电池、音量」，渲染成 `h2.sec-title`）→ 尺寸预览 card（`.pv-row` = 卡片 + 面板落位槽）
    → Details。面板 = `sections/SettingsDock.tsx`（定位/落位/开合/尺寸上报）+
    `SettingsPanel.tsx`（三列控件），**宽屏默认展开、点菜单栏图标开合**。
    - `.lp-column` 必须 `display: flex`（column）—— **grid item 的包含块是自己那一行，
      `position: sticky` 会失效**。
    - 功能三张小卡（`.feat-grid` / `.feat` / `.feat-icon` / `.feat-text`）与 `FeatureIcon` /
      `FeatureIconKey` / `FeatureItem` **已删，别照旧记忆加回来**。
    - ⚠️ `sections/icons.tsx` 里 `AppleMark` / `GitHubMark` / `DownloadMark` / `AlertMark` /
      `CopyMark` / `MenuBarMark` / `CopyButton` 仍被 Hero / Details / Troubleshoot 使用，
      **整文件不能删**。

15. **浮动面板的定位与宽度**：
    - 定位在 JS 算（`SettingsDock.sync()`），写进 **`translate`**（不是 `transform`：收起动画的
      transform 要留着，独立属性才互不覆盖）。停靠位 = 图标中心对面板中心，再夹进视口 12px
      白边；图标贴屏幕右边没法让，故顶上用 `.pg-caret` 尖角指回图标（caret 夹 `[24, 宽-24]`）。
      量宽度必须用 `offsetWidth`（收起态 scale 会污染 rect）。
    - 重算时机：**无依赖 `useLayoutEffect`** + body `ResizeObserver` + 滚动区 `scroll`（rAF
      合帧）+ `window.resize` + **菜单栏 `MutationObserver`**（时钟/语言变会让图标平移）。
      滚动帧里只写样式、不动 React state。
    - **宽度贴内容、非定值**：`.pg-dock-body { width: max-content; max-width: min(100%, 700px) }`
      + `.pg-cols { grid-template-columns: repeat(3, auto) }` → 实测中文 592 / 英文 688。
      ⚠️ 别把 `.pg-cols` 改回等分 `1fr`，也别把 `.ctl-segmented` 改回 `minmax(0, 1fr)` 五等分
      （最长文案会变成面板宽度下限，840px 就这么来的）。`.pg-hint` 的 `max-width: 9.5rem` 同理。

16. **滚动落位：面板滑到「菜单栏实际尺寸」卡右侧**（一份 DOM、两个落位，位置由滚动进度插值）：
    停靠（菜单栏下对准图标）→ 落位（`MenubarPreview` 的 `.pv-slot`）。
    - **落位线不能放菜单栏下沿**（`LOCK_DEPTH = 340`）：放视口头 340px 处，「滚到卡片跟前停下」
      就已经并排。
    - **缓动必须 smoothstep**（`t = p²(3-2p)`，`TRAVEL = 320`）：两端速度 0，起步接得上停靠态
      静止、落定接得上随行态 1:1（线性插值落定处速度 0.06 会梗）。逐像素验算：最大跳变
      1.0px、速度突变 0.038。
    - **槽宽来自实测**：`--panel-w` 由 `SettingsDock` 量 `offsetWidth` 经 `LandingPage` 传
      `MenubarPreview`；`.pv-row` 是 `minmax(0,1fr) var(--panel-w)`，**闸门 `@media
      (min-width: 1024px)`** 才空槽（英文面板 688 + 卡片 ≥200）。放不下时 `.pv-slot` 是
      `display: none` → 宽 0 → `sync()` 判不可用、保持停靠；`toggleSettings()` 的「面板在视野外
      先滚过去」一并兜住。
    - **卡片竖排**（标签 → 条带 → 说明 → 大图），大图/光晕 `min(216px,100%)` / `min(300px,82%)`，
      否则卡片被挤到 220px 会顶出边界。
    - 面板随卡片滚出视野时给 `translate` 兜底（`minY`）+ 摘 `visibility`（免得离屏跑
      backdrop-filter、Tab 走到看不见的控件）。

17. **窄屏断点 860px 是两处硬编码，改一处必须同步另一处**：`LandingPage.tsx` 的 `NARROW` 常量
    （面板默认开合）与 `landing.css` 里 `.pg-dock` 的媒体查询（`sticky` → `relative`，面板退回
    文档流）。落位那道 `min-width: 1024px` 只写在 CSS，JS 靠「槽宽够不够」自判。

18. **预览卡与设置面板等高**：面板 `offsetHeight` 经 `SettingsDock.reportSize()` → `onHeight`
    → `LandingPage.panelHeight` → `MenubarPreview` 写 `--panel-h`；卡片 `height: var(--panel-h,
    auto)` **只写在 `@media (min-width: 1024px)`**（与落位槽同闸门）。全局 `box-sizing:
    border-box` → 对齐误差 0。首帧没量到就不写该变量（`panelHeight ? … : undefined`），退回
    `auto` 不塌。
    - 卡片 `display: flex; flex-direction: column` + `.pg-hero { flex: 1 1 auto }`：等高后多出/
      差掉的高度整块落在大图栏。**别改回 grid**（auto 行会均摊空隙，标签与条带间被撑开）。
    - head 是 `.pg-preview-head`（flex + `flex-wrap: wrap` + `align-items: baseline`），caption
      用 `margin-left: auto; text-align: right` 做「float right」。⚠️ **`.pg-preview` 是
      grid/flex 容器时子元素 `float` 被忽略**（float 不适用于 grid/flex item）。英文文案
      （304px）在卡片内宽 195px 里必折第二行，属预期。

19. **首屏与面板「并排 / 占位」两态**：首屏顶端与面板顶端**严格齐平**（都 26px），首屏只占
    面板左边的空档。
    - 判定在 `SettingsDock.sync()` 第 ③ 步：`freeLeft = dockDx - HERO_GAP(28)`，
      `lifted = !full && freeLeft >= MIN_HERO_W(380)`。**`full` 同时就是「窄屏」**（≤860 时面板
      `width: 100%`），所以 860 没有第三处硬编码。门槛：中文视口 ≥1091 / 英文 ≥1283。
    - 写入全部命令式：`dock.style.height`（并排时 0）、`dock.dataset.lifted`、
      `dock.parentElement.style.setProperty('--hero-w', …)`；`liftKeyRef` 挡重复写。
    - `.hero { max-width: var(--hero-w, none) }`。⚠️ **该宽度 CSS 算不出来**（面板夹的是
      **视口**右边 12px，不在内容列右缘），只能 JS 实测给。
    - 占位槽高度**只能命令式写**：`.pg-dock` 上不能再有 React 的 `style={{height}}`（React
      下次渲染会清掉未列出的内联属性，互相覆盖）。配套已删只服务于它的 `panelHeight` state。
    - `.pg-dock[data-lifted=true] { margin-bottom: calc(-1 * var(--col-gap)) }`（≥861px）抵消
      「占位槽 → 首屏」那道 flex gap；`--col-gap` 定义在 `.lp-column`，与 `gap` 同源。
    - 首屏顶端对齐靠 `.hero { padding-top: 10px }` —— **与 `TOP_GAP` 同值**（`.pg-dock-body`
      的 `top: 10px` 也是），**三处一起改**。`.lp-column` padding-top =
      `clamp(0.5rem, 1.5vw, 1rem)`。
    - 门槛以下退回老布局（占位槽占高、首屏排面板下面），否则首屏被挤成一条更难看。

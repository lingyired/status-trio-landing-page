# 页面结构 / 状态面板几何

`status-trio-landing-page` 的布局细则；编号与 `MEMORY.md` 的「硬约定」保持连续（14–19）。

14. **页面结构**（2026-09-27 大改版后）：菜单栏下浮**状态面板**（`sections/StatusPanel.tsx`
    = App 真机弹层的 mock，摆位在 `StatusDock.tsx`）→ Hero → Features → 尺寸预览 card
    （`.pv-row` = 卡片 + **常驻设置控件** `SettingsPanel`）→ Details。
    - 状态面板点菜单栏图标开合（宽屏默认开、窄屏默认收，`NARROW` 断点定），
      内容对齐 App 弹层：电池 / Wi-Fi / 系统代理 / 蓝牙设备列表（可收起，本地 useState）/
      音量输出（滑杆**绑定真 state.volume**，步进 25）/ 麦克风（输入电平是本地 useState
      演示态）/ 页脚（设置… + `RELEASE.tag.slice(1)`）。绑定量：battery、
      charging/lowPower 文案、`wifi === 0` 整行置灰、volume；设备名是真机快照（copy.ts
      `statusPanel` 段，zh/en）。
    - 设置控件不再浮在菜单栏下：固定在「菜单栏实际尺寸」卡右侧（`.pv-slot`），
      窄屏退到卡片下面整宽。三列 `.pg-cols` + 跨三列「蓝牙音频」组 `pg-group--wide` 不变。
    - `.lp-column` 必须 `display: flex`（column）—— **grid item 的包含块是自己那一行，
      `position: sticky` 会失效**。
    - ⚠️ `sections/icons.tsx` 里 `AppleMark` / `GitHubMark` / `DownloadMark` / `AlertMark` /
      `CopyMark` / `MenuBarMark` / `CopyButton` 仍被 Hero / Details / Troubleshoot 使用，
      **整文件不能删**。

15. **状态面板的定位与宽度**：
    - 定位在 JS 算（`StatusDock.sync()`），只算水平位移写进 **`translate`**（不是
      `transform`：收起动画的 transform 要留着，独立属性才互不覆盖）。停靠位 = 图标中心
      对面板中心，再夹进视口 12px 白边；图标贴屏幕右边没法让，故顶上用 `.pg-caret` 尖角
      指回图标（caret 夹 `[24, 宽-24]`）。量宽度必须用 `offsetWidth`（收起态 scale 会污染 rect）。
    - **sticky 钉住**（2026-09-27 ling 拍板：「popup 是浮动的，随滚动下拉位置不变」）：
      `.pg-dock { position: sticky; top: 0 }`，往下滚面板钉在滚动区顶部不动、盖在正文上；
      JS 无滚动监听。**窄屏 860 内退回 `position: relative`**（钉住会吃掉大半屏）。
      ⚠️ **sticky 生效的前提：`.lp-column { align-self: flex-start }` 不能删** —— 外层
      `.lp-desktop` 是横排 flex，默认 stretch 会把列盒子拉伸到视口高、内容全变溢出；
      sticky 活动范围 = 包含块盒子 = 那一屏 → 面板钉满一屏就被推走（2026-09-27 实测踩坑，
      旧 JS 逐帧摆位时代被掩盖）。flex-start 让列盒子 = 内容高，面板才能钉到文档末尾。
      重算时机：无依赖 `useLayoutEffect` + body `ResizeObserver` + `window.resize` +
      **菜单栏 `MutationObserver`**（时钟/语言变会让图标平移）。
    - **内部滚动兜底**：`.sp { max-height: calc(100vh - 3rem); overflow-y: auto }`——sticky
      钉死后比视口高的部分永远滚不出来（真弹层也是内部滚）；窄屏 `max-height: none`
      （文档流里整页滚）。⚠️ **绝不能加 `overscroll-behavior: contain`**（2026-09-27 实测踩坑）：
      面板浮在视口上方、滚轮大概率悬在它上面，一旦它成可滚容器，滚轮先喂它，contain 会在
      面板滚到头后掐断滚动链 → 整页「滚一会儿就滚不动了」。默认链式滚动即可，面板到头
      自动接力给整页。（更新日志弹层 `.cl-panel` 的 contain 是模态框，正常，别误删。）
    - **宽度定值 336px**（`.sp`），不贴内容走——设备名长短不一，贴内容会跟着快照文案抖；
      窄屏 `width: 100%`。

16. **设置控件落位（旧「滚动落位」已废，勿复活）**：曾经设置面板随滚动滑到预览卡右侧
    （smoothstep 插值 / `LOCK_DEPTH` / `TRAVEL` / 量宽量高上报那套），2026-09-27 起控件
    **常驻** `.pv-slot`，`SettingsDock` 的落位与尺寸上报代码已删（`panelWidth`/`panelHeight`
    state、`slotRef`、`onWidth`/`onHeight` 都没了）。
    - `.pv-row` 默认一列（控件排卡片下面整宽）；`@media (min-width: 1024px)` 才
      `minmax(0,1fr) minmax(0,700px)` 并排。⚠️ **第二列不能用 `auto` 轨道**：grid 取尺寸时
      auto 按 max-content **先于 fr 轨道**，面板没了旧浮动时代的 700px 上限会一路撑到 900+，
      把卡片挤成一条竖字（2026-09-27 实测）。700 = 旧浮动面板的宽度上限；1280 视口下
      卡片 = 220（下限），视口更宽卡片更大。
    - **等高靠 grid 拉伸**（行高 = 较高一方；闸门内 `.pv-slot` `display:flex` +
      `.pg-panel { flex: 1 1 auto }`），卡片大图栏 `.pg-hero { flex: 1 1 auto }` 吸收差值。
      **没有 JS 量高了**（`--panel-w` / `--panel-h` 变量已删）。
    - 卡片 head 是 `.pg-preview-head`（flex + wrap + baseline），caption 靠
      `margin-left: auto` 右对齐；英文 caption 在窄卡里折第二行属预期。

17. **窄屏断点 860px 仍两处硬编码，改一处必须同步另一处**：`LandingPage.tsx` 的 `NARROW`
    常量（面板默认开合）与 `landing.css` 的 860 媒体查询（`.pg-dock-body` / `.sp` 全宽、
    `.pg-cols` 单列、分组分隔线转横向）。`min-width: 1024px` 的并排闸门只写在 CSS。

18. （原「JS 量高对齐」一条已并入 16，编号空缺保留连续性）

19. **首屏与面板「并排 / 占位」两态**：首屏顶端与面板顶端**严格齐平**（都 26px），首屏只占
    面板左边的空档。
    - 判定在 `StatusDock.sync()`：`freeLeft = dx - HERO_GAP(28)`，
      `lifted = !full && freeLeft >= MIN_HERO_W(380)`。**`full` 同时就是「窄屏」**（≤860 时
      面板 `width: 100%`）。面板窄了（336px）之后并排门槛比旧设置面板时代宽松得多。
    - 写入全部命令式：`dock.style.height`（并排时 0）、`dock.dataset.lifted`、
      `dock.parentElement.style.setProperty('--hero-w', …)`；`liftKeyRef` 挡重复写。
    - `.hero { max-width: var(--hero-w, none) }`。⚠️ **该宽度 CSS 算不出来**（面板夹的是
      **视口**右边 12px，不在内容列右缘），只能 JS 实测给。
    - 占位槽高度**只能命令式写**：`.pg-dock` 上不能再有 React 的 `style={{height}}`（React
      下次渲染会清掉未列出的内联属性，互相覆盖）。
    - `.pg-dock[data-lifted=true] { margin-bottom: calc(-1 * var(--col-gap)) }`（≥861px）抵消
      「占位槽 → 首屏」那道 flex gap；`--col-gap` 定义在 `.lp-column`，与 `gap` 同源。
    - 首屏顶端对齐靠 `.hero { padding-top: 10px }` —— **与 `TOP_GAP` 同值**（`.pg-dock-body`
      的 `top: 10px` 也是），**三处一起改**。`.lp-column` padding-top =
      `clamp(0.5rem, 1.5vw, 1rem)`。
    - 门槛以下退回老布局（占位槽占高、首屏排面板下面），否则首屏被挤成一条更难看。

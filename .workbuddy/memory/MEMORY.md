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

## 命令

```bash
corepack pnpm dev      # 本机 pnpm 不在 PATH，必须走 corepack
corepack pnpm run build
./node_modules/.bin/tsc --noEmit
```

pnpm 全局 store 在沙箱外写不进去 → 装依赖用 `--store-dir "$PWD/.pnpm-store"`，装完删掉该目录。

## 壁纸资源

- 位置 `src/assets/wallpaper/{dark,light}.webp`，**规格必须 1920×1080 / WebP**。
- 来源是 `~/Pictures/Golden_Dark_6k.png`（→ dark）与 `~/Pictures/GoldenGate_6k.png`（→ light），
  源图 6016×4147（≈29:20）→ **16:9 中心裁切后 LANCZOS 缩放**（不许非等比拉伸），
  Pillow `quality=95, method=6`，文件约 70 / 78 KB。
- 生成脚本 `make_wallpaper.py`（本轮在 /tmp/st-wp/）—— 本机 sips 编不了 WebP、
  且 `sips -c` 是原生分辨率裁切不是缩放，所以走托管 venv 的 Pillow：
  `/Users/lingsmbp/.workbuddy/binaries/python/envs/default/bin/python`。
- 别在文件名里带具体壁纸品牌（原来的 `tahoe-*` 换图后就成了假信息）。

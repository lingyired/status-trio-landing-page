/** 品牌 / 版本等跨语言共用的常量。
 *
 *  ⚠️ 这里全是**手动维护的快照**：页面不做任何运行时抓取，看到的永远是仓库里这份值。
 *  发新版时一起改三处：`RELEASE`（下）→ `MIRRORS`（下）→ `src/release-notes.json`
 *  （跑 `scripts/snapshot-releases.sh`）。 */

export const APP = {
  name: 'Status Trio',
  /** 仓库与站点 */
  repo: 'https://github.com/lingyired/status-trio',
  releases: 'https://github.com/lingyired/status-trio/releases',
  latest: 'https://github.com/lingyired/status-trio/releases/latest',
  issues: 'https://github.com/lingyired/status-trio/issues',
  author: 'https://github.com/lingyired',
  site: 'https://blog.lingai.net/',
  /** 最低系统版本（对齐 Support/Info.plist 的 LSMinimumSystemVersion） */
  minMacOS: '13.0',
  /** 十二种语言（README「Languages」一节） */
  languageCount: 12,
  /** 菜单栏图标的渲染尺寸（对齐 SettingsStore：默认 24，可调 16–36 pt） */
  iconSize: 24,
} as const

/** 当前发布：版本号 / DMG 直链 / 体积。发新版改这里。
 *  `size` 口径 = 资产字节 / 1048576 保留 1 位（v1.8.0 的 16229206 B → `15.5 MB`）。 */
export const RELEASE = {
  tag: 'v1.8.0',
  build: '46',
  /** DMG 体积，用于按钮上的副标题 */
  size: '15.5 MB',
  dmg: 'https://github.com/lingyired/status-trio/releases/download/v1.8.0/StatusTrio-1.8.0.dmg',
  sha256: '8f5f64b36a95d3e552a8fe2a3a25cce0c1746d332cdcaef2a688cc53bc94e334',
} as const

/** Homebrew 官方 cask。网站只展示和复制命令，绝不替用户安装。 */
export const HOMEBREW = {
  command: 'brew install --cask status-trio',
  formula: 'https://formulae.brew.sh/cask/status-trio',
} as const

/** 国内网盘镜像：保留既有分享链接。仅中文页面展示（英文页不出现）。
 *  ⚠️ 这些链接未随当前 release 自动核对；发版前必须人工确认其对应版本，
 *  不能默认它们与 GitHub Release 是同一份 DMG。
 *  百度的提取码直接拼进 URL（`?pwd=`），点开即自动填码、用户不用手输；
 *  另存一份 `baiduCode` 只是为了页面上还能把码展示出来。 */
export const MIRRORS = {
  quark: 'https://pan.quark.cn/s/01611b68ad53',
  baidu: 'https://pan.baidu.com/s/1X9sjm_iGSa2fa2sQ10_lJQ?pwd=34z6',
  /** 百度网盘的提取码（已含在上面链接里，这里仅用于页面展示） */
  baiduCode: '34z6',
} as const

/** 网盘下载点击统计端点（ling 自建的 lingai-api 服务）。
 *  只在用户点击网盘按钮时 fire-and-forget 上报一次，不参与渲染、失败静默；
 *  数据用于 ai-underlay 的「下载监控」。服务端未上线时 404 也无副作用。 */
export const DL_STATS = {
  endpoint: 'https://lingai.net/api/dl/statustrio',
} as const

/** 姊妹项目 Fund01 的落地页：菜单栏那两个联动分组点开就是它。
 *  分组名与涨跌幅在 `src/copy.ts` 的 `fund01`（只有中文页展示）。 */
export const FUND01_SITE = 'https://fund01.lingai.net/'

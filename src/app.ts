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
  site: 'https://lingai.net/',
  /** 最低系统版本（对齐 Support/Info.plist 的 LSMinimumSystemVersion） */
  minMacOS: '15.0',
  /** 十二种语言（README「Languages」一节） */
  languageCount: 12,
  /** 菜单栏图标的渲染尺寸（对齐 SettingsStore：默认 28，可调 20–32 pt） */
  iconSize: 28,
} as const

/** 当前发布：版本号 / DMG 直链 / 体积。发新版改这里。
 *  `size` 口径 = 资产字节 / 1048576 保留 1 位（v1.1.0 的 3313040 B → `3.2 MB`）。 */
export const RELEASE = {
  tag: 'v1.1.0',
  /** DMG 体积，用于按钮上的副标题 */
  size: '3.2 MB',
  dmg: 'https://github.com/lingyired/status-trio/releases/download/v1.1.0/StatusTrio-1.1.0.dmg',
} as const

/** 国内网盘镜像：与 GitHub 同一份 DMG，永久链接。仅中文页面展示（英文页不出现）。
 *  ⚠️ 发新版要重新上传并换上新的分享链接 —— 和 `RELEASE` 一起改。
 *  百度的提取码直接拼进 URL（`?pwd=`），点开即自动填码、用户不用手输；
 *  另存一份 `baiduCode` 只是为了页面上还能把码展示出来。 */
export const MIRRORS = {
  quark: 'https://pan.quark.cn/s/e28ddb4cf8da',
  baidu: 'https://pan.baidu.com/s/1HU-0RoFm2rMrlQ4TuPmjPw?pwd=18kk',
  /** 百度网盘的提取码（已含在上面链接里，这里仅用于页面展示） */
  baiduCode: '18kk',
} as const

/** 姊妹项目 Fund01 的落地页：菜单栏那两个联动分组点开就是它。
 *  分组名与涨跌幅在 `src/copy.ts` 的 `fund01`（只有中文页展示）。 */
export const FUND01_SITE = 'https://lingai.net/fund01/'

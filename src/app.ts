/** 品牌 / 版本等跨语言共用的常量，以及 GitHub 发布信息。 */

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

/** GitHub API 不可用时的兜底（当前最新发布）。 */
export const RELEASE_FALLBACK = {
  tag: 'v1.0.2',
  /** DMG 体积，用于按钮上的副标题 */
  size: '2.2 MB',
  dmg: 'https://github.com/lingyired/status-trio/releases/download/v1.0.2/StatusTrio-1.0.2.dmg',
} as const

/** 国内网盘镜像：与 GitHub 同一份 DMG，永久链接。仅中文页面展示（英文页不出现）。
 *  ⚠️ 发新版要重新上传并换上新的分享链接 —— 和 RELEASE_FALLBACK 一起改。
 *  百度的提取码直接拼进 URL（`?pwd=`），点开即自动填码、用户不用手输；
 *  另存一份 `baiduCode` 只是为了页面上还能把码展示出来。 */
export const MIRRORS = {
  quark: 'https://pan.quark.cn/s/4618cc657752',
  baidu: 'https://pan.baidu.com/s/1xVp9YV0t5eLnR1hKG9m1VA?pwd=dp90',
  /** 百度网盘的提取码（已含在上面链接里，这里仅用于页面展示） */
  baiduCode: 'dp90',
} as const

/** 姊妹项目 Fund01 的落地页：菜单栏那两个联动分组点开就是它。
 *  分组名与涨跌幅在 `src/copy.ts` 的 `fund01`（只有中文页展示）。 */
export const FUND01_SITE = 'https://lingai.net/fund01/'

export interface ReleaseInfo {
  tag: string
  dmg: string
  size: string
  publishedAt: string | null
}

interface GithubRelease {
  tag_name?: string
  published_at?: string
  assets?: { name?: string; size?: number; browser_download_url?: string }[]
}

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return RELEASE_FALLBACK.size
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** 从 GitHub release 响应里挑出 DMG 资产与校验文件。 */
export function parseRelease(data: GithubRelease): ReleaseInfo {
  const tag = data.tag_name || RELEASE_FALLBACK.tag
  const dmg = data.assets?.find((a) => a.name?.endsWith('.dmg'))
  return {
    tag,
    dmg: dmg?.browser_download_url || RELEASE_FALLBACK.dmg,
    size: formatSize(dmg?.size ?? 0),
    publishedAt: data.published_at ?? null,
  }
}

/** 页面级单例：同一会话只请求一次最新发布信息，失败静默回落到 RELEASE_FALLBACK。 */
let pending: Promise<ReleaseInfo> | null = null

export function fetchLatestRelease(): Promise<ReleaseInfo> {
  if (!pending) {
    const fallback: ReleaseInfo = {
      tag: RELEASE_FALLBACK.tag,
      dmg: RELEASE_FALLBACK.dmg,
      size: RELEASE_FALLBACK.size,
      publishedAt: null,
    }
    pending = fetch('https://api.github.com/repos/lingyired/status-trio/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? (r.json() as Promise<GithubRelease>) : Promise.reject(new Error(String(r.status)))))
      .then(parseRelease)
      .catch(() => fallback)
  }
  return pending
}

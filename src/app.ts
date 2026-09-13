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
  tag: 'v1.0.0',
  /** DMG 体积，用于按钮上的副标题 */
  size: '2.1 MB',
  dmg: 'https://github.com/lingyired/status-trio/releases/download/v1.0.0/StatusTrio-1.0.0.dmg',
} as const

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

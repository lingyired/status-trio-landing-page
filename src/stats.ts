import { DL_STATS, RELEASE } from './app'

/** 网盘按钮点击上报（供 ai-underlay 的「下载监控」统计）。
 *
 *  设计约束：
 *  - **fire-and-forget**：不 await、不阻断跳转，任何失败都静默 —— 统计是旁路，
 *    不能影响用户点下载这个主流程。
 *  - **免 CORS 预检**：sendBeacon 的 body 用 `text/plain`（简单请求），
 *    服务端不需要处理 OPTIONS 预检。
 *  - **零隐私**：只上报渠道名和页面版本号，不带任何用户信息。 */
export function reportDownloadClick(channel: 'quark' | 'baidu'): void {
  try {
    const body = JSON.stringify({ channel, v: RELEASE.tag })
    const url = `${DL_STATS.endpoint}/${channel}`
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const queued = navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }))
      if (queued) return
    }
    void fetch(url, {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'text/plain' },
    }).catch(() => {})
  } catch {
    // 统计旁路永远静默
  }
}

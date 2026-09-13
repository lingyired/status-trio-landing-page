import { useEffect, useState } from 'react'
import type { Lang } from '../copy'

const ZH_WEEK = ['日', '一', '二', '三', '四', '五', '六']
const EN_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const EN_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 菜单栏右侧的系统时间标签（对齐 macOS 的短格式）。 */
export function timeLabel(lang: Lang, now: Date = new Date()): string {
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  if (lang === 'zh') {
    return `${now.getMonth() + 1}月${now.getDate()}日 周${ZH_WEEK[now.getDay()]} ${hh}:${mm}`
  }
  return `${EN_WEEK[now.getDay()]} ${EN_MONTH[now.getMonth()]} ${now.getDate()} ${hh}:${mm}`
}

/** 每 30 秒刷新一次的时间标签，避免分钟数长时间不跳。 */
export function useTimeLabel(lang: Lang): string {
  const [label, setLabel] = useState(() => timeLabel(lang))
  useEffect(() => {
    setLabel(timeLabel(lang))
    const id = window.setInterval(() => setLabel(timeLabel(lang)), 30_000)
    return () => window.clearInterval(id)
  }, [lang])
  return label
}

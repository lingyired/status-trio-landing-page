import React from 'react'

/**
 * 极简行内富文本：只认 `**粗体**` 和 `` `行内代码` ``。
 * 文案（copy.ts 里的字典、GitHub 上的 release note）保持可读原文，
 * 到渲染时才解析，而不是把 DOM 塞进数据里。
 */
export function rich(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    return part
  })
}

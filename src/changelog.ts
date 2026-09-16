/** 把 release note（中英混排 markdown）拆成弹层能直接渲染的结构。
 *
 *  **数据源是 `./release-notes.json`** —— 发版时从 GitHub 手动快照下来的 release 正文
 *  （`scripts/snapshot-releases.sh`），页面不联网、也不实时更新：版本都是手动发的，
 *  这份快照跟着一起手动刷。
 *
 *  GitHub 的正文没有结构化字段可用，只能解析。已知形态：
 *   ① 双语（v1.0.3 起）：`## English` / `## 中文` 两个区，各自带 `##` 小标题 + `-` 列表；
 *   ② 单语（v1.0.2 及更早）：没有分区标记，整段照显；
 *   ③ 每条尾部还挂着「首次启动要跑 xattr」的说明与 bash 代码块 —— 落地页已有排障章节，
 *      弹层里不重复，整段丢掉。
 */

import notes from './release-notes.json'
import type { Lang } from './copy'

export interface ReleaseNote {
  tag: string
  /** GitHub 的 ISO 时间戳（如 `2026-09-16T13:50:37Z`） */
  publishedAt: string | null
  /** release 正文原文，中英混排的 markdown */
  body: string
}

/** 全部发布记录（新 → 旧）。发版后重跑 `scripts/snapshot-releases.sh` 刷新。 */
export const RELEASE_NOTES = notes as ReleaseNote[]

export type NoteBlock =
  | { kind: 'h'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'p'; text: string }

export interface ChangelogEntry {
  tag: string
  /** YYYY-MM-DD，拿不到就是 null */
  date: string | null
  blocks: NoteBlock[]
}

/** 语言分区标记本身（`## English` / `## 中文`），不进正文。 */
function zoneOf(title: string): Lang | 'skip' | null {
  if (/^(english|英文)$/i.test(title)) return 'en'
  if (/^(中文|chinese)$/i.test(title)) return 'zh'
  // 与落地页「安装后打不开」章节重复，整段不要
  if (/(first launch|首次启动)/i.test(title)) return 'skip'
  return null
}

/** 当前读到的区是否属于这个语言：没标记（shared）时两种语言都有。 */
function belongs(zone: Lang | 'shared' | 'skip', lang: Lang): boolean {
  return zone === 'shared' || zone === lang
}

/** 老版本（v1.0.2）把首次启动说明直接写在正文里、没有小标题，这里按特征词认出来。
 *  落地页的「安装后打不开」章节讲得更清楚，弹层里不再重复一遍。 */
const INSTALL_NOTE = /(xattr|quarantine|Privacy & Security|隐私与安全性|Open Anyway)/i

function parseBody(body: string, lang: Lang): NoteBlock[] {
  const blocks: NoteBlock[] = []
  let zone: Lang | 'shared' | 'skip' = 'shared'
  /** 正在累积的段落 / 列表行，以及它们归属的区（两者不会同时非空） */
  let para: string[] = []
  let list: string[] = []
  let heldZone: Lang | 'shared' | 'skip' = 'shared'
  /** ``` 围栏代码块内部（示例命令），整块跳过 */
  let fence = false

  const flush = () => {
    if (para.length) {
      if (belongs(heldZone, lang)) blocks.push({ kind: 'p', text: para.join(' ') })
      para = []
    }
    if (list.length) {
      if (belongs(heldZone, lang)) blocks.push({ kind: 'list', items: list })
      list = []
    }
  }

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim()

    if (fence) {
      if (line.startsWith('```')) fence = false
      continue
    }
    if (line.startsWith('```')) {
      flush()
      fence = true
      continue
    }
    if (!line) {
      flush()
      continue
    }
    // 一级标题（`# Version 1.1.0 …`）只是版本名，弹层左侧已有 —— 丢掉，但也别当正文
    if (/^#[^#]/.test(line)) {
      flush()
      continue
    }
    // 安装 / 首次启动的说明（含专属命令），见 INSTALL_NOTE
    if (INSTALL_NOTE.test(line)) {
      flush()
      continue
    }

    const heading = line.match(/^#{2,4}\s+(.+)$/)
    if (heading) {
      flush()
      const title = heading[1].trim()
      const next = zoneOf(title)
      if (next) {
        zone = next
        continue
      }
      if (belongs(zone, lang)) blocks.push({ kind: 'h', text: title })
      continue
    }

    const bullet = line.match(/^[-*]\s+(.+)$/)
    if (bullet) {
      if (para.length) flush()
      if (!list.length) heldZone = zone
      list.push(bullet[1].trim())
      continue
    }

    if (list.length) flush()
    if (!para.length) heldZone = zone
    para.push(line)
  }
  flush()

  return blocks
}

/** 发布记录 → 弹层用的条目（新 → 旧），正文按当前语言取。 */
export function toChangelog(notes: ReleaseNote[], lang: Lang): ChangelogEntry[] {
  return notes
    .map((note) => ({
      tag: note.tag,
      date: note.publishedAt ? note.publishedAt.slice(0, 10) : null,
      blocks: parseBody(note.body, lang),
    }))
    .filter((entry) => entry.blocks.length > 0)
}

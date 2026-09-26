#!/usr/bin/env bash
# 刷新 src/release-notes.json —— 更新日志弹层的数据源。
#
# 页面不做任何运行时抓取，这份快照就是弹层看到的全部内容：**每次发版后跑一次**，
# 同时别忘了改 src/app.ts 里的 RELEASE（版本 / 体积 / DMG 链接）与 MIRRORS（网盘链接）。
#
#   ./scripts/snapshot-releases.sh              # 默认 lingyired/status-trio
#   ./scripts/snapshot-releases.sh owner/repo   # 换仓库
set -euo pipefail
cd "$(dirname "$0")/.."

repo=${1:-lingyired/status-trio}
out=src/release-notes.json
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT

# 取 release 列表：**优先用 gh**（已登录，限额 5000/h），拿不到再退回匿名 curl。
# ⚠️ 匿名 `api.github.com` 在本机常年 403（走代理的出口 IP 也被限流），
#    别一上来就 curl —— 那样脚本会直接失败。gh 不在 PATH 时认 /opt/homebrew/bin/gh。
gh_bin=$(command -v gh 2>/dev/null || true)
if [ -z "$gh_bin" ] && [ -x /opt/homebrew/bin/gh ]; then
  gh_bin=/opt/homebrew/bin/gh
fi
if [ -n "$gh_bin" ]; then
  "$gh_bin" api "repos/$repo/releases?per_page=100" > "$tmp"
else
  curl -sSfL --max-time 30 "https://api.github.com/repos/$repo/releases?per_page=100" -o "$tmp"
fi

python3 - "$tmp" "$out" <<'PY'
import json, sys

raw, out = sys.argv[1], sys.argv[2]
releases = [r for r in json.load(open(raw)) if r.get('tag_name') and not r.get('prerelease')]
# 新 → 旧；弹层第一条就是最新版
releases.sort(key=lambda r: r.get('published_at') or '', reverse=True)
notes = [
    {'tag': r['tag_name'], 'publishedAt': r.get('published_at'), 'body': r.get('body') or ''}
    for r in releases
]
with open(out, 'w') as f:
    json.dump(notes, f, ensure_ascii=False, indent=2)
    f.write('\n')
print(f'{out} ← {len(notes)} 条：' + ', '.join(n['tag'] for n in notes))
PY

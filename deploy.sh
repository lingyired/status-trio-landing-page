#!/usr/bin/env bash
# 部署 Status Trio Landing Page（rsbuild 静态站）：本地构建 -> rsync dist/ 到服务器
# 目标地址（同一份产物，两个入口）：
#   https://statustrio.lingai.net/     （子域根路径）
#   https://lingai.net/statustrio/     （主域子路径）
# 前置：
#   1. ~/.ssh/config 已配 lingai-vps 别名（HostName 64.90.31.192 / Port 47291 / 私钥）
#   2. 服务器目录 /www/wwwroot/statustrio-landing/dist 已存在，nginx 路由已配好
#      （见 lingai-server 仓库 .workbuddy/VPS_ACCESS.md §14，无需重复配置 nginx）
# 说明：--delete 以本地为真源，服务器多余旧文件会被清掉。
set -euo pipefail
cd "$(dirname "$0")"

echo "==> [1/3] 类型检查 ..."
corepack pnpm run typecheck

echo "==> [2/3] 本地构建 dist/ ..."
corepack pnpm run build

echo "==> [3/3] 同步 dist/ 到服务器 (lingai-vps:/www/wwwroot/statustrio-landing/dist/) ..."
rsync -avz --delete -e ssh dist/ lingai-vps:/www/wwwroot/statustrio-landing/dist/

echo "==> 部署完成："
echo "    https://statustrio.lingai.net/"
echo "    https://lingai.net/statustrio/"

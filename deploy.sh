#!/bin/bash
# =====================================================
# Enterprise Workspace 一键部署脚本
# 用法: bash deploy.sh [build|start|restart|stop|logs|status]
# =====================================================

set -e

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 配置
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
PM2_NAME="workspace-api"
DEPLOY_DIR="$PROJECT_DIR/dist-deploy"

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; }

# =====================================================
# 打包构建
# =====================================================
do_build() {
    echo ""
    echo "========================================="
    echo "  Enterprise Workspace - 构建打包"
    echo "========================================="
    echo ""

    # 1. 安装依赖
    log "安装前端依赖..."
    cd "$FRONTEND_DIR" && npm install

    log "安装后端依赖..."
    cd "$BACKEND_DIR" && npm install

    # 2. 打包前端
    log "打包前端 (vite build)..."
    cd "$FRONTEND_DIR" && npm run build
    log "前端打包完成 → frontend/dist/"

    # 3. 打包后端
    log "打包后端 (tsc)..."
    cd "$BACKEND_DIR" && npm run build
    log "后端打包完成 → backend/dist/"

    # 4. 收集部署文件
    log "收集部署文件到 dist-deploy/..."
    rm -rf "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR/frontend"
    mkdir -p "$DEPLOY_DIR/backend"

    # 前端静态文件
    cp -r "$FRONTEND_DIR/dist/"* "$DEPLOY_DIR/frontend/"

    # 后端编译文件
    cp -r "$BACKEND_DIR/dist/"* "$DEPLOY_DIR/backend/"

    # 后端运行时文件
    cp "$BACKEND_DIR/package.json" "$DEPLOY_DIR/backend/"
    cp "$BACKEND_DIR/package-lock.json" "$DEPLOY_DIR/backend/"
    cp "$BACKEND_DIR/.env" "$DEPLOY_DIR/backend/" 2>/dev/null || warn "backend/.env 不存在，跳过"

    # 上传目录
    mkdir -p "$DEPLOY_DIR/backend/uploads"

    echo ""
    echo "========================================="
    echo -e "  ${GREEN}构建完成！${NC}"
    echo "========================================="
    echo ""
    echo "部署文件结构:"
    echo "  dist-deploy/"
    echo "  ├── frontend/    # Nginx 静态文件"
    echo "  └── backend/     # Node.js 后端"
    echo "      ├── *.js     # 编译后的代码"
    echo "      ├── package.json"
    echo "      ├── .env"
    echo "      └── uploads/"
    echo ""
    echo "下一步:"
    echo "  1. 将 dist-deploy/ 上传到服务器"
    echo "  2. 服务器执行: cd backend && npm install --omit=dev"
    echo "  3. 启动: node index.js 或 pm2 start index.js --name $PM2_NAME"
    echo ""
}

# =====================================================
# 启动服务 (本地开发用)
# =====================================================
do_start() {
    log "启动后端服务..."
    cd "$BACKEND_DIR"

    if command -v pm2 &> /dev/null; then
        pm2 start src/index.ts --name "$PM2_NAME" --interpreter tsx --watch
        log "后端已通过 PM2 启动 (名称: $PM2_NAME)"
        pm2 list
    else
        warn "PM2 未安装，使用 tsx 直接启动"
        npx tsx src/index.ts &
        log "后端已启动 (PID: $!)"
    fi

    log "启动前端开发服务器..."
    cd "$FRONTEND_DIR"
    npx vite --host &
    log "前端已启动 → http://localhost:3000"
}

# =====================================================
# 停止服务
# =====================================================
do_stop() {
    if command -v pm2 &> /dev/null; then
        pm2 stop "$PM2_NAME" 2>/dev/null && log "已停止 $PM2_NAME" || warn "$PM2_NAME 未运行"
        pm2 delete "$PM2_NAME" 2>/dev/null
    fi
    # 杀掉 tsx 进程
    pkill -f "tsx.*index.ts" 2>/dev/null && log "已停止 tsx 进程" || true
}

# =====================================================
# 重启服务
# =====================================================
do_restart() {
    do_stop
    sleep 1
    do_start
}

# =====================================================
# 查看日志
# =====================================================
do_logs() {
    if command -v pm2 &> /dev/null; then
        pm2 logs "$PM2_NAME" --lines 50
    else
        warn "PM2 未安装，无法查看日志"
    fi
}

# =====================================================
# 查看状态
# =====================================================
do_status() {
    echo ""
    if command -v pm2 &> /dev/null; then
        pm2 list
    else
        warn "PM2 未安装"
    fi

    echo ""
    log "检查端口占用:"
    netstat -ano 2>/dev/null | grep -E "LISTEN.*:(3000|8000)" || ss -tlnp 2>/dev/null | grep -E ":(3000|8000)" || echo "  无服务运行"
    echo ""
}

# =====================================================
# 主入口
# =====================================================
case "${1:-build}" in
    build)      do_build ;;
    start)      do_start ;;
    stop)       do_stop ;;
    restart)    do_restart ;;
    logs)       do_logs ;;
    status)     do_status ;;
    *)
        echo "用法: bash deploy.sh [命令]"
        echo ""
        echo "命令:"
        echo "  build     打包前后端 (默认)"
        echo "  start     启动服务 (本地开发)"
        echo "  stop      停止服务"
        echo "  restart   重启服务"
        echo "  logs      查看日志"
        echo "  status    查看状态"
        ;;
esac

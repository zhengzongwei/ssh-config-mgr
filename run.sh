#!/bin/bash

# SSH Config Master 开发启动脚本
# 使用方法: ./run.sh

set -e

# 进入项目目录
cd "$(dirname "$0")"

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

if [ ! -d "src-tauri/target" ]; then
    echo "📦 安装 Rust 依赖..."
    cd src-tauri && cargo build && cd ..
fi

echo "🚀 启动开发服务器..."
npm run tauri dev

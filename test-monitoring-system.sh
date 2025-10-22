#!/bin/bash

# 监控报警系统测试脚本
echo "🚀 启动监控报警系统测试..."

# 等待后端服务启动
echo "⏳ 等待后端服务启动..."
sleep 10

# 测试API端点
BASE_URL="http://localhost:8080/api"

echo "📊 测试服务器列表..."
curl -s "$BASE_URL/servers" | jq '.[0:3]' || echo "服务器列表获取失败"

echo ""
echo "📋 测试报警规则列表..."
curl -s "$BASE_URL/alert-rules" | jq '.[0:3]' || echo "报警规则列表获取失败"

echo ""
echo "📈 测试服务器指标..."
curl -s "$BASE_URL/servers/1/metrics/latest" | jq '.' || echo "服务器指标获取失败"

echo ""
echo "🚨 测试报警事件..."
curl -s "$BASE_URL/alert-events" | jq '.[0:3]' || echo "报警事件列表获取失败"

echo ""
echo "✅ 测试完成！"
echo ""
echo "📝 系统功能说明："
echo "1. ✅ 定时指标收集 - 每5秒生成模拟指标数据"
echo "2. ✅ 定时规则评估 - 每30秒评估报警规则"
echo "3. ✅ 报警通知 - 控制台输出 + 邮件通知(占位符)"
echo "4. ✅ 报警去重 - 5分钟冷却期防止报警风暴"
echo "5. ✅ 规则管理 - 完整的CRUD API"
echo "6. ✅ 事件管理 - 报警事件记录和查询"
echo ""
echo "🔍 查看实时日志："
echo "tail -f logs/application.log"

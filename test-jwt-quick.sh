#!/bin/bash

# JWT功能快速测试

BASE_URL="http://localhost:8080/api"

echo "=== JWT功能测试 ==="

# 1. 测试Admin登录
echo "1. Admin用户登录..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

echo "响应: $ADMIN_RESPONSE"

ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.token')
echo "Token: $ADMIN_TOKEN"

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
    echo "✅ Admin登录成功"
    
    echo -e "\n2. 测试Admin获取项目列表..."
    curl -X GET "$BASE_URL/projects/my" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -w "\nHTTP Status: %{http_code}\n"
else
    echo "❌ Admin登录失败"
fi

echo -e "\n3. 测试Operation用户登录..."
OP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "password"}')

echo "响应: $OP_RESPONSE"

OP_TOKEN=$(echo "$OP_RESPONSE" | jq -r '.token')
echo "Token: $OP_TOKEN"

if [ "$OP_TOKEN" != "null" ] && [ -n "$OP_TOKEN" ]; then
    echo "✅ Operation登录成功"
    
    echo -e "\n4. 测试Operation获取项目列表..."
    curl -X GET "$BASE_URL/projects/my" \
      -H "Authorization: Bearer $OP_TOKEN" \
      -w "\nHTTP Status: %{http_code}\n"
else
    echo "❌ Operation登录失败"
fi

echo -e "\n测试完成！"

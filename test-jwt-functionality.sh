#!/bin/bash

# JWT Token功能测试脚本

BASE_URL="http://localhost:8080/api"

echo "=== JWT Token功能测试 ==="

# 1. 测试Admin用户登录
echo "1. 测试Admin用户登录..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

echo "Admin登录响应:"
echo "$ADMIN_RESPONSE" | jq '.'

# 提取Admin token
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.token')
echo "Admin Token: $ADMIN_TOKEN"

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Admin登录失败，无法获取token"
    exit 1
fi

echo -e "\n2. 测试Admin用户获取项目列表..."
curl -X GET "$BASE_URL/projects/my" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n3. 测试Operation用户登录..."
OP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "password"}')

echo "Operation登录响应:"
echo "$OP_RESPONSE" | jq '.'

# 提取Operation token
OP_TOKEN=$(echo "$OP_RESPONSE" | jq -r '.token')
echo "Operation Token: $OP_TOKEN"

if [ "$OP_TOKEN" = "null" ] || [ -z "$OP_TOKEN" ]; then
    echo "❌ Operation登录失败，无法获取token"
    exit 1
fi

echo -e "\n4. 测试Operation用户获取项目列表..."
curl -X GET "$BASE_URL/projects/my" \
  -H "Authorization: Bearer $OP_TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n5. 测试无效token..."
curl -X GET "$BASE_URL/projects/my" \
  -H "Authorization: Bearer invalid-token" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n测试完成！"


#!/bin/bash

# 权限修复测试脚本

BASE_URL="http://localhost:8080/api"

echo "=== 权限修复测试 ==="

# 1. 测试Admin创建项目
echo "1. 测试Admin创建项目 (应该成功)..."
curl -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '{
    "projectName": "Admin Test Project",
    "duration": "3 months",
    "userIds": [2, 3]
  }' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n2. 测试Manager创建项目 (应该成功)..."
curl -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "User-ID: 2" \
  -d '{
    "projectName": "Manager Test Project",
    "duration": "2 months",
    "userIds": [1, 3]
  }' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n3. 测试Operation创建项目 (应该失败403)..."
curl -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "User-ID: 3" \
  -d '{
    "projectName": "Operation Test Project",
    "duration": "1 month"
  }' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n4. 测试Operation用户访问自己的项目 (应该成功)..."
curl -X GET "$BASE_URL/projects/1" \
  -H "User-ID: 3" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n5. 测试Operation用户访问别人的项目 (应该失败403)..."
curl -X GET "$BASE_URL/projects/2" \
  -H "User-ID: 3" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n测试完成！"

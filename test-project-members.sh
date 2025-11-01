#!/bin/bash

# 项目成员管理API测试脚本

BASE_URL="http://localhost:8080/api"

echo "=== 项目成员管理API测试 ==="

# 1. 创建项目（包含成员）
echo "1. 创建项目..."
curl -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '{
    "projectName": "测试项目",
    "duration": "3个月",
    "servers": [1, 2],
    "userIds": [1, 2, 3]
  }' | jq '.'

echo -e "\n2. 获取项目详情..."
curl -X GET "$BASE_URL/projects/1" \
  -H "User-ID: 1" | jq '.'

echo -e "\n3. 添加项目成员 (使用admin用户)..."
curl -X POST "$BASE_URL/projects/1/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '[4, 5]' | jq '.'

echo -e "\n4. 查看项目成员..."
curl -X GET "$BASE_URL/projects/1/members" | jq '.'

echo -e "\n5. 移除项目成员 (使用manager用户)..."
curl -X DELETE "$BASE_URL/projects/1/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 2" \
  -d '[4]' | jq '.'

echo -e "\n6. 测试operation用户尝试移除成员 (应该失败)..."
curl -X DELETE "$BASE_URL/projects/1/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 3" \
  -d '[5]' | jq '.'

echo -e "\n7. 最终项目成员列表..."
curl -X GET "$BASE_URL/projects/1/members" | jq '.'

echo -e "\n8. 根据用户ID获取项目列表..."
curl -X GET "$BASE_URL/projects/by-user/1" | jq '.'

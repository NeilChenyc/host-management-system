#!/bin/bash

# 项目成员重复添加测试脚本

BASE_URL="http://localhost:8080/api"

echo "=== 项目成员重复添加测试 ==="

# 1. 首先创建一个项目
echo "1. 创建测试项目..."
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '{
    "projectName": "Member Test Project",
    "duration": "3 months",
    "userIds": [2]
  }')

echo "项目创建响应:"
echo "$PROJECT_RESPONSE" | jq '.'

# 提取项目ID
PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.id')
echo "项目ID: $PROJECT_ID"

echo -e "\n2. 尝试添加已存在的成员 (应该返回409冲突)..."
curl -X POST "$BASE_URL/projects/$PROJECT_ID/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '[2]' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n3. 添加新成员 (应该成功)..."
curl -X POST "$BASE_URL/projects/$PROJECT_ID/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '[3]' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n4. 再次尝试添加同一个新成员 (应该返回409冲突)..."
curl -X POST "$BASE_URL/projects/$PROJECT_ID/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '[3]' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n5. 尝试添加不存在的用户 (应该返回404)..."
curl -X POST "$BASE_URL/projects/$PROJECT_ID/members" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '[999]' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n6. 查看项目成员列表..."
curl -X GET "$BASE_URL/projects/$PROJECT_ID/members" \
  -H "User-ID: 1" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n测试完成！"

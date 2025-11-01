#!/bin/bash

# 项目错误处理测试脚本

BASE_URL="http://localhost:8080/api"

echo "=== 项目错误处理测试 ==="

# 1. 测试不存在的项目ID
echo "1. 测试不存在的项目ID (应该返回404)..."
curl -X GET "$BASE_URL/projects/999" \
  -H "User-ID: 1" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n2. 测试不存在的项目名称 (应该返回404)..."
curl -X GET "$BASE_URL/projects/by-name/NonExistentProject" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n3. 测试无效的项目状态 (应该返回400)..."
curl -X GET "$BASE_URL/projects/by-status/INVALID_STATUS" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n4. 测试权限不足 (应该返回403)..."
curl -X GET "$BASE_URL/projects/1" \
  -H "User-ID: 999" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n5. 测试缺少User-ID请求头 (应该返回400)..."
curl -X GET "$BASE_URL/projects/1" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n6. 测试无效的JSON格式 (应该返回400)..."
curl -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '{"invalid": json}' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n7. 测试项目名称重复 (应该返回409)..."
curl -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "User-ID: 1" \
  -d '{
    "projectName": "Existing Project",
    "duration": "3 months"
  }' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo -e "\n测试完成！"

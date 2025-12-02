#!/bin/bash

# Mock数据API导入脚本
# 使用API端点批量创建mock数据

# 获取管理员token
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NjQ2NTQ4OTgsImV4cCI6MTc2NTI1OTY5OH0.KPLMCHa5VVxSdS3iT2HeJCu8_JyqMVBi_RCzFgK3aOs"

echo "开始导入服务器数据..."

# 服务器数据
curl -X POST http://localhost:8081/api/servers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverName":"web-server-01","ipAddress":"192.168.1.10","operatingSystem":"Ubuntu 22.04 LTS","cpu":"Intel Xeon E5-2680v4 2.40GHz","memory":"32GB DDR4","status":"online"}'

curl -X POST http://localhost:8081/api/servers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverName":"app-server-02","ipAddress":"192.168.1.20","operatingSystem":"CentOS 8 Stream","cpu":"AMD EPYC 7763 2.45GHz","memory":"64GB DDR4","status":"online"}'

curl -X POST http://localhost:8081/api/servers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverName":"db-server-03","ipAddress":"192.168.1.30","operatingSystem":"Red Hat Enterprise Linux 8.5","cpu":"Intel Xeon Gold 6248R 3.0GHz","memory":"128GB DDR4","status":"online"}'

curl -X POST http://localhost:8081/api/servers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverName":"cache-server-04","ipAddress":"192.168.1.40","operatingSystem":"Debian 11","cpu":"Intel Core i9-12900K 3.2GHz","memory":"16GB DDR4","status":"online"}'

curl -X POST http://localhost:8081/api/servers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverName":"api-gateway-05","ipAddress":"192.168.1.50","operatingSystem":"Ubuntu 20.04 LTS","cpu":"Intel Xeon E5-2650v4 2.20GHz","memory":"24GB DDR4","status":"offline"}'

curl -X POST http://localhost:8081/api/servers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverName":"monitor-server-06","ipAddress":"192.168.1.60","operatingSystem":"CentOS 7.9","cpu":"Intel Core i7-9700K 3.6GHz","memory":"16GB DDR4","status":"online"}'

curl -X POST http://localhost:8081/api/servers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverName":"backup-server-07","ipAddress":"192.168.1.70","operatingSystem":"Ubuntu 18.04 LTS","cpu":"Intel Xeon E5-2620v4 2.10GHz","memory":"48GB DDR4","status":"maintenance"}'

curl -X POST http://localhost:8081/api/servers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverName":"test-server-08","ipAddress":"192.168.1.80","operatingSystem":"Fedora 35","cpu":"AMD Ryzen 7 5800X 3.8GHz","memory":"32GB DDR4","status":"online"}'

echo "服务器数据导入完成！"

echo "开始导入项目数据..."

# 项目数据
curl -X POST http://localhost:8081/api/projects \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"E-commerce Platform","description":"Online shopping platform with payment integration","status":"active","startDate":"2024-01-15","endDate":"2024-06-30"}'

curl -X POST http://localhost:8081/api/projects \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Mobile Banking App","description":"Secure mobile banking application for iOS and Android","status":"active","startDate":"2024-02-01","endDate":"2024-08-31"}'

curl -X POST http://localhost:8081/api/projects \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Data Analytics Dashboard","description":"Real-time data visualization and analytics platform","status":"planning","startDate":"2024-03-15","endDate":"2024-09-15"}'

curl -X POST http://localhost:8081/api/projects \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"IoT Management System","description":"Centralized management system for IoT devices","status":"active","startDate":"2023-11-01","endDate":"2024-04-30"}'

curl -X POST http://localhost:8081/api/projects \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"AI Chatbot Platform","description":"Intelligent customer service chatbot with NLP capabilities","status":"completed","startDate":"2023-09-01","endDate":"2024-01-31"}'

echo "项目数据导入完成！"

echo "Mock数据导入完成！请检查数据库状态。"
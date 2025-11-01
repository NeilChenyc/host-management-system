# 在其他电脑上部署Agent完整指南

## 🎯 概述

将Agent部署到其他电脑，实现远程服务器监控。

---

## 📋 前提条件

### 你的平台服务器（监控平台）
- ✅ Spring Boot后端运行在某个IP地址（例如：`192.168.1.100:8080`）
- ✅ 网络可访问（防火墙开放8080端口）

### 被监控的电脑（目标机器）
- ✅ 有网络连接
- ✅ 能访问你的平台服务器
- ✅ 安装了Python 3.8+

---

## 🚀 部署步骤

### 第1步：在平台上添加服务器记录

**重要！** 先在平台上创建服务器记录，获取服务器ID。

#### 方式A：使用Swagger UI
1. 访问 `http://你的IP:8080/swagger-ui.html`
2. 登录获取JWT token
3. 找到 `POST /api/servers` 接口
4. 创建服务器：
```json
{
  "serverName": "Remote-Server-01",
  "ipAddress": "192.168.1.200",
  "operatingSystem": "Windows 11",
  "status": "unknown"
}
```
5. **记下返回的服务器ID**（例如：2）

#### 方式B：使用PowerShell
```powershell
# 登录获取token
$login = Invoke-RestMethod -Uri "http://你的IP:8080/api/auth/signin" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}'

$token = $login.token
$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}

# 创建服务器
$serverData = @{
    serverName = "Remote-Server-01"
    ipAddress = "192.168.1.200"
    operatingSystem = "Windows 11"
    status = "unknown"
} | ConvertTo-Json

$newServer = Invoke-RestMethod -Uri "http://你的IP:8080/api/servers" `
    -Method Post `
    -Headers $headers `
    -Body $serverData

Write-Host "Server ID: $($newServer.id)"
```

---

### 第2步：准备Agent文件

在**你的电脑**上准备以下文件：

#### 文件清单
```
agent-package/
├── server_agent.py          (Agent主程序)
├── agent_config.json        (配置文件)
├── install.bat              (Windows安装脚本)
├── install.sh               (Linux安装脚本)
└── README.txt               (说明文档)
```

#### 创建配置文件模板 `agent_config.json`
```json
{
  "platform_url": "http://你的IP地址:8080/api/servers/metrics/collect",
  "server_id": 2,
  "interval": 60,
  "log_level": "INFO"
}
```

**重要：** 将 `你的IP地址` 替换为你电脑的实际IP地址！

#### 查找你的IP地址

**Windows:**
```cmd
ipconfig
# 查找 IPv4 地址，例如：192.168.1.100
```

**Linux/Mac:**
```bash
ifconfig
# 或
ip addr show
```

---

### 第3步：确保网络可访问

#### A. 开放防火墙端口（你的电脑）

**Windows防火墙：**
```powershell
# 以管理员身份运行
New-NetFirewallRule -DisplayName "Allow Backend 8080" `
    -Direction Inbound `
    -LocalPort 8080 `
    -Protocol TCP `
    -Action Allow
```

或手动：
1. 控制面板 → Windows Defender 防火墙
2. 高级设置 → 入站规则 → 新建规则
3. 端口 → TCP → 特定本地端口：8080
4. 允许连接

**Linux防火墙：**
```bash
# Ubuntu/Debian
sudo ufw allow 8080/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

#### B. 测试连接（从目标机器）

在目标电脑上测试是否能访问你的平台：

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://你的IP:8080/actuator/health" -Method Get

# Linux/Mac
curl http://你的IP:8080/actuator/health
```

如果返回数据，说明网络连接正常！

---

### 第4步：传输文件到目标机器

#### 方式A：U盘/共享文件夹
1. 将 `agent-package` 文件夹复制到U盘
2. 在目标机器上拷贝到本地（例如：`C:\agent` 或 `/opt/agent`）

#### 方式B：通过网络传输
```powershell
# 使用SCP（需要SSH）
scp -r agent-package/ user@192.168.1.200:/opt/agent/

# 或使用远程桌面共享文件
```

#### 方式C：通过云盘
1. 上传到网盘（百度网盘、OneDrive等）
2. 在目标机器下载

---

### 第5步：在目标机器上安装

#### Windows系统

**自动安装（推荐）：**

创建 `install.bat`:
```batch
@echo off
echo ========================================
echo   Installing Server Monitoring Agent
echo ========================================

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo Python found!

:: Install dependencies
echo Installing dependencies...
pip install psutil requests

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit agent_config.json
echo 2. Run: python server_agent.py
echo.
pause
```

运行：
```cmd
install.bat
```

**手动安装：**
```cmd
# 1. 检查Python
python --version

# 2. 安装依赖
pip install psutil requests

# 3. 编辑配置文件
notepad agent_config.json

# 4. 测试运行
python server_agent.py
```

---

#### Linux系统

**自动安装（推荐）：**

创建 `install.sh`:
```bash
#!/bin/bash

echo "========================================"
echo "  Installing Server Monitoring Agent"
echo "========================================"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 is not installed"
    echo "Installing Python3..."
    
    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y python3 python3-pip
    else
        echo "Please install Python3 manually"
        exit 1
    fi
fi

echo "Python found: $(python3 --version)"

# Install dependencies
echo "Installing dependencies..."
pip3 install psutil requests

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

# Make agent executable
chmod +x server_agent.py

echo ""
echo "========================================"
echo "  Installation Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Edit agent_config.json"
echo "2. Run: python3 server_agent.py"
echo "   Or:  ./server_agent.py"
```

运行：
```bash
chmod +x install.sh
./install.sh
```

---

### 第6步：配置Agent

编辑 `agent_config.json`，确保配置正确：

```json
{
  "platform_url": "http://192.168.1.100:8080/api/servers/metrics/collect",
  "server_id": 2,
  "interval": 60,
  "log_level": "INFO"
}
```

**关键配置说明：**
- `platform_url`: 你的平台服务器地址（**不是localhost！**）
- `server_id`: 在平台上创建的服务器ID
- `interval`: 采集间隔（秒）

---

### 第7步：测试运行

**Windows:**
```cmd
python server_agent.py
```

**Linux:**
```bash
python3 server_agent.py
```

**期望输出：**
```
======================================================================
                 服务器监控Agent
======================================================================
服务器ID:        2
平台地址:        http://192.168.1.100:8080/api/servers/metrics/collect
采集间隔:        60 秒
======================================================================

Agent启动成功，开始监控...

==================================================
采集时间: 2025-10-27 23:30:15
  CPU使用率:    15.2%
  内存使用率:   48.5%
  磁盘使用率:   62.3%
✓ 指标推送成功 (HTTP 200)  <-- 看到这个就成功了！
```

---

### 第8步：设置开机自启（可选）

#### Windows - 任务计划程序

1. **创建启动脚本 `start_agent.bat`:**
```batch
@echo off
cd /d C:\agent
python server_agent.py
```

2. **创建任务计划：**
   - 打开"任务计划程序"
   - 创建基本任务
   - 名称：Server Monitoring Agent
   - 触发器：系统启动时
   - 操作：启动程序
     - 程序：`C:\agent\start_agent.bat`
   - 完成

#### Linux - systemd服务

1. **创建服务文件 `/etc/systemd/system/server-agent.service`:**
```ini
[Unit]
Description=Server Monitoring Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/agent
ExecStart=/usr/bin/python3 /opt/agent/server_agent.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

2. **启用并启动服务：**
```bash
sudo systemctl daemon-reload
sudo systemctl enable server-agent
sudo systemctl start server-agent
sudo systemctl status server-agent
```

3. **查看日志：**
```bash
journalctl -u server-agent -f
```

---

## ✅ 验证部署成功

### 在目标机器上

1. **Agent正常运行**
   - 看到 "✓ 指标推送成功"
   - 没有连接错误

2. **进程持续运行**
```powershell
# Windows
Get-Process python

# Linux
ps aux | grep server_agent
```

### 在你的平台上

1. **使用Swagger查询数据：**
```
GET /api/servers/{serverId}/metrics/latest
```
输入目标机器的server_id

2. **查看数据库：**
```sql
SELECT * FROM server_metrics 
WHERE server_id = 2 
ORDER BY collected_at DESC 
LIMIT 10;
```

3. **检查Dashboard：**
访问前端，应该能看到新服务器的监控数据

---

## 🔧 常见问题排查

### 问题1：连接失败

**症状：** `✗ 连接失败 - 无法连接到平台`

**原因：**
- 平台IP地址错误
- 防火墙阻止
- 后端未运行

**解决：**
```bash
# 测试网络连接
ping 192.168.1.100

# 测试端口
telnet 192.168.1.100 8080
# 或
curl http://192.168.1.100:8080/actuator/health
```

---

### 问题2：401 Unauthorized

**症状：** `✗ 推送失败: HTTP 401`

**原因：** 后端未排除Agent接口的JWT验证

**解决：** 确认后端 `WebConfig.java` 中已添加：
```java
.excludePathPatterns("/api/servers/metrics/collect")
```

---

### 问题3：404 Not Found

**症状：** `✗ 推送失败: HTTP 404`

**原因：** 
- URL路径错误
- server_id不存在

**解决：**
1. 检查 `platform_url` 拼写
2. 在平台确认服务器ID存在

---

### 问题4：500 Server Error

**症状：** `✗ 推送失败: HTTP 500`

**原因：** 后端服务异常

**解决：**
1. 查看后端日志
2. 检查数据库连接
3. 确认server_id在数据库中存在

---

## 📊 批量部署多台机器

如果要部署到多台机器，按以下流程：

### 准备阶段
1. 在平台批量创建服务器记录（获取多个server_id）
2. 为每台机器准备独立的配置文件

### 自动化脚本
```bash
# deploy_multiple.sh
#!/bin/bash

SERVERS=(
  "192.168.1.201:2"
  "192.168.1.202:3"
  "192.168.1.203:4"
)

for server in "${SERVERS[@]}"; do
  IP=$(echo $server | cut -d: -f1)
  SERVER_ID=$(echo $server | cut -d: -f2)
  
  echo "Deploying to $IP (Server ID: $SERVER_ID)..."
  
  # 复制文件
  scp server_agent.py user@$IP:/opt/agent/
  
  # 创建配置
  ssh user@$IP "echo '{\"platform_url\":\"http://你的IP:8080/api/servers/metrics/collect\",\"server_id\":$SERVER_ID,\"interval\":60}' > /opt/agent/agent_config.json"
  
  # 安装依赖并启动
  ssh user@$IP "cd /opt/agent && pip3 install psutil requests && python3 server_agent.py &"
done
```

---

## 🎯 部署检查清单

**部署前：**
- [ ] 在平台创建服务器记录
- [ ] 记录服务器ID
- [ ] 确认平台IP地址
- [ ] 测试网络连通性
- [ ] 开放防火墙端口

**部署中：**
- [ ] 复制Agent文件到目标机器
- [ ] 安装Python 3.8+
- [ ] 安装psutil和requests
- [ ] 配置agent_config.json
- [ ] 测试运行Agent

**部署后：**
- [ ] Agent输出正常
- [ ] 看到"推送成功"
- [ ] 平台能查询到数据
- [ ] 设置开机自启（可选）

---

## 🎉 完成！

现在你知道如何在任意电脑上部署Agent了！

**核心要点：**
1. 先在平台创建服务器记录
2. 配置文件中使用平台的IP地址（不是localhost）
3. 确保网络互通
4. server_id要对应正确

**监控网络架构：**
```
你的平台服务器                远程服务器们
(192.168.1.100)             (多台)
      ↓                        ↓
  ┌─────────┐         ┌──────────┬──────────┬──────────┐
  │Spring   │  <───  │Server A  │Server B  │Server C  │
  │Boot     │  推送  │+ Agent   │+ Agent   │+ Agent   │
  │8080端口 │         │ID: 2     │ID: 3     │ID: 4     │
  └─────────┘         └──────────┴──────────┴──────────┘
```

有问题随时问我！🚀


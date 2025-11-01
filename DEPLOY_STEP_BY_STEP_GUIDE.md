# 超详细Agent部署指南（手把手教程）

## 📚 目录

1. [部署前准备](#部署前准备)
2. [在你的电脑上操作](#在你的电脑上操作)
3. [在目标电脑上操作](#在目标电脑上操作)
4. [验证和测试](#验证和测试)
5. [常见问题解决](#常见问题解决)

---

## 🎯 部署前准备

### 理解整个系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        完整监控系统                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  你的电脑(监控中心)              目标电脑(被监控的服务器)         │
│  IP: 192.168.1.100              IP: 192.168.1.200             │
│       ↓                              ↓                         │
│  ┌─────────────┐                ┌─────────────┐               │
│  │ Spring Boot │ ←──推送数据──  │  Python     │               │
│  │ 后端        │   每60秒       │  Agent      │               │
│  │ 端口:8080   │   HTTP POST    │  采集指标   │               │
│  └─────────────┘                └─────────────┘               │
│       ↓                                                        │
│  ┌─────────────┐                                               │
│  │   MySQL     │                                               │
│  │   数据库    │                                               │
│  │server_metrics│                                              │
│  └─────────────┘                                               │
│       ↓                                                        │
│  ┌─────────────┐                                               │
│  │  Next.js    │                                               │
│  │  前端展示   │                                               │
│  │ 端口:3000   │                                               │
│  └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流向

```
步骤1: Agent采集系统指标
       ↓
步骤2: 打包成JSON数据
       {
         "serverId": 2,
         "cpuUsage": 25.5,
         "memoryUsage": 48.2,
         ...
       }
       ↓
步骤3: HTTP POST推送到你的电脑
       POST http://192.168.1.100:8080/api/servers/metrics/collect
       ↓
步骤4: 后端接收并保存到数据库
       INSERT INTO server_metrics ...
       ↓
步骤5: 前端查询并展示
       SELECT * FROM server_metrics WHERE server_id = 2
```

### 需要准备的东西

- [ ] 你的电脑（监控平台）
  - Spring Boot后端正在运行
  - 知道自己的IP地址
  - 防火墙已配置
  
- [ ] 目标电脑（被监控）
  - 能联网
  - 能访问你的电脑
  - 稍后安装Python

- [ ] 网络环境
  - 两台电脑在同一局域网
  - 或目标电脑能通过互联网访问你的电脑

---

## 📍 在你的电脑上操作

### 🔹 步骤1：查找你的IP地址

#### Windows系统

1. 按 `Win + R`
2. 输入 `cmd`，回车
3. 输入命令：
```cmd
ipconfig
```

4. 查找输出中的 **IPv4 地址**：
```
以太网适配器 以太网:
   IPv4 地址 . . . . . . . . . . . . : 192.168.1.100  <-- 这个就是！
   子网掩码  . . . . . . . . . . . . : 255.255.255.0
   默认网关. . . . . . . . . . . . . : 192.168.1.1
```

**记下这个IP地址：`192.168.1.100`**

#### 如果看到多个网络适配器：

```
无线局域网适配器 WLAN:
   IPv4 地址 . . . . . . . . . : 192.168.1.100  <-- 如果用WiFi，用这个

以太网适配器 以太网:
   IPv4 地址 . . . . . . . . . : 192.168.2.50   <-- 如果用网线，用这个

以太网适配器 VMware Network Adapter VMnet8:
   IPv4 地址 . . . . . . . . . : 192.168.88.1   <-- 虚拟网卡，忽略
```

**选择规则：**
- 如果用WiFi连接：用 **WLAN** 的IP
- 如果用网线连接：用 **以太网** 的IP
- 忽略虚拟网卡（VMware、VirtualBox等）

---

### 🔹 步骤2：开放防火墙端口

#### 方法A：使用PowerShell（推荐）

1. 右键点击"开始"按钮
2. 选择 **"Windows PowerShell (管理员)"** 或 **"终端 (管理员)"**
3. 输入命令：

```powershell
New-NetFirewallRule -DisplayName "监控平台-后端8080端口" `
    -Direction Inbound `
    -LocalPort 8080 `
    -Protocol TCP `
    -Action Allow
```

4. 看到类似输出表示成功：
```
Name                  : {随机GUID}
DisplayName           : 监控平台-后端8080端口
Description           :
...
```

#### 方法B：使用图形界面

1. 按 `Win + R`，输入 `wf.msc`，回车
2. 点击左侧 **"入站规则"**
3. 点击右侧 **"新建规则..."**
4. 选择 **"端口"**，下一步
5. 选择 **TCP**，特定本地端口：**8080**，下一步
6. 选择 **"允许连接"**，下一步
7. 全部勾选（域、专用、公用），下一步
8. 名称：**监控平台后端**，完成

#### 验证防火墙规则

```powershell
Get-NetFirewallRule -DisplayName "监控平台*" | Format-Table DisplayName, Enabled, Direction
```

应该看到：
```
DisplayName              Enabled Direction
-----------              ------- ---------
监控平台-后端8080端口      True    Inbound
```

---

### 🔹 步骤3：确认后端正在运行

#### 检查后端状态

```powershell
# 检查8080端口是否在监听
netstat -ano | findstr :8080
```

应该看到类似：
```
TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       12345
TCP    [::]:8080              [::]:0                 LISTENING       12345
```

如果没有输出，说明后端没运行，需要启动：

```powershell
cd D:\5619\ELEC5619-03-Group-1\backend
.\mvnw.cmd spring-boot:run
```

或在IDE中运行 `BackendApplication`

#### 测试后端API

```powershell
# 测试健康检查接口
curl http://localhost:8080/actuator/health

# 测试Agent推送接口
$testData = '{"serverId":1,"cpuUsage":10.0}'
Invoke-RestMethod -Uri "http://localhost:8080/api/servers/metrics/collect" `
    -Method Post -Body $testData -ContentType "application/json"
```

---

### 🔹 步骤4：在平台中创建服务器记录

这一步**非常重要**！必须先创建服务器记录，才能获得 Server ID。

#### 方法A：使用Swagger UI（最简单）

1. 打开浏览器，访问：
```
http://localhost:8080/swagger-ui.html
```

2. 找到 **"Authentication"** 部分，展开 **POST /api/auth/signin**

3. 点击 **"Try it out"**

4. 在Request body中输入：
```json
{
  "username": "admin",
  "password": "admin123"
}
```

5. 点击 **"Execute"**

6. 复制响应中的 **token** 值（很长的一串字符）：
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQ...",  <-- 复制这个
  ...
}
```

7. 点击页面顶部的 **🔓 Authorize** 按钮

8. 粘贴token（**不要加** "Bearer " 前缀），点击 **"Authorize"**，再点击 **"Close"**

9. 找到 **"Server Management"** 部分，展开 **POST /api/servers**

10. 点击 **"Try it out"**

11. 在Request body中输入目标电脑的信息：
```json
{
  "serverName": "Remote-Computer-01",
  "ipAddress": "192.168.1.200",
  "operatingSystem": "Windows 11",
  "cpu": "Intel i5",
  "memory": "16GB",
  "status": "unknown"
}
```

**字段说明：**
- `serverName`: 给目标电脑起个名字（必填）
- `ipAddress`: 目标电脑的IP（必填，可以随便填，后面会更新）
- `operatingSystem`: 操作系统（选填）
- `cpu`: CPU型号（选填）
- `memory`: 内存大小（选填）
- `status`: 状态，填 `unknown` 就行

12. 点击 **"Execute"**

13. 查看响应，**记下 id 值**：
```json
{
  "id": 2,  <-- 这个就是 Server ID，非常重要！
  "serverName": "Remote-Computer-01",
  "ipAddress": "192.168.1.200",
  ...
}
```

**把 Server ID 记在纸上或记事本：`Server ID = 2`**

#### 方法B：使用PowerShell

```powershell
# 1. 登录获取token
$loginResponse = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/auth/signin" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}'

$token = $loginResponse.token
Write-Host "Token获取成功" -ForegroundColor Green

# 2. 创建服务器
$serverData = @{
    serverName = "Remote-Computer-01"
    ipAddress = "192.168.1.200"
    operatingSystem = "Windows 11"
    status = "unknown"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$newServer = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/servers" `
    -Method Post `
    -Headers $headers `
    -Body $serverData

# 3. 显示Server ID
Write-Host "`n服务器创建成功！" -ForegroundColor Green
Write-Host "Server ID: $($newServer.id)" -ForegroundColor Yellow
Write-Host "Server Name: $($newServer.serverName)" -ForegroundColor White
Write-Host "`n请记下这个 Server ID，配置Agent时需要用到！" -ForegroundColor Cyan
```

---

### 🔹 步骤5：创建Agent部署包

现在我们把所有需要的文件打包，方便传输到目标电脑。

#### 运行部署包生成脚本

```powershell
cd D:\5619\ELEC5619-03-Group-1
.\create_deployment_package.ps1
```

#### 交互式输入

脚本会问你几个问题：

**问题1: Platform IP**
```
Enter your platform server IP address:
(e.g., 192.168.1.100 or your public IP)
Platform IP: 
```
输入你在步骤1中找到的IP地址：`192.168.1.100`

**问题2: Server ID**
```
Enter the Server ID for the remote machine:
(Create this in your platform first!)
Server ID: 
```
输入步骤4中获得的Server ID：`2`

#### 查看生成的文件

脚本会创建 `agent-deployment-package` 文件夹：

```
agent-deployment-package/
├── server_agent.py              # Agent主程序
├── agent_config.json            # 配置文件（已自动配置好）
├── install_windows.bat          # Windows安装脚本
├── install_linux.sh             # Linux安装脚本
├── start_agent_windows.bat      # Windows启动脚本
├── start_agent_linux.sh         # Linux启动脚本
└── README.txt                   # 使用说明
```

#### 检查配置文件内容

打开 `agent-deployment-package/agent_config.json`，确认内容：

```json
{
  "platform_url": "http://192.168.1.100:8080/api/servers/metrics/collect",
  "server_id": 2,
  "interval": 60,
  "log_level": "INFO"
}
```

**重要检查：**
- ✅ `platform_url` 中的IP是你的IP（**不是** localhost）
- ✅ `server_id` 是刚才创建的服务器ID
- ✅ 端口是 `8080`

---

### 🔹 步骤6：测试网络连通性（重要！）

在传输文件之前，先确保目标电脑能访问你的电脑。

#### 获取目标电脑的IP

**如果目标电脑在你旁边：**
1. 在目标电脑上按 `Win + R`
2. 输入 `cmd`
3. 输入 `ipconfig`
4. 找到 IPv4 地址，例如：`192.168.1.200`

**如果通过远程桌面：**
- 远程桌面连接时会显示目标IP
- 或在目标机器运行 `ipconfig`

#### 从目标电脑测试连接

**如果目标电脑在你旁边：**

在目标电脑上打开PowerShell，运行：

```powershell
# 测试网络连通性
ping 192.168.1.100

# 测试端口连通性
Test-NetConnection -ComputerName 192.168.1.100 -Port 8080

# 测试HTTP访问
curl http://192.168.1.100:8080/actuator/health
```

**期望结果：**

Ping成功：
```
正在 Ping 192.168.1.100 具有 32 字节的数据:
来自 192.168.1.100 的回复: 字节=32 时间<1ms TTL=128
```

端口测试成功：
```
TcpTestSucceeded : True
```

HTTP测试成功（可能返回403，但不是连接错误就行）：
```
StatusCode        : 403
或
StatusCode        : 200
```

**如果连接失败：**
- 检查两台电脑是否在同一网络
- 检查防火墙是否开放
- 检查后端是否运行

---

### 🔹 步骤7：传输部署包到目标电脑

#### 方法A：U盘传输（最简单）

1. 插入U盘
2. 复制 `agent-deployment-package` 文件夹到U盘
3. 在目标电脑上，从U盘复制到：
   - Windows: `C:\agent\`
   - Linux: `/opt/agent/`

#### 方法B：局域网共享

**在你的电脑上：**

1. 右键点击 `agent-deployment-package` 文件夹
2. 选择"属性" → "共享"标签
3. 点击"共享"，添加 Everyone，权限设为"读取"
4. 记下共享路径，例如：`\\192.168.1.100\agent-deployment-package`

**在目标电脑上：**

1. 按 `Win + R`
2. 输入：`\\192.168.1.100\agent-deployment-package`
3. 复制整个文件夹到 `C:\agent\`

#### 方法C：网盘传输

1. 压缩 `agent-deployment-package` 文件夹
```powershell
Compress-Archive -Path agent-deployment-package -DestinationPath agent-package.zip
```

2. 上传到网盘（百度网盘、OneDrive等）

3. 在目标电脑下载并解压

---

## 🖥️ 在目标电脑上操作

现在切换到目标电脑（被监控的电脑）进行操作。

### 🔹 步骤1：检查Python环境

#### 检查是否已安装Python

打开PowerShell或命令提示符：

```cmd
python --version
```

**如果看到：**
```
Python 3.13.2
```
说明已安装，跳到步骤2。

**如果看到：**
```
'python' 不是内部或外部命令...
```
说明未安装，需要安装Python。

#### 安装Python（如果需要）

**Windows系统：**

1. 访问 https://www.python.org/downloads/
2. 下载最新版Python 3（例如Python 3.11）
3. 运行安装程序
4. **重要：** 勾选 **"Add Python to PATH"**
5. 点击 "Install Now"
6. 安装完成后，重新打开命令提示符，运行 `python --version` 验证

**Linux系统：**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# CentOS/RHEL
sudo yum install python3 python3-pip

# 验证
python3 --version
```

---

### 🔹 步骤2：进入部署目录

打开PowerShell或命令提示符：

```cmd
cd C:\agent\agent-deployment-package
```

或

```cmd
cd /opt/agent/agent-deployment-package
```

查看文件：

```cmd
dir
```

应该看到：
```
server_agent.py
agent_config.json
install_windows.bat
...
```

---

### 🔹 步骤3：安装依赖

#### Windows系统

**方法A：使用安装脚本（推荐）**

双击运行 `install_windows.bat`

或在命令提示符中：
```cmd
install_windows.bat
```

**期望输出：**
```
========================================
  Installing Server Monitoring Agent
========================================
Python found!
Installing dependencies...
Requirement already satisfied: psutil in ...
Requirement already satisfied: requests in ...

========================================
  Installation Complete!
========================================

Configuration:
{
  "platform_url": "http://192.168.1.100:8080/api/servers/metrics/collect",
  "server_id": 2,
  "interval": 60,
  "log_level": "INFO"
}

To start agent, run:
  python server_agent.py

请按任意键继续. . .
```

**方法B：手动安装**

```cmd
pip install psutil requests
```

#### Linux系统

```bash
chmod +x install_linux.sh
./install_linux.sh
```

或手动：

```bash
pip3 install psutil requests
```

---

### 🔹 步骤4：验证配置文件

在启动Agent之前，再次确认配置：

```cmd
type agent_config.json
```

或

```bash
cat agent_config.json
```

**确认以下内容：**
```json
{
  "platform_url": "http://192.168.1.100:8080/api/servers/metrics/collect",
  "server_id": 2,
  "interval": 60,
  "log_level": "INFO"
}
```

**检查清单：**
- [ ] `platform_url` 中的IP是监控平台的IP（**不是** `localhost`）
- [ ] `server_id` 是正确的服务器ID
- [ ] 端口是 `8080`
- [ ] 没有多余的逗号或引号

**如果需要修改：**

Windows:
```cmd
notepad agent_config.json
```

Linux:
```bash
nano agent_config.json
# 或
vim agent_config.json
```

---

### 🔹 步骤5：启动Agent

#### 测试运行（前台）

**Windows:**

```cmd
python server_agent.py
```

**Linux:**

```bash
python3 server_agent.py
```

#### 期望输出

```
======================================================================
                 服务器监控Agent
======================================================================
服务器ID:        2
平台地址:        http://192.168.1.100:8080/api/servers/metrics/collect
采集间隔:        60 秒
启动时间:        2025-10-27 23:30:00
======================================================================

2025-10-27 23:30:00,123 - ServerAgent - INFO - 配置加载成功: agent_config.json
2025-10-27 23:30:00,123 - ServerAgent - INFO - Agent启动成功，开始监控...
2025-10-27 23:30:00,123 - ServerAgent - INFO - 按 Ctrl+C 停止运行

2025-10-27 23:30:02,456 - ServerAgent - INFO - ==================================================
2025-10-27 23:30:02,456 - ServerAgent - INFO - 采集时间: 2025-10-27 23:30:02
2025-10-27 23:30:02,456 - ServerAgent - INFO -   CPU使用率:    15.2%
2025-10-27 23:30:02,456 - ServerAgent - INFO -   内存使用率:   48.5%
2025-10-27 23:30:02,456 - ServerAgent - INFO -   磁盘使用率:   62.3%
2025-10-27 23:30:02,456 - ServerAgent - INFO -   入网流量:     0.01 MB/s
2025-10-27 23:30:02,456 - ServerAgent - INFO -   出网流量:     0.02 MB/s
2025-10-27 23:30:02,456 - ServerAgent - INFO -   系统负载:     1.5
2025-10-27 23:30:06,789 - ServerAgent - INFO - ✓ 指标推送成功 (HTTP 200)
```

**关键信息：**
- ✅ 看到 "Agent启动成功"
- ✅ 看到系统指标（CPU、内存等）
- ✅ **最重要：看到 "✓ 指标推送成功 (HTTP 200)"**

#### 如果看到错误

**错误1: 连接失败**
```
✗ 连接失败 - 无法连接到平台
```

**原因和解决：**
1. 检查 `platform_url` 中的IP是否正确
2. 在目标电脑测试连接：
```cmd
ping 192.168.1.100
curl http://192.168.1.100:8080/actuator/health
```
3. 检查监控平台的后端是否运行
4. 检查防火墙

**错误2: 401 Unauthorized**
```
✗ 推送失败: HTTP 401
```

**原因和解决：**
- 后端的 `WebConfig.java` 没有排除Agent接口
- 需要在监控平台重启后端
- 确认 `WebConfig.java` 中有：
```java
.excludePathPatterns("/api/servers/metrics/collect")
```

**错误3: 404 Not Found**
```
✗ 推送失败: HTTP 404
```

**原因和解决：**
- URL路径错误
- 确认 `platform_url` 是：
```
http://192.168.1.100:8080/api/servers/metrics/collect
```
注意：
- `servers` 有s
- `metrics` 有s
- `collect` 拼写正确

---

### 🔹 步骤6：后台运行Agent

测试成功后，可以让Agent在后台运行。

#### Windows - 使用启动脚本

**方法A：双击运行**

双击 `start_agent_windows.bat`

**方法B：最小化窗口运行**

1. 创建快捷方式到 `start_agent_windows.bat`
2. 右键快捷方式 → 属性
3. 运行方式：**最小化**
4. 确定
5. 双击快捷方式启动

**方法C：完全后台运行（无窗口）**

```powershell
Start-Process python -ArgumentList "server_agent.py" -WindowStyle Hidden -WorkingDirectory "C:\agent\agent-deployment-package"
```

**查看后台进程：**
```powershell
Get-Process python
```

**停止后台进程：**
```powershell
Get-Process python | Stop-Process
```

#### Linux - 后台运行

**方法A：使用nohup**

```bash
nohup python3 server_agent.py > agent.log 2>&1 &
```

**查看日志：**
```bash
tail -f agent.log
```

**查看进程：**
```bash
ps aux | grep server_agent
```

**停止进程：**
```bash
pkill -f server_agent.py
```

**方法B：使用systemd服务（推荐）**

1. 创建服务文件：
```bash
sudo nano /etc/systemd/system/server-agent.service
```

2. 粘贴内容：
```ini
[Unit]
Description=Server Monitoring Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/agent/agent-deployment-package
ExecStart=/usr/bin/python3 /opt/agent/agent-deployment-package/server_agent.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

3. 启用并启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable server-agent
sudo systemctl start server-agent
```

4. 查看状态：
```bash
sudo systemctl status server-agent
```

5. 查看日志：
```bash
journalctl -u server-agent -f
```

---

## ✅ 验证和测试

现在需要验证数据是否成功写入到监控平台。

### 🔹 在目标电脑上验证

#### 查看Agent运行状态

**Windows:**
```powershell
Get-Process python
```

应该看到Python进程在运行。

#### 查看Agent输出

如果是前台运行，直接看终端输出，应该每60秒看到：
```
✓ 指标推送成功 (HTTP 200)
```

---

### 🔹 在监控平台上验证

回到你的电脑（监控平台）进行验证。

#### 方法A：使用Swagger UI

1. 访问 `http://localhost:8080/swagger-ui.html`

2. 登录（如果之前的token过期了）

3. 找到 **GET /api/servers/{serverId}/metrics/latest**

4. 点击 **"Try it out"**

5. 输入 `serverId`: **2** （目标电脑的Server ID）

6. 点击 **"Execute"**

7. 查看响应：
```json
{
  "metricId": 136800,
  "serverId": 2,
  "cpuUsage": 15.2,
  "memoryUsage": 48.5,
  "diskUsage": 62.3,
  "networkIn": 0.01,
  "networkOut": 0.02,
  "loadAvg": 1.5,
  "temperature": null,
  "collectedAt": "2025-10-27T23:30:02.456789"
}
```

**成功标志：**
- ✅ `serverId` 是目标电脑的ID（2）
- ✅ 有CPU、内存等数据
- ✅ `collectedAt` 时间是最近的

#### 方法B：使用PowerShell

```powershell
# 登录
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" `
    -Method Post -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}'

$token = $login.token
$headers = @{"Authorization" = "Bearer $token"}

# 查询最新数据
$latest = Invoke-RestMethod -Uri "http://localhost:8080/api/servers/2/metrics/latest" `
    -Method Get -Headers $headers

# 格式化显示
Write-Host "`n目标电脑的最新指标:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Server ID:     $($latest.serverId)" -ForegroundColor White
Write-Host "CPU使用率:     $($latest.cpuUsage)%" -ForegroundColor Yellow
Write-Host "内存使用率:    $($latest.memoryUsage)%" -ForegroundColor Yellow
Write-Host "磁盘使用率:    $($latest.diskUsage)%" -ForegroundColor Yellow
Write-Host "入网流量:      $($latest.networkIn) MB/s" -ForegroundColor Yellow
Write-Host "出网流量:      $($latest.networkOut) MB/s" -ForegroundColor Yellow
Write-Host "采集时间:      $($latest.collectedAt)" -ForegroundColor Gray
Write-Host "=====================`n" -ForegroundColor Cyan

# 查询历史数据（最近10条）
$history = Invoke-RestMethod -Uri "http://localhost:8080/api/servers/2/metrics?limit=10" `
    -Method Get -Headers $headers

Write-Host "历史数据记录数: $($history.Count)" -ForegroundColor Green
```

#### 方法C：直接查询数据库

```sql
-- 查看最新数据
SELECT * FROM server_metrics 
WHERE server_id = 2 
ORDER BY collected_at DESC 
LIMIT 1;

-- 查看最近10条记录
SELECT 
    metric_id,
    server_id,
    cpu_usage,
    memory_usage,
    disk_usage,
    collected_at
FROM server_metrics 
WHERE server_id = 2 
ORDER BY collected_at DESC 
LIMIT 10;

-- 统计数据条数
SELECT COUNT(*) as total_records 
FROM server_metrics 
WHERE server_id = 2;
```

#### 方法D：在前端Dashboard查看

1. 访问 `http://localhost:3000`（如果前端已启动）
2. 登录
3. 进入Dashboard或Servers页面
4. 应该能看到目标电脑（Server ID: 2）的实时指标

---

## 🔍 常见问题解决

### 问题1：Agent显示"连接失败"

**完整排查步骤：**

#### 1.1 检查目标电脑网络

在目标电脑上：
```cmd
ping 192.168.1.100
```

**如果ping不通：**
- 检查两台电脑是否在同一网络
- 检查网络连接是否正常
- 尝试ping网关：`ping 192.168.1.1`

#### 1.2 检查端口连通性

```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 8080
```

**如果端口不通：**
- 检查监控平台的防火墙
- 检查后端是否运行在8080端口

#### 1.3 检查HTTP访问

```cmd
curl http://192.168.1.100:8080/actuator/health
```

**期望结果：**
- 返回200或403（都说明能访问）
- 不应该是"连接失败"

#### 1.4 检查配置文件

```cmd
type agent_config.json
```

确认：
- IP地址正确
- 端口是8080
- 路径是 `/api/servers/metrics/collect`

---

### 问题2：Agent显示"401 Unauthorized"

**完整解决步骤：**

#### 2.1 检查WebConfig配置

在监控平台上，检查 `backend/src/main/java/com/elec5619/backend/config/WebConfig.java`：

```java
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(jwtInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns(
                "/api/auth/**",
                "/api/servers/metrics/collect",  // <-- 必须有这一行！
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/api-docs/**"
            );
}
```

#### 2.2 重启后端

修改配置后，必须重启后端：

```powershell
# 停止后端（Ctrl+C）
# 重新启动
cd D:\5619\ELEC5619-03-Group-1\backend
.\mvnw.cmd spring-boot:run
```

#### 2.3 验证配置生效

在监控平台上测试：
```powershell
$testData = '{"serverId":1,"cpuUsage":10.0}'
Invoke-RestMethod -Uri "http://localhost:8080/api/servers/metrics/collect" `
    -Method Post -Body $testData -ContentType "application/json"
```

应该成功，不再返回401。

#### 2.4 Agent重试

Agent会每60秒自动重试，等待下一个周期即可看到成功。

---

### 问题3：数据没有出现在数据库

**完整排查步骤：**

#### 3.1 确认Agent推送成功

在目标电脑的Agent输出中，必须看到：
```
✓ 指标推送成功 (HTTP 200)
```

#### 3.2 检查Server ID是否存在

在监控平台上：
```powershell
# 登录
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" `
    -Method Post -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}'

$token = $login.token
$headers = @{"Authorization" = "Bearer $token"}

# 查询服务器是否存在
$server = Invoke-RestMethod -Uri "http://localhost:8080/api/servers/2" `
    -Method Get -Headers $headers

$server
```

**如果返回404，说明Server ID不存在，需要重新创建。**

#### 3.3 查看后端日志

在后端日志中搜索：
```
POST /api/servers/metrics/collect
```

应该看到成功的请求记录。

#### 3.4 直接查询数据库

```sql
SELECT COUNT(*) FROM server_metrics WHERE server_id = 2;
```

如果是0，说明确实没有数据。

---

### 问题4：多台电脑部署

**如果要部署到多台电脑：**

#### 4.1 批量创建服务器记录

```powershell
# 登录
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" `
    -Method Post -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}'

$token = $login.token
$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}

# 创建多台服务器
$servers = @(
    @{serverName="Remote-PC-01"; ipAddress="192.168.1.201"},
    @{serverName="Remote-PC-02"; ipAddress="192.168.1.202"},
    @{serverName="Remote-PC-03"; ipAddress="192.168.1.203"}
)

foreach ($serverInfo in $servers) {
    $serverData = @{
        serverName = $serverInfo.serverName
        ipAddress = $serverInfo.ipAddress
        status = "unknown"
    } | ConvertTo-Json
    
    $newServer = Invoke-RestMethod -Uri "http://localhost:8080/api/servers" `
        -Method Post -Headers $headers -Body $serverData
    
    Write-Host "$($serverInfo.serverName): Server ID = $($newServer.id)" -ForegroundColor Green
}
```

记下每台电脑的Server ID。

#### 4.2 为每台电脑生成部署包

```powershell
# 为Server ID 2生成
.\create_deployment_package.ps1
# 输入IP: 192.168.1.100
# 输入Server ID: 2

# 为Server ID 3生成
.\create_deployment_package.ps1
# 输入IP: 192.168.1.100
# 输入Server ID: 3

# ...
```

或手动修改配置文件中的 `server_id`。

---

## 📝 部署检查清单

### 在监控平台（你的电脑）

- [ ] 知道自己的IP地址
- [ ] 防火墙已开放8080端口
- [ ] 后端正在运行
- [ ] 能访问 http://localhost:8080
- [ ] 在平台创建了服务器记录
- [ ] 记下了Server ID
- [ ] 创建了部署包
- [ ] 从目标电脑能ping通你的IP
- [ ] 从目标电脑能访问 http://你的IP:8080

### 在目标电脑

- [ ] Python已安装（3.8+）
- [ ] psutil和requests已安装
- [ ] 部署包已复制到本地
- [ ] agent_config.json配置正确
- [ ] Agent能正常启动
- [ ] 看到"推送成功"的消息
- [ ] 监控平台能查到数据

---

## 🎉 成功标志

当你看到以下情况，说明部署完全成功：

### 在目标电脑上
```
✓ 指标推送成功 (HTTP 200)
```

### 在监控平台上
```powershell
# 能查到最新数据
$latest = Invoke-RestMethod -Uri "http://localhost:8080/api/servers/2/metrics/latest" ...
$latest.cpuUsage  # 有值！
```

### 在数据库中
```sql
SELECT COUNT(*) FROM server_metrics WHERE server_id = 2;
-- 结果 > 0
```

---

**恭喜！你已经成功在远程电脑上部署了监控Agent！** 🎊

现在系统会：
- ⏰ 每60秒自动采集目标电脑的系统指标
- 📡 自动推送到你的监控平台
- 💾 自动保存到数据库
- 📊 在Dashboard上实时显示

**监控系统已上线！** 🚀


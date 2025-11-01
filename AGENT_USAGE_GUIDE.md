# 服务器监控Agent使用指南

## 🎯 简介

这是一个轻量级的服务器监控Agent，用于采集系统指标并推送到监控平台。

**支持平台**: Windows, Linux, macOS

---

## 📦 安装依赖

### 1. 安装Python 3

**Windows:**
- 下载并安装 [Python 3.8+](https://www.python.org/downloads/)
- 安装时勾选 "Add Python to PATH"

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip
```

**macOS:**
```bash
brew install python3
```

### 2. 安装psutil和requests库

```bash
pip3 install psutil requests
```

或者

```bash
python3 -m pip install psutil requests
```

---

## ⚙️ 配置

### 1. 编辑配置文件 `agent_config.json`

```json
{
  "platform_url": "http://localhost:8080/api/servers/metrics/collect",
  "server_id": 1,
  "interval": 60,
  "log_level": "INFO"
}
```

**配置说明:**
- `platform_url`: 监控平台的API地址
  - 本地测试: `http://localhost:8080/api/servers/metrics/collect`
  - 远程服务器: `http://your-platform-ip:8080/api/servers/metrics/collect`
- `server_id`: 服务器ID（从平台获取）
- `interval`: 采集间隔（秒），建议30-60秒
- `log_level`: 日志级别（DEBUG/INFO/WARNING/ERROR）

### 2. 获取服务器ID

在监控平台中：
1. 登录平台
2. 进入"Servers"页面
3. 添加新服务器或查看现有服务器
4. 记下服务器的ID（例如：1, 2, 3）

---

## 🚀 运行Agent

### 方式1：直接运行（测试用）

**Windows:**
```cmd
python server_agent.py
```

**Linux/Mac:**
```bash
python3 server_agent.py
```

### 方式2：后台运行

**Windows (使用PowerShell):**
```powershell
Start-Process python -ArgumentList "server_agent.py" -WindowStyle Hidden
```

**Linux/Mac (使用nohup):**
```bash
nohup python3 server_agent.py > agent.log 2>&1 &
```

### 方式3：作为系统服务运行（推荐生产环境）

#### Linux (systemd)

创建服务文件 `/etc/systemd/system/server-agent.service`:

```ini
[Unit]
Description=Server Monitoring Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/server-agent
ExecStart=/usr/bin/python3 /opt/server-agent/server_agent.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

启动服务:
```bash
sudo systemctl daemon-reload
sudo systemctl start server-agent
sudo systemctl enable server-agent
sudo systemctl status server-agent
```

查看日志:
```bash
journalctl -u server-agent -f
```

#### Windows (任务计划程序)

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：系统启动时
4. 操作：启动程序
   - 程序：`python`
   - 参数：`server_agent.py`
   - 起始于：`D:\path\to\agent\`

---

## 📊 验证Agent运行

### 1. 查看Agent日志

运行Agent后，你会看到类似的输出：

```
======================================================================
                 服务器监控Agent
======================================================================
服务器ID:        1
平台地址:        http://localhost:8080/api/servers/metrics/collect
采集间隔:        60 秒
启动时间:        2024-01-15 10:30:00
======================================================================

Agent启动成功，开始监控...
按 Ctrl+C 停止运行

==================================================
采集时间: 2024-01-15 10:30:15
  CPU使用率:    45.2%
  内存使用率:   68.5%
  磁盘使用率:   72.3%
  入网流量:     1.25 MB/s
  出网流量:     0.85 MB/s
  系统负载:     1.5
✓ 指标推送成功 (HTTP 200)
```

### 2. 在平台查看数据

**方法1: 使用Swagger UI**
1. 访问 `http://localhost:8080/swagger-ui.html`
2. 找到 `GET /api/servers/{serverId}/metrics/latest`
3. 输入你的服务器ID
4. 点击"Execute"
5. 查看返回的最新指标数据

**方法2: 查看数据库**
```sql
SELECT * FROM server_metrics 
WHERE server_id = 1 
ORDER BY collected_at DESC 
LIMIT 10;
```

**方法3: 使用前端Dashboard**
1. 访问平台前端
2. 进入Dashboard或Servers页面
3. 查看服务器的实时指标

---

## 🔧 常见问题

### Q1: 运行时提示 "ModuleNotFoundError: No module named 'psutil'"

**解决方法:**
```bash
pip3 install psutil requests
```

### Q2: 连接失败 "无法连接到平台"

**检查清单:**
1. 后端是否正常运行？
   ```bash
   curl http://localhost:8080/api/servers/metrics/collect
   ```
2. 配置文件中的URL是否正确？
3. 防火墙是否阻止了连接？

### Q3: 推送成功但平台没有数据

**检查:**
1. `server_id` 是否正确？
2. 数据库中是否有对应的server记录？
3. 查看后端日志是否有错误

### Q4: Windows上温度显示为null

**说明:** Windows系统通常不支持温度读取，这是正常现象。

### Q5: 如何停止Agent？

**前台运行:** 按 `Ctrl+C`

**后台运行:**
```bash
# Linux
ps aux | grep server_agent.py
kill <PID>

# 或使用systemd
sudo systemctl stop server-agent
```

---

## 📝 Demo演示步骤

### 准备工作
1. 启动Spring Boot后端
2. 启动Next.js前端（可选）
3. 在平台添加一台服务器（记下ID）

### 演示流程

**步骤1: 安装依赖**
```bash
pip3 install psutil requests
```

**步骤2: 配置Agent**
编辑 `agent_config.json`，设置正确的 `server_id`

**步骤3: 启动Agent**
```bash
python3 server_agent.py
```

**步骤4: 观察输出**
- Agent每60秒采集一次数据
- 显示CPU、内存、磁盘等指标
- 显示推送状态

**步骤5: 验证数据**
- 打开Swagger UI查看最新指标
- 或查看前端Dashboard
- 或直接查询数据库

**步骤6: 演示实时性（可选）**
- 打开任务管理器
- 运行一个CPU密集型程序
- 观察Agent输出的CPU使用率变化
- 在Dashboard上看到CPU飙升

---

## 🎯 采集的指标说明

| 指标 | 说明 | 单位 | 示例值 |
|------|------|------|--------|
| **cpuUsage** | CPU使用率 | % | 45.2 |
| **memoryUsage** | 内存使用率 | % | 68.5 |
| **diskUsage** | 磁盘使用率 | % | 72.3 |
| **networkIn** | 入网流量速率 | MB/s | 1.25 |
| **networkOut** | 出网流量速率 | MB/s | 0.85 |
| **loadAvg** | 系统负载（1分钟平均） | - | 1.5 |
| **temperature** | CPU温度（如果支持） | °C | 55.0 |

---

## 🔐 安全建议

### Demo环境（当前配置）
- ✅ 无需认证，简单直接
- ✅ 适合课程展示

### 生产环境（未来改进）
- 🔒 添加API Key认证
- 🔒 使用HTTPS传输
- 🔒 限制IP白名单
- 🔒 加密敏感配置

---

## 📊 性能影响

**Agent资源占用:**
- CPU: < 0.5%
- 内存: ~20-30 MB
- 网络: ~1 KB/分钟

**对系统的影响:**
- ✅ 极小，可忽略不计
- ✅ 采集操作不阻塞
- ✅ 异常时自动重试

---

## 🆘 获取帮助

如果遇到问题：

1. 查看Agent日志输出
2. 查看后端日志
3. 检查数据库server_metrics表
4. 使用Swagger测试API是否正常

---

## ✅ 快速检查清单

部署前确认：
- [ ] Python 3已安装
- [ ] psutil和requests已安装
- [ ] agent_config.json已配置
- [ ] 后端服务正在运行
- [ ] 平台中已添加服务器记录
- [ ] server_id正确

运行后确认：
- [ ] Agent正常启动
- [ ] 每60秒输出一次指标
- [ ] 显示"推送成功"
- [ ] 平台能查询到数据

---

## 🎉 成功！

如果你看到：
```
✓ 指标推送成功 (HTTP 200)
```

恭喜！Agent已成功连接到平台并开始推送数据！🎊


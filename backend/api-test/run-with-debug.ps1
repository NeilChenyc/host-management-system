# 设置本地配置文件
env:SPRING_PROFILES_ACTIVE = "local"

# 运行Maven命令并将输出保存到日志文件
Write-Host "正在启动应用程序..."
Write-Host "输出将保存到 debug.log 文件"

# 运行命令并捕获完整输出
$output = & .\mvnw.cmd clean install -e 2>&1

# 将输出写入文件
$output | Out-File -FilePath .\debug.log -Encoding utf8

Write-Host "Command execution completed. Please check debug.log for details."
const axios = require('axios');

// 后端API基础URL
const API_BASE_URL = 'http://localhost:8080/api';

// 认证信息 - 使用之前创建的admin用户
const AUTH_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// 全局变量存储JWT token
let authToken = null;

// 服务器mock数据 - 从DeviceList.tsx提取
const mockServers = [
  {
    serverName: 'WEB-SERVER-01',
    ipAddress: '192.168.1.10',
    operatingSystem: 'Ubuntu 20.04',
    cpu: 'Intel i7-9700K',
    memory: '32GB'
  },
  {
    serverName: 'DB-SERVER-01',
    ipAddress: '192.168.1.11',
    operatingSystem: 'CentOS 8',
    cpu: 'AMD Ryzen 7 3700X',
    memory: '64GB'
  },
  {
    serverName: 'APP-SERVER-01',
    ipAddress: '192.168.1.12',
    operatingSystem: 'Windows Server 2019',
    cpu: 'Intel i5-8400',
    memory: '16GB'
  },
  {
    serverName: 'BACKUP-SERVER-01',
    ipAddress: '192.168.1.13',
    operatingSystem: 'Ubuntu 22.04',
    cpu: 'Intel Xeon E5-2680',
    memory: '128GB'
  },
  {
    serverName: 'TEST-SERVER-01',
    ipAddress: '192.168.1.14',
    operatingSystem: 'Debian 11',
    cpu: 'AMD Ryzen 5 3600',
    memory: '32GB'
  },
  {
    serverName: 'CACHE-SERVER-01',
    ipAddress: '192.168.1.15',
    operatingSystem: 'Redis Enterprise',
    cpu: 'Intel i9-10900K',
    memory: '64GB'
  },
  {
    serverName: 'MONITOR-SERVER-01',
    ipAddress: '192.168.1.16',
    operatingSystem: 'Ubuntu 22.04',
    cpu: 'AMD Ryzen 9 5900X',
    memory: '32GB'
  },
  {
    serverName: 'FILE-SERVER-01',
    ipAddress: '192.168.1.17',
    operatingSystem: 'FreeNAS',
    cpu: 'Intel Xeon Silver 4214',
    memory: '256GB'
  },
  {
    serverName: 'PROXY-SERVER-01',
    ipAddress: '192.168.1.18',
    operatingSystem: 'NGINX Plus',
    cpu: 'Intel i7-11700K',
    memory: '16GB'
  },
  {
    serverName: 'ANALYTICS-SERVER-01',
    ipAddress: '192.168.1.19',
    operatingSystem: 'CentOS Stream 9',
    cpu: 'AMD EPYC 7542',
    memory: '512GB'
  }
];

// 用户登录获取JWT token
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, AUTH_CREDENTIALS, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    authToken = response.data.token;
    console.log('✅ 用户登录成功');
    return true;
  } catch (error) {
    console.error('❌ 用户登录失败:', error.response?.data || error.message);
    return false;
  }
}

// 创建服务器的函数
async function createServer(serverData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/servers`, serverData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`创建服务器 ${serverData.serverName} 失败:`, error.response?.data || error.message);
    throw error;
  }
}

// 检查后端健康状态
async function checkBackendHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/public/health`);
    console.log('后端服务器状态:', response.data);
    return true;
  } catch (error) {
    console.error('后端服务器不可访问:', error.message);
    return false;
  }
}

// 主函数
async function initServerData() {
  console.log('开始初始化服务器数据...');
  
  // 检查后端服务器状态
  const isBackendHealthy = await checkBackendHealth();
  if (!isBackendHealthy) {
    console.error('后端服务器不可访问，请确保后端服务器运行在 http://localhost:8080');
    process.exit(1);
  }

  // 用户登录获取认证token
  const isLoggedIn = await login();
  if (!isLoggedIn) {
    console.error('用户登录失败，无法访问受保护的API接口');
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  // 逐个创建服务器
  for (const serverData of mockServers) {
    try {
      console.log(`正在创建服务器: ${serverData.serverName} (${serverData.ipAddress})`);
      const result = await createServer(serverData);
      console.log(`✅ 成功创建服务器: ${serverData.serverName}`, result);
      successCount++;
    } catch (error) {
      console.error(`❌ 创建服务器失败: ${serverData.serverName}`);
      failCount++;
    }
  }

  console.log('\n=== 服务器数据初始化完成 ===');
  console.log(`成功创建: ${successCount} 个服务器`);
  console.log(`创建失败: ${failCount} 个服务器`);
  
  if (successCount > 0) {
    console.log('\n已成功写入数据库的服务器:');
    mockServers.slice(0, successCount).forEach((server, index) => {
      console.log(`${index + 1}. ${server.serverName} - ${server.ipAddress} (${server.operatingSystem})`);
    });
    
    console.log('\n下一步操作建议:');
    console.log('1. 访问前端应用查看服务器列表');
    console.log('2. 测试服务器状态更新功能');
    console.log('3. 验证服务器管理功能是否正常工作');
  }
}

// 运行初始化
initServerData().catch(error => {
  console.error('初始化过程中发生错误:', error);
  process.exit(1);
});
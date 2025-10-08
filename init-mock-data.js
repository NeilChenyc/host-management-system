#!/usr/bin/env node

/**
 * 数据初始化脚本
 * 将前端mock数据通过后端API写入数据库
 */

const axios = require('axios');

// 后端API基础URL
const API_BASE_URL = 'http://localhost:8080/api';

// Mock用户数据 - 基于前端auth.ts中的角色和权限设计
const mockUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    roles: ['ROLE_ADMIN'],
    description: 'System Administrator with full access'
  },
  {
    username: 'operator1',
    email: 'operator1@example.com', 
    password: 'operator123',
    roles: ['ROLE_OPERATOR'],
    description: 'System Operator with management access'
  },
  {
    username: 'operator2',
    email: 'operator2@example.com',
    password: 'operator123', 
    roles: ['ROLE_OPERATOR'],
    description: 'System Operator with management access'
  },
  {
    username: 'viewer1',
    email: 'viewer1@example.com',
    password: 'viewer123',
    roles: ['ROLE_USER'], // 后端使用ROLE_USER对应前端viewer
    description: 'Read-only user with limited access'
  },
  {
    username: 'viewer2', 
    email: 'viewer2@example.com',
    password: 'viewer123',
    roles: ['ROLE_USER'],
    description: 'Read-only user with limited access'
  },
  {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'test123',
    roles: ['ROLE_USER'],
    description: 'Test user for development'
  }
];

/**
 * 检查后端服务器是否可用
 */
async function checkServerHealth() {
  try {
    console.log('🔍 Checking backend server health...');
    const response = await axios.get(`${API_BASE_URL}/public/health`, {
      timeout: 5000
    });
    console.log('✅ Backend server is running');
    return true;
  } catch (error) {
    console.error('❌ Backend server is not accessible:', error.message);
    console.log('💡 Please ensure the backend server is running on http://localhost:8080');
    return false;
  }
}

/**
 * 注册单个用户
 */
async function registerUser(user) {
  try {
    const payload = {
      username: user.username,
      email: user.email,
      password: user.password
    };

    console.log(`📝 Registering user: ${user.username} (${user.email})`);
    
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Successfully registered: ${user.username}`);
    return {
      success: true,
      user: response.data,
      originalData: user
    };
  } catch (error) {
    if (error.response) {
      // 后端返回了错误响应
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 400 && errorData && typeof errorData === 'string' && errorData.includes('already exists')) {
        console.log(`⚠️  User ${user.username} already exists, skipping...`);
        return {
          success: false,
          skipped: true,
          reason: 'User already exists'
        };
      } else {
        console.error(`❌ Failed to register ${user.username}:`, errorData || error.message);
        return {
          success: false,
          error: errorData || error.message
        };
      }
    } else {
      console.error(`❌ Network error registering ${user.username}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * 批量注册所有mock用户
 */
async function initializeMockData() {
  console.log('🚀 Starting mock data initialization...');
  console.log(`📊 Total users to register: ${mockUsers.length}`);
  console.log('');

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  // 逐个注册用户（避免并发导致的数据库冲突）
  for (const user of mockUsers) {
    const result = await registerUser(user);
    
    if (result.success) {
      results.success.push(result);
    } else if (result.skipped) {
      results.skipped.push(result);
    } else {
      results.failed.push(result);
    }
    
    // 短暂延迟，避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * 打印结果摘要
 */
function printSummary(results) {
  console.log('');
  console.log('📋 Initialization Summary:');
  console.log('========================');
  console.log(`✅ Successfully registered: ${results.success.length}`);
  console.log(`⚠️  Skipped (already exists): ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('');

  if (results.success.length > 0) {
    console.log('✅ Successfully registered users:');
    results.success.forEach(result => {
      const user = result.originalData;
      console.log(`   - ${user.username} (${user.email}) - ${user.description}`);
    });
    console.log('');
  }

  if (results.skipped.length > 0) {
    console.log('⚠️  Skipped users (already exist):');
    results.skipped.forEach((result, index) => {
      const user = mockUsers.find(u => u.username === mockUsers[index].username);
      if (user) {
        console.log(`   - ${user.username} (${user.email})`);
      }
    });
    console.log('');
  }

  if (results.failed.length > 0) {
    console.log('❌ Failed registrations:');
    results.failed.forEach((result, index) => {
      const user = mockUsers[index];
      console.log(`   - ${user.username}: ${result.error}`);
    });
    console.log('');
  }

  console.log('🎯 Next steps:');
  console.log('   1. You can now test login with any of the registered users');
  console.log('   2. Use the credentials shown above to login via the frontend');
  console.log('   3. Check the database to verify the data was stored correctly');
  console.log('');
  console.log('💡 Example login credentials:');
  console.log('   - Admin: admin / admin123');
  console.log('   - Operator: operator1 / operator123');
  console.log('   - Viewer: viewer1 / viewer123');
}

/**
 * 主函数
 */
async function main() {
  try {
    // 检查服务器健康状态
    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
      process.exit(1);
    }

    console.log('');
    
    // 初始化mock数据
    const results = await initializeMockData();
    
    // 打印结果摘要
    printSummary(results);
    
    // 根据结果设置退出码
    if (results.failed.length > 0) {
      console.log('⚠️  Some users failed to register. Check the errors above.');
      process.exit(1);
    } else {
      console.log('🎉 Mock data initialization completed successfully!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error during initialization:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  mockUsers,
  registerUser,
  initializeMockData,
  checkServerHealth
};
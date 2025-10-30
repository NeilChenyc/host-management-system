import type { NextConfig } from 'next';

/* ===========================================================
 * 🌐 环境变量设置
 * -----------------------------------------------------------
 * BACKEND_ORIGIN:  后端服务地址（Spring Boot 端口，默认为 8081）
 * NEXT_PUBLIC_API_PREFIX:  前端调用 API 的统一前缀（通常为 /api）
 * =========================================================== */
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || 'http://localhost:8080'; // 后端地址
const API_PREFIX =
  process.env.NEXT_PUBLIC_API_PREFIX?.startsWith('/')
    ? process.env.NEXT_PUBLIC_API_PREFIX
    : `/${process.env.NEXT_PUBLIC_API_PREFIX || 'api'}`; // 确保以 / 开头

/* ===========================================================
 * ⚙️ Next.js 配置
 * -----------------------------------------------------------
 * 使用 rewrites 将前端 /api/* 请求转发到后端 /api/*
 * 这样在本地开发时可以避免 CORS（跨域）问题。
 * =========================================================== */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: `${API_PREFIX}/:path*`,
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },

  // 🧩 如果需要自定义响应头（例如调试跨域），可以启用此段
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         { key: 'Access-Control-Allow-Origin', value: '*' },
  //         { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
  //         { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
  //       ],
  //     },
  //   ];
  // },
};

/* ===========================================================
 * ✅ 导出配置
 * =========================================================== */
export default nextConfig;

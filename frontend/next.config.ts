import type { NextConfig } from 'next';

/* ===========================================================
 * 🌐 Environment Variables Configuration
 * -----------------------------------------------------------
 * BACKEND_ORIGIN:  Backend service address (Spring Boot port, default 8081)
 * NEXT_PUBLIC_API_PREFIX:  Unified prefix for frontend API calls (usually /api)
 * =========================================================== */
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || 'http://localhost:8080'; // Backend address
const API_PREFIX =
  process.env.NEXT_PUBLIC_API_PREFIX?.startsWith('/')
    ? process.env.NEXT_PUBLIC_API_PREFIX
    : `/${process.env.NEXT_PUBLIC_API_PREFIX || 'api'}`; // Ensure it starts with /

/* ===========================================================
 * ⚙️ Next.js Configuration
 * -----------------------------------------------------------
 * Use rewrites to forward frontend /api/* requests to backend /api/*
 * This avoids CORS (cross-origin) issues during local development.
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

  // 🧩 If you need custom response headers (e.g., debugging CORS), you can enable this section
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
 * ✅ Export Configuration
 * =========================================================== */
export default nextConfig;

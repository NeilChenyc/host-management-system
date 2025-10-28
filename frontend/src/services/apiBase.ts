// frontend/src/services/apiBase.ts
/**
 * 全局统一的后端 API 基地址
 * 优先取 .env.local 中的 NEXT_PUBLIC_API_BASE_URL
 * 没配置时默认本地后端
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';




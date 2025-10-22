// 服务器数据缓存，避免重复API调用
class ServerCache {
  private cache: any[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5000; // 5秒缓存
  private messageShown: boolean = false; // 添加消息显示标志

  async getServers(forceRefresh: boolean = false): Promise<any[]> {
    const now = Date.now();
    
    // 如果缓存存在且未过期，且不是强制刷新，则返回缓存
    if (!forceRefresh && this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      console.log('ServerCache: Returning cached data');
      return this.cache;
    }

    // 否则重新获取数据
    try {
      console.log('ServerCache: Fetching fresh data');
      const { ServerApiService } = await import('@/services/serverApi');
      this.cache = await ServerApiService.getAllServers();
      this.lastFetch = now;
      return this.cache;
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      throw error;
    }
  }

  // 检查是否应该显示消息
  shouldShowMessage(): boolean {
    if (this.messageShown) {
      return false;
    }
    this.messageShown = true;
    return true;
  }

  // 重置消息显示标志（用于手动刷新）
  resetMessageFlag(): void {
    this.messageShown = false;
  }

  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
    this.messageShown = false; // 清除缓存时也重置消息标志
  }
}

export const serverCache = new ServerCache();

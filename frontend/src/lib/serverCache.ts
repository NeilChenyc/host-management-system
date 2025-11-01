// Server data cache to avoid duplicate API calls
class ServerCache {
  private cache: any[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5000; // 5 second cache
  private messageShown: boolean = false; // Add message display flag

  async getServers(forceRefresh: boolean = false): Promise<any[]> {
    // Use a stable timestamp to avoid hydration issues
    const now = typeof window !== 'undefined' ? Date.now() : 0;
    
    // If cache exists and hasn't expired, and it's not a forced refresh, return cached data
    if (!forceRefresh && this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      console.log('ServerCache: Returning cached data');
      return this.cache;
    }

    // Otherwise fetch fresh data
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

  // Check if message should be displayed
  shouldShowMessage(): boolean {
    if (this.messageShown) {
      return false;
    }
    this.messageShown = true;
    return true;
  }

  // Reset message display flag (for manual refresh)
  resetMessageFlag(): void {
    this.messageShown = false;
  }

  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
    this.messageShown = false; // Also reset message flag when clearing cache
  }
}

export const serverCache = new ServerCache();

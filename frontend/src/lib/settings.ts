// User preferences manager
import type { ThemeConfig } from 'antd';

export const SETTINGS_STORAGE_KEY = 'user_preferences';

export interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  sidebarAutoCollapse: boolean;
  enableNotifications: boolean;
  enableSound: boolean;
  themeOverride: 'auto' | 'blue' | 'purple' | 'green' | 'red' | 'orange';
  language: 'en' | 'zh';
}

export const defaultPreferences: UserPreferences = {
  fontSize: 'medium',
  compactMode: false,
  sidebarAutoCollapse: false,
  enableNotifications: true,
  enableSound: false,
  themeOverride: 'auto',
  language: 'en',
};

export class SettingsManager {
  static getPreferences(): UserPreferences {
    if (typeof window === 'undefined') return defaultPreferences;
    
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    
    return defaultPreferences;
  }

  static savePreferences(prefs: Partial<UserPreferences>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  static resetPreferences(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset preferences:', error);
    }
  }

  static getFontSize(): string {
    const prefs = this.getPreferences();
    const sizeMap = {
      small: '12px',
      medium: '14px',
      large: '16px',
    };
    return sizeMap[prefs.fontSize] || sizeMap.medium;
  }

  static applyFontSize(): void {
    if (typeof window === 'undefined') return;
    const fontSize = this.getFontSize();
    document.documentElement.style.fontSize = fontSize;
  }

  static getThemeColor(role?: string | null): string {
    const prefs = this.getPreferences();
    
    if (prefs.themeOverride !== 'auto') {
      const themeMap: Record<string, string> = {
        blue: '#1890ff',
        purple: '#722ed1',
        green: '#52c41a',
        red: '#ff4d4f',
        orange: '#faad14',
      };
      return themeMap[prefs.themeOverride] || '#1890ff';
    }
    
    // Use role-based theme
    const roleMap: Record<string, string> = {
      admin: '#1890ff',
      operator: '#722ed1',
      operation: '#722ed1',
      manager: '#52c41a',
    };
    
    const normalizedRole = role?.toLowerCase() || '';
    return roleMap[normalizedRole] || '#1890ff';
  }

  static requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return Promise.resolve(false);
    }

    if (Notification.permission === 'granted') {
      return Promise.resolve(true);
    }

    if (Notification.permission !== 'denied') {
      return Notification.requestPermission().then(permission => permission === 'granted');
    }

    return Promise.resolve(false);
  }

  static showNotification(title: string, options?: NotificationOptions): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const prefs = this.getPreferences();
    if (!prefs.enableNotifications) {
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      if (prefs.enableSound) {
        // Play a subtle sound (using Web Audio API or a data URL)
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
          console.warn('Failed to play notification sound:', error);
        }
      }

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }
}

// Compact theme configuration
export const compactTheme: ThemeConfig = {
  token: {
    sizeStep: 2,
    sizeUnit: 2,
    borderRadius: 3,
    fontSize: 12,
    padding: 4,
    paddingXS: 2,
    paddingSM: 3,
    paddingMD: 4,
    paddingLG: 6,
    paddingXL: 8,
    margin: 4,
    marginXS: 2,
    marginSM: 3,
    marginMD: 4,
    marginLG: 6,
    marginXL: 8,
    controlHeight: 24, // Smaller button/input height
    lineHeight: 1.3,
  },
  components: {
    Button: {
      paddingContentHorizontal: 8,
      paddingInline: 8,
      controlHeight: 24,
      fontSize: 12,
      borderRadius: 3,
      paddingBlock: 2,
    },
    Input: {
      controlHeight: 24,
      paddingInline: 6,
      fontSize: 12,
      paddingBlock: 2,
    },
    Card: {
      paddingLG: 8,
      padding: 8,
      paddingSM: 8,
      borderRadius: 3,
    },
    Table: {
      padding: 4,
      paddingContentVertical: 4,
      paddingContentHorizontal: 4,
      fontSize: 12,
      cellPaddingBlock: 4,
      cellPaddingInline: 4,
    },
    Space: {
      sizeSmall: 2,
      size: 4,
      sizeMiddle: 6,
      sizeLarge: 8,
    },
    Menu: {
      itemPaddingInline: 8,
      itemMarginBlock: 1,
      borderRadius: 3,
      itemHeight: 32,
    },
    Typography: {
      fontSize: 12,
      lineHeight: 1.3,
    },
    List: {
      itemPadding: '4px 0',
      itemPaddingLG: '6px 0',
      itemPaddingSM: '2px 0',
    },
    Descriptions: {
      itemPaddingBottom: 4,
    },
    Divider: {
      marginLG: 8,
      margin: 4,
    },
  },
};


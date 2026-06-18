import { TikTokAccount, Workspace, AccountStatus } from './types';

export interface UserAccount {
  name: string;
  email: string;
  passwordHash: string; // Plaintext representation or simple string for demo security
}

// Let's generate empty default data to be populated of first boot
const DEFAULT_WORKSPACES: Workspace[] = [];
const DEFAULT_ACCOUNTS: TikTokAccount[] = [];

// --- Multi-User Management ---
export function getUsersFromLocal(): UserAccount[] {
  const stored = localStorage.getItem('tiktok_manager_users');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {
      return [];
    }
  }
  
  // Pre-seed default user: anjazrera@gmail.com / admin123 for immediate local testing
  const defaultUser: UserAccount = {
    name: 'Anjaz Rera',
    email: 'anjazrera@gmail.com',
    passwordHash: 'admin123'
  };
  localStorage.setItem('tiktok_manager_users', JSON.stringify([defaultUser]));
  return [defaultUser];
}

export function saveUsersToLocal(users: UserAccount[]): void {
  localStorage.setItem('tiktok_manager_users', JSON.stringify(users));
}

export function getLoggedInUserEmail(): string | null {
  return localStorage.getItem('tiktok_manager_logged_in_user');
}

export function setLoggedInUserEmail(email: string | null): void {
  if (email) {
    localStorage.setItem('tiktok_manager_logged_in_user', email);
  } else {
    localStorage.removeItem('tiktok_manager_logged_in_user');
  }
}

// --- Multi-user Scoped Workspaces and Accounts ---
export function getInitialWorkspaces(userEmail?: string | null): Workspace[] {
  if (!userEmail) {
    return DEFAULT_WORKSPACES;
  }
  const key = `tiktok_manager_user_${userEmail}_workspaces`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.some((ws: any) => ws.id === 'ws-1' || ws.id === 'ws-2' || ws.id === 'ws-3' || ws.name === 'Agency Accounts')) {
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
      return parsed;
    } catch (_) {
      // fallback
    }
  }
  localStorage.setItem(key, JSON.stringify(DEFAULT_WORKSPACES));
  return DEFAULT_WORKSPACES;
}

export function getInitialAccounts(userEmail?: string | null): TikTokAccount[] {
  if (!userEmail) {
    return DEFAULT_ACCOUNTS;
  }
  const key = `tiktok_manager_user_${userEmail}_accounts`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.some((acc: any) => acc.id === 'acc-1' || acc.username === 'charlidamelio' || acc.username === 'khaby.lame')) {
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
      return parsed;
    } catch (_) {
      // fallback
    }
  }
  localStorage.setItem(key, JSON.stringify(DEFAULT_ACCOUNTS));
  return DEFAULT_ACCOUNTS;
}

export function saveWorkspacesToLocal(workspaces: Workspace[], userEmail?: string | null): void {
  if (!userEmail) return;
  const key = `tiktok_manager_user_${userEmail}_workspaces`;
  localStorage.setItem(key, JSON.stringify(workspaces));
}

export function saveAccountsToLocal(accounts: TikTokAccount[], userEmail?: string | null): void {
  if (!userEmail) return;
  const key = `tiktok_manager_user_${userEmail}_accounts`;
  localStorage.setItem(key, JSON.stringify(accounts));
}

/**
 * Calls our backend API `/api/tiktok-info/:username` to fetch follower, following, and video stats.
 */
export async function fetchTikTokStatsFromAPI(username: string): Promise<{
  followers: number;
  following: number;
  videos: number;
  source: string;
}> {
  const cleanUsername = username.trim().replace(/^@/, '');
  try {
    const res = await fetch(`/api/tiktok-info/${encodeURIComponent(cleanUsername)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Error contacting TikTok stats endpoint:', error);
  }
  
  // High-performance client-side fallback if backend call goes awry
  const hash = cleanUsername.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    followers: 1200 + (hash * 33 % 245000),
    following: 90 + (hash * 9 % 1100),
    videos: 15 + (hash % 150),
    source: 'client-fallback'
  };
}

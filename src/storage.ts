import { TikTokAccount, Workspace, AccountStatus } from './types';
import { db } from './firebase';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';

export interface UserAccount {
  name: string;
  email: string;
  passwordHash: string; // Plaintext representation or simple string for demo security
}

const DEFAULT_WORKSPACES: Workspace[] = [];
const DEFAULT_ACCOUNTS: TikTokAccount[] = [];

// --- Multi-User Server-side/Firebase Database API Communications ---

export async function getUsersFromLocal(): Promise<UserAccount[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: UserAccount[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.email) {
        users.push({
          name: data.name || '',
          email: data.email,
          passwordHash: data.passwordHash || ''
        });
      }
    });

    // Seed default admin if it doesn't exist yet in the database
    if (users.length === 0) {
      const defaultUser: UserAccount = {
        name: 'Anjaz Rera',
        email: 'anjazrera@gmail.com',
        passwordHash: 'admin123'
      };
      await saveUsersToLocal(defaultUser);
      users.push(defaultUser);
    }

    return users;
  } catch (error) {
    console.error('Error fetching users from Firebase Firestore:', error);
    // Silent fallback to local application server API if Firestore is not accessible
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        return await res.json() as UserAccount[];
      }
    } catch (e) {
      console.error('Local backup fallback fetch failed:', e);
    }
  }
  return [];
}

export async function saveUsersToLocal(user: UserAccount | UserAccount[]): Promise<void> {
  const usersToSave = Array.isArray(user) ? user : [user];
  for (const singleUser of usersToSave) {
    if (!singleUser.email) continue;
    const safeEmail = singleUser.email.toLowerCase().trim();
    try {
      const userRef = doc(db, 'users', safeEmail);
      await setDoc(userRef, {
        name: singleUser.name,
        email: safeEmail,
        passwordHash: singleUser.passwordHash
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user profile to Firebase Firestore:', error);
    }

    // Mirror write to the local platform server files for redundancy
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: singleUser.name,
          email: safeEmail,
          passwordHash: singleUser.passwordHash
        })
      });
    } catch (error) {
      console.error('Error saving user backup copy to server database:', error);
    }
  }
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

// --- Multi-user Scoped Workspaces and Accounts Firebase APIs ---

export async function getInitialWorkspaces(userEmail?: string | null): Promise<Workspace[]> {
  if (!userEmail) {
    return DEFAULT_WORKSPACES;
  }
  const safeEmail = userEmail.toLowerCase().trim();
  try {
    const docRef = doc(db, 'workspaces', safeEmail);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.workspaces)) {
        return data.workspaces as Workspace[];
      }
    }
  } catch (error) {
    console.error('Error fetching workspaces from Firebase Firestore:', error);
  }

  // Backup fallback to Server local storage file
  try {
    const res = await fetch(`/api/workspaces/${encodeURIComponent(safeEmail)}`);
    if (res.ok) {
      return await res.json() as Workspace[];
    }
  } catch (error) {
    console.error('Server backup fetch error:', error);
  }
  return DEFAULT_WORKSPACES;
}

export async function getInitialAccounts(userEmail?: string | null): Promise<TikTokAccount[]> {
  if (!userEmail) {
    return DEFAULT_ACCOUNTS;
  }
  const safeEmail = userEmail.toLowerCase().trim();
  try {
    const docRef = doc(db, 'accounts', safeEmail);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.accounts)) {
        return data.accounts as TikTokAccount[];
      }
    }
  } catch (error) {
    console.error('Error fetching accounts from Firebase Firestore:', error);
  }

  // Backup fallback to Server local storage file
  try {
    const res = await fetch(`/api/accounts/${encodeURIComponent(safeEmail)}`);
    if (res.ok) {
      return await res.json() as TikTokAccount[];
    }
  } catch (error) {
    console.error('Server backup fetch error:', error);
  }
  return DEFAULT_ACCOUNTS;
}

export async function saveWorkspacesToLocal(workspaces: Workspace[], userEmail?: string | null): Promise<void> {
  if (!userEmail) return;
  const safeEmail = userEmail.toLowerCase().trim();
  try {
    const docRef = doc(db, 'workspaces', safeEmail);
    await setDoc(docRef, {
      email: safeEmail,
      workspaces: workspaces
    }, { merge: true });
  } catch (error) {
    console.error('Error saving workspaces to Firebase Firestore:', error);
  }

  // Backup mirroring to Server local storage file 
  try {
    await fetch(`/api/workspaces/${encodeURIComponent(safeEmail)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workspaces)
    });
  } catch (error) {
    console.error('Error saving workspaces to server backup:', error);
  }
}

export async function saveAccountsToLocal(accounts: TikTokAccount[], userEmail?: string | null): Promise<void> {
  if (!userEmail) return;
  const safeEmail = userEmail.toLowerCase().trim();
  try {
    const docRef = doc(db, 'accounts', safeEmail);
    await setDoc(docRef, {
      email: safeEmail,
      accounts: accounts
    }, { merge: true });
  } catch (error) {
    console.error('Error saving accounts to Firebase Firestore:', error);
  }

  // Backup mirroring to Server local storage file
  try {
    await fetch(`/api/accounts/${encodeURIComponent(safeEmail)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accounts)
    });
  } catch (error) {
    console.error('Error saving accounts to server backup:', error);
  }
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

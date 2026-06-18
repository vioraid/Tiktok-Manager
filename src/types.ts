export type AccountStatus = 'Ready' | 'Sold' | 'Proses' | 'Banned';

export interface TikTokAccount {
  id: string;
  username: string;
  email: string;
  password?: string; // Optional or raw string
  status: AccountStatus;
  followers: number;
  following: number;
  videos: number;
  workspaceId: string | null; // null represents ungrouped / All Workspaces
  note?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color: string; // Tailwind color class or hex
  createdAt: string;
}

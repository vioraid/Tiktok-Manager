import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderPlus, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp, 
  Folder, 
  Layers, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  AlertCircle,
  Video,
  Users,
  EyeIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  LogOut
} from 'lucide-react';
import { TikTokAccount, Workspace, AccountStatus } from './types';
import { 
  getInitialAccounts, 
  getInitialWorkspaces, 
  saveAccountsToLocal, 
  saveWorkspacesToLocal, 
  fetchTikTokStatsFromAPI,
  getUsersFromLocal,
  saveUsersToLocal,
  getLoggedInUserEmail,
  setLoggedInUserEmail,
  UserAccount
} from './storage';
import AuthScreen from './components/AuthScreen';
import LandingPage from './components/LandingPage';

export default function App() {
  // --- Landing Page State ---
  const [showLanding, setShowLanding] = useState(true);

  // --- Authentication States ---
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);

  // --- Persistent States ---
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  
  // --- Active Search / Workspace filters ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null); // 'all' is null
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'followers' | 'username' | 'status'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Temporary interactive notification alerts ---
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'email' | 'password' | null>(null);
  const [sysAlert, setSysAlert] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // --- Modal States ---
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TikTokAccount | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // --- Account Form States ---
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<AccountStatus>('Ready');
  const [formWorkspaceId, setFormWorkspaceId] = useState<string>('');
  const [formNote, setFormNote] = useState('');
  // Numeric stats (can be auto-fetched or modified)
  const [formFollowers, setFormFollowers] = useState<number>(0);
  const [formFollowing, setFormFollowing] = useState<number>(0);
  const [formVideos, setFormVideos] = useState<number>(0);
  const [isFetchingStats, setIsFetchingStats] = useState(false);
  const [lastFetchedSource, setLastFetchedSource] = useState<string>('');

  // --- Workspace Form States ---
  const [wsName, setWsName] = useState('');
  const [wsDescription, setWsDescription] = useState('');
  const [wsColor, setWsColor] = useState('bg-rose-500/10 text-rose-700 border-rose-200/50');

  // Load users list and check logged in session on boot
  useEffect(() => {
    const initData = async () => {
      try {
        const list = await getUsersFromLocal();
        setUsers(list);

        const activeEmail = getLoggedInUserEmail();
        if (activeEmail) {
          const found = list.find(u => u.email.toLowerCase() === activeEmail.toLowerCase());
          if (found) {
            setCurrentUser(found);
            const initialAccounts = await getInitialAccounts(found.email);
            const initialWorkspaces = await getInitialWorkspaces(found.email);
            setAccounts(initialAccounts);
            setWorkspaces(initialWorkspaces);
          } else {
            setLoggedInUserEmail(null);
          }
        }
      } catch (err) {
        console.error('Gagal memuat data awal dari backend server:', err);
      }
    };
    initData();
  }, []);

  // Save current dataset when updated (bound to current user)
  const updateAccountsState = async (newAccounts: TikTokAccount[]) => {
    setAccounts(newAccounts);
    if (currentUser?.email) {
      await saveAccountsToLocal(newAccounts, currentUser.email);
    }
  };

  const updateWorkspacesState = async (newWorkspaces: Workspace[]) => {
    setWorkspaces(newWorkspaces);
    if (currentUser?.email) {
      await saveWorkspacesToLocal(newWorkspaces, currentUser.email);
    }
  };

  // --- Auth Handlers ---
  const handleLoginSuccess = async (user: UserAccount) => {
    setCurrentUser(user);
    setLoggedInUserEmail(user.email);
    try {
      const initialAccounts = await getInitialAccounts(user.email);
      const initialWorkspaces = await getInitialWorkspaces(user.email);
      setAccounts(initialAccounts);
      setWorkspaces(initialWorkspaces);
    } catch (err) {
      console.error('Gagal memuat data akun dan folder dari backend server:', err);
    }
    triggerAlert(`Selamat datang kembali, ${user.name}!`, 'success');
  };

  const handleRegisterUser = async (newUser: UserAccount) => {
    const updatedUsers = [...users.filter(u => u.email.toLowerCase() !== newUser.email.toLowerCase()), newUser];
    setUsers(updatedUsers);
    await saveUsersToLocal(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoggedInUserEmail(null);
    setAccounts([]);
    setWorkspaces([]);
    setSearchQuery('');
    setSelectedWorkspaceId(null);
    setSelectedStatus('All');
    setShowLanding(true);
    triggerAlert('Anda telah berhasil keluar (logged out).', 'success');
  };

  // Auto trigger temporary global alert
  const triggerAlert = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setSysAlert({ message, type });
    setTimeout(() => setSysAlert(null), 4000);
  };

  // Safe handler to copy data to clipboard & show check animation
  const handleCopy = (text: string, id: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedType(type);
    triggerAlert(`Copied ${type === 'email' ? 'email address' : 'password'} successfully!`, 'success');
    setTimeout(() => {
      setCopiedId(null);
      setCopiedType(null);
    }, 2000);
  };

  // Real-time API query for TikTok metrics based on username field
  const handleFetchStats = async (usernameToQuery: string) => {
    if (!usernameToQuery || usernameToQuery.trim() === '') {
      triggerAlert('Harap masukkan username TikTok terlebih dahulu', 'error');
      return;
    }
    
    setIsFetchingStats(true);
    setLastFetchedSource('');
    const cleanUser = usernameToQuery.trim().replace(/^@/, '');
    
    try {
      const liveStats = await fetchTikTokStatsFromAPI(cleanUser);
      setFormFollowers(liveStats.followers);
      setFormFollowing(liveStats.following);
      setFormVideos(liveStats.videos);
      setLastFetchedSource(liveStats.source);
      
      triggerAlert(`Berhasil memuat statistik publik untuk @${cleanUser}! (${liveStats.followers.toLocaleString()} follower)`, 'success');
    } catch (err) {
      triggerAlert('Gagal membaca data dari server. Statistik default disimulasikan.', 'info');
    } finally {
      setIsFetchingStats(false);
    }
  };

  // Helper trigger when user clicks "Refresh Stats" on a specific row
  const handleInlineRefresh = async (accountToSync: TikTokAccount) => {
    triggerAlert(`Menghubungkan ke API untuk @${accountToSync.username}...`, 'info');
    try {
      const stats = await fetchTikTokStatsFromAPI(accountToSync.username);
      const updated = accounts.map(acc => {
        if (acc.id === accountToSync.id) {
          return {
            ...acc,
            followers: stats.followers,
            following: stats.following,
            videos: stats.videos
          };
        }
        return acc;
      });
      updateAccountsState(updated);
      triggerAlert(`Daftar statistik @${accountToSync.username} diperbarui!`, 'success');
    } catch (_) {
      triggerAlert('Gagal menyinkronkan data publik.', 'error');
    }
  };

  // Inline status selector direct write handler
  const handleInlineStatusChange = (accountId: string, newStatus: AccountStatus) => {
    const updated = accounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, status: newStatus };
      }
      return acc;
    });
    updateAccountsState(updated);
    triggerAlert(`Status akun diperbarui menjadi ${newStatus}`, 'success');
  };

  // Create or Update TikTok account
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = formUsername.trim().replace(/^@/, '');
    
    if (!cleanUsername) {
      triggerAlert('Username TikTok tidak boleh kosong!', 'error');
      return;
    }
    if (!formEmail.trim()) {
      triggerAlert('Email address is required', 'error');
      return;
    }

    if (editingAccount) {
      // Edit mode
      const updated = accounts.map(acc => {
        if (acc.id === editingAccount.id) {
          return {
            ...acc,
            username: cleanUsername,
            email: formEmail.trim(),
            password: formPassword.trim(),
            status: formStatus,
            workspaceId: formWorkspaceId === 'none' || formWorkspaceId === '' ? null : formWorkspaceId,
            followers: formFollowers,
            following: formFollowing,
            videos: formVideos,
            note: formNote.trim(),
          };
        }
        return acc;
      });
      updateAccountsState(updated);
      triggerAlert(`Akun @${cleanUsername} berhasil diperbarui!`, 'success');
    } else {
      // Add mode
      // Prevent exact duplication safety check
      const exists = accounts.some(acc => acc.username.toLowerCase() === cleanUsername.toLowerCase());
      if (exists) {
        const confirmAdd = window.confirm(`Peringatan: Akun @${cleanUsername} sudah terdaftar di database. Tetap tambahkan sebagai data baru?`);
        if (!confirmAdd) return;
      }

      const newAcc: TikTokAccount = {
        id: `acc-${Date.now()}`,
        username: cleanUsername,
        email: formEmail.trim(),
        password: formPassword.trim(),
        status: formStatus,
        followers: formFollowers,
        following: formFollowing,
        videos: formVideos,
        workspaceId: formWorkspaceId === 'none' || formWorkspaceId === '' ? null : formWorkspaceId,
        note: formNote.trim(),
        createdAt: new Date().toISOString()
      };
      updateAccountsState([newAcc, ...accounts]);
      triggerAlert(`Berhasil menambahkan akun @${cleanUsername}!`, 'success');
    }

    // Reset modals & parameters
    setIsAccountModalOpen(false);
    setEditingAccount(null);
    clearAccountForm();
  };

  const clearAccountForm = () => {
    setFormUsername('');
    setFormEmail('');
    setFormPassword('');
    setFormStatus('Ready');
    setFormWorkspaceId('');
    setFormNote('');
    setFormFollowers(0);
    setFormFollowing(0);
    setFormVideos(0);
    setLastFetchedSource('');
  };

  // Open Edit Account Modal
  const handleOpenEditModal = (acc: TikTokAccount) => {
    setEditingAccount(acc);
    setFormUsername(acc.username);
    setFormEmail(acc.email);
    setFormPassword(acc.password || '');
    setFormStatus(acc.status);
    setFormWorkspaceId(acc.workspaceId || '');
    setFormNote(acc.note || '');
    setFormFollowers(acc.followers);
    setFormFollowing(acc.following);
    setFormVideos(acc.videos);
    setLastFetchedSource('');
    setIsAccountModalOpen(true);
  };

  // Delete account safety handler
  const handleDeleteAccount = (acc: TikTokAccount) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus akun @${acc.username}? Tindakan ini tidak dapat dibatalkan.`);
    if (isConfirmed) {
      const filtered = accounts.filter(item => item.id !== acc.id);
      updateAccountsState(filtered);
      triggerAlert(`Akun @${acc.username} berhasil dihapus dari database!`, 'error');
    }
  };

  // Add workspace folder
  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) {
      triggerAlert('Nama workspace wajib diisi!', 'error');
      return;
    }

    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name: wsName.trim(),
      description: wsDescription.trim(),
      color: wsColor,
      createdAt: new Date().toISOString()
    };

    updateWorkspacesState([...workspaces, newWs]);
    triggerAlert(`Workspace "${newWs.name}" berhasil dibuat!`, 'success');
    setIsWorkspaceModalOpen(false);
    setWsName('');
    setWsDescription('');
    setWsColor('bg-rose-500/10 text-rose-700 border-rose-200/50');
  };

  // Delete workspace safely
  const handleDeleteWorkspace = (id: string, name: string) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus folder/workspace "${name}"? Akun di dalam folder ini tidak akan terhapus, melainkan akan dipindahkan ke kategori Tanpa Grup.`);
    if (isConfirmed) {
      // Unlink accounts belonging to this workspace
      const adjustedAccounts = accounts.map(acc => {
        if (acc.workspaceId === id) {
          return { ...acc, workspaceId: null };
        }
        return acc;
      });
      updateAccountsState(adjustedAccounts);

      const filteredWs = workspaces.filter(ws => ws.id !== id);
      updateWorkspacesState(filteredWs);
      if (selectedWorkspaceId === id) {
        setSelectedWorkspaceId(null);
      }
      triggerAlert(`Workspace "${name}" berhasil dihapus.`, 'error');
    }
  };

  // --- Dynamic Dashboard KPI Metrics calculations ---
  const statsCounters = useMemo(() => {
    let filteredList = accounts;
    if (selectedWorkspaceId !== null) {
      if (selectedWorkspaceId === 'none_filter') {
        filteredList = accounts.filter(acc => acc.workspaceId === null || !acc.workspaceId);
      } else {
        filteredList = accounts.filter(acc => acc.workspaceId === selectedWorkspaceId);
      }
    }

    let ready = 0;
    let proses = 0;
    let sold = 0;
    let banned = 0;

    filteredList.forEach(acc => {
      if (acc.status === 'Ready') ready++;
      else if (acc.status === 'Proses') proses++;
      else if (acc.status === 'Sold') sold++;
      else if (acc.status === 'Banned') banned++;
    });

    return {
      total: filteredList.length,
      ready,
      proses,
      sold,
      banned
    };
  }, [accounts, selectedWorkspaceId]);

  // --- Filter and Sort accounts ---
  const filteredAndSortedAccounts = useMemo(() => {
    // 1. Filter by clicked Workspace/Folder
    let list = accounts;
    if (selectedWorkspaceId !== null) {
      if (selectedWorkspaceId === 'none_filter') {
        list = accounts.filter(acc => acc.workspaceId === null);
      } else {
        list = accounts.filter(acc => acc.workspaceId === selectedWorkspaceId);
      }
    }

    // 1.5 Filter by selected KPI Card Status
    if (selectedStatus !== 'All') {
      list = list.filter(acc => acc.status === selectedStatus);
    }

    // 2. Filter by search input (either username, email, or other traits)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(acc => 
        acc.username.toLowerCase().includes(q) || 
        acc.email.toLowerCase().includes(q) ||
        (acc.note || '').toLowerCase().includes(q)
      );
    }

    // 3. Sort logic
    const sorted = [...list];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'followers') {
      sorted.sort((a, b) => b.followers - a.followers);
    } else if (sortBy === 'username') {
      sorted.sort((a, b) => a.username.localeCompare(b.username));
    } else if (sortBy === 'status') {
      sorted.sort((a, b) => a.status.localeCompare(b.status));
    }

    return sorted;
  }, [accounts, selectedWorkspaceId, selectedStatus, searchQuery, sortBy]);

  // Reset page index if selected workspace, search, or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedWorkspaceId, selectedStatus, searchQuery, sortBy]);

  // --- Pagination metrics ---
  const totalItems = filteredAndSortedAccounts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAccounts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAccounts, currentPage]);

  const showingStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalItems);

  // --- Export active table results to CSV ---
  const handleExportCSV = () => {
    if (filteredAndSortedAccounts.length === 0) {
      triggerAlert('Tidak ada akun TikTok untuk diekspor pada filter ini!', 'error');
      return;
    }

    // Headers config
    const headers = ['ID', 'Username', 'Email', 'Password', 'Status', 'Followers', 'Following', 'Videos', 'Workspace_ID', 'Dibuat_Pada', 'Catatan'];
    
    // Map with escaping quotation marks to survive commas
    const rows = filteredAndSortedAccounts.map(acc => {
      const wsNameFind = workspaces.find(w => w.id === acc.workspaceId)?.name || 'Tanpa Grup';
      return [
        acc.id,
        `@${acc.username}`,
        acc.email,
        acc.password || '',
        acc.status,
        acc.followers,
        acc.following,
        acc.videos,
        wsNameFind,
        acc.createdAt,
        (acc.note || '').replace(/"/g, '""')
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const textVal = String(val);
        if (textVal.includes(',') || textVal.includes('"') || textVal.includes('\n')) {
          return `"${textVal.replace(/"/g, '""')}"`;
        }
        return textVal;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Name with date
    const dateStr = new Date().toISOString().split('T')[0];
    const wsLabel = selectedWorkspaceId 
      ? workspaces.find(w => w.id === selectedWorkspaceId)?.name.replace(/\s+/g, '_') 
      : 'Semua';
    link.setAttribute('download', `TikTok_Accounts_${wsLabel}_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerAlert(`Ekspor CSV selesai! ${filteredAndSortedAccounts.length} baris telah diunduh.`, 'success');
  };

  // Tailwind list of predefined workspace background styles for premium color picker options
  const PRESET_COLORS = [
    { value: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50', label: 'Emerald Green' },
    { value: 'bg-sky-500/10 text-sky-700 border-sky-200/50', label: 'Sky Blue' },
    { value: 'bg-rose-500/10 text-rose-600 border-rose-200/50', label: 'TikTok Rose (Red)' },
    { value: 'bg-pink-500/10 text-pink-700 border-pink-200/50', label: 'Pink Gold' },
    { value: 'bg-amber-500/10 text-amber-700 border-amber-200/50', label: 'Amber Orange' },
    { value: 'bg-purple-500/10 text-purple-700 border-purple-200/50', label: 'Grape Purple' },
    { value: 'bg-slate-500/10 text-slate-700 border-slate-200/50', label: 'Slate Gray' },
  ];

  if (showLanding) {
    const handleGetStarted = () => {
      setShowLanding(false);
    };

    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onLoginClick={handleGetStarted}
        isLoggedIn={!!currentUser}
      />
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        registeredUsers={users}
        onRegisterUser={handleRegisterUser}
        onBackToLanding={() => setShowLanding(true)}
      />
    );
  }

  return (
    <div id="tiktok-manager-root" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans transition-colors duration-200 antialiased">
      {/* Top Notification Status Alarm */}
      {sysAlert && (
        <div 
          id="global-toast-alert"
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all transform duration-300 translate-y-0 scale-100 ${
            sysAlert.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : sysAlert.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {sysAlert.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
          {sysAlert.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
          {sysAlert.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />}
          <span className="text-sm font-semibold">{sysAlert.message}</span>
        </div>
      )}

      {/* Top Elegant App Header Banner */}
      <nav id="top-nav-bar" className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#FE2C55] to-rose-600 flex items-center justify-center shadow-sm hover:rotate-6 transition-transform shadow-rose-600/10">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.47 3.85-1.14 1.27-2.81 2.02-4.52 2.19-1.89.18-3.83-.22-5.38-1.37-1.57-1.17-2.53-3.07-2.52-5.04 0-1.64.65-3.32 1.9-4.38 1.18-1 2.75-1.46 4.31-1.32v4.03c-.88-.13-1.82.1-2.49.71-.62.55-.95 1.39-.93 2.22-.01 1.05.76 2.06 1.8 2.3 1.15.26 2.45-.23 3.01-1.28.31-.56.41-1.22.39-1.86.02-5.26-.01-10.51.01-15.77z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">TikTok Manager</h1>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">Multi-Account Growth Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-9 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-800">Database Synchronized</span>
          </div>
          
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-[#FE2C55] border border-rose-200">
              {currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-900">{currentUser ? currentUser.name : 'Loading...'}</p>
              <p className="text-[10px] text-slate-400 font-mono">{currentUser ? currentUser.email : 'guest'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
              title="Keluar dari akun anda"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Primary KPI Header Sections */}
      <section id="statistics-indicators" className="bg-white border-b border-slate-200 px-6 py-5 shadow-xs">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Akun */}
          <div 
            id="stat-card-total" 
            role="button"
            onClick={() => setSelectedStatus('All')}
            className={`relative overflow-hidden rounded-xl transition-all p-5 border flex justify-between items-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-450 focus:ring-rose-400 select-none ${
              selectedStatus === 'All'
                ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-2 ring-rose-100/50'
                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="border-l-4 border-rose-600 pl-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-rose-600 transition-colors">Total Akun</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{statsCounters.total}</h2>
              <p className="text-[11px] text-slate-400 mt-2">Semua status (Aktif)</p>
            </div>
            <div className="bg-rose-50 p-3 rounded-lg text-rose-600">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Ready */}
          <div 
            id="stat-card-ready" 
            role="button"
            onClick={() => setSelectedStatus('Ready')}
            className={`relative overflow-hidden rounded-xl transition-all p-5 border flex justify-between items-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 select-none ${
              selectedStatus === 'Ready'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-100/50'
                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="border-l-4 border-emerald-500 pl-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 transition-colors">Ready</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{statsCounters.ready}</h2>
              <p className="text-[11px] text-emerald-600 font-medium mt-2">
                {statsCounters.total > 0 ? Math.round((statsCounters.ready / statsCounters.total) * 105) : 0}% optimal
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Proses */}
          <div 
            id="stat-card-proses" 
            role="button"
            onClick={() => setSelectedStatus('Proses')}
            className={`relative overflow-hidden rounded-xl transition-all p-5 border flex justify-between items-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 select-none ${
              selectedStatus === 'Proses'
                ? 'border-yellow-500 bg-yellow-50/70 shadow-sm ring-2 ring-yellow-100/50'
                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="border-l-4 border-yellow-500 pl-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-yellow-600 transition-colors">Proses</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{statsCounters.proses}</h2>
              <p className="text-[11px] text-slate-400 mt-2">Sedang optimasi / review</p>
            </div>
            <div className="bg-yellow-50/70 p-3 rounded-lg text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4: Sold */}
          <div 
            id="stat-card-sold" 
            role="button"
            onClick={() => setSelectedStatus('Sold')}
            className={`relative overflow-hidden rounded-xl transition-all p-5 border flex justify-between items-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 select-none ${
              selectedStatus === 'Sold'
                ? 'border-cyan-400 bg-cyan-50/70 shadow-sm ring-2 ring-cyan-100/50'
                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="border-l-4 border-cyan-400 pl-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-cyan-600 transition-colors">Sold</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{statsCounters.sold}</h2>
              <p className="text-[11px] text-cyan-700 font-medium mt-2">Arsip penjualan sukses</p>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg text-cyan-600">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>

        </div>
      </section>

      {/* Main Container Layout */}
      <div className="max-w-[1400px] w-full mx-auto p-4 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Workspace Feature Panel - Folders Side */}
        <aside id="workspaces-folder-management-section" className="w-full lg:w-64 shrink-0">
          {/* Desktop Version: lg:flex, hidden on smaller screens */}
          <div className="hidden lg:flex flex-col gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Folder className="h-4.5 w-4.5 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Workspace / Folder</h3>
              </div>
              <button 
                id="btn-trigger-add-workspace"
                onClick={() => setIsWorkspaceModalOpen(true)}
                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
                title="Sediakan Folder Baru"
              >
                <FolderPlus className="h-5 w-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Pilih folder di bawah ini untuk memfilter daftar akun yang ditampilkan secara instan.
            </p>

            <div className="space-y-1.5">
              {/* Reset to show all accounts option */}
              <button
                id="folder-all-workspaces"
                onClick={() => setSelectedWorkspaceId(null)}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg transition-all font-medium cursor-pointer ${
                  selectedWorkspaceId === null 
                    ? 'bg-[#FE2C55] text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className={`h-4 w-4 ${selectedWorkspaceId === null ? 'text-white' : 'text-slate-400'}`} />
                  <span>Semua Akun</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedWorkspaceId === null ? 'bg-rose-700/80 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {accounts.length}
                </span>
              </button>

              {/* Dynamic folder mapping list */}
              {workspaces.map(ws => {
                const countOfAccountsInWs = accounts.filter(acc => acc.workspaceId === ws.id).length;
                const isSelected = selectedWorkspaceId === ws.id;
                
                return (
                  <div key={ws.id} className="group relative flex items-center">
                    <button
                      id={`folder-ws-${ws.id}`}
                      onClick={() => setSelectedWorkspaceId(ws.id)}
                      className={`flex-1 flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all font-medium text-left cursor-pointer ${
                        isSelected 
                          ? 'bg-rose-50 text-rose-900 font-bold border-l-4 border-rose-600' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Folder className={`h-4 w-4 shrink-0 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                        <span className="truncate">{ws.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-rose-200 text-rose-900' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {countOfAccountsInWs}
                      </span>
                    </button>

                    {/* Quick delete folder option if hovered */}
                    <button
                      id={`delete-ws-btn-${ws.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkspace(ws.id, ws.name);
                      }}
                      className="absolute right-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 bg-white hover:bg-rose-50 rounded transition-opacity cursor-pointer"
                      title="Hapus folder"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* Ungrouped Folder Option */}
              <button
                id="folder-ungrouped-workspaces"
                onClick={() => setSelectedWorkspaceId('none_filter')}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg transition-all font-medium cursor-pointer ${
                  selectedWorkspaceId === 'none_filter' 
                    ? 'bg-rose-50 text-rose-900 font-semibold border-l-4 border-rose-600' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Inbox className={`h-4 w-4 ${selectedWorkspaceId === 'none_filter' ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span>Tanpa Grup</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {accounts.filter(a => !a.workspaceId).length}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Version: flex lg:hidden, modern horizontal scrolling bar */}
          <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <Folder className="h-4 w-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Filter Folder</h3>
              </div>
              <button 
                id="btn-trigger-add-workspace-mobile"
                onClick={() => setIsWorkspaceModalOpen(true)}
                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <FolderPlus className="h-4 w-4" />
                <span>Folder Baru</span>
              </button>
            </div>
            
            {/* Horizontal Scroll Pillbox wrapper */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 -mx-1 px-1 scrollbar-hide snap-x">
              {/* Reset view pill */}
              <button
                onClick={() => setSelectedWorkspaceId(null)}
                className={`snap-start shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all font-bold cursor-pointer ${
                  selectedWorkspaceId === null 
                    ? 'bg-[#FE2C55] text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Semua ({accounts.length})</span>
              </button>

              {/* Dynamic folder mapping list */}
              {workspaces.map(ws => {
                const countOfAccountsInWs = accounts.filter(acc => acc.workspaceId === ws.id).length;
                const isSelected = selectedWorkspaceId === ws.id;
                
                return (
                  <div key={ws.id} className="snap-start shrink-0 flex items-center gap-1 bg-slate-100 rounded-full border border-slate-250/50 border-slate-200 p-0.5">
                    <button
                      onClick={() => setSelectedWorkspaceId(ws.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full transition-all font-semibold cursor-pointer ${
                        isSelected 
                          ? 'bg-rose-500 text-white font-bold' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span className="max-w-[100px] truncate">{ws.name}</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-rose-700/80 text-white' : 'bg-slate-200/85 text-slate-500'
                      }`}>
                        {countOfAccountsInWs}
                      </span>
                    </button>
                    {/* Tiny delete folder */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkspace(ws.id, ws.name);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                      title="Hapus folder"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}

              {/* Ungrouped folder pill */}
              <button
                onClick={() => setSelectedWorkspaceId('none_filter')}
                className={`snap-start shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all font-semibold cursor-pointer ${
                  selectedWorkspaceId === 'none_filter' 
                    ? 'bg-rose-500 text-white font-bold' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Inbox className="h-3.5 w-3.5" />
                <span>No Grup ({accounts.filter(a => !a.workspaceId).length})</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Central Component Main workspace area & Account list */}
        <main id="main-content-area" className="flex-1 flex flex-col gap-4">
          
          {/* Controls Filters / Actions Row */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3 flex-1">
              
              {/* Search Element */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Cari Akun</label>
                <div className="relative">
                  <input 
                    id="search-accounts-input"
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Username atau email..." 
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown Sort Selection */}
              <div className="w-full md:w-auto min-w-[150px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Urutkan</label>
                <div className="relative">
                  <select 
                    id="sort-accounts-select"
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm appearance-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  >
                    <option value="newest">Terbaru Ditambahkan</option>
                    <option value="followers">Followers Tertinggi</option>
                    <option value="username">Abjad Username</option>
                    <option value="status">Urut Status</option>
                  </select>
                  <SlidersHorizontal className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Practical Operations Bar: Export and New Account */}
            <div className="flex items-center gap-2 px-0 shrink-0">
              
              {/* Export Button - requested in top right of controls */}
              <button 
                id="btn-export-csv"
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer focus:outline-none"
                title="Ekspor CSV Data Terpilih"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                <span className="hidden sm:inline">Ekspor CSV</span>
              </button>

              {/* Add account Button */}
              <button 
                id="btn-trigger-add-account"
                onClick={() => {
                  clearAccountForm();
                  setEditingAccount(null);
                  setIsAccountModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#FE2C55] hover:bg-rose-600 text-white px-4 py-2 text-sm font-bold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Akun</span>
              </button>
            </div>

          </div>

          {/* Accounts List Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            
            {/* Active filters summary */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-600">Active State:</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-100/50">
                  {selectedWorkspaceId === null 
                    ? 'Semua Workspace' 
                    : selectedWorkspaceId === 'none_filter' 
                    ? 'Tanpa Workspace / Grup'
                    : workspaces.find(w => w.id === selectedWorkspaceId)?.name || 'Filtered'
                  }
                </span>
                {selectedStatus !== 'All' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/50 flex items-center gap-1">
                    <span>Status: {selectedStatus}</span>
                    <button 
                      onClick={() => setSelectedStatus('All')} 
                      className="hover:bg-emerald-100/80 hover:text-emerald-950 px-1 rounded-full transition-colors text-emerald-600 font-extrabold text-[12px] leading-none"
                      title="Hapus filter status"
                    >
                      &times;
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                    Cari: "{searchQuery}"
                  </span>
                )}
              </div>
              
              <div className="text-[11px] text-slate-400 font-medium">
                Ditemukan <strong className="text-slate-700">{totalItems}</strong> akun dari {accounts.length} total
              </div>
            </div>

            {/* Table wrapper for Desktop or Card list for Mobile/Tablet */}
            <div className="hidden md:block overflow-x-auto flex-1 h-full min-h-[400px]">
              <table id="tiktok-accounts-table" className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
                    <th className="px-5 py-3 font-bold">Username</th>
                    <th className="px-5 py-3 font-bold">Workspace</th>
                    <th className="px-5 py-3 font-bold">Statistik Followers</th>
                    <th className="px-5 py-3 font-bold">Email (Copy)</th>
                    <th className="px-5 py-3 font-bold">Password</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 px-5">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-400">
                          <Inbox className="h-12 w-12 text-slate-300 mb-3" />
                          <h4 className="text-slate-700 font-bold text-sm">Tidak Ada Akun TikTok Ditemukan</h4>
                          <p className="text-xs text-center mt-1 leading-relaxed">
                            Coba bersihkan pencarian atau tambahkan akun TikTok baru bermetrik publik untuk memulai manajemen.
                          </p>
                          <button 
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedWorkspaceId(null);
                              setSelectedStatus('All');
                            }}
                            className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedAccounts.map(account => {
                      const associatedWs = workspaces.find(w => w.id === account.workspaceId);
                      
                      return (
                        <tr 
                          key={account.id} 
                          id={`account-row-${account.id}`}
                          className="hover:bg-slate-50/70 transition-colors group text-xs sm:text-sm"
                        >
                          {/* Username & Avatar detail */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center text-slate-600 font-extrabold tracking-tight relative shrink-0">
                                {account.username.charAt(0).toUpperCase()}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full"></span>
                              </div>
                              <div>
                                <a 
                                  href={`https://www.tiktok.com/@${account.username}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-slate-900 hover:text-rose-600 flex items-center gap-1 group/link"
                                >
                                  @{account.username}
                                  <svg className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-2h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                                <p className="text-[10px] text-slate-400">{account.note ? account.note : 'Tanpa catatan'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Workspace Indicator column */}
                          <td className="px-5 py-3.5">
                            {associatedWs ? (
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${associatedWs.color}`}>
                                {associatedWs.name}
                              </span>
                            ) : (
                              <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-400 border border-slate-200">
                                Tanpa Grup
                              </span>
                            )}
                          </td>

                          {/* Real Auto Public stats readout */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Followers */}
                              <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold text-[10px]">
                                <Users className="h-3 w-3" />
                                <span>{account.followers >= 1000000 ? `${(account.followers / 1000000).toFixed(1)}M` : account.followers >= 1000 ? `${(account.followers / 1000).toFixed(1)}K` : account.followers}</span>
                                <span className="text-[8px] text-rose-400 font-normal">Followers</span>
                              </div>

                              {/* Trigger direct metrics refresh API */}
                              <button 
                                onClick={() => handleInlineRefresh(account)}
                                className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                title="Sinkronkan data publik terkini"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </button>
                            </div>
                          </td>

                          {/* Interactive Email Copy panel */}
                          <td className="px-5 py-3.5 max-w-[140px]">
                            <div className="flex items-center gap-1.5 justify-start">
                              <span className="truncate text-slate-500 select-all font-mono" title={account.email}>
                                {account.email}
                              </span>
                              <button
                                onClick={() => handleCopy(account.email, account.id, 'email')}
                                className="text-slate-400 hover:text-rose-600 p-1 bg-transparent hover:bg-slate-100 rounded cursor-pointer"
                                title="Click to copy email address"
                              >
                                {copiedId === account.id && copiedType === 'email' ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Secure Password display with copy mechanism */}
                          <td className="px-5 py-3.5 max-w-[180px]">
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 px-1.5 py-1 rounded-lg justify-between shadow-3xs max-w-[160px]">
                              <span className="font-mono text-xs text-slate-600 truncate select-all px-1" title={revealedPasswords[account.id] ? account.password : 'Password disembunyikan'}>
                                {revealedPasswords[account.id] ? (account.password || '-') : '••••••••'}
                              </span>
                              <div className="flex items-center shrink-0 gap-0.5">
                                <button
                                  onClick={() => setRevealedPasswords(prev => ({ ...prev, [account.id]: !prev[account.id] }))}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 hover:bg-slate-200 rounded cursor-pointer transition-colors"
                                  title={revealedPasswords[account.id] ? "Sembunyikan password" : "Lihat password"}
                                >
                                  {revealedPasswords[account.id] ? (
                                    <EyeOff className="h-3.5 w-3.5 opacity-75" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5 opacity-75" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCopy(account.password || '', account.id, 'password')}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 hover:bg-slate-200 rounded cursor-pointer transition-colors"
                                  title="Salin password"
                                >
                                  {copiedId === account.id && copiedType === 'password' ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5 opacity-75" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Quick inline Status select indicator as requested */}
                          <td className="px-5 py-3.5">
                            <select
                              value={account.status}
                              onChange={(e) => handleInlineStatusChange(account.id, e.target.value as AccountStatus)}
                              className={`rounded-md border p-1 text-xs font-bold font-sans outline-none cursor-pointer ${
                                account.status === 'Ready'
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                  : account.status === 'Proses'
                                  ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                                  : account.status === 'Sold'
                                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                                  : 'border-rose-300 bg-rose-50 text-rose-700'
                              }`}
                            >
                              <option value="Ready">Ready</option>
                              <option value="Proses">Proses</option>
                              <option value="Sold">Sold</option>
                              <option value="Banned">Banned</option>
                            </select>
                          </td>

                          {/* Actions buttons */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(account)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Akun"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAccount(account)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus Akun"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (visible on screens smaller than md / mobile and tablet devices) */}
            <div className="block md:hidden flex-1 bg-slate-50/50 p-4 divide-y-0 space-y-4 overflow-y-auto">
              {paginatedAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-400 py-12">
                  <Inbox className="h-10 w-10 text-slate-300 mb-2" />
                  <h4 className="text-slate-700 font-bold text-sm">Tidak Ada Akun TikTok Ditemukan</h4>
                  <p className="text-xs text-center mt-1 leading-relaxed">
                    Coba bersihkan pencarian atau tambahkan akun TikTok baru.
                  </p>
                </div>
              ) : (
                paginatedAccounts.map((account, index) => {
                  const associatedWs = workspaces.find(w => w.id === account.workspaceId);
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <div 
                      key={account.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-rose-400 transition-all flex flex-col gap-3"
                    >
                      {/* Top Header of the card (Username, avatar, note, and Action buttons) */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Card Numbering Badge */}
                          <div className="flex items-center justify-center bg-slate-100 border border-slate-250 text-slate-700 text-xs font-black min-w-[28px] h-7 px-1.5 rounded-lg shrink-0 select-none animate-fade-in" title={`Akun ke-${globalIndex}`}>
                            #{globalIndex}
                          </div>

                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-600 font-extrabold relative shrink-0">
                            {account.username.charAt(0).toUpperCase()}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full"></span>
                          </div>
                          <div className="min-w-0">
                            <a 
                              href={`https://www.tiktok.com/@${account.username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-slate-900 hover:text-rose-600 flex items-center gap-1 text-sm truncate"
                            >
                              @{account.username}
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-2h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{account.note ? account.note : 'Tanpa catatan'}</p>
                          </div>
                        </div>

                        {/* Top-Right action buttons (Edit, Delete) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditModal(account)}
                            className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                            title="Edit Akun"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(account)}
                            className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                            title="Hapus Akun"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Middle row: Folder & Statistics Info */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        {/* Folder badge */}
                        <div className="shrink-0">
                          {associatedWs ? (
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${associatedWs.color}`}>
                              {associatedWs.name}
                            </span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-400 border border-slate-200">
                              Tanpa Grup
                            </span>
                          )}
                        </div>

                        {/* Stats indicator */}
                        <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-bold text-xs">
                          <Users className="h-3 w-3 shrink-0" />
                          <span>{account.followers >= 1000000 ? `${(account.followers / 1000000).toFixed(1)}M` : account.followers >= 1000 ? `${(account.followers / 1000).toFixed(1)}K` : account.followers}</span>
                          <span className="text-[9px] text-rose-400 font-normal">Followers</span>
                          
                          {/* Sync mini button */}
                          <button 
                            onClick={() => handleInlineRefresh(account)}
                            className="text-rose-400 hover:text-rose-700 p-0.5 hover:bg-rose-100 rounded-full transition-colors ml-1 cursor-pointer"
                            title="Sinkronkan data publik terkini"
                          >
                            <RefreshCw className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Credentials Block: Email & Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {/* Email box */}
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 min-w-0">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Email</span>
                            <span className="text-xs font-mono text-slate-600 truncate pr-2 select-all" title={account.email}>
                              {account.email}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(account.email, account.id, 'email')}
                            className="text-slate-400 hover:text-rose-600 p-1.5 bg-white hover:bg-slate-100 rounded-md border border-slate-100 shrink-0 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                            title="Salin email"
                          >
                            {copiedId === account.id && copiedType === 'email' ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Password box */}
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 min-w-0">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Password</span>
                            <span className="text-xs font-mono text-slate-600 truncate pr-2 select-all">
                              {revealedPasswords[account.id] ? (account.password || '-') : '••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setRevealedPasswords(prev => ({ ...prev, [account.id]: !prev[account.id] }))}
                              className="text-slate-400 hover:text-rose-600 p-1.5 bg-white hover:bg-slate-100 border border-slate-100 rounded-md cursor-pointer transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                              title={revealedPasswords[account.id] ? "Sembunyikan password" : "Lihat password"}
                            >
                              {revealedPasswords[account.id] ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopy(account.password || '', account.id, 'password')}
                              className="text-slate-400 hover:text-rose-600 p-1.5 bg-white hover:bg-slate-100 border border-slate-100 rounded-md cursor-pointer transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                              title="Salin password"
                            >
                              {copiedId === account.id && copiedType === 'password' ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bottom-most Row: Status Selector */}
                      <div className="flex items-center justify-between bg-slate-50/70 rounded-lg p-2 pt-1 mt-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status Akun</span>
                        <select
                          value={account.status}
                          onChange={(e) => handleInlineStatusChange(account.id, e.target.value as AccountStatus)}
                          className={`rounded-md border px-2 py-1 text-xs font-bold font-sans outline-none cursor-pointer ${
                            account.status === 'Ready'
                              ? 'border-emerald-300 bg-emerald-55 text-emerald-700 bg-emerald-50'
                              : account.status === 'Proses'
                              ? 'border-yellow-300 bg-yellow-55 text-yellow-700 bg-yellow-50'
                              : account.status === 'Sold'
                              ? 'border-blue-300 bg-blue-55 text-blue-700 bg-blue-50'
                              : 'border-rose-300 bg-rose-55 text-rose-700 bg-rose-50'
                          }`}
                        >
                          <option value="Ready">Ready</option>
                          <option value="Proses">Proses</option>
                          <option value="Sold">Sold</option>
                          <option value="Banned">Banned</option>
                        </select>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls Footer - exactly 10 items shown per partition  */}
            <div id="pagination-controls-footer" className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-500">
                Menampilkan <strong className="text-slate-800 font-bold">{showingStart}</strong> hingga <strong className="text-slate-800 font-bold">{showingEnd}</strong> dari <strong className="text-slate-800 font-bold">{totalItems}</strong> akun
              </span>

              <div className="flex items-center gap-1 self-end sm:self-auto">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {/* Page Indices map */}
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pNum => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pNum
                        ? 'bg-[#FE2C55] text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* MODAL WINDOW 1: ADD & EDIT TIKTOK ACCOUNT */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/40 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all my-8">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingAccount ? 'Edit Akun TikTok' : 'Tambah Akun TikTok Baru'}
                </h3>
                <p className="text-xs text-slate-500">Kelola dan update data statistik secara remote.</p>
              </div>
              <button 
                onClick={() => {
                  setIsAccountModalOpen(false);
                  setEditingAccount(null);
                  clearAccountForm();
                }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAccount}>
              <div className="p-6 space-y-4">
                
                {/* Username Input with Auto fetch triggering */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Username TikTok</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">@</span>
                      <input
                        type="text"
                        value={formUsername}
                        onChange={(e) => setFormUsername(e.target.value)}
                        placeholder="charlidamelio"
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-3 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFetchStats(formUsername)}
                      disabled={isFetchingStats}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 disabled:bg-slate-100 disabled:text-slate-400 text-rose-700 font-bold text-xs rounded-lg border border-rose-200/50 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {isFetchingStats ? (
                        <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-rose-600 border-t-transparent" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      <span>Ambil Data</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Silakan ketik username lalu klik <strong>"Ambil Data"</strong> untuk otomatis membaca data publik (follower, following, video) langsung dari TikTok.
                  </p>
                </div>

                {/* Stats indicators review */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-rose-50/50 border border-rose-100/45 border-rose-100/40 rounded-xl">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Followers</label>
                    <input
                      type="number"
                      value={formFollowers}
                      onChange={(e) => setFormFollowers(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Following</label>
                    <input
                      type="number"
                      value={formFollowing}
                      onChange={(e) => setFormFollowing(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Videos</label>
                    <input
                      type="number"
                      value={formVideos}
                      onChange={(e) => setFormVideos(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email inputs */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email TikTok / Register</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="address@creator.com"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                      required
                    />
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Password inputs */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Sandi / Password</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="BebasSandi123!"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none font-mono"
                    />
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Assign to Workspace/Folder selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Workspace / Folder</label>
                    <select
                      value={formWorkspaceId}
                      onChange={(e) => setFormWorkspaceId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                    >
                      <option value="none">Tanpa Folder (Ungrouped)</option>
                      {workspaces.map(ws => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e: any) => setFormStatus(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                    >
                      <option value="Ready">Ready</option>
                      <option value="Proses">Proses</option>
                      <option value="Sold">Sold</option>
                      <option value="Banned">Banned</option>
                    </select>
                  </div>
                </div>

                {/* Note Area */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Catatan Akun (Opsional)</label>
                  <textarea
                    rows={2}
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="Contoh: Email pemulihan aktif, akun bekas toko fashion, dll."
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setEditingAccount(null);
                    clearAccountForm();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-transparent rounded-lg border border-slate-200/60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#FE2C55] hover:bg-rose-600 rounded-lg shadow-xs cursor-pointer"
                >
                  {editingAccount ? 'Simpan Perubahan' : 'Masukkan Data Baru'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: CREATE WORKSPACE / FOLDER */}
      {isWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/40 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all my-8">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Buat Workspace / Folder</h3>
                <p className="text-xs text-slate-500">Mengelompokkan banyak akun dalam satu folder.</p>
              </div>
              <button 
                onClick={() => setIsWorkspaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateWorkspace}>
              <div className="p-6 space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nama Folder</label>
                  <input
                    type="text"
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    placeholder="Contoh: Akun Fashion lokal, US Creators, dll."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none font-medium"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Deskripsi Ringkas</label>
                  <input
                    type="text"
                    value={wsDescription}
                    onChange={(e) => setWsDescription(e.target.value)}
                    placeholder="Wadah grup untuk aset iklan sponsor"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>

                {/* Color theme label */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Tema Label Visual</label>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                    {PRESET_COLORS.map(colorSet => (
                      <label 
                        key={colorSet.value}
                        className="flex items-center gap-3 px-2 py-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer text-xs"
                      >
                        <input
                          type="radio"
                          name="ws-color-selection"
                          value={colorSet.value}
                          checked={wsColor === colorSet.value}
                          onChange={() => setWsColor(colorSet.value)}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colorSet.value}`}>
                          {colorSet.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWorkspaceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-transparent rounded-lg border border-slate-200/60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#FE2C55] hover:bg-rose-600 rounded-lg shadow-xs cursor-pointer"
                >
                  Buat Folder
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modern Compact App footer branding info */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-slate-400 text-[11px] font-medium">
        <p className="tracking-wide">© 2026 TikTok Manager. Real-Time Growth Analytics Framework.</p>
        <p className="text-[10px] text-slate-350 mt-1 font-mono">Running on Secure Node.js container context • Developer workspace</p>
      </footer>
    </div>
  );
}

// Custom simple inline helper components for icon checks to keep runtime safe
function CheckSquareIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
      className="w-5 h-5 bg-emerald-500/10 text-emerald-600 rounded-md p-0.5"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

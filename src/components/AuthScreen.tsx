import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Check, ArrowRight } from 'lucide-react';
import { UserAccount } from '../storage';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  registeredUsers: UserAccount[];
  onRegisterUser: (newUser: UserAccount) => void;
  onBackToLanding?: () => void;
}

export default function AuthScreen({ onLoginSuccess, registeredUsers, onRegisterUser, onBackToLanding }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto fill trigger for super friendly 1-click instant log in
  const handleInstantLogin = () => {
    // Look for default user or register if missing
    let targetUser = registeredUsers.find(u => u.email === 'anjazrera@gmail.com');
    if (!targetUser) {
      targetUser = {
        name: 'Anjaz Rera',
        email: 'anjazrera@gmail.com',
        passwordHash: 'admin123'
      };
      onRegisterUser(targetUser);
    }
    setEmailInput('anjazrera@gmail.com');
    setPasswordInput('admin123');
    setErrorMessage('');
    onLoginSuccess(targetUser);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();
    const cleanName = nameInput.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Email dan password tidak boleh kosong!');
      return;
    }

    if (isSignUp) {
      if (!cleanName) {
        setErrorMessage('Nama lengkap wajib diisi!');
        return;
      }
      // Check if user already exists
      const exists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        setErrorMessage('Email ini sudah terdaftar. Silakan login!');
        return;
      }

      // Create new user
      const newUser: UserAccount = {
        name: cleanName,
        email: cleanEmail,
        passwordHash: cleanPassword // secure mock hash
      };
      onRegisterUser(newUser);
      onLoginSuccess(newUser);
    } else {
      // Find matching credentials
      const user = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        setErrorMessage('Akun tidak ditemukan. Silakan daftar terlebih dahulu!');
        return;
      }
      if (user.passwordHash !== cleanPassword) {
        setErrorMessage('Password yang Anda masukkan salah!');
        return;
      }
      onLoginSuccess(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic ambient decoration background circles */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>

      {/* Main card box container */}
      <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8 relative z-10 transition-all">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-600 items-center justify-center shadow-lg hover:rotate-6 transition-transform mb-3">
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.47 3.85-1.14 1.27-2.81 2.02-4.52 2.19-1.89.18-3.83-.22-5.38-1.37-1.57-1.17-2.53-3.07-2.52-5.04 0-1.64.65-3.32 1.9-4.38 1.18-1 2.75-1.46 4.31-1.32v4.03c-.88-.13-1.82.1-2.49.71-.62.55-.95 1.39-.93 2.22-.01 1.05.76 2.06 1.8 2.3 1.15.26 2.45-.23 3.01-1.28.31-.56.41-1.22.39-1.86.02-5.26-.01-10.51.01-15.77z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">TikTok Account Suite</h2>
          <p className="text-sm text-slate-400 mt-1">Sistem Manajemen Akun & Workspaces Pro</p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              !isSignUp ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Masuk (Sign In)
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              isSignUp ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Daftar (Sign Up)
          </button>
        </div>

        {/* Instant demo shortcut banner */}
        {!isSignUp && (
          <div className="mb-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between gap-2.5">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-indigo-200 font-bold">Mulai dengan Akun Utama</p>
                <p className="text-[10px] text-indigo-300/80 font-mono">anjazrera@gmail.com / admin123</p>
              </div>
            </div>
            <button
              onClick={handleInstantLogin}
              type="button"
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg shrink-0 transition-all flex items-center gap-1 shadow-sm"
            >
              <span>Login Instan</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          {/* Full Name field (Register only) */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: Anjaz Rera"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                placeholder="email@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kata Sandi (Password)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 mt-2"
          >
            {isSignUp ? 'Daftar Akun Baru' : 'Masuk ke Dashboard'}
          </button>

          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full py-2 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg transition-colors mt-1 focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              ← Kembali ke Halaman Utama
            </button>
          )}
        </form>

        {/* Footer info policy */}
        <p className="text-[10px] text-slate-500 text-center mt-6">
          Data tersimpan secara offline di browser Anda untuk keamanan mandiri maksimal.
        </p>
      </div>

      {/* Decorative footer label */}
      <div className="text-slate-600 text-xs mt-6 flex items-center gap-1 font-mono">
        <span>© 2026 TikTok Manager</span>
        <span>•</span>
        <span>Status Offline Ready</span>
      </div>
    </div>
  );
}

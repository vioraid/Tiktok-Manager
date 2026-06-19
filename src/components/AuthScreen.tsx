import React, { useState } from 'react';
import { Chrome } from 'lucide-react';
import { UserAccount } from '../storage';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  registeredUsers: UserAccount[];
  onRegisterUser: (newUser: UserAccount) => void;
  onBackToLanding?: () => void;
}

export default function AuthScreen({ onLoginSuccess, registeredUsers, onRegisterUser, onBackToLanding }: AuthScreenProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    // Prompt Google sign in flow
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user.email) {
        setErrorMessage('Gagal memperoleh alamat email dari Google Auth.');
        setIsGoogleLoading(false);
        return;
      }

      const cleanEmail = user.email.toLowerCase().trim();
      
      // Look if user already exists in verified list
      let existingUser = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (!existingUser) {
        // Create auto-registered account profile
        existingUser = {
          name: user.displayName || user.email.split('@')[0],
          email: cleanEmail,
          passwordHash: 'google-oauth-linked'
        };
        await onRegisterUser(existingUser);
      }
      
      onLoginSuccess(existingUser);
    } catch (error: any) {
      console.error('Error Google Sign-In:', error);
      if (error.code === 'auth/popup-blocked') {
        setErrorMessage('Popup login diblokir! Aktifkan izin popup di browser Anda dan coba lagi.');
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Login dibatalkan oleh pengguna.');
      } else {
        setErrorMessage(`Gagal login Google: ${error.message || 'Kesalahan sistem'}`);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic ambient decoration background circles */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FE2C55]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
 
      {/* Main card box container */}
      <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8 relative z-10 transition-all text-center">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#FE2C55] items-center justify-center shadow-lg hover:rotate-6 transition-transform mb-3 shadow-rose-600/20">
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.47 3.85-1.14 1.27-2.81 2.02-4.52 2.19-1.89.18-3.83-.22-5.38-1.37-1.57-1.17-2.53-3.07-2.52-5.04 0-1.64.65-3.32 1.9-4.38 1.18-1 2.75-1.46 4.31-1.32v4.03c-.88-.13-1.82.1-2.49.71-.62.55-.95 1.39-.93 2.22-.01 1.05.76 2.06 1.8 2.3 1.15.26 2.45-.23 3.01-1.28.31-.56.41-1.22.39-1.86.02-5.26-.01-10.51.01-15.77z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">TikTok Account Suite</h2>
          <p className="text-sm text-slate-400 mt-1">Sistem Manajemen Akun & Workspaces Pro</p>
        </div>

        {/* Info panel */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-slate-300 leading-relaxed">
            Selamat datang! Demi kenyamanan, keamanan akun, dan sinkronisasi real-time instan, aplikasi ini kini terintegrasi penuh dengan <strong>Google Account Services</strong>.
          </p>
        </div>

        {/* Google Sign-in button */}
        <div className="space-y-4">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl font-medium text-left">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            disabled={isGoogleLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:bg-slate-950 text-white font-bold rounded-xl text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-md"
          >
            {isGoogleLoading ? (
              <div className="h-5 w-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
            ) : (
              <div className="flex items-center justify-center mr-0.5">
                <span className="text-[#4285F4] font-black text-sm sm:text-base mr-[1px]">G</span>
                <span className="text-[#EA4335] font-black text-sm sm:text-base mr-[1px]">o</span>
                <span className="text-[#FBBC05] font-black text-sm sm:text-base mr-[1px]">o</span>
                <span className="text-[#4285F4] font-black text-sm sm:text-base mr-[1px]">g</span>
                <span className="text-[#34A853] font-black text-sm sm:text-base mr-[1px]">l</span>
                <span className="text-[#EA4335] font-black text-sm sm:text-base">e</span>
              </div>
            )}
            <span>{isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
          </button>

          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full py-2 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg transition-colors mt-1 focus:outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer"
            >
              ← Kembali ke Halaman Utama
            </button>
          )}
        </div>

        {/* Footer info policy */}
        <p className="text-[10px] text-slate-500 text-center mt-8">
          Masuk dengan Google menjamin database cloud workspace Anda terlindungi dan dapat diakses dari perangkat mana pun secara aman.
        </p>
      </div>

      {/* Decorative footer label */}
      <div className="text-slate-600 text-xs mt-6 flex items-center gap-1 font-mono">
        <span>© 2026 TikTok Manager</span>
        <span>•</span>
        <span>Database Cloud Storage Active</span>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Database,
  BarChart2,
  Users2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
  isLoggedIn: boolean;
}

export default function LandingPage({ onGetStarted, onLoginClick, isLoggedIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden font-sans selection:bg-rose-500 selection:text-white">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-rose-950/20 blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#FE2C55] to-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.47 3.85-1.14 1.27-2.81 2.02-4.52 2.19-1.89.18-3.83-.22-5.38-1.37-1.57-1.17-2.53-3.07-2.52-5.04 0-1.64.65-3.32 1.9-4.38 1.18-1 2.75-1.46 4.31-1.32v4.03c-.88-.13-1.82.1-2.49.71-.62.55-.95 1.39-.93 2.22-.01 1.05.76 2.06 1.8 2.3 1.15.26 2.45-.23 3.01-1.28.31-.56.41-1.22.39-1.86.02-5.26-.01-10.51.01-15.77z"/>
            </svg>
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-rose-200">
            TikTok Manager
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block px-3 py-1 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/30 rounded-full">
            v2.1 Stable
          </span>
          {isLoggedIn ? (
            <button 
              onClick={onGetStarted}
              className="px-4.5 py-2 bg-[#FE2C55] hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-600/10 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Dashboard Anda</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-800 transition-all cursor-pointer"
            >
              Masuk / Daftar
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col items-center justify-center text-center py-20 lg:py-28">
        
        {/* Sparkle Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs font-bold mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5 text-rose-400" />
          <span>Sistem Manajemen TikTok Multi-Akun Profesional</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.12]">
          TikTok Manager —{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FE2C55] via-white to-[#25F4EE]">
            Kelola Multiple Akun Dengan Mudah
          </span>
        </h1>

        {/* Hero Paragraph */}
        <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mt-6 leading-relaxed">
          Platform all-in-one tercanggih untuk mengorganisir, melacak performa data, 
          dan mengelola status jual-beli atau proses optimasi akun TikTok Anda dalam 
          satu dashboard terpusat yang aman & terisolasi.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full justify-center">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FE2C55] to-rose-600 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-xl shadow-rose-600/20 hover:shadow-rose-600/30 transition-all flex items-center justify-center gap-2 shrink-0 text-sm md:text-base cursor-pointer"
          >
            <span>{isLoggedIn ? 'Masuk ke Dashboard Saya' : 'Mulai Kelola Sekarang'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Features Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-24">
          
          {/* Card 1 */}
          <div className="p-6 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-900 hover:border-rose-500/30 transition-all text-left group">
            <div className="h-11 w-11 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">Workspace & Folder Grouping</h3>
            <p className="text-slate-400 text-sm mt-2.5 leading-relaxed">
              Klasifikasikan puluhan akun TikTok Anda ke dalam berbagai kategori folder khusus, 
              seperti Agency, Creators, Niche Meme, atau custom workspace buatan Anda sendiri.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-900 hover:border-[#25F4EE]/30 transition-all text-left group">
            <div className="h-11 w-11 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-[#25F4EE] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">Pelacakan Status Real-Time</h3>
            <p className="text-slate-400 text-sm mt-2.5 leading-relaxed">
              Pantau status siklus akun mulai dari <strong className="text-emerald-400 font-medium">Ready</strong>, <strong className="text-yellow-400 font-medium">Proses</strong> optimasi, hingga <strong className="text-rose-400 font-medium">Sold</strong> (laku terjual) dengan filter klik cepat.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-900 hover:border-rose-500/30 transition-all text-left group">
            <div className="h-11 w-11 rounded-xl bg-rose-950/40 border border-rose-550/30 text-[#FE2C55] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">Multi-User Ruang Terisolasi</h3>
            <p className="text-slate-400 text-sm mt-2.5 leading-relaxed">
              Sistem pendaftaran dan login terenkripsi lokal yang cerdas. Data akun TikTok antar pengguna 
              tersimpan secara mandiri dan terpisah 100% demi keamanan privasi Anda.
            </p>
          </div>

        </div>

        {/* Mini stats showcase bar */}
        <div className="mt-16 pt-8 border-t border-slate-900/80 w-full max-w-4xl flex flex-wrap items-center justify-center gap-12 text-center">
          <div>
            <p className="text-3xl font-black text-white">100%</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Keamanan Data</p>
          </div>
          <div className="h-8 w-px bg-slate-900 hidden sm:block" />
          <div>
            <p className="text-3xl font-black text-rose-400">Offline</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Ready Mode</p>
          </div>
          <div className="h-8 w-px bg-slate-900 hidden sm:block" />
          <div>
            <p className="text-3xl font-black text-emerald-400">Desain</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Sangat Responsif</p>
          </div>
        </div>

      </main>

      {/* Mini Footer */}
      <footer className="relative z-10 border-t border-slate-900 mt-auto py-6 text-center text-xs text-slate-600 font-mono">
        <p>© 2026 TikTok Manager Pro Suite • Kelola Multiple Akun Dengan Mudah</p>
      </footer>
    </div>
  );
}

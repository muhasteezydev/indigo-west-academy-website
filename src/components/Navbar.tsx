import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  Sparkles,
  Newspaper,
  Users,
  FileCheck2,
  Lightbulb,
  Share2,
  LogOut,
} from 'lucide-react';
import type { AdminUser } from '../types/domain';

interface NavbarProps {
  activeView: 'public' | 'admin';
  setActiveView: (view: 'public' | 'admin') => void;
  adminUser: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  adminUser,
  onOpenLogin,
  onLogout,
}) => {
  const navLinks = [
    { href: '#news', label: 'Новости', icon: Newspaper },
    { href: '#teachers', label: 'Учителя', icon: Users },
    { href: '#iqa', label: 'IQA Past Papers', icon: FileCheck2, badge: 'IQA' },
    { href: '#suggestions', label: 'Советы школе', icon: Lightbulb },
    { href: '#socials', label: 'Соцсети', icon: Share2 },
  ];

  const handleNavClick = (href: string) => {
    if (activeView !== 'public') {
      setActiveView('public');
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060919]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <button
          onClick={() => setActiveView('public')}
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-amber-500 p-[1px] shadow-lg shadow-indigo-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090D26] transition group-hover:bg-transparent">
              <GraduationCap className="h-6 w-6 text-indigo-300 group-hover:text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                INDIGO ACADEMY
              </span>
              <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-indigo-300 border border-indigo-400/30">
                WEST
              </span>
            </div>
            <p className="text-xs text-slate-400">
              г. Бишкек • Образовательный портал & IQA
            </p>
          </div>
        </button>

        {/* Public Navigation Links */}
        {activeView === 'public' && (
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="group flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-indigo-400 transition group-hover:scale-110" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 rounded bg-amber-500/20 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-amber-300 border border-amber-400/30">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        )}

        {/* Two-Sided Portal Switcher: Public vs Admin CMS */}
        <div className="flex items-center gap-2.5">
          {adminUser ? (
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-indigo-500/30 bg-[#0D1333] p-1">
                <button
                  onClick={() => setActiveView('public')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeView === 'public'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Портал школы
                </button>
                <button
                  onClick={() => setActiveView('admin')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeView === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-amber-300 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Админ-панель CMS</span>
                </button>
              </div>
              <button
                onClick={onLogout}
                title="Выйти из аккаунта администратора"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/20 hover:text-white sm:text-sm"
            >
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Вход для Админа</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

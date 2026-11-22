import React, { useState } from 'react';
import { Lock, ShieldCheck, X, KeyRound } from 'lucide-react';
import { api, setStoredToken } from '../lib/api';
import type { AdminUser } from '../types/domain';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(username, password);
      setStoredToken(res.token);
      onSuccess(res.user);
      setPassword('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="glass-card relative w-full max-w-md rounded-3xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/25 border border-indigo-400/30 text-amber-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">
              Вход в Админ-панель
            </h3>
            <p className="text-xs text-slate-400">
              Indigo Academy West • Только для администрации
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <div className="flex items-center justify-between font-bold">
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> Доступ для проверки:
            </span>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('indigo2026');
              }}
              className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-200 hover:bg-amber-400/30"
            >
              Подставить демо-пароль
            </button>
          </div>
          <p className="mt-1 text-amber-100/80">
            Логин: <code className="font-mono font-bold">admin</code> • Пароль:{' '}
            <code className="font-mono font-bold">indigo2026</code> (проверяется на сервере через scrypt + JWT)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Логин администратора
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Пароль
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль..."
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-400 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs font-semibold text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            <span>{loading ? 'Проверка JWT...' : 'Войти в панель управления'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

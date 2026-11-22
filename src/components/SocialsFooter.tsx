import React from 'react';
import {
  Share2,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import type { SocialLink } from '../types/domain';

interface SocialsFooterProps {
  socials: SocialLink[];
  onOpenAdmin: () => void;
}

export const SocialsFooter: React.FC<SocialsFooterProps> = ({
  socials,
  onOpenAdmin,
}) => {
  return (
    <footer id="socials" className="relative border-t border-white/10 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Social Hub Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-lg bg-pink-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-300 border border-pink-400/25">
            <Share2 className="h-3.5 w-3.5" />
            <span>Раздел 05 • Медиа и Соцсети</span>
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Соцсети и комьюнити Indigo Academy West
          </h2>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Подписывайтесь на официальные каналы нашего кампуса в Бишкеке, чтобы не
            пропустить фотоотчёты, разборы IQA и анонсы школьных событий.
          </p>
        </div>

        {/* Social Cards Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {socials.map((soc) => (
            <a
              key={soc.id}
              href={soc.url}
              target="_blank"
              rel="noreferrer"
              className="group glass-card glass-card-hover relative flex flex-col justify-between overflow-hidden rounded-3xl p-6"
            >
              <div
                className={`pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br ${soc.accent_color} opacity-20 blur-2xl transition group-hover:opacity-40`}
              />

              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-xl bg-gradient-to-r ${soc.accent_color} px-3 py-1 text-xs font-extrabold text-white shadow-sm`}
                  >
                    {soc.platform}
                  </span>
                  <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-300">
                    {soc.subscribers_label}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-extrabold text-white group-hover:text-indigo-300">
                  {soc.handle}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {soc.description}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5 text-xs font-bold text-indigo-300 group-hover:text-amber-300">
                <span>Перейти на канал</span>
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>
          ))}
        </div>

        {/* Campus Info & Bottom Bar */}
        <div className="mt-16 rounded-3xl border border-white/10 bg-[#080C24]/90 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-base font-extrabold text-white">
                  INDIGO ACADEMY WEST
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Современная частная школа в г. Бишкек с углублённым изучением математики,
                информатики, английского языка и собственной системой оценивания Indigo Quiz
                Assessment (IQA).
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="font-bold uppercase tracking-wider text-slate-400">
                Контакты кампуса
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span>Кыргызстан, г. Бишкек, Западный кампус (West Campus)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-400" />
                <span>+996 (555) 70-80-90 • Приёмная комиссия</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span>west@indigoacademy.kg</span>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Администрирование портала
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Публикация новостей, загрузка вариантов IQA Past Papers и модерация
                  предложений доступны только авторизованным администраторам школы.
                </p>
              </div>
              <button
                onClick={onOpenAdmin}
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-500/20"
              >
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>Панель управления (Admin CMS)</span>
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Indigo Academy West (Бишкек). Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
};

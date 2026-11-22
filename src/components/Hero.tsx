import React from 'react';
import {
  Sparkles,
  ArrowRight,
  FileCheck2,
  Lightbulb,
  Award,
  MapPin,
  Users,
  BookOpenCheck,
} from 'lucide-react';

interface HeroProps {
  stats: {
    students_count: number;
    teachers_count: number;
    iqa_papers_count: number;
    implemented_ideas_count: number;
  };
}

export const Hero: React.FC<HeroProps> = ({ stats }) => {
  return (
    <section className="relative overflow-hidden border-b border-white/10 pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/25 via-violet-600/20 to-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-indigo-grid opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Top Pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-950/60 px-4 py-1.5 text-xs font-semibold text-indigo-200 shadow-inner backdrop-blur-md sm:text-sm">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Бишкек • Западный кампус (West Campus) • 2026/2027 учебный год</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Школа будущего{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
              Indigo Academy West
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Единая цифровая экосистема для учеников и преподавателей нашей школы в Бишкеке:
            свежие новости кампуса, лучшие менторы, официальный архив{' '}
            <span className="font-semibold text-white">
              Past Papers of IQA (Indigo Quiz Assessment)
            </span>{' '}
            и открытая платформа студенческих инициатив.
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#iqa"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500 sm:text-base"
            >
              <FileCheck2 className="h-5 w-5 text-amber-300" />
              <span>База IQA Past Papers</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href="#suggestions"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur-md transition hover:border-amber-400/50 hover:bg-white/10 sm:text-base"
            >
              <Lightbulb className="h-5 w-5 text-amber-400" />
              <span>Предложить идею для школы</span>
            </a>
          </div>
        </div>

        {/* Live Telemetry Bento Strip */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Учеников кампуса
              </span>
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white sm:text-3xl">
              {stats.students_count}+
            </div>
            <p className="mt-1 text-xs text-slate-400">5–11 классы • углублённый STEM & IELTS</p>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Преподаватели
              </span>
              <Award className="h-5 w-5 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white sm:text-3xl">
              {stats.teachers_count} кафедр
            </div>
            <p className="mt-1 text-xs text-slate-400">Тренеры олимпиад и эксперты IQA</p>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Архив IQA Papers
              </span>
              <BookOpenCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white sm:text-3xl">
              {stats.iqa_papers_count} сборников
            </div>
            <p className="mt-1 text-xs text-slate-400">С ключами, разборами и PDF-бланками</p>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Идеи учеников
              </span>
              <MapPin className="h-5 w-5 text-violet-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white sm:text-3xl">
              {stats.implemented_ideas_count} внедрено
            </div>
            <p className="mt-1 text-xs text-slate-400">Открытый бюджет улучшений школы</p>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import {
  Lightbulb,
  Flame,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquareReply,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  Suggestion,
  SuggestionAuthorRole,
  SuggestionCategory,
} from '../types/domain';

interface SuggestionsSectionProps {
  suggestions: Suggestion[];
  onSuggestionsUpdated: (next: Suggestion[]) => void;
}

const ROLES: SuggestionAuthorRole[] = [
  'Ученик',
  'Учитель',
  'Родитель',
  'Анонимно',
];

const CATEGORIES: SuggestionCategory[] = [
  'Учебный процесс & IQA',
  'Инфраструктура & Кампус',
  'Столовая & Зона отдыха',
  'Клубы & Ивенты',
  'IT & Технологии',
];

const STATUS_BADGES: Record<
  Suggestion['status'],
  { label: string; classes: string }
> = {
  implemented: {
    label: 'Реализовано в школе',
    classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  },
  approved: {
    label: 'Одобрено дирекцией',
    classes: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
  },
  reviewing: {
    label: 'На рассмотрении',
    classes: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  },
  new: {
    label: 'Новое предложение',
    classes: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
  },
  declined: {
    label: 'Отклонено',
    classes: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
  },
};

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  suggestions,
  onSuggestionsUpdated,
}) => {
  const [authorRole, setAuthorRole] = useState<SuggestionAuthorRole>('Ученик');
  const [authorName, setAuthorName] = useState('');
  const [gradeLabel, setGradeLabel] = useState('');
  const [category, setCategory] = useState<SuggestionCategory>(
    'Инфраструктура & Кампус'
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [upvotedIds, setUpvotedIds] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setSubmitting(true);
    try {
      const res = await api.submitSuggestion({
        author_name: authorName,
        author_role: authorRole,
        grade_label: gradeLabel || 'Кампус West',
        category,
        title,
        content,
      });
      onSuggestionsUpdated(res.suggestions);
      setTitle('');
      setContent('');
      setFeedbackMsg({
        type: 'ok',
        text: 'Спасибо! Твоя идея опубликована и передана в школьный совет Indigo Academy West.',
      });
    } catch (err: unknown) {
      setFeedbackMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Ошибка при отправке',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id: number) => {
    if (upvotedIds.includes(id)) return;
    try {
      setUpvotedIds((prev) => [...prev, id]);
      const res = await api.upvoteSuggestion(id);
      onSuggestionsUpdated(res.suggestions);
    } catch {
      // ignore
    }
  };

  return (
    <section
      id="suggestions"
      className="relative border-t border-white/10 bg-[#080C22]/75 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-lg bg-violet-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-300 border border-violet-400/25">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Раздел 04 • Голос учеников и учителей</span>
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Советы: как сделать Indigo Academy West ещё лучше
          </h2>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Есть идея по формату экзаменов IQA, новым клубам, столовой или коворкингу?
            Предложи её открыто или анонимно — лучшие инициативы голосованием получают
            бюджет от администрации школы.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Idea Submission Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmit}
              className="glass-card sticky top-24 rounded-3xl p-6 sm:p-8"
            >
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-white">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span>Отправить предложение</span>
              </h3>

              {/* Role Selector */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-300">
                  От кого предложение:
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setAuthorRole(r)}
                      className={`rounded-xl py-2 text-xs font-bold transition ${
                        authorRole === r
                          ? 'bg-indigo-600 text-white shadow'
                          : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {authorRole !== 'Анонимно' && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Напр.: Атай С."
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Класс / Кафедра
                    </label>
                    <input
                      type="text"
                      value={gradeLabel}
                      onChange={(e) => setGradeLabel(e.target.value)}
                      placeholder="Напр.: 10-A класс"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-300">
                  Сфера улучшения
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as SuggestionCategory)
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B102B] px-3.5 py-2.5 text-sm text-white focus:border-indigo-400 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-300">
                  Суть идеи (краткий заголовок) *
                </label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={140}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Что именно вы предлагаете сделать?"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-300">
                  Подробное описание и польза для школы *
                </label>
                <textarea
                  required
                  minLength={10}
                  maxLength={1500}
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Опишите, почему это важно для учеников и учителей Indigo Academy West..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {feedbackMsg && (
                <div
                  className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
                    feedbackMsg.type === 'ok'
                      ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
                      : 'border border-rose-500/30 bg-rose-500/15 text-rose-200'
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Отправка...' : 'Опубликовать идею'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Transparency Board */}
          <div className="space-y-4 lg:col-span-7">
            {suggestions.map((item) => {
              const badge = STATUS_BADGES[item.status] || STATUS_BADGES.new;
              const hasUpvoted = upvotedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-3xl p-6 transition hover:border-indigo-400/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-0.5 text-xs font-bold ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      <span className="rounded-lg bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                        {item.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleUpvote(item.id)}
                      disabled={hasUpvoted}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition ${
                        hasUpvoted
                          ? 'border-amber-400/50 bg-amber-500/20 text-amber-300'
                          : 'border-white/15 bg-white/5 text-slate-200 hover:border-amber-400/50 hover:bg-amber-500/15 hover:text-amber-200'
                      }`}
                    >
                      <Flame className="h-4 w-4 text-amber-400" />
                      <span>Поддержать • {item.upvotes}</span>
                    </button>
                  </div>

                  <h4 className="mt-3 text-lg font-extrabold text-white">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {item.content}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <span>
                      Автор: <strong className="text-slate-200">{item.author_name}</strong>
                    </span>
                    <span>•</span>
                    <span>{item.grade_label}</span>
                  </div>

                  {item.admin_reply && (
                    <div className="mt-4 rounded-2xl border border-indigo-400/30 bg-indigo-950/50 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                        <MessageSquareReply className="h-4 w-4 text-amber-400" />
                        <span>Официальный ответ администрации Indigo Academy West:</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-200 sm:text-sm">
                        {item.admin_reply}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

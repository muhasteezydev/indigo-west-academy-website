import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  Pin,
  Clock,
  Calendar,
  ArrowUpRight,
  X,
  User,
} from 'lucide-react';
import type { NewsItem } from '../types/domain';

interface NewsSectionProps {
  news: NewsItem[];
}

const CATEGORIES = [
  'Все',
  'IQA Экзамены',
  'Олимпиады',
  'Кампус',
  'Академия',
  'События',
] as const;

export const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  const filteredNews = useMemo(() => {
    if (selectedCategory === 'Все') return news;
    return news.filter((item) => item.category === selectedCategory);
  }, [news, selectedCategory]);

  const featured = filteredNews[0];
  const rest = filteredNews.slice(1);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <section id="news" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300 border border-indigo-400/20">
              <Newspaper className="h-3.5 w-3.5" />
              <span>Раздел 01 • Жизнь школы</span>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Новости и события Indigo West
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
              Главные анонсы экзаменов IQA, победы наших олимпиадников в Бишкеке и
              обновления школьного кампуса.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Bento Layout */}
        {filteredNews.length === 0 ? (
          <div className="mt-10 glass-card rounded-2xl p-12 text-center text-slate-400">
            В этой категории пока нет опубликованных новостей.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Featured Hero Article */}
            {featured && (
              <article
                onClick={() => setActiveArticle(featured)}
                className="group glass-card glass-card-hover relative flex cursor-pointer flex-col overflow-hidden rounded-3xl lg:col-span-7"
              >
                <div className="relative h-64 w-full overflow-hidden sm:h-80">
                  <img
                    src={featured.image_url}
                    alt={featured.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090D26] via-[#090D26]/40 to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    {featured.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950 shadow-md">
                        <Pin className="h-3 w-3" /> Закреплено
                      </span>
                    )}
                    <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {featured.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        {formatDate(featured.published_at)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        {featured.read_time_minutes} мин чтения
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-extrabold leading-snug text-white transition group-hover:text-indigo-300 sm:text-2xl">
                      {featured.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">
                      {featured.summary}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs font-medium text-slate-400">
                      Автор: <strong className="text-slate-200">{featured.author_name}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-300 group-hover:text-amber-300">
                      Читать полностью <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* Side Stack of Articles */}
            <div className="flex flex-col gap-5 lg:col-span-5">
              {rest.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setActiveArticle(item)}
                  className="group glass-card glass-card-hover flex cursor-pointer flex-col justify-between rounded-2xl p-5 sm:flex-row sm:items-center gap-4"
                >
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-32">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(item.published_at)}
                      </span>
                    </div>
                    <h4 className="mt-1.5 line-clamp-2 text-base font-bold text-white transition group-hover:text-indigo-300">
                      {item.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {item.summary}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Article Full Reader Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="glass-card relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-56 w-full overflow-hidden rounded-2xl sm:h-64">
              <img
                src={activeArticle.image_url}
                alt={activeArticle.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full bg-indigo-600 px-3 py-1 font-semibold text-white">
                {activeArticle.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                {formatDate(activeArticle.published_at)}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-indigo-400" />
                {activeArticle.author_name}
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-extrabold text-white">
              {activeArticle.title}
            </h3>

            <p className="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm font-medium text-indigo-100">
              {activeArticle.summary}
            </p>

            <div className="mt-5 space-y-3 whitespace-pre-line text-sm leading-relaxed text-slate-200 sm:text-base">
              {activeArticle.content}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

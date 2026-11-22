import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Download,
  PlayCircle,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Search,
  X,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import type { IQAPaper } from '../types/domain';

interface IQAPapersSectionProps {
  papers: IQAPaper[];
}

const SUBJECTS = [
  'Все предметы',
  'Mathematics',
  'English',
  'Logic & IQ',
  'Computer Science',
  'Physics',
  'Kyrgyz & Russian',
] as const;

const GRADES = ['Все классы', '6', '7', '8', '9', '10', '11'] as const;

export const IQAPapersSection: React.FC<IQAPapersSectionProps> = ({ papers }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Все предметы');
  const [selectedGrade, setSelectedGrade] = useState<string>('Все классы');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [practicePaper, setPracticePaper] = useState<IQAPaper | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      const matchSubj =
        selectedSubject === 'Все предметы' || p.subject === selectedSubject;
      const matchGrade =
        selectedGrade === 'Все классы' || String(p.grade) === selectedGrade;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.paper_code.toLowerCase().includes(q) ||
        p.topics_covered.some((t) => t.toLowerCase().includes(q));
      return matchSubj && matchGrade && matchSearch;
    });
  }, [papers, selectedSubject, selectedGrade, searchQuery]);

  const openPracticeModal = (paper: IQAPaper) => {
    setSelectedAnswers({});
    setPracticePaper(paper);
  };

  return (
    <section id="iqa" className="relative border-t border-white/10 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Banner */}
        <div className="glass-card relative overflow-hidden rounded-3xl border border-indigo-400/30 p-6 sm:p-10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/25">
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Раздел 03 • Экзаменационный архив школы</span>
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Past Papers of IQA{' '}
                <span className="text-indigo-300">(Indigo Quiz Assessment)</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                Официальная база прошлых вариантов общешкольного экзамена IQA для 6–11 классов.
                Скачивайте печатные бланки в формате PDF или решайте интерактивные задачи с
                разборами от наших кафедр прямо на сайте.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Код (IQA-MATH...) или тема"
                className="w-full rounded-xl border border-white/15 bg-[#070A1E]/90 py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Row: Subjects & Grades */}
          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    selectedSubject === subj
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <span className="mr-1 text-xs font-medium text-slate-400">Параллель:</span>
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition ${
                    selectedGrade === g
                      ? 'bg-amber-500 text-slate-950'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {g === 'Все классы' ? 'Все' : `${g} кл`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        {filteredPapers.length === 0 ? (
          <div className="mt-8 glass-card rounded-2xl p-12 text-center text-slate-400">
            По выбранным фильтрам вариантов IQA не найдено. Попробуйте выбрать другой класс или предмет.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className="glass-card glass-card-hover flex flex-col justify-between rounded-3xl p-6"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 font-mono text-xs font-bold text-indigo-300 border border-indigo-400/30">
                        {paper.paper_code}
                      </span>
                      <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300">
                        {paper.grade} класс
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {paper.term} • {paper.year}
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <h3 className="mt-4 text-lg font-extrabold text-white sm:text-xl">
                    {paper.title}
                  </h3>

                  {/* Exam Specs */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      {paper.subject}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      {paper.duration_minutes} мин
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-emerald-400" />
                      Макс. балл: {paper.max_score}
                    </span>
                  </div>

                  {/* Topics Covered Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {paper.topics_covered.map((topic, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <button
                    onClick={() => openPracticeModal(paper)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2.5 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/30 hover:text-white"
                  >
                    <PlayCircle className="h-4 w-4 text-amber-400" />
                    <span>Разбор задач ({paper.sample_questions.length})</span>
                  </button>

                  <a
                    href={paper.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-violet-500"
                  >
                    <Download className="h-4 w-4" />
                    <span>Бланк IQA / PDF ({paper.download_count})</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive IQA Practice & Solution Modal */}
      {practicePaper && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setPracticePaper(null)}
        >
          <div
            className="glass-card relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPracticePaper(null)}
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 font-mono text-xs font-bold text-indigo-300 border border-indigo-400/30">
                {practicePaper.paper_code}
              </span>
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                Интерактивный тренажёр IQA
              </span>
            </div>

            <h3 className="mt-3 text-xl font-extrabold text-white sm:text-2xl">
              {practicePaper.title}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Выберите вариант ответа, чтобы сразу увидеть проверку и методический разбор кафедры Indigo Academy West.
            </p>

            <div className="mt-6 space-y-6">
              {practicePaper.sample_questions.map((item, qIdx) => {
                const chosen = selectedAnswers[qIdx];
                const isCorrect = chosen === item.answer;
                return (
                  <div
                    key={qIdx}
                    className="rounded-2xl border border-white/10 bg-[#070B1E]/90 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase text-indigo-400">
                        Задача #{qIdx + 1}
                      </span>
                      {chosen && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold ${
                            isCorrect ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" /> Верно!
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" /> Ошибка
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm font-semibold leading-relaxed text-white sm:text-base">
                      {item.q}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {item.options.map((opt, oIdx) => {
                        const isSelected = chosen === opt;
                        const isRightOption = opt === item.answer;

                        let btnStyle =
                          'border-white/10 bg-white/5 text-slate-200 hover:border-indigo-400/50 hover:bg-white/10';
                        if (chosen) {
                          if (isRightOption) {
                            btnStyle =
                              'border-emerald-500/60 bg-emerald-500/20 text-emerald-200';
                          } else if (isSelected && !isRightOption) {
                            btnStyle =
                              'border-rose-500/60 bg-rose-500/20 text-rose-200';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() =>
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [qIdx]: opt,
                              }))
                            }
                            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition sm:text-sm ${btnStyle}`}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/30 font-mono text-xs font-bold">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {chosen && (
                      <div className="mt-4 rounded-xl border border-indigo-400/30 bg-indigo-950/50 p-3.5 text-xs leading-relaxed text-indigo-100">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Разбор решения (Answer Key):</span>
                        </div>
                        <p className="mt-1">{item.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <a
                href={practicePaper.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"
              >
                <Download className="h-4 w-4" />
                <span>Открыть полный печатный бланк {practicePaper.paper_code}</span>
              </a>
              <button
                onClick={() => setPracticePaper(null)}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

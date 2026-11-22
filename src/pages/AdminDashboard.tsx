import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Newspaper,
  Users,
  FileCheck2,
  Lightbulb,
  Share2,
  Plus,
  Trash2,
  Check,
  Upload,
  Pin,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  AdminUser,
  IQAPaper,
  IQASubject,
  IQATerm,
  NewsCategory,
  NewsItem,
  SocialLink,
  Suggestion,
  SuggestionStatus,
  Teacher,
  TeacherDepartment,
} from '../types/domain';

interface AdminDashboardProps {
  adminUser: AdminUser;
  onBackToPublic: () => void;
  onDataMutated: () => void;
}

type AdminTab = 'news' | 'teachers' | 'papers' | 'suggestions' | 'socials';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onBackToPublic,
  onDataMutated,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [papers, setPapers] = useState<IQAPaper[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // News form state
  const [nTitle, setNTitle] = useState('');
  const [nCategory, setNCategory] = useState<NewsCategory>('Академия');
  const [nSummary, setNSummary] = useState('');
  const [nContent, setNContent] = useState('');
  const [nImage, setNImage] = useState('');
  const [nPinned, setNPinned] = useState(false);

  // Teacher form state
  const [tName, setTName] = useState('');
  const [tSubject, setTSubject] = useState('');
  const [tDept, setTDept] = useState<TeacherDepartment>('STEM & Олимпиады');
  const [tRole, setTRole] = useState('');
  const [tBio, setTBio] = useState('');
  const [tAchievements, setTAchievements] = useState('');
  const [tEducation, setTEducation] = useState('');
  const [tPhoto, setTPhoto] = useState('');
  const [tExp, setTExp] = useState(5);
  const [tQuote, setTQuote] = useState('');

  // IQA Paper form state
  const [pTitle, setPTitle] = useState('');
  const [pCode, setPCode] = useState('');
  const [pSubject, setPSubject] = useState<IQASubject>('Mathematics');
  const [pGrade, setPGrade] = useState(9);
  const [pYear, setPYear] = useState(2026);
  const [pTerm, setPTerm] = useState<IQATerm>('Quarter 1');
  const [pDuration, setPDuration] = useState(60);
  const [pMaxScore, setPMaxScore] = useState(100);
  const [pTopics, setPTopics] = useState('');
  const [pQuestionText, setPQuestionText] = useState('');
  const [pOptionsText, setPOptionsText] = useState('');
  const [pAnswerText, setPAnswersText] = useState('');
  const [pExplanation, setPExplanation] = useState('');
  const [pPdfBase64, setPPdfBase64] = useState<string | undefined>(undefined);
  const [pPdfName, setPPdfName] = useState<string>('');

  // Suggestion reply drafts
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});

  const loadAdminOverview = async () => {
    try {
      const data = await api.getAdminOverview();
      setNews(data.news);
      setTeachers(data.teachers);
      setPapers(data.papers);
      setSuggestions(data.suggestions);
      setSocials(data.socials);
      const map: Record<number, string> = {};
      data.suggestions.forEach((s) => {
        map[s.id] = s.admin_reply || '';
      });
      setReplyDrafts(map);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminOverview();
  }, []);

  const notify = (msg: string) => {
    setStatusBanner(msg);
    onDataMutated();
    setTimeout(() => setStatusBanner(null), 4000);
  };

  // Handlers: News
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createNews({
      title: nTitle,
      category: nCategory,
      summary: nSummary,
      content: nContent,
      image_url: nImage,
      author_name: adminUser.display_name,
      is_pinned: nPinned,
    });
    setNews(res.news);
    setNTitle('');
    setNSummary('');
    setNContent('');
    setNImage('');
    setNPinned(false);
    notify('Новость успешно опубликована на портале!');
  };

  const handleDeleteNews = async (id: number) => {
    const res = await api.deleteNews(id);
    setNews(res.news);
    notify('Новость удалена');
  };

  const handleTogglePin = async (item: NewsItem) => {
    const res = await api.updateNews(item.id, {
      ...item,
      is_pinned: !item.is_pinned,
    });
    setNews(res.news);
    notify(item.is_pinned ? 'Новость откреплена' : 'Новость закреплена первой');
  };

  // Handlers: Teachers
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createTeacher({
      full_name: tName,
      subject: tSubject,
      department: tDept,
      role_title: tRole,
      bio: tBio,
      achievements: tAchievements
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      education: tEducation,
      photo_url: tPhoto,
      experience_years: Number(tExp),
      quote: tQuote,
    });
    setTeachers(res.teachers);
    setTName('');
    setTSubject('');
    setTRole('');
    setTBio('');
    setTAchievements('');
    setTEducation('');
    setTPhoto('');
    setTQuote('');
    notify('Преподаватель добавлен в каталог школы!');
  };

  const handleDeleteTeacher = async (id: number) => {
    const res = await api.deleteTeacher(id);
    setTeachers(res.teachers);
    notify('Карточка преподавателя удалена');
  };

  // Handlers: IQA Papers
  const handlePdfUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPPdfBase64(undefined);
      setPPdfName('');
      return;
    }
    setPPdfName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPPdfBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    const sampleQuestions = pQuestionText.trim()
      ? [
          {
            q: pQuestionText.trim(),
            options: pOptionsText
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean),
            answer: pAnswerText.trim(),
            explanation:
              pExplanation.trim() || 'Разбор от кафедры Indigo Academy West.',
          },
        ]
      : undefined;

    const res = await api.createPaper({
      title: pTitle,
      paper_code: pCode,
      subject: pSubject,
      grade: Number(pGrade),
      year: Number(pYear),
      term: pTerm,
      duration_minutes: Number(pDuration),
      max_score: Number(pMaxScore),
      topics_covered: pTopics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      sample_questions: sampleQuestions,
      pdf_base64: pPdfBase64,
      pdf_filename: pPdfName,
    });

    setPapers(res.papers);
    setPTitle('');
    setPCode('');
    setPTopics('');
    setPQuestionText('');
    setPOptionsText('');
    setPAnswersText('');
    setPExplanation('');
    setPPdfBase64(undefined);
    setPPdfName('');
    notify('Экзаменационный вариант IQA добавлен в архив!');
  };

  const handleDeletePaper = async (id: number) => {
    const res = await api.deletePaper(id);
    setPapers(res.papers);
    notify('Вариант IQA удалён из архива');
  };

  // Handlers: Suggestions
  const handleModerateSuggestion = async (
    id: number,
    status: SuggestionStatus,
    is_public: boolean
  ) => {
    const res = await api.moderateSuggestion(id, {
      status,
      admin_reply: replyDrafts[id] ?? '',
      is_public,
    });
    setSuggestions(res.suggestions);
    notify('Статус и ответ администрации сохранены!');
  };

  const handleDeleteSuggestion = async (id: number) => {
    const res = await api.deleteSuggestion(id);
    setSuggestions(res.suggestions);
    notify('Предложение удалено');
  };

  // Handlers: Socials
  const handleUpdateSocial = async (soc: SocialLink) => {
    const res = await api.updateSocialLink(soc.id, soc);
    setSocials(res.socials);
    notify(`Настройки соцсети ${soc.platform} обновлены!`);
  };

  const tabs: Array<{ id: AdminTab; label: string; count: number; icon: React.ElementType }> = [
    { id: 'news', label: 'Новости', count: news.length, icon: Newspaper },
    { id: 'teachers', label: 'Учителя', count: teachers.length, icon: Users },
    { id: 'papers', label: 'IQA Past Papers', count: papers.length, icon: FileCheck2 },
    { id: 'suggestions', label: 'Советы учеников', count: suggestions.length, icon: Lightbulb },
    { id: 'socials', label: 'Соцсети', count: socials.length, icon: Share2 },
  ];

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Admin Header */}
        <div className="glass-card flex flex-col justify-between gap-4 rounded-3xl border border-amber-400/30 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white sm:text-2xl">
                  Панель Администратора (CMS)
                </h1>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                  JWT Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Вы вошли как: <strong className="text-slate-200">{adminUser.display_name}</strong> ({adminUser.username}) • Все изменения сразу сохраняются в SQLite на сервере
              </p>
            </div>
          </div>

          <button
            onClick={onBackToPublic}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Смотреть сайт глазами ученика</span>
          </button>
        </div>

        {statusBanner && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-200">
            <Check className="h-4 w-4" />
            <span>{statusBanner}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold transition sm:text-sm ${
                  activeTab === t.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'glass-card text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
                <span className="rounded-full bg-black/30 px-2 py-0.5 font-mono text-xs">
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: NEWS MANAGEMENT */}
        {activeTab === 'news' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleCreateNews}
              className="glass-card space-y-4 rounded-3xl p-6 lg:col-span-5"
            >
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-white">
                <Plus className="h-5 w-5 text-indigo-400" />
                <span>Загрузить новую новость</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Заголовок новости *
                </label>
                <input
                  type="text"
                  required
                  value={nTitle}
                  onChange={(e) => setNTitle(e.target.value)}
                  placeholder="Напр.: Итоги зимней олимпиады Indigo West"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Рубрика
                </label>
                <select
                  value={nCategory}
                  onChange={(e) => setNCategory(e.target.value as NewsCategory)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B102B] px-3.5 py-2 text-sm text-white"
                >
                  <option value="Академия">Академия</option>
                  <option value="IQA Экзамены">IQA Экзамены</option>
                  <option value="Олимпиады">Олимпиады</option>
                  <option value="Кампус">Кампус</option>
                  <option value="События">События</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Краткий анонс (для карточки) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={nSummary}
                  onChange={(e) => setNSummary(e.target.value)}
                  placeholder="1–2 предложения..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Полный текст статьи *
                </label>
                <textarea
                  required
                  rows={4}
                  value={nContent}
                  onChange={(e) => setNContent(e.target.value)}
                  placeholder="Подробный текст новости..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Ссылка на обложку (URL фото, необязательно)
                </label>
                <input
                  type="url"
                  value={nImage}
                  onChange={(e) => setNImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={nPinned}
                  onChange={(e) => setNPinned(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                <span>Закрепить новость главной на первом экране</span>
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500"
              >
                Опубликовать новость
              </button>
            </form>

            <div className="space-y-4 lg:col-span-7">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="glass-card flex items-start justify-between gap-4 rounded-2xl p-5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {item.is_pinned && (
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                          Закреплено
                        </span>
                      )}
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">{item.summary}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(item)}
                      title="Закрепить / открепить"
                      className={`rounded-lg p-2 transition ${
                        item.is_pinned
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="rounded-lg bg-rose-500/15 p-2 text-rose-300 hover:bg-rose-500/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TEACHERS MANAGEMENT */}
        {activeTab === 'teachers' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleCreateTeacher}
              className="glass-card space-y-3.5 rounded-3xl p-6 lg:col-span-5"
            >
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-white">
                <Plus className="h-5 w-5 text-indigo-400" />
                <span>Добавить преподавателя</span>
              </h2>

              <input
                type="text"
                required
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                placeholder="ФИО преподавателя *"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
              />

              <input
                type="text"
                required
                value={tSubject}
                onChange={(e) => setTSubject(e.target.value)}
                placeholder="Предмет (напр.: Олимпиадная химия) *"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
              />

              <select
                value={tDept}
                onChange={(e) => setTDept(e.target.value as TeacherDepartment)}
                className="w-full rounded-xl border border-white/10 bg-[#0B102B] px-3.5 py-2 text-sm text-white"
              >
                <option value="STEM & Олимпиады">STEM & Олимпиады</option>
                <option value="Языки & IELTS/SAT">Языки & IELTS/SAT</option>
                <option value="Гуманитарные науки">Гуманитарные науки</option>
                <option value="Начальная и средняя школа">
                  Начальная и средняя школа
                </option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={tRole}
                  onChange={(e) => setTRole(e.target.value)}
                  placeholder="Должность на кафедре"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
                />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={tExp}
                  onChange={(e) => setTExp(Number(e.target.value))}
                  placeholder="Стаж (лет)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
                />
              </div>

              <input
                type="text"
                value={tEducation}
                onChange={(e) => setTEducation(e.target.value)}
                placeholder="Образование / Университет"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
              />

              <textarea
                rows={2}
                value={tBio}
                onChange={(e) => setTBio(e.target.value)}
                placeholder="Краткая биография и специализация..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
              />

              <input
                type="text"
                value={tAchievements}
                onChange={(e) => setTAchievements(e.target.value)}
                placeholder="Достижения через запятую (напр.: IELTS 8.5, Тренер олимпиад)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
              />

              <input
                type="text"
                value={tQuote}
                onChange={(e) => setTQuote(e.target.value)}
                placeholder="Вдохновляющая цитата для учеников"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
              />

              <input
                type="url"
                value={tPhoto}
                onChange={(e) => setTPhoto(e.target.value)}
                placeholder="URL фотографии (необязательно)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500"
              >
                Сохранить преподавателя
              </button>
            </form>

            <div className="space-y-4 lg:col-span-7">
              {teachers.map((t) => (
                <div
                  key={t.id}
                  className="glass-card flex items-center justify-between gap-4 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={t.photo_url}
                      alt={t.full_name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div>
                      <span className="text-[11px] font-bold text-indigo-300">
                        {t.department}
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {t.full_name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {t.subject} • Стаж {t.experience_years} лет
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTeacher(t.id)}
                    className="rounded-lg bg-rose-500/15 p-2.5 text-rose-300 hover:bg-rose-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: IQA PAST PAPERS MANAGEMENT */}
        {activeTab === 'papers' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleCreatePaper}
              className="glass-card space-y-3.5 rounded-3xl p-6 lg:col-span-5"
            >
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-white">
                <Plus className="h-5 w-5 text-emerald-400" />
                <span>Загрузить вариант IQA Past Paper</span>
              </h2>

              <input
                type="text"
                required
                value={pTitle}
                onChange={(e) => setPTitle(e.target.value)}
                placeholder="Название работы (напр.: IQA Mathematics — Векторы и Логарифмы) *"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={pCode}
                  onChange={(e) => setPCode(e.target.value)}
                  placeholder="Код (IQA-MATH-G11-Q2) *"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs text-white"
                />
                <select
                  value={pSubject}
                  onChange={(e) => setPSubject(e.target.value as IQASubject)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B102B] px-3 py-2 text-xs text-white"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="Logic & IQ">Logic & IQ</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Kyrgyz & Russian">Kyrgyz & Russian</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">Класс</label>
                  <input
                    type="number"
                    min={5}
                    max={11}
                    value={pGrade}
                    onChange={(e) => setPGrade(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Год</label>
                  <input
                    type="number"
                    value={pYear}
                    onChange={(e) => setPYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Сессия</label>
                  <select
                    value={pTerm}
                    onChange={(e) => setPTerm(e.target.value as IQATerm)}
                    className="w-full rounded-xl border border-white/10 bg-[#0B102B] px-2 py-1.5 text-xs text-white"
                  >
                    <option value="Quarter 1">Quarter 1</option>
                    <option value="Quarter 2">Quarter 2</option>
                    <option value="Quarter 3">Quarter 3</option>
                    <option value="Quarter 4">Quarter 4</option>
                    <option value="Final Mock">Final Mock</option>
                  </select>
                </div>
              </div>

              <input
                type="text"
                value={pTopics}
                onChange={(e) => setPTopics(e.target.value)}
                placeholder="Проверяемые темы через запятую"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
              />

              {/* Optional Real PDF File Upload */}
              <div className="rounded-2xl border border-dashed border-indigo-400/40 bg-indigo-950/30 p-3.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-indigo-200">
                  <Upload className="h-4 w-4 text-amber-400" />
                  <span>
                    {pPdfName
                      ? `Выбран PDF: ${pPdfName}`
                      : 'Прикрепить готовый PDF-файл (необязательно)'}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUploadChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-[11px] text-slate-400">
                  Если PDF не прикреплён, система автоматически сгенерирует печатный бланк IQA по коду.
                </p>
              </div>

              {/* Optional Sample Question */}
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <div className="text-xs font-bold text-amber-300">
                  Демо-задача для интерактивного тренажёра:
                </div>
                <input
                  type="text"
                  value={pQuestionText}
                  onChange={(e) => setPQuestionText(e.target.value)}
                  placeholder="Условие задачи..."
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={pOptionsText}
                  onChange={(e) => setPOptionsText(e.target.value)}
                  placeholder="4 варианта ответа через запятую (напр.: 10, 20, 30, 40)"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={pAnswerText}
                  onChange={(e) => setPAnswersText(e.target.value)}
                  placeholder="Правильный ответ (точно как в одном из вариантов)"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={pExplanation}
                  onChange={(e) => setPExplanation(e.target.value)}
                  placeholder="Краткое объяснение решения..."
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500"
              >
                Добавить вариант в базу IQA
              </button>
            </form>

            <div className="space-y-4 lg:col-span-7">
              {papers.map((p) => (
                <div
                  key={p.id}
                  className="glass-card flex items-center justify-between gap-4 rounded-2xl p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-xs font-bold text-indigo-300">
                        {p.paper_code}
                      </span>
                      <span className="text-xs font-bold text-amber-300">
                        {p.grade} класс • {p.subject}
                      </span>
                    </div>
                    <h4 className="mt-1 text-base font-bold text-white">
                      {p.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Скачиваний: {p.download_count} • Вопросов в тренажёре:{' '}
                      {p.sample_questions.length}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePaper(p.id)}
                    className="rounded-lg bg-rose-500/15 p-2.5 text-rose-300 hover:bg-rose-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SUGGESTIONS MODERATION */}
        {activeTab === 'suggestions' && (
          <div className="mt-8 space-y-4">
            {suggestions.map((s) => (
              <div key={s.id} className="glass-card rounded-3xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300">
                      {s.category}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">
                      Автор: <strong className="text-white">{s.author_name}</strong> ({s.grade_label}) • Голосов: {s.upvotes}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSuggestion(s.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Удалить
                  </button>
                </div>

                <h3 className="mt-3 text-lg font-extrabold text-white">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-slate-300">{s.content}</p>

                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <label className="block text-xs font-bold text-amber-300">
                      Официальный ответ администрации школы:
                    </label>
                    <input
                      type="text"
                      value={replyDrafts[s.id] ?? ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [s.id]: e.target.value,
                        }))
                      }
                      placeholder="Напишите комментарий дирекции..."
                      className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-end gap-2 lg:col-span-4">
                    {(
                      [
                        { st: 'reviewing', label: 'На рассмотрении' },
                        { st: 'approved', label: 'Одобрить' },
                        { st: 'implemented', label: 'Реализовано' },
                      ] as const
                    ).map((btn) => (
                      <button
                        key={btn.st}
                        onClick={() =>
                          handleModerateSuggestion(s.id, btn.st, s.is_public)
                        }
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                          s.status === btn.st
                            ? 'bg-emerald-500 text-slate-950'
                            : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: SOCIAL LINKS MANAGEMENT */}
        {activeTab === 'socials' && (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {socials.map((soc, idx) => (
              <div key={soc.id} className="glass-card space-y-3 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">
                    {soc.platform}
                  </span>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={soc.is_active}
                      onChange={(e) => {
                        const copy = [...socials];
                        copy[idx] = { ...soc, is_active: e.target.checked };
                        setSocials(copy);
                      }}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    Показывать на сайте
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Никнейм / Handle</label>
                    <input
                      type="text"
                      value={soc.handle}
                      onChange={(e) => {
                        const copy = [...socials];
                        copy[idx] = { ...soc, handle: e.target.value };
                        setSocials(copy);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Подписчики / Метка</label>
                    <input
                      type="text"
                      value={soc.subscribers_label}
                      onChange={(e) => {
                        const copy = [...socials];
                        copy[idx] = { ...soc, subscribers_label: e.target.value };
                        setSocials(copy);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">Прямая ссылка (URL)</label>
                  <input
                    type="text"
                    value={soc.url}
                    onChange={(e) => {
                      const copy = [...socials];
                      copy[idx] = { ...soc, url: e.target.value };
                      setSocials(copy);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">Описание канала</label>
                  <textarea
                    rows={2}
                    value={soc.description}
                    onChange={(e) => {
                      const copy = [...socials];
                      copy[idx] = { ...soc, description: e.target.value };
                      setSocials(copy);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white"
                  />
                </div>

                <button
                  onClick={() => handleUpdateSocial(socials[idx])}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  <Save className="h-3.5 w-3.5" /> Сохранить изменения
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

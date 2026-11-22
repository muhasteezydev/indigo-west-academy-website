import React, { useState, useMemo } from 'react';
import {
  SCHOOL_NEWS,
  SCHOOL_TEACHERS,
  SCHOOL_IQA_PAPERS,
  SCHOOL_SUGGESTIONS,
  SCHOOL_SOCIALS,
  type DesignNewsItem,
  type DesignSuggestion,
} from './data/schoolData';

export function App() {
  // Dual-site routing: "/" = public school portal (no admin UI visible), "/admin" = private staff portal
  const [siteMode, setSiteMode] = useState<'public' | 'admin'>(() =>
    window.location.pathname.startsWith('/admin') ? 'admin' : 'public'
  );
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminLogin, setAdminLogin] = useState('admin');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminTab, setAdminTab] = useState<
    'news' | 'iqa' | 'teachers' | 'suggestions' | 'complaints' | 'socials'
  >('news');

  // Interactive state for News
  const [newsCategory, setNewsCategory] = useState<string>('Все');
  const [readingNews, setReadingNews] = useState<DesignNewsItem | null>(null);

  // Interactive state for IQA Past Papers finder (matching Paréa 4-dropdown bar)
  const [iqaSubject, setIqaSubject] = useState<string>('Все предметы');
  const [iqaGrade, setIqaGrade] = useState<string>('Все классы');
  const [iqaQuarter, setIqaQuarter] = useState<string>('Все четверти');
  const [iqaFileMode, setIqaFileMode] = useState<string>('Бланк PDF + Ключи');
  const [showAllPapers, setShowAllPapers] = useState<boolean>(false);

  // Interactive state for Teachers
  const [teacherDept, setTeacherDept] = useState<string>('Все кафедры');

  // Interactive state for Suggestions & Anonymous Complaints
  const [feedbackTab, setFeedbackTab] = useState<'idea' | 'complaint'>('complaint');
  const [suggestionsList, setSuggestionsList] = useState<DesignSuggestion[]>(SCHOOL_SUGGESTIONS);
  const [ideaAuthor, setIdeaAuthor] = useState('');
  const [ideaRole, setIdeaRole] = useState('Ученик');
  const [ideaCategory, setIdeaCategory] = useState<DesignSuggestion['category']>('Учебный процесс');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaText, setIdeaText] = useState('');
  const [ideaSuccess, setIdeaSuccess] = useState(false);

  // Anonymous Complaint Box state (strictly private, never shown on public board)
  const [complaintsList, setComplaintsList] = useState<
    Array<{
      ticket: string;
      date: string;
      topic: string;
      urgency: 'Обычное' | 'Срочное';
      details: string;
      locationOrClass: string;
    }>
  >([
    {
      ticket: 'ANON-4192',
      date: '15.11.2026',
      topic: 'Столовая и питание',
      urgency: 'Обычное',
      locationOrClass: 'Столовая, 1 этаж',
      details:
        'На большой перемене после 3-го урока не хватает горячих порций для старших классов, очередь не успевает пройти до звонка.',
    },
  ]);
  const [complaintTopic, setComplaintTopic] = useState('Учебный процесс и оценивание');
  const [complaintUrgency, setComplaintUrgency] = useState<'Обычное' | 'Срочное'>('Обычное');
  const [complaintLocation, setComplaintLocation] = useState('');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [lastComplaintTicket, setLastComplaintTicket] = useState<string | null>(null);

  const filteredNews = useMemo(() => {
    if (newsCategory === 'Все') return SCHOOL_NEWS;
    return SCHOOL_NEWS.filter((n) => n.category === newsCategory);
  }, [newsCategory]);

  const filteredTeachers = useMemo(() => {
    if (teacherDept === 'Все кафедры') return SCHOOL_TEACHERS;
    return SCHOOL_TEACHERS.filter((t) => t.department === teacherDept);
  }, [teacherDept]);

  const filteredPapers = useMemo(() => {
    return SCHOOL_IQA_PAPERS.filter((p) => {
      const mSubj = iqaSubject === 'Все предметы' || p.subject === iqaSubject;
      const mGrade = iqaGrade === 'Все классы' || `${p.grade} класс` === iqaGrade;
      const mQuarter = iqaQuarter === 'Все четверти' || p.quarter === iqaQuarter;
      return mSubj && mGrade && mQuarter;
    });
  }, [iqaSubject, iqaGrade, iqaQuarter]);

  const jumpTo = (id: string) => {
    setSiteMode('public');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 30);
  };

  const handleIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaText.trim()) return;
    const newEntry: DesignSuggestion = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ru-RU'),
      author: ideaAuthor.trim() ? `${ideaRole}: ${ideaAuthor.trim()}` : `${ideaRole} (Анонимно)`,
      category: ideaCategory,
      title: ideaTitle.trim(),
      text: ideaText.trim(),
      status: 'На рассмотрении',
    };
    setSuggestionsList((prev) => [newEntry, ...prev]);
    setIdeaTitle('');
    setIdeaText('');
    setIdeaSuccess(true);
    setTimeout(() => setIdeaSuccess(false), 4000);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDetails.trim()) return;
    const ticket = `ANON-${Math.floor(1000 + Math.random() * 9000)}`;
    setComplaintsList((prev) => [
      {
        ticket,
        date: new Date().toLocaleDateString('ru-RU'),
        topic: complaintTopic,
        urgency: complaintUrgency,
        locationOrClass: complaintLocation.trim() || 'Не указано',
        details: complaintDetails.trim(),
      },
      ...prev,
    ]);
    setComplaintLocation('');
    setComplaintDetails('');
    setLastComplaintTicket(ticket);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin === 'admin' && adminPass === 'indigo2026') {
      setAdminAuthenticated(true);
      setAdminError('');
    } else {
      setAdminError('Неверный логин или пароль (демо: admin / indigo2026)');
    }
  };

  // ===========================================================================
  // ADMIN SIDE (SECOND SIDE OF THE SITE — MATCHING EXACT PALETTE & STYLE)
  // ===========================================================================
  if (siteMode === 'admin') {
    return (
      <div className="min-h-screen bg-[#051F20] text-[#DAF1DE]">
        {/* Top Bar */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/');
              setSiteMode('public');
            }}
            className="text-left focus:outline-none"
          >
            <div className="text-2xl font-extrabold tracking-tight text-[#DAF1DE]">
              indigo
            </div>
            <div className="text-[10px] tracking-wide text-[#8EB69B]">
              academy west • служебный доступ
            </div>
          </a>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/');
              setSiteMode('public');
            }}
            className="rounded-full bg-[#DAF1DE] px-6 py-2.5 text-xs font-semibold text-[#051F20] transition hover:bg-[#8EB69B]"
          >
            ← открыть публичный сайт
          </a>
        </header>

        <main className="mx-auto max-w-6xl px-5 pb-16">
          {!adminAuthenticated ? (
            <div className="mx-auto mt-10 max-w-md rounded-[28px] bg-[#DAF1DE] p-8 text-[#051F20]">
              <h1 className="text-2xl font-bold tracking-tight">
                вход для администратора
              </h1>
              <p className="mt-1.5 text-sm text-[#163832]">
                закрытая сторона сайта indigo academy west для управления новостями,
                учителями и базой past papers of iqa.
              </p>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#8EB69B]/35 px-4 py-2.5 text-xs text-[#051F20]">
                <span>
                  демо: <strong className="font-mono">admin</strong> /{' '}
                  <strong className="font-mono">indigo2026</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminLogin('admin');
                    setAdminPass('indigo2026');
                  }}
                  className="rounded-full bg-[#051F20] px-3 py-1 text-[11px] font-medium text-[#DAF1DE]"
                >
                  подставить
                </button>
              </div>

              <form onSubmit={handleAdminAuth} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#163832]">
                    логин администратора
                  </label>
                  <input
                    type="text"
                    value={adminLogin}
                    onChange={(e) => setAdminLogin(e.target.value)}
                    className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#051F20] outline-none ring-1 ring-[#8EB69B]/50 focus:ring-[#051F20]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#163832]">
                    пароль
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="введите пароль"
                    className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#051F20] outline-none ring-1 ring-[#8EB69B]/50 focus:ring-[#051F20]"
                  />
                </div>
                {adminError && (
                  <p className="text-xs font-semibold text-red-900">{adminError}</p>
                )}
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#051F20] py-3.5 text-sm font-medium text-[#DAF1DE] transition hover:bg-[#163832]"
                >
                  войти в панель управления →
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Admin Pill Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-[#0B2B26] p-6">
                <div>
                  <div className="text-xs font-medium text-[#8EB69B]">
                    администрирование портала • г. бишкек
                  </div>
                  <h1 className="mt-0.5 text-2xl font-bold text-[#DAF1DE]">
                    управление контентом indigo academy west
                  </h1>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'news', label: 'новости' },
                      { id: 'iqa', label: 'past papers iqa' },
                      { id: 'teachers', label: 'учителя' },
                      { id: 'suggestions', label: 'советы' },
                      {
                        id: 'complaints',
                        label: `анонимные жалобы (${complaintsList.length})`,
                      },
                      { id: 'socials', label: 'соцсети' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id)}
                      className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                        adminTab === tab.id
                          ? 'bg-[#DAF1DE] text-[#051F20]'
                          : 'bg-[#163832] text-[#DAF1DE] hover:bg-[#235347]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Workspace Card */}
              <div className="rounded-[28px] bg-[#EEF7F0] p-8 text-[#051F20]">
                {adminTab === 'news' && (
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-5">
                      <h2 className="text-xl font-bold">опубликовать новость</h2>
                      <input
                        type="text"
                        placeholder="заголовок новости"
                        className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none ring-1 ring-[#8EB69B]/40"
                      />
                      <select className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none ring-1 ring-[#8EB69B]/40">
                        <option>Экзамены IQA</option>
                        <option>Олимпиады</option>
                        <option>Учебная часть</option>
                        <option>Объявление</option>
                      </select>
                      <textarea
                        rows={4}
                        placeholder="полный текст публикации..."
                        className="w-full rounded-xl bg-white p-4 text-sm outline-none ring-1 ring-[#8EB69B]/40"
                      />
                      <button
                        type="button"
                        className="rounded-full bg-[#051F20] px-6 py-3 text-xs font-semibold text-[#DAF1DE] hover:bg-[#163832]"
                      >
                        залить новость на сайт →
                      </button>
                    </div>
                    <div className="space-y-3 lg:col-span-7">
                      <h3 className="text-sm font-bold text-[#163832]">
                        опубликованные новости ({SCHOOL_NEWS.length})
                      </h3>
                      {SCHOOL_NEWS.map((n) => (
                        <div
                          key={n.id}
                          className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-[#8EB69B]/30"
                        >
                          <div>
                            <div className="text-[11px] font-mono text-[#235347]">
                              {n.date} • {n.category}
                            </div>
                            <div className="mt-0.5 text-sm font-bold">{n.title}</div>
                          </div>
                          <span className="rounded-full bg-[#DAF1DE] px-3 py-1 text-[11px] font-semibold text-[#051F20]">
                            активна
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'iqa' && (
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-5">
                      <h2 className="text-xl font-bold">загрузить past paper iqa</h2>
                      <input
                        type="text"
                        placeholder="шифр варианта (напр. IQA-MATH-10-2026-Q2)"
                        className="w-full rounded-xl bg-white px-4 py-3 font-mono text-sm outline-none ring-1 ring-[#8EB69B]/40"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select className="rounded-xl bg-white px-4 py-3 text-sm outline-none ring-1 ring-[#8EB69B]/40">
                          <option>Математика</option>
                          <option>Английский язык</option>
                          <option>Логика (IQ)</option>
                          <option>Информатика</option>
                          <option>Физика</option>
                        </select>
                        <select className="rounded-xl bg-white px-4 py-3 text-sm outline-none ring-1 ring-[#8EB69B]/40">
                          <option>10 класс</option>
                          <option>9 класс</option>
                          <option>8 класс</option>
                          <option>11 класс</option>
                        </select>
                      </div>
                      <div className="rounded-2xl border-2 border-dashed border-[#8EB69B] bg-[#DAF1DE]/40 p-5 text-center text-xs font-medium text-[#163832]">
                        перетащите PDF-файл бланка IQA и ключи ответов сюда
                      </div>
                      <button
                        type="button"
                        className="rounded-full bg-[#051F20] px-6 py-3 text-xs font-semibold text-[#DAF1DE]"
                      >
                        добавить в архив iqa →
                      </button>
                    </div>
                    <div className="space-y-3 lg:col-span-7">
                      <h3 className="text-sm font-bold text-[#163832]">
                        варианты в базе ({SCHOOL_IQA_PAPERS.length})
                      </h3>
                      {SCHOOL_IQA_PAPERS.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-[#8EB69B]/30"
                        >
                          <div>
                            <span className="font-mono text-xs font-bold text-[#235347]">
                              {p.code}
                            </span>
                            <div className="text-sm font-bold">
                              {p.subject} • {p.grade} класс ({p.quarter})
                            </div>
                          </div>
                          <span className="rounded-full bg-[#0B2B26] px-3 py-1 text-[11px] font-medium text-[#DAF1DE]">
                            {p.fileSize}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'teachers' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">управление учительским составом</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {SCHOOL_TEACHERS.map((t) => (
                        <div
                          key={t.id}
                          className="rounded-2xl bg-white p-5 ring-1 ring-[#8EB69B]/30"
                        >
                          <div className="text-xs font-semibold text-[#235347]">
                            {t.department} • {t.room}
                          </div>
                          <div className="mt-1 text-base font-bold">{t.name}</div>
                          <div className="text-xs text-[#163832]">{t.subject}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'suggestions' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">
                      модерация советов учеников ({suggestionsList.length})
                    </h2>
                    {suggestionsList.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl bg-white p-5 ring-1 ring-[#8EB69B]/30"
                      >
                        <div className="flex items-center justify-between text-xs text-[#235347]">
                          <span>
                            {s.date} • {s.author}
                          </span>
                          <span className="rounded-full bg-[#DAF1DE] px-3 py-0.5 font-semibold text-[#051F20]">
                            {s.status}
                          </span>
                        </div>
                        <div className="mt-1.5 text-base font-bold">{s.title}</div>
                        <p className="mt-1 text-sm text-[#163832]">{s.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {adminTab === 'complaints' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">
                          анонимные жалобы и обращения ({complaintsList.length})
                        </h2>
                        <p className="text-xs text-[#235347]">
                          эти сообщения не отображаются на публичном сайте и видны только здесь.
                        </p>
                      </div>
                    </div>
                    {complaintsList.map((c) => (
                      <div
                        key={c.ticket}
                        className="rounded-2xl bg-white p-5 ring-1 ring-[#8EB69B]/40"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#051F20] px-3 py-0.5 font-mono font-bold text-[#DAF1DE]">
                              {c.ticket}
                            </span>
                            <span className="font-semibold text-[#235347]">
                              {c.topic}
                            </span>
                            <span className="text-[#163832]/70">• {c.date}</span>
                          </div>
                          <span
                            className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                              c.urgency === 'Срочное'
                                ? 'bg-red-900 text-white'
                                : 'bg-[#DAF1DE] text-[#051F20]'
                            }`}
                          >
                            {c.urgency.toLowerCase()}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-[#235347]">
                          место / кабинет: <strong>{c.locationOrClass}</strong>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[#051F20]">
                          {c.details}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {adminTab === 'socials' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">ссылки на соцсети школы</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {SCHOOL_SOCIALS.map((soc) => (
                        <div
                          key={soc.id}
                          className="rounded-2xl bg-white p-4 ring-1 ring-[#8EB69B]/30"
                        >
                          <div className="text-sm font-bold">{soc.name}</div>
                          <div className="font-mono text-xs text-[#235347]">{soc.handle}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ===========================================================================
  // PUBLIC SIDE — PARÉA REFERENCE LAYOUT IN EXACT 6-HEX BOTANICAL PALETTE
  // (#051F20, #0B2B26, #163832, #235347, #8EB69B, #DAF1DE)
  // ===========================================================================
  return (
    <div className="min-h-screen bg-[#051F20] text-[#051F20]">
      {/* =====================================================================
          BLOCK 1: ATMOSPHERIC HERO BANNER + FLOATING PILL NAVBAR
      ===================================================================== */}
      <section className="relative overflow-hidden bg-[#DAF1DE]">
        {/* Bespoke Bishkek Ala-Too + Academy Panoramic Artwork */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/hero-indigo-west.jpg')` }}
        />
        {/* Subtle Top Pale Mint Sky Blend */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[34%]"
          style={{
            background:
              'linear-gradient(180deg, rgba(218,241,222,0.92) 0%, rgba(218,241,222,0) 100%)',
          }}
        />
        {/* Bottom Seamless Dark Pine Fade into #051F20 */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,31,32,0) 0%, rgba(5,31,32,0.82) 55%, #051F20 100%)',
          }}
        />

        {/* Floating Top Navbar (Exact Paréa 3-part geometry) */}
        <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 pt-6">
          {/* Left Wordmark */}
          <a href="#top" className="leading-none">
            <div className="text-2xl font-extrabold tracking-[-0.04em] text-[#051F20]">
              indigo
            </div>
            <div className="mt-0.5 text-[10px] font-medium tracking-tight text-[#163832]">
              academy west • бишкек
            </div>
          </a>

          {/* Center Dark Pill Menu */}
          <nav className="hidden items-center gap-7 rounded-full bg-[#051F20] px-8 py-3 text-[13px] font-medium text-[#DAF1DE] shadow-lg shadow-[#051F20]/15 md:flex">
            <button
              onClick={() => jumpTo('news')}
              className="transition hover:text-[#8EB69B]"
            >
              новости
            </button>
            <button
              onClick={() => jumpTo('teachers')}
              className="transition hover:text-[#8EB69B]"
            >
              учителя
            </button>
            <button
              onClick={() => jumpTo('iqa')}
              className="transition hover:text-[#8EB69B]"
            >
              past papers iqa
            </button>
            <button
              onClick={() => jumpTo('suggestions')}
              className="transition hover:text-[#8EB69B]"
            >
              советы и жалобы
            </button>
            <button
              onClick={() => jumpTo('socials')}
              className="transition hover:text-[#8EB69B]"
            >
              соцсети
            </button>
          </nav>

          {/* Right Light Pill Button (Contacts — matches Paréa reference, zero admin mention) */}
          <button
            onClick={() => jumpTo('socials')}
            className="rounded-full bg-[#F4FAF5] px-6 py-3 text-[13px] font-semibold text-[#051F20] shadow-sm transition hover:bg-white"
          >
            контакты
          </button>
        </header>

        {/* Center Display Wordmark & CTA over Panoramic Sky */}
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 pt-8 pb-32 text-center sm:pt-10 sm:pb-44">
          <h1 className="text-[64px] font-extrabold leading-none tracking-[-0.045em] text-[#051F20] sm:text-[92px]">
            indigo
          </h1>
          <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-[#0B2B26] sm:text-base">
            школа в бишкеке, где учёба звучит как жизнь, а не скучный учебник.
            <br />
            сильные учителя, живое комьюнити и рост каждый день.
          </p>
          <button
            onClick={() => jumpTo('news')}
            className="mt-5 rounded-full bg-[#051F20] px-7 py-3.5 text-xs font-semibold tracking-wide text-[#DAF1DE] shadow-xl shadow-[#051F20]/25 transition hover:bg-[#163832] sm:text-sm"
          >
            новости и жизнь школы →
          </button>
        </div>

        {/* Bottom Signature Staggered Two-Line Statement (Paréa style) */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-2 pb-12">
          <div className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-5xl lg:text-[52px]">
            <div>
              <span className="text-[#8EB69B]">учим</span>{' '}
              <span className="text-[#DAF1DE]">думать.</span>
            </div>
            <div className="mt-1 sm:pl-24 md:pl-36">
              <span className="text-[#DAF1DE]">растём вместе</span>{' '}
              <span className="text-[#8EB69B]">в indigo.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BLOCK 2: ROUNDED LIGHT SHEET — PILL DIRECTORY + SCHOOL STATEMENT
          (Exact match to Paréa's "язык на уровне носителя" + "больше чем школа")
      ===================================================================== */}
      <section className="rounded-[36px] bg-[#EEF7F0] py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 lg:grid-cols-12">
          {/* Left White Pill Card */}
          <div className="rounded-[28px] bg-white p-7 shadow-xs sm:p-10 lg:col-span-8">
            <h2 className="text-2xl font-bold tracking-[-0.025em] text-[#051F20] sm:text-[28px]">
              школа, в которой хочется учиться и развиваться
            </h2>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <button
                onClick={() => jumpTo('news')}
                className="rounded-full bg-[#051F20] px-5 py-2.5 text-xs font-medium text-[#DAF1DE] transition hover:bg-[#163832] sm:text-sm"
              >
                новости кампуса
              </button>
              <button
                onClick={() => jumpTo('teachers')}
                className="rounded-full bg-[#8EB69B]/45 px-5 py-2.5 text-xs font-medium text-[#051F20] transition hover:bg-[#8EB69B]/70 sm:text-sm"
              >
                учительский состав
              </button>
              <button
                onClick={() => {
                  setNewsCategory('Олимпиады');
                  jumpTo('news');
                }}
                className="rounded-full border border-[#163832]/30 bg-white px-5 py-2.5 text-xs font-medium text-[#051F20] transition hover:border-[#051F20] sm:text-sm"
              >
                олимпиадная сборная
              </button>
              <button
                onClick={() => {
                  setTeacherDept('Иностранные языки');
                  jumpTo('teachers');
                }}
                className="rounded-full border border-[#163832]/30 bg-white px-5 py-2.5 text-xs font-medium text-[#051F20] transition hover:border-[#051F20] sm:text-sm"
              >
                английский и дебаты
              </button>
              <button
                onClick={() => {
                  setTeacherDept('Точные науки (STEM)');
                  jumpTo('teachers');
                }}
                className="rounded-full bg-[#051F20] px-5 py-2.5 text-xs font-medium text-[#DAF1DE] transition hover:bg-[#163832] sm:text-sm"
              >
                математика и программирование
              </button>
              <button
                onClick={() => {
                  setFeedbackTab('idea');
                  jumpTo('suggestions');
                }}
                className="rounded-full bg-[#8EB69B]/45 px-5 py-2.5 text-xs font-medium text-[#051F20] transition hover:bg-[#8EB69B]/70 sm:text-sm"
              >
                советы как улучшить школу
              </button>
              <button
                onClick={() => {
                  setFeedbackTab('complaint');
                  jumpTo('suggestions');
                }}
                className="rounded-full bg-[#051F20] px-5 py-2.5 text-xs font-medium text-[#DAF1DE] transition hover:bg-[#163832] sm:text-sm"
              >
                анонимный бланк жалоб
              </button>
              <button
                onClick={() => jumpTo('socials')}
                className="rounded-full bg-[#8EB69B]/45 px-5 py-2.5 text-xs font-medium text-[#051F20] transition hover:bg-[#8EB69B]/70 sm:text-sm"
              >
                школьные медиа и соцсети
              </button>
              <button
                onClick={() => jumpTo('iqa')}
                className="rounded-full border border-[#163832]/30 bg-white px-5 py-2.5 text-xs font-medium text-[#051F20] transition hover:border-[#051F20] sm:text-sm"
              >
                архив past papers of iqa
              </button>
              <button
                onClick={() => jumpTo('news')}
                className="rounded-full bg-[#051F20] px-5 py-2.5 text-xs font-medium text-[#DAF1DE] transition hover:bg-[#163832] sm:text-sm"
              >
                события и ивенты бишкека
              </button>
              <button
                onClick={() => {
                  setTeacherDept('Гуманитарные науки');
                  jumpTo('teachers');
                }}
                className="rounded-full bg-[#0B2B26] px-5 py-2.5 text-xs font-medium text-[#DAF1DE] transition hover:bg-[#163832] sm:text-sm"
              >
                языки, культура и история
              </button>
              <button
                onClick={() => jumpTo('suggestions')}
                className="rounded-full bg-[#8EB69B]/45 px-5 py-2.5 text-xs font-medium text-[#051F20] transition hover:bg-[#8EB69B]/70 sm:text-sm"
              >
                школьные клубы и ивенты
              </button>
            </div>
          </div>

          {/* Right Deep Forest Card */}
          <div className="flex flex-col justify-between rounded-[28px] bg-[#0B2B26] p-7 text-[#DAF1DE] sm:p-9 lg:col-span-4">
            <div>
              <h2 className="text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">
                <span className="text-[#8EB69B]">indigo west</span> — больше, чем
                просто школа
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[#DAF1DE]/85">
                мы создаём в бишкеке современную школьную среду, где каждый ученик
                чувствует поддержку преподавателей, находит сильное окружение и
                раскрывает свой потенциал.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#8EB69B]">
                актуальные новости кампуса, открытый учительский состав, живое
                комьюнити и реальный голос учеников — ничего лишнего.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#235347] pt-4 text-xs text-[#8EB69B]">
              <span>г. Бишкек • West Campus</span>
              <span className="font-mono text-[#DAF1DE]">2026 / 2027</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BLOCK 3: DARK PINE SECTION (#051F20)
          PART A: НОВОСТИ ШКОЛЫ IN 3 SIGNATURE TALL GRADIENT CARDS
          PART B: PAST PAPERS OF IQA IN THE SIGNATURE LIGHT #DAF1DE FINDER BAR
      ===================================================================== */}
      <section className="bg-[#051F20] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-14 px-5">
          {/* PART A: НОВОСТИ (Matching Paréa's "форматы обучения" 3 tall cards) */}
          <div id="news" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Intro Column */}
            <div className="flex flex-col justify-between lg:col-span-3">
              <div>
                <h2 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-[#DAF1DE] sm:text-4xl">
                  новости
                  <br />
                  кампуса
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-[#8EB69B]">
                  главные события indigo academy west в бишкеке: победы наших
                  сборных на олимпиадах, школьные ивенты и важные объявления
                  кампуса.
                </p>

                {/* Subtle Category Filter Pills */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Все', 'Экзамены IQA', 'Олимпиады', 'Учебная часть'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewsCategory(cat)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                        newsCategory === cat
                          ? 'bg-[#DAF1DE] text-[#051F20]'
                          : 'bg-[#0B2B26] text-[#8EB69B] hover:bg-[#163832] hover:text-[#DAF1DE]'
                      }`}
                    >
                      {cat.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 hidden text-xs text-[#8EB69B]/70 lg:block">
                нажмите на любую карточку, чтобы прочитать полный текст новости или
                приказа учебной части.
              </div>
            </div>

            {/* Right 3 Tall Gradient Cards (Exact Paréa Card Anatomy) */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:col-span-9">
              {filteredNews.slice(0, 3).map((item, idx) => {
                const isCenter = idx === 1;
                return (
                  <article
                    key={item.id}
                    onClick={() => setReadingNews(item)}
                    className={`group relative flex min-h-[390px] cursor-pointer flex-col justify-between overflow-hidden rounded-[26px] p-6 transition duration-300 hover:-translate-y-1 ${
                      isCenter ? 'indigo-tall-card' : 'indigo-tall-card-alt'
                    }`}
                  >
                    {/* Top Editorial Text */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#163832]">
                        <span className="lowercase">{item.category}</span>
                        <span className="font-mono">{item.date}</span>
                      </div>
                      <h3 className="mt-3 text-xl font-extrabold leading-snug tracking-[-0.02em] text-[#051F20]">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed text-[#0B2B26]/90 sm:text-[13px]">
                        {item.summary}
                      </p>
                    </div>

                    {/* Subtle Mountain & Academy Silhouette Overlay at Bottom */}
                    <svg
                      viewBox="0 0 320 120"
                      preserveAspectRatio="none"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full opacity-45"
                    >
                      <path
                        d="M0,120 L0,76 L32,54 L66,68 L108,34 L152,60 L196,28 L244,58 L286,40 L320,62 L320,120 Z"
                        fill="#051F20"
                      />
                    </svg>

                    {/* Signature Bottom Pill CTA */}
                    <div className="relative z-10 pt-10">
                      <button
                        type="button"
                        className={`w-full rounded-full py-2.5 text-xs font-semibold transition ${
                          isCenter
                            ? 'bg-[#DAF1DE] text-[#051F20] group-hover:bg-white'
                            : 'border border-[#DAF1DE]/70 bg-[#051F20]/40 text-[#DAF1DE] backdrop-blur-xs group-hover:bg-[#DAF1DE] group-hover:text-[#051F20]'
                        }`}
                      >
                        читать подробнее →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* PART B: PAST PAPERS OF IQA — EXACT PARÉA LIGHT ROUNDED 4-DROPDOWN CARD */}
          <div id="iqa" className="rounded-[28px] bg-[#DAF1DE] p-7 text-[#051F20] sm:p-10">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#235347]">
                  indigo quiz assessment • официальный архив
                </div>
                <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-[#051F20] sm:text-3xl">
                  быстрый поиск: past papers of iqa
                </h2>
              </div>
              <span className="font-mono text-xs font-semibold text-[#163832]">
                найдено вариантов: {filteredPapers.length}
              </span>
            </div>

            {/* 4 Clean White Selectors (Exact Paréa Form Row) */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-[#163832]">
                  предмет экзамена iqa
                </label>
                <select
                  value={iqaSubject}
                  onChange={(e) => {
                    setIqaSubject(e.target.value);
                    setShowAllPapers(true);
                  }}
                  className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#051F20] outline-none ring-1 ring-[#8EB69B]/50 focus:ring-[#051F20]"
                >
                  <option>Все предметы</option>
                  <option>Математика</option>
                  <option>Английский язык</option>
                  <option>Логика (IQ)</option>
                  <option>Информатика</option>
                  <option>Физика</option>
                  <option>Кыргызский / Русский язык</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#163832]">
                  твоя параллель (класс)
                </label>
                <select
                  value={iqaGrade}
                  onChange={(e) => setIqaGrade(e.target.value)}
                  className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#051F20] outline-none ring-1 ring-[#8EB69B]/50 focus:ring-[#051F20]"
                >
                  <option>Все классы</option>
                  <option>6 класс</option>
                  <option>7 класс</option>
                  <option>8 класс</option>
                  <option>9 класс</option>
                  <option>10 класс</option>
                  <option>11 класс</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#163832]">
                  четверть или срез
                </label>
                <select
                  value={iqaQuarter}
                  onChange={(e) => setIqaQuarter(e.target.value)}
                  className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#051F20] outline-none ring-1 ring-[#8EB69B]/50 focus:ring-[#051F20]"
                >
                  <option>Все четверти</option>
                  <option>I четверть</option>
                  <option>IV четверть</option>
                  <option>Годовой срез</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#163832]">
                  что скачать
                </label>
                <select
                  value={iqaFileMode}
                  onChange={(e) => setIqaFileMode(e.target.value)}
                  className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#051F20] outline-none ring-1 ring-[#8EB69B]/50 focus:ring-[#051F20]"
                >
                  <option>Бланк PDF + Ключи</option>
                  <option>Только бланк для печати</option>
                  <option>Ключи и разбор решений</option>
                </select>
              </div>
            </div>

            {/* Action Pill Row */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAllPapers((v) => !v)}
                className="rounded-full bg-[#051F20] px-7 py-3 text-xs font-semibold text-[#DAF1DE] transition hover:bg-[#163832] sm:text-sm"
              >
                {showAllPapers
                  ? `свернуть список вариантов (${filteredPapers.length})`
                  : `показать варианты past papers (${filteredPapers.length}) →`}
              </button>
              {(iqaSubject !== 'Все предметы' ||
                iqaGrade !== 'Все классы' ||
                iqaQuarter !== 'Все четверти') && (
                <button
                  onClick={() => {
                    setIqaSubject('Все предметы');
                    setIqaGrade('Все классы');
                    setIqaQuarter('Все четверти');
                  }}
                  className="rounded-full border border-[#163832]/30 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#051F20] hover:bg-white"
                >
                  сбросить фильтры
                </button>
              )}
            </div>

            {/* Matched Past Papers Clean List */}
            {showAllPapers && (
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredPapers.length === 0 ? (
                  <div className="col-span-2 rounded-2xl bg-white/80 p-6 text-center text-sm text-[#163832]">
                    По выбранным фильтрам вариантов пока нет — попробуйте выбрать
                    «Все классы» или другой предмет.
                  </div>
                ) : (
                  filteredPapers.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-[#8EB69B]/40 transition hover:ring-[#235347]"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full bg-[#051F20] px-3 py-1 font-mono text-[11px] font-semibold text-[#DAF1DE]">
                            {p.code}
                          </span>
                          <span className="text-xs font-semibold text-[#235347]">
                            {p.grade} класс • {p.quarter} ({p.year})
                          </span>
                        </div>
                        <h3 className="mt-3 text-base font-bold text-[#051F20]">
                          {p.subject}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-[#163832]">
                          {p.topics}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[#DAF1DE] pt-3.5">
                        <span className="font-mono text-[11px] text-[#235347]">
                          {p.durationMin} мин • {p.questionsCount} заданий • {p.fileSize}
                        </span>
                        <div className="flex gap-2">
                          <a
                            href="/api/papers/IQA-MATH-G10-2026-Q1/sheet?key=0"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-[#051F20] px-3.5 py-1.5 text-[11px] font-semibold text-[#DAF1DE] hover:bg-[#163832]"
                          >
                            бланк pdf
                          </a>
                          <a
                            href="/api/papers/IQA-MATH-G10-2026-Q1/sheet?key=1"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-[#8EB69B]/45 px-3.5 py-1.5 text-[11px] font-semibold text-[#051F20] hover:bg-[#8EB69B]/75"
                          >
                            ключи →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          BLOCK 4: ROUNDED LIGHT SHEET — УЧИТЕЛЬСКИЙ СОСТАВ + СОВЕТЫ ШКОЛЕ
      ===================================================================== */}
      <section className="rounded-[36px] bg-[#EEF7F0] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-16 px-5">
          {/* УЧИТЕЛЬСКИЙ СОСТАВ */}
          <div id="teachers">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#235347]">
                  кафедры и наставники
                </div>
                <h2 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#051F20] sm:text-4xl">
                  учительский состав indigo west
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Все кафедры',
                  'Точные науки (STEM)',
                  'Иностранные языки',
                  'Гуманитарные науки',
                ].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setTeacherDept(dept)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      teacherDept === dept
                        ? 'bg-[#051F20] text-[#DAF1DE]'
                        : 'bg-white text-[#051F20] ring-1 ring-[#8EB69B]/50 hover:bg-[#DAF1DE]'
                    }`}
                  >
                    {dept.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((t) => {
                const initials = t.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('');
                return (
                  <div
                    key={t.id}
                    className="flex flex-col justify-between rounded-[26px] bg-white p-6 ring-1 ring-[#8EB69B]/35 transition hover:-translate-y-0.5 hover:ring-[#235347]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B2B26] font-mono text-sm font-bold text-[#DAF1DE]">
                          {initials}
                        </div>
                        <span className="rounded-full bg-[#DAF1DE] px-3 py-1 font-mono text-[11px] font-semibold text-[#051F20]">
                          {t.room} • стаж {t.experience}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold leading-snug text-[#051F20]">
                        {t.name}
                      </h3>
                      <div className="mt-1 text-xs font-semibold text-[#235347]">
                        {t.subject}
                      </div>
                      <p className="mt-2.5 text-xs leading-relaxed text-[#163832]">
                        {t.notes}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-[#EEF7F0] pt-3.5 text-[11px] text-[#235347]">
                      {t.education}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* СОВЕТЫ И АНОНИМНЫЙ БЛАНК ЖАЛОБ */}
          <div id="suggestions" className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Left White Rounded Card with Switcher: Anonymous Complaint vs Public Suggestion */}
            <div className="rounded-[28px] bg-white p-7 shadow-xs sm:p-9 lg:col-span-5">
              {/* Mode Switcher Pills */}
              <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#EEF7F0] p-1">
                <button
                  type="button"
                  onClick={() => setFeedbackTab('complaint')}
                  className={`rounded-full py-2.5 text-xs font-semibold transition ${
                    feedbackTab === 'complaint'
                      ? 'bg-[#051F20] text-[#DAF1DE]'
                      : 'text-[#163832] hover:text-[#051F20]'
                  }`}
                >
                  анонимная жалоба
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackTab('idea')}
                  className={`rounded-full py-2.5 text-xs font-semibold transition ${
                    feedbackTab === 'idea'
                      ? 'bg-[#051F20] text-[#DAF1DE]'
                      : 'text-[#163832] hover:text-[#051F20]'
                  }`}
                >
                  совет школе
                </button>
              </div>

              {feedbackTab === 'complaint' ? (
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#235347]">
                    строго конфиденциально • без имени
                  </div>
                  <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-[#051F20]">
                    анонимный бланк жалоб
                  </h2>
                  <div className="mt-3 rounded-2xl bg-[#DAF1DE]/75 p-3.5 text-xs leading-relaxed text-[#0B2B26]">
                    <strong>100% анонимность:</strong> мы не спрашиваем имя, номер
                    телефона или класс. Жалоба <strong>не публикуется</strong> на
                    сайте и видна только руководству школы.
                  </div>

                  <form onSubmit={handleComplaintSubmit} className="mt-4 space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-[#163832]">
                        по какому вопросу обращение
                      </label>
                      <select
                        value={complaintTopic}
                        onChange={(e) => setComplaintTopic(e.target.value)}
                        className="mt-1.5 w-full rounded-xl bg-[#EEF7F0] px-3.5 py-2.5 text-xs font-semibold text-[#051F20] outline-none"
                      >
                        <option>Учебный процесс и оценивание</option>
                        <option>Отношения в классе / Конфликт / Буллинг</option>
                        <option>Столовая, питание и санитария</option>
                        <option>Кабинеты, техника и безопасность</option>
                        <option>Отношение сотрудников или учителей</option>
                        <option>Другое (конфиденциально)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#163832]">
                          срочность
                        </label>
                        <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl bg-[#EEF7F0] p-1">
                          {(['Обычное', 'Срочное'] as const).map((u) => (
                            <button
                              type="button"
                              key={u}
                              onClick={() => setComplaintUrgency(u)}
                              className={`rounded-lg py-1.5 text-[11px] font-semibold transition ${
                                complaintUrgency === u
                                  ? 'bg-[#051F20] text-[#DAF1DE]'
                                  : 'text-[#163832]'
                              }`}
                            >
                              {u.toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#163832]">
                          где произошло (необяз.)
                        </label>
                        <input
                          type="text"
                          value={complaintLocation}
                          onChange={(e) => setComplaintLocation(e.target.value)}
                          placeholder="напр.: столовая / 2 этаж"
                          className="mt-1.5 w-full rounded-xl bg-[#EEF7F0] px-3 py-2 text-xs text-[#051F20] placeholder-[#235347]/60 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#163832]">
                        опишите ситуацию подробно *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={complaintDetails}
                        onChange={(e) => setComplaintDetails(e.target.value)}
                        placeholder="Расскажите, что произошло и что нужно исправить. Личные данные указывать не нужно..."
                        className="mt-1.5 w-full rounded-xl bg-[#EEF7F0] p-4 text-sm text-[#051F20] placeholder-[#235347]/60 outline-none focus:ring-1 focus:ring-[#051F20]"
                      />
                    </div>

                    {lastComplaintTicket && (
                      <div className="rounded-2xl bg-[#0B2B26] p-4 text-xs leading-relaxed text-[#DAF1DE]">
                        <div className="font-bold text-[#8EB69B]">
                          обращение отправлено анонимно
                        </div>
                        <div className="mt-1">
                          Номер вашего закрытого бланка:{' '}
                          <span className="font-mono font-bold text-white">
                            {lastComplaintTicket}
                          </span>
                          . Сообщение скрыто от других учеников и передано напрямую
                          дирекции.
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#051F20] py-3.5 text-xs font-semibold text-[#DAF1DE] transition hover:bg-[#163832] sm:text-sm"
                    >
                      отправить жалобу анонимно →
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#235347]">
                    открытая доска инициатив
                  </div>
                  <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-[#051F20]">
                    советы: как улучшить нашу школу
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#163832]">
                    напиши идею по учёбе, клубам, столовой или кампусу — лучшие
                    предложения появляются на доске справа с ответом школы.
                  </p>

                  <form onSubmit={handleIdeaSubmit} className="mt-5 space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={ideaRole}
                        onChange={(e) => setIdeaRole(e.target.value)}
                        className="rounded-xl bg-[#EEF7F0] px-3.5 py-2.5 text-xs font-semibold text-[#051F20] outline-none"
                      >
                        <option>Ученик</option>
                        <option>Учитель</option>
                        <option>Родитель</option>
                        <option>Анонимно</option>
                      </select>
                      <input
                        type="text"
                        value={ideaAuthor}
                        onChange={(e) => setIdeaAuthor(e.target.value)}
                        placeholder="имя и класс (необяз.)"
                        className="rounded-xl bg-[#EEF7F0] px-3.5 py-2.5 text-xs text-[#051F20] placeholder-[#235347]/60 outline-none"
                      />
                    </div>

                    <select
                      value={ideaCategory}
                      onChange={(e) =>
                        setIdeaCategory(e.target.value as DesignSuggestion['category'])
                      }
                      className="w-full rounded-xl bg-[#EEF7F0] px-3.5 py-2.5 text-xs font-semibold text-[#051F20] outline-none"
                    >
                      <option>Учебный процесс</option>
                      <option>Инфраструктура</option>
                      <option>Столовая</option>
                      <option>Внеклассная жизнь</option>
                    </select>

                    <input
                      type="text"
                      required
                      value={ideaTitle}
                      onChange={(e) => setIdeaTitle(e.target.value)}
                      placeholder="краткая суть предложения *"
                      className="w-full rounded-xl bg-[#EEF7F0] px-4 py-3 text-sm text-[#051F20] placeholder-[#235347]/60 outline-none focus:ring-1 focus:ring-[#051F20]"
                    />

                    <textarea
                      rows={3}
                      required
                      value={ideaText}
                      onChange={(e) => setIdeaText(e.target.value)}
                      placeholder="расскажи подробнее, что именно улучшить в indigo academy west..."
                      className="w-full rounded-xl bg-[#EEF7F0] p-4 text-sm text-[#051F20] placeholder-[#235347]/60 outline-none focus:ring-1 focus:ring-[#051F20]"
                    />

                    {ideaSuccess && (
                      <div className="rounded-xl bg-[#DAF1DE] px-4 py-2.5 text-xs font-semibold text-[#051F20]">
                        спасибо! твой совет добавлен на доску инициатив.
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#051F20] py-3.5 text-xs font-semibold text-[#DAF1DE] transition hover:bg-[#163832] sm:text-sm"
                    >
                      отправить предложение →
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Deep Forest Transparency Board */}
            <div className="rounded-[28px] bg-[#0B2B26] p-7 text-[#DAF1DE] sm:p-9 lg:col-span-7">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-[-0.02em]">
                  <span className="text-[#8EB69B]">предложения учеников</span> и
                  ответы школы
                </h3>
                <span className="rounded-full bg-[#163832] px-3 py-1 font-mono text-xs text-[#DAF1DE]">
                  {suggestionsList.length}{' '}
                  {suggestionsList.length === 1
                    ? 'идея'
                    : suggestionsList.length >= 2 && suggestionsList.length <= 4
                    ? 'идеи'
                    : 'идей'}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {suggestionsList.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl bg-[#163832]/75 p-5 ring-1 ring-[#235347]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[#8EB69B]">
                        {s.date} • {s.author} • {s.category.toLowerCase()}
                      </span>
                      <span
                        className={`rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                          s.status === 'Выполнено'
                            ? 'bg-[#8EB69B] text-[#051F20]'
                            : s.status === 'Принято в работу'
                            ? 'bg-[#DAF1DE] text-[#051F20]'
                            : 'bg-[#051F20] text-[#DAF1DE]'
                        }`}
                      >
                        {s.status.toLowerCase()}
                      </span>
                    </div>
                    <h4 className="mt-2 text-base font-bold text-white">
                      {s.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-[#DAF1DE]/80 sm:text-sm">
                      {s.text}
                    </p>
                    {s.reply && (
                      <div className="mt-3 rounded-xl bg-[#051F20]/70 px-4 py-2.5 text-xs leading-relaxed text-[#DAF1DE]">
                        <span className="font-semibold text-[#8EB69B]">
                          ответ администрации:{' '}
                        </span>
                        {s.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BLOCK 5: СОЦСЕТИ И FOOTER (#051F20)
      ===================================================================== */}
      <footer id="socials" className="bg-[#051F20] pt-14 pb-12 text-[#DAF1DE]">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#8EB69B]">
                всегда на связи • г. бишкек
              </div>
              <h2 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#DAF1DE]">
                соцсети и контакты indigo west
              </h2>
            </div>
            <div className="font-mono text-xs text-[#8EB69B]">
              +996 (555) 70-80-90 • west@indigoacademy.kg
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCHOOL_SOCIALS.map((soc) => (
              <a
                key={soc.id}
                href={soc.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col justify-between rounded-[22px] bg-[#0B2B26] p-6 ring-1 ring-[#235347]/70 transition hover:bg-[#163832] hover:ring-[#8EB69B]"
              >
                <div>
                  <div className="text-[11px] font-medium text-[#8EB69B]">
                    {soc.scheduleOrNote.toLowerCase()}
                  </div>
                  <h3 className="mt-1.5 text-lg font-bold text-[#DAF1DE]">
                    {soc.name}
                  </h3>
                  <div className="mt-0.5 font-mono text-xs text-[#8EB69B]">
                    {soc.handle}
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#DAF1DE]/75">
                    {soc.purpose}
                  </p>
                </div>
                <div className="mt-5 text-xs font-semibold text-[#8EB69B] transition group-hover:text-[#DAF1DE]">
                  открыть →
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#163832] pt-6 text-xs text-[#8EB69B] sm:flex-row">
            <div>
              © {new Date().getFullYear()} indigo academy west (г. бишкек). все
              права защищены.
            </div>
            <div className="font-mono text-xs text-[#8EB69B]/80">
              г. бишкек • западный кампус (west campus)
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          ARTICLE READER MODAL (FOR CLICKED NEWS CARDS)
      ===================================================================== */}
      {readingNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#051F20]/80 p-4 backdrop-blur-sm"
          onClick={() => setReadingNews(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[#EEF7F0] p-7 text-[#051F20] sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#051F20] px-3.5 py-1 text-xs font-semibold text-[#DAF1DE]">
                {readingNews.category.toLowerCase()} • {readingNews.date}
              </span>
              <button
                onClick={() => setReadingNews(null)}
                className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#051F20] ring-1 ring-[#8EB69B]/50 hover:bg-[#DAF1DE]"
              >
                закрыть ✕
              </button>
            </div>

            <h3 className="mt-5 text-2xl font-bold leading-snug text-[#051F20]">
              {readingNews.title}
            </h3>
            <p className="mt-4 rounded-2xl bg-[#DAF1DE] p-4 text-sm font-medium text-[#0B2B26]">
              {readingNews.summary}
            </p>
            <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-[#163832]">
              {readingNews.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

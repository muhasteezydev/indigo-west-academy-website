import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from './security.ts';
import type {
  NewsItem,
  Teacher,
  IQAPaper,
  Suggestion,
  SocialLink,
} from '../src/types/domain.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.INDIGO_DB_PATH || join(DATA_DIR, 'indigo_west.db');

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for high concurrency & integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT NOT NULL,
    author_name TEXT NOT NULL,
    read_time_minutes INTEGER NOT NULL DEFAULT 3,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    published_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    department TEXT NOT NULL,
    role_title TEXT NOT NULL,
    bio TEXT NOT NULL,
    achievements_json TEXT NOT NULL,
    education TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    quote TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS iqa_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade INTEGER NOT NULL,
    year INTEGER NOT NULL,
    term TEXT NOT NULL,
    paper_code TEXT UNIQUE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    topics_json TEXT NOT NULL,
    has_answer_key INTEGER NOT NULL DEFAULT 1,
    sample_questions_json TEXT NOT NULL,
    file_url TEXT NOT NULL,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    grade_label TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    admin_reply TEXT NOT NULL DEFAULT '',
    upvotes INTEGER NOT NULL DEFAULT 1,
    is_public INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    handle TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL,
    subscribers_label TEXT NOT NULL,
    accent_color TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
  );
`);

function seedDatabaseIfEmpty() {
  const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get() as { c: number };
  if (adminCount.c === 0) {
    const defaultPassword = process.env.INDIGO_ADMIN_PASSWORD || 'indigo2026';
    db.prepare(
      `INSERT INTO admins (username, display_name, password_hash, role, created_at)
       VALUES (?, ?, ?, 'admin', ?)`
    ).run(
      'admin',
      'Администрация Indigo West',
      hashPassword(defaultPassword),
      new Date().toISOString()
    );
  }

  const newsCount = db.prepare('SELECT COUNT(*) as c FROM news').get() as { c: number };
  if (newsCount.c === 0) {
    const insertNews = db.prepare(`
      INSERT INTO news (title, category, summary, content, image_url, author_name, read_time_minutes, is_pinned, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialNews = [
      {
        title: 'Утверждён регламент и график зимней сессии IQA (Indigo Quiz Assessment) 2026',
        category: 'IQA Экзамены',
        summary:
          'Стартует общешкольное тестирование IQA для 5–11 классов. В архиве сайта уже доступны новые демо-варианты и спецификации по Математике, Английскому языку и Логике.',
        content:
          'Академический совет Indigo West Academy опубликовал официальное расписание среза знаний IQA (Indigo Quiz Assessment) за II четверть.\n\nОсновные изменения этого семестра:\n1. Для 9–11 классов в блок Mathematics добавлены задачи формата SAT Math и республиканской олимпиады.\n2. Блок Logic & IQ теперь оценивается с повышающим коэффициентом при отборе в олимпиадную сборную школы.\n3. Все тренировочные Past Papers прошлых лет с разборами и ключами выложены в открытом доступе в разделе «IQA Past Papers» на нашем портале.',
        image_url:
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fm=webp&fit=crop&w=1200&q=85',
        author_name: 'Академический департамент',
        read_time_minutes: 4,
        is_pinned: 1,
        published_at: '2026-11-15T10:00:00Z',
      },
      {
        title: 'Сборная Indigo West Academy завоевала 4 золотые медали на городской STEM-олимпиаде Бишкека',
        category: 'Олимпиады',
        summary:
          'Наши ученики 8–11 классов заняли первые места по информатике, физике и прикладной математике среди 42 школ столицы.',
        content:
          'Команда западного кампуса Indigo West Academy показала лучший результат за всю историю участия в городском этапе STEM-олимпиады в Бишкеке.\n\nЗолотые медали в копилку школы принесли ученики 10 и 11 классов в секциях «Алгоритмическое программирование (C++ / Python)» и «Экспериментальная физика». Поздравляем ребят и наставников кафедры STEM!',
        image_url:
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fm=webp&fit=crop&w=1200&q=85',
        author_name: 'Кафедра STEM & Олимпиад',
        read_time_minutes: 3,
        is_pinned: 0,
        published_at: '2026-11-12T14:30:00Z',
      },
      {
        title: 'Открытие нового коворкинга и AI & Robotics Lab в кампусе Indigo West',
        category: 'Кампус',
        summary:
          'По инициативе школьного парламента на 3-м этаже открылась зона для проектной работы с 3D-принтерами, наборами Arduino и быстрым Wi-Fi 6.',
        content:
          'Эта идея набрала больше всего голосов в разделе «Советы как улучшить школу» в прошлом семестре — и теперь она реализована!\n\nНовая лаборатория открыта каждый будний день с 15:00 до 19:00 для всех учеников 6–11 классов, работающих над собственными стартапами, роботами и подготовкой к хакатонам.',
        image_url:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fm=webp&fit=crop&w=1200&q=85',
        author_name: 'Дирекция кампуса',
        read_time_minutes: 3,
        is_pinned: 0,
        published_at: '2026-11-08T09:15:00Z',
      },
      {
        title: 'Indigo Debate Cup & IELTS Mock: средний балл выпускников достиг 7.5',
        category: 'Академия',
        summary:
          'Завершился осенний турнир по парламентским дебатам на английском языке в формате British Parliamentary.',
        content:
          'В турнире приняли участие 16 команд из Indigo West Academy. Судейская коллегия отметила высокий уровень аргументации и академического английского. Лучшие спикеры представят нашу школу на центральноазиатском турнире в следующем месяце.',
        image_url:
          'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fm=webp&fit=crop&w=1200&q=85',
        author_name: 'Кафедра Языков & IELTS',
        read_time_minutes: 2,
        is_pinned: 0,
        published_at: '2026-11-03T16:00:00Z',
      },
    ];

    for (const item of initialNews) {
      insertNews.run(
        item.title,
        item.category,
        item.summary,
        item.content,
        item.image_url,
        item.author_name,
        item.read_time_minutes,
        item.is_pinned,
        item.published_at
      );
    }
  }

  const teacherCount = db.prepare('SELECT COUNT(*) as c FROM teachers').get() as { c: number };
  if (teacherCount.c === 0) {
    const insertTeacher = db.prepare(`
      INSERT INTO teachers (full_name, subject, department, role_title, bio, achievements_json, education, photo_url, experience_years, quote)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialTeachers = [
      {
        full_name: 'Азамат Сатыбалдиев',
        subject: 'Высшая и олимпиадная математика',
        department: 'STEM & Олимпиады',
        role_title: 'Руководитель кафедры математики & Главный координатор IQA Math',
        bio: 'Готовит учеников Indigo West Academy к национальным и международным математическим олимпиадам, а также к секции SAT Math (800/800). Автор сборников задач IQA повышенной сложности.',
        achievements: [
          'Тренер 14 призёров Республиканской олимпиады КР',
          'Средний балл учеников по SAT Math — 770',
          'Отличник образования КР',
        ],
        education: 'КРСУ / МФТИ (Прикладная математика и физика)',
        photo_url:
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fm=webp&fit=crop&w=800&q=80',
        experience_years: 12,
        quote: 'Математика в Indigo — это не зубрёжка формул, а искусство видеть красивую структуру в любой сложной задаче.',
      },
      {
        full_name: 'Айжан Токтогулова',
        subject: 'Academic English & IELTS / SAT Verbal',
        department: 'Языки & IELTS/SAT',
        role_title: 'Глава департамента иностранных языков',
        bio: 'Сертифицированный тренер CELTA и эксперт по подготовке к IELTS Academic. Ведёт школьный клуб дебатов British Parliamentary и курирует языковой модуль IQA.',
        achievements: [
          'IELTS 8.5 (C2 Proficiency)',
          'CELTA & TESOL Certified (Cambridge)',
          'Более 90 выпускников поступили в топ-вузы мира',
        ],
        education: 'АУЦА (AUCA) & University of Manchester (MA in TESOL)',
        photo_url:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fm=webp&fit=crop&w=800&q=80',
        experience_years: 9,
        quote: 'Свободный английский открывает ученикам из Бишкека двери любого университета планеты.',
      },
      {
        full_name: 'Тимур Исаков',
        subject: 'Информатика, Алгоритмы (C++ / Python) & AI',
        department: 'STEM & Олимпиады',
        role_title: 'Ментор олимпиадной информатики (ICPC / IOI Track)',
        bio: 'Финалист ICPC, разработчик и преподаватель спортивного программирования. Руководит лабораторией робототехники и алгоритмическим треком Indigo West Academy.',
        achievements: [
          'Финалист NEERC ICPC',
          'Наставник победителей Kyrgyz IOI Selection',
          'Основатель Indigo Coding Club',
        ],
        education: 'АУЦА (Программная инженерия)',
        photo_url:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fm=webp&fit=crop&w=800&q=80',
        experience_years: 7,
        quote: 'Когда ты понимаешь алгоритмы и структуры данных, ты перестаёшь быть просто пользователем технологий — ты становишься их создателем.',
      },
      {
        full_name: 'Елена Соколова',
        subject: 'Экспериментальная и теоретическая физика',
        department: 'STEM & Олимпиады',
        role_title: 'Ведущий преподаватель физики и астрофизики',
        bio: 'Превращает законы механики, электродинамики и квантовой физики в наглядные лабораторные эксперименты. Разработчик секции Physics в тестах IQA.',
        achievements: [
          'Автор лабораторного практикума Indigo STEM',
          'Победитель конкурса учителей STEM Центральной Азии',
          '8 призёров городских олимпиад по физике',
        ],
        education: 'КНУ им. Ж. Баласагына (Физический факультет, магистратура)',
        photo_url:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fm=webp&fit=crop&w=800&q=80',
        experience_years: 14,
        quote: 'Физика начинается с вопроса «Почему?» и заканчивается точным расчётом и живым экспериментом.',
      },
      {
        full_name: 'Нурбек Осмонов',
        subject: 'Логика, Критическое мышление и Мировая история',
        department: 'Гуманитарные науки',
        role_title: 'Координатор модуля Logic & IQ в экзаменах IQA',
        bio: 'Специалист по формальной логике, теории аргументации и истории цивилизаций. Помогает ученикам развивать нестандартное аналитическое мышление.',
        achievements: [
          'Разработчик базы из 500+ задач IQA Logic',
          'Тренер школьной лиги «Что? Где? Когда?» и Jeopardy',
          'Лучший куратор года по голосованию учеников',
        ],
        education: 'КРСУ (Философия и исторические науки)',
        photo_url:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fm=webp&fit=crop&w=800&q=80',
        experience_years: 8,
        quote: 'Сильный ум отличается не объёмом заученных фактов, а способностью находить связь там, где другие видят хаос.',
      },
      {
        full_name: 'Гульнара Кадырова',
        subject: 'Кыргызский и Русский язык и литература',
        department: 'Начальная и средняя школа',
        role_title: 'Руководитель методического объединения 5–8 классов',
        bio: 'Влюбляет учеников в культуру слова, ораторское мастерство и академическое эссе на кыргызском и русском языках. Проводит знаменитую неделю Kyrgyz Language Week.',
        achievements: [
          'Организатор фестиваля Indigo KL Week',
          'Автор методики подготовки к ОРТ (Аналогии и Чтение)',
          'Почётная грамота Министерства образования КР',
        ],
        education: 'БГУ им. К. Карасаева (Филология)',
        photo_url:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fm=webp&fit=crop&w=800&q=80',
        experience_years: 15,
        quote: 'Родной язык и мировая литература формируют характер, эмпатию и масштаб личности.',
      },
    ];

    for (const t of initialTeachers) {
      insertTeacher.run(
        t.full_name,
        t.subject,
        t.department,
        t.role_title,
        t.bio,
        JSON.stringify(t.achievements),
        t.education,
        t.photo_url,
        t.experience_years,
        t.quote
      );
    }
  }

  const papersCount = db.prepare('SELECT COUNT(*) as c FROM iqa_papers').get() as { c: number };
  if (papersCount.c === 0) {
    const insertPaper = db.prepare(`
      INSERT INTO iqa_papers (
        title, subject, grade, year, term, paper_code,
        duration_minutes, max_score, topics_json, has_answer_key,
        sample_questions_json, file_url, download_count, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialPapers = [
      {
        title: 'IQA Mathematics — Алгебра, Функции и Олимпиадная геометрия',
        subject: 'Mathematics',
        grade: 10,
        year: 2026,
        term: 'Quarter 1',
        paper_code: 'IQA-MATH-G10-2026-Q1',
        duration_minutes: 90,
        max_score: 100,
        topics: ['Квадратичные функции и параметры', 'Тригонометрия', 'Планиметрия и теорема синусов', 'Комбинаторика'],
        has_answer_key: 1,
        sample_questions: [
          {
            q: 'При каком значении параметра a парабола y = x² - 6x + a касается оси абсцисс (Ox)?',
            options: ['a = 6', 'a = 9', 'a = 3', 'a = -9'],
            answer: 'a = 9',
            explanation: 'Касание оси Ox означает, что дискриминант D = (-6)² - 4·1·a = 36 - 4a равен 0. Отсюда a = 9.',
          },
          {
            q: 'В треугольнике ABC сторона AB = 8√3, а угол C равен 60°. Найдите радиус описанной окружности R.',
            options: ['8', '4√3', '12', '16'],
            answer: '8',
            explanation: 'По теореме синусов: AB / sin(C) = 2R => 8√3 / (√3/2) = 16 = 2R => R = 8.',
          },
        ],
        file_url: '/api/papers/IQA-MATH-G10-2026-Q1/sheet',
        download_count: 342,
        created_at: '2026-10-20T09:00:00Z',
      },
      {
        title: 'IQA English Assessment — Academic Reading, Grammar & Lexical Precision',
        subject: 'English',
        grade: 9,
        year: 2026,
        term: 'Quarter 1',
        paper_code: 'IQA-ENG-G9-2026-Q1',
        duration_minutes: 60,
        max_score: 80,
        topics: ['Conditionals & Mixed Tenses', 'Academic Vocabulary (B2/C1)', 'Critical Reading Comprehension', 'Error Identification'],
        has_answer_key: 1,
        sample_questions: [
          {
            q: 'Choose the correct form: "Had the research team calibrated the sensors earlier, the anomaly ___ detected during phase one."',
            options: ['would be', 'would have been', 'will be', 'had been'],
            answer: 'would have been',
            explanation: 'Inversion of Third Conditional (Had + S + V3) requires "would have + V3" (passive: would have been detected) in the main clause.',
          },
          {
            q: 'Select the closest academic synonym for the word "UBIQUITOUS":',
            options: ['Scarce and fragile', 'Omnipresent / found everywhere', 'Ambiguous', 'Temporary'],
            answer: 'Omnipresent / found everywhere',
            explanation: '"Ubiquitous" means present, appearing, or found everywhere (omnipresent).',
          },
        ],
        file_url: '/api/papers/IQA-ENG-G9-2026-Q1/sheet',
        download_count: 289,
        created_at: '2026-10-18T11:00:00Z',
      },
      {
        title: 'IQA Logic & IQ — Аналитические паттерны, графы и комбинаторная логика',
        subject: 'Logic & IQ',
        grade: 8,
        year: 2026,
        term: 'Quarter 1',
        paper_code: 'IQA-LOGIC-G8-2026-Q1',
        duration_minutes: 60,
        max_score: 60,
        topics: ['Числовые последовательности', 'Истинностные таблицы (Рыцари и Лжецы)', 'Принцип Дирихле', 'Пространственное мышление'],
        has_answer_key: 1,
        sample_questions: [
          {
            q: 'Продолжите последовательность IQA: 2, 6, 12, 20, 30, 42, ... Какое число следующее?',
            options: ['52', '54', '56', '60'],
            answer: '56',
            explanation: 'Формула n-го члена: n·(n+1). 1·2=2, 2·3=6, 3·4=12, 4·5=20, 5·6=30, 6·7=42, 7·8=56.',
          },
          {
            q: 'В коробке лежат 10 синих, 10 красных и 10 белых маркеров. Какое наименьшее число маркеров нужно вытащить не глядя, чтобы среди них гарантированно оказались 4 маркера одного цвета?',
            options: ['4', '9', '10', '12'],
            answer: '10',
            explanation: 'По принципу Дирихле в худшем случае мы вытащим по 3 маркера каждого из 3 цветов (3×3 = 9). Следующий 10-й маркер гарантированно даст 4-й одного цвета.',
          },
        ],
        file_url: '/api/papers/IQA-LOGIC-G8-2026-Q1/sheet',
        download_count: 415,
        created_at: '2026-10-15T08:30:00Z',
      },
      {
        title: 'IQA Computer Science — Алгоритмы, Сложность O(N) и структуры данных',
        subject: 'Computer Science',
        grade: 11,
        year: 2026,
        term: 'Final Mock',
        paper_code: 'IQA-CS-G11-2026-MOCK',
        duration_minutes: 120,
        max_score: 100,
        topics: ['Бинарный поиск', 'Динамическое программирование', 'Графы (BFS/DFS)', 'Асимптотическая сложность'],
        has_answer_key: 1,
        sample_questions: [
          {
            q: 'Какова временная сложность поиска элемента в отсортированном массиве из N элементов методом бинарного поиска в худшем случае?',
            options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
            answer: 'O(log N)',
            explanation: 'На каждом шаге область поиска делится пополам, поэтому требуется не более log₂(N) сравнений.',
          },
        ],
        file_url: '/api/papers/IQA-CS-G11-2026-MOCK/sheet',
        download_count: 198,
        created_at: '2026-11-01T12:00:00Z',
      },
      {
        title: 'IQA Physics — Кинематика, Законы Ньютона и Законы сохранения',
        subject: 'Physics',
        grade: 9,
        year: 2025,
        term: 'Quarter 4',
        paper_code: 'IQA-PHYS-G9-2025-Q4',
        duration_minutes: 75,
        max_score: 80,
        topics: ['Движение тела под углом к горизонту', 'Импульс и механическая энергия', 'Закон Ома для участка цепи'],
        has_answer_key: 1,
        sample_questions: [
          {
            q: 'Тело массой 2 кг движется со скоростью 6 м/с. Чему равна его кинетическая энергия?',
            options: ['12 Дж', '36 Дж', '72 Дж', '18 Дж'],
            answer: '36 Дж',
            explanation: 'E_k = (m·v²)/2 = (2 · 36) / 2 = 36 Дж.',
          },
        ],
        file_url: '/api/papers/IQA-PHYS-G9-2025-Q4/sheet',
        download_count: 230,
        created_at: '2025-05-14T10:00:00Z',
      },
      {
        title: 'IQA Mathematics Junior — Дроби, Пропорции, Текстовые задачи и Геометрия',
        subject: 'Mathematics',
        grade: 6,
        year: 2026,
        term: 'Quarter 1',
        paper_code: 'IQA-MATH-G6-2026-Q1',
        duration_minutes: 60,
        max_score: 60,
        topics: ['НОД и НОК', 'Обыкновенные и десятичные дроби', 'Задачи на движение и проценты', 'Периметр и площадь фигур'],
        has_answer_key: 1,
        sample_questions: [
          {
            q: 'Товар стоил 2000 сомов. Сначала цену снизили на 10%, а затем новую цену повысили на 10%. Какова итоговая цена?',
            options: ['2000 сомов', '1980 сомов', '2020 сомов', '1900 сомов'],
            answer: '1980 сомов',
            explanation: 'После снижения на 10%: 2000 × 0.9 = 1800 сомов. После повышения на 10%: 1800 × 1.1 = 1980 сомов.',
          },
        ],
        file_url: '/api/papers/IQA-MATH-G6-2026-Q1/sheet',
        download_count: 376,
        created_at: '2026-10-12T09:00:00Z',
      },
      {
        title: 'IQA Кыргыз тили жана Орус тили — Орфография, Аналогии и Анализ текста',
        subject: 'Kyrgyz & Russian',
        grade: 7,
        year: 2026,
        term: 'Quarter 1',
        paper_code: 'IQA-LANG-G7-2026-Q1',
        duration_minutes: 60,
        max_score: 70,
        topics: ['Орфография жана мүчөлөр', 'Смысловые аналогии (ОРТ формат)', 'Синтаксис и пунктуация', 'Фразеологизмы и макал-лакаптар'],
        has_answer_key: 1,
        sample_questions: [
          {
            q: 'Кайсы макалда антонимдер (карама-каршы маанилүү сөздөр) колдонулган?',
            options: [
              '«Аз сүйлө, көп иште»',
              '«Билектүү бирди жыгат, билимдүү миңди жыгат»',
              '«Карысы бардын — ырысы бар»',
              '«Ырыс алды — ынтымак»',
            ],
            answer: '«Аз сүйлө, көп иште»',
            explanation: '«Аз» (мало) жана «көп» (много) — карама-каршы маанилүү сөздөр (антонимдер).',
          },
        ],
        file_url: '/api/papers/IQA-LANG-G7-2026-Q1/sheet',
        download_count: 264,
        created_at: '2026-10-14T13:00:00Z',
      },
    ];

    for (const p of initialPapers) {
      insertPaper.run(
        p.title,
        p.subject,
        p.grade,
        p.year,
        p.term,
        p.paper_code,
        p.duration_minutes,
        p.max_score,
        JSON.stringify(p.topics),
        p.has_answer_key,
        JSON.stringify(p.sample_questions),
        p.file_url,
        p.download_count,
        p.created_at
      );
    }
  }

  const suggestionsCount = db.prepare('SELECT COUNT(*) as c FROM suggestions').get() as {
    c: number;
  };
  if (suggestionsCount.c === 0) {
    const insertSuggestion = db.prepare(`
      INSERT INTO suggestions (
        author_name, author_role, grade_label, category,
        title, content, status, admin_reply, upvotes, is_public, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialSuggestions = [
      {
        author_name: 'Данияр К.',
        author_role: 'Ученик',
        grade_label: '10-A класс',
        category: 'Учебный процесс & IQA',
        title: 'Добавить видео-разборы самых сложных задач IQA через 3 дня после экзамена',
        content:
          'Было бы круто, если бы после каждого четвертного IQA учителя записывали 15-минутный разбор топ-5 задач, где ошиблись больше всего учеников.',
        status: 'implemented',
        admin_reply:
          'Отличная идея! С этой четверти кафедра STEM и Языков публикует разборы + эталонные решения прямо в карточках IQA Past Papers.',
        upvotes: 84,
        is_public: 1,
        created_at: '2026-10-25T15:20:00Z',
      },
      {
        author_name: 'Алина М.',
        author_role: 'Ученик',
        grade_label: '9-B класс',
        category: 'Столовая & Зона отдыха',
        title: 'Поставить аппарат со здоровыми снеками и фильтр с тёплой/холодной водой на 2 этаже',
        content:
          'Между дополнительными кружками и подготовкой к олимпиадам после 15:00 хочется быстро перекусить батончиками без сахара, орехами или фруктами.',
        status: 'approved',
        admin_reply:
          'Поддержано администрацией! Кулеры на 2 и 3 этажах уже заказаны, вендинговый автомат со здоровыми перекусами появится до конца месяца.',
        upvotes: 67,
        is_public: 1,
        created_at: '2026-11-02T11:45:00Z',
      },
      {
        author_name: 'Эрмек Б.',
        author_role: 'Ученик',
        grade_label: '11-A класс',
        category: 'Клубы & Ивенты',
        title: 'Проводить ежемесячный Indigo Hackathon & Шахматный блиц по пятницам',
        content:
          'Предлагаю каждую последнюю пятницу месяца устраивать мини-хакатон на 4 часа или шахматный турнир между классами с рейтинговой таблицей.',
        status: 'reviewing',
        admin_reply:
          'Обсуждаем со школьным парламентом и Тимуром Исаковым даты первого зимнего Indigo Hackathon.',
        upvotes: 53,
        is_public: 1,
        created_at: '2026-11-10T17:10:00Z',
      },
      {
        author_name: 'Анонимный ученик',
        author_role: 'Анонимно',
        grade_label: '8 класс',
        category: 'Инфраструктура & Кампус',
        title: 'Больше пуфиков и розеток в тихой зоне чтения возле библиотеки',
        content:
          'Во время подготовки к IQA все столы в библиотеке заняты, не хватает розеток для ноутбуков и мягких кресел-мешков.',
        status: 'approved',
        admin_reply:
          'Принято! Добавили 12 новых розеточных блоков с USB-C и заказали 8 кресел-груш в читальную зону.',
        upvotes: 49,
        is_public: 1,
        created_at: '2026-11-13T12:00:00Z',
      },
    ];

    for (const s of initialSuggestions) {
      insertSuggestion.run(
        s.author_name,
        s.author_role,
        s.grade_label,
        s.category,
        s.title,
        s.content,
        s.status,
        s.admin_reply,
        s.upvotes,
        s.is_public,
        s.created_at
      );
    }
  }

  const socialsCount = db.prepare('SELECT COUNT(*) as c FROM social_links').get() as {
    c: number;
  };
  if (socialsCount.c === 0) {
    const insertSocial = db.prepare(`
      INSERT INTO social_links (platform, handle, url, description, subscribers_label, accent_color, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const initialSocials = [
      {
        platform: 'Instagram',
        handle: '@indigo.academy.west',
        url: 'https://instagram.com/indigo.academy.west',
        description: 'Ежедневные сторис из жизни кампуса в Бишкеке, фотоотчёты с олимпиад, KL Week и награждений IQA.',
        subscribers_label: '4.8K подписчиков',
        accent_color: 'from-pink-500 via-purple-500 to-indigo-500',
        is_active: 1,
      },
      {
        platform: 'Telegram',
        handle: '@indigo_west_bishkek',
        url: 'https://t.me/indigo_west_bishkek',
        description: 'Оперативные анонсы расписания IQA, публикация результатов, олимпиадные подборки и важные объявления.',
        subscribers_label: '2.3K участников',
        accent_color: 'from-sky-400 to-blue-600',
        is_active: 1,
      },
      {
        platform: 'YouTube',
        handle: 'Indigo West Academy TV',
        url: 'https://youtube.com/@indigoacademywest',
        description: 'Видео-разборы сложных задач IQA Past Papers, записи дебатов, интервью с учителями и влоги учеников.',
        subscribers_label: '1.5K подписчиков',
        accent_color: 'from-red-500 to-rose-600',
        is_active: 1,
      },
      {
        platform: 'TikTok',
        handle: '@indigo.west.life',
        url: 'https://tiktok.com/@indigo.west.life',
        description: 'Школьный вайб, лайфхаки для сдачи IQA и SAT, бэкстейдж мероприятий от школьного медиа-клуба.',
        subscribers_label: '6.2K подписчиков',
        accent_color: 'from-cyan-400 via-fuchsia-500 to-indigo-600',
        is_active: 1,
      },
      {
        platform: 'WhatsApp',
        handle: '+996 (555) 70-80-90',
        url: 'https://wa.me/996555708090',
        description: 'Прямая линия приёмной комиссии и учебной части Indigo West Academy для родителей и абитуриентов.',
        subscribers_label: 'Приёмная комиссия',
        accent_color: 'from-emerald-400 to-green-600',
        is_active: 1,
      },
      {
        platform: '2GIS',
        handle: 'Бишкек, Кампус West',
        url: 'https://2gis.kg/bishkek',
        description: 'Точный маршрут до западного кампуса Indigo West Academy в г. Бишкек, схема проезда и график работы.',
        subscribers_label: 'Открыть на карте',
        accent_color: 'from-amber-400 to-orange-500',
        is_active: 1,
      },
    ];

    for (const soc of initialSocials) {
      insertSocial.run(
        soc.platform,
        soc.handle,
        soc.url,
        soc.description,
        soc.subscribers_label,
        soc.accent_color,
        soc.is_active
      );
    }
  }
}

seedDatabaseIfEmpty();

// Row mappers to clean TypeScript domain objects
export function getAllNews(): NewsItem[] {
  const rows = db
    .prepare('SELECT * FROM news ORDER BY is_pinned DESC, published_at DESC, id DESC')
    .all() as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: Number(r.id),
    title: String(r.title),
    category: r.category as NewsItem['category'],
    summary: String(r.summary),
    content: String(r.content),
    image_url: String(r.image_url),
    author_name: String(r.author_name),
    read_time_minutes: Number(r.read_time_minutes),
    is_pinned: Boolean(r.is_pinned),
    published_at: String(r.published_at),
  }));
}

export function getAllTeachers(): Teacher[] {
  const rows = db
    .prepare('SELECT * FROM teachers ORDER BY experience_years DESC, id ASC')
    .all() as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: Number(r.id),
    full_name: String(r.full_name),
    subject: String(r.subject),
    department: r.department as Teacher['department'],
    role_title: String(r.role_title),
    bio: String(r.bio),
    achievements: JSON.parse(String(r.achievements_json || '[]')),
    education: String(r.education),
    photo_url: String(r.photo_url),
    experience_years: Number(r.experience_years),
    quote: String(r.quote),
  }));
}

export function getAllPapers(): IQAPaper[] {
  const rows = db
    .prepare('SELECT * FROM iqa_papers ORDER BY year DESC, grade DESC, id DESC')
    .all() as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: Number(r.id),
    title: String(r.title),
    subject: r.subject as IQAPaper['subject'],
    grade: Number(r.grade),
    year: Number(r.year),
    term: r.term as IQAPaper['term'],
    paper_code: String(r.paper_code),
    duration_minutes: Number(r.duration_minutes),
    max_score: Number(r.max_score),
    topics_covered: JSON.parse(String(r.topics_json || '[]')),
    has_answer_key: Boolean(r.has_answer_key),
    sample_questions: JSON.parse(String(r.sample_questions_json || '[]')),
    file_url: String(r.file_url),
    download_count: Number(r.download_count),
    created_at: String(r.created_at),
  }));
}

export function getSuggestions(includePrivate = false): Suggestion[] {
  const sql = includePrivate
    ? 'SELECT * FROM suggestions ORDER BY created_at DESC, id DESC'
    : 'SELECT * FROM suggestions WHERE is_public = 1 ORDER BY upvotes DESC, created_at DESC';
  const rows = db.prepare(sql).all() as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: Number(r.id),
    author_name: String(r.author_name),
    author_role: r.author_role as Suggestion['author_role'],
    grade_label: String(r.grade_label),
    category: r.category as Suggestion['category'],
    title: String(r.title),
    content: String(r.content),
    status: r.status as Suggestion['status'],
    admin_reply: String(r.admin_reply),
    upvotes: Number(r.upvotes),
    is_public: Boolean(r.is_public),
    created_at: String(r.created_at),
  }));
}

export function getAllSocials(onlyActive = false): SocialLink[] {
  const sql = onlyActive
    ? 'SELECT * FROM social_links WHERE is_active = 1 ORDER BY id ASC'
    : 'SELECT * FROM social_links ORDER BY id ASC';
  const rows = db.prepare(sql).all() as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: Number(r.id),
    platform: r.platform as SocialLink['platform'],
    handle: String(r.handle),
    url: String(r.url),
    description: String(r.description),
    subscribers_label: String(r.subscribers_label),
    accent_color: String(r.accent_color),
    is_active: Boolean(r.is_active),
  }));
}

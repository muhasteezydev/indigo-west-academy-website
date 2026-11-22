export type SectionId =
  | 'overview'
  | 'news'
  | 'teachers'
  | 'iqa'
  | 'suggestions'
  | 'socials'
  | 'admin_preview';

export type DesignVariantId = 'coomo' | 'swiss' | 'classic';

export interface DesignNewsItem {
  id: number;
  date: string;
  category: 'Учебная часть' | 'Экзамены IQA' | 'Олимпиады' | 'Объявление';
  title: string;
  summary: string;
  body: string;
  isImportant?: boolean;
}

export interface DesignTeacher {
  id: number;
  name: string;
  position: string;
  subject: string;
  department: 'Точные науки (STEM)' | 'Иностранные языки' | 'Гуманитарные науки' | 'Средняя школа';
  education: string;
  experience: string;
  room: string;
  notes: string;
}

export interface DesignIQAPaper {
  id: number;
  code: string;
  subject: 'Математика' | 'Английский язык' | 'Логика (IQ)' | 'Информатика' | 'Физика' | 'Кыргызский / Русский язык';
  grade: number;
  year: number;
  quarter: 'I четверть' | 'II четверть' | 'III четверть' | 'IV четверть' | 'Годовой срез';
  durationMin: number;
  questionsCount: number;
  hasKey: boolean;
  fileSize: string;
  topics: string;
}

export interface DesignSuggestion {
  id: number;
  date: string;
  author: string;
  category: 'Учебный процесс' | 'Инфраструктура' | 'Столовая' | 'Внеклассная жизнь';
  title: string;
  text: string;
  status: 'Принято в работу' | 'Выполнено' | 'На рассмотрении';
  reply?: string;
}

export interface DesignSocial {
  id: number;
  name: string;
  handle: string;
  url: string;
  purpose: string;
  scheduleOrNote: string;
}

export const SCHOOL_NEWS: DesignNewsItem[] = [
  {
    id: 2,
    date: '16.11.2026',
    category: 'Олимпиады',
    title: 'Итоги районного и городского этапов олимпиады школьников в г. Бишкек',
    summary:
      'Ученики 9–11 классов западного кампуса заняли 4 первых и 7 призовых мест по математике, информатике и физике.',
    body: 'Поздравляем сборную школы Indigo West Academy и преподавателей кафедры точных наук с успешным выступлением на городской олимпиаде.\n\nПобедители продолжат подготовку к Республиканскому этапу по индивидуальному графику в лаборатории олимпиадного резерва (каб. 304).',
    isImportant: true,
  },
  {
    id: 4,
    date: '12.11.2026',
    category: 'Объявление',
    title: 'Обновление школьной библиотеки, коворкинга и читального зала на 2 этаже',
    summary:
      'Открылись новые рабочие зоны для проектов, поступили свежие сборники по подготовке к SAT, IELTS Academic и Кембриджской программе.',
    body: 'Все учащиеся 5–11 классов могут пользоваться новым коворкингом и брать учебные пособия по читательскому билету. Режим работы читального зала продлён до 18:00.',
    isImportant: true,
  },
  {
    id: 5,
    date: '08.11.2026',
    category: 'Учебная часть',
    title: 'Итоги Недели кыргызского языка и литературы (Kyrgyz Language Week)',
    summary:
      'Проведены общешкольная викторина, конкурс эссе и открытые чтения среди учеников 5–10 классов.',
    body: 'Благодарим кафедру кыргызского и русского языков за организацию предметной недели. Грамоты победителям вручены на понедельничной линейке.',
  },
  {
    id: 1,
    date: '03.11.2026',
    category: 'Экзамены IQA',
    title: 'Расписание среза знаний IQA за II четверть (5–11 классы)',
    summary:
      'Учебная часть Indigo West Academy публикует даты проведения планового тестирования Indigo Quiz Assessment и перечень тем.',
    body: 'Тестирование IQA за II четверть пройдёт с 25 по 28 ноября 2026 года. Ознакомиться с демонстрационными вариантами прошлых лет можно в разделе «Past Papers of IQA».',
  },
  {
    id: 3,
    date: '28.10.2026',
    category: 'Учебная часть',
    title: 'График дополнительных консультаций и предметных клубов после уроков',
    summary:
      'По вторникам и четвергам с 15:30 до 17:00 проходят открытые занятия по математике, физике, дебатам и программированию.',
    body: 'Запись на консультации не требуется. Распределение по кабинетам: Математика (8–11 кл.) — каб. 208, Английский язык — каб. 212, Клуб логики — каб. 105.',
  },
];

export const SCHOOL_TEACHERS: DesignTeacher[] = [
  {
    id: 1,
    name: 'Сатыбалдиев Азамат Маратович',
    position: 'Заведующий кафедрой математики, координатор IQA Math',
    subject: 'Алгебра, Геометрия, Олимпиадная математика',
    department: 'Точные науки (STEM)',
    education: 'КРСУ / МФТИ, Прикладная математика',
    experience: '12 лет',
    room: 'Каб. 208',
    notes: 'Подготовка 9–11 классов к олимпиадам КР, ОРТ (основной и предметный тест) и SAT Math.',
  },
  {
    id: 2,
    name: 'Токтогулова Айжан Бакытовна',
    position: 'Руководитель кафедры иностранных языков',
    subject: 'Английский язык (Academic English & IELTS)',
    department: 'Иностранные языки',
    education: 'АУЦА (AUCA), University of Manchester (MA TESOL, CELTA)',
    experience: '9 лет',
    room: 'Каб. 212',
    notes: 'Куратор языкового блока тестирования IQA, руководитель школьного клуба дебатов.',
  },
  {
    id: 3,
    name: 'Исаков Тимур Русланович',
    position: 'Преподаватель информатики и программирования',
    subject: 'Информатика, Алгоритмы (C++ / Python)',
    department: 'Точные науки (STEM)',
    education: 'АУЦА, Программная инженерия',
    experience: '7 лет',
    room: 'Каб. 304',
    notes: 'Тренер школьной сборной по спортивному программированию (IOI / ICPC Junior).',
  },
  {
    id: 4,
    name: 'Соколова Елена Викторовна',
    position: 'Старший преподаватель физики',
    subject: 'Физика и лабораторный практикум',
    department: 'Точные науки (STEM)',
    education: 'КНУ им. Ж. Баласагына, Физический факультет',
    experience: '14 лет',
    room: 'Каб. 301',
    notes: 'Разработчик контрольно-измерительных материалов IQA по физике для 7–11 классов.',
  },
  {
    id: 5,
    name: 'Кадырова Гульнара Асановна',
    position: 'Руководитель методического объединения 5–8 классов',
    subject: 'Кыргызский язык, Русский язык и словесность',
    department: 'Гуманитарные науки',
    education: 'БГУ им. К. Карасаева, Филологический факультет',
    experience: '15 лет',
    room: 'Каб. 109',
    notes: 'Подготовка к разделу «Аналогии и дополнение предложений» и «Чтение и понимание» (формат ЦООМО).',
  },
  {
    id: 6,
    name: 'Осмонов Нурбек Таалайбекович',
    position: 'Преподаватель истории и критического мышления',
    subject: 'Логика (IQA Logic), История Кыргызстана и Мировая история',
    department: 'Гуманитарные науки',
    education: 'КРСУ, Историко-философский факультет',
    experience: '8 лет',
    room: 'Каб. 105',
    notes: 'Составитель задач логического блока Indigo Quiz Assessment для 5–10 классов.',
  },
];

export const SCHOOL_IQA_PAPERS: DesignIQAPaper[] = [
  {
    id: 1,
    code: 'IQA-MATH-10-2026-Q1',
    subject: 'Математика',
    grade: 10,
    year: 2026,
    quarter: 'I четверть',
    durationMin: 90,
    questionsCount: 30,
    hasKey: true,
    fileSize: '420 КБ',
    topics: 'Квадратичная функция с параметром, тригонометрические уравнения, планиметрия, текстовые задачи',
  },
  {
    id: 2,
    code: 'IQA-ENG-09-2026-Q1',
    subject: 'Английский язык',
    grade: 9,
    year: 2026,
    quarter: 'I четверть',
    durationMin: 60,
    questionsCount: 40,
    hasKey: true,
    fileSize: '380 КБ',
    topics: 'Reading Comprehension, Conditionals, Academic Vocabulary (B2), Use of English',
  },
  {
    id: 3,
    code: 'IQA-LOGIC-08-2026-Q1',
    subject: 'Логика (IQ)',
    grade: 8,
    year: 2026,
    quarter: 'I четверть',
    durationMin: 60,
    questionsCount: 25,
    hasKey: true,
    fileSize: '310 КБ',
    topics: 'Числовые закономерности, принцип Дирихле, логические высказывания, комбинаторика',
  },
  {
    id: 4,
    code: 'IQA-CS-11-2026-MOCK',
    subject: 'Информатика',
    grade: 11,
    year: 2026,
    quarter: 'Годовой срез',
    durationMin: 120,
    questionsCount: 20,
    hasKey: true,
    fileSize: '510 КБ',
    topics: 'Оценка сложности алгоритмов, бинарный поиск, массивы и сортировки, основы графов',
  },
  {
    id: 5,
    code: 'IQA-PHYS-09-2025-Q4',
    subject: 'Физика',
    grade: 9,
    year: 2025,
    quarter: 'IV четверть',
    durationMin: 75,
    questionsCount: 25,
    hasKey: true,
    fileSize: '445 КБ',
    topics: 'Кинематика, законы Ньютона, закон сохранения импульса и энергии, постоянный ток',
  },
  {
    id: 6,
    code: 'IQA-LANG-07-2026-Q1',
    subject: 'Кыргызский / Русский язык',
    grade: 7,
    year: 2026,
    quarter: 'I четверть',
    durationMin: 60,
    questionsCount: 35,
    hasKey: true,
    fileSize: '360 КБ',
    topics: 'Орфография, смысловые аналогии (по формату ЦООМО), синтаксический разбор, анализ текста',
  },
  {
    id: 7,
    code: 'IQA-MATH-06-2026-Q1',
    subject: 'Математика',
    grade: 6,
    year: 2026,
    quarter: 'I четверть',
    durationMin: 60,
    questionsCount: 25,
    hasKey: true,
    fileSize: '295 КБ',
    topics: 'Обыкновенные и десятичные дроби, пропорции, проценты, задачи на движение, НОД и НОК',
  },
];

export const SCHOOL_SUGGESTIONS: DesignSuggestion[] = [
  {
    id: 1,
    date: '05.11.2026',
    author: 'Ученик 10 «А» класса',
    category: 'Учебный процесс',
    title: 'Публиковать письменные разборы 5 самых сложных задач после каждого среза IQA',
    text: 'После получения баллов хочется видеть не только правильную букву ответа в ключе, но и краткое решение задач части B, где чаще всего теряются баллы.',
    status: 'Выполнено',
    reply:
      'Учебная часть поддержала предложение. Начиная со II четверти ко всем бланкам IQA Past Papers прикрепляется лист с решением задач повышенной сложности.',
  },
  {
    id: 2,
    date: '09.11.2026',
    author: 'Ученица 9 «Б» класса',
    category: 'Инфраструктура',
    title: 'Дополнительные удлинители и розетки в читальном зале на 2 этаже',
    text: 'После уроков многие остаются готовиться к олимпиадам и делать проекты на ноутбуках, но свободных розеток у столов не хватает.',
    status: 'Принято в работу',
    reply:
      'Хозяйственный отдел закупил сетевые блоки на 16 рабочих мест. Установка завершится до 22 ноября.',
  },
  {
    id: 3,
    date: '14.11.2026',
    author: 'Анонимно (8 класс)',
    category: 'Внеклассная жизнь',
    title: 'Еженедельный шахматный турнир и клуб настольных игр в пятницу после 15:00',
    text: 'Было бы здорово каждую пятницу проводить турнир по быстрым шахматам между классами с таблицей рейтинга школы.',
    status: 'На рассмотрении',
    reply: 'Передано на согласование школьному парламенту и кураторам 7–11 классов.',
  },
];

export const SCHOOL_SOCIALS: DesignSocial[] = [
  {
    id: 1,
    name: 'Telegram-канал учебной части',
    handle: '@indigo_west_bishkek',
    url: 'https://t.me/indigo_west_bishkek',
    purpose: 'Оперативные объявления, расписание срезов IQA, публикация списков кабинетов и результатов.',
    scheduleOrNote: 'Основной канал уведомлений для 5–11 классов',
  },
  {
    id: 2,
    name: 'Instagram школы',
    handle: '@indigo.academy.west',
    url: 'https://instagram.com/indigo.academy.west',
    purpose: 'Фотоотчёты школьных олимпиад, предметных недель, награждений и мероприятий кампуса.',
    scheduleOrNote: 'Официальная страница Indigo West Academy',
  },
  {
    id: 3,
    name: 'YouTube — Архив видеоразборов',
    handle: 'Indigo West Academy Bishkek',
    url: 'https://youtube.com',
    purpose: 'Записи разборов демонстрационных вариантов IQA по математике, физике и английскому языку.',
    scheduleOrNote: 'Учебные материалы и лекции',
  },
  {
    id: 4,
    name: 'WhatsApp Приёмной комиссии и Учебной части',
    handle: '+996 (555) 70-80-90',
    url: 'https://wa.me/996555708090',
    purpose: 'Консультации для родителей и учеников по вопросам поступления, справок и расписания.',
    scheduleOrNote: 'Пн–Пт: 08:00–17:30, Сб: 08:30–14:00',
  },
  {
    id: 5,
    name: '2ГИС — Адрес кампуса в Бишкеке',
    handle: 'г. Бишкек, Indigo West Academy',
    url: 'https://2gis.kg/bishkek',
    purpose: 'Точная схема проезда и расположение учебного корпуса на карте Бишкека.',
    scheduleOrNote: 'Западный кампус (West Campus)',
  },
  {
    id: 6,
    name: 'TikTok — Медиа-клуб школы',
    handle: '@indigo.west.life',
    url: 'https://tiktok.com/@indigo.west.life',
    purpose: 'Школьная жизнь глазами учеников, короткие лайфхаки по подготовке к IQA и бэкстейдж ивентов.',
    scheduleOrNote: 'Студенческий медиа-клуб Indigo',
  },
];

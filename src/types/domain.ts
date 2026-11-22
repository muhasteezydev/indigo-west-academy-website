export type NewsCategory =
  | 'Академия'
  | 'Олимпиады'
  | 'Кампус'
  | 'IQA Экзамены'
  | 'События';

export interface NewsItem {
  id: number;
  title: string;
  category: NewsCategory;
  summary: string;
  content: string;
  image_url: string;
  author_name: string;
  read_time_minutes: number;
  is_pinned: boolean;
  published_at: string;
}

export type TeacherDepartment =
  | 'STEM & Олимпиады'
  | 'Языки & IELTS/SAT'
  | 'Гуманитарные науки'
  | 'Начальная и средняя школа';

export interface Teacher {
  id: number;
  full_name: string;
  subject: string;
  department: TeacherDepartment;
  role_title: string;
  bio: string;
  achievements: string[];
  education: string;
  photo_url: string;
  experience_years: number;
  quote: string;
}

export type IQASubject =
  | 'Mathematics'
  | 'English'
  | 'Logic & IQ'
  | 'Computer Science'
  | 'Physics'
  | 'Kyrgyz & Russian';

export type IQATerm =
  | 'Quarter 1'
  | 'Quarter 2'
  | 'Quarter 3'
  | 'Quarter 4'
  | 'Final Mock';

export interface IQASampleQuestion {
  q: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface IQAPaper {
  id: number;
  title: string;
  subject: IQASubject;
  grade: number;
  year: number;
  term: IQATerm;
  paper_code: string;
  duration_minutes: number;
  max_score: number;
  topics_covered: string[];
  has_answer_key: boolean;
  sample_questions: IQASampleQuestion[];
  file_url: string;
  download_count: number;
  created_at: string;
}

export type SuggestionCategory =
  | 'Учебный процесс & IQA'
  | 'Инфраструктура & Кампус'
  | 'Столовая & Зона отдыха'
  | 'Клубы & Ивенты'
  | 'IT & Технологии';

export type SuggestionStatus =
  | 'new'
  | 'reviewing'
  | 'approved'
  | 'implemented'
  | 'declined';

export type SuggestionAuthorRole =
  | 'Ученик'
  | 'Учитель'
  | 'Родитель'
  | 'Анонимно';

export interface Suggestion {
  id: number;
  author_name: string;
  author_role: SuggestionAuthorRole;
  grade_label: string;
  category: SuggestionCategory;
  title: string;
  content: string;
  status: SuggestionStatus;
  admin_reply: string;
  upvotes: number;
  is_public: boolean;
  created_at: string;
}

export type SocialPlatform =
  | 'Instagram'
  | 'Telegram'
  | 'YouTube'
  | 'TikTok'
  | 'WhatsApp'
  | '2GIS';

export interface SocialLink {
  id: number;
  platform: SocialPlatform;
  handle: string;
  url: string;
  description: string;
  subscribers_label: string;
  accent_color: string;
  is_active: boolean;
}

export interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  role: string;
}

export interface PortalBootstrapData {
  news: NewsItem[];
  teachers: Teacher[];
  papers: IQAPaper[];
  suggestions: Suggestion[];
  socials: SocialLink[];
  stats: {
    students_count: number;
    teachers_count: number;
    iqa_papers_count: number;
    implemented_ideas_count: number;
  };
}

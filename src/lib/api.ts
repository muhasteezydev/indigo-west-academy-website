import type {
  AdminUser,
  IQAPaper,
  NewsItem,
  PortalBootstrapData,
  SocialLink,
  Suggestion,
  Teacher,
} from '../types/domain';

const TOKEN_STORAGE_KEY = 'indigo_west_admin_jwt';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Ошибка запроса (${response.status})`);
  }
  return data as T;
}

export const api = {
  getBootstrap: () => apiRequest<PortalBootstrapData>('/api/bootstrap'),

  login: (username: string, password: string) =>
    apiRequest<{ token: string; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getMe: () => apiRequest<{ user: AdminUser }>('/api/auth/me'),

  submitSuggestion: (payload: {
    author_name: string;
    author_role: string;
    grade_label: string;
    category: string;
    title: string;
    content: string;
  }) =>
    apiRequest<{ id: number; suggestions: Suggestion[] }>('/api/suggestions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  upvoteSuggestion: (id: number) =>
    apiRequest<{ suggestions: Suggestion[] }>(`/api/suggestions/${id}/upvote`, {
      method: 'POST',
    }),

  // Protected Admin API
  getAdminOverview: () =>
    apiRequest<{
      news: NewsItem[];
      teachers: Teacher[];
      papers: IQAPaper[];
      suggestions: Suggestion[];
      socials: SocialLink[];
    }>('/api/admin/overview'),

  createNews: (payload: Partial<NewsItem>) =>
    apiRequest<{ news: NewsItem[] }>('/api/admin/news', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateNews: (id: number, payload: Partial<NewsItem>) =>
    apiRequest<{ news: NewsItem[] }>(`/api/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteNews: (id: number) =>
    apiRequest<{ news: NewsItem[] }>(`/api/admin/news/${id}`, {
      method: 'DELETE',
    }),

  createTeacher: (payload: Partial<Teacher>) =>
    apiRequest<{ teachers: Teacher[] }>('/api/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteTeacher: (id: number) =>
    apiRequest<{ teachers: Teacher[] }>(`/api/admin/teachers/${id}`, {
      method: 'DELETE',
    }),

  createPaper: (
    payload: Partial<IQAPaper> & { pdf_base64?: string; pdf_filename?: string }
  ) =>
    apiRequest<{ papers: IQAPaper[] }>('/api/admin/papers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deletePaper: (id: number) =>
    apiRequest<{ papers: IQAPaper[] }>(`/api/admin/papers/${id}`, {
      method: 'DELETE',
    }),

  moderateSuggestion: (
    id: number,
    payload: { status?: string; admin_reply?: string; is_public?: boolean }
  ) =>
    apiRequest<{ suggestions: Suggestion[] }>(`/api/admin/suggestions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteSuggestion: (id: number) =>
    apiRequest<{ suggestions: Suggestion[] }>(`/api/admin/suggestions/${id}`, {
      method: 'DELETE',
    }),

  updateSocialLink: (id: number, payload: Partial<SocialLink>) =>
    apiRequest<{ socials: SocialLink[] }>(`/api/admin/socials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

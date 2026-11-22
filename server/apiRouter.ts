import type { IncomingMessage, ServerResponse } from 'node:http';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  db,
  getAllNews,
  getAllTeachers,
  getAllPapers,
  getSuggestions,
  getAllSocials,
} from './db.ts';
import {
  verifyPassword,
  signJwt,
  extractAdminFromRequest,
  checkRateLimit,
} from './security.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = join(__dirname, 'uploads', 'papers');
mkdirSync(UPLOADS_DIR, { recursive: true });

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

async function readJsonBody<T = Record<string, unknown>>(
  req: IncomingMessage,
  maxBytes = 20 * 1024 * 1024
): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (!raw.trim()) {
          resolve({} as T);
          return;
        }
        resolve(JSON.parse(raw) as T);
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPrintableIQASheet(paperCode: string, includeKey: boolean): string | null {
  const papers = getAllPapers();
  const paper = papers.find((p) => p.paper_code === paperCode);
  if (!paper) return null;

  db.prepare('UPDATE iqa_papers SET download_count = download_count + 1 WHERE paper_code = ?').run(
    paperCode
  );

  const questionsHtml = paper.sample_questions
    .map(
      (q, idx) => `
      <div class="question-card">
        <div class="q-header">Задание №${idx + 1}</div>
        <div class="q-text">${escapeHtml(q.q)}</div>
        <div class="options-grid">
          ${q.options
            .map(
              (opt, i) => `
            <div class="opt">
              <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
              <span>${escapeHtml(opt)}</span>
            </div>`
            )
            .join('')}
        </div>
        ${
          includeKey
            ? `<div class="answer-box">
                <strong>Правильный ответ:</strong> ${escapeHtml(q.answer)}<br/>
                <span><em>Разбор кафедры Indigo:</em> ${escapeHtml(q.explanation)}</span>
              </div>`
            : ''
        }
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(paper.paper_code)} — ${escapeHtml(paper.title)} | Indigo Academy West</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .sheet {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #1e1b4b;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #312e81;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .school-brand {
      font-size: 22px;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: -0.02em;
    }
    .school-sub {
      font-size: 12px;
      color: #475569;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .code-badge {
      background: #1e1b4b;
      color: #ffffff;
      font-family: monospace;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 14px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f1f5f9;
      padding: 14px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .student-box {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .line-field {
      border-bottom: 1px solid #64748b;
      padding-bottom: 4px;
      color: #475569;
    }
    .question-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .q-header {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #4338ca;
      margin-bottom: 6px;
    }
    .q-text {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 12px;
      line-height: 1.45;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .opt {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      padding: 6px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .opt-letter {
      font-weight: 700;
      color: #312e81;
    }
    .answer-box {
      margin-top: 12px;
      padding: 10px 12px;
      background: #eef2ff;
      border-left: 4px solid #4f46e5;
      font-size: 13px;
      line-height: 1.4;
    }
    .toolbar {
      max-width: 820px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
    }
    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none; }
      .sheet { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <a class="btn" href="/" style="background:#334155">← Вернуться на портал Indigo West</a>
    <div style="display:flex; gap:10px;">
      <a class="btn" href="?key=${includeKey ? '0' : '1'}" style="background:#0f766e">
        ${includeKey ? 'Скрыть ключи и решения' : 'Показать ключи (Answer Key)'}
      </a>
      <button class="btn" onclick="window.print()">Печать / Сохранить как PDF</button>
    </div>
  </div>
  <div class="sheet">
    <div class="top-bar">
      <div>
        <div class="school-brand">INDIGO ACADEMY WEST • БИШКЕК</div>
        <div class="school-sub">Official Past Paper • Indigo Quiz Assessment (IQA)</div>
      </div>
      <div class="code-badge">${escapeHtml(paper.paper_code)}</div>
    </div>
    <h2 style="margin: 0 0 14px 0; font-size: 19px;">${escapeHtml(paper.title)}</h2>
    <div class="meta-grid">
      <div><strong>Предмет:</strong><br/>${escapeHtml(paper.subject)}</div>
      <div><strong>Параллель:</strong><br/>${paper.grade} класс</div>
      <div><strong>Сессия:</strong><br/>${escapeHtml(paper.term)} (${paper.year})</div>
      <div><strong>Регламент:</strong><br/>${paper.duration_minutes} мин / ${paper.max_score} баллов</div>
    </div>
    <div class="student-box">
      <div class="line-field">ФИО ученика: _______________________________</div>
      <div class="line-field">Класс: _________</div>
      <div class="line-field">Дата: __________</div>
    </div>
    <div style="margin-bottom: 18px; font-size: 13px; color: #334155;">
      <strong>Проверяемые темы:</strong> ${paper.topics_covered.map(escapeHtml).join(' • ')}
    </div>
    ${questionsHtml}
    <div style="margin-top: 28px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #64748b; display:flex; justify-content:space-between;">
      <span>© Indigo Academy West (г. Бишкек) — Экзаменационный архив IQA</span>
      <span>Код бланка: ${escapeHtml(paper.paper_code)}</span>
    </div>
  </div>
</body>
</html>`;
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const rawUrl = req.url || '/';
  const urlObj = new URL(rawUrl, 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method || 'GET';

  // Serve uploaded PDF files from /uploads/papers/*
  if (pathname.startsWith('/uploads/papers/') && method === 'GET') {
    const safeFile = basename(pathname);
    const fullPath = join(UPLOADS_DIR, safeFile);
    if (!existsSync(fullPath)) {
      sendJson(res, 404, { error: 'Файл не найден' });
      return true;
    }
    const buf = readFileSync(fullPath);
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeFile}"`,
    });
    res.end(buf);
    return true;
  }

  if (!pathname.startsWith('/api/')) {
    return false;
  }

  try {
    // 1. Printable IQA Past Paper Sheet: GET /api/papers/:code/sheet
    const sheetMatch = pathname.match(/^\/api\/papers\/([^/]+)\/sheet$/);
    if (sheetMatch && method === 'GET') {
      const code = decodeURIComponent(sheetMatch[1]);
      const includeKey = urlObj.searchParams.get('key') !== '0';
      const html = renderPrintableIQASheet(code, includeKey);
      if (!html) {
        sendJson(res, 404, { error: 'Экзаменационный бланк IQA не найден' });
        return true;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return true;
    }

    // 2. Public Bootstrap Endpoint: GET /api/bootstrap
    if (pathname === '/api/bootstrap' && method === 'GET') {
      const news = getAllNews();
      const teachers = getAllTeachers();
      const papers = getAllPapers();
      const suggestions = getSuggestions(false);
      const socials = getAllSocials(true);

      const implementedCount = suggestions.filter(
        (s) => s.status === 'implemented' || s.status === 'approved'
      ).length;

      sendJson(res, 200, {
        news,
        teachers,
        papers,
        suggestions,
        socials,
        stats: {
          students_count: 640,
          teachers_count: teachers.length,
          iqa_papers_count: papers.length,
          implemented_ideas_count: implementedCount,
        },
      });
      return true;
    }

    // 3. Authentication: POST /api/auth/login & GET /api/auth/me
    if (pathname === '/api/auth/login' && method === 'POST') {
      const ip = getClientIp(req);
      const rate = checkRateLimit(ip, 'login', 10, 5 * 60 * 1000);
      if (!rate.allowed) {
        sendJson(res, 429, {
          error: `Слишком много попыток входа. Повторите через ${rate.retryAfterSec} сек.`,
        });
        return true;
      }

      const body = await readJsonBody<{ username?: string; password?: string }>(req);
      const username = (body.username || '').trim();
      const password = body.password || '';

      if (!username || !password) {
        sendJson(res, 400, { error: 'Введите логин и пароль администратора' });
        return true;
      }

      const adminRow = db
        .prepare('SELECT * FROM admins WHERE username = ?')
        .get(username) as Record<string, unknown> | undefined;

      if (!adminRow || !verifyPassword(password, String(adminRow.password_hash))) {
        sendJson(res, 401, { error: 'Неверный логин или пароль администратора' });
        return true;
      }

      const token = signJwt({
        sub: Number(adminRow.id),
        username: String(adminRow.username),
        display_name: String(adminRow.display_name),
        role: 'admin',
      });

      sendJson(res, 200, {
        token,
        user: {
          id: Number(adminRow.id),
          username: String(adminRow.username),
          display_name: String(adminRow.display_name),
          role: String(adminRow.role),
        },
      });
      return true;
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const admin = extractAdminFromRequest(req);
      if (!admin) {
        sendJson(res, 401, { error: 'Сессия недействительна' });
        return true;
      }
      sendJson(res, 200, {
        user: {
          id: admin.sub,
          username: admin.username,
          display_name: admin.display_name,
          role: admin.role,
        },
      });
      return true;
    }

    // 4. Public Suggestion Submission & Upvote
    if (pathname === '/api/suggestions' && method === 'POST') {
      const ip = getClientIp(req);
      const rate = checkRateLimit(ip, 'suggestion', 5, 10 * 60 * 1000);
      if (!rate.allowed) {
        sendJson(res, 429, {
          error: `Лимит отправки советов исчерпан. Подождите ${rate.retryAfterSec} сек.`,
        });
        return true;
      }

      const body = await readJsonBody<{
        author_name?: string;
        author_role?: string;
        grade_label?: string;
        category?: string;
        title?: string;
        content?: string;
      }>(req);

      const title = (body.title || '').trim();
      const content = (body.content || '').trim();
      const author_role = (body.author_role || 'Ученик').trim();
      const author_name =
        author_role === 'Анонимно'
          ? 'Анонимный автор'
          : (body.author_name || 'Ученик Indigo').trim().slice(0, 60);
      const grade_label = (body.grade_label || 'Кампус West').trim().slice(0, 40);
      const category = (body.category || 'Инфраструктура & Кампус').trim();

      if (title.length < 5 || title.length > 140) {
        sendJson(res, 400, {
          error: 'Заголовок идеи должен содержать от 5 до 140 символов',
        });
        return true;
      }
      if (content.length < 10 || content.length > 1500) {
        sendJson(res, 400, {
          error: 'Описание идеи должно содержать от 10 до 1500 символов',
        });
        return true;
      }

      const now = new Date().toISOString();
      const result = db
        .prepare(
          `INSERT INTO suggestions (
            author_name, author_role, grade_label, category,
            title, content, status, admin_reply, upvotes, is_public, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'new', '', 1, 1, ?)`
        )
        .run(author_name, author_role, grade_label, category, title, content, now);

      sendJson(res, 201, {
        id: Number(result.lastInsertRowid),
        suggestions: getSuggestions(false),
      });
      return true;
    }

    const upvoteMatch = pathname.match(/^\/api\/suggestions\/(\d+)\/upvote$/);
    if (upvoteMatch && method === 'POST') {
      const id = Number(upvoteMatch[1]);
      db.prepare('UPDATE suggestions SET upvotes = upvotes + 1 WHERE id = ?').run(id);
      sendJson(res, 200, { suggestions: getSuggestions(false) });
      return true;
    }

    // =========================================================================
    // PROTECTED ADMIN ROUTES (Require Valid JWT in Authorization Header)
    // =========================================================================
    const admin = extractAdminFromRequest(req);
    if (!admin) {
      sendJson(res, 401, {
        error: 'Доступ запрещён: требуется авторизация администратора Indigo Academy West',
      });
      return true;
    }

    // Admin Overview Data (includes hidden/private suggestions & inactive socials)
    if (pathname === '/api/admin/overview' && method === 'GET') {
      sendJson(res, 200, {
        news: getAllNews(),
        teachers: getAllTeachers(),
        papers: getAllPapers(),
        suggestions: getSuggestions(true),
        socials: getAllSocials(false),
      });
      return true;
    }

    // Admin News CRUD
    if (pathname === '/api/admin/news' && method === 'POST') {
      const body = await readJsonBody<{
        title?: string;
        category?: string;
        summary?: string;
        content?: string;
        image_url?: string;
        author_name?: string;
        read_time_minutes?: number;
        is_pinned?: boolean;
      }>(req);

      const title = (body.title || '').trim();
      const summary = (body.summary || '').trim();
      const content = (body.content || '').trim();
      if (!title || !summary || !content) {
        sendJson(res, 400, { error: 'Заполните заголовок, краткое описание и текст новости' });
        return true;
      }

      const category = body.category || 'Академия';
      const image_url =
        (body.image_url || '').trim() ||
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80';
      const author_name = (body.author_name || admin.display_name).trim();
      const read_time_minutes = Number(body.read_time_minutes) || 3;
      const is_pinned = body.is_pinned ? 1 : 0;

      db.prepare(
        `INSERT INTO news (title, category, summary, content, image_url, author_name, read_time_minutes, is_pinned, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        title,
        category,
        summary,
        content,
        image_url,
        author_name,
        read_time_minutes,
        is_pinned,
        new Date().toISOString()
      );

      sendJson(res, 201, { news: getAllNews() });
      return true;
    }

    const newsIdMatch = pathname.match(/^\/api\/admin\/news\/(\d+)$/);
    if (newsIdMatch && method === 'PUT') {
      const id = Number(newsIdMatch[1]);
      const body = await readJsonBody<{
        title?: string;
        category?: string;
        summary?: string;
        content?: string;
        image_url?: string;
        author_name?: string;
        is_pinned?: boolean;
      }>(req);

      db.prepare(
        `UPDATE news
         SET title = ?, category = ?, summary = ?, content = ?, image_url = ?, author_name = ?, is_pinned = ?
         WHERE id = ?`
      ).run(
        (body.title || '').trim(),
        body.category || 'Академия',
        (body.summary || '').trim(),
        (body.content || '').trim(),
        (body.image_url || '').trim(),
        (body.author_name || 'Администрация').trim(),
        body.is_pinned ? 1 : 0,
        id
      );

      sendJson(res, 200, { news: getAllNews() });
      return true;
    }

    if (newsIdMatch && method === 'DELETE') {
      const id = Number(newsIdMatch[1]);
      db.prepare('DELETE FROM news WHERE id = ?').run(id);
      sendJson(res, 200, { news: getAllNews() });
      return true;
    }

    // Admin Teachers CRUD
    if (pathname === '/api/admin/teachers' && method === 'POST') {
      const body = await readJsonBody<{
        full_name?: string;
        subject?: string;
        department?: string;
        role_title?: string;
        bio?: string;
        achievements?: string[];
        education?: string;
        photo_url?: string;
        experience_years?: number;
        quote?: string;
      }>(req);

      const full_name = (body.full_name || '').trim();
      const subject = (body.subject || '').trim();
      if (!full_name || !subject) {
        sendJson(res, 400, { error: 'Укажите ФИО преподавателя и предмет' });
        return true;
      }

      db.prepare(
        `INSERT INTO teachers (full_name, subject, department, role_title, bio, achievements_json, education, photo_url, experience_years, quote)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        full_name,
        subject,
        body.department || 'STEM & Олимпиады',
        (body.role_title || 'Преподаватель Indigo Academy West').trim(),
        (body.bio || '').trim(),
        JSON.stringify(Array.isArray(body.achievements) ? body.achievements : []),
        (body.education || 'Высшее педагогическое').trim(),
        (body.photo_url || '').trim() ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        Number(body.experience_years) || 5,
        (body.quote || 'Образование — это фундамент будущего.').trim()
      );

      sendJson(res, 201, { teachers: getAllTeachers() });
      return true;
    }

    const teacherIdMatch = pathname.match(/^\/api\/admin\/teachers\/(\d+)$/);
    if (teacherIdMatch && method === 'DELETE') {
      const id = Number(teacherIdMatch[1]);
      db.prepare('DELETE FROM teachers WHERE id = ?').run(id);
      sendJson(res, 200, { teachers: getAllTeachers() });
      return true;
    }

    // Admin IQA Past Papers CRUD (+ optional PDF upload via Base64)
    if (pathname === '/api/admin/papers' && method === 'POST') {
      const body = await readJsonBody<{
        title?: string;
        subject?: string;
        grade?: number;
        year?: number;
        term?: string;
        paper_code?: string;
        duration_minutes?: number;
        max_score?: number;
        topics_covered?: string[];
        sample_questions?: Array<{
          q: string;
          options: string[];
          answer: string;
          explanation: string;
        }>;
        pdf_base64?: string;
        pdf_filename?: string;
      }>(req);

      const title = (body.title || '').trim();
      const paper_code = (body.paper_code || '').trim().toUpperCase();
      if (!title || !paper_code) {
        sendJson(res, 400, { error: 'Укажите название работы и уникальный код IQA' });
        return true;
      }

      let file_url = `/api/papers/${encodeURIComponent(paper_code)}/sheet`;

      // If admin attached a real PDF file, validate magic header "%PDF-" and store safely
      if (body.pdf_base64) {
        const cleanBase64 = body.pdf_base64.replace(/^data:application\/pdf;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        if (buffer.length > 15 * 1024 * 1024) {
          sendJson(res, 400, { error: 'Размер PDF превышает лимит 15 МБ' });
          return true;
        }
        const magic = buffer.subarray(0, 5).toString('ascii');
        if (magic !== '%PDF-') {
          sendJson(res, 400, {
            error: 'Некорректный формат файла: разрешены только настоящие документы PDF (%PDF-)',
          });
          return true;
        }
        const safeCode = paper_code.replace(/[^A-Z0-9_-]/gi, '_');
        const filename = `${safeCode}_${Date.now()}.pdf`;
        writeFileSync(join(UPLOADS_DIR, filename), buffer);
        file_url = `/uploads/papers/${filename}`;
      }

      const defaultQuestions =
        Array.isArray(body.sample_questions) && body.sample_questions.length > 0
          ? body.sample_questions
          : [
              {
                q: `Демонстрационная задача варианта ${paper_code} (${body.subject || 'Mathematics'}, ${body.grade || 9} класс)`,
                options: ['Вариант A', 'Вариант B', 'Вариант C', 'Вариант D'],
                answer: 'Вариант A',
                explanation: 'Официальный разбор задачи от методической комиссии Indigo Academy West.',
              },
            ];

      db.prepare(
        `INSERT INTO iqa_papers (
          title, subject, grade, year, term, paper_code,
          duration_minutes, max_score, topics_json, has_answer_key,
          sample_questions_json, file_url, download_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 0, ?)`
      ).run(
        title,
        body.subject || 'Mathematics',
        Number(body.grade) || 9,
        Number(body.year) || 2026,
        body.term || 'Quarter 1',
        paper_code,
        Number(body.duration_minutes) || 60,
        Number(body.max_score) || 100,
        JSON.stringify(Array.isArray(body.topics_covered) ? body.topics_covered : ['Общий модуль IQA']),
        JSON.stringify(defaultQuestions),
        file_url,
        new Date().toISOString()
      );

      sendJson(res, 201, { papers: getAllPapers() });
      return true;
    }

    const paperIdMatch = pathname.match(/^\/api\/admin\/papers\/(\d+)$/);
    if (paperIdMatch && method === 'DELETE') {
      const id = Number(paperIdMatch[1]);
      db.prepare('DELETE FROM iqa_papers WHERE id = ?').run(id);
      sendJson(res, 200, { papers: getAllPapers() });
      return true;
    }

    // Admin Suggestions Moderation (status + official reply + visibility)
    const suggestionIdMatch = pathname.match(/^\/api\/admin\/suggestions\/(\d+)$/);
    if (suggestionIdMatch && method === 'PATCH') {
      const id = Number(suggestionIdMatch[1]);
      const body = await readJsonBody<{
        status?: string;
        admin_reply?: string;
        is_public?: boolean;
      }>(req);

      db.prepare(
        `UPDATE suggestions
         SET status = COALESCE(?, status),
             admin_reply = COALESCE(?, admin_reply),
             is_public = COALESCE(?, is_public)
         WHERE id = ?`
      ).run(
        body.status ?? null,
        body.admin_reply !== undefined ? body.admin_reply.trim() : null,
        body.is_public !== undefined ? (body.is_public ? 1 : 0) : null,
        id
      );

      sendJson(res, 200, { suggestions: getSuggestions(true) });
      return true;
    }

    if (suggestionIdMatch && method === 'DELETE') {
      const id = Number(suggestionIdMatch[1]);
      db.prepare('DELETE FROM suggestions WHERE id = ?').run(id);
      sendJson(res, 200, { suggestions: getSuggestions(true) });
      return true;
    }

    // Admin Social Links Update / Create
    const socialIdMatch = pathname.match(/^\/api\/admin\/socials\/(\d+)$/);
    if (socialIdMatch && method === 'PUT') {
      const id = Number(socialIdMatch[1]);
      const body = await readJsonBody<{
        handle?: string;
        url?: string;
        description?: string;
        subscribers_label?: string;
        is_active?: boolean;
      }>(req);

      db.prepare(
        `UPDATE social_links
         SET handle = ?, url = ?, description = ?, subscribers_label = ?, is_active = ?
         WHERE id = ?`
      ).run(
        (body.handle || '').trim(),
        (body.url || '').trim(),
        (body.description || '').trim(),
        (body.subscribers_label || '').trim(),
        body.is_active ? 1 : 0,
        id
      );

      sendJson(res, 200, { socials: getAllSocials(false) });
      return true;
    }

    sendJson(res, 404, { error: `Маршрут ${method} ${pathname} не найден` });
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
    if (message === 'PAYLOAD_TOO_LARGE') {
      sendJson(res, 413, { error: 'Слишком большой размер запроса' });
      return true;
    }
    if (message.includes('UNIQUE constraint failed')) {
      sendJson(res, 409, { error: 'Запись с таким уникальным кодом уже существует' });
      return true;
    }
    console.error('[API Error]', err);
    sendJson(res, 500, { error: 'Внутренняя ошибка сервера Indigo Academy West' });
    return true;
  }
}

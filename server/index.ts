import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './apiRouter.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT) || 4000;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  const handled = await handleApiRequest(req, res);
  if (handled) return;

  const urlObj = new URL(req.url || '/', 'http://localhost');
  const safePath = join(DIST_DIR, urlObj.pathname);
  if (existsSync(safePath) && statSync(safePath).isFile()) {
    const ext = extname(safePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(readFileSync(safePath));
    return;
  }

  const indexHtml = join(DIST_DIR, 'index.html');
  if (existsSync(indexHtml)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(readFileSync(indexHtml));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Indigo Academy West Server running on http://localhost:${PORT}`);
});

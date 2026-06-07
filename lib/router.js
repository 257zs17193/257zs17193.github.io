/**
 * ルーティング処理
 * リクエストの URL とメソッドに基づいて適切なハンドラに振り分ける
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pug from 'pug';
import { postsHandler } from './posts-handler.js';
import { handleLogout, serveStaticFile, handle404 } from './handler-util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function router(req, res, user) {
  const { method, url } = req;

  console.info(`[${new Date().toLocaleString('ja-JP')}] ${method} ${url} - User: ${user || 'anonymous'}`);

  // GET / - トップページ
  if (method === 'GET' && url === '/') {
    try {
      const html = pug.renderFile(
        path.join(process.cwd(), 'views/index.pug')
      );
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    } catch (err) {
      console.error('Render error:', err);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>500 Internal Server Error</h1>');
      return;
    }
  }

  // GET /favicon.ico
  if (method === 'GET' && url === '/favicon.ico') {
    return serveStaticFile(res, 'public/favicon.ico', 'image/x-icon');
  }

  // 静的ファイル配信（public/）
  if (method === 'GET' && url.startsWith('/')) {
    const ext = path.extname(url);
    const filePath = path.join(process.cwd(), 'public', url.substring(1));

    // public フォルダ内のファイル確認
    if (filePath.startsWith(path.join(process.cwd(), 'public')) && 
        fs.existsSync(filePath) && 
        fs.statSync(filePath).isFile()) {
      
      const contentType = {
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
      }[ext] || 'application/octet-stream';

      return serveStaticFile(res, `public${url}`, contentType);
    }
  }

  // POST /posts, GET /posts, POST /posts/:id/delete
  if (url.startsWith('/posts')) {
    return postsHandler(req, res, user);
  }

  // GET /logout
  if (method === 'GET' && url === '/logout') {
    return handleLogout(res);
  }

  // その他 404
  return handle404(res);
}

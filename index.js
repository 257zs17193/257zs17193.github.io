/**
 * メインサーバーファイル
 * HTTPサーバー起動、Basic認証設定
 */

import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { router } from './lib/router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 環境変数
const PORT = process.env.PORT || 8000;
const DB_URL = process.env.DATABASE_URL;

// デバッグログ
console.log('[DEBUG] Port:', PORT);
console.log('[DEBUG] Database URL:', DB_URL ? 'Set' : 'NOT SET');
console.log('[DEBUG] Node Env:', process.env.NODE_ENV);

/**
 * ユーザー認証データ（.htpasswd から読み込み）
 * フォーマット: username:password
 */
function loadUsers() {
  const htpasswdPath = path.join(process.cwd(), '.htpasswd');
  const content = fs.readFileSync(htpasswdPath, 'utf-8');
  const users = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return; // 空行スキップ
    
    const [username, password] = trimmed.split(':');
    if (username && password) {
      users[username] = password;
      console.log(`[Init] Loaded user: ${username}`);
    }
  });
  
  console.log(`[Init] Total users loaded: ${Object.keys(users).length}`);
  return users;
}

const validUsers = loadUsers();

/**
 * Basic認証チェック関数
 */
function checkBasicAuth(req, res, callback) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="Portfolio Chat Service"',
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end('<h1>401 Unauthorized</h1><p>ユーザー認証が必要です</p>');
    return;
  }

  const [scheme, credentials] = authHeader.split(' ');
  
  if (scheme !== 'Basic') {
    res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>401 Unauthorized</h1>');
    return;
  }

  const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
  
  console.log(`[Auth] Username: ${username}, Password received: ${password ? 'yes' : 'no'}`);
  console.log(`[Auth] Valid users:`, Object.keys(validUsers));
  console.log(`[Auth] User password match:`, validUsers[username] === password);
  
  if (validUsers[username] === password) {
    console.log(`[Auth] ✓ User ${username} authenticated successfully`);
    callback(username);
  } else {
    console.log(`[Auth] ✗ Authentication failed for user ${username}`);
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="Portfolio Chat Service"',
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end('<h1>401 Unauthorized</h1><p>ユーザー名またはパスワードが間違っています</p>');
  }
}

/**
 * HTTPサーバー作成
 * 認証が不要なエンドポイントとそれ以外を判定
 */
const server = http.createServer((req, res) => {
  // CORS対応
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  // OPTIONS プリフライト対応
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const { url } = req;

  // 認証が不要なエンドポイント
  const noAuthEndpoints = ['/', '/favicon.ico', '/logout'];
  const isStaticFile = url.startsWith('/') && 
    (url.includes('.') || url.startsWith('/public/') || url.startsWith('/style.'));

  if (noAuthEndpoints.includes(url) || isStaticFile) {
    // 認証なしでルーティング
    return router(req, res, null);
  }

  // その他のエンドポイントは認証必須
  checkBasicAuth(req, res, (user) => {
    router(req, res, user);
  });
});

/**
 * エラーハンドリング
 */
server.on('error', err => {
  console.error('[Server Error]', err);
});

server.on('clientError', err => {
  console.error('[Client Error]', err);
});

/**
 * サーバー起動
 */
server.listen(PORT, () => {
  console.info(`Server running at: http://localhost:${PORT}`);
});

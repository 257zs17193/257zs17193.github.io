/**
 * ハンドラユーティリティ
 * ログアウト、静的ファイル配信、エラー処理等
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * GET /logout - ログアウト処理
 * Basic認証をクリアするためにクライアント側で無効な資格情報で上書きする
 */
export function handleLogout(res) {
  res.writeHead(200, {
    'WWW-Authenticate': 'Basic realm="Portfolio Chat Service"',
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ログアウト</title>
      <style>
        body {
          font-family: 'Noto Sans JP', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .logout-container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
        }
        a {
          display: inline-block;
          padding: 10px 25px;
          background-color: #00a0a0;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          transition: background-color 0.3s;
        }
        a:hover {
          background-color: #007d7d;
        }
      </style>
    </head>
    <body>
      <div class="logout-container">
        <h1>ログアウトしました</h1>
        <p>正常にログアウトしました。</p>
        <a href="/">ホームに戻る</a>
      </div>
      <script>
        (function() {
          const fakeUrl = window.location.protocol + '//logout:logout@' + window.location.host + '/_dummy_auth';
          const xhr = new XMLHttpRequest();
          xhr.open('GET', fakeUrl, true);
          xhr.setRequestHeader('Authorization', 'Basic ' + btoa('logout:logout'));
          xhr.send();
        })();
      </script>
    </body>
    </html>
  `);
}

/**
 * 静的ファイル配信
 */
export function serveStaticFile(res, filePath, contentType) {
  const fullPath = path.join(process.cwd(), filePath);

  // セキュリティチェック: ファイルパストラバーサル対策
  if (!fullPath.startsWith(process.cwd())) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>403 Forbidden</h1>');
    return;
  }

  if (!fs.existsSync(fullPath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1>');
    return;
  }

  try {
    const content = fs.readFileSync(fullPath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    console.error('Static file error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500 Internal Server Error</h1>');
  }
}

/**
 * 404 Not Found
 */
export function handle404(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>404 Not Found</title>
      <style>
        body { font-family: 'Noto Sans JP', sans-serif; text-align: center; padding: 2rem; }
        h1 { color: #dc3545; }
        p { color: #666; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>404 Not Found</h1>
      <p>指定されたページが見つかりません。</p>
      <a href="/">トップページに戻る</a>
    </body>
    </html>
  `);
}

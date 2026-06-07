/**
 * チャット投稿関連のハンドラ
 * 投稿フォーム表示、投稿受信、保存、削除処理
 */

import pug from 'pug';
import { URLSearchParams } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Cookies from 'cookies';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DBは使わず、ファイルベースで投稿を管理
// ★今後の課題
const USE_DB = false;
const POSTS_JSON = path.join(process.cwd(), 'data', 'posts.json');
const crypto = require('node:crypto');

const oneTimeTokenMap = new Map(); // キーをユーザ名、値をトークンとする連想配列

async function readPostsFile() {
  try {
    await fs.promises.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    const buf = await fs.promises.readFile(POSTS_JSON, 'utf-8').catch(() => null);
    if (!buf) return [];
    return JSON.parse(buf);
  } catch (err) {
    console.error('Read posts file error:', err);
    return [];
  }
}

async function writePostsFile(posts) {
  try {
    await fs.promises.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    await fs.promises.writeFile(POSTS_JSON, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Write posts file error:', err);
  }
}

/**
 * GET /posts - 投稿一覧フォーム表示
 * POST /posts - 投稿受信・保存
 */
export async function postsHandler(req, res, user) {
  const { method, url } = req;

  try {
    if (method === 'GET' && url === '/posts') {
      return await getPostsList(req, res, user);
    }

    if (method === 'POST' && url === '/posts') {
      return await createPost(req, res, user);
    }

    // POST /posts/:id/delete - 投稿削除
    const deleteMatch = url.match(/^\/posts\/(\d+)\/delete$/);
    if (method === 'POST' && deleteMatch) {
      const postId = parseInt(deleteMatch[1]);
      return await deletePost(req, res, user, postId);
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1>');
  } catch (err) {
    console.error('Posts handler error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500 Internal Server Error</h1>');
  }
}

/**
 * GET /posts - 投稿一覧表示
 */
async function getPostsList(req, res, user) {
  try {
    const cookies = new Cookies(req, res);
    const lastPostTime = cookies.get('last_post_time');

    // DBまたはファイルから投稿一覧を取得
    let posts = [];
    if (USE_DB) {
      const prismaClient = getPrismaClient();
      posts = await prismaClient.post.findMany({
        orderBy: { id: 'desc' },
        take: 100,
      });
    } else {
      posts = await readPostsFile();
      posts = posts.slice().reverse().slice(0, 100);
    }

    const oneTimeToken = crypto.randomBytes(8).toString('hex');
    oneTimeTokenMap.set(user, oneTimeToken);
    // テンプレート描画
    const html = pug.renderFile(
      path.join(process.cwd(), 'views/posts.pug'),
      {
        user: user,
        posts: posts,
        lastPostTime: lastPostTime 
          ? new Date(parseInt(lastPostTime)).toLocaleString('ja-JP')
          : null,
        oneTimeToken: oneTimeToken
      }
    );

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (err) {
    console.error('Get posts error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500 Error</h1><p>' + err.message + '</p>');
  }
}

/**
 * POST /posts - 投稿受信・保存
 */
async function createPost(req, res, user) {
  try {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', async () => {
      try {
        // URLSearchParams でフォームデータを解析
        const params = new URLSearchParams(data);
        const content = params.get('content')?.trim();
        const requestedOneTimeToken = params.get('oneTimeToken');

        // 入力検証
        if (!content || content.length === 0 || content.length > 1000) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>400 Bad Request</h1><p>投稿内容は1～1000字である必要があります</p>');
          return;
        }

        // トークンが空の場合のガード句
        if (!requestedOneTimeToken) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('未対応のリクエストです');
          return;
        }

        // トークンが違っていた場合のガード句
        if (oneTimeTokenMap.get(user) !== requestedOneTimeToken) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('未対応のリクエストです');
          return;
        }

        // DBに保存 またはファイル保存
        let post = null;
        if (USE_DB) {
          const prismaClient = getPrismaClient();
          post = await prismaClient.post.create({
            data: {
              content: content,
              postedBy: user,
            },
          });
        } else {
          const posts = await readPostsFile();
          const nextId = posts.length > 0 ? (Number(posts[posts.length-1].id) || posts.length) + 1 : 1;
          post = { id: nextId, content, postedBy: user, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          posts.push(post);
          await writePostsFile(posts);
        }

        // 保存完了後に利用済みのトークンを削除
        oneTimeTokenMap.delete(user);

        // Cookie に最後の投稿時刻を保存
        const cookies = new Cookies(req, res);
        cookies.set('last_post_time', Date.now().toString(), {
          maxAge: 24 * 60 * 60 * 1000, // 24時間
        });

        // 303 See Other でリダイレクト
        res.writeHead(303, { 'Location': '/posts' });
        res.end();
      } catch (err) {
        console.error('Create post error:', err);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>500 Error</h1><p>' + err.message + '</p>');
      }
    });

    req.on('error', err => {
      console.error('Request error:', err);
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>400 Bad Request</h1>');
    });
  } catch (err) {
    console.error('Create post handler error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500 Error</h1>');
  }
}

/**
 * POST /posts/:id/delete - 投稿削除
 * サーバー側で認可チェック
 */
async function deletePost(req, res, user, postId) {
  try {
    // DBまたはファイルから投稿情報を取得
    let post = null;
    if (USE_DB) {
      const prismaClient = getPrismaClient();
      post = await prismaClient.post.findUnique({ where: { id: postId } });
    } else {
      const posts = await readPostsFile();
      post = posts.find(p => Number(p.id) === Number(postId));
    }

    if (!post) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    // サーバー側の認可チェック
    const isDeletable = user === post.postedBy || user === 'admin';
    if (!isDeletable) {
      res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>403 Forbidden</h1><p>削除権限がありません</p>');
      return;
    }

    // 削除実行
    if (USE_DB) {
      const prismaClient = getPrismaClient();
      await prismaClient.post.delete({ where: { id: postId } });
    } else {
      const posts = await readPostsFile();
      const filtered = posts.filter(p => Number(p.id) !== Number(postId));
      await writePostsFile(filtered);
    }

    // 303 See Other でリダイレクト
    res.writeHead(303, { 'Location': '/posts' });
    res.end();
  } catch (err) {
    console.error('Delete post error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500 Error</h1><p>' + err.message + '</p>');
  }
}

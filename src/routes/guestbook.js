const { Hono } = require('hono');
const { html } = require('hono/html');
const layout = require('../layout');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

const app = new Hono();

app.get('/', async (c) => {
  const { user } = c.get('session') ?? {};

  // コメントを新しい順に取得
  const comments = await prisma.comment.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // 日時のフォーマット
  comments.forEach((comment) => {
    comment.formattedCreatedAt = dayjs(comment.createdAt).tz().format('YYYY/MM/DD HH:mm');
  });

  return c.html(
    layout(
      c,
      'Guestbook',
      html`
        <div class="my-4">
          <div class="p-4 bg-light rounded-3">
            <h1 class="text-body">
              <i class="bi bi-book"></i> Guestbook
            </h1>
            <p class="lead">
              このポートフォリオサイトへの訪問コメントを残すことができます。<br>
              GitHubアカウントでログインしてコメントを投稿してください。
            </p>
          </div>
        </div>

        ${user
          ? html`
              <div class="card my-4">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="bi bi-pencil-square"></i> コメントを投稿
                  </h5>
                  <form id="comment-form">
                    <div class="mb-3">
                      <textarea
                        class="form-control"
                        id="comment-content"
                        rows="4"
                        placeholder="コメントを入力..."
                        required
                      ></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-send"></i> 投稿
                    </button>
                  </form>
                </div>
              </div>
            `
          : html`
              <div class="alert alert-info my-4">
                <i class="bi bi-info-circle"></i>
                コメントを投稿するには
                <a href="/login" class="alert-link">ログイン</a>
                が必要です。
              </div>
            `}

        <h3 class="my-4">
          <i class="bi bi-chat-left-text"></i> コメント一覧
          <span class="badge bg-secondary">${comments.length}</span>
        </h3>

        <div id="comments-container">
          ${comments.length > 0
            ? comments.map(
                (comment) => html`
                  <div class="card mb-3 comment-item" data-comment-id="${comment.commentId}">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start">
                        <div class="d-flex">
                          <img
                            src="https://github.com/${comment.user.username}.png"
                            alt="${comment.user.username}"
                            class="rounded-circle me-2"
                            width="40"
                            height="40"
                          />
                          <div>
                            <h6 class="mb-0">
                              <a href="https://github.com/${comment.user.username}" target="_blank" class="text-decoration-none">
                                ${comment.user.username}
                              </a>
                            </h6>
                            <small class="text-muted">${comment.formattedCreatedAt}</small>
                          </div>
                        </div>
                        ${user && user.id === comment.userId
                          ? html`
                              <button
                                class="btn btn-sm btn-outline-danger delete-comment"
                                data-comment-id="${comment.commentId}"
                              >
                                <i class="bi bi-trash"></i> 削除
                              </button>
                            `
                          : ''}
                      </div>
                      <div class="mt-3">
                        <p class="mb-0" style="white-space: pre-wrap;">${comment.content}</p>
                      </div>
                    </div>
                  </div>
                `,
              )
            : html`
                <div class="alert alert-secondary">
                  まだコメントがありません。最初のコメントを投稿してみましょう！
                </div>
              `}
        </div>
      `,
    ),
  );
});

module.exports = app;

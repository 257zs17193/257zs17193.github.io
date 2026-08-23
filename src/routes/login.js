const { Hono } = require('hono');
const { html } = require('hono/html');
const layout = require('../layout');

const app = new Hono();

app.get('/', (c) => {
  return c.html(
    layout(
      c,
      'Login',
      html`
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card mt-5">
              <div class="card-body text-center">
                <h2 class="card-title mb-4">
                  <i class="bi bi-book"></i> Guestbookにログイン
                </h2>
                <p class="card-text mb-4">
                  GitHubアカウントでログインして、訪問者コメントを投稿できます。
                </p>
                <a href="/auth/github" class="btn btn-primary btn-lg">
                  <i class="bi bi-github"></i> GitHub でログイン
                </a>
                <div class="mt-3">
                  <a href="/" class="text-muted">トップページに戻る</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
    ),
  );
});

module.exports = app;

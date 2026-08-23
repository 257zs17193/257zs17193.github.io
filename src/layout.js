const { html } = require('hono/html');

function layout(c, title, body) {
  const { user } = c.get('session') ?? {};
  title = title ? `${title} - My Portfolio` : 'My Portfolio';
  return html`
    <!doctype html>
    <html lang="ja">
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/stylesheets/bundle.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
      </head>
      <body>
        <nav class="navbar navbar-expand-md navbar-light bg-light">
          <div class="container-fluid">
            <a class="navbar-brand" href="/">My Portfolio</a>
            <button
              class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarResponsive"
              aria-controls="navbarResponsive"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            <div id="navbarResponsive" class="collapse navbar-collapse">
              <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                  <a class="nav-link" href="/">Home</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/guestbook">Guestbook</a>
                </li>
                ${user
                  ? html`
                      <li class="nav-item">
                        <a class="nav-link" href="/logout">
                          <i class="bi bi-box-arrow-right"></i> ${user.login} をログアウト
                        </a>
                      </li>
                    `
                  : html`
                      <li class="nav-item">
                        <a class="nav-link" href="/login">
                          <i class="bi bi-box-arrow-in-right"></i> ログイン
                        </a>
                      </li>
                    `}
              </ul>
            </div>
          </div>
        </nav>
        <div class="container mt-4">${body}</div>
        <script src="/javascripts/bundle.js"></script>
      </body>
    </html>
  `;
}

module.exports = layout;

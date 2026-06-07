/**
 * フロントエンドユーティリティ
 * クライアント側の補助機能とUI制御
 */

/**
 * フォーム入力検証
 */
function validatePostContent(content) {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: '投稿内容は空にできません' };
  }
  
  if (content.length > 1000) {
    return { valid: false, error: '投稿内容は1000字以下である必要があります' };
  }
  
  return { valid: true };
}

/**
 * 日時フォーマット（ユーティリティ）
 */
function formatDateTime(date) {
  return new Date(date).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * XSS対策：テキストのエスケープ
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * クッキー保存
 */
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

/**
 * クッキー取得
 */
function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const [key, val] = v.split('=');
    return key === name ? decodeURIComponent(val) : r;
  }, null);
}

/**
 * テーマを適用
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  } else {
    document.documentElement.classList.remove('dark-theme');
  }

  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? 'ライトモード' : 'ダークモード';
  }
}

/**
 * ダークモード初期化
 */
function initDarkMode() {
  const savedTheme = getCookie('theme');
  const theme = savedTheme || 'light';
  applyTheme(theme);

  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.addEventListener('click', function() {
      const nextTheme = document.documentElement.classList.contains('dark-theme') ? 'light' : 'dark';
      applyTheme(nextTheme);
      setCookie('theme', nextTheme, 365);
    });
  }
}

/**
 * ページロード時の初期化
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Utility scripts loaded');
  initDarkMode();
});

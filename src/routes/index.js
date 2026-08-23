const { Hono } = require('hono');
const fs = require('fs');
const path = require('path');

const app = new Hono();

app.get('/', (c) => {
  // 既存のindex.htmlをそのまま返す
  const indexPath = path.join(process.cwd(), 'index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');
  return c.html(html);
});

module.exports = app;

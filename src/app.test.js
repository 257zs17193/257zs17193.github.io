'use strict';

const app = require('./app');

describe('Honoアプリケーション', () => {
  test('アプリケーションが正しく初期化されること', () => {
    expect(app).toBeDefined();
    expect(app.fetch).toBeDefined();
  });

  test('トップページが200を返すこと', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
  });

  test('存在しないページは404を返すこと', async () => {
    const res = await app.request('/nonexistent');
    expect(res.status).toBe(404);
  });

  test('ログインページが200を返すこと', async () => {
    const res = await app.request('/login');
    expect(res.status).toBe(200);
  });
});

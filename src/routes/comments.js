const { Hono } = require('hono');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
const ensureAuthenticated = require('../middlewares/ensure-authenticated');

const app = new Hono();

// コメント投稿API
app.post('/', ensureAuthenticated(), async (c) => {
  const { user } = c.get('session');
  const body = await c.req.json();
  const content = body.content.trim().slice(0, 1000);

  if (!content) {
    return c.json({ status: 'error', message: 'コメント内容が空です' }, 400);
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: user.id,
    },
    include: {
      user: true,
    },
  });

  return c.json({ status: 'OK', comment });
});

// コメント削除API
app.delete('/:commentId', ensureAuthenticated(), async (c) => {
  const { user } = c.get('session');
  const commentId = parseInt(c.req.param('commentId'), 10);

  // コメントの所有者確認
  const comment = await prisma.comment.findUnique({
    where: { commentId },
  });

  if (!comment) {
    return c.json({ status: 'error', message: 'コメントが見つかりません' }, 404);
  }

  if (comment.userId !== user.id) {
    return c.json({ status: 'error', message: '削除権限がありません' }, 403);
  }

  await prisma.comment.delete({
    where: { commentId },
  });

  return c.json({ status: 'OK' });
});

module.exports = app;

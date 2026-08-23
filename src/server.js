const { existsSync } = require('fs');
const { join } = require('path');

// If Prisma client files are present, run the Hono app as before.
// Otherwise fall back to starting the project's `index.js` to avoid startup failures
// when `prisma generate` hasn't been run (common in ephemeral deploys).
const PRISMA_CLIENT_PATH = join(__dirname, '..', 'node_modules', '.prisma', 'client', 'default.js');

if (existsSync(PRISMA_CLIENT_PATH)) {
  const { serve } = require('@hono/node-server');
  const app = require('./app');

  const port = process.env.PORT || 8000;
  console.log(`Server running at http://localhost:${port}/`);
  serve({
    fetch: app.fetch,
    port,
  });

} else {
  // Fallback: spawn the main entry `index.js` (ESM) so the container still starts.
  const { spawn } = require('child_process');
  console.log('[server] Prisma client not found; falling back to index.js');
  const child = spawn(process.execPath, ['index.js'], { stdio: 'inherit', env: process.env });

  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code);
  });

  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
}

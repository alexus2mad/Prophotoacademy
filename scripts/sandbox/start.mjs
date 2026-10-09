import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { mkdir, readFile, readdir, open, unlink } from 'node:fs/promises';
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';
import { prepareSandbox } from './prepare.mjs';
import { startServices } from './services.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const directory = path.join(root, '.data/learning-sandbox');
const bookingRoot = path.resolve(
  process.env.SANDBOX_BOOKING_ROOT || path.join(root, '../ps-booking-integration'),
);
await mkdir(directory, { recursive: true });
const lockPath = path.join(directory, 'runtime.lock');
try {
  const old = Number(await readFile(lockPath, 'utf8'));
  try {
    process.kill(old, 0);
    throw new Error('Sandbox is already running (PID ' + old + ')');
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
  await unlink(lockPath);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const lock = await open(lockPath, 'wx');
await lock.writeFile(String(process.pid));
await lock.close();
const secret = randomBytes(32).toString('hex'),
  token = randomBytes(32).toString('hex');
let db, bookingDb, services, bookingServer, child, bookingApp;
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  child?.kill();
  bookingApp?.locals.closeBookingEvents?.();
  for (const server of [services, bookingServer])
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  await bookingDb?.close();
  await db?.close();
  await unlink(lockPath).catch(() => {});
}
process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());
try {
  // Import the real booking application, never its environment-loading entrypoint.
  const { openDatabase, migrate } = await import(
    pathToFileURL(path.join(bookingRoot, 'server/database.js'))
  );
  const { createApp } = await import(pathToFileURL(path.join(bookingRoot, 'server/app.js')));
  const { publicAssets } = await import(
    pathToFileURL(path.join(bookingRoot, 'server/public-assets.js'))
  );
  const bookingAssets = publicAssets();
  const managerPage = bookingAssets
    .render(bookingAssets.page('academy.html'))
    .replace('https://www.prophotoacademy.com.ua/admin', 'http://127.0.0.1:3200/admin/courses')
    .replace('<span>Академія</span>', '<span>Академія · Локальний тест · Оплата вимкнена</span>');
  const stage = await prepareSandbox(root);
  db = await PGlite.create(path.join(directory, 'academy'));
  for (const name of (await readdir(path.join(root, 'supabase/migrations'))).sort()) {
    if (!name.endsWith('.sql')) continue;
    await db.exec(await readFile(path.join(root, 'supabase/migrations', name), 'utf8'));
  }
  bookingDb = await openDatabase({ dataDir: path.join(directory, 'booking') });
  await migrate(bookingDb);
  services = await startServices({ db, directory, token });
  bookingApp = createApp(bookingDb, {
    academy: { origin: 'http://127.0.0.1:3200', secret },
    wayforpay: {},
  });
  // Keep all financial and booking mutations outside this learning rehearsal.
  bookingServer = createServer((request, response) => {
    if (request.headers.host !== '127.0.0.1:3201') {
      response.writeHead(403);
      return response.end('Loopback host required');
    }
    if (request.url.split('?')[0] === '/academy.html' && ['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Frame-Options': 'DENY',
        'X-Robots-Tag': 'noindex, nofollow',
      });
      return response.end(request.method === 'HEAD' ? '' : managerPage);
    }
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
      !/^\/api\/(academy\/|admin\/(demo-login|login|logout)$)/.test(request.url.split('?')[0])
    ) {
      response.writeHead(503, { 'Content-Type': 'application/json' });
      return response.end(
        JSON.stringify({ error: { message: 'Оплата й бронювання вимкнені в локальному тесті' } }),
      );
    }
    bookingApp(request, response);
  });
  await new Promise((resolve, reject) => {
    bookingServer.once('error', reject);
    bookingServer.listen(3201, '127.0.0.1', resolve);
  });
  const env = {};
  for (const key of [
    'PATH',
    'Path',
    'SystemRoot',
    'WINDIR',
    'TEMP',
    'TMP',
    'USERPROFILE',
    'APPDATA',
    'LOCALAPPDATA',
    'ComSpec',
    'PATHEXT',
  ])
    if (process.env[key]) env[key] = process.env[key];
  Object.assign(env, {
    NODE_ENV: 'development',
    NEXT_TELEMETRY_DISABLED: '1',
    SANDBOX_RPC_URL: 'http://127.0.0.1:3202',
    SANDBOX_RPC_TOKEN: token,
    PS_BOOKING_MANAGEMENT_SECRET: secret,
    BOOTSTRAP_ADMIN_EMAIL: 'manager@example.test',
    NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3200',
    NEXT_PUBLIC_ACADEMY_URL: 'http://127.0.0.1:3200',
    NEXT_PUBLIC_HUB_URL: 'http://127.0.0.1:3200/hub',
    NEXT_PUBLIC_PS_BOOKING_ADMIN_URL: 'http://127.0.0.1:3201/academy.html',
    NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:3202',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'local-test-only',
    NEXT_PUBLIC_SANITY_PROJECT_ID: 'localtest',
    SANITY_LEARNING_DATASET: 'learning',
    SANITY_LEARNING_WRITE_TOKEN: 'local-test-only',
    DATABASE_URL: 'postgresql://sandbox.invalid/local',
  });
  child = spawn(
    process.execPath,
    [
      path.join(root, 'node_modules/next/dist/bin/next'),
      'dev',
      stage,
      '--hostname',
      '127.0.0.1',
      '--port',
      '3200',
    ],
    { cwd: stage, env, stdio: 'inherit', windowsHide: true },
  );
  child.once('exit', () => void stop());
  console.log(
    'Local learning sandbox: http://127.0.0.1:3200/sandbox\nManagement: http://127.0.0.1:3201/academy.html\nmanager@example.test / student@example.test — code 123456\nPayments disabled. Saved data: ' +
      directory,
  );
} catch (error) {
  console.error(error);
  await stop();
  process.exitCode = 1;
}

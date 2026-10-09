import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { documentStore, testIdentity, remoteTransactions, failure } from './store.mjs';

async function body(request, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw failure('File too large', 413);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export async function startServices({ db, directory, token, port = 3202 }) {
  await mkdir(path.join(directory, 'media'), { recursive: true });
  const documents = await documentStore(path.join(directory, 'documents.json'));
  const identity = testIdentity(),
    transactions = remoteTransactions(db),
    permits = new Map();
  const mediaPath = (id) => {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw failure('Invalid media identity');
    return path.join(directory, 'media', id);
  };
  function permit(id, mode, mime) {
    const key = randomBytes(32).toString('hex');
    permits.set(key, { id, mode, mime, expires: Date.now() + 3600000 });
    return `http://127.0.0.1:${port}/${mode}/${key}`;
  }
  async function action(name, value = {}) {
    if (name === 'db.query') return transactions.query(value);
    if (name === 'db.begin') return transactions.begin();
    if (name === 'db.commit' || name === 'db.rollback')
      return transactions.end(value.id, name === 'db.commit');
    if (name === 'auth.send') return identity.send(value.email);
    if (name === 'auth.verify') return identity.verify(value.email, value.code);
    if (name === 'auth.user') return identity.user(value.token);
    if (name === 'sanity.get') return documents.get(value.id);
    if (name === 'sanity.commit') return documents.commit(value);
    if (name === 'media.upload') {
      mediaPath(value.id);
      return { url: permit(value.id, 'upload', value.mime) };
    }
    if (name === 'media.info')
      return JSON.parse(await readFile(mediaPath(value.id) + '.json', 'utf8'));
    if (name === 'media.read') return { url: permit(value.id, 'read') };
    throw failure('Unsupported sandbox action', 404);
  }
  const server = createServer(async (request, response) => {
    const json = (status, data) => {
      response.writeHead(status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      });
      response.end(JSON.stringify(data));
    };
    try {
      if (request.headers.host !== `127.0.0.1:${port}`)
        throw failure('Loopback host required', 403);
      const url = new URL(request.url, `http://127.0.0.1:${port}`);
      if (url.pathname === '/rpc') {
        if (
          request.method !== 'POST' ||
          request.headers.origin ||
          request.headers.authorization !== 'Bearer ' + token
        )
          throw failure('Unauthorized', 401);
        const input = JSON.parse((await body(request, 2097152)).toString());
        return json(200, { result: await action(input.action, input.value) });
      }
      if (request.headers.origin && request.headers.origin !== 'http://127.0.0.1:3200')
        throw failure('Origin denied', 403);
      response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3200');
      response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
      if (request.method === 'OPTIONS') {
        response.writeHead(204);
        return response.end();
      }
      const [, mode, key] = url.pathname.split('/'),
        permission = permits.get(key);
      if (!permission || permission.mode !== mode || permission.expires < Date.now())
        throw failure('Link expired', 403);
      const file = mediaPath(permission.id);
      if (mode === 'upload' && request.method === 'PUT') {
        const bytes = await body(request, 52428800);
        await writeFile(file, bytes);
        const info = { size: bytes.length, mime: permission.mime };
        if (permission.mime === 'video/mp4') {
          const executable = process.env.SANDBOX_FFPROBE || 'D:/ffmpeg/bin/ffprobe.exe';
          const { stdout } = await promisify(execFile)(executable, [
            '-v',
            'error',
            '-show_entries',
            'format=duration',
            '-of',
            'default=noprint_wrappers=1:nokey=1',
            file,
          ]);
          info.duration = Number(stdout.trim());
        }
        await writeFile(file + '.json', JSON.stringify(info));
        permits.delete(key);
        return json(200, { saved: true });
      }
      if (mode !== 'read' || !['GET', 'HEAD'].includes(request.method))
        throw failure('Method denied', 405);
      const info = JSON.parse(await readFile(file + '.json', 'utf8')),
        { size } = await stat(file);
      const match = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || '');
      const start = match ? Number(match[1]) : 0,
        end = match?.[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
      if (start > end || start >= size) throw failure('Invalid range', 416);
      response.writeHead(match ? 206 : 200, {
        'Content-Type': info.mime,
        'Content-Length': end - start + 1,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
        ...(match ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}),
      });
      if (request.method === 'HEAD') return response.end();
      createReadStream(file, { start, end }).pipe(response);
    } catch (error) {
      json(error.status || 500, { error: error.message });
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return server;
}

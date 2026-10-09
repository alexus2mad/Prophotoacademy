import { randomUUID, randomBytes } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';

export function failure(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

// JSON is a separate store: publishing calls it while a SQL transaction is open.
export async function documentStore(file) {
  let documents;
  try {
    documents = JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    documents = {};
  }
  let tail = Promise.resolve();
  return {
    get: (id) => structuredClone(documents[id] || null),
    commit(command) {
      const operation = tail.then(async () => {
        const next = structuredClone(documents),
          changed = [];
        for (const patch of command.patches) {
          const old = next[patch.id];
          if (!old || old._rev !== patch.revision) throw failure('Чернетку вже змінено', 409);
          next[patch.id] = { ...old, ...patch.value, _id: patch.id, _rev: randomUUID() };
          changed.push(next[patch.id]);
        }
        for (const value of command.creates) {
          const id = value._id || randomUUID();
          if (next[id]) throw failure('Document already exists', 409);
          next[id] = { ...value, _id: id, _rev: randomUUID() };
          changed.push(next[id]);
        }
        await writeFile(file + '.tmp', JSON.stringify(next));
        await rename(file + '.tmp', file);
        documents = next;
        return changed;
      });
      tail = operation.catch(() => {});
      return operation;
    },
  };
}

export function testIdentity() {
  const accounts = new Map([
    ['manager@example.test', '00000000-0000-4000-8000-000000000001'],
    ['student@example.test', '00000000-0000-4000-8000-000000000002'],
    ['guest@example.test', '00000000-0000-4000-8000-000000000003'],
  ]);
  const pending = new Map(),
    sessions = new Map();
  return {
    send(email) {
      if (!accounts.has(email)) throw failure('Використайте email із локальної інструкції');
      pending.set(email, Date.now() + 600000);
      return true;
    },
    verify(email, code) {
      if (code !== '123456' || !(pending.get(email) > Date.now()))
        throw failure('Невірний або застарілий тестовий код', 401);
      pending.delete(email);
      const token = randomBytes(32).toString('hex');
      const user = { id: accounts.get(email), email, email_confirmed_at: new Date().toISOString() };
      sessions.set(token, { user, expires: Date.now() + 86400000 });
      return { token, user };
    },
    user(token) {
      const session = sessions.get(token);
      return session?.expires > Date.now() ? session.user : null;
    },
  };
}

export function remoteTransactions(db) {
  const active = new Map();
  const normalized = (result) => ({
    ...result,
    rowCount: result.affectedRows || result.rows.length,
  });
  return {
    query(value) {
      const connection = value.transaction ? active.get(value.transaction)?.connection : db;
      if (!connection) throw failure('Transaction expired', 409);
      return connection.query(value.text, value.values || []).then(normalized);
    },
    begin() {
      return new Promise((resolve, reject) => {
        const id = randomUUID();
        const state = {};
        state.done = db
          .transaction(async (connection) => {
            state.connection = connection;
            await new Promise((commit, rollback) => {
              state.commit = commit;
              state.rollback = () => rollback(failure('Transaction rolled back', 409));
              state.timer = setTimeout(state.rollback, 30000);
              active.set(id, state);
              resolve(id);
            });
          })
          .finally(() => {
            clearTimeout(state.timer);
            active.delete(id);
          });
        state.done.catch(reject);
      });
    },
    async end(id, commit) {
      const state = active.get(id);
      if (!state) throw failure('Transaction expired', 409);
      if (commit) {
        state.commit();
        await state.done;
      } else {
        state.rollback();
        await state.done.catch(() => {});
      }
      return true;
    },
  };
}

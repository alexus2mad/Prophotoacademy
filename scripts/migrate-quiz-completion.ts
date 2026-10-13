import './environment';
import { databasePool, transaction } from '../src/lib/database/client';
import { migrateQuizCompletion } from '../src/lib/learning/progress-migration';

try {
  const apply = process.argv.includes('--apply');
  const report = await transaction((db) => migrateQuizCompletion(db, apply));
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'preview', ...report }));
} finally {
  await databasePool().end();
}

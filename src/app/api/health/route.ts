import { databasePool } from '@/lib/database/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const result = await databasePool().query(
      'SELECT version FROM academy.migrations WHERE version=$1',
      ['202610090003'],
    );
    if (!result.rowCount) throw new Error('Database migration missing');
    return Response.json({ ok: true }, { headers });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers });
  }
}

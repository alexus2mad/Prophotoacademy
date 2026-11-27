import { databasePool, managedDatabase } from '../database/client';
import { database } from '../ledger';
import type { InquiryDelivery, InquiryRecord, StoredInquiry } from './types';

// Whether accepted inquiries are forwarded to the team; otherwise they are captured only.
export function inquiriesForwarded() {
  const url = process.env.MAKE_WEBHOOK_URL || '';
  if (!url.startsWith('https://')) return false;
  return managedDatabase() || process.env.NOTIFICATION_MODE === 'make';
}

function delivery(state: string | null, attempts: number | null): InquiryDelivery {
  if (state === 'delivered' || state === 'local' || state === 'canceled') return state;
  return attempts ? 'failed' : 'pending';
}

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined);

export function inquiryRecord(row: StoredInquiry): InquiryRecord {
  const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    name: text(data.name) || '—',
    contact: text(data.contact) || '—',
    message: text(data.message),
    programTitle: text(data.programTitle) || text(data.practiceTitle),
    packageName: text(data.packageName),
    topic: text(data.subjectTitle),
    source: text(data.source),
    site: text(data.site),
    marketingUpdates: data.marketingUpdates === true,
    delivery: delivery(row.state, row.attempts),
  };
}

export async function listInquiries(limit = 200): Promise<InquiryRecord[]> {
  if (managedDatabase()) {
    const rows = await databasePool().query<StoredInquiry>(
      `SELECT i.id, i.data, i.created_at, o.state, o.attempts
         FROM academy.inquiries i LEFT JOIN academy.outbox o ON o.id = i.id
        ORDER BY i.created_at DESC LIMIT $1`,
      [limit],
    );
    return rows.rows.map(inquiryRecord);
  }
  const rows = database()
    .prepare(
      `SELECT i.id, i.data, i.created_at, o.state, o.attempts
         FROM inquiries i LEFT JOIN outbox o ON o.id = i.id
        ORDER BY i.created_at DESC LIMIT ?`,
    )
    .all(limit) as StoredInquiry[];
  return rows.map(inquiryRecord);
}

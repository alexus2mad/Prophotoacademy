import { requireAdmin } from '@/lib/auth/server';
import { databasePool } from '@/lib/database/client';
import { mediaAccess } from '@/lib/learning/media';
import { mediaResponse } from '@/lib/learning/media-response';
import { errorResponse, HttpError } from '@/lib/http';
import type { AdminMediaProps } from '@/app/types';
export async function GET(request: Request, { params }: AdminMediaProps) {
  try {
    await requireAdmin();
    const { id, media } = await params;
    if (
      !(
        await databasePool().query('SELECT id FROM academy.media WHERE id=$1 AND course_id=$2', [
          media,
          id,
        ])
      ).rowCount
    )
      throw new HttpError(404, 'Матеріал не знайдено');
    return mediaResponse(request, await mediaAccess(media));
  } catch (error) {
    return errorResponse(error);
  }
}

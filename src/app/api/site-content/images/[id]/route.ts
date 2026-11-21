import type { IdRouteProps } from '@/app/types';
import { readLocalImage } from '@/lib/site-editor/media';
import { errorResponse } from '@/lib/http';

export async function GET(_request: Request, { params }: IdRouteProps) {
  try {
    const data = await readLocalImage((await params).id);
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': 'image/webp',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

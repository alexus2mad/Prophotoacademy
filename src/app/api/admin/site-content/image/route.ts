import { requireAdmin } from '@/lib/auth/server';
import { errorResponse, guardMutation } from '@/lib/http';
import { uploadPageImage } from '@/lib/site-editor/media';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await guardMutation(request, 'site-editor-image');
    return Response.json(
      { url: await uploadPageImage(request) },
      { status: 201, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

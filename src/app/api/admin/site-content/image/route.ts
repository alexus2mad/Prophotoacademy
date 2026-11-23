import { requireAdmin } from '@/lib/auth/server';
import { errorResponse, guardMutation } from '@/lib/http';
import { uploadPageImage } from '@/lib/site-editor/media';
import { libraryFilter, listLibraryImages } from '@/lib/site-editor/image-library/list';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const filters = libraryFilter(new URL(request.url).searchParams);
    return Response.json(await listLibraryImages(filters), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

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

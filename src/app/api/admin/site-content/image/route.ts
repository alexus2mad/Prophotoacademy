import { requireAdmin } from '@/lib/auth/server';
import { errorResponse, guardMutation } from '@/lib/http';
import { uploadPageImage } from '@/lib/site-editor/media';
import { libraryFilter, listLibraryImages } from '@/lib/site-editor/image-library/list';
import { withEditorTarget } from '@/lib/site-editor/storage/config';
import { parseTarget } from '@/lib/site-editor/storage/target';

const target = (request: Request) => parseTarget(new URL(request.url).searchParams.get('env'));

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const filters = libraryFilter(new URL(request.url).searchParams);
    const images = await withEditorTarget(target(request), () => listLibraryImages(filters));
    return Response.json(images, {
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
      { url: await withEditorTarget(target(request), () => uploadPageImage(request)) },
      { status: 201, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

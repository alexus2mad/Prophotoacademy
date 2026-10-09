import { acceptManagementRequest, managementAction } from '@/lib/admin/management';
import { errorResponse, HttpError } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 131072)
      throw new HttpError(413, 'Payload too large');
    const body = await request.text();
    if (Buffer.byteLength(body) > 131072) throw new HttpError(413, 'Payload too large');
    const input = await acceptManagementRequest(body, request.headers);
    const result = await managementAction(input.action, input.value, input.session);
    return Response.json({ result }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}

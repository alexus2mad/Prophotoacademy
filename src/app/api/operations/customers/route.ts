export const runtime = 'nodejs';
export async function GET() {
  return Response.json(
    { error: 'Керування студентами перенесено до ps-booking' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}

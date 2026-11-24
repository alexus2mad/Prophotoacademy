// Older open tabs can still call this URL after the release.
export function POST() {
  return Response.json(
    { error: 'Оновіть сторінку воркшопу й оберіть квиток ще раз.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}

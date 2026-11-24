// The hosted payment page can return the browser by POST. Its data is never
// fulfillment evidence; send the buyer to the privately tokenized status page.
export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (!/^[a-f0-9]{64}$/.test(token)) return new Response(null, { status: 404 });
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/thanks?' + new URLSearchParams({ token }),
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

export { GET as POST };

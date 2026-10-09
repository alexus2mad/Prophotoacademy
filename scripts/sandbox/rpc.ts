import type { RpcReply } from './types';
export async function rpc<T>(action: string, value?: unknown): Promise<T> {
  const origin = process.env.SANDBOX_RPC_URL;
  if (!origin || new URL(origin).hostname !== '127.0.0.1' || !process.env.SANDBOX_RPC_TOKEN)
    throw new Error('Local sandbox runtime is required');
  const response = await fetch(origin + '/rpc', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.SANDBOX_RPC_TOKEN,
    },
    body: JSON.stringify({ action, value }),
    signal: AbortSignal.timeout(35000),
  });
  const data = (await response.json()) as RpcReply<T>;
  if (!response.ok)
    throw Object.assign(new Error(data.error || 'Sandbox request failed'), {
      statusCode: response.status,
    });
  return data.result;
}

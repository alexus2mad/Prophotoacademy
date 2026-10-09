import type { QueryResultRow, QueryResult } from 'pg';
export type RpcReply<T> = { result: T; error?: string; status?: number };
export type SandboxUser = { id: string; email: string; email_confirmed_at: string };
export type SandboxSession = { token: string; user: SandboxUser };
export type SandboxDocument = Record<string, unknown> & { _id: string; _rev: string };
export type SandboxPatch = { id: string; revision?: string; value: Record<string, unknown> };
export type SandboxCommit = { patches: SandboxPatch[]; creates: Record<string, unknown>[] };
export type SandboxQuery = <R extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
) => Promise<QueryResult<R>>;
export type SandboxUpload = {
  token: string;
  url: string;
  mime: string;
  size: number;
  duration?: number;
};
export type SandboxEmailInput = { email: string; options?: unknown };
export type SandboxCodeInput = SandboxEmailInput & { token: string; type?: string };
export type SandboxMediaAccess = {
  url: string;
  playbackId?: string;
  token?: string;
  thumbnailToken?: string;
};

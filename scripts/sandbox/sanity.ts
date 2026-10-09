import { rpc } from './rpc';
import type { SandboxDocument, SandboxPatch, SandboxCommit } from './types';
class Patch {
  command: SandboxPatch;
  constructor(id: string) {
    this.command = { id, value: {} };
  }
  ifRevisionId(revision: string | undefined) {
    this.command.revision = revision;
    return this;
  }
  set(value: Record<string, unknown>) {
    this.command.value = value;
    return this;
  }
  async commit() {
    const result = await rpc<SandboxDocument[]>('sanity.commit', {
      patches: [this.command],
      creates: [],
    });
    return result[0];
  }
}
class SanityTransaction {
  command: SandboxCommit = { patches: [], creates: [] };
  patch(id: string, apply: (patch: Patch) => Patch) {
    this.command.patches.push(apply(new Patch(id)).command);
    return this;
  }
  create(value: Record<string, unknown>) {
    this.command.creates.push(value);
    return this;
  }
  commit() {
    return rpc<SandboxDocument[]>('sanity.commit', this.command);
  }
}
export function createSandboxSanityClient(...options: unknown[]) {
  void options;
  return {
    datasets: { list: async () => [{ name: 'learning', aclMode: 'private' }] },
    create: async (value: Record<string, unknown>) =>
      (await rpc<SandboxDocument[]>('sanity.commit', { patches: [], creates: [value] }))[0],
    getDocument: <T>(id: string) => rpc<T | null>('sanity.get', { id }),
    patch: (id: string) => new Patch(id),
    transaction: () => new SanityTransaction(),
  };
}

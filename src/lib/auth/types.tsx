export type Member = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  verified_at: string;
  created_at: string;
};
export type VerifiedIdentity = { id: string; email: string; verifiedAt: string };
export type AuthReply = { error?: string; ok?: boolean; redirect?: string };

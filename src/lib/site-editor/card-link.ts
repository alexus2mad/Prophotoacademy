export function validCardLink(value: string) {
  if (!value) return true;
  if (/[\s\\\p{Cc}]/u.test(value)) return false;
  if (/^#[^#]/.test(value) || /^\/(?!\/)/.test(value)) return true;
  if (!/^https:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname && !url.username && !url.password);
  } catch {
    return false;
  }
}

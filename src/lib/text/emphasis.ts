export function emphasizedRun(text: string, phrase?: string) {
  if (!phrase) return;
  const index = text.indexOf(phrase);
  if (index < 0) return;
  return { before: text.slice(0, index), phrase, after: text.slice(index + phrase.length) };
}

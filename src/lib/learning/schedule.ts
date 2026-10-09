export function localSchedule(iso: string, zone = 'Europe/Kyiv') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const value = (key: string) => parts.find((p) => p.type === key)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}`;
}
export function scheduleInstant(
  value: string,
  zone = 'Europe/Kyiv',
  occurrence: 'earlier' | 'later' = 'earlier',
) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Оберіть дату й час');
  const base = Date.parse(value + 'Z');
  if (!Number.isFinite(base)) throw new Error('Некоректна дата');
  const matches: string[] = [];
  for (let offset = -14 * 60; offset <= 14 * 60; offset += 15) {
    const iso = new Date(base + offset * 60000).toISOString();
    if (localSchedule(iso, zone) === value) matches.push(iso);
  }
  if (!matches.length)
    throw new Error('Цей час пропущено під час переходу на літній час. Оберіть інший');
  return occurrence === 'later' ? matches.at(-1)! : matches[0];
}

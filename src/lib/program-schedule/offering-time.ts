import type { OfferingTime } from './types';

export function validateOfferingTime(offering?: OfferingTime) {
  if (!offering || (!offering.startTime && !offering.endTime && !offering.timeZone)) return true;
  const { startDate, startTime, endTime, timeZone } = offering;
  if (!startDate || !startTime || !endTime || !timeZone)
    return 'Для часу події вкажіть дату, початок, завершення та часовий пояс';
  const clockTime = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!clockTime.test(startTime) || !clockTime.test(endTime))
    return 'Вкажіть час у форматі ГГ:ХХ, наприклад 11:00';
  if (endTime <= startTime) return 'Завершення події має бути пізніше початку того самого дня';
  try {
    new Intl.DateTimeFormat('uk-UA', { timeZone });
  } catch {
    return 'Вкажіть коректний часовий пояс IANA, наприклад Europe/Kyiv';
  }
  return true;
}

export function offeringTimeLabel(offering?: OfferingTime) {
  if (validateOfferingTime(offering) !== true || !offering?.startTime) return undefined;
  const { startTime, endTime, timeZone } = offering;
  const zoneLabel =
    timeZone === 'Europe/Kyiv' || timeZone === 'Europe/Kiev' ? 'за Києвом' : `(${timeZone})`;
  return `${startTime}–${endTime} ${zoneLabel}`;
}

// Undefined leaves date-only offerings on their existing sales policy.
export function offeringEventSalesOpen(offering: OfferingTime, now = new Date()) {
  if (validateOfferingTime(offering) !== true || !offering.startTime) return undefined;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: offering.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const local = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const localDateTime = `${local.year}-${local.month}-${local.day}T${local.hour}:${local.minute}`;
  return localDateTime < `${offering.startDate}T${offering.endTime}`;
}

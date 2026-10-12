export const formatMoney = (minor: number, currency = 'UAH') =>
  new Intl.NumberFormat('uk-UA', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    minor / 100,
  );
export const purchaseStatus = (status: string) =>
  ({
    enrolled: 'Тестовий запис без оплати',
    approved: 'Оплачено',
    pending: 'Очікує оплати',
    refunded: 'Оплату повернено',
    declined: 'Оплату відхилено',
    canceled: 'Скасовано',
  })[status] || status;

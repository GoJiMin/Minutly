const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function formatDateToYYYYMMDD(_date: Date) {
  const kstDate = new Date(_date.getTime() + KST_OFFSET_MS);

  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth() + 1;
  const date = kstDate.getUTCDate();

  return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

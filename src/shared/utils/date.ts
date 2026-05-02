const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function toMeetingDate(_date: Date) {
  const kstDate = new Date(_date.getTime() + KST_OFFSET_MS);

  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth() + 1;
  const date = kstDate.getUTCDate();

  return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

export function createMeetingTitlePrefix(meetingDate: string) {
  const [year, month, day] = meetingDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getUTCDay()];

  return `[${meetingDate}. ${weekday}] - `;
}

export function getMonthStartDate(meetingDate: string) {
  const [year, month] = meetingDate.split('-');

  return `${year}-${month}-01`;
}

export function getNextMonthStartDate(meetingDate: string) {
  const [year, month] = meetingDate.split('-').map(Number);

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
}

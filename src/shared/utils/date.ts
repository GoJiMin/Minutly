const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function formatDateToYYYYMMDD(_date: Date) {
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

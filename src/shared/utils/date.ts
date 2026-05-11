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

export function getMonthStartDate(year: string, month: string) {
  return `${year}-${month}-01`;
}

export function getNextMonthStartDate(year: string, month: string) {
  const currentYear = Number(year);
  const currentMonth = Number(month);

  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
}

export function formatKoreanDate(date: Date) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(date);

  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;
  const weekday = parts.find(part => part.type === 'weekday')?.value;

  return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}

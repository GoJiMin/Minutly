import {toMeetingDate, createMeetingTitlePrefix, getMonthStartDate, getNextMonthStartDate} from '../date';

describe('@/src/shared/utils/date.ts', () => {
  describe('toMeetingDate', () => {
    it('회의 시각을 서비스 날짜 형식으로 반환한다.', () => {
      expect(toMeetingDate(new Date('2026-05-02T10:30:00+09:00'))).toBe('2026-05-02');
    });

    it('한국 시간 기준 같은 날짜에 속한 시각은 같은 서비스 날짜로 반환한다.', () => {
      expect(toMeetingDate(new Date('2026-05-02T20:00:00+09:00'))).toBe('2026-05-02');
    });

    it('UTC 날짜와 한국 날짜가 다르면 한국 날짜를 서비스 날짜로 반환한다.', () => {
      expect(toMeetingDate(new Date('2026-05-01T15:00:00.000Z'))).toBe('2026-05-02');
    });
  });

  describe('createMeetingTitlePrefix', () => {
    it('전달한 회의 날짜가 포함된 제목 prefix를 반환한다.', () => {
      expect(createMeetingTitlePrefix('2026-05-02')).toBe('[2026-05-02. 토] - ');
    });
  });

  describe('getMonthStartDate', () => {
    it('회의 날짜가 속한 월의 시작일을 반환한다.', () => {
      expect(getMonthStartDate('2026-05-14')).toBe('2026-05-01');
    });
  });

  describe('getNextMonthStartDate', () => {
    it('회의 날짜가 속한 월의 다음 달 시작일을 반환한다.', () => {
      expect(getNextMonthStartDate('2026-05-14')).toBe('2026-06-01');
    });

    it('12월 회의 날짜는 다음 해 1월 시작일을 반환한다.', () => {
      expect(getNextMonthStartDate('2026-12-14')).toBe('2027-01-01');
    });
  });
});

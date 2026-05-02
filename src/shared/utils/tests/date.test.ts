import {formatDateToYYYYMMDD} from '../date';

describe('@/src/shared/utils/date.ts', () => {
  describe('formatDateToYYYYMMDD', () => {
    it('전달한 날짜를 Asia/Seoul 기준 YYYY-MM-DD 문자열로 변환한다.', () => {
      expect(formatDateToYYYYMMDD(new Date('2026-05-02T10:30:00+09:00'))).toBe('2026-05-02');
    });

    it('Asia/Seoul 기준 늦은 밤 날짜가 다음 날로 밀리지 않는다.', () => {
      expect(formatDateToYYYYMMDD(new Date('2026-05-02T20:00:00+09:00'))).toBe('2026-05-02');
    });
  });
});

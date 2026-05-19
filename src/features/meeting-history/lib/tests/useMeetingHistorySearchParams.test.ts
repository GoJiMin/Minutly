import {renderHook} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import {useMeetingHistorySearchParams} from '../useMeetingHistorySearchParams';

const MEETING_ID = '5f5d8a97-022c-4ea9-bef6-c099a4df6fce';

describe('@/src/features/meeting-history/lib/useMeetingHistorySearchParams.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('기록 화면의 상태를 주소에서 복원한다.', () => {
    mockRouter.push(`/history?year=2026&month=06&date=2026-06-03&meetingId=${MEETING_ID}`);

    const {result} = renderHook(() => useMeetingHistorySearchParams());

    expect(result.current).toEqual({
      year: '2026',
      month: '06',
      date: '2026-06-03',
      meetingId: MEETING_ID,
      calendarMonth: new Date(2026, 5, 1),
      selectedDate: new Date(2026, 5, 3),
    });
  });

  it('처음 방문하면 오늘이 포함된 달을 보여준다.', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-14T15:00:00.000Z'));
    mockRouter.push('/history');

    const {result} = renderHook(() => useMeetingHistorySearchParams());

    expect(result.current).toEqual({
      year: '2026',
      month: '06',
      date: undefined,
      meetingId: undefined,
      calendarMonth: new Date(2026, 5, 1),
      selectedDate: undefined,
    });
  });

  it('보고 있는 달과 다른 날짜는 선택하지 않는다.', () => {
    mockRouter.push(`/history?year=2026&month=06&date=2026-05-17&meetingId=${MEETING_ID}`);

    const {result} = renderHook(() => useMeetingHistorySearchParams());

    expect(result.current).toEqual({
      year: '2026',
      month: '06',
      date: undefined,
      meetingId: MEETING_ID,
      calendarMonth: new Date(2026, 5, 1),
      selectedDate: undefined,
    });
  });
});

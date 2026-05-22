import {act, renderHook} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import {useMeetingHistoryNavigation} from '../useMeetingHistoryNavigation';

const MEETING_ID = '5f5d8a97-022c-4ea9-bef6-c099a4df6fce';
const NEXT_MEETING_ID = '6f5d8a97-022c-4ea9-bef6-c099a4df6fce';

function setHistoryPath(path: string) {
  mockRouter.push(path);
  window.history.replaceState(null, '', path);
}

function getQueryParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

describe('@/src/features/meeting-history/lib/useMeetingHistoryNavigation.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
    window.history.replaceState(null, '', '/history');
  });

  it('다른 달로 이동해도 선택한 회의록을 유지한다.', () => {
    setHistoryPath(`/history?year=2026&month=05&date=2026-05-17&meetingId=${MEETING_ID}`);

    const {result} = renderHook(() => useMeetingHistoryNavigation());

    act(() => {
      result.current.moveMonth(new Date('2026-06-01T00:00:00+09:00'));
    });

    expect(getQueryParams()).toEqual({
      year: '2026',
      month: '06',
      date: '2026-05-17',
      meetingId: MEETING_ID,
    });
  });

  it('다른 날짜를 선택해도 선택한 회의록을 유지한다.', () => {
    setHistoryPath(`/history?year=2026&month=05&meetingId=${MEETING_ID}`);

    const {result} = renderHook(() => useMeetingHistoryNavigation());

    act(() => {
      result.current.selectDate(new Date('2026-06-03T00:00:00+09:00'));
    });

    expect(getQueryParams()).toEqual({
      year: '2026',
      month: '06',
      date: '2026-06-03',
      meetingId: MEETING_ID,
    });
  });

  it('회의록을 선택해도 보고 있던 날짜 목록을 유지한다.', () => {
    setHistoryPath('/history?year=2026&month=06&date=2026-06-03');

    const {result} = renderHook(() => useMeetingHistoryNavigation());

    act(() => {
      result.current.selectMeeting(NEXT_MEETING_ID);
    });

    expect(getQueryParams()).toEqual({
      year: '2026',
      month: '06',
      date: '2026-06-03',
      meetingId: NEXT_MEETING_ID,
    });
  });

  it('날짜 선택이 취소되면 현재 상태를 유지한다.', () => {
    setHistoryPath(`/history?year=2026&month=06&date=2026-06-03&meetingId=${MEETING_ID}`);
    const currentSearch = window.location.search;

    const {result} = renderHook(() => useMeetingHistoryNavigation());

    act(() => {
      result.current.selectDate(undefined);
    });

    expect(window.location.search).toBe(currentSearch);
  });
});

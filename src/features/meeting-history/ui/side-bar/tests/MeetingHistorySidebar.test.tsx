import {render, screen, waitFor, within} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import userEvent from '@testing-library/user-event';
import {MeetingHistorySidebar} from '../MeetingHistorySidebar';
import {getMeetingDatesByMonth, getMeetingsByDate} from '@/entities/meeting/api/meetingApi';
import {withAllContext} from '@/shared/utils/withAllContext';

jest.mock('@/entities/meeting/api/meetingApi');

const mockedGetMeetingDatesByMonth = jest.mocked(getMeetingDatesByMonth);
const mockedGetMeetingsByDate = jest.mocked(getMeetingsByDate);

const MEETING_ID = '5f5d8a97-022c-4ea9-bef6-c099a4df6fce';
const NEXT_MEETING_ID = '6f5d8a97-022c-4ea9-bef6-c099a4df6fce';

let consoleErrorSpy: jest.SpiedFunction<typeof console.error> | undefined;

function setHistoryPath(path: string) {
  mockRouter.push(path);
  window.history.replaceState(null, '', path);
}

function getQueryParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

function renderSidebar() {
  return render(withAllContext(<MeetingHistorySidebar />));
}

function hideExpectedErrorBoundaryLog() {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
}

describe('@/src/features/meeting-history/ui/side-bar/MeetingHistorySidebar.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
    window.history.replaceState(null, '', '/history');
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleErrorSpy = undefined;
  });

  it('회의 기록 탐색 화면을 표시한다.', async () => {
    mockedGetMeetingDatesByMonth.mockResolvedValue({
      dates: ['2026-06-03', '2026-06-10'],
    });
    mockedGetMeetingsByDate.mockResolvedValue({
      meetings: [
        {
          id: MEETING_ID,
          title: '주간 기획 회의',
        },
        {
          id: NEXT_MEETING_ID,
          title: '제품 회고 회의',
        },
      ],
    });
    setHistoryPath(`/history?year=2026&month=06&date=2026-06-03&meetingId=${MEETING_ID}`);

    renderSidebar();

    expect(await screen.findByRole('button', {name: /2026년 6월 3일/})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /2026년 6월 10일/})).toBeInTheDocument();

    const meetingList = await screen.findByRole('navigation', {name: '2026-06-03 회의 목록'});
    expect(within(meetingList).getByRole('button', {name: '주간 기획 회의'})).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(within(meetingList).getByRole('button', {name: '제품 회고 회의'})).toBeInTheDocument();
  });

  it('캘린더에서 날짜를 선택하면 해당 날짜로 이동한다.', async () => {
    const user = userEvent.setup();

    mockedGetMeetingDatesByMonth.mockResolvedValue({
      dates: ['2026-06-03', '2026-06-10'],
    });
    mockedGetMeetingsByDate.mockResolvedValue({meetings: []});
    setHistoryPath(`/history?year=2026&month=06&meetingId=${MEETING_ID}`);

    renderSidebar();

    await user.click(await screen.findByRole('button', {name: /2026년 6월 10일/}));

    await waitFor(() => {
      expect(getQueryParams()).toEqual({
        year: '2026',
        month: '06',
        date: '2026-06-10',
        meetingId: MEETING_ID,
      });
    });
  });

  it('회의 목록에서 회의록을 선택하면 해당 회의록으로 이동한다.', async () => {
    const user = userEvent.setup();

    mockedGetMeetingDatesByMonth.mockResolvedValue({
      dates: ['2026-06-03'],
    });
    mockedGetMeetingsByDate.mockResolvedValue({
      meetings: [
        {
          id: MEETING_ID,
          title: '주간 기획 회의',
        },
        {
          id: NEXT_MEETING_ID,
          title: '제품 회고 회의',
        },
      ],
    });
    setHistoryPath(`/history?year=2026&month=06&date=2026-06-03&meetingId=${MEETING_ID}`);

    renderSidebar();

    await user.click(await screen.findByRole('button', {name: '제품 회고 회의'}));

    await waitFor(() => {
      expect(getQueryParams()).toEqual({
        year: '2026',
        month: '06',
        date: '2026-06-03',
        meetingId: NEXT_MEETING_ID,
      });
    });
  });

  it('회의 날짜를 불러오지 못하면 오류 안내를 표시한다.', async () => {
    hideExpectedErrorBoundaryLog();

    mockedGetMeetingDatesByMonth.mockRejectedValue(new Error('날짜 조회 실패'));
    setHistoryPath('/history?year=2026&month=06');

    renderSidebar();

    expect(await screen.findByText('회의 날짜를 불러오지 못했어요')).toBeInTheDocument();
    expect(screen.getByText('날짜 조회 실패')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '다시 시도'})).toBeInTheDocument();
  });

  it('회의 목록을 불러오지 못하면 오류 안내를 표시한다.', async () => {
    hideExpectedErrorBoundaryLog();

    mockedGetMeetingDatesByMonth.mockResolvedValue({
      dates: ['2026-06-03'],
    });
    mockedGetMeetingsByDate.mockRejectedValue(new Error('목록 조회 실패'));
    setHistoryPath('/history?year=2026&month=06&date=2026-06-03');

    renderSidebar();

    expect(await screen.findByText('회의 목록을 불러오지 못했어요')).toBeInTheDocument();
    expect(screen.getByText('목록 조회 실패')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '다시 시도'})).toBeInTheDocument();
  });
});

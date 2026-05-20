import {render, screen} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import {MeetingHistoryDetailPanel} from '../MeetingHistoryDetailPanel';
import {getMeetingById} from '@/entities/meeting/api/meetingApi';
import {getMeetingMemos} from '@/entities/meeting/api/meetingMemoApi';
import {RequestGetError} from '@/shared/api';
import {withAllContext} from '@/shared/utils/withAllContext';

jest.mock('@/entities/meeting/api/meetingApi');
jest.mock('@/entities/meeting/api/meetingMemoApi');

jest.mock('lottie-react', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-empty-animation" />,
}));

const mockedGetMeetingById = jest.mocked(getMeetingById);
const mockedGetMeetingMemos = jest.mocked(getMeetingMemos);

const MEETING_ID = '5f5d8a97-022c-4ea9-bef6-c099a4df6fce';

let consoleErrorSpy: jest.SpiedFunction<typeof console.error> | undefined;

function renderDetailPanel() {
  return render(withAllContext(<MeetingHistoryDetailPanel />));
}

function hideExpectedErrorBoundaryLog() {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
}

describe('@/src/features/meeting-history/ui/detail/MeetingHistoryDetailPanel.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
    mockedGetMeetingMemos.mockResolvedValue({memos: []});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleErrorSpy = undefined;
  });

  it('회의록을 선택하지 않았으면 선택 안내를 표시한다.', () => {
    mockRouter.push('/history?year=2026&month=06');

    renderDetailPanel();

    expect(screen.getByText('회의록을 선택해주세요')).toBeInTheDocument();
    expect(screen.getByText('캘린더에서 날짜를 고른 뒤, 왼쪽 목록의 회의록을 누르면 내용이 표시됩니다.')).toBeInTheDocument();
    expect(screen.getByTestId('meeting-empty-animation')).toBeInTheDocument();
    expect(mockedGetMeetingById).not.toHaveBeenCalled();
  });

  it('선택한 회의록을 표시한다.', async () => {
    mockedGetMeetingById.mockResolvedValue({
      id: MEETING_ID,
      title: '주간 기획 회의',
      meetingDate: '2026-05-18',
      createdAt: '2026-05-18T10:25:03.047Z',
      updatedAt: '2026-05-18T10:25:03.047Z',
      originTranscript: '원본 전사 내용',
      transcript: '최종 회의 내용입니다.',
      summary: '회의 요약입니다.',
      keyPoints: ['담당자를 정합니다.', '다음 회의 일정을 확인합니다.'],
    });
    mockRouter.push(`/history?year=2026&month=06&meetingId=${MEETING_ID}`);

    renderDetailPanel();

    expect(screen.queryByText('회의록을 선택해주세요')).not.toBeInTheDocument();
    expect(screen.queryByText('캘린더에서 날짜를 고른 뒤, 왼쪽 목록의 회의록을 누르면 내용이 표시됩니다.')).not.toBeInTheDocument();
    expect(screen.queryByTestId('meeting-empty-animation')).not.toBeInTheDocument();

    expect(await screen.findByRole('heading', {level: 2, name: '주간 기획 회의'})).toBeInTheDocument();
    expect(screen.getByText('회의 요약')).toBeInTheDocument();
    expect(screen.getByText('회의 요약입니다.')).toBeInTheDocument();
    expect(screen.getByText('주요 사항')).toBeInTheDocument();
    expect(screen.getByText('담당자를 정합니다.')).toBeInTheDocument();
    expect(screen.getByText('다음 회의 일정을 확인합니다.')).toBeInTheDocument();
    expect(screen.getByText('최종 회의 내용')).toBeInTheDocument();
    expect(screen.getByText('최종 회의 내용입니다.')).toBeInTheDocument();
    expect(screen.getAllByText('2026년 5월 18일 (월요일) 오후 7시 25분')).toHaveLength(2);
    expect(screen.getByText('메모')).toBeInTheDocument();
  });

  it('회의록을 불러오지 못하면 오류 안내를 표시한다.', async () => {
    hideExpectedErrorBoundaryLog();

    mockedGetMeetingById.mockRejectedValue(
      new RequestGetError({
        name: 'MEETING_READ_FAILED',
        message: '회의 상세를 불러오지 못했습니다.',
        status: 500,
        endpoint: `/api/meetings/${MEETING_ID}`,
        method: 'GET',
        requestBody: null,
      }),
    );
    mockRouter.push(`/history?year=2026&month=06&meetingId=${MEETING_ID}`);

    renderDetailPanel();

    expect(await screen.findByText('회의록을 불러오지 못했어요.')).toBeInTheDocument();
    expect(screen.getByText('회의록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '다시 시도'})).toBeInTheDocument();
  });
});

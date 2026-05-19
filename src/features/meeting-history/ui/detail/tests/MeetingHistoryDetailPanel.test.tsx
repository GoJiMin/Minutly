import {render, screen} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import {MeetingHistoryDetailPanel} from '../MeetingHistoryDetailPanel';

jest.mock('lottie-react', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-empty-animation" />,
}));

const MEETING_ID = '5f5d8a97-022c-4ea9-bef6-c099a4df6fce';

describe('@/src/features/meeting-history/ui/detail/MeetingHistoryDetailPanel.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  it('회의록을 선택하지 않았으면 선택 안내를 표시한다.', () => {
    mockRouter.push('/history?year=2026&month=06');

    render(<MeetingHistoryDetailPanel />);

    expect(screen.getByText('회의록을 선택해주세요')).toBeInTheDocument();
    expect(screen.getByText('캘린더에서 날짜를 고른 뒤, 왼쪽 목록의 회의록을 누르면 내용이 표시됩니다.')).toBeInTheDocument();
    expect(screen.getByTestId('meeting-empty-animation')).toBeInTheDocument();
  });

  it('회의록이 선택되어 있으면 선택 안내를 표시하지 않는다.', () => {
    mockRouter.push(`/history?year=2026&month=06&meetingId=${MEETING_ID}`);

    render(<MeetingHistoryDetailPanel />);

    expect(screen.queryByText('회의록을 선택해주세요')).not.toBeInTheDocument();
    expect(screen.queryByText('캘린더에서 날짜를 고른 뒤, 왼쪽 목록의 회의록을 누르면 내용이 표시됩니다.')).not.toBeInTheDocument();
    expect(screen.queryByTestId('meeting-empty-animation')).not.toBeInTheDocument();
  });
});

import userEvent from '@testing-library/user-event';
import {act, render, screen} from '@testing-library/react';
import RecordingSessionControlsPanel from '../RecordingSessionControlsPanel';
import {useRecordingStore} from '@/entities/speech-to-text/client';

const startRecordingSession = jest.fn();
const resumeRecordingSession = jest.fn();
const pauseRecordingSession = jest.fn();
const finishRecordingSession = jest.fn();

jest.mock('../../../lib/useRecordingSessionController', () => ({
  useRecordingSessionController: () => ({
    startRecordingSession,
    resumeRecordingSession,
    pauseRecordingSession,
    finishRecordingSession,
  }),
}));

jest.mock('../../../lib/useMicrophoneDevices', () => ({
  useMicrophoneDevices: () => ({
    microphoneOptions: [],
    needsMicrophoneAccess: false,
    requestMicrophoneAccess: jest.fn(),
  }),
}));

describe('@/src/features/recording-session/ui/controls/RecordingSessionControlsPanel.tsx', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-12'));
    jest.clearAllMocks();

    useRecordingStore.getState().resetRecording();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('대기 - idle', () => {
    it('대기 상태의 컨트롤 패널이 렌더링된다.', () => {
      render(<RecordingSessionControlsPanel />);

      expect(screen.getByText('2026년 5월 12일 화요일')).toBeInTheDocument();
      expect(screen.getByText('00:00:00')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '녹음 시작'})).toBeInTheDocument();
      expect(screen.getByText('입력 마이크')).toBeInTheDocument();
    });

    it('대기 상태일 경우 녹음 시작 버튼만 활성화되고 일시 정지, 녹음 종료 버튼은 비활성화된다.', () => {
      render(<RecordingSessionControlsPanel />);

      expect(screen.getByRole('button', {name: '녹음 시작'})).toBeEnabled();
      expect(screen.getByRole('button', {name: '일시 정지'})).toBeDisabled();
      expect(screen.getByRole('button', {name: '녹음 종료'})).toBeDisabled();
    });

    it('녹음 시작 버튼을 클릭하면 녹음을 시작한다.', async () => {
      const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
      });

      render(<RecordingSessionControlsPanel />);

      await user.click(screen.getByRole('button', {name: '녹음 시작'}));
      expect(startRecordingSession).toHaveBeenCalled();
    });
  });

  describe('녹음 중 - recording', () => {
    beforeEach(() => {
      useRecordingStore.setState({status: 'recording'});
    });

    it('녹음 상태의 컨트롤 패널이 렌더링된다.', () => {
      render(<RecordingSessionControlsPanel />);

      expect(screen.getByRole('button', {name: '녹음 시작'})).toBeInTheDocument();
      expect(screen.getByText('입력 마이크')).toBeInTheDocument();
    });

    it('녹음 상태일 경우 녹음 시작 버튼만 비활성화되고 일시 정지, 녹음 종료 버튼은 활성화된다.', () => {
      render(<RecordingSessionControlsPanel />);

      expect(screen.getByRole('button', {name: '녹음 시작'})).toBeDisabled();
      expect(screen.getByRole('button', {name: '일시 정지'})).toBeEnabled();
      expect(screen.getByRole('button', {name: '녹음 종료'})).toBeEnabled();
    });

    it('일시 정지 버튼을 클릭하면 녹음을 잠시 중단한다.', async () => {
      const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
      });

      render(<RecordingSessionControlsPanel />);

      await user.click(screen.getByRole('button', {name: '일시 정지'}));

      expect(pauseRecordingSession).toHaveBeenCalled();
    });

    it('녹음 종료 버튼을 클릭하면 녹음을 종료한다.', async () => {
      const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
      });

      render(<RecordingSessionControlsPanel />);

      await user.click(screen.getByRole('button', {name: '녹음 종료'}));

      expect(finishRecordingSession).toHaveBeenCalled();
    });
  });

  describe('일시 정지 - paused', () => {
    beforeEach(() => {
      useRecordingStore.setState({status: 'paused'});
    });

    it('일시 정지 상태의 컨트롤 패널이 렌더링된다.', () => {
      render(<RecordingSessionControlsPanel />);

      expect(screen.getByRole('button', {name: '이어서 녹음'})).toBeInTheDocument();
      expect(screen.getByText('입력 마이크')).toBeInTheDocument();
    });

    it('일시 정지 상태일 경우 이어서 녹음, 녹음 종료 버튼만 활성화되고 일시 정지 버튼은 비활성화된다.', () => {
      render(<RecordingSessionControlsPanel />);

      expect(screen.getByRole('button', {name: '이어서 녹음'})).toBeEnabled();
      expect(screen.getByRole('button', {name: '녹음 종료'})).toBeEnabled();
      expect(screen.getByRole('button', {name: '일시 정지'})).toBeDisabled();
    });

    it('이어서 녹음 버튼을 클릭하면 녹음을 다시 시작한다.', async () => {
      const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
      });

      render(<RecordingSessionControlsPanel />);

      await user.click(screen.getByRole('button', {name: '이어서 녹음'}));

      expect(resumeRecordingSession).toHaveBeenCalled();
    });

    it('녹음 종료 버튼을 클릭하면 녹음을 종료한다.', async () => {
      const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
      });

      render(<RecordingSessionControlsPanel />);

      await user.click(screen.getByRole('button', {name: '녹음 종료'}));

      expect(finishRecordingSession).toHaveBeenCalled();
    });
  });

  describe('녹음 종료 - transcript_review', () => {
    beforeEach(() => {
      useRecordingStore.setState({status: 'transcript_review'});
    });

    it('녹음 종료 상태의 컨트롤 패널이 렌더링된다.', () => {
      render(<RecordingSessionControlsPanel />);

      expect(screen.getByText('녹음이 종료됐어요')).toBeInTheDocument();
      expect(screen.getByText('우측에서 내용을 확인하고 회의 요약을 생성할 수 있어요.')).toBeInTheDocument();
      expect(screen.getByText('검토 상태')).toBeInTheDocument();
      expect(screen.getByText('중단 구간')).toBeInTheDocument();
      expect(screen.getByText('확인 완료')).toBeInTheDocument();

      expect(screen.queryByRole('button', {name: '요약 생성'})).not.toBeInTheDocument();
      expect(screen.queryByRole('button', {name: '내용 검토'})).not.toBeInTheDocument();
      expect(screen.getByRole('button', {name: '새 녹음 시작'})).toBeInTheDocument();

      expect(screen.queryByText('입력 마이크')).not.toBeInTheDocument();
    });

    it('확인하지 않은 녹음 중단 구간이 있으면 남은 개수를 표시한다.', () => {
      useRecordingStore.setState({interruptionCount: 2});

      render(<RecordingSessionControlsPanel />);

      expect(screen.getByText('중단 구간')).toBeInTheDocument();
      expect(screen.getByText('2개 남음')).toBeInTheDocument();
    });

    it('새 녹음 시작 버튼을 클릭하면 현재 녹음 상태를 초기화한다.', async () => {
      act(() => {
        useRecordingStore.setState({
          previewChunks: [
            {
              id: 'test-id',
              kind: 'speech',
              text: '테스트 문장',
            },
          ],
          startedAt: '2026-05-12T00:00:00.000Z',
          updatedAt: '2026-05-12T00:00:10.000Z',
          recordingElapsedMs: 10_000,
          recordingStartedAt: null,
        });
      });

      const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
      });

      render(<RecordingSessionControlsPanel />);

      await user.click(screen.getByRole('button', {name: '새 녹음 시작'}));

      const state = useRecordingStore.getState();

      expect(state.status).toBe('idle');
      expect(state.previewChunks).toEqual([]);
      expect(state.startedAt).toBeNull();
      expect(state.updatedAt).toBeNull();
      expect(state.recordingElapsedMs).toBe(0);
      expect(state.recordingStartedAt).toBeNull();
    });
  });
});

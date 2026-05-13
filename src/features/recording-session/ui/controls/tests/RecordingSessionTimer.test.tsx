import {act, render, screen} from '@testing-library/react';
import {RecordingSessionTimer} from '../RecordingSessionTimer';
import {useRecordingStore} from '@/entities/speech-to-text/client';

describe('@/src/features/recording-session/ui/controls/RecordingSessionTimer.tsx', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-12T00:00:00.000Z'));

    useRecordingStore.getState().resetRecording();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('녹음 시작 전 00:00:00을 표시한다.', () => {
    render(<RecordingSessionTimer />);

    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('녹음 중에는 현재 시각 기준으로 녹음 시간을 갱신한다.', () => {
    act(() => {
      useRecordingStore.getState().startRecording();
    });

    render(<RecordingSessionTimer />);

    expect(screen.getByText('00:00:00')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText('00:00:05')).toBeInTheDocument();
  });

  it('일시 정지 상태에서 확정된 녹음 시간을 유지한다.', () => {
    act(() => {
      useRecordingStore.setState({
        status: 'paused',
        recordingElapsedMs: 5000,
        recordingStartedAt: null,
      });
    });

    render(<RecordingSessionTimer />);

    expect(screen.getByText('00:00:05')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(600_000);
    });

    expect(screen.getByText('00:00:05')).toBeInTheDocument();
  });

  it('누적된 녹음 시간이 있는 상태에서 녹음을 이어갈 경우 누적 시간에 현재 구간 시간을 더해 표시한다.', () => {
    act(() => {
      useRecordingStore.setState({
        status: 'paused',
        recordingElapsedMs: 5000,
        recordingStartedAt: null,
      });
    });

    render(<RecordingSessionTimer />);

    expect(screen.getByText('00:00:05')).toBeInTheDocument();

    act(() => {
      useRecordingStore.getState().resumeRecording();
    });

    expect(screen.getByText('00:00:05')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText('00:00:10')).toBeInTheDocument();
  });
});

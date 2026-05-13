import {act, render, screen} from '@testing-library/react';
import {PropsWithChildren} from 'react';
import {TranscriptChunk, useRecordingStore} from '@/entities/speech-to-text/client';
import {RecordingSessionFeedbackPanel} from '../RecordingSessionFeedbackPanel';

jest.mock('framer-motion', () => ({
  AnimatePresence: ({children}: PropsWithChildren) => <div>{children}</div>,
  motion: {
    li: ({children}: PropsWithChildren) => <li>{children}</li>,
  },
}));

describe('@/src/features/recording-session/ui/feedback/RecordingSessionFeedbackPanel.tsx', () => {
  beforeEach(() => {
    useRecordingStore.getState().resetRecording();
  });

  it('녹음 시작 전 대기 상태일 경우 온보딩 메세지가 출력된다.', () => {
    render(<RecordingSessionFeedbackPanel />);

    expect(screen.getByRole('heading', {level: 3})).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
  });

  it('녹음 상태에 진입해 인식된 문장이 없을 경우 화면에 아이콘을 표시한다.', () => {
    render(<RecordingSessionFeedbackPanel />);

    const onBoardingMessage = '녹음을 시작하면 회의 내용을 문장 단위로 인식해요.';
    expect(screen.getByText(onBoardingMessage)).toBeInTheDocument();

    act(() => {
      useRecordingStore.setState({status: 'recording'});
    });

    expect(screen.queryByText(onBoardingMessage)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('녹음 상태에 진입해 인식된 문장이 있을 경우 화면에 미리보기를 표시한다.', () => {
    render(<RecordingSessionFeedbackPanel />);

    const onBoardingMessage = '녹음을 시작하면 회의 내용을 문장 단위로 인식해요.';
    expect(screen.getByText(onBoardingMessage)).toBeInTheDocument();

    const chunk: TranscriptChunk = {
      id: 'test-id',
      kind: 'speech',
      text: '테스트 문장',
    };

    act(() => {
      useRecordingStore.setState({status: 'recording', previewChunks: [chunk]});
    });

    expect(screen.getByText(chunk.text)).toBeInTheDocument();
  });

  it('인식된 문장이 있으면 현재 상태와 관계없이 미리보기를 표시한다.', () => {
    const chunk: TranscriptChunk = {
      id: 'test-id',
      kind: 'speech',
      text: '테스트 문장',
    };

    act(() => {
      useRecordingStore.setState({status: 'paused', previewChunks: [chunk]});
    });

    render(<RecordingSessionFeedbackPanel />);

    expect(screen.getByText(chunk.text)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

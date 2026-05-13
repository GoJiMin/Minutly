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

  it('인식된 문장이 있으면 일시 정지 상태에서도 미리보기를 표시한다.', () => {
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

  it('마이크 권한이 거부된 경우 브라우저에서 마이크 권한을 허용하는 방법을 안내한다.', () => {
    act(() => {
      useRecordingStore.setState({status: 'error', errorCode: 'microphone_permission_denied'});
    });

    render(<RecordingSessionFeedbackPanel />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 3, name: '마이크 권한이 거부되어 있어요.'})).toBeInTheDocument();
    expect(screen.getByText('브라우저 설정에서 이 사이트의 마이크 권한을 허용한 뒤 다시 시도해주세요.')).toBeInTheDocument();
    expect(screen.getByText('상단 주소창 왼쪽의 사이트 정보 또는 자물쇠 아이콘을 눌러주세요.')).toBeInTheDocument();
    expect(screen.getByText('사이트 설정에서 마이크 권한을 허용으로 변경해주세요.')).toBeInTheDocument();
    expect(screen.getByText('페이지를 새로고침한 뒤 다시 녹음을 시작해주세요.')).toBeInTheDocument();
  });

  it('에러가 발생하면 복구된 최근 기록 대신 에러 안내를 표시한다.', () => {
    const chunk: TranscriptChunk = {
      id: 'test-id',
      kind: 'speech',
      text: '테스트 문장',
    };

    act(() => {
      useRecordingStore.setState({
        status: 'error',
        errorCode: 'microphone_not_found',
        previewChunks: [chunk],
      });
    });

    render(<RecordingSessionFeedbackPanel />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 3, name: '사용 가능한 마이크를 찾지 못했어요.'})).toBeInTheDocument();
    expect(screen.queryByText(chunk.text)).not.toBeInTheDocument();
  });

  it('에러 원인을 확인하지 못한 경우 녹음 상태를 다시 확인하도록 안내한다.', () => {
    act(() => {
      useRecordingStore.setState({status: 'error', errorCode: null});
    });

    render(<RecordingSessionFeedbackPanel />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 3, name: '녹음 상태를 확인하지 못했어요.'})).toBeInTheDocument();
    expect(screen.getByText('일시적인 문제가 발생했어요. 다시 녹음을 시작해주세요.')).toBeInTheDocument();
  });
});

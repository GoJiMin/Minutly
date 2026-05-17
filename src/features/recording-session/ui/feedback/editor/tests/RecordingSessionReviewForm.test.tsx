import {useRecordingStore} from '@/entities/speech-to-text/client';
import {render, screen, within} from '@testing-library/react';
import {RecordingSessionReviewForm} from '../RecordingSessionReviewForm';
import userEvent from '@testing-library/user-event';

const mockedGetTranscript = jest.fn();
const mockedMoveToInterruption = jest.fn();
const mockedMarkInterruptionReviewed = jest.fn();
jest.mock('../../../../lib/transcript-editor/useTranscriptEditor', () => ({
  useTranscriptEditor: () => ({
    containerRef: {current: null},
    getTranscript: mockedGetTranscript,
    moveToInterruption: mockedMoveToInterruption,
    markInterruptionReviewed: mockedMarkInterruptionReviewed,
  }),
}));

describe('@/src/features/recording-session/ui/feedback/editor/RecordingSessionReviewForm.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRecordingStore.getState().resetRecording();
  });

  it('회의가 시작된 시각을 기준으로 회의 제목 기본값이 설정된다.', () => {
    useRecordingStore.setState({startedAt: new Date('2026-05-17').toISOString()});

    render(<RecordingSessionReviewForm />);

    expect(screen.getByRole('textbox', {name: '회의 제목'})).toHaveValue('[2026-05-17. 일] - ');
  });

  it('녹음 중단 구간이 있다면 확인 패널이 표시된다.', () => {
    useRecordingStore.getState().appendInterruptionChunk();
    useRecordingStore.getState().appendInterruptionChunk();
    useRecordingStore.getState().appendInterruptionChunk();

    render(<RecordingSessionReviewForm />);

    expect(screen.getByText('녹음 중단 구간 3개')).toBeInTheDocument();

    const interruptionList = screen.getByRole('list', {name: '확인할 녹음 중단 구간'});
    const items = within(interruptionList).getAllByRole('listitem');

    expect(items).toHaveLength(3);
    expect(within(items[0]).getByRole('button', {name: '1번째 중단 구간으로 이동'})).toBeInTheDocument();
    expect(within(items[0]).getByRole('button', {name: '1번째 중단 구간 확인'})).toBeInTheDocument();
  });

  it('패널의 중단 구간 확인 표시를 클릭하면 중단 구간 카운트를 감소시키고 버튼을 제거한다.', async () => {
    const user = userEvent.setup();

    useRecordingStore.getState().appendInterruptionChunk();
    useRecordingStore.getState().appendInterruptionChunk();

    render(<RecordingSessionReviewForm />);

    expect(screen.getByText('녹음 중단 구간 2개')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', {name: '1번째 중단 구간 확인'});
    expect(confirmButton).toBeInTheDocument();

    await user.click(confirmButton);

    expect(mockedMarkInterruptionReviewed).toHaveBeenCalledWith(expect.any(String));

    expect(screen.getByText('녹음 중단 구간 1개')).toBeInTheDocument();
    expect(confirmButton).not.toBeInTheDocument();
  });

  it('패널의 중단 구간 이동 표시를 클릭하면 중단 구간 위치로 이동한다.', async () => {
    const user = userEvent.setup();

    useRecordingStore.getState().appendInterruptionChunk();

    render(<RecordingSessionReviewForm />);

    await user.click(screen.getByRole('button', {name: '1번째 중단 구간으로 이동'}));

    expect(mockedMoveToInterruption).toHaveBeenCalledWith(expect.any(String));
  });

  it('중단 구간을 모두 확인하면 확인 패널을 화면에서 제거한다.', async () => {
    const user = userEvent.setup();

    useRecordingStore.getState().appendInterruptionChunk();

    render(<RecordingSessionReviewForm />);

    const interruptionCountText = screen.getByText('녹음 중단 구간 1개');
    expect(interruptionCountText).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '1번째 중단 구간 확인'}));

    expect(interruptionCountText).not.toBeInTheDocument();
  });

  it('녹음 중단 구간이 있을 경우 요약 생성 버튼을 비활성화한다.', () => {
    useRecordingStore.getState().appendInterruptionChunk();

    render(<RecordingSessionReviewForm />);

    expect(screen.getByRole('button', {name: '요약 생성'})).toBeDisabled();
  });

  it('녹음 중단 구간을 모두 확인하면 요약 생성 버튼을 활성화한다.', async () => {
    const user = userEvent.setup();

    useRecordingStore.getState().appendInterruptionChunk();

    render(<RecordingSessionReviewForm />);

    const submitButton = screen.getByRole('button', {name: '요약 생성'});
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole('button', {name: '1번째 중단 구간 확인'}));

    expect(submitButton).toBeEnabled();
  });

  it('요약 생성 요청 시 입력한 전사 내용이 짧을 경우 에러 메세지를 표시한다.', async () => {
    const user = userEvent.setup();

    mockedGetTranscript.mockReturnValue('짧은 내용');

    render(<RecordingSessionReviewForm />);

    await user.click(screen.getByRole('button', {name: '요약 생성'}));

    expect(screen.getByText('요약할 회의 내용이 충분하지 않습니다.')).toBeInTheDocument();
  });

  it('요약 생성 요청 시 입력한 제목을 검증해 에러 메세지를 표시한다.', async () => {
    const user = userEvent.setup();

    render(<RecordingSessionReviewForm />);

    const titleInput = screen.getByRole('textbox', {name: '회의 제목'});
    const submitButton = screen.getByRole('button', {name: '요약 생성'});

    await user.clear(titleInput);
    await user.click(submitButton);

    expect(screen.getByText('회의 제목을 입력해주세요.')).toBeInTheDocument();

    await user.type(titleInput, 's'.repeat(101));

    expect(screen.getByText('회의 제목은 최대 100자 이하로 입력할 수 있습니다.')).toBeInTheDocument();
  });

  it.todo('제목과 전사 내용이 정상적으로 입력된 경우 요약 생성을 요청한다.');
});

import {render, screen, waitFor, within} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import userEvent from '@testing-library/user-event';
import {RecordingSessionReviewForm} from '../RecordingSessionReviewForm';
import type {CreateMeetingResponse} from '@/entities/meeting/client';
import {
  readTranscriptReviewDraft,
  removeTranscriptReviewDraft,
  saveTranscriptReviewDraft,
  useRecordingStore,
} from '@/entities/speech-to-text/client';
import {fetchTranscriptSummary} from '@/entities/summary/api/summaryApi';
import {fetchCreateMeeting} from '@/entities/meeting/api/meetingApi';
import {withAllContext} from '@/shared/utils/withAllContext';

const mockedGetTranscript = jest.fn();
const mockedMoveToInterruption = jest.fn();
const mockedMarkInterruptionReviewed = jest.fn();
const mockedUseTranscriptEditor = jest.fn();

jest.mock('@/entities/summary/api/summaryApi');
jest.mock('@/entities/meeting/api/meetingApi');

jest.mock('../../../../lib/transcript-editor/useTranscriptEditor', () => ({
  useTranscriptEditor: (props: unknown) => {
    mockedUseTranscriptEditor(props);

    return {
      containerRef: {current: null},
      getTranscript: mockedGetTranscript,
      moveToInterruption: mockedMoveToInterruption,
      markInterruptionReviewed: mockedMarkInterruptionReviewed,
    };
  },
}));

const mockedFetchTranscriptSummary = jest.mocked(fetchTranscriptSummary);
const mockedFetchCreateMeeting = jest.mocked(fetchCreateMeeting);
const VALID_TRANSCRIPT =
  '오늘 회의에서는 요약 생성 흐름을 점검했다. 전사 검토 화면은 사용자가 수정한 내용을 안정적으로 유지해야 하므로 요약 생성 중에도 기존 화면을 유지하기로 했다. 요약 결과는 전사 에디터와 역할이 다르기 때문에 별도 다이얼로그에서 확인하기로 했다. 요약 요청 전에는 제목과 수정된 전사 내용을 review draft로 저장해 실패하거나 새로고침되어도 복구할 수 있게 한다. originTranscript는 기존 녹음 draft에 있으므로 review draft에는 중복 저장하지 않는다. 요약 요청에는 title과 transcript만 보내고, 최종 회의 저장 시점에 originTranscript를 함께 조립한다. 요약 생성 실패는 전역 토스트 흐름으로 처리한다.';

function renderReviewForm() {
  return render(withAllContext(<RecordingSessionReviewForm />));
}

describe('@/src/features/recording-session/ui/feedback/editor/RecordingSessionReviewForm.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
    useRecordingStore.getState().resetRecording();
    removeTranscriptReviewDraft();
  });

  it('회의가 시작된 시각을 기준으로 회의 제목 기본값이 설정된다.', () => {
    useRecordingStore.setState({startedAt: new Date('2026-05-17').toISOString()});

    renderReviewForm();

    expect(screen.getByRole('textbox', {name: '회의 제목'})).toHaveValue('[2026-05-17. 일] - ');
  });

  it('임시 저장된 제목으로 검토를 다시 시작할 수 있다.', () => {
    saveTranscriptReviewDraft({
      title: '저장된 검토 제목',
      transcript: VALID_TRANSCRIPT,
    });

    renderReviewForm();

    expect(screen.getByRole('textbox', {name: '회의 제목'})).toHaveValue('저장된 검토 제목');
  });

  it('임시 저장된 전사 내용으로 검토를 다시 시작할 수 있다.', () => {
    saveTranscriptReviewDraft({
      title: '저장된 검토 제목',
      transcript: VALID_TRANSCRIPT,
    });

    renderReviewForm();

    expect(mockedUseTranscriptEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        doc: VALID_TRANSCRIPT,
      }),
    );
  });

  it('녹음 중단 구간이 있다면 확인 패널이 표시된다.', () => {
    useRecordingStore.getState().appendInterruptionChunk();
    useRecordingStore.getState().appendInterruptionChunk();
    useRecordingStore.getState().appendInterruptionChunk();

    renderReviewForm();

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

    renderReviewForm();

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

    renderReviewForm();

    await user.click(screen.getByRole('button', {name: '1번째 중단 구간으로 이동'}));

    expect(mockedMoveToInterruption).toHaveBeenCalledWith(expect.any(String));
  });

  it('중단 구간을 모두 확인하면 확인 패널을 화면에서 제거한다.', async () => {
    const user = userEvent.setup();

    useRecordingStore.getState().appendInterruptionChunk();

    renderReviewForm();

    const interruptionCountText = screen.getByText('녹음 중단 구간 1개');
    expect(interruptionCountText).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '1번째 중단 구간 확인'}));

    expect(interruptionCountText).not.toBeInTheDocument();
  });

  it('녹음 중단 구간이 있을 경우 요약 생성 버튼을 비활성화한다.', () => {
    useRecordingStore.getState().appendInterruptionChunk();

    renderReviewForm();

    expect(screen.getByRole('button', {name: '요약 생성하기'})).toBeDisabled();
  });

  it('녹음 중단 구간을 모두 확인하면 요약 생성 버튼을 활성화한다.', async () => {
    const user = userEvent.setup();

    useRecordingStore.getState().appendInterruptionChunk();

    renderReviewForm();

    const submitButton = screen.getByRole('button', {name: '요약 생성하기'});
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole('button', {name: '1번째 중단 구간 확인'}));

    expect(submitButton).toBeEnabled();
  });

  it('요약 생성 요청 시 입력한 전사 내용이 짧을 경우 에러 메세지를 표시한다.', async () => {
    const user = userEvent.setup();

    mockedGetTranscript.mockReturnValue('짧은 내용');

    renderReviewForm();

    await user.click(screen.getByRole('button', {name: '요약 생성하기'}));

    expect(screen.getByText('요약할 회의 내용이 충분하지 않습니다.')).toBeInTheDocument();
  });

  it('요약 생성 요청 시 입력한 제목을 검증해 에러 메세지를 표시한다.', async () => {
    const user = userEvent.setup();

    renderReviewForm();

    const titleInput = screen.getByRole('textbox', {name: '회의 제목'});
    const submitButton = screen.getByRole('button', {name: '요약 생성하기'});

    await user.clear(titleInput);
    await user.click(submitButton);

    expect(screen.getByText('회의 제목을 입력해주세요.')).toBeInTheDocument();

    await user.type(titleInput, 's'.repeat(101));

    expect(screen.getByText('회의 제목은 최대 100자 이하로 입력할 수 있습니다.')).toBeInTheDocument();
  });

  it('요약 생성 전 입력 내용을 복구할 수 있게 보존한다.', async () => {
    const user = userEvent.setup();

    mockedGetTranscript.mockReturnValue(VALID_TRANSCRIPT);
    mockedFetchTranscriptSummary.mockResolvedValue({
      summary: '생성된 회의 요약입니다.',
      keyPoints: ['요약 결과는 별도 다이얼로그에서 확인하기로 했다.'],
    });

    renderReviewForm();

    const titleInput = screen.getByRole('textbox', {name: '회의 제목'});
    await user.clear(titleInput);
    await user.type(titleInput, '요약 생성 테스트 회의');
    await user.click(screen.getByRole('button', {name: '요약 생성하기'}));

    await waitFor(() => {
      expect(mockedFetchTranscriptSummary).toHaveBeenCalledWith(
        {
          title: '요약 생성 테스트 회의',
          transcript: VALID_TRANSCRIPT,
        },
        expect.any(Object),
      );
    });

    expect(readTranscriptReviewDraft()).toEqual({
      title: '요약 생성 테스트 회의',
      transcript: VALID_TRANSCRIPT,
    });
  });

  it('요약 생성에 실패해도 입력을 잃지 않고 다시 생성할 수 있다.', async () => {
    const user = userEvent.setup();

    mockedGetTranscript.mockReturnValue(VALID_TRANSCRIPT);
    mockedFetchTranscriptSummary.mockRejectedValueOnce(new Error('요약 생성 실패')).mockResolvedValueOnce({
      summary: '다시 생성된 회의 요약입니다.',
      keyPoints: ['실패 후 같은 제목과 전사 내용으로 다시 생성했다.'],
    });

    renderReviewForm();

    const titleInput = screen.getByRole('textbox', {name: '회의 제목'});
    await user.clear(titleInput);
    await user.type(titleInput, '요약 실패 재시도 회의');
    await user.click(screen.getByRole('button', {name: '요약 생성하기'}));

    await waitFor(() => {
      expect(mockedFetchTranscriptSummary).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', {name: '요약 생성하기'})).toBeEnabled();
    });

    expect(titleInput).toHaveValue('요약 실패 재시도 회의');
    expect(readTranscriptReviewDraft()).toEqual({
      title: '요약 실패 재시도 회의',
      transcript: VALID_TRANSCRIPT,
    });

    await user.click(screen.getByRole('button', {name: '요약 생성하기'}));

    expect(await screen.findByText('다시 생성된 회의 요약입니다.')).toBeInTheDocument();
    expect(screen.getByText('실패 후 같은 제목과 전사 내용으로 다시 생성했다.')).toBeInTheDocument();
    expect(mockedFetchTranscriptSummary).toHaveBeenCalledTimes(2);
  });

  it('요약 생성에 성공하면 요약 결과를 확인할 수 있고 검토 입력을 잠근다.', async () => {
    const user = userEvent.setup();

    mockedGetTranscript.mockReturnValue(VALID_TRANSCRIPT);
    mockedFetchTranscriptSummary.mockResolvedValue({
      summary: '생성된 회의 요약입니다.',
      keyPoints: ['요약 결과는 별도 다이얼로그에서 확인하기로 했다.'],
    });

    renderReviewForm();

    const titleInput = screen.getByRole('textbox', {name: '회의 제목'});
    await user.clear(titleInput);
    await user.type(titleInput, '요약 결과 확인 회의');
    await user.click(screen.getByRole('button', {name: '요약 생성하기'}));

    expect(await screen.findByText('생성된 회의 요약입니다.')).toBeInTheDocument();
    expect(screen.getByText('요약 결과는 별도 다이얼로그에서 확인하기로 했다.')).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('readonly');

    await user.click(screen.getByRole('button', {name: '닫기'}));

    expect(screen.getByRole('button', {name: '요약 결과 확인하기'})).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('readonly');
  });

  it('요약 결과 저장 중에는 결과를 유지하고 저장 성공 시 생성된 회의록 화면으로 이동한다.', async () => {
    const user = userEvent.setup();
    let resolveCreateMeeting!: (response: CreateMeetingResponse) => void;

    mockedGetTranscript.mockReturnValue(VALID_TRANSCRIPT);
    mockedFetchTranscriptSummary.mockResolvedValue({
      summary: '저장할 회의 요약입니다.',
      keyPoints: ['회의 저장 요청이 성공하면 기록 화면으로 이동한다.'],
    });
    mockedFetchCreateMeeting.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveCreateMeeting = resolve;
        }),
    );

    mockRouter.push('/');

    renderReviewForm();

    const titleInput = screen.getByRole('textbox', {name: '회의 제목'});
    await user.clear(titleInput);
    await user.type(titleInput, '회의 저장 테스트');
    await user.click(screen.getByRole('button', {name: '요약 생성하기'}));

    expect(await screen.findByText('저장할 회의 요약입니다.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '저장하기'}));

    await screen.findByRole('button', {name: /저장 중/});

    expect(screen.getByText('저장할 회의 요약입니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '닫기'})).toBeDisabled();
    expect(screen.getByRole('button', {name: '수정 후 다시 생성하기'})).toBeDisabled();
    expect(screen.getByRole('button', {name: /저장 중/})).toBeDisabled();
    expect(mockedFetchCreateMeeting).toHaveBeenCalledWith(
      {
        title: '회의 저장 테스트',
        originTranscript: '',
        transcript: VALID_TRANSCRIPT,
        summary: '저장할 회의 요약입니다.',
        keyPoints: ['회의 저장 요청이 성공하면 기록 화면으로 이동한다.'],
      },
      expect.any(Object),
    );

    resolveCreateMeeting({
      id: '5f5d8a97-022c-4ea9-bef6-c099a4df6fce',
      meetingDate: '2026-05-17',
    });

    await waitFor(() => {
      expect(mockRouter.asPath).toBe(
        '/history?year=2026&month=05&date=2026-05-17&meetingId=5f5d8a97-022c-4ea9-bef6-c099a4df6fce',
      );
    });
  });

  it('저장에 실패해도 요약 결과를 잃지 않고 다시 저장할 수 있다.', async () => {
    const user = userEvent.setup();

    mockedGetTranscript.mockReturnValue(VALID_TRANSCRIPT);
    mockedFetchTranscriptSummary.mockResolvedValue({
      summary: '저장 실패 후 유지할 회의 요약입니다.',
      keyPoints: ['저장 실패 후에도 같은 요약 결과를 다시 저장할 수 있다.'],
    });
    mockedFetchCreateMeeting.mockRejectedValueOnce(new Error('회의 저장 실패')).mockResolvedValueOnce({
      id: '5f5d8a97-022c-4ea9-bef6-c099a4df6fce',
      meetingDate: '2026-05-17',
    });

    mockRouter.push('/');

    renderReviewForm();

    const titleInput = screen.getByRole('textbox', {name: '회의 제목'});
    await user.clear(titleInput);
    await user.type(titleInput, '회의 저장 실패 재시도');
    await user.click(screen.getByRole('button', {name: '요약 생성하기'}));

    expect(await screen.findByText('저장 실패 후 유지할 회의 요약입니다.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '저장하기'}));

    await waitFor(() => {
      expect(mockedFetchCreateMeeting).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', {name: '저장하기'})).toBeEnabled();
    });

    expect(screen.getByText('저장 실패 후 유지할 회의 요약입니다.')).toBeInTheDocument();
    expect(screen.getByText('저장 실패 후에도 같은 요약 결과를 다시 저장할 수 있다.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '저장하기'}));

    await waitFor(() => {
      expect(mockedFetchCreateMeeting).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(mockRouter.asPath).toBe(
        '/history?year=2026&month=05&date=2026-05-17&meetingId=5f5d8a97-022c-4ea9-bef6-c099a4df6fce',
      );
    });
  });
});

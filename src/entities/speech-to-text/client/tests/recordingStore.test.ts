import {transcriptChunks, useRecordingStore} from '../recordingStore';
import type {RecordingDraft} from '../recordingDraftStorage';

describe('@/src/entities/speech-to-text/client/recordingStore.ts', () => {
  beforeEach(() => {
    jest.useFakeTimers();

    // 단순 초기화 action은 테스트 인프라로 사용한다.
    useRecordingStore.getState().resetRecording();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('녹음을 시작하면 녹음 상태와 시간 기준값을 초기화한다.', () => {
    const FAKE_TIME = '2026-05-12T00:00:00.000Z';
    jest.setSystemTime(new Date(FAKE_TIME));

    useRecordingStore.getState().startRecording();

    const state = useRecordingStore.getState();

    expect(state.status).toBe('recording');
    expect(state.startedAt).toBe(FAKE_TIME);
    expect(state.updatedAt).toBe(FAKE_TIME);
    expect(state.recordingStartedAt).toBe(FAKE_TIME);
    expect(state.recordingElapsedMs).toBe(0);
    expect(state.errorCode).toBeNull();
  });

  it('일시 정지하면 현재 녹음 중인 구간을 누적하고 일시 정지 상태로 전환한다.', () => {
    useRecordingStore.setState({
      status: 'recording',
      recordingElapsedMs: 0,
      recordingStartedAt: '2026-05-12T00:00:00.000Z',
    });

    jest.setSystemTime(new Date('2026-05-12T00:00:05.000Z'));

    useRecordingStore.getState().pauseRecording();

    const state = useRecordingStore.getState();

    expect(state.status).toBe('paused');
    expect(state.recordingElapsedMs).toBe(5000);
  });

  it('일시 정지 시점에 녹음 중인 구간이 없다면 누적 없이 일시 정지 상태로 전환한다.', () => {
    useRecordingStore.getState().pauseRecording();

    const state = useRecordingStore.getState();

    expect(state.status).toBe('paused');
    expect(state.recordingElapsedMs).toBe(0);
  });

  it('일시 정지 상태에서 녹음을 재개하면 현재 구간 시작점을 현재 시간으로 설정하고 녹음 중 상태로 전환한다.', () => {
    useRecordingStore.setState({
      status: 'paused',
      recordingElapsedMs: 5000,
      recordingStartedAt: null,
    });

    const FAKE_TIME = '2026-05-12T00:00:10.000Z';
    jest.setSystemTime(new Date(FAKE_TIME));

    useRecordingStore.getState().resumeRecording();

    const state = useRecordingStore.getState();

    expect(state.status).toBe('recording');
    expect(state.recordingStartedAt).toBe(FAKE_TIME);
    expect(state.recordingElapsedMs).toBe(5000);
  });

  it('녹음을 종료하면 현재 녹음 중인 구간을 누적하고 일시 검토 상태로 전환한다.', () => {
    const FAKE_TIME = '2026-05-12T00:00:10.000Z';
    jest.setSystemTime(new Date(FAKE_TIME));

    useRecordingStore.setState({
      status: 'recording',
      recordingElapsedMs: 0,
      recordingStartedAt: FAKE_TIME,
    });

    jest.advanceTimersByTime(5000);

    useRecordingStore.getState().finishRecording();

    const state = useRecordingStore.getState();

    expect(state.status).toBe('transcript_review');
    expect(state.recordingElapsedMs).toBe(5000);
  });

  it('일시 정지 상태에서 녹음을 종료하면 누적 시간만 유지하고 검토 상태로 전환한다.', () => {
    const FAKE_TIME = '2026-05-12T00:00:10.000Z';
    jest.setSystemTime(new Date(FAKE_TIME));

    useRecordingStore.setState({
      status: 'paused',
      recordingElapsedMs: 5000,
      recordingStartedAt: null,
    });

    jest.advanceTimersByTime(65_000);

    useRecordingStore.getState().finishRecording();

    const state = useRecordingStore.getState();

    expect(state.status).toBe('transcript_review');
    expect(state.recordingElapsedMs).toBe(5000);
  });

  it('전달한 문장을 전체 기록과 미리보기에 추가한다.', () => {
    const TEST_TEXT = '테스트 문장';

    useRecordingStore.getState().appendSpeechChunk(TEST_TEXT);

    const state = useRecordingStore.getState();

    expect(transcriptChunks.length).toBe(1);
    expect(state.previewChunks.length).toBe(1);
    expect(state.previewChunks[0]).toMatchObject({
      kind: 'speech',
      text: TEST_TEXT,
    });
  });

  it('미리보기는 최근 10개의 문장만 보관한다.', () => {
    function createSpeechChunk() {
      return Array.from(
        {length: 10},
        (_, i) =>
          ({
            id: String(i + 1),
            text: `text ${i + 1}`,
            kind: 'speech',
          }) as const,
      );
    }

    useRecordingStore.setState({
      previewChunks: createSpeechChunk(),
    });

    const TEST_TEXT = '최근 문장';

    useRecordingStore.getState().appendSpeechChunk(TEST_TEXT);

    const state = useRecordingStore.getState();

    expect(state.previewChunks.length).toBe(10);
    expect(state.previewChunks[0]).toMatchObject({
      text: 'text 2',
    });
    expect(state.previewChunks.at(-1)).toMatchObject({
      text: TEST_TEXT,
    });
  });

  it('녹음 중단 문구 삽입 시 전체 기록과 미리보기에 현재 시간을 포함한 중단 문구를 추가한다.', () => {
    useRecordingStore.setState({
      status: 'recording',
      recordingElapsedMs: 5000,
      recordingStartedAt: '2026-05-12T00:00:10.000Z',
    });

    jest.setSystemTime(new Date('2026-05-12T00:00:15.000Z'));

    useRecordingStore.getState().appendInterruptionChunk();

    const state = useRecordingStore.getState();

    expect(transcriptChunks.length).toBe(1);
    expect(state.previewChunks.length).toBe(1);
    expect(state.previewChunks[0]).toMatchObject({
      kind: 'interruption',
      text: '[녹음 중단 구간] 00:00:10 지점에 녹음이 잠시 멈췄어요.',
    });
    expect(state.interruptionCount).toBe(1);
  });

  it('중단 구간을 확인하면 남은 중단 구간 수를 줄인다.', () => {
    useRecordingStore.setState({interruptionCount: 2});

    useRecordingStore.getState().confirmInterruptionChunk();

    expect(useRecordingStore.getState().interruptionCount).toBe(1);
  });

  it('남은 중단 구간 수는 0보다 작아지지 않는다.', () => {
    useRecordingStore.setState({interruptionCount: 0});

    useRecordingStore.getState().confirmInterruptionChunk();

    expect(useRecordingStore.getState().interruptionCount).toBe(0);
  });

  it('저장된 데이터가 녹음 중단 상태에서 저장됐다면 이전 기록을 그대로 복구한다.', () => {
    const speechChunk = {
      id: 'speech-1',
      kind: 'speech',
      text: '복구된 문장',
    } as const;

    const draft: RecordingDraft = {
      status: 'paused',
      chunks: [speechChunk],
      previewChunks: [speechChunk],
      selectedMicrophone: {id: 'mic-1', label: '테스트 마이크'},
      startedAt: '2026-05-12T00:00:00.000Z',
      updatedAt: '2026-05-12T00:00:05.000Z',
      recordingElapsedMs: 5000,
      recordingStartedAt: null,
      interruptionCount: 1,
    };

    useRecordingStore.getState().restoreRecordingDraft(draft);

    const state = useRecordingStore.getState();

    expect(state.status).toBe('paused');
    expect(state.previewChunks).toEqual([speechChunk]);
    expect(state.selectedMicrophone).toEqual(draft.selectedMicrophone);
    expect(state.startedAt).toBe(draft.startedAt);
    expect(state.updatedAt).toBe(draft.updatedAt);
    expect(state.recordingElapsedMs).toBe(5000);
    expect(state.recordingStartedAt).toBeNull();
    expect(state.interruptionCount).toBe(1);
    expect(transcriptChunks).toEqual([speechChunk]);
  });

  it('녹음 중 비정상적으로 저장된 데이터가 있다면 저장 시점 기준의 중단 구간을 추가하고 에러 상태로 복구한다.', () => {
    const RESTORED_AT = '2026-05-12T00:10:00.000Z';
    jest.setSystemTime(new Date(RESTORED_AT));

    const speechChunk = {
      id: 'speech-1',
      kind: 'speech',
      text: '복구 전 문장',
    } as const;

    const draft: RecordingDraft = {
      status: 'recording',
      chunks: [speechChunk],
      previewChunks: [speechChunk],
      selectedMicrophone: null,
      startedAt: '2026-05-12T00:00:00.000Z',
      updatedAt: '2026-05-12T00:00:10.000Z',
      recordingElapsedMs: 5000,
      recordingStartedAt: '2026-05-12T00:00:05.000Z',
      interruptionCount: 1,
    };

    useRecordingStore.getState().restoreRecordingDraft(draft);

    const state = useRecordingStore.getState();

    expect(state.status).toBe('error');
    expect(state.updatedAt).toBe(RESTORED_AT);
    expect(state.recordingStartedAt).toBeNull();
    expect(state.interruptionCount).toBe(2);
    expect(transcriptChunks).toHaveLength(2);
    expect(state.previewChunks).toHaveLength(2);
    expect(state.previewChunks.at(-1)).toMatchObject({
      kind: 'interruption',
      text: '[녹음 중단 구간] 00:00:10 지점에 녹음이 잠시 멈췄어요.',
    });
  });
});

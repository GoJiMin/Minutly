import {create} from 'zustand';
import {RecordingDraft} from './recordingDraftStorage';
import {MicrophoneDevice, RecordingErrorCode, RecordingStatus, TranscriptChunk} from '../model/types';
import {formatDuration} from '@/shared/utils';

type State = {
  status: RecordingStatus;
  errorCode: RecordingErrorCode | null;
  previewChunks: TranscriptChunk[];
  selectedMicrophone: MicrophoneDevice | null;
  startedAt: string | null;
  updatedAt: string | null;
  recordingElapsedMs: number;
  recordingStartedAt: string | null;
};

type Action = {
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  finishRecording: () => void;
  appendSpeechChunk: (text: string) => void;
  appendInterruptionChunk: () => void;
  markRecordingError: (errorCode: RecordingErrorCode) => void;
  clearRecordingError: () => void;
  setRecordingStatus: (status: RecordingStatus) => void;
  setSelectedMicrophone: (deviceInfo: MicrophoneDevice | null) => void;
  restoreRecordingDraft: (draft: RecordingDraft) => void;
  resetRecording: () => void;
};

export let transcriptChunks: TranscriptChunk[] = [];

function appendPreviewChunk(previewChunks: TranscriptChunk[], chunk: TranscriptChunk) {
  if (previewChunks.length < 10) {
    return [...previewChunks, chunk];
  }

  const nextPreviewChunks = previewChunks.slice(1);
  nextPreviewChunks.push(chunk);

  return nextPreviewChunks;
}

export const useRecordingStore = create<State & Action>(set => ({
  status: 'idle',
  errorCode: null,
  previewChunks: [],
  selectedMicrophone: null,
  startedAt: null,
  updatedAt: null,
  recordingElapsedMs: 0,
  recordingStartedAt: null,

  startRecording: () =>
    set(() => {
      const now = new Date().toISOString();

      return {
        status: 'recording',
        startedAt: now,
        updatedAt: now,
        errorCode: null,
        recordingStartedAt: now,
        recordingElapsedMs: 0,
      };
    }),

  pauseRecording: () =>
    set(state => {
      const now = new Date().toISOString();

      if (!state.recordingStartedAt) {
        return {
          status: 'paused',
          updatedAt: now,
        };
      }

      const recordingElapsedMs = getRecordingElapsedMs({
        recordingElapsedMs: state.recordingElapsedMs,
        recordingStartedAt: state.recordingStartedAt,
        now,
      });

      return {
        status: 'paused',
        recordingElapsedMs,
        recordingStartedAt: null,
        updatedAt: now,
      };
    }),

  resumeRecording: () =>
    set(() => {
      const now = new Date().toISOString();

      return {
        status: 'recording',
        recordingStartedAt: now,
        updatedAt: now,
        errorCode: null,
      };
    }),

  finishRecording: () =>
    set(state => {
      const now = new Date().toISOString();

      const recordingElapsedMs = getRecordingElapsedMs({
        recordingElapsedMs: state.recordingElapsedMs,
        recordingStartedAt: state.recordingStartedAt,
        now,
      });

      return {
        status: 'transcript_review',
        recordingElapsedMs,
        recordingStartedAt: null,
        updatedAt: now,
      };
    }),

  appendSpeechChunk: text =>
    set(state => {
      const now = new Date().toISOString();
      const chunk = createTranscriptChunk({text, kind: 'speech', now});

      transcriptChunks.push(chunk);

      return {
        previewChunks: appendPreviewChunk(state.previewChunks, chunk),
        updatedAt: now,
      };
    }),

  appendInterruptionChunk: () =>
    set(state => {
      const now = new Date().toISOString();

      const recordingElapsedMs = getRecordingElapsedMs({
        recordingElapsedMs: state.recordingElapsedMs,
        recordingStartedAt: state.recordingStartedAt,
        now,
      });

      const chunk = createTranscriptChunk({kind: 'interruption', now, recordingElapsedMs});

      transcriptChunks.push(chunk);

      return {
        previewChunks: appendPreviewChunk(state.previewChunks, chunk),
        updatedAt: now,
      };
    }),

  markRecordingError: errorCode => set({status: 'error', errorCode}),
  clearRecordingError: () =>
    set(state => ({
      status: state.status === 'error' ? 'idle' : state.status,
      errorCode: null,
    })),

  setRecordingStatus: status => set({status}),

  setSelectedMicrophone: deviceInfo => set({selectedMicrophone: deviceInfo}),

  restoreRecordingDraft: draft => {
    const shouldAppendInterruption = draft.status === 'recording' || draft.status === 'error';
    const now = new Date().toISOString();

    transcriptChunks = draft.chunks;
    let previewChunks = draft.previewChunks;

    if (shouldAppendInterruption) {
      const recordingElapsedMs = getRecordingElapsedMs({
        recordingElapsedMs: draft.recordingElapsedMs,
        recordingStartedAt: draft.recordingStartedAt,
        now: draft.updatedAt,
      });

      const interruptionChunk = createTranscriptChunk({
        kind: 'interruption',
        now,
        recordingElapsedMs,
      });

      transcriptChunks.push(interruptionChunk);
      previewChunks = appendPreviewChunk(previewChunks, interruptionChunk);
    }

    set({
      status: shouldAppendInterruption ? 'error' : draft.status,
      previewChunks,
      selectedMicrophone: draft.selectedMicrophone,
      startedAt: draft.startedAt,
      updatedAt: shouldAppendInterruption ? now : draft.updatedAt,
      recordingElapsedMs: draft.recordingElapsedMs,
      recordingStartedAt: shouldAppendInterruption ? null : draft.recordingStartedAt,
    });
  },

  resetRecording: () =>
    set(() => {
      transcriptChunks = [];

      return {
        status: 'idle',
        errorCode: null,
        previewChunks: [],
        selectedMicrophone: null,
        startedAt: null,
        updatedAt: null,
        recordingElapsedMs: 0,
        recordingStartedAt: null,
      };
    }),
}));

type CreateTranscriptChunkProps =
  | {text: string; kind: 'speech'; now: string}
  | {kind: 'interruption'; now: string; recordingElapsedMs: number};

function getRecordingElapsedMs({
  recordingElapsedMs,
  recordingStartedAt,
  now,
}: {
  recordingElapsedMs: number;
  recordingStartedAt: string | null;
  now: string;
}) {
  if (!recordingStartedAt) {
    return recordingElapsedMs;
  }

  const elapsedMs = Date.parse(now) - Date.parse(recordingStartedAt);

  return recordingElapsedMs + Math.max(0, elapsedMs);
}

function createTranscriptChunk(props: CreateTranscriptChunkProps): TranscriptChunk {
  const {now, kind} = props;
  const id = `${now}-${transcriptChunks.length}`;

  if (kind === 'speech') {
    return {id, kind: 'speech', text: props.text};
  }

  const elapsedSeconds = Math.floor(props.recordingElapsedMs / 1000);

  let text: string;
  if (elapsedSeconds == null) {
    text = '[녹음 중단 구간] 녹음이 잠시 멈췄어요.';
  } else {
    text = `[녹음 중단 구간] ${formatDuration(props.recordingElapsedMs)} 지점에 녹음이 잠시 멈췄어요.`;
  }

  return {id, kind: 'interruption', text};
}

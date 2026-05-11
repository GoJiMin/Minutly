import {create} from 'zustand';
import {RecordingDraft} from './recordingDraftStorage';
import {MicrophoneDevice, RecordingErrorCode, RecordingStatus, TranscriptChunk} from '../model/types';

type State = {
  status: RecordingStatus;
  errorCode: RecordingErrorCode | null;
  previewChunks: TranscriptChunk[];
  selectedMicrophone: MicrophoneDevice | null;
  startedAt: string | null;
  updatedAt: string | null;
};

type Action = {
  startRecording: () => void;
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

  startRecording: () =>
    set(() => {
      const now = new Date().toISOString();

      return {
        status: 'recording',
        startedAt: now,
        updatedAt: now,
        errorCode: null,
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
      const chunk = createTranscriptChunk({kind: 'interruption', now, startedAt: state.startedAt});

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
      const interruptionChunk = createTranscriptChunk({kind: 'interruption', now, startedAt: draft.startedAt});

      transcriptChunks.push(interruptionChunk);
      previewChunks = appendPreviewChunk(previewChunks, interruptionChunk);
    }

    set({
      status: shouldAppendInterruption ? 'error' : draft.status,
      previewChunks,
      selectedMicrophone: draft.selectedMicrophone,
      startedAt: draft.startedAt,
      updatedAt: shouldAppendInterruption ? now : draft.updatedAt,
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
      };
    }),
}));

type CreateTranscriptChunkProps =
  | {text: string; kind: 'speech'; now: string}
  | {kind: 'interruption'; now: string; startedAt: string | null};

function getElapsedSeconds(startedAt: string | null, now: string) {
  if (!startedAt) return null;

  const elapsedMs = new Date(now).getTime() - new Date(startedAt).getTime();

  if (Number.isFinite(elapsedMs) && elapsedMs > 0) {
    return Math.floor(elapsedMs / 1000);
  }

  return null;
}

function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

function createTranscriptChunk(props: CreateTranscriptChunkProps): TranscriptChunk {
  const {now, kind} = props;
  const id = `${now}-${transcriptChunks.length}`;

  if (kind === 'speech') {
    return {id, kind: 'speech', text: props.text};
  }

  const elapsedSeconds = getElapsedSeconds(props.startedAt, now);

  let text: string;
  if (elapsedSeconds == null) {
    text = '[녹음 중단 구간] 녹음이 잠시 멈췄어요.';
  } else {
    text = `[녹음 중단 구간] ${formatElapsedTime(elapsedSeconds)} 지점에 녹음이 잠시 멈췄어요.`;
  }

  return {id, kind: 'interruption', text};
}

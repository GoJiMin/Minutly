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

type CreateTranscriptChunkProps = {text: string; kind: 'speech'; now: string} | {kind: 'interruption'; now: string};

function createTranscriptChunk(props: CreateTranscriptChunkProps): TranscriptChunk {
  const {now, kind} = props;
  const id = `${now}-${transcriptChunks.length}`;

  if (kind === 'speech') {
    return {id, kind: 'speech', text: props.text};
  } else {
    return {id, kind: 'interruption', text: '[녹음 중단 구간]', interruptedAt: now};
  }
}

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
      const chunk = createTranscriptChunk({kind: 'interruption', now});

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
      const interruptionChunk = createTranscriptChunk({kind: 'interruption', now});

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

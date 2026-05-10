import {z} from 'zod';
import {transcriptChunks, useRecordingStore} from './recordingStore';
import {localStorageClient} from '@/shared/utils';

const transcriptChunkSchema = z.discriminatedUnion('kind', [
  z.object({
    id: z.string(),
    text: z.string(),
    kind: z.literal('speech'),
  }),
  z.object({
    id: z.string(),
    text: z.literal('[녹음 중단 구간]'),
    kind: z.literal('interruption'),
    interruptedAt: z.string(),
  }),
]);

const recordingDraftSchema = z.object({
  status: z.enum(['recording', 'transcript_review', 'error']),
  chunks: z.array(transcriptChunkSchema),
  previewChunks: z.array(transcriptChunkSchema),
  selectedDeviceId: z.string().nullable(),
  startedAt: z.string(),
  updatedAt: z.string(),
});

export type RecordingDraft = z.infer<typeof recordingDraftSchema>;
type DraftStatus = RecordingDraft['status'];

const RECORDING_DRAFT_STORAGE_KEY = 'recording-draft:v1';

function createRecordingDraftSnapshot(status: DraftStatus) {
  const state = useRecordingStore.getState();

  if (!state.startedAt) return null;

  return {
    status,
    chunks: transcriptChunks,
    previewChunks: state.previewChunks,
    selectedDeviceId: state.selectedDeviceId,
    startedAt: state.startedAt,
    updatedAt: new Date().toISOString(),
  };
}

export function saveRecordingDraft(status: DraftStatus) {
  const snapshot = createRecordingDraftSnapshot(status);
  const result = recordingDraftSchema.safeParse(snapshot);

  if (!result.success) return;

  localStorageClient.write(RECORDING_DRAFT_STORAGE_KEY, result.data);
}

export function readRecordingDraft() {
  const value = localStorageClient.read(RECORDING_DRAFT_STORAGE_KEY);
  const result = recordingDraftSchema.safeParse(value);

  if (!result.success) {
    localStorageClient.remove(RECORDING_DRAFT_STORAGE_KEY);
    return null;
  }

  return result.data;
}

export function removeRecordingDraft() {
  localStorageClient.remove(RECORDING_DRAFT_STORAGE_KEY);
}

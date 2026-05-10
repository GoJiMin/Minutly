export type SpeechTokenResponse = {
  token: string;
  endpoint: string;
};

export type RecordingStatus = 'idle' | 'recording' | 'transcript_review' | 'summarizing' | 'completed' | 'error';
export type RecordingErrorCode =
  | 'microphone_api_unavailable'
  | 'microphone_permission_denied'
  | 'microphone_not_found'
  | 'speech_token_failed'
  | 'speech_recognition_canceled'
  | 'speech_session_stopped';

export type SpeechTranscriptChunk = {
  id: string;
  text: string;
  kind: 'speech';
};

export type InterruptionTranscriptChunk = {
  id: string;
  text: '[녹음 중단 구간]';
  kind: 'interruption';
  interruptedAt: string;
};

export type TranscriptChunk = SpeechTranscriptChunk | InterruptionTranscriptChunk;

export type SpeechTokenResponse = {
  token: string;
  region: string;
};

export type RecordingStatus =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'transcript_review'
  | 'summarizing'
  | 'completed'
  | 'error';

export type RecordingErrorCode =
  | 'microphone_api_unavailable'
  | 'microphone_permission_denied'
  | 'microphone_not_found'
  | 'microphone_access_failed'
  | 'speech_token_failed'
  | 'speech_recognition_canceled'
  | 'speech_session_stopped'
  | 'speech_recognizer_start_failed';

export type MicrophoneDevice = {
  id: string;
  label: string;
};

export type SpeechTranscriptChunk = {
  id: string;
  text: string;
  kind: 'speech';
};

export type InterruptionTranscriptChunk = {
  id: string;
  text: string;
  kind: 'interruption';
};

export type TranscriptChunk = SpeechTranscriptChunk | InterruptionTranscriptChunk;

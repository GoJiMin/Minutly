'use client';

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import {useAzureSpeechTokenMutation} from './useAzureSpeechTokenMutation';

const RECOGNITION_LANGUAGE = 'ko-KR';

type SpeechRecognitionCancelReason = 'error' | 'end_of_stream' | 'unknown';

type SpeechRecognitionCancelInfo = {
  reason: SpeechRecognitionCancelReason;
  errorCode: string | null;
  errorDetails: string | null;
  sessionId: string;
};

type SpeechRecognizerEventHandlers = {
  onRecognized?: (text: string) => void;
  onCanceled?: (event: SpeechRecognitionCancelInfo) => void;
  onSessionStopped?: () => void;
};

export function useAzureSpeechRecognizer() {
  const {issueAzureSpeechToken} = useAzureSpeechTokenMutation();

  async function createSpeechRecognizer({deviceId}: {deviceId?: string}): Promise<sdk.SpeechRecognizer> {
    const {token, region} = await issueAzureSpeechToken();

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
    speechConfig.speechRecognitionLanguage = RECOGNITION_LANGUAGE;

    let audioConfig: sdk.AudioConfig;

    if (typeof deviceId === 'string' && deviceId.length > 0) {
      audioConfig = sdk.AudioConfig.fromMicrophoneInput(deviceId);
    } else {
      audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    }

    return new sdk.SpeechRecognizer(speechConfig, audioConfig);
  }

  function mapCancelReason(reason: sdk.CancellationReason): SpeechRecognitionCancelReason {
    switch (reason) {
      case sdk.CancellationReason.Error:
        return 'error';
      case sdk.CancellationReason.EndOfStream:
        return 'end_of_stream';
      default:
        return 'unknown';
    }
  }

  function createCancelInfo(event: sdk.SpeechRecognitionCanceledEventArgs): SpeechRecognitionCancelInfo {
    return {
      reason: mapCancelReason(event.reason),
      errorCode: event.errorCode == null ? null : sdk.CancellationErrorCode[event.errorCode],
      errorDetails: event.errorDetails ?? null,
      sessionId: event.sessionId,
    };
  }

  function registerSpeechRecognizerEvents(recognizer: sdk.SpeechRecognizer, handlers: SpeechRecognizerEventHandlers) {
    recognizer.recognized = (_sender, event) => {
      if (event.result.reason !== sdk.ResultReason.RecognizedSpeech) return;

      const text = event.result.text.trim();

      if (text.length > 0) {
        handlers.onRecognized?.(text);
      }
    };

    recognizer.canceled = (_sender, event) => {
      handlers.onCanceled?.(createCancelInfo(event));
    };

    recognizer.sessionStopped = () => {
      handlers.onSessionStopped?.();
    };
  }

  function startContinuousRecognition(recognizer: sdk.SpeechRecognizer) {
    return new Promise<void>((resolve, reject) => {
      recognizer.startContinuousRecognitionAsync(resolve, reject);
    });
  }

  function stopContinuousRecognition(recognizer: sdk.SpeechRecognizer) {
    return new Promise<void>((resolve, reject) => {
      recognizer.stopContinuousRecognitionAsync(resolve, reject);
    });
  }

  return {
    createSpeechRecognizer,
    registerSpeechRecognizerEvents,
    startContinuousRecognition,
    stopContinuousRecognition,
  };
}

'use client';

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import {useAzureSpeechTokenMutation} from './useAzureSpeechTokenMutation';

const RECOGNITION_LANGUAGE = 'ko-KR';

type SpeechRecognizerEventHandlers = {
  onRecognized?: (text: string) => void;
  onCanceled?: () => void;
  onSessionStopped?: () => void;
};

export function useAzureSpeechRecognizer() {
  const {issueAzureSpeechToken} = useAzureSpeechTokenMutation();

  async function createSpeechRecognizer({deviceId}: {deviceId?: string}): Promise<sdk.SpeechRecognizer> {
    const {token, endpoint} = await issueAzureSpeechToken();

    const speechConfig = sdk.SpeechConfig.fromEndpoint(new URL(endpoint));
    speechConfig.authorizationToken = token;
    speechConfig.speechRecognitionLanguage = RECOGNITION_LANGUAGE;

    let audioConfig: sdk.AudioConfig;

    if (typeof deviceId === 'string' && deviceId.length > 0) {
      audioConfig = sdk.AudioConfig.fromMicrophoneInput(deviceId);
    } else {
      audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    }

    return new sdk.SpeechRecognizer(speechConfig, audioConfig);
  }

  function registerSpeechRecognizerEvents(recognizer: sdk.SpeechRecognizer, handlers: SpeechRecognizerEventHandlers) {
    recognizer.recognized = (_sender, event) => {
      if (event.result.reason !== sdk.ResultReason.RecognizedSpeech) return;

      const text = event.result.text.trim();

      if (text.length > 0) {
        handlers.onRecognized?.(text);
      }
    };

    recognizer.canceled = () => {
      handlers.onCanceled?.();
    };

    recognizer.sessionStopped = () => {
      handlers.onSessionStopped?.();
    };
  }

  return {
    createSpeechRecognizer,
    registerSpeechRecognizerEvents,
  };
}

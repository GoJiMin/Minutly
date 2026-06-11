'use client';

import {useRef} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {saveRecordingDraft, useAzureSpeechRecognizer, useRecordingStore} from '@/entities/speech-to-text/client';

type RecordingSessionStopReason = 'user_pause' | 'user_finish' | 'recognition_failed' | null;

export function useRecordingSessionController() {
  const recognizerRef = useRef<Awaited<ReturnType<typeof createSpeechRecognizer>> | null>(null);
  const stopReasonRef = useRef<RecordingSessionStopReason>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const {
    createSpeechRecognizer,
    registerSpeechRecognizerEvents,
    startContinuousRecognition,
    stopContinuousRecognition,
  } = useAzureSpeechRecognizer();

  const {
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    finishRecording,
    markRecordingError,
    selectedMicrophone,
    appendSpeechChunk,
    appendInterruptionChunk,
  } = useRecordingStore(
    useShallow(state => ({
      status: state.status,
      markRecordingError: state.markRecordingError,
      selectedMicrophone: state.selectedMicrophone,
      appendSpeechChunk: state.appendSpeechChunk,
      appendInterruptionChunk: state.appendInterruptionChunk,
      startRecording: state.startRecording,
      pauseRecording: state.pauseRecording,
      resumeRecording: state.resumeRecording,
      finishRecording: state.finishRecording,
    })),
  );

  function markRecognitionStopFailed() {
    stopReasonRef.current = null;
    recognizerRef.current = null;
    releaseScreenWakeLock();

    markRecordingError('speech_recognition_canceled');
    saveRecordingDraft('error');
  }

  function bindRecordingRecognizerEvents(recognizer: Awaited<ReturnType<typeof createSpeechRecognizer>>) {
    registerSpeechRecognizerEvents(recognizer, {
      onRecognized: appendSpeechChunk,
      onCanceled: cancelInfo => {
        if (cancelInfo.reason === 'end_of_stream') return;

        stopReasonRef.current = 'recognition_failed';

        stopContinuousRecognition(recognizer).catch(markRecognitionStopFailed);
      },
      onSessionStopped: () => {
        switch (stopReasonRef.current) {
          case 'user_pause':
            appendInterruptionChunk();
            pauseRecording();
            saveRecordingDraft('paused');
            break;

          case 'user_finish':
            finishRecording();
            saveRecordingDraft('transcript_review');
            break;

          case 'recognition_failed':
            markRecordingError('speech_recognition_canceled');
            saveRecordingDraft('error');
            break;

          case null:
            markRecordingError('speech_session_stopped');
            saveRecordingDraft('error');
            break;
        }

        stopReasonRef.current = null;
        recognizerRef.current = null;
        releaseScreenWakeLock();
      },
    });
  }

  async function requestScreenWakeLock() {
    if (!('wakeLock' in navigator)) return;
    if (wakeLockRef.current && !wakeLockRef.current.released) return;

    try {
      const wakeLock = await navigator.wakeLock.request('screen');

      wakeLock.addEventListener('release', () => {
        if (wakeLockRef.current === wakeLock) {
          wakeLockRef.current = null;
        }
      });

      wakeLockRef.current = wakeLock;
    } catch {
      wakeLockRef.current = null;
    }
  }

  function releaseScreenWakeLock() {
    const wakeLock = wakeLockRef.current;
    wakeLockRef.current = null;

    if (!wakeLock || wakeLock.released) return;

    wakeLock.release().catch(() => {});
  }

  async function startRecordingSession() {
    try {
      stopReasonRef.current = null;

      const recognizer = await createSpeechRecognizer({deviceId: selectedMicrophone?.id});
      recognizerRef.current = recognizer;

      bindRecordingRecognizerEvents(recognizer);

      await startContinuousRecognition(recognizer);
      await requestScreenWakeLock();

      startRecording();
      saveRecordingDraft('recording');
    } catch {
      stopReasonRef.current = null;
      recognizerRef.current = null;

      markRecordingError('speech_recognizer_start_failed');
    }
  }

  async function resumeRecordingSession() {
    try {
      stopReasonRef.current = null;

      const recognizer = await createSpeechRecognizer({deviceId: selectedMicrophone?.id});
      recognizerRef.current = recognizer;
      bindRecordingRecognizerEvents(recognizer);

      await startContinuousRecognition(recognizer);
      await requestScreenWakeLock();

      resumeRecording();
      saveRecordingDraft('recording');
    } catch {
      stopReasonRef.current = null;
      recognizerRef.current = null;

      markRecordingError('speech_recognizer_start_failed');
    }
  }

  function pauseRecordingSession() {
    const recognizer = recognizerRef.current;

    if (!recognizer) return;

    stopReasonRef.current = 'user_pause';

    stopContinuousRecognition(recognizer).catch(markRecognitionStopFailed);
  }

  function finishRecordingSession() {
    const recognizer = recognizerRef.current;

    if (!recognizer) {
      if (status === 'paused') {
        finishRecording();
        saveRecordingDraft('transcript_review');
      }

      return;
    }

    stopReasonRef.current = 'user_finish';

    stopContinuousRecognition(recognizer).catch(markRecognitionStopFailed);
  }

  return {
    startRecordingSession,
    resumeRecordingSession,
    pauseRecordingSession,
    finishRecordingSession,
  };
}

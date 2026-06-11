'use client';

import {useCallback, useEffect, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {MicrophoneDevice, readPreferredMicrophone, useRecordingStore} from '@/entities/speech-to-text/client';

type MicrophoneDeviceSnapshot = {
  nextMicrophoneOptions: MicrophoneDevice[];
  hasAudioInput: boolean;
  needsMicrophoneAccess: boolean;
};

function createMicrophoneDeviceSnapshot(devices: MediaDeviceInfo[]): MicrophoneDeviceSnapshot {
  let unnamedDeviceCount = 0;
  let hasAudioInput = false;

  const nextMicrophoneOptions: MicrophoneDevice[] = [];

  for (const device of devices) {
    if (device.kind !== 'audioinput') continue;

    hasAudioInput = true;

    const deviceId = device.deviceId.trim();
    const label = device.label.trim();

    if (deviceId.length === 0) continue;

    if (label.length === 0) {
      unnamedDeviceCount++;
    }

    nextMicrophoneOptions.push({
      id: deviceId,
      label: label || `마이크 ${unnamedDeviceCount}`,
    });
  }

  return {
    nextMicrophoneOptions,
    hasAudioInput,
    needsMicrophoneAccess: hasAudioInput && nextMicrophoneOptions.length === 0,
  };
}

async function enumerateDevicesAfterMicrophoneAccess(mediaDevices: MediaDevices) {
  const stream = await mediaDevices.getUserMedia({audio: true});

  try {
    return await mediaDevices.enumerateDevices();
  } finally {
    for (const track of stream.getTracks()) track.stop();
  }
}

function getSupportedMediaDevices() {
  if (typeof navigator === 'undefined') return null;

  const mediaDevices = navigator.mediaDevices;

  if (!mediaDevices) return null;

  if (typeof mediaDevices.getUserMedia !== 'function' || typeof mediaDevices.enumerateDevices !== 'function') {
    return null;
  }

  return mediaDevices;
}

function reconcileSelectedMicrophone(
  selectedMicrophone: MicrophoneDevice | null,
  microphoneOptions: MicrophoneDevice[],
) {
  if (!selectedMicrophone) return null;

  return microphoneOptions.find(option => option.id === selectedMicrophone.id && option.id.length > 0) ?? null;
}

function isSameMicrophone(left: MicrophoneDevice | null, right: MicrophoneDevice | null) {
  return left?.id === right?.id && left?.label === right?.label;
}

function isEmptyRecordingSession({status, startedAt}: {status: string; startedAt: string | null}) {
  return status === 'idle' && startedAt === null;
}

export function useMicrophoneDevices() {
  const [microphoneOptions, setMicrophoneOptions] = useState<MicrophoneDevice[]>([]);
  const [hasResolvedMicrophoneOptions, setHasResolvedMicrophoneOptions] = useState(false);
  const [needsMicrophoneAccess, setNeedsMicrophoneAccess] = useState(false);

  const {markRecordingError, clearRecordingError, selectedMicrophone, setSelectedMicrophone, startedAt, status} =
    useRecordingStore(
      useShallow(state => ({
        markRecordingError: state.markRecordingError,
        clearRecordingError: state.clearRecordingError,
        selectedMicrophone: state.selectedMicrophone,
        setSelectedMicrophone: state.setSelectedMicrophone,
        startedAt: state.startedAt,
        status: state.status,
      })),
    );

  async function requestMicrophoneAccess() {
    const mediaDevices = getSupportedMediaDevices();

    if (!mediaDevices) {
      markRecordingError('microphone_api_unavailable');
      return;
    }

    try {
      const devices = await enumerateDevicesAfterMicrophoneAccess(mediaDevices);
      applyMicrophoneDeviceSnapshot(createMicrophoneDeviceSnapshot(devices));
      clearRecordingError();
    } catch (error) {
      if (!(error instanceof DOMException)) {
        markRecordingError('microphone_access_failed');
        return;
      }

      switch (error.name) {
        // 사용자가 권한을 거부했거나, 브라우저/사이트 정책으로 마이크 접근이 차단된 경우
        case 'NotAllowedError':
          markRecordingError('microphone_permission_denied');
          return;
        // 사용 가능한 오디오 입력 장치가 없는 경우
        case 'NotFoundError':
          markRecordingError('microphone_not_found');
          return;
        // 장치는 있으나 OS/브라우저/다른 앱 점유/문서 상태 문제로 마이크를 시작하지 못한 경우
        case 'NotReadableError':
        case 'AbortError':
        case 'SecurityError':
        case 'InvalidStateError':
        default:
          markRecordingError('microphone_access_failed');
          return;
      }
    }
  }

  const applyMicrophoneDeviceSnapshot = useCallback((snapshot: MicrophoneDeviceSnapshot) => {
    setMicrophoneOptions(snapshot.nextMicrophoneOptions);
    setHasResolvedMicrophoneOptions(true);
    setNeedsMicrophoneAccess(snapshot.needsMicrophoneAccess);
  }, []);

  const refreshMicrophones = useCallback(async ({exposeRedactedDevices = false} = {}) => {
    const mediaDevices = getSupportedMediaDevices();

    if (!mediaDevices) {
      markRecordingError('microphone_api_unavailable');
      return false;
    }

    try {
      const devices = await mediaDevices.enumerateDevices();
      const snapshot = createMicrophoneDeviceSnapshot(devices);

      if (exposeRedactedDevices && snapshot.needsMicrophoneAccess) {
        const exposedDevices = await enumerateDevicesAfterMicrophoneAccess(mediaDevices);
        applyMicrophoneDeviceSnapshot(createMicrophoneDeviceSnapshot(exposedDevices));

        return true;
      }

      applyMicrophoneDeviceSnapshot(snapshot);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setHasResolvedMicrophoneOptions(true);
        setNeedsMicrophoneAccess(true);
        return true;
      }

      markRecordingError('microphone_access_failed');

      return false;
    }
  }, [applyMicrophoneDeviceSnapshot, markRecordingError]);

  useEffect(() => {
    const mediaDevices = getSupportedMediaDevices();

    if (!mediaDevices) {
      markRecordingError('microphone_api_unavailable');
      return;
    }

    function handleDeviceChange() {
      refreshMicrophones();
    }

    void (async () => {
      await refreshMicrophones({exposeRedactedDevices: true});
    })();
    mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [markRecordingError, refreshMicrophones]);

  useEffect(() => {
    if (!hasResolvedMicrophoneOptions) return;

    if (selectedMicrophone) {
      const reconciledMicrophone = reconcileSelectedMicrophone(selectedMicrophone, microphoneOptions);

      if (!reconciledMicrophone && !needsMicrophoneAccess) {
        setSelectedMicrophone(null);
        return;
      }

      if (reconciledMicrophone && !isSameMicrophone(selectedMicrophone, reconciledMicrophone)) {
        setSelectedMicrophone(reconciledMicrophone);
      }

      return;
    }

    if (microphoneOptions.length === 0) return;
    if (!isEmptyRecordingSession({status, startedAt})) return;

    const preferredMicrophone = readPreferredMicrophone();
    const restoredMicrophone = preferredMicrophone
      ? microphoneOptions.find(option => option.id === preferredMicrophone.id)
      : null;

    if (restoredMicrophone) {
      setSelectedMicrophone(restoredMicrophone);
    }
  }, [
    hasResolvedMicrophoneOptions,
    microphoneOptions,
    needsMicrophoneAccess,
    selectedMicrophone,
    setSelectedMicrophone,
    startedAt,
    status,
  ]);

  return {
    microphoneOptions,
    needsMicrophoneAccess,
    requestMicrophoneAccess,
  };
}

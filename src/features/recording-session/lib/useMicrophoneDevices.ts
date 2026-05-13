'use client';

import {useCallback, useEffect, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {MicrophoneDevice, useRecordingStore} from '@/entities/speech-to-text/client';

export function useMicrophoneDevices() {
  const [microphoneOptions, setMicrophoneOptions] = useState<MicrophoneDevice[]>([]);
  const [needsMicrophoneAccess, setNeedsMicrophoneAccess] = useState(false);

  const {markRecordingError, clearRecordingError, setSelectedMicrophone} = useRecordingStore(
    useShallow(state => ({
      markRecordingError: state.markRecordingError,
      clearRecordingError: state.clearRecordingError,
      setSelectedMicrophone: state.setSelectedMicrophone,
    })),
  );

  function getSupportedMediaDevices() {
    if (typeof navigator === 'undefined') return null;

    const mediaDevices = navigator.mediaDevices;

    if (!mediaDevices) return null;

    if (typeof mediaDevices.getUserMedia !== 'function' || typeof mediaDevices.enumerateDevices !== 'function') {
      return null;
    }

    return mediaDevices;
  }

  async function requestMicrophoneAccess() {
    const mediaDevices = getSupportedMediaDevices();

    if (!mediaDevices) {
      markRecordingError('microphone_api_unavailable');
      return;
    }

    try {
      const stream = await mediaDevices.getUserMedia({audio: true});

      for (const track of stream.getTracks()) track.stop();

      const refreshed = await refreshMicrophones();
      if (refreshed) clearRecordingError();
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

  function createMicrophoneDeviceSnapshot(devices: MediaDeviceInfo[]) {
    let unnamedDeviceCount = 0;
    let hasAudioInput = false;
    let hasResolvedDeviceLabel = false;

    const nextMicrophoneOptions: MicrophoneDevice[] = [];

    for (const device of devices) {
      if (device.kind !== 'audioinput') continue;

      hasAudioInput = true;

      const deviceId = device.deviceId.trim();
      const label = device.label.trim();

      if (label.length > 0) {
        hasResolvedDeviceLabel = true;
      }

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
      needsMicrophoneAccess: hasAudioInput && !hasResolvedDeviceLabel,
    };
  }

  function reconcileSelectedMicrophone(
    selectedMicrophone: MicrophoneDevice | null,
    microphoneOptions: MicrophoneDevice[],
  ) {
    if (!selectedMicrophone) return null;

    return microphoneOptions.find(option => option.id === selectedMicrophone.id && option.id.length > 0) ?? null;
  }

  const refreshMicrophones = useCallback(async () => {
    const mediaDevices = getSupportedMediaDevices();

    if (!mediaDevices) {
      markRecordingError('microphone_api_unavailable');
      return false;
    }

    try {
      const devices = await mediaDevices.enumerateDevices();

      const {nextMicrophoneOptions, needsMicrophoneAccess} = createMicrophoneDeviceSnapshot(devices);

      setMicrophoneOptions(nextMicrophoneOptions);

      const selectedMicrophone = useRecordingStore.getState().selectedMicrophone;
      setSelectedMicrophone(reconcileSelectedMicrophone(selectedMicrophone, nextMicrophoneOptions));
      setNeedsMicrophoneAccess(needsMicrophoneAccess);

      return true;
    } catch {
      markRecordingError('microphone_access_failed');

      return false;
    }
  }, [markRecordingError, setSelectedMicrophone]);

  useEffect(() => {
    const mediaDevices = getSupportedMediaDevices();

    if (!mediaDevices) {
      markRecordingError('microphone_api_unavailable');
      return;
    }

    function handleDeviceChange() {
      refreshMicrophones();
    }

    refreshMicrophones();
    mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [markRecordingError, refreshMicrophones]);

  return {
    microphoneOptions,
    needsMicrophoneAccess,
    requestMicrophoneAccess,
  };
}

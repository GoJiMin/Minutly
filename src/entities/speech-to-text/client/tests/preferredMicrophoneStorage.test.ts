import {
  readPreferredMicrophone,
  removePreferredMicrophone,
  savePreferredMicrophone,
} from '../preferredMicrophoneStorage';
import {localStorageClient} from '@/shared/utils';

describe('@/src/entities/speech-to-text/client/preferredMicrophoneStorage.ts', () => {
  const STORAGE_KEY = 'preferred-microphone:v1';

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('마지막으로 선택한 마이크를 저장하고 읽는다.', () => {
    const microphone = {id: 'mic-1', label: 'iPhone 마이크'};

    savePreferredMicrophone(microphone);

    expect(readPreferredMicrophone()).toEqual(microphone);
  });

  it('저장된 마이크 선택을 제거한다.', () => {
    savePreferredMicrophone({id: 'mic-1', label: 'iPhone 마이크'});

    removePreferredMicrophone();

    expect(readPreferredMicrophone()).toBeNull();
  });

  it('잘못된 저장값이면 값을 제거하고 null을 반환한다.', () => {
    localStorageClient.write(STORAGE_KEY, {id: '', label: '잘못된 마이크'});

    expect(readPreferredMicrophone()).toBeNull();
    expect(localStorageClient.read(STORAGE_KEY)).toBeNull();
  });
});

import {localStorageClient} from '../local-storage';

describe('@/src/shared/utils/local-storage.client.ts', () => {
  const TEST_STORAGE_KEY = 'test';

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('스토리지 내부에 값을 저장하고, 저장한 값을 조회할 수 있다.', () => {
    const value = {
      title: '5월 3일 회의',
      transcript: '배부르다.',
    };

    localStorageClient.write(TEST_STORAGE_KEY, value);

    expect(localStorageClient.read(TEST_STORAGE_KEY)).toStrictEqual(value);
  });

  it('스토리지에 저장한 값을 삭제할 수 있다.', () => {
    const value = {
      title: '5월 3일 회의',
      transcript: '배부르다.',
    };

    localStorageClient.write(TEST_STORAGE_KEY, value);
    localStorageClient.remove(TEST_STORAGE_KEY);

    expect(localStorageClient.read(TEST_STORAGE_KEY)).toBeNull();
  });

  it('존재하지 않는 값을 조회하면 null을 반환한다.', () => {
    expect(localStorageClient.read('unknown')).toBeNull();
  });
});

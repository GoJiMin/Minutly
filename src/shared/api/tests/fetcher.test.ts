import {RequestError, RequestGetError} from '../error';
import {fetchGet, fetchPost} from '../fetcher';

describe('@/src/shared/api/fetcher.ts', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  describe('정상 케이스', () => {
    it('GET 요청 래퍼는 JSON 응답을 반환한다.', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));

      await expect(fetchGet<{ok: boolean}>({endpoint: '/api/test'})).resolves.toEqual({
        ok: true,
      });
    });

    it('전달한 쿼리 파라미터를 요청 URL에 쿼리 스트링으로 삽입할 수 있다.', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));

      await fetchGet({
        endpoint: '/api/test',
        queryParams: {
          key1: 'value1',
          key2: 'value2',
        },
        withResponse: false,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test?key1=value1&key2=value2',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        }),
      );
    });

    it('전달한 요청 본문을 JSON 형태로 직렬화하고 요청 헤더를 설정한다.', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));

      const originBody = {key: 'value'};

      await fetchPost({
        endpoint: '/api/test',
        body: originBody,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(originBody),
        }),
      );
    });
  });

  describe('예외 케이스', () => {
    it('GET 요청 응답 본문이 비어있을 경우 에러를 전파한다.', async () => {
      fetchMock.mockResolvedValue(new Response(null, {status: 204}));

      await expect(fetchGet({endpoint: '/api/test'})).rejects.toThrow('서버 응답 본문이 비어 있어요.');
    });

    it('서버 응답을 해석하지 못할 경우 에러를 전파한다.', async () => {
      fetchMock.mockResolvedValue(new Response('not json', {status: 200}));

      await expect(fetchGet({endpoint: '/api/test'})).rejects.toThrow('서버 응답을 JSON으로 해석할 수 없어요.');
    });

    it('읽기 요청이 실패한 경우 읽기 요청 실패 에러를 전파한다.', async () => {
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({
            title: 'TEST_ERROR',
            detail: '테스트 에러',
            status: 500,
          }),
          {status: 500},
        ),
      );

      const promise = fetchGet({endpoint: '/api/test', errorHandlingType: 'toast'});

      await expect(promise).rejects.toBeInstanceOf(RequestGetError);
      await expect(promise).rejects.toMatchObject({
        name: 'TEST_ERROR',
        endpoint: '/api/test',
        errorHandlingType: 'toast',
      });
    });

    it('쓰기 요청이 실패한 경우 요청 실패 에러를 전파한다.', async () => {
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({
            title: 'TEST_ERROR',
            detail: '테스트 에러',
            status: 500,
          }),
          {status: 500},
        ),
      );

      const promise = fetchPost({endpoint: '/api/test'});

      await expect(promise).rejects.toBeInstanceOf(RequestError);
      await expect(promise).rejects.not.toBeInstanceOf(RequestGetError);
      await expect(promise).rejects.toMatchObject({
        name: 'TEST_ERROR',
        endpoint: '/api/test',
      });
    });

    it('토큰 만료 에러가 반환되면 재발행 요청 후 기존 요청을 다시 수행한다.', async () => {
      fetchMock
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              title: 'TOKEN_EXPIRED',
              detail: '토큰 만료',
              status: 401,
            }),
            {status: 401},
          ),
        )
        .mockResolvedValueOnce(new Response(null, {status: 204}))
        .mockResolvedValueOnce(new Response(JSON.stringify({ok: true}), {status: 200}));

      await expect(fetchGet({endpoint: '/api/test'})).resolves.toEqual({ok: true});

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        }),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        }),
      );
    });

    it('토큰 만료 에러가 반환된 후 재발행 요청이 실패하면 기존 읽기 요청 기준으로 재발행 실패 에러를 반환한다.', async () => {
      fetchMock
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              title: 'TOKEN_EXPIRED',
              detail: '토큰 만료',
              status: 401,
            }),
            {status: 401},
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              title: 'AUTH_REFRESH_FAILED',
              detail: '재발행 실패',
              status: 401,
            }),
            {status: 401},
          ),
        );

      const promise = fetchGet({endpoint: '/api/test', errorHandlingType: 'toast'});

      await expect(promise).rejects.toBeInstanceOf(RequestGetError);
      await expect(promise).rejects.toMatchObject({
        name: 'AUTH_REFRESH_FAILED',
        endpoint: '/api/test',
        method: 'GET',
        errorHandlingType: 'toast',
      });
    });
  });
});

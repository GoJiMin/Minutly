import {createRequestError, parseErrorResponse, RequestError, RequestGetError} from '../error';
import {RequestContext} from '../types';

describe('@/src/shared/api/error.ts', () => {
  describe('parseErrorResponse', () => {
    const errorResponse = {
      title: 'TEST_ERROR',
      detail: '테스트 에러',
      status: 400,
    };

    it('서버가 정상적인 에러를 응답한 경우 서버 에러 정보를 반환한다.', async () => {
      const response = new Response(JSON.stringify(errorResponse));

      expect(await parseErrorResponse(response)).toStrictEqual(errorResponse);
    });

    it('서버가 올바르지 않은 에러를 응답한 경우 기본 에러 정보를 반환한다.', async () => {
      const response = new Response(
        JSON.stringify({
          name: 'UNKNOWN_ERROR',
          message: '알 수 없는 에러',
        }),
        {
          status: 500,
        },
      );

      expect(await parseErrorResponse(response)).toStrictEqual({
        title: 'UNEXPECTED_ERROR_RESPONSE',
        detail: '서버 에러 응답 형식이 올바르지 않아요. 잠시 후 다시 시도해주세요.',
        status: 500,
      });
    });

    it('응답 본문 해석에 실패할 경우 기본 에러 정보를 반환한다.', async () => {
      const response = new Response('not json', {
        status: 502,
      });

      expect(await parseErrorResponse(response)).toStrictEqual({
        title: 'UNEXPECTED_ERROR_RESPONSE',
        detail: '서버 에러 응답 형식이 올바르지 않아요. 잠시 후 다시 시도해주세요.',
        status: 502,
      });
    });
  });
  describe('createRequestError', () => {
    const errorResponse = {
      title: 'TEST_ERROR',
      detail: '테스트 에러',
      status: 400,
    };

    const context: RequestContext = {
      endpoint: '/api/test',
      method: 'POST',
      requestBody: {foo: 'bar'},
    };

    it('전달한 에러 및 요청 정보를 포함한 에러 객체가 생성된다.', () => {
      const requestError = createRequestError({
        errorResponse,
        context,
      });

      expect(requestError.name).toEqual(errorResponse.title);
      expect(requestError.message).toEqual(errorResponse.detail);
      expect(requestError.status).toEqual(errorResponse.status);
      expect(requestError.requestBody).toStrictEqual(context.requestBody);
      expect(requestError.method).toEqual(context.method);
      expect(requestError.endpoint).toEqual(context.endpoint);
    });

    it('읽기 요청일 경우 RequestGetError 객체가 생성된다.', () => {
      const requestGetError = createRequestError({
        errorResponse,
        context: {
          ...context,
          method: 'GET',
          errorHandlingType: 'errorBoundary',
        },
      });

      expect(requestGetError).toBeInstanceOf(RequestGetError);
      expect(requestGetError).toMatchObject({
        errorHandlingType: 'errorBoundary',
      });
    });

    it('쓰기 요청일 경우 RequestError 객체가 생성된다.', () => {
      const requestError = createRequestError({
        errorResponse,
        context,
      });

      expect(requestError).toBeInstanceOf(RequestError);
      expect(requestError).not.toBeInstanceOf(RequestGetError);
    });
  });
});

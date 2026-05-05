/**
 * @jest-environment node
 */

import {NextRequest} from 'next/server';
import {validateQueryParams, validateRequestBody, validateRouteParams} from '../validation';
import z from 'zod';

describe('@/src/shared/server/validation.ts', () => {
  const errorMapper = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('validateRequestBody', () => {
    const schema = z.object({id: z.string()});

    it('요청 본문을 해석 및 검증할 수 있으면 검증한 본문을 반환한다.', async () => {
      const originBody = {id: 'test'};
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify(originBody),
      });

      const result = await validateRequestBody(request, schema, errorMapper);

      expect(result).toStrictEqual({
        ok: true,
        value: originBody,
      });
      expect(errorMapper).not.toHaveBeenCalled();
    });

    it('요청 본문을 해석하지 못할 경우 에러 매핑 함수 호출 없이 실패 결과를 반환한다.', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: 'not json',
      });

      const result = await validateRequestBody(request, schema, errorMapper);

      if (result.ok) {
        throw new Error('Expected JSON parse failure');
      }

      expect(result.error.status).toBe(400);
      await expect(result.error.json()).resolves.toEqual({
        title: 'INVALID_REQUEST',
        detail: '요청 형식이 올바르지 않습니다.',
        status: 400,
      });
      expect(errorMapper).not.toHaveBeenCalled();
    });

    it('요청 본문 검증에 실패하면 에러 매핑 함수를 호출해 실패 응답 결과를 반환한다.', async () => {
      const mappedError = {
        title: 'TEST_BODY_INVALID',
        detail: '테스트 요청 본문이 올바르지 않아요.',
        status: 400,
      };

      errorMapper.mockReturnValue(mappedError);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({id: 5}),
      });

      const result = await validateRequestBody(request, schema, errorMapper);

      if (result.ok) {
        throw new Error('Expected validation failure');
      }

      expect(errorMapper).toHaveBeenCalledTimes(1);
      expect(errorMapper).toHaveBeenCalledWith(expect.any(z.ZodError));

      expect(result.error.status).toBe(mappedError.status);
      await expect(result.error.json()).resolves.toEqual(mappedError);
    });
  });

  describe('validateQueryParams', () => {
    it('전달한 URLSearchParams를 객체 형태로 바꿔 검증하고, 성공 시 객체를 반환한다.', () => {
      const schema = z.object({
        year: z.coerce.number(),
        month: z.coerce.number(),
        date: z.coerce.number(),
      });

      const result = validateQueryParams(new URLSearchParams('year=2026&month=5&date=2'), schema, errorMapper);

      expect(result).toStrictEqual({
        ok: true,
        value: {year: 2026, month: 5, date: 2},
      });
    });
  });

  describe('validateRouteParams', () => {
    it('전달한 라우트 파라미터를 검증하고, 성공 시 객체를 반환한다.', () => {
      const schema = z.object({id: z.string(), name: z.string()});
      const routeParams = {id: 'test', name: 'jimin'};

      const result = validateRouteParams(routeParams, schema, errorMapper);

      expect(result).toStrictEqual({
        ok: true,
        value: routeParams,
      });
    });
  });
});

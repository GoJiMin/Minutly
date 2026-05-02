/**
 * @jest-environment node
 */

import {createErrorJsonResponse} from '../response';

describe('@/src/shared/server/response.ts', () => {
  it('에러 정보를 정상적으로 전달하면 응답 객체로 변환해 반환한다.', async () => {
    const response = createErrorJsonResponse({
      title: 'TEST_ERROR',
      detail: '테스트 에러',
      status: 400,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      title: 'TEST_ERROR',
      detail: '테스트 에러',
      status: 400,
    });
  });
});

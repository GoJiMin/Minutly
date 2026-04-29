import z from 'zod';

export const errorResponseSchema = z.object({
  title: z.string(),
  detail: z.string(),
  status: z.number().int().min(100).max(599),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return errorResponseSchema.safeParse(value).success;
}

export async function parseErrorResponse(response: Response): Promise<ErrorResponse> {
  try {
    const body: unknown = await response.json();
    const result = errorResponseSchema.safeParse(body);

    if (result.success) {
      return result.data;
    }
  } catch {
    // Invalid or empty JSON falls through to the fallback error response.
  }

  return {
    title: 'UNEXPECTED_ERROR_RESPONSE',
    detail: '서버 에러 응답 형식이 올바르지 않아요. 잠시 후 다시 시도해주세요.',
    status: response.status || 500,
  };
}

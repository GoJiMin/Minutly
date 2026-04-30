import z from 'zod';
import {ErrorHandlingType, RequestBody, RequestMethod, WithErrorHandling} from './types';

export const errorResponseSchema = z.object({
  title: z.string(),
  detail: z.string(),
  status: z.number().int().min(100).max(599),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

type RequestErrorProps = {
  name: string;
  message: string;
  status: number;
  endpoint: string;
  method?: RequestMethod;
  requestBody: RequestBody;
};

type CreateRequestErrorProps = {
  errorResponse: ErrorResponse;
  context: {
    endpoint: string;
    method: RequestMethod;
    requestBody: RequestBody;
    errorHandlingType?: ErrorHandlingType;
  };
};

export class RequestError extends Error {
  requestBody: RequestBody;
  status: number;
  endpoint: string;
  method?: RequestMethod;

  constructor({name, message, status, endpoint, method, requestBody}: RequestErrorProps) {
    super(message);

    this.name = name;
    this.status = status;
    this.endpoint = endpoint;
    this.method = method;
    this.requestBody = requestBody;
  }
}

export class RequestGetError extends RequestError {
  errorHandlingType: ErrorHandlingType;

  constructor({errorHandlingType = 'errorBoundary', ...rest}: WithErrorHandling<RequestErrorProps>) {
    super(rest);

    this.errorHandlingType = errorHandlingType;
  }
}

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

export function createRequestError({errorResponse, context}: CreateRequestErrorProps) {
  const {title, detail, status} = errorResponse;
  const {endpoint, method, requestBody, errorHandlingType} = context;

  if (method === 'GET') {
    return new RequestGetError({
      name: title,
      message: detail,
      status,
      requestBody,
      endpoint,
      method,
      errorHandlingType,
    });
  }

  return new RequestError({
    name: title,
    message: detail,
    status,
    method,
    endpoint,
    requestBody,
  });
}

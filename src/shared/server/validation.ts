import 'server-only';

import {NextRequest, NextResponse} from 'next/server';
import z from 'zod';
import {createErrorJsonResponse} from './response';
import {ErrorResponse} from '../api';

type ValidationResult<T> = {ok: true; value: T} | {ok: false; error: NextResponse<ErrorResponse>};
type ValidationErrorMapper = (error: z.ZodError) => ErrorResponse;

function validateSchema<TSchema extends z.ZodType>(
  value: unknown,
  schema: TSchema,
  getValidationError: ValidationErrorMapper,
): ValidationResult<z.infer<TSchema>> {
  const result = schema.safeParse(value);

  if (result.success) {
    return {
      ok: true,
      value: result.data,
    };
  }

  return {
    ok: false,
    error: createErrorJsonResponse(getValidationError(result.error)),
  };
}

export async function validateRequestBody<TSchema extends z.ZodType>(
  request: NextRequest,
  schema: TSchema,
  getValidationError: ValidationErrorMapper,
): Promise<ValidationResult<z.infer<TSchema>>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      error: createErrorJsonResponse({
        title: 'INVALID_REQUEST',
        detail: '요청 형식이 올바르지 않습니다.',
        status: 400,
      }),
    };
  }

  return validateSchema(body, schema, getValidationError);
}

export function validateQueryParams<TSchema extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: TSchema,
  getValidationError: ValidationErrorMapper,
): ValidationResult<z.infer<TSchema>> {
  const query = Object.fromEntries(searchParams.entries());

  return validateSchema(query, schema, getValidationError);
}

export function validateRouteParams<TSchema extends z.ZodType>(
  params: unknown,
  schema: TSchema,
  getValidationError: ValidationErrorMapper,
): ValidationResult<z.infer<TSchema>> {
  return validateSchema(params, schema, getValidationError);
}

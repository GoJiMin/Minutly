import 'server-only';

import {NextResponse} from 'next/server';
import {ErrorResponse, errorResponseSchema} from '../api';

export function createErrorJsonResponse(input: ErrorResponse) {
  const errorResponse = errorResponseSchema.parse(input);

  return NextResponse.json(errorResponse, {
    status: errorResponse.status,
  });
}

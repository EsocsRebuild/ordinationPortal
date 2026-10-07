import { NextResponse } from 'next/server';
import { StandardApiResponse } from './types';
import crypto from 'crypto';

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: any
): NextResponse {
  const payload: StandardApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: `req_${crypto.randomBytes(6).toString('hex')}`,
      version: '2026.1.0',
      ...meta,
    },
  };
  return NextResponse.json(payload, { status: statusCode });
}

export function createErrorResponse(
  message: string,
  errors: string[] = [],
  statusCode: number = 400
): NextResponse {
  const payload: StandardApiResponse = {
    success: false,
    message,
    errors: errors.length > 0 ? errors : [message],
    meta: {
      timestamp: new Date().toISOString(),
      requestId: `err_${crypto.randomBytes(6).toString('hex')}`,
      version: '2026.1.0',
    },
  };
  return NextResponse.json(payload, { status: statusCode });
}


import {NextResponse} from 'next/server';
import type {SpeechTokenResponse} from '@/entities/speech-to-text/server';
import {issueAzureSpeechToken} from '@/entities/speech-to-text/server';
import {requireAuth} from '@/shared/server/auth';
import {createErrorJsonResponse} from '@/shared/server';
import type {ErrorResponse} from '@/shared/api';

export async function POST(): Promise<NextResponse<SpeechTokenResponse | ErrorResponse>> {
  const requireAuthResult = await requireAuth();

  if (!requireAuthResult.ok) {
    return requireAuthResult.error;
  }

  const result = await issueAzureSpeechToken();

  if (!result.ok) {
    return createErrorJsonResponse({
      title: 'SPEECH_TOKEN_FAILED',
      detail: '음성 인식 토큰 발급에 실패했습니다.',
      status: 500,
    });
  }

  const {token, region, phrases} = result.value;

  return NextResponse.json(
    {
      token,
      region,
      phrases,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

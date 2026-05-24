import 'server-only';

import {SpeechTokenResponse} from '../model/types';
import {azureConfig} from '@/shared/server/env';

type IssueAzureSpeechTokenResult = Promise<{ok: true; value: SpeechTokenResponse} | {ok: false}>;

export async function issueAzureSpeechToken(): IssueAzureSpeechTokenResult {
  try {
    const tokenEndpoint = `https://${azureConfig.region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureConfig.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[azure-speech] token issue failed', {
        status: response.status,
        statusText: response.statusText,
      });

      return {ok: false};
    }

    const token = (await response.text()).trim();

    if (token.length === 0) {
      console.error('[azure-speech] token issue returned empty token');

      return {ok: false};
    }

    return {ok: true, value: {token, region: azureConfig.region}};
  } catch (error) {
    console.error('[azure-speech] token issue request failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return {ok: false};
  }
}

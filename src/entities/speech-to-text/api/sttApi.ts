import {SpeechTokenResponse} from '../model/types';
import {fetchPost} from '@/shared/api';

export async function fetchAzureSpeechToken() {
  return await fetchPost<SpeechTokenResponse>({
    endpoint: '/api/speech/token',
    withResponse: true,
  });
}

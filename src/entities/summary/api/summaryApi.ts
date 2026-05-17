import {CreateSummaryRequest, CreateSummaryResponse} from '../model/schema';
import {fetchPost} from '@/shared/api';

export async function fetchTranscriptSummary(data: CreateSummaryRequest) {
  return await fetchPost<CreateSummaryResponse>({
    endpoint: '/api/summary',
    withResponse: true,
    body: data,
  });
}

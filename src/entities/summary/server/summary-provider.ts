import 'server-only';

import type {CreateSummaryRequest, CreateSummaryResponse} from '../model/schema';

export type CreateSummaryResult = {ok: true; value: CreateSummaryResponse} | {ok: false};

export interface SummaryProvider {
  createSummary(input: CreateSummaryRequest): Promise<CreateSummaryResult>;
}

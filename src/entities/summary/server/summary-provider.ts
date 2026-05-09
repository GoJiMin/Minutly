import type {CreateSummaryRequest} from '../model/schema';
import type {CreateSummaryResponse} from '../model/types';

export type CreateSummaryResult = {ok: true; value: CreateSummaryResponse} | {ok: false};

export interface SummaryProvider {
  createSummary(input: CreateSummaryRequest): Promise<CreateSummaryResult>;
}

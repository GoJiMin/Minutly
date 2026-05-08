import {CreateSummaryRequest} from '../model/schema';
import {CreateSummaryResponse} from '../model/types';

export interface SummaryProvider {
  createSummary(input: CreateSummaryRequest): Promise<CreateSummaryResponse>;
}

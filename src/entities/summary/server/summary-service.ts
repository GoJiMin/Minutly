import 'server-only';

import type {CreateSummaryResult, SummaryProvider} from './summary-provider';
import type {CreateSummaryRequest} from '../model/schema';

export class SummaryService {
  private readonly summaryProvider: SummaryProvider;

  constructor(summaryProvider: SummaryProvider) {
    this.summaryProvider = summaryProvider;
  }

  createSummary(input: CreateSummaryRequest): Promise<CreateSummaryResult> {
    return this.summaryProvider.createSummary(input);
  }
}

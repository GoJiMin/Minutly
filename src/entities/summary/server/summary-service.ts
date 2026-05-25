import 'server-only';

import type {CreateSummaryRequest, CreateSummaryResponse} from '../model/schema';
import {GeminiSummaryProvider} from './gemini-summary-provider';

export type CreateSummaryResult = {ok: true; value: CreateSummaryResponse} | {ok: false};

export interface SummaryProviderAdapter {
  createSummary(input: CreateSummaryRequest): Promise<CreateSummaryResult>;
}

class SummaryService implements SummaryProviderAdapter {
  private readonly summaryProvider: SummaryProviderAdapter;

  constructor(summaryProvider: SummaryProviderAdapter) {
    this.summaryProvider = summaryProvider;
  }

  createSummary(input: CreateSummaryRequest): Promise<CreateSummaryResult> {
    return this.summaryProvider.createSummary(input);
  }
}

export function getSummaryService(): SummaryProviderAdapter {
  return new SummaryService(new GeminiSummaryProvider());
}

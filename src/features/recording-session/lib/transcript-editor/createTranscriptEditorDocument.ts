import {TranscriptInterruptionRange} from './types';
import {TranscriptChunk} from '@/entities/speech-to-text/client';

export function createTranscriptEditorDocument(chunks: TranscriptChunk[]) {
  let doc = '';
  const interruptions: TranscriptInterruptionRange[] = [];

  chunks.forEach((chunk, index) => {
    if (index > 0) doc += '\n\n';

    const from = doc.length;
    doc += chunk.text;
    const to = doc.length;

    if (chunk.kind === 'interruption') {
      interruptions.push({id: chunk.id, order: interruptions.length + 1, from, to, reviewed: false});
    }
  });

  return {doc, interruptions};
}

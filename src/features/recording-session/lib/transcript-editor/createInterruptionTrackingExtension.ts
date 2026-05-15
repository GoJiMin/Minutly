import {EditorState, type Extension, type Range, StateEffect, StateField, type Transaction} from '@codemirror/state';
import {Decoration, type DecorationSet, EditorView} from '@codemirror/view';
import type {TranscriptInterruptionRange} from './types';

export type InterruptionTrackingExtension = {
  extension: Extension;
  getRanges: (state: EditorState) => TranscriptInterruptionRange[];
  createReviewEffect: (interruptionId: string) => StateEffect<string>;
};

export function createInterruptionTrackingExtension(interruptions: TranscriptInterruptionRange[]) {
  const rangesField = createInterruptionRangesField(interruptions);

  function getRanges(state: EditorState) {
    return state.field(rangesField);
  }

  function createReviewEffect(interruptionId: string) {
    return reviewInterruptionEffect.of(interruptionId);
  }

  return {
    extension: rangesField,
    getRanges,
    createReviewEffect,
  };
}

const reviewInterruptionEffect = StateEffect.define<string>();

function moveRangesThroughDocumentChange(ranges: TranscriptInterruptionRange[], transaction: Transaction) {
  if (!transaction.docChanged) return ranges;

  return ranges.map(range => ({
    ...range,
    from: transaction.changes.mapPos(range.from, 1),
    to: transaction.changes.mapPos(range.to, -1),
  }));
}

function applyReviewEffects(ranges: TranscriptInterruptionRange[], transaction: Transaction) {
  let nextRanges = ranges;

  for (const effect of transaction.effects) {
    if (!effect.is(reviewInterruptionEffect)) continue;

    nextRanges = nextRanges.map(range => (range.id === effect.value ? {...range, reviewed: true} : range));
  }

  return nextRanges;
}

function getInterruptionLineClassName(reviewed: boolean) {
  return reviewed ? 'cm-interruption-line cm-interruption-line-reviewed' : 'cm-interruption-line';
}

function getInterruptionTextClassName(reviewed: boolean) {
  return reviewed ? 'cm-interruption-text cm-interruption-text-reviewed' : 'cm-interruption-text';
}

function createInterruptionDecorationSet(
  state: EditorState,
  interruptions: TranscriptInterruptionRange[],
): DecorationSet {
  const decorations: Range<Decoration>[] = [];

  for (const interruption of interruptions) {
    const from = Math.min(interruption.from, state.doc.length);
    const to = Math.max(from, Math.min(interruption.to, state.doc.length));
    const lineStart = state.doc.lineAt(from).from;

    const lineDecoration = Decoration.line({
      class: getInterruptionLineClassName(interruption.reviewed),
    }).range(lineStart);

    decorations.push(lineDecoration);

    if (from === to) continue;

    const textDecoration = Decoration.mark({
      class: getInterruptionTextClassName(interruption.reviewed),
    }).range(from, to);

    decorations.push(textDecoration);
  }

  return Decoration.set(decorations, true);
}

function createInterruptionRangesField(interruptions: TranscriptInterruptionRange[]) {
  return StateField.define<TranscriptInterruptionRange[]>({
    create() {
      return interruptions;
    },

    update(ranges, transaction) {
      const movedRanges = moveRangesThroughDocumentChange(ranges, transaction);

      return applyReviewEffects(movedRanges, transaction);
    },

    provide(field) {
      return EditorView.decorations.compute([field], state =>
        createInterruptionDecorationSet(state, state.field(field)),
      );
    },
  });
}

import {useEffect, useRef} from 'react';
import {drawSelection, EditorView, keymap} from '@codemirror/view';
import {Compartment, EditorSelection, EditorState} from '@codemirror/state';
import {defaultKeymap, history, historyKeymap} from '@codemirror/commands';
import {TranscriptInterruptionRange} from './types';
import {
  createInterruptionTrackingExtension,
  InterruptionTrackingExtension,
} from './createInterruptionTrackingExtension';
import {transcriptEditorTheme} from './transcriptEditorTheme';
import {createEditorLockExtension, EditorLockExtension} from './createEditorLockExtension';

type Props = {
  doc: string;
  interruptions: TranscriptInterruptionRange[];
  readOnly: boolean;
};

export function useTranscriptEditor({doc, interruptions, readOnly}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const trackingRef = useRef<InterruptionTrackingExtension | null>(null);
  const lockRef = useRef<EditorLockExtension | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tracking = createInterruptionTrackingExtension(interruptions);
    const lock = createEditorLockExtension();

    trackingRef.current = tracking;
    lockRef.current = lock;

    const view = new EditorView({
      parent: container,
      state: EditorState.create({
        doc,
        extensions: [
          history(),
          drawSelection(),
          EditorView.lineWrapping,
          keymap.of([...defaultKeymap, ...historyKeymap]),
          tracking.extension,
          lock.extension,
          transcriptEditorTheme,
        ],
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
      trackingRef.current = null;
      lockRef.current = null;
    };
  }, [doc, interruptions]);

  useEffect(() => {
    const view = viewRef.current;
    const lock = lockRef.current;
    if (!view || !lock) return;

    view.dispatch({
      effects: lock.createLockEffect(readOnly),
    });
  }, [readOnly]);

  function moveToInterruption(interruptionId: string) {
    const view = viewRef.current;
    const tracking = trackingRef.current;
    if (!view || !tracking) return;

    const interruption = tracking.getRanges(view.state).find(range => range.id === interruptionId);
    if (!interruption) return;

    const selection = EditorSelection.range(interruption.from, interruption.to);

    view.dispatch({
      selection: EditorSelection.create([selection]),
      effects: EditorView.scrollIntoView(selection, {y: 'center'}),
    });
    view.focus();
  }

  function markInterruptionReviewed(interruptionId: string) {
    const view = viewRef.current;
    const tracking = trackingRef.current;
    if (!view || !tracking) return;

    view.dispatch({
      effects: tracking.createReviewEffect(interruptionId),
    });
  }

  function getTranscript() {
    const view = viewRef.current;
    if (!view) return doc;

    const transcript = view.state.doc.toString();

    return transcript;
  }

  return {
    containerRef,
    getTranscript,
    moveToInterruption,
    markInterruptionReviewed,
  };
}

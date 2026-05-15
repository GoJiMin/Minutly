import {EditorView} from '@codemirror/view';

export const transcriptEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '17px',
  },
  '.cm-scroller': {
    height: '100%',
    overflow: 'auto',
    fontFamily: 'inherit',
  },
  '.cm-content': {
    minHeight: '100%',
    padding: '12px',
    lineHeight: '1.7',
  },
  '.cm-focused': {
    outline: 'none',
  },
  '.cm-interruption-line': {
    backgroundColor: 'color-mix(in oklab, var(--warning, #f59e0b) 12%, transparent)',
    borderLeft: '3px solid #f59e0b',
  },
  '.cm-interruption-text': {
    color: '#92400e',
    fontWeight: '600',
  },
  '.cm-interruption-line-reviewed': {
    backgroundColor: 'color-mix(in oklab, var(--muted) 72%, transparent)',
    borderLeftColor: 'color-mix(in oklab, var(--muted-foreground) 42%, transparent)',
  },
  '.cm-interruption-text-reviewed': {
    color: 'var(--muted-foreground)',
  },
});

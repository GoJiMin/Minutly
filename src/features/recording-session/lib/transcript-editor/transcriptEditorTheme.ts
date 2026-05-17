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
    backgroundColor: 'color-mix(in oklab, oklch(0.68 0.13 232) 14%, transparent)',
    boxShadow: 'inset 3px 0 0 oklch(0.62 0.15 232)',
    paddingBlock: '4px',
  },
  '.cm-interruption-text': {
    color: 'oklch(0.34 0.1 232)',
    fontWeight: '500',
  },
  '.cm-interruption-line-reviewed': {
    backgroundColor: 'transparent',
    boxShadow: 'inset 3px 0 0 color-mix(in oklab, oklch(0.62 0.15 232) 26%, transparent)',
  },
});

import {EditorView} from '@codemirror/view';

export const transcriptEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
  },
  '.cm-scroller': {
    height: '100%',
    overflow: 'auto',
    fontFamily: 'inherit',
  },
  '.cm-content': {
    minHeight: '100%',
    padding: '10px',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  '.cm-focused': {
    outline: 'none',
  },
  '.cm-interruption-line': {
    backgroundColor: 'color-mix(in oklab, oklch(0.68 0.13 232) 14%, transparent)',
    boxShadow: 'inset 2px 0 0 oklch(0.62 0.15 232)',
    paddingBlock: '3px',
  },
  '.cm-interruption-text': {
    color: 'oklch(0.34 0.1 232)',
    fontWeight: '500',
  },
  '.cm-interruption-line-reviewed': {
    backgroundColor: 'transparent',
    boxShadow: 'inset 2px 0 0 color-mix(in oklab, oklch(0.62 0.15 232) 26%, transparent)',
  },
  '@media (min-width: 768px)': {
    '.cm-content': {
      padding: '12px',
      fontSize: '17px',
      lineHeight: '1.7',
    },
    '.cm-interruption-line': {
      boxShadow: 'inset 3px 0 0 oklch(0.62 0.15 232)',
      paddingBlock: '4px',
    },
    '.cm-interruption-line-reviewed': {
      boxShadow: 'inset 3px 0 0 color-mix(in oklab, oklch(0.62 0.15 232) 26%, transparent)',
    },
  },
});

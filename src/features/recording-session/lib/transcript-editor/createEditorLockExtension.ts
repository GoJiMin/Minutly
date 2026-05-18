import {Compartment, EditorState, type Extension, type StateEffect} from '@codemirror/state';
import {EditorView} from '@codemirror/view';

export type EditorLockExtension = {
  extension: Extension;
  createLockEffect: (locked: boolean) => StateEffect<unknown>;
};

function createLockExtensions(locked: boolean): Extension {
  return [
    EditorState.readOnly.of(locked),
    EditorView.editable.of(!locked),
    EditorView.contentAttributes.of({
      'aria-readonly': String(locked),
    }),
  ];
}

export function createEditorLockExtension(): EditorLockExtension {
  const compartment = new Compartment();

  return {
    extension: compartment.of(createLockExtensions(false)),
    createLockEffect(locked: boolean) {
      return compartment.reconfigure(createLockExtensions(locked));
    },
  };
}

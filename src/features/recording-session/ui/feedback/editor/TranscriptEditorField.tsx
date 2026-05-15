import {RefObject} from 'react';

type TranscriptEditorFieldProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

export function TranscriptEditorField({containerRef}: TranscriptEditorFieldProps) {
  return <div ref={containerRef} className="min-h-0 w-full flex-1 overflow-hidden" />;
}

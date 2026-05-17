import {createTranscriptEditorDocument} from '../createTranscriptEditorDocument';
import type {TranscriptChunk} from '@/entities/speech-to-text/client';

describe('@/src/features/recording-session/lib/transcript-editor/createTranscriptEditorDocument.ts', () => {
  it('전사 청크를 빈 줄로 구분한 편집 문서로 변환한다.', () => {
    const chunks: TranscriptChunk[] = [
      {id: 'speech-1', kind: 'speech', text: '첫 번째 발언'},
      {id: 'speech-2', kind: 'speech', text: '두 번째 발언'},
    ];

    const result = createTranscriptEditorDocument(chunks);

    expect(result.doc).toBe('첫 번째 발언\n\n두 번째 발언');
    expect(result.interruptions).toEqual([]);
  });

  it('녹음 중단 청크의 편집 문서 위치와 순서를 반환한다.', () => {
    const chunks: TranscriptChunk[] = [
      {id: 'speech-1', kind: 'speech', text: '첫 번째 발언'},
      {id: 'interruption-1', kind: 'interruption', text: '[녹음 중단 구간] 00:00:10 지점에 녹음이 멈췄어요.'},
      {id: 'interruption-2', kind: 'interruption', text: '[녹음 중단 구간] 00:00:20 지점에 녹음이 멈췄어요.'},
    ];

    const result = createTranscriptEditorDocument(chunks);

    expect(result.interruptions).toEqual([
      {
        id: 'interruption-1',
        order: 1,
        from: '첫 번째 발언\n\n'.length,
        to: '첫 번째 발언\n\n[녹음 중단 구간] 00:00:10 지점에 녹음이 멈췄어요.'.length,
        reviewed: false,
      },
      {
        id: 'interruption-2',
        order: 2,
        from: '첫 번째 발언\n\n[녹음 중단 구간] 00:00:10 지점에 녹음이 멈췄어요.\n\n'.length,
        to: '첫 번째 발언\n\n[녹음 중단 구간] 00:00:10 지점에 녹음이 멈췄어요.\n\n[녹음 중단 구간] 00:00:20 지점에 녹음이 멈췄어요.'
          .length,
        reviewed: false,
      },
    ]);
  });
});

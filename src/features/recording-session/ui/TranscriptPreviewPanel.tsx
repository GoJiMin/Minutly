import {AnimatePresence, motion} from 'framer-motion';
import {AudioLines, TextAlignStart} from 'lucide-react';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {Heading, Text} from '@/shared/components';

export default function TranscriptPreviewPanel() {
  return (
    <section className="flex flex-col flex-1 border-2 rounded-xl">
      <header className="px-5 py-4 border-b-2">
        <div className="flex items-center gap-2 mb-1">
          <TextAlignStart size={22} />
          <Heading level="h3" className="font-bold">
            최근 기록
          </Heading>
        </div>
        <Text variant="muted">녹음 중 인식된 문장을 바로 확인할 수 있어요.</Text>
      </header>
      <TranscriptPreviewContent />
    </section>
  );
}

const ONBOARDING_STEPS = [
  '녹음을 시작하면 회의 내용을 문장 단위로 인식해요.',
  '원활한 녹음을 위해 마이크 권한을 허용해주세요.',
  '필요한 경우 사용할 마이크를 먼저 선택할 수 있어요.',
  '인식된 문장은 최근 기록에 최대 10개까지 표시돼요.',
  '중간에 쉬어야 한다면 녹음을 잠시 멈춘 뒤 다시 이어갈 수 있어요.',
  '녹음이 끝나면 기록을 검토한 뒤 회의 요약을 생성할 수 있어요.',
  '완성된 회의록은 저장해 다시 확인할 수 있어요.',
  '완성된 회의록의 회의 내용을 수정해 회의 요약을 다시 생성할 수 있어요.',
];

function TranscriptPreviewContent() {
  const status = useRecordingStore(state => state.status);
  const previewChunks = useRecordingStore(state => state.previewChunks);

  const hasPreviewChunks = previewChunks.length > 0;
  const isBeforeRecording = status === 'idle' && !hasPreviewChunks;
  const isWaitingForSpeech = status === 'recording' && !hasPreviewChunks;

  return (
    <div className="flex flex-1 bg-white py-4 px-8">
      {isBeforeRecording && (
        <ol className="grid w-full flex-1 grid-rows-8">
          {ONBOARDING_STEPS.map((step, index) => (
            <li
              key={step}
              className="grid min-h-0 grid-cols-[3rem_1fr] items-center border-b border-border/60 last:border-b-0"
            >
              <span className="text-lg font-semibold tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <Text className="text-xl text-foreground">{step}</Text>
            </li>
          ))}
        </ol>
      )}

      {isWaitingForSpeech && (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-primary/5">
            <AudioLines size={38} />
          </div>
        </div>
      )}

      {hasPreviewChunks && (
        <ul className="w-full flex-1 grid grid-rows-10 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            {previewChunks.map(chunk => (
              <motion.li
                key={chunk.id}
                layout
                className="min-h-0 flex items-center border-b border-border/60 last:border-b-0"
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -10}}
                transition={{
                  opacity: {duration: 0.16},
                  y: {duration: 0.2, ease: [0.22, 1, 0.36, 1]},
                  layout: {duration: 0.22, ease: [0.22, 1, 0.36, 1]},
                }}
              >
                <Text
                  className={`text-lg line-clamp-2 ${chunk.kind === 'interruption' ? 'text-amber-700' : 'text-foreground'}`}
                >
                  {chunk.text}
                </Text>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

import {AnimatePresence, motion} from 'framer-motion';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {Text} from '@/shared/components';

export function TranscriptPreviewList() {
  const previewChunks = useRecordingStore(state => state.previewChunks);

  return (
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
              className={`text-sm md:text-lg line-clamp-2 ${chunk.kind === 'interruption' ? 'text-amber-700' : 'text-foreground'}`}
            >
              {chunk.text}
            </Text>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

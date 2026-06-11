import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {FileText} from 'lucide-react';

const LOADING_MESSAGES = [
  '회의 내용을 꼼꼼히 읽어보는 중',
  '전체적인 문맥을 파악하는 중',
  '중요한 키포인트를 쏙쏙 뽑아내는 중',
  '알기 쉽게 요약본을 작성하는 중',
  '최종 검토 및 다듬는 중',
];

export function SummaryGenerationOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute h-32 w-32 rounded-full bg-primary/20 blur-xl md:h-48 md:w-48 md:blur-2xl"
        />
        <div className="relative z-10 flex items-center justify-center rounded-full bg-background p-4 shadow-xl ring-1 ring-border md:p-5">
          <FileText className="h-8 w-8 text-muted-foreground md:h-12 md:w-12" aria-hidden="true" />
        </div>
      </div>

      <div className="h-8 mt-8 md:h-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.3}}
            className="text-center text-base font-medium text-foreground md:text-xl"
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        className="relative mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-muted md:mt-8 md:w-64"
        role="progressbar"
        aria-label="요약본 생성 진행 상태"
      >
        <motion.div
          className="absolute top-0 bottom-0 left-0 w-1/3 rounded-full bg-primary"
          animate={{
            x: ['-100%', '300%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  );
}

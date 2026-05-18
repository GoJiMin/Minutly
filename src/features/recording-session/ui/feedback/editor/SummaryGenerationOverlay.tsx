import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {FileText} from 'lucide-react';

const LOADING_MESSAGES = [
  '회의 내용을 꼼꼼히 읽어보는 중',
  '중요한 키포인트를 쏙쏙 뽑아내는 중',
  '알기 쉽게 요약본을 작성하는 중',
  '마무리 다듬는 중',
];

export function SummaryGenerationOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md"
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
          className="absolute h-48 w-48 rounded-full bg-primary/20 blur-2xl"
        />
        <div className="relative z-10 flex items-center justify-center rounded-full bg-background p-5 shadow-xl ring-1 ring-border">
          <FileText className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-8 h-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.3}}
            className="text-center text-xl font-medium text-foreground"
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-muted relative"
        role="progressbar"
        aria-label="요약본 생성 진행 상태"
      >
        <motion.div
          className="absolute top-0 bottom-0 left-0 w-1/3 rounded-full bg-primary"
          animate={{
            x: ['-100%', '300%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  );
}

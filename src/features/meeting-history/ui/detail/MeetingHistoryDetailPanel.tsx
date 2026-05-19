'use client';

import {useEffect, useState} from 'react';
import {useReducedMotion} from 'framer-motion';
import Lottie from 'lottie-react';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {Text} from '@/shared/components';

export function MeetingHistoryDetailPanel() {
  const {meetingId} = useMeetingHistorySearchParams();

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl">
      {!meetingId && <SelectMeetingEmptyState />}
    </section>
  );
}

function SelectMeetingEmptyState() {
  const shouldReduceMotion = useReducedMotion();
  const [animationData, setAnimationData] = useState<unknown>();

  useEffect(() => {
    let isMounted = true;

    async function loadAnimation() {
      try {
        const response = await fetch('/animations/meeting-empty.json');

        if (!response.ok) return;

        const data: unknown = await response.json();

        if (isMounted) {
          setAnimationData(data);
        }
      } catch {
        // Empty-state copy still guides the user if the decorative animation cannot load.
      }
    }

    void loadAnimation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="mb-7 flex flex-col items-center gap-5">
        <div aria-hidden className="h-62 w-96 max-w-full">
          {animationData ? (
            <Lottie
              animationData={animationData}
              loop={!shouldReduceMotion}
              autoplay={!shouldReduceMotion}
              className="h-full w-full"
            />
          ) : null}
        </div>

        <div className="space-y-2">
          <Text className="font-medium">회의록을 선택해주세요</Text>
          <Text variant="muted" className="max-w-92 text-sm">
            캘린더에서 날짜를 고른 뒤, 왼쪽 목록의 회의록을 누르면 내용이 표시됩니다.
          </Text>
        </div>
      </div>

      <Text variant="muted" className="text-xs">
        선택한 회의록이 이 자리에 조용히 펼쳐집니다.
      </Text>
    </div>
  );
}

'use client';

import {useReducedMotion} from 'framer-motion';
import Lottie from 'lottie-react';
import meetingEmptyAnimation from '../../../../../public/animations/meeting-empty.json';
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

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="mb-7 flex flex-col items-center gap-5">
        <div aria-hidden className="h-62 w-96 max-w-full">
          <Lottie
            animationData={meetingEmptyAnimation}
            loop={!shouldReduceMotion}
            autoplay={!shouldReduceMotion}
            className="h-full w-full"
          />
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

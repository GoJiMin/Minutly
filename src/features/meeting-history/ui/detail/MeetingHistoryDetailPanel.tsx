'use client';

import {useReducedMotion} from 'framer-motion';
import Lottie from 'lottie-react';
import meetingEmptyAnimation from '../../../../../public/animations/meeting-empty.json';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {Text} from '@/shared/components';
import {SelectMeetingEmptyState} from './SelectMeetingEmptyState';

export function MeetingHistoryDetailPanel() {
  const {meetingId} = useMeetingHistorySearchParams();

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl">{!meetingId && <SelectMeetingEmptyState />}</section>
  );
}

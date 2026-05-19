'use client';

import dynamic from 'next/dynamic';
import {MeetingHistoryWorkspaceSkeleton} from './MeetingHistorySkeleton';

const MeetingHistoryWorkspace = dynamic(() => import('./MeetingHistoryWorkspace'), {
  ssr: false,
  loading: () => <MeetingHistoryWorkspaceSkeleton />,
});

export function MeetingHistoryClientOnly() {
  return <MeetingHistoryWorkspace />;
}

'use client';

import dynamic from 'next/dynamic';

const MeetingHistoryWorkspace = dynamic(() => import('./MeetingHistoryWorkspace'), {
  ssr: false,
  loading: () => (
    <div>
      {/* TODO: 히스토리 스켈레톤 */}
      loading
    </div>
  ),
});

export function MeetingHistoryClientOnly() {
  return <MeetingHistoryWorkspace />;
}

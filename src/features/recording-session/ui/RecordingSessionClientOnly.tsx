'use client';

import dynamic from 'next/dynamic';

const RecordingSessionWorkspace = dynamic(() => import('./RecordingSessionWorkspace'), {
  ssr: false,
  loading: () => (
    <div>
      {/* TODO: UI 스켈레톤 구현 */}
      loading
    </div>
  ),
});

export function RecordingSessionClientOnly() {
  return <RecordingSessionWorkspace />;
}

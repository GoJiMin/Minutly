'use client';

import dynamic from 'next/dynamic';
import {RecordingSessionWorkspaceSkeleton} from './RecordingSessionSkeleton';

const RecordingSessionWorkspace = dynamic(() => import('./RecordingSessionWorkspace'), {
  ssr: false,
  loading: () => <RecordingSessionWorkspaceSkeleton />,
});

export function RecordingSessionClientOnly() {
  return <RecordingSessionWorkspace />;
}

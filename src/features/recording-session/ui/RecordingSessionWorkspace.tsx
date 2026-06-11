import {RecordingSessionFeedbackPanel} from './feedback/RecordingSessionFeedbackPanel';
import RecordingSessionControlsPanel from './controls/RecordingSessionControlsPanel';
import {useRecordingDraftPersistence} from '../lib/useRecordingDraftPersistence';
import {Separator} from '@/shared/components';

export default function RecordingSessionWorkspace() {
  useRecordingDraftPersistence();

  return (
    <section className="flex h-full w-full flex-col md:flex-row md:gap-5 md:px-10 md:py-6">
      <RecordingSessionControlsPanel className="order-3 md:order-1 pb-9 md:pb-0" />
      <Separator className="order-2 md:hidden" />
      <RecordingSessionFeedbackPanel className="order-1 md:order-2" />
    </section>
  );
}

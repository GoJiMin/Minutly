import {RecordingSessionFeedbackPanel} from './feedback/RecordingSessionFeedbackPanel';
import RecordingSessionControlsPanel from './controls/RecordingSessionControlsPanel';
import {useRecordingDraftPersistence} from '../lib/useRecordingDraftPersistence';

export default function RecordingSessionWorkspace() {
  useRecordingDraftPersistence();

  return (
    <section className="flex h-full w-full flex-col gap-3 px-4 py-3 md:flex-row md:gap-5 md:px-10 md:py-6">
      <RecordingSessionControlsPanel className="order-2 md:order-1" />
      <RecordingSessionFeedbackPanel className="order-1 md:order-2" />
    </section>
  );
}

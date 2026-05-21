import {RecordingSessionFeedbackPanel} from './feedback/RecordingSessionFeedbackPanel';
import RecordingSessionControlsPanel from './controls/RecordingSessionControlsPanel';
import {useRecordingDraftPersistence} from '../lib/useRecordingDraftPersistence';

export default function RecordingSessionWorkspace() {
  useRecordingDraftPersistence();

  return (
    <section className="w-full h-full flex gap-5 px-10 py-6">
      <RecordingSessionControlsPanel />
      <RecordingSessionFeedbackPanel />
    </section>
  );
}

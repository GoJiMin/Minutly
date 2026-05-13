import {RecordingSessionFeedbackPanel} from './feedback/RecordingSessionFeedbackPanel';
import RecordingSessionControlsPanel from './controls/RecordingSessionControlsPanel';
import {useRecordingDraftPersistence} from '../lib/useRecordingDraftPersistence';

export default function RecordingSessionWorkspace() {
  useRecordingDraftPersistence();

  return (
    <section className="w-full h-full flex gap-10 p-10">
      <RecordingSessionControlsPanel />
      <RecordingSessionFeedbackPanel />
    </section>
  );
}

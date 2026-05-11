import RecordingSessionControlsPanel from './RecordingSessionControlsPanel';
import TranscriptPreviewPanel from './TranscriptPreviewPanel';

export default function RecordingSessionWorkspace() {
  return (
    <section className="w-full h-full flex gap-10 p-10">
      <RecordingSessionControlsPanel />
      <TranscriptPreviewPanel />
    </section>
  );
}

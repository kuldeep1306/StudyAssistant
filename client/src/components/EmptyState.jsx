export default function EmptyState() {
  return (
    <div className="state-panel empty-state">
      <div className="index-card ghost-card" aria-hidden="true">
        <span className="ghost-line" />
        <span className="ghost-line short" />
      </div>
      <h2>Your deck will show up here</h2>
      <p>Paste some notes or type a topic on the left, then generate a study set.</p>
    </div>
  );
}

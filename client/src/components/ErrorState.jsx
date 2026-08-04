export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel error-state">
      <div className="index-card error-card" aria-hidden="true">
        <span className="error-mark">✕</span>
      </div>
      <h2>Couldn't build a study set</h2>
      <p>{message}</p>
      <button className="btn btn-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export default function LoadingState() {
  return (
    <div className="state-panel loading-state" role="status" aria-live="polite">
      <div className="index-card loading-card">
        <div className="shimmer-line w-70" />
        <div className="shimmer-line w-90" />
        <div className="shimmer-line w-50" />
      </div>
      <p>Reading your notes and building a deck…</p>
    </div>
  );
}

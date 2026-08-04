export default function EmptyState() {
  return (
    <div className="state-panel empty-state">
      <svg
        className="empty-state-icon"
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden="true"
      >
        <rect x="14" y="10" width="44" height="52" rx="6" fill="var(--paper)" stroke="var(--line)" strokeWidth="1.5" />
        <path
          className="pencil-path"
          d="M24 28 H48 M24 36 H42 M24 44 H36"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle className="lamp-glow" cx="56" cy="18" r="6" fill="var(--accent)" opacity="0.6" />
      </svg>
      <h2>Your deck will show up here</h2>
      <p>Paste some notes or type a topic on the left, then generate a study set.</p>
    </div>
  );
}

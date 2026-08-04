export default function InputPanel({ value, onChange, onGenerate, disabled }) {
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !disabled) {
      onGenerate();
    }
  };

  return (
    <div className="notebook">
      <div className="notebook-spiral" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="spiral-hole" />
        ))}
      </div>
      <div className="notebook-page">
        <label htmlFor="notes-input" className="notebook-label">
          Paste your notes, or just name a topic
        </label>
        <textarea
          id="notes-input"
          className="notebook-textarea"
          placeholder={`e.g. "Photosynthesis: light reactions happen in the thylakoid, produce ATP and NADPH..."\n\nor just: "The French Revolution"`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={8000}
          rows={10}
        />
        <div className="notebook-footer">
          <span className="char-count">{value.length} / 8000</span>
          <button className="btn btn-primary" onClick={onGenerate} disabled={disabled || !value.trim()}>
            {disabled ? 'Generating…' : 'Generate study set'}
          </button>
        </div>
      </div>
    </div>
  );
}

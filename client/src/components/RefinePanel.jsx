import { useState } from 'react';

const SUGGESTIONS = ['Make the quiz harder', 'Simplify the flashcards', 'Add 3 more quiz questions'];

export default function RefinePanel({ onRefine, disabled }) {
  const [instruction, setInstruction] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [error, setError] = useState('');

  const submit = async (text) => {
    const value = (text ?? instruction).trim();
    if (!value || disabled) return;

    setStatus('loading');
    setError('');
    try {
      await onRefine(value);
      setInstruction('');
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Could not apply that change. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className="refine-panel">
      <p className="refine-label">Not quite right? Ask for a change instead of starting over.</p>

      <form className="refine-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="refine-input"
          placeholder="e.g. make the quiz harder, add 2 more flashcards…"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={disabled || status === 'loading'}
          maxLength={500}
        />
        <button className="btn btn-primary" type="submit" disabled={disabled || status === 'loading' || !instruction.trim()}>
          {status === 'loading' ? 'Applying…' : 'Refine'}
        </button>
      </form>

      <div className="refine-suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            onClick={() => submit(s)}
            disabled={disabled || status === 'loading'}
          >
            {s}
          </button>
        ))}
      </div>

      {status === 'error' && <p className="refine-error">{error}</p>}
    </div>
  );
}

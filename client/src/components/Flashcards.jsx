import { useState } from 'react';

export default function Flashcards({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  const goTo = (next) => {
    setFlipped(false);
    setIndex(next);
  };

  const handlePrev = () => goTo((index - 1 + cards.length) % cards.length);
  const handleNext = () => goTo((index + 1) % cards.length);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped((f) => !f);
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  };

  return (
    <div className="deck">
      <p className="deck-counter">
        Card {index + 1} of {cards.length}
      </p>

      <div className="deck-stack">
        {/* peeking cards behind the active one, purely decorative */}
        <div className="index-card peek peek-2" aria-hidden="true" />
        <div className="index-card peek peek-1" aria-hidden="true" />

        <div
          className={`index-card flip-card ${flipped ? 'is-flipped' : ''}`}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={flipped ? 'Showing answer, press to show question' : 'Showing question, press to show answer'}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={handleKeyDown}
        >
          <div className="flip-card-inner">
            <div className="flip-face flip-front">
              <span className="flip-tag">Q</span>
              <p>{card.front}</p>
              <span className="flip-hint">Tap to flip</span>
            </div>
            <div className="flip-face flip-back">
              <span className="flip-tag">A</span>
              <p>{card.back}</p>
              <span className="flip-hint">Tap to flip back</span>
            </div>
          </div>
        </div>
      </div>

      <div className="deck-controls">
        <button className="btn btn-ghost" onClick={handlePrev} aria-label="Previous card">
          ← Prev
        </button>
        <button className="btn btn-ghost" onClick={handleNext} aria-label="Next card">
          Next →
        </button>
      </div>
    </div>
  );
}

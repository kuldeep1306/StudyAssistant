import { useState } from 'react';

export default function Quiz({ questions }) {
  const [activeQuestions, setActiveQuestions] = useState(questions);
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const isRetestRound = activeQuestions.length < questions.length;
  const allAnswered = activeQuestions.every((q) => selections[q.id] !== undefined);
  const score = activeQuestions.filter((q) => selections[q.id] === q.answerIndex).length;
  const wrongQuestions = activeQuestions.filter((q) => selections[q.id] !== q.answerIndex);

  const selectOption = (questionId, optionIndex) => {
    if (submitted) return;
    setSelections((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => setSubmitted(true);

  const handleRetestWrong = () => {
    setActiveQuestions(wrongQuestions);
    setSelections({});
    setSubmitted(false);
  };

  const handleStartOver = () => {
    setActiveQuestions(questions);
    setSelections({});
    setSubmitted(false);
  };

  return (
    <div className="quiz">
      {isRetestRound && (
        <p className="retest-banner">
          Retesting {activeQuestions.length} question{activeQuestions.length === 1 ? '' : 's'} you got wrong.{' '}
          <button className="link-btn" onClick={handleStartOver}>
            Start over with full quiz
          </button>
        </p>
      )}

      {submitted && (
        <div className="quiz-score" role="status">
          <span className="quiz-score-number">
            {score} / {activeQuestions.length}
          </span>
          <span>correct</span>
        </div>
      )}

      <ol className="quiz-list">
        {activeQuestions.map((q, qIndex) => {
          const selected = selections[q.id];
          const isCorrect = selected === q.answerIndex;

          return (
            <li key={q.id} className={`quiz-question index-card ${submitted ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}`}>
              <p className="quiz-question-text">
                <span className="quiz-question-num">{qIndex + 1}.</span> {q.question}
              </p>
              <div className="quiz-options">
                {q.options.map((option, optIndex) => {
                  const isChosen = selected === optIndex;
                  const isAnswer = optIndex === q.answerIndex;
                  let optionClass = 'quiz-option';
                  if (isChosen) optionClass += ' is-chosen';
                  if (submitted && isAnswer) optionClass += ' is-answer';
                  if (submitted && isChosen && !isAnswer) optionClass += ' is-incorrect';

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      className={optionClass}
                      onClick={() => selectOption(q.id, optIndex)}
                      disabled={submitted}
                      aria-pressed={isChosen}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && <p className="quiz-explanation">{q.explanation}</p>}
            </li>
          );
        })}
      </ol>

      {!submitted ? (
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered}>
          Submit quiz
        </button>
      ) : wrongQuestions.length > 0 ? (
        <button className="btn btn-primary" onClick={handleRetestWrong}>
          Retest {wrongQuestions.length} wrong answer{wrongQuestions.length === 1 ? '' : 's'}
        </button>
      ) : (
        <p className="quiz-perfect">All correct — nice work.</p>
      )}
    </div>
  );
}

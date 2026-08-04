import { useEffect, useRef, useState } from 'react';
import InputPanel from './components/InputPanel.jsx';
import EmptyState from './components/EmptyState.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import Flashcards from './components/Flashcards.jsx';
import Quiz from './components/Quiz.jsx';
import RefinePanel from './components/RefinePanel.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { fetchStudyMaterial, fetchRefinement } from './lib/api.js';
import { loadSession, saveSession, clearSession, loadTheme, saveTheme } from './lib/storage.js';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

export default function App() {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('flashcards');
  const [resultVersion, setResultVersion] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [restoredNotice, setRestoredNotice] = useState(false);

  // Guards against a slow, older request overwriting a newer one.
  const requestIdRef = useRef(0);

  // Restore theme + last session on first load.
  useEffect(() => {
    const savedTheme = loadTheme();
    setTheme(savedTheme);

    const session = loadSession();
    if (session?.data) {
      setNotes(session.notes || '');
      setData(session.data);
      setActiveTab(session.data.flashcards?.length ? 'flashcards' : 'quiz');
      setStatus(STATUS.SUCCESS);
      setRestoredNotice(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (status === STATUS.SUCCESS && data) {
      saveSession({ notes, data });
    }
  }, [status, data, notes]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      saveTheme(next);
      return next;
    });
  };

  const handleGenerate = async () => {
    const thisRequestId = ++requestIdRef.current;
    setStatus(STATUS.LOADING);
    setErrorMessage('');
    setRestoredNotice(false);

    try {
      const result = await fetchStudyMaterial(notes.trim());
      if (thisRequestId !== requestIdRef.current) return; // a newer request already took over

      setData(result);
      setActiveTab(result.flashcards.length > 0 ? 'flashcards' : 'quiz');
      setResultVersion((v) => v + 1);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      if (thisRequestId !== requestIdRef.current) return;
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setStatus(STATUS.ERROR);
    }
  };

  // Sends the current data + instruction to the backend, which asks the
  // model to edit it in place. Re-throws on failure so RefinePanel can show
  // its own inline error without disturbing the results already on screen.
  const handleRefine = async (instruction) => {
    const result = await fetchRefinement(data, instruction);
    setData(result);
    setActiveTab(result.flashcards.length > 0 ? 'flashcards' : activeTab);
    setResultVersion((v) => v + 1);
  };

  const handleStartNew = () => {
    clearSession();
    requestIdRef.current++; // invalidate any in-flight request
    setNotes('');
    setData(null);
    setStatus(STATUS.IDLE);
    setErrorMessage('');
    setRestoredNotice(false);
  };

  const hasFlashcards = data?.flashcards?.length > 0;
  const hasQuiz = data?.quiz?.length > 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-top">
          <h1>Study Assistant</h1>
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        </div>
        <p>Paste notes or a topic, get back flashcards and a quiz you can actually use.</p>
      </header>

      <main className="app-main">
        <InputPanel value={notes} onChange={setNotes} onGenerate={handleGenerate} disabled={status === STATUS.LOADING} />

        <section className="results-panel">
          {status === STATUS.IDLE && <EmptyState />}
          {status === STATUS.LOADING && <LoadingState />}
          {status === STATUS.ERROR && <ErrorState message={errorMessage} onRetry={handleGenerate} />}
          {status === STATUS.SUCCESS && data && (
            <div className="results">
              {restoredNotice && (
                <p className="restored-banner">
                  Picked up where you left off.{' '}
                  <button className="link-btn" onClick={handleStartNew}>
                    Start a new set instead
                  </button>
                </p>
              )}

              {hasFlashcards && hasQuiz && (
                <div className="tabs" role="tablist">
                  <button
                    role="tab"
                    aria-selected={activeTab === 'flashcards'}
                    className={`tab ${activeTab === 'flashcards' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('flashcards')}
                  >
                    Flashcards ({data.flashcards.length})
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'quiz'}
                    className={`tab ${activeTab === 'quiz' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('quiz')}
                  >
                    Quiz ({data.quiz.length})
                  </button>
                </div>
              )}

              {activeTab === 'flashcards' && hasFlashcards && (
                <Flashcards key={`cards-${resultVersion}`} cards={data.flashcards} />
              )}
              {activeTab === 'quiz' && hasQuiz && <Quiz key={`quiz-${resultVersion}`} questions={data.quiz} />}

              <RefinePanel onRefine={handleRefine} disabled={status !== STATUS.SUCCESS} />

              {!restoredNotice && (
                <button className="link-btn start-new-link" onClick={handleStartNew}>
                  Start a new set
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? '🌙' : '☀️'}
    </button>
  );
}

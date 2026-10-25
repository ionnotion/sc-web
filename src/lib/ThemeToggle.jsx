import { useTheme } from './theme.js';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      <span className={dark ? 'tt-hidden' : ''}>☾ Dark</span>
      <span className={dark ? '' : 'tt-hidden'}>☀ Light</span>
    </button>
  );
}
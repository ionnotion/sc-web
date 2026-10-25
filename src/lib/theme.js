import { useEffect, useState } from 'react';

const KEY = 'school_theme'; // shared by the public and admin apps (same origin)
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

// No saved choice => no data-theme attribute => the CSS follows the operating system.
function current() {
  return document.documentElement.dataset.theme || (systemDark() ? 'dark' : 'light');
}

export function useTheme() {
  const [theme, setTheme] = useState(current);

  // While the user hasn't picked a theme, follow OS changes live.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!localStorage.getItem(KEY)) setTheme(current());
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* storage blocked: still works for this visit */ }
    setTheme(next);
  };

  return { theme, toggle };
}

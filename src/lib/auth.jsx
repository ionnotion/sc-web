import { createContext, useContext, useEffect, useState } from 'react';
import { request } from './api.js';

// One storage key per app, so a public (parent) session and an admin session never mix.
export function createAuth(storageKey) {
  const Ctx = createContext(null);

  function Provider({ children }) {
    const [session, setSession] = useState(() => {
      try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; }
    });
    const save = (s) => {
      if (s) localStorage.setItem(storageKey, JSON.stringify(s));
      else localStorage.removeItem(storageKey);
      setSession(s);
    };

    // Refresh user/role from the server on load; drop the session if the token is no longer valid.
    useEffect(() => {
      if (!session) return;
      request('/me', { token: session.token }).then(
        (user) => save({ token: session.token, user }),
        () => save(null),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const api = async (path, opts = {}) => {
      try {
        return await request(path, { ...opts, token: session && session.token });
      } catch (e) {
        if (e.status === 401) save(null);
        throw e;
      }
    };
    const authenticate = async (path, body) => {
      const r = await request(path, { method: 'POST', body });
      save({ token: r.token, user: r.user });
      return r.user;
    };

    const value = {
      user: session && session.user,
      token: session && session.token,
      api,
      login: (email, password) => authenticate('/auth/login', { email, password }),
      register: (body) => authenticate('/auth/register', body),
      logout: () => save(null),
    };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  return { Provider, useAuth: () => useContext(Ctx) };
}

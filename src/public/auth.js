import { createAuth } from '../lib/auth.jsx';

export const { Provider: AuthProvider, useAuth } = createAuth('school_public_session');

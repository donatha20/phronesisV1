import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { apiFetch, API_BASE_URL } from '../lib/api';
import type { ApiUser, AuthStatus } from './types';

interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: ApiUser | null;
  /** True once the initial session probe has completed. */
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetch `/api/auth/user/` (used after the Google redirect returns). */
  refresh: () => Promise<void>;
  /** Full-page navigation to the backend's Google authorize endpoint. */
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchMe(): Promise<ApiUser | null> {
  try {
    return await apiFetch<ApiUser>('/api/auth/user/');
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const bootstrapped = useRef(false);

  const applyUser = useCallback((u: ApiUser | null) => {
    setUser(u);
    setStatus(u ? 'authenticated' : 'anonymous');
  }, []);

  const refresh = useCallback(async () => {
    applyUser(await fetchMe());
  }, [applyUser]);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      // Prime the csrftoken cookie, then probe the session.
      try {
        await apiFetch('/api/auth/csrf/');
      } catch {
        /* non-fatal */
      }
      applyUser(await fetchMe());
    })();
  }, [applyUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      await apiFetch('/api/auth/login/', { method: 'POST', json: { email, password } });
      applyUser(await fetchMe());
    },
    [applyUser],
  );

  const register = useCallback(
    async ({ email, password, firstName, lastName }: RegisterInput) => {
      await apiFetch('/api/auth/registration/', {
        method: 'POST',
        json: {
          email,
          password1: password,
          password2: password,
          first_name: firstName ?? '',
          last_name: lastName ?? '',
        },
      });
      // dj-rest-auth logs the user in on registration and sets the JWT cookies.
      applyUser(await fetchMe());
    },
    [applyUser],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout/', { method: 'POST' });
    } finally {
      applyUser(null);
    }
  }, [applyUser]);

  const loginWithGoogle = useCallback(() => {
    window.location.assign(`${API_BASE_URL}/api/auth/google/authorize/`);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      ready: status !== 'loading',
      login,
      register,
      logout,
      refresh,
      loginWithGoogle,
    }),
    [status, user, login, register, logout, refresh, loginWithGoogle],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';

/**
 * Lands here after the backend Google callback sets the JWT cookies and
 * redirects to `/auth/callback`. We re-probe the session, then replace the
 * URL with `/` so a refresh doesn't re-trigger this screen.
 */
export const CallbackScreen: React.FC = () => {
  const { refresh } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    (async () => {
      await refresh();
      window.history.replaceState({}, '', '/');
    })();
  }, [refresh]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-3 text-stone-500">
      <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
      <p className="text-sm">Completing sign-in…</p>
    </div>
  );
};

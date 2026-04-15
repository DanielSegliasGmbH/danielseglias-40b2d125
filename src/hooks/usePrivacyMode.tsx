import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface PrivacyModeContextValue {
  isPrivate: boolean;
  togglePrivacy: () => void;
}

const PrivacyModeContext = createContext<PrivacyModeContextValue>({
  isPrivate: false,
  togglePrivacy: () => {},
});

export function PrivacyModeProvider({ children }: { children: ReactNode }) {
  const [isPrivate, setIsPrivate] = useState(false);
  const togglePrivacy = useCallback(() => setIsPrivate(prev => !prev), []);
  const hintShown = useRef(false);
  const isPrivateRef = useRef(isPrivate);
  isPrivateRef.current = isPrivate;

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    let lastHidden = 0;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastHidden = Date.now();
        return;
      }

      // Page became visible again — on iOS a screenshot causes a brief hide/show cycle (<1s)
      const elapsed = Date.now() - lastHidden;
      if (elapsed > 0 && elapsed < 1500 && !isPrivateRef.current && !hintShown.current) {
        hintShown.current = true;
        toast('💡 Tipp: Aktiviere den Privacy Mode (👁️) um deine Daten beim Teilen zu schützen.', {
          duration: 5000,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <PrivacyModeContext.Provider value={{ isPrivate, togglePrivacy }}>
      {children}
    </PrivacyModeContext.Provider>
  );
}

export function usePrivacyMode() {
  return useContext(PrivacyModeContext);
}

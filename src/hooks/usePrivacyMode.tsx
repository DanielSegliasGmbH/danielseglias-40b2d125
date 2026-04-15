import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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

  return (
    <PrivacyModeContext.Provider value={{ isPrivate, togglePrivacy }}>
      {children}
    </PrivacyModeContext.Provider>
  );
}

export function usePrivacyMode() {
  return useContext(PrivacyModeContext);
}

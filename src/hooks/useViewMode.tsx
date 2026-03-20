import { createContext, useContext, useState, ReactNode } from 'react';

export type ViewMode = 'admin' | 'presentation';

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isPresentation: boolean;
  isAdmin: boolean;
}

const ViewModeContext = createContext<ViewModeContextValue>({
  viewMode: 'admin',
  setViewMode: () => {},
  isPresentation: false,
  isAdmin: true,
});

export function ViewModeProvider({ mode = 'admin', children }: { mode?: ViewMode; children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>(mode);

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        isPresentation: viewMode === 'presentation',
        isAdmin: viewMode === 'admin',
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}

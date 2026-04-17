import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

type SheetKey = 'inventory' | 'achievements' | null;

interface HamsterSheetsContextValue {
  open: SheetKey;
  openInventory: () => void;
  openAchievements: () => void;
  close: () => void;
}

const Ctx = createContext<HamsterSheetsContextValue | null>(null);

export function HamsterSheetsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<SheetKey>(null);
  const openInventory = useCallback(() => setOpen('inventory'), []);
  const openAchievements = useCallback(() => setOpen('achievements'), []);
  const close = useCallback(() => setOpen(null), []);

  return (
    <Ctx.Provider value={{ open, openInventory, openAchievements, close }}>
      {children}
    </Ctx.Provider>
  );
}

export function useHamsterSheets() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHamsterSheets must be used within HamsterSheetsProvider');
  return v;
}

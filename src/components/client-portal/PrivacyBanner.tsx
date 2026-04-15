import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { Lock, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function PrivacyBanner() {
  const { isPrivate } = usePrivacyMode();
  const [dismissed, setDismissed] = useState(false);

  if (!isPrivate || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-muted/80 text-muted-foreground text-xs flex items-center justify-center gap-1.5 py-1 relative z-[70]"
      >
        <Lock className="h-3 w-3" />
        <span>Privacy Mode aktiv</span>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 p-0.5 rounded hover:bg-accent"
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

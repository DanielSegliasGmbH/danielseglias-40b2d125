import { useNavigate } from 'react-router-dom';
import { useHamster } from '@/hooks/useHamster';
import { useGoldNuts } from '@/hooks/useGoldNuts';
import { useHamsterSheets } from '@/hooks/useHamsterSheets';
import { HamsterAvatar } from '@/components/client-portal/HamsterAvatar';

/**
 * Kompakte Header-Indikator: zeigt den Hamster, Münzen- und Goldnuss-Stand.
 * Tippen öffnet das Inventar-Sheet.
 */
export function HamsterHeaderBadge() {
  const { coins } = useHamster();
  const { collectedCount } = useGoldNuts();
  const { openInventory } = useHamsterSheets();

  return (
    <button
      onClick={openInventory}
      className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-2 py-1 hover:border-primary/40 active:scale-95 transition-all"
      aria-label="Hamster-Inventar öffnen"
    >
      <HamsterAvatar size="sm" />
      <div className="flex items-center gap-2 pr-1.5 text-xs font-semibold text-foreground">
        <span className="inline-flex items-center gap-0.5">
          <span aria-hidden>🪙</span>{coins}
        </span>
        <span className="inline-flex items-center gap-0.5">
          <span aria-hidden>🥜</span>{collectedCount}
        </span>
      </div>
    </button>
  );
}

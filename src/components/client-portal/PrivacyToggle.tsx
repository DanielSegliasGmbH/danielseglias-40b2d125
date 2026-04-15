import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function PrivacyToggle() {
  const { isPrivate, togglePrivacy } = usePrivacyMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={togglePrivacy}
          aria-label={isPrivate ? 'Privacy Mode deaktivieren' : 'Privacy Mode aktivieren'}
        >
          {isPrivate ? (
            <EyeOff className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isPrivate ? 'Werte einblenden' : 'Werte ausblenden'}
      </TooltipContent>
    </Tooltip>
  );
}

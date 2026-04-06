import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTracking } from '@/hooks/useTracking';

/**
 * Headless component that automatically tracks page_view events
 * whenever the route changes. Renders nothing.
 */
export function PageViewTracker() {
  const location = useLocation();
  const { trackEvent } = useTracking();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid duplicate on mount with same path
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    trackEvent({
      eventType: 'page_view',
      eventName: location.pathname,
    });
  }, [location.pathname, trackEvent]);

  return null;
}

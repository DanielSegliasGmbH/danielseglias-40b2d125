// Web Push helpers: registration, subscription, opt-in/opt-out.
import { supabase } from '@/integrations/supabase/client';

export const VAPID_PUBLIC_KEY =
  'BO8_FVycA7kj4PHZyI3x6dICoZWNCItfyjxxXNa0mN6M78Yg42IQUeCa-98U4jhucGUptebSjFDLqSfr4AFryQc';

export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function isLovablePreviewHost(): boolean {
  const h = window.location.hostname;
  return h.includes('id-preview--') || h.includes('lovableproject.com');
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

/** Push on iOS only works after the user added the PWA to the home screen (iOS 16.4+). */
export function iOSRequiresInstall(): boolean {
  return isIOS() && !isStandalone();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  // Never register inside the Lovable editor preview / iframes.
  if (isInIframe() || isLovablePreviewHost()) {
    // Defensive cleanup of any prior registration.
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      regs.forEach((r) => r.unregister());
    } catch {/* ignore */}
    return null;
  }
  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((e) => {
        console.warn('SW registration failed', e);
        return null as any;
      });
  }
  return registrationPromise;
}

export async function getCurrentPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export async function subscribeToPush(): Promise<{
  ok: boolean;
  reason?: string;
}> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };
  if (iOSRequiresInstall()) return { ok: false, reason: 'ios-needs-install' };

  const reg = await ensureServiceWorker();
  if (!reg) return { ok: false, reason: 'no-sw' };

  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, reason: 'denied' };

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer,
    });
  }

  const json = sub.toJSON() as any;
  const endpoint = json.endpoint as string;
  const p256dh = json.keys?.p256dh as string;
  const auth = json.keys?.auth as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'no-user' };

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      last_used_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,endpoint' },
  );
  if (error) {
    console.error('push subscription upsert failed', error);
    return { ok: false, reason: 'db-error' };
  }
  return { ok: true };
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await ensureServiceWorker();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return true;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);
  }
  return true;
}

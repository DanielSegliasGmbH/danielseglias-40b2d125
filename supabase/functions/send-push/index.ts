// Edge Function: send-push
// Sends a Web Push notification (VAPID) to one user, multiple users, or all admins.
// Body: { user_id?: string, user_ids?: string[], broadcast_to_admins?: boolean,
//         title: string, body: string, url?: string, tag?: string, icon?: string }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const VAPID_PUBLIC_KEY =
  'BO8_FVycA7kj4PHZyI3x6dICoZWNCItfyjxxXNa0mN6M78Yg42IQUeCa-98U4jhucGUptebSjFDLqSfr4AFryQc';

function clean(v: string | undefined): string {
  if (!v) return '';
  return v.trim().replace(/^["']|["']$/g, '');
}

function sanitizeSubject(raw: string): string {
  const fallback = 'mailto:notifications@finlife.app';
  if (!raw) return fallback;
  if (/^mailto:.+@.+\..+/i.test(raw)) return raw;
  if (/^https?:\/\/.+/i.test(raw)) return raw;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return `mailto:${raw}`;
  return fallback;
}

let vapidReady = false;
function initVapid(): { ok: boolean; err?: string } {
  if (vapidReady) return { ok: true };
  const priv = clean(Deno.env.get('VAPID_PRIVATE_KEY'));
  const subj = sanitizeSubject(clean(Deno.env.get('VAPID_SUBJECT')));
  console.log('VAPID init', { subj, privLen: priv.length, pubLen: VAPID_PUBLIC_KEY.length });
  try {
    webpush.setVapidDetails(subj, VAPID_PUBLIC_KEY, priv);
    vapidReady = true;
    return { ok: true };
  } catch (e: any) {
    return { ok: false, err: e?.message ?? String(e) };
  }
}

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

interface Sub {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { title, body, url, tag, icon } = payload;
    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resolve recipient user_ids
    let userIds: string[] = [];
    if (Array.isArray(payload.user_ids)) userIds.push(...payload.user_ids);
    if (payload.user_id) userIds.push(payload.user_id);
    if (payload.broadcast_to_admins) {
      const { data: admins } = await admin
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'staff']);
      if (admins) userIds.push(...admins.map((a) => a.user_id));
    }
    userIds = [...new Set(userIds.filter(Boolean))];
    if (userIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, note: 'no recipients' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: subs, error } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth, user_id')
      .in('user_id', userIds);
    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notification = JSON.stringify({
      title,
      body,
      url: url ?? '/',
      tag: tag ?? 'default',
      icon: icon ?? '/icon-192.png',
      badge: '/icon-192.png',
    });

    let sent = 0;
    let removed = 0;
    await Promise.all(
      (subs as Sub[]).map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            notification,
          );
          sent++;
        } catch (err: any) {
          // 404/410 => stale subscription, drop it
          const status = err?.statusCode;
          if (status === 404 || status === 410) {
            await admin.from('push_subscriptions').delete().eq('id', s.id);
            removed++;
          } else {
            console.error('push error', status, err?.body ?? err?.message);
          }
        }
      }),
    );

    return new Response(JSON.stringify({ ok: true, sent, removed, total: subs.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('send-push fatal', e);
    return new Response(JSON.stringify({ error: e.message ?? 'internal' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const PREMIUM_PRODUCT_ID = 'prod_UHHe0XzesVjkbW';
export const PREMIUM_PRICE_ID = 'price_1TIj4zCFx0DqwoOsdPk6cONR';

interface SubscriptionState {
  isPremium: boolean;
  isLoading: boolean;
  subscriptionEnd: string | null;
}

// TEMPORARY: All users get premium access for v1.0 beta.
// Restore actual subscription logic after Stripe integration is ready.
const OVERRIDE_ALL_AS_PREMIUM = true;

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isPremium: OVERRIDE_ALL_AS_PREMIUM ? true : false,
    isLoading: OVERRIDE_ALL_AS_PREMIUM ? false : true,
    subscriptionEnd: null,
  });

  const checkSubscription = useCallback(async () => {
    if (OVERRIDE_ALL_AS_PREMIUM) {
      setState({ isPremium: true, isLoading: false, subscriptionEnd: null });
      return;
    }
    if (!user) {
      setState({ isPremium: false, isLoading: false, subscriptionEnd: null });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      setState({
        isPremium: data?.subscribed === true,
        isLoading: false,
        subscriptionEnd: data?.subscription_end || null,
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    if (OVERRIDE_ALL_AS_PREMIUM) return;
    checkSubscription();
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const startCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening portal:', err);
    }
  };

  return {
    ...state,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
  };
}

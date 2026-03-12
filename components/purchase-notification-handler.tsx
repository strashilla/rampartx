'use client';

import { useEffect } from 'react';
import { usePurchaseNotifications } from '@/hooks/use-purchase-notifications';

interface PurchaseNotificationHandlerProps {
  orderId: string;
  lotTitle: string;
  onPurchaseComplete?: () => void;
}

export function PurchaseNotificationHandler({ 
  orderId, 
  lotTitle, 
  onPurchaseComplete 
}: PurchaseNotificationHandlerProps) {
  const { triggerOrderPaymentSuccess } = usePurchaseNotifications();

  useEffect(() => {
    // Trigger the notification when the component mounts
    if (orderId && lotTitle) {
      triggerOrderPaymentSuccess({ orderId, lotTitle });
      
      // Call the optional callback
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
    }
  }, [orderId, lotTitle, onPurchaseComplete, triggerOrderPaymentSuccess]);

  return null; // This component doesn't render anything
}
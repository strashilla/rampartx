import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * Custom hook to handle purchase-related notifications
 */
export function usePurchaseNotifications() {
  useEffect(() => {
    // Listen for purchase events and show toast notifications
    const handlePurchaseEvent = (event: CustomEvent) => {
      const { title, message } = event.detail;
      
      toast({
        title: title || 'Покупка завершена',
        description: message || 'Ваша покупка была успешно оформлена',
        duration: 5000,
      });
      
      // Trigger notification update event to refresh the header
      const updateEvent = new CustomEvent('notification-update');
      document.dispatchEvent(updateEvent);
    };

    // Listen for order payment success events
    const handleOrderPaymentSuccess = (event: CustomEvent) => {
      const { orderId, lotTitle } = event.detail;
      
      toast({
        title: 'Покупка завершена',
        description: `Вы успешно приобрели "${lotTitle}". Заказ №${orderId} оплачен.`,
        duration: 5000,
      });
      
      // Trigger notification update event to refresh the header
      const updateEvent = new CustomEvent('notification-update');
      document.dispatchEvent(updateEvent);
    };

    // Listen for sale notifications (for sellers)
    const handleSaleNotification = (event: CustomEvent) => {
      const { orderId, lotTitle } = event.detail;
      
      toast({
        title: 'Товар продан',
        description: `Ваш товар "${lotTitle}" был продан. Заказ №${orderId} оплачен.`,
        duration: 5000,
      });
      
      // Trigger notification update event to refresh the header
      const updateEvent = new CustomEvent('notification-update');
      document.dispatchEvent(updateEvent);
    };

    document.addEventListener('purchase-event', handlePurchaseEvent as EventListener);
    document.addEventListener('order-payment-success', handleOrderPaymentSuccess as EventListener);
    document.addEventListener('sale-notification', handleSaleNotification as EventListener);

    return () => {
      document.removeEventListener('purchase-event', handlePurchaseEvent as EventListener);
      document.removeEventListener('order-payment-success', handleOrderPaymentSuccess as EventListener);
      document.removeEventListener('sale-notification', handleSaleNotification as EventListener);
    };
  }, []);

  // Function to trigger a purchase event
  const triggerPurchaseEvent = (detail: { title?: string; message?: string }) => {
    const event = new CustomEvent('purchase-event', { detail });
    document.dispatchEvent(event);
  };

  // Function to trigger an order payment success event
  const triggerOrderPaymentSuccess = (detail: { orderId: string; lotTitle: string }) => {
    const event = new CustomEvent('order-payment-success', { detail });
    document.dispatchEvent(event);
  };

  // Function to trigger a sale notification event
  const triggerSaleNotification = (detail: { orderId: string; lotTitle: string }) => {
    const event = new CustomEvent('sale-notification', { detail });
    document.dispatchEvent(event);
  };

  return {
    triggerPurchaseEvent,
    triggerOrderPaymentSuccess,
    triggerSaleNotification
  };
}

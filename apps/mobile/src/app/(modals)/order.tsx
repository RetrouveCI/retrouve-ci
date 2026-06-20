import { OrderFlow } from '@/features/order/OrderFlow';

/** Sticker order flow modal: Pack → Livraison → Paiement → Confirmé. */
export default function OrderModal() {
  return <OrderFlow />;
}

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailure {
  error: { description: string };
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string };
  theme?: { color: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', cb: (res: RazorpayFailure) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export class CheckoutCancelled extends Error {
  constructor() {
    super('Payment cancelled');
  }
}

export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const openCheckout = (
  opts: Omit<RazorpayOptions, 'handler' | 'modal'>
): Promise<RazorpaySuccess> =>
  new Promise((resolve, reject) => {
    if (!window.Razorpay) return reject(new Error('Payment gateway not loaded'));

    const rzp = new window.Razorpay({
      ...opts,
      handler: resolve,
      modal: { ondismiss: () => reject(new CheckoutCancelled()) },
    });
    rzp.on('payment.failed', (res) => reject(new Error(res.error.description)));
    rzp.open();
  });
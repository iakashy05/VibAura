import React, { useState } from 'react';
import Button from '../components/ui/button';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { createRazorpayOrder } from '../services/paymentService';

const loadRazorpayScript = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    return resolve(true);
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
  document.body.appendChild(script);
});

const Payment = ({ navigateTo }) => {
  const { user, setSubscribed } = useAuthStore();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onPayNow = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await loadRazorpayScript();
      const orderData = await createRazorpayOrder();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VibAura',
        description: 'Subscription ₹10',
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || 'VibAura User',
          email: user?.email || '',
        },
        theme: {
          color: '#6D28D9',
        },
        handler: (response) => {
          setSubscribed(true);
          showToast('You are a subscribed user', 'success');
          setMessage(`Subscription successful! Payment ID: ${response.razorpay_payment_id}`);
          if (navigateTo) {
            navigateTo('home');
          }
        },
        modal: {
          ondismiss: () => {
            setMessage('Subscription cancelled.');
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(err?.message || 'Unable to start the payment flow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 rounded-3xl bg-vibaura-primary/10 text-vibaura-primary flex items-center justify-center text-xs font-black px-2 text-center leading-none">
              Subscribe
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-vibaura-primary/80 font-black">VibAura Subscription</p>
              <h1 className="text-3xl font-black text-text-primary mt-1">Subscribe for ₹10</h1>
            </div>
          </div>

          <div className="rounded-[28px] bg-vibaura-surface p-6 border border-vibaura-border">
            <p className="text-sm text-text-secondary leading-relaxed">
              Subscribe to VibAura for ₹10/month with secure Razorpay checkout. Click the button below to open the subscription payment gateway.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] items-center">
              <div className="rounded-3xl bg-white p-5 border border-black/5 shadow-sm">
                <p className="text-xs uppercase text-text-muted tracking-[0.3em]">Subscription fee</p>
                <p className="text-3xl font-black text-text-primary mt-2">₹10</p>
              </div>

              <Button onClick={onPayNow} className="w-full sm:w-auto" disabled={loading}>
                {loading ? 'Loading...' : 'Subscribe'}
              </Button>
            </div>
          </div>

          {message && (
            <div className="rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-4">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-3xl bg-rose-50 border border-rose-200 text-rose-700 p-4">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;

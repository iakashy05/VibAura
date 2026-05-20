import React, { useState } from 'react';
import Button from '../components/ui/button';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/paymentService';

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
  const { user, setSubscribed, updateUser } = useAuthStore();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const closePayment = () => {
    if (navigateTo) navigateTo('home');
    else window.history.back();
  };

  const onPayNow = async () => {
    setLoading(true);
    setError('');

    try {
      await loadRazorpayScript();
      const orderData = await createRazorpayOrder();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VibAura Premium',
        description: 'Monthly Subscription',
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#6D28D9',
        },
        handler: async (response) => {
          try {
            setVerifying(true);
            const result = await verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (result.success) {
              setSubscribed(true);
              updateUser(result.user);
              setSuccessData({
                paymentId: response.razorpay_payment_id,
                amount: orderData.amount / 100,
                date: new Date().toLocaleDateString(),
              });
              showToast('Subscription active!', 'success');
            }
          } catch (err) {
            setError('Verification failed. Please contact support.');
          } finally {
            setVerifying(false);
          }
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled', 'info');
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to start the payment flow.');
    } finally {
      setLoading(false);
    }
  };

  const SuccessView = () => (
    <div className="min-h-[350px] h-full flex flex-col items-center justify-center p-4 md:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-text-primary">You're Pro!</h2>
        <p className="text-sm text-text-secondary">Welcome to VibAura Premium.</p>
      </div>
      <div className="w-full max-w-xs bg-white rounded-2xl p-5 border border-black/5 space-y-3 text-left">
        <div className="flex justify-between items-center pb-2 border-b border-black/5">
          <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Ref ID</span>
          <span className="text-xs font-mono font-medium text-text-primary">{successData.paymentId.slice(-10)}</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Paid</span>
          <span className="text-base font-black text-text-primary">₹{successData.amount}.00</span>
        </div>
      </div>
      <Button onClick={closePayment} className="w-full max-w-xs h-12 text-base rounded-xl">
        Start Listening
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-[#0a0a14]/60 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={closePayment}
      />

      <div className="relative w-full max-w-[420px] md:max-w-[750px] h-auto max-h-[90vh] md:h-[480px] bg-vibaura-surface rounded-[24px] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col border border-white/10">
        
        {/* Close Button */}
        <button 
          onClick={closePayment}
          className="absolute top-5 right-5 z-[60] w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-text-primary flex items-center justify-center transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex-1 p-6 pt-14 md:p-10 overflow-y-auto md:overflow-visible no-scrollbar">
          {successData ? (
            <SuccessView />
          ) : (
            <div className="min-h-full md:h-full relative">
              {verifying && (
                <div className="absolute inset-0 z-50 bg-vibaura-surface/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300 rounded-[20px]">
                  <div className="w-10 h-10 border-4 border-vibaura-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-lg font-black text-text-primary">Verifying Payment...</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center min-h-full">
                {/* Left: Branding & Offer */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vibaura-primary/10 text-vibaura-primary text-[10px] font-black tracking-widest uppercase">
                      Limited Time Offer
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-text-primary leading-tight">
                      Elevate your <span className="text-vibaura-primary">Vibe</span>
                    </h1>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Experience music like never before. Ad-free, high-fidelity audio, and exclusive content.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {[
                      { icon: '🚫', text: 'Zero advertisements' },
                      { icon: '🎧', text: 'High-fidelity audio' },
                      { icon: '✨', text: 'Exclusive badges' },
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-[16px] bg-white border border-black/5 shadow-sm">
                        <span className="text-xl">{feature.icon}</span>
                        <span className="font-bold text-text-primary text-xs">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Checkout Card */}
                <div className="bg-white rounded-[24px] border border-black/5 shadow-xl p-6 md:p-8 space-y-5 md:space-y-6 h-auto md:h-full flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="pb-4 border-b border-black/5">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black mb-1">Order Summary</p>
                      <div className="flex justify-between items-end">
                        <h2 className="text-xl font-black text-text-primary">Monthly</h2>
                        <div className="text-right">
                          <span className="text-xs text-text-muted line-through mr-1.5">₹199</span>
                          <span className="text-2xl font-black text-vibaura-primary">₹10</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Subscription</span>
                        <span className="text-text-primary font-bold">₹10.00</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Tax</span>
                        <span className="text-emerald-500 font-bold">Included</span>
                      </div>
                      <div className="pt-4 flex justify-between items-center border-t border-black/5">
                        <span className="text-sm font-black text-text-primary uppercase tracking-tighter">Total Amount</span>
                        <span className="text-2xl font-black text-text-primary">₹10.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={onPayNow} 
                      className="w-full h-14 text-base font-black uppercase tracking-widest shadow-lg shadow-vibaura-primary/20 rounded-xl" 
                      disabled={loading || verifying}
                    >
                      {loading ? 'Initializing...' : 'Secure Checkout'}
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-[0.1em]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      SSL Encrypted Payment
                    </div>

                    {error && (
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold text-center">
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;

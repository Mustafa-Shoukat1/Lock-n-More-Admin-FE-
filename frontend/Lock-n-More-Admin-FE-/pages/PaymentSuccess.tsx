import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order_id');

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-slate-950 text-white">
      <div className="w-full max-w-xl rounded-[2.5rem] border border-emerald-500/20 bg-white/5 backdrop-blur-xl p-8 sm:p-12 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Payment Confirmed</h1>
        <p className="text-slate-400 mt-4 text-sm sm:text-base">
          Your Stripe checkout completed successfully.
          {orderId ? ` Order #${orderId} is now processing.` : ' Your order is now processing.'}
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-8 inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-brand text-white font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all"
        >
          View Orders <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
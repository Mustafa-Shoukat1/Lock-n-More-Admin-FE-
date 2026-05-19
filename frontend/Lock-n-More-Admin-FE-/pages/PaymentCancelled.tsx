import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-slate-950 text-white">
      <div className="w-full max-w-xl rounded-[2.5rem] border border-slate-800 bg-white/5 backdrop-blur-xl p-8 sm:p-12 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-6">
          <XCircle size={36} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Payment Cancelled</h1>
        <p className="text-slate-400 mt-4 text-sm sm:text-base">
          The checkout was cancelled. You can return to the inbox and generate a new payment link anytime.
        </p>
        <button
          onClick={() => navigate('/inbox')}
          className="mt-8 inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 text-slate-900 font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all"
        >
          Back to Inbox <ArrowLeft size={16} />
        </button>
      </div>
    </div>
  );
};

export default PaymentCancelled;
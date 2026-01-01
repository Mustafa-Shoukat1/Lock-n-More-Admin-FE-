import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, MoreHorizontal, Download, ArrowUpRight, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '../App';

const Orders: React.FC = () => {
  const { searchQuery } = useApp();
  const [orders] = useState([
    { id: '#TOTO-1024', customer: 'Beh Chen', status: 'fulfilled', amount: 1299.00, date: 'Today, 10:45 AM', platform: 'whatsapp' },
    { id: '#TOTO-1023', customer: 'Sarah Lim', status: 'pending', amount: 899.00, date: 'Today, 09:15 AM', platform: 'instagram' },
    { id: '#TOTO-1022', customer: 'Ahmad Faiz', status: 'processing', amount: 2450.00, date: 'Yesterday', platform: 'tiktok' },
    { id: '#TOTO-1021', customer: 'Jasmine Wong', status: 'fulfilled', amount: 1299.00, date: 'Yesterday', platform: 'whatsapp' },
    { id: '#TOTO-1020', customer: 'Kumar Raj', status: 'pending', amount: 599.00, date: 'Yesterday', platform: 'instagram' },
    { id: '#TOTO-1019', customer: 'Melissa Tan', status: 'fulfilled', amount: 1899.00, date: '2 days ago', platform: 'tiktok' },
    { id: '#TOTO-1018', customer: 'David Lee', status: 'processing', amount: 6495.00, date: '2 days ago', platform: 'whatsapp' },
    { id: '#TOTO-1017', customer: 'Zurina Ismail', status: 'pending', amount: 299.00, date: '3 days ago', platform: 'instagram' },
    { id: '#TOTO-1016', customer: 'Ali Hamza', status: 'fulfilled', amount: 150.00, date: '3 days ago', platform: 'whatsapp' },
    { id: '#TOTO-1015', customer: 'Wong S.H.', status: 'fulfilled', amount: 2199.00, date: '4 days ago', platform: 'instagram' },
  ]);

  const filteredOrders = orders.filter(o => 
    o.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-12 space-y-10 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold font-outfit tracking-tighter">Shopify Flow</h1>
          <p className="text-slate-500 font-medium">Real-time e-commerce synchronization node.</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none px-8 py-4 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OrderStats label="Total Processed" value="RM 58,540" icon={<ShoppingCart size={20} />} color="text-brand bg-brand/10" />
        <OrderStats label="Conversion Hub" value="21.2%" icon={<ArrowUpRight size={20} />} color="text-emerald-500 bg-emerald-500/10" />
        <OrderStats label="Secure Nodes" value="100% Verified" icon={<ShieldCheck size={20} />} color="text-purple-500 bg-purple-500/10" />
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold font-mono text-brand">{order.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold font-outfit">{order.customer}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{order.platform}</p>
                  </td>
                  <td className="px-8 py-6 font-black font-outfit">RM {order.amount.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OrderStats = ({ label, value, icon, color }: any) => (
  <div className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
    <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold font-outfit">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: any) => {
  const styles = {
    fulfilled: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };
  return (
    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
};

export default Orders;
import React, { useState } from 'react';
import { Search, Plus, RefreshCw, X, CloudSync, Edit2, Trash2, Package, CheckCircle2, ImagePlus, Box } from 'lucide-react';
import { useApp } from '../App';

const Products: React.FC = () => {
  const { products, setProducts, setNotifications } = useApp();
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSKU, setNewSKU] = useState('');

  const triggerSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setNotifications(prev => [{ id: Date.now(), title: 'Shopify Synced', message: 'Catalog node updated successfully.', type: 'system', time: 'Just now', read: false }, ...prev]);
          return 100;
        }
        return p + 20;
      });
    }, 300);
  };

  const handleManualAdd = () => {
    if (!newTitle || !newPrice) return;
    const newProd = { 
      id: Date.now().toString(), 
      name: newTitle, 
      price: parseFloat(newPrice), 
      stock: 50, 
      category: 'Manual', 
      sku: newSKU || 'SKU-NODE', 
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200' 
    };
    setProducts([newProd, ...products]);
    setShowModal(false);
    setNewTitle(''); setNewPrice(''); setNewSKU('');
  };

  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 md:p-12 space-y-10 max-w-7xl mx-auto pb-32">
      <div className="bg-white dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold font-outfit tracking-tighter">Inventory Hub</h1>
          <p className="text-slate-500">Manage perimeter products and deploy Shopify logic nodes.</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <button onClick={triggerSync} className="flex-1 lg:flex-none px-8 py-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2">
            <CloudSync size={18} /> Sync Shopify
          </button>
          <button onClick={() => setShowModal(true)} className="flex-1 lg:flex-none px-8 py-4 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2">
            <Plus size={18} /> Add Node
          </button>
        </div>
      </div>

      {isSyncing && (
        <div className="bg-brand/5 border border-brand/20 p-10 rounded-[3rem] space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-brand uppercase tracking-widest">Merging Perimeter Entities...</p>
            <span className="text-lg font-black text-brand font-outfit">{syncProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden p-0.5">
            <div className="bg-brand h-full rounded-full" style={{ width: `${syncProgress}%` }}></div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search catalog intelligence..." 
              className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:border-brand" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Node</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Logic</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <img src={p.image} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-bold font-outfit">{p.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-1 uppercase">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6"><span className="text-base font-black font-outfit text-brand">RM {p.price.toLocaleString()}</span></td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] font-black uppercase">{p.stock} Units</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-brand"><Edit2 size={16} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80">
          <div className="bg-surface dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800">
             <div className="flex items-center justify-between mb-10">
               <h2 className="text-2xl font-bold font-outfit">Manual Item Node</h2>
               <button onClick={() => setShowModal(false)} className="p-2 text-slate-400"><X size={28}/></button>
             </div>
             <div className="space-y-6">
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Node Name" className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="RM Price" className="p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold" />
                  <input type="text" value={newSKU} onChange={(e) => setNewSKU(e.target.value)} placeholder="SKU Node" className="p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold uppercase" />
                </div>
                <button onClick={handleManualAdd} className="w-full py-5 bg-brand text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3"><CheckCircle2 size={20} /> Deploy Node</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
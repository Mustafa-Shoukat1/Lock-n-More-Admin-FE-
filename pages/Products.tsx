import React, { useState } from 'react';
import { Search, Plus, RefreshCw, X, Globe, Table, Wand2, CheckCircle2, Trash2, Edit2, Package, ImagePlus } from 'lucide-react';
import { useApp } from '../App';

const Products: React.FC = () => {
  const { t, products, setProducts } = useApp();
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  
  // New Product States
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSKU, setNewSKU] = useState('');

  const simulateProgress = (callback: () => void) => {
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          callback();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleManualAdd = () => {
    if (!newTitle || !newPrice) return;
    const newProd = {
      id: Date.now().toString(),
      name: newTitle,
      price: parseFloat(newPrice),
      stock: 50,
      category: 'Manual',
      sku: newSKU || 'MAN-X',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200'
    };
    setProducts([newProd, ...products]);
    setShowModal(false);
    setNewTitle('');
    setNewPrice('');
    setNewSKU('');
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit">Product Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Sync and manage your smart lock inventory.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={() => setShowScrapeModal(true)} className="flex-1 sm:flex-none px-4 py-3 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-600 shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all">
            <Globe size={16} /> Scrape Web
          </button>
          <button onClick={() => setShowModal(true)} className="flex-1 sm:flex-none px-6 py-3 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/20 flex items-center justify-center gap-2 transition-all">
            <Plus size={16} /> {t('addProduct')}
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="bg-brand/5 border border-brand/20 p-6 rounded-[2rem] space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw size={20} className="text-brand animate-spin" />
              <p className="text-xs font-black text-brand uppercase tracking-widest">{syncStatus}</p>
            </div>
            <span className="text-xs font-black text-brand">{syncProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-brand h-full transition-all duration-300 shadow-[0_0_8px_rgba(37,99,235,0.5)]" style={{ width: `${syncProgress}%` }}></div>
          </div>
        </div>
      )}

      <div className="bg-surface dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or SKU..." 
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand font-medium transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Entity</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img src={p.image} className="w-14 h-14 rounded-2xl bg-slate-100 object-cover shadow-sm group-hover:scale-105 transition-transform" alt={p.name} />
                        <div className="absolute -top-1 -right-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-md">
                           <Package size={10} className="text-brand" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-brand transition-colors leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tight">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-slate-900 dark:text-white font-outfit">RM {p.price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{p.stock} Units</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2.5 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800">
             <div className="flex items-center justify-between mb-10">
               <h2 className="text-3xl font-bold font-outfit dark:text-white">New Product Item</h2>
               <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={28}/></button>
             </div>
             
             <div className="space-y-8">
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 hover:border-brand/40 transition-all cursor-pointer group">
                   <div className="w-16 h-16 bg-brand/10 text-brand rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                      <ImagePlus size={32} />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop Product Visuals</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Item Name</label>
                      <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold dark:text-white" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Unit Price (RM)</label>
                      <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold dark:text-white" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System SKU</label>
                      <input type="text" value={newSKU} onChange={(e) => setNewSKU(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold dark:text-white uppercase" />
                   </div>
                </div>

                <button 
                  onClick={handleManualAdd}
                  className="w-full py-5 bg-brand text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <CheckCircle2 size={22} /> Deploy To Catalog
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
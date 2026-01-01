import React, { useState } from 'react';
import { Search, Plus, RefreshCw, X, CloudSync, Edit2, Trash2, CheckCircle2, Database, Table, Globe } from 'lucide-react';
import { useApp } from '../App';

type SyncSource = 'shopify' | 'sheets' | 'kb';

const Products: React.FC = () => {
  const { products, setProducts, setNotifications } = useApp();
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [syncSource, setSyncSource] = useState<SyncSource>('shopify');
  
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSKU, setNewSKU] = useState('');

  const triggerSync = (source: SyncSource) => {
    setSyncSource(source);
    setIsSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setNotifications(prev => [{ 
            id: Date.now(), 
            title: `${source.toUpperCase()} Synced`, 
            message: `Inventory perimeter updated via ${source.toUpperCase()} node.`, 
            type: 'system', 
            time: 'Just now', 
            read: false 
          }, ...prev]);
          return 100;
        }
        return p + 20;
      });
    }, 250);
  };

  const handleManualAdd = () => {
    if (!newTitle || !newPrice) return;
    const newProd = { 
      id: Date.now().toString(), 
      name: newTitle, 
      price: parseFloat(newPrice), 
      stock: 50, 
      category: 'Manual Node', 
      sku: newSKU || 'SKU-NEW', 
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
      {/* Product Header */}
      <div className="bg-white dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 shadow-sm relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <h1 className="text-4xl font-bold font-outfit tracking-tighter uppercase">Inventory Perimeter</h1>
          <p className="text-slate-500 font-medium">Manage cross-platform products and sync sources.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto relative z-10">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
             <SyncOption icon={<CloudSync size={16}/>} label="Shopify" active={!isSyncing} onClick={() => triggerSync('shopify')} />
             <SyncOption icon={<Table size={16}/>} label="Sheets" active={!isSyncing} onClick={() => triggerSync('sheets')} />
             <SyncOption icon={<Database size={16}/>} label="KB" active={!isSyncing} onClick={() => triggerSync('kb')} />
          </div>
          <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-brand/20 hover:scale-105 transition-all">
            <Plus size={18} /> New Item
          </button>
        </div>
      </div>

      {isSyncing && (
        <div className="bg-brand/5 border border-brand/20 p-10 rounded-[3rem] space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-brand uppercase tracking-widest flex items-center gap-3">
              <RefreshCw className="animate-spin" size={18} /> Syncing from {syncSource.toUpperCase()} Node...
            </p>
            <span className="text-2xl font-black text-brand font-outfit">{syncProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-brand h-full transition-all duration-300" style={{ width: `${syncProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* Catalog Table */}
      <div className="bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 flex items-center">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search catalog by node or SKU..." 
              className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:border-brand font-medium" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Node</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Node</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
              {filtered.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 group transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                         <img src={p.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold font-outfit">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black font-outfit text-brand text-base">RM {p.price.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <SourceBadge source={idx % 3 === 0 ? 'shopify' : (idx % 3 === 1 ? 'sheets' : 'kb')} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Manual Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-surface dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-10">
               <h2 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Manual Node Deployment</h2>
               <button onClick={() => setShowModal(false)} className="p-2 text-slate-400"><X size={28}/></button>
             </div>
             <div className="space-y-6">
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Node Label (Product Name)" className="w-full p-5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold text-sm" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="Price (RM)" className="p-5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold text-sm" />
                  <input type="text" value={newSKU} onChange={(e) => setNewSKU(e.target.value)} placeholder="SKU Node" className="p-5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold text-sm uppercase" />
                </div>
                <button onClick={handleManualAdd} className="w-full py-6 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-brand/30 hover:scale-[1.02] transition-all">
                  <CheckCircle2 size={20} /> Authorize Node
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SyncOption = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    disabled={!active}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-brand' : 'opacity-30'}`}
  >
    {icon} {label}
  </button>
);

const SourceBadge = ({ source }: { source: SyncSource }) => {
  const configs = {
    shopify: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <CloudSync size={10}/> },
    sheets: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: <Table size={10}/> },
    kb: { color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: <Globe size={10}/> },
  };
  const config = configs[source];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${config.color}`}>
      {config.icon} {source}
    </span>
  );
};

export default Products;
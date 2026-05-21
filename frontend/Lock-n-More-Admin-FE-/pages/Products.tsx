
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, RefreshCw, X, CloudSync, Edit2, ShoppingCart, Tag, BarChart, CheckCircle, Table, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useApp } from '../App';
import { Product } from '../types';

type SyncSource = 'shopify' | 'sheets' | 'kb';

const Products: React.FC = () => {
  const { products, setProducts, setNotifications, syncCatalog, addLog } = useApp();
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('0');
  const [newProductSKU, setNewProductSKU] = useState('');
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const triggerSyncNode = (source: SyncSource) => {
    setIsSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          syncCatalog();
          setNotifications(prev => [{ id: Date.now(), title: `${source.toUpperCase()} Synced`, message: `Inventory perimeter updated.`, type: 'system', time: 'Just now', read: false }, ...prev]);
          return 100;
        }
        return p + 25;
      });
    }, 120);
  };

  const handleAddProduct = () => {
    if (!newProductName || !newProductSKU) return;
    const newP: Product = {
      id: Date.now().toString(),
      name: newProductName,
      price: parseFloat(newProductPrice),
      sku: newProductSKU,
      category: 'General',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400',
      salesCount: 0
    };
    setProducts([...products, newP]);
    addLog('success', `Manually deployed SKU node: ${newProductSKU}.`);
    setShowModal(false);
    setNewProductName('');
    setNewProductSKU('');
    setNewProductPrice('0');
  };

  const deleteProduct = (id: string) => {
    if (confirm("Permanently decommission this SKU node from the perimeter?")) {
      const p = products.find(prod => prod.id === id);
      setProducts(products.filter(prod => prod.id !== id));
      addLog('warning', `SKU Node ${p?.sku} decommissioned.`);
      setSelectedProduct(null);
    }
  };

  const filteredCatalog = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesStock = stockFilter === 'all' || (stockFilter === 'in' ? p.stock > 0 : p.stock === 0);
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesStock && matchesPrice;
    });
  }, [products, search, activeCategory, stockFilter, priceRange]);

  // Fixed: Use explicit generic for Set to ensure correctly typed array from Array.from and avoid 'unknown' type error
  const categories: string[] = ['all', ...Array.from(new Set<string>(products.map(p => p.category.toLowerCase())))];

  return (
    <div className="p-6 md:p-12 space-y-10 max-w-7xl mx-auto pb-32 text-left">
      <div className="bg-white dark:bg-slate-950 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 shadow-sm relative overflow-hidden text-left">
        <div className="space-y-3 relative z-10">
          <h1 className="text-4xl font-bold font-outfit tracking-tighter uppercase leading-none">Inventory Perimeter</h1>
          <p className="text-slate-500 font-medium">Manage TOTO sales nodes and catalog intelligence sync.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto relative z-10">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
             <SyncBtn icon={<CloudSync size={16}/>} label="Shopify" onClick={() => triggerSyncNode('shopify')} />
             <SyncBtn icon={<Table size={16}/>} label="Sheets" onClick={() => triggerSyncNode('sheets')} />
          </div>
          <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-brand/20 hover:scale-105 transition-all">
            <Plus size={18} /> Deploy SKU Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left">
        <div className="xl:col-span-2 relative">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SKUs or Product Labels..." className="w-full pl-16 pr-6 py-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-sm outline-none focus:border-brand font-medium shadow-sm transition-all" />
        </div>
        <div className="flex gap-4">
           <select value={stockFilter} onChange={(e)=>setStockFilter(e.target.value as any)} className="flex-1 px-6 py-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest outline-none shadow-sm"><option value="all">Any Availability</option><option value="in">In Stock</option><option value="out">Out of Stock</option></select>
           <select value={activeCategory} onChange={(e)=>setActiveCategory(e.target.value)} className="flex-1 px-6 py-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest outline-none shadow-sm">{categories.map(c => <option key={c} value={c}>Category: {c.toUpperCase()}</option>)}</select>
        </div>
        <div className="px-8 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] flex flex-col justify-center shadow-sm">
           <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-2"><span>Price Ceiling</span> <span>RM {priceRange[1]}</span></div>
           <input type="range" min="0" max="5000" step="100" value={priceRange[1]} onChange={(e)=>setPriceRange([0, Number(e.target.value)])} className="w-full accent-brand h-1.5 rounded-full" />
        </div>
      </div>

      {isSyncing && (
        <div className="bg-brand/5 border border-brand/20 p-10 rounded-[3rem] space-y-4 animate-in slide-in-from-top text-left">
          <div className="flex items-center justify-between"><p className="text-xs font-black text-brand uppercase tracking-widest flex items-center gap-3"><RefreshCw className="animate-spin" size={16} /> Syncing Intelligence Hub...</p><span className="text-xl font-black text-brand">{syncProgress}%</span></div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden"><div className="bg-brand h-full" style={{ width: `${syncProgress}%` }}></div></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredCatalog.map((p, idx) => (
          <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 group cursor-pointer hover:border-brand transition-all shadow-sm hover:shadow-xl text-left">
            <div className="relative mb-6 overflow-hidden rounded-[2rem]"><img src={p.image} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" /></div>
            <div className="space-y-4">
              <div className="flex justify-between items-start"><div className="min-w-0"><h3 className="text-lg font-bold font-outfit truncate">{p.name}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{p.sku}</p></div><p className="text-lg font-black font-outfit text-brand">RM {p.price}</p></div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div><span className="text-[10px] font-black text-slate-500 uppercase">{p.stock > 0 ? `${p.stock} Units` : 'Out of Stock'}</span></div><div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={14}/></div></div>
            </div>
          </div>
        ))}
      </div>

      {/* Deploy SKU Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter">New SKU Deployment</h3><button onClick={() => setShowModal(false)}><X size={32}/></button></div>
             <div className="space-y-6">
                <input type="text" value={newProductName} onChange={(e)=>setNewProductName(e.target.value)} placeholder="Product Name" className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold" />
                <input type="text" value={newProductSKU} onChange={(e)=>setNewProductSKU(e.target.value)} placeholder="SKU Node ID" className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold" />
                <div className="flex gap-4">
                   <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border-none"><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Price RM</p><input type="number" value={newProductPrice} onChange={(e)=>setNewProductPrice(e.target.value)} className="w-full bg-transparent text-2xl font-black outline-none" /></div>
                   <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800"><ImageIcon size={24}/></div>
                </div>
                <button onClick={handleAddProduct} className="w-full py-6 bg-brand text-white text-[11px] font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-brand/40">Authorize Node Release</button>
             </div>
           </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col md:flex-row text-left">
             <div className="w-full md:w-1/2 relative h-80 md:h-auto"><img src={selectedProduct.image} className="w-full h-full object-cover" /></div>
             <div className="w-full md:w-1/2 p-12 space-y-10">
                <div className="flex items-center justify-between">
                  <span className="px-5 py-2 bg-brand/10 text-brand rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{selectedProduct.category}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => deleteProduct(selectedProduct.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={24}/></button>
                    <button onClick={() => setSelectedProduct(null)} className="p-2 text-slate-400 hover:text-brand transition-all hover:scale-110"><X size={32}/></button>
                  </div>
                </div>
                <div><h2 className="text-4xl font-bold font-outfit tracking-tighter leading-none">{selectedProduct.name}</h2><p className="text-slate-400 text-sm font-bold mt-4">Authorized Node SKU: {selectedProduct.sku}</p></div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-slate-800"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Tag size={14}/> Node Price</p><p className="text-3xl font-black font-outfit text-brand">RM {selectedProduct.price}</p></div>
                   <div className="p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-slate-800"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ShoppingCart size={14}/> Stock Unit</p><p className={`text-3xl font-black font-outfit ${selectedProduct.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{selectedProduct.stock}</p></div>
                </div>
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex items-center justify-between text-sm font-bold"><span className="flex items-center gap-3 text-slate-500"><BarChart size={16}/> Lifetime Node Sales</span><span className="font-black text-slate-900 dark:text-white">{selectedProduct.salesCount || 156} Units</span></div>
                   <div className="flex items-center justify-between text-sm font-bold"><span className="flex items-center gap-3 text-slate-500"><CheckCircle size={16}/> Sync Integrity</span><span className="font-black text-emerald-500">Master Verified</span></div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="w-full py-6 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-3xl shadow-xl hover:bg-black transition-all">Authorize Parameters Update</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SyncBtn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-brand">{icon} {label}</button>
);

export default Products;


import React from 'react';
import { Search, Plus, Download, RefreshCw, MoreVertical, Layers, Tag, Box } from 'lucide-react';

const mockProducts = [
  { id: '1', name: 'Smart Lock A100 Pro', price: 1299.00, stock: 45, category: 'Digital Locks', sku: 'SL-A100P' },
  { id: '2', name: 'Slim-Fit Deadbolt X1', price: 899.00, stock: 12, category: 'Deadbolts', sku: 'SD-X1-BL' },
  { id: '3', name: 'Gate Lock G-Series', price: 1599.00, stock: 8, category: 'Gate Locks', sku: 'GL-GS-V2' },
  { id: '4', name: 'Fingerprint Padlock Z', price: 299.00, stock: 120, category: 'Accessories', sku: 'FP-PZ-01' },
];

const Products: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-slate-500">Manage and sync items from your Shopify store.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2">
            <RefreshCw size={16} /> Sync Shopify
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by SKU or name..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"><Download size={20} /></button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"><Layers size={20} /></button>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockProducts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 group-hover:border-blue-300"></div>
                    <span className="text-sm font-bold text-slate-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg w-fit text-slate-600">
                    <Tag size={12} />
                    <span className="text-xs font-semibold">{p.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">RM {p.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${p.stock < 10 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    <span className={`text-sm font-bold ${p.stock < 10 ? 'text-red-600' : 'text-slate-800'}`}>{p.stock}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{p.sku}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase">Active</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-all"><MoreVertical size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/30">
          <span className="text-xs text-slate-500">Showing 4 of 124 products</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-white disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold shadow-sm">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-white">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

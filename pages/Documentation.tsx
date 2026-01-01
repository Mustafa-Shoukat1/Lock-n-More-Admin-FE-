import React from 'react';
import { BookOpen, Shield, Zap, MessageSquare, Package, Cpu, Terminal, Users, Globe, CheckCircle, ListChecks, Calendar, Smartphone, Database, Lock, Layers } from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <div className="p-6 md:p-12 space-y-12 max-w-6xl mx-auto pb-32">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 pointer-events-none">
          <Layers size={350} className="text-brand" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-brand rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Platform TOTO</span>
            <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">v1.0 Release</span>
          </div>
          <h1 className="text-6xl font-bold font-outfit tracking-tighter leading-none">A-Z System Node Guide</h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium">The comprehensive technical architecture, operational manual, and milestone roadmap for the TOTO Centralized AI Messaging Platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigation Sticky Bar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-24 space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Index</h3>
            <DocNav label="Architecture" icon={<Cpu size={16}/>} />
            <DocNav label="Project Scope" icon={<ListChecks size={16}/>} />
            <DocNav label="Integrations" icon={<Globe size={16}/>} />
            <DocNav label="Milestone Plan" icon={<Calendar size={16}/>} />
            <DocNav label="Staff Protocol" icon={<Users size={16}/>} />
            <DocNav label="Security Node" icon={<Lock size={16}/>} />
          </div>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-3 space-y-24">
          
          {/* Section 1: Architecture */}
          <Section id="architecture" title="1. System Architecture" icon={<Cpu />}>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">TOTO is engineered as a high-fidelity <strong>Perimeter Intelligence Node</strong>. It centralizes social signals (WhatsApp, IG, TikTok) and bridges them with the <strong>Shopify Inventory Logic</strong> using a low-latency AI reasoning engine.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TechBadge label="React 19" sub="UI Execution" />
              <TechBadge label="Gemini 3 Flash" sub="Cognitive Core" />
              <TechBadge label="Shopify SDK" sub="Commerce Brain" />
              <TechBadge label="n8n Orchestrator" sub="Workflow Logic" />
            </div>
          </Section>

          {/* Section 2: Project Scope */}
          <Section id="scope" title="2. Functional Scope" icon={<ListChecks />}>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">The core objective is to replace fragmented inboxes with a unified, intelligent sales perimeter.</p>
            <div className="space-y-4">
              <FeatureItem title="Omnichannel Centralization" desc="Unified dashboard for WhatsApp, Instagram DMs, and TikTok inquiries." />
              <FeatureItem title="Agentic AI Layer" desc="Context-aware replies trained on historical data to replicate brand tone." />
              <FeatureItem title="E-commerce Synergy" desc="Live fetching of product catalog, pricing, and order status from Shopify." />
              <FeatureItem title="Hybrid Handover" desc="Seamless human override with 'Node Assignment' logic for specific agents." />
            </div>
          </Section>

          {/* Section 3: Integrations */}
          <Section id="integrations" title="3. Integration Node List" icon={<Globe />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <IntegrationBox name="WhatsApp API" detail="Official Business Cloud API supporting text, image, and voice." />
              <IntegrationBox name="Shopify Engine" detail="Real-time catalog sync, SKU-level stock, and order management." />
              <IntegrationBox name="Gemini AI" detail="Generative conversational engine for intent detection and response." />
              <IntegrationBox name="Meta/TikTok" detail="Centralized message hooks for DMs and follower notifications." />
            </div>
          </Section>

          {/* Section 4: Roadmap */}
          <Section id="roadmap" title="4. Milestone Roadmap (60 Days)" icon={<Calendar />}>
            <div className="space-y-6 relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-10">
              <MilestoneCard 
                day="0-20" 
                title="Phase 1: Foundation" 
                desc="Core platform setup, WhatsApp API connection, and Admin Panel UI deployment." 
                active 
              />
              <MilestoneCard 
                day="21-40" 
                title="Phase 2: Intelligence" 
                desc="AI brain training, Shopify e-commerce sync, and multi-agent handover logic." 
              />
              <MilestoneCard 
                day="41-60" 
                title="Phase 3: Omnichannel" 
                desc="Instagram/TikTok integration, n8n workflow finalization, and documentation handover." 
              />
            </div>
          </Section>

          {/* Section 5: Staff Protocols */}
          <Section id="staff" title="5. Staff Handover Protocol" icon={<Users />}>
            <div className="p-8 bg-brand/5 border border-brand/20 rounded-[2.5rem] space-y-6">
              <h4 className="text-xs font-black text-brand uppercase tracking-widest">Standard Operating Procedure (SOP)</h4>
              <ol className="space-y-4 text-sm font-medium">
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-black shrink-0">01</span>
                  <span><strong>AI Qualification:</strong> System handles initial FAQs and product discovery.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-black shrink-0">02</span>
                  <span><strong>Signal Detection:</strong> Human agent detects high-intent closing opportunity.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-black shrink-0">03</span>
                  <span><strong>Handover:</strong> Agent selects 'Handover to Staff' and assigns a specific Node (Agent).</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-black shrink-0">04</span>
                  <span><strong>Closing:</strong> Human agent finishes the RM transaction using live Shopify data.</span>
                </li>
              </ol>
            </div>
          </Section>

          {/* Footer End Transmission */}
          <div className="pt-20 border-t border-slate-100 dark:border-slate-800 text-center">
             <div className="inline-block p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">SYSTEM TOTO // END OF TRANSMISSION 2025</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }: any) => (
  <section className="space-y-8">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-brand text-white rounded-2xl shadow-lg shadow-brand/20">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h2 className="text-4xl font-bold font-outfit tracking-tight">{title}</h2>
    </div>
    <div className="pl-0 md:pl-16">
      {children}
    </div>
  </section>
);

const DocNav = ({ label, icon }: any) => (
  <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-brand transition-all text-left">
    {icon} {label}
  </button>
);

const TechBadge = ({ label, sub }: any) => (
  <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <p className="text-sm font-black uppercase tracking-widest">{label}</p>
    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{sub}</p>
  </div>
);

const IntegrationBox = ({ name, detail }: any) => (
  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:border-brand">
    <h5 className="font-bold text-sm mb-2">{name}</h5>
    <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>
  </div>
);

const MilestoneCard = ({ day, title, desc, active }: any) => (
  <div className="relative">
    <div className={`absolute -left-[50px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 shadow-md ${active ? 'bg-brand' : 'bg-slate-300'}`}></div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-brand uppercase tracking-widest">Day {day}</p>
      <h4 className="font-bold text-lg">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FeatureItem = ({ title, desc }: any) => (
  <li className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl transition-all">
    <div className="mt-1"><CheckCircle size={18} className="text-emerald-500" /></div>
    <div>
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs text-slate-500 font-medium">{desc}</p>
    </div>
  </li>
);

export default Documentation;
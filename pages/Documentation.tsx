
import React, { useState } from 'react';
import { BookOpen, Shield, Zap, MessageSquare, Package, Cpu, Users, Globe, CheckCircle, Calendar, Database, Lock, Layers, Info, DollarSign, ListChecks, Smartphone } from 'lucide-react';

const Documentation: React.FC = () => {
  const [activeManual, setActiveManual] = useState<'plan' | 'admin' | 'staff' | 'ai'>('plan');

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-6xl mx-auto pb-32 animate-in fade-in duration-500 text-left">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 pointer-events-none">
          <Layers size={350} className="text-brand" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-brand rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Master Proposal</span>
            <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">35 Day Roadmap</span>
          </div>
          <h1 className="text-6xl font-bold font-outfit tracking-tighter leading-none">System Knowledge Base</h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium">TOTO Architecture: Real-time Shopify integration, AI agentic reasoning, and omnichannel signaling protocol.</p>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2 shadow-sm">
        <TabButton active={activeManual === 'plan'} onClick={() => setActiveManual('plan')} icon={<Calendar size={16}/>} label="Implementation Plan" />
        <TabButton active={activeManual === 'admin'} onClick={() => setActiveManual('admin')} icon={<Database size={16}/>} label="Admin Manual" />
        <TabButton active={activeManual === 'staff'} onClick={() => setActiveManual('staff')} icon={<Users size={16}/>} label="Staff Workflow" />
        <TabButton active={activeManual === 'ai'} onClick={() => setActiveManual('ai')} icon={<Cpu size={16}/>} label="AI Training Guide" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-24">
          {activeManual === 'plan' && (
            <section className="space-y-12 animate-in slide-in-from-bottom duration-500">
               <Section title="Project Purpose" icon={<BookOpen />}>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">Centralizing WhatsApp, Instagram, and TikTok to eliminate missed leads and manual response delays.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                    <BenefitCard title="AI-First System" desc="Instant automated responses with human takeover fallback nodes." />
                    <BenefitCard title="Shopify Real-Time" desc="Faster responses via direct product catalog and inventory sync." />
                  </div>
               </Section>

               <Section title="Milestone Roadmap" icon={<ListChecks />}>
                 <div className="space-y-8 border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-10">
                    <TimelineItem day="1-5" title="Milestone 1-2" desc="Requirement Analysis & Admin Panel Architecture Deployment." cost="$400" active />
                    <TimelineItem day="6-15" title="Milestone 3-4" desc="WhatsApp API Connectivity & ChatGPT/AI Layer Training Node." cost="$750" active />
                    <TimelineItem day="16-25" title="Milestone 5-10" desc="Shopify Sync, Media Handling, and Automation Engine (n8n)." cost="$600" />
                    <TimelineItem day="26-35" title="Milestone 11-13" desc="Security Auth, Full QA Testing, and Staff Documentation." cost="$250" />
                 </div>
               </Section>

               <Section title="Core Deliverables" icon={<Zap />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <DeliveryItem label="Centralized Admin Hub" />
                     <DeliveryItem label="WhatsApp Business AI Bot" />
                     <DeliveryItem label="Voice & Image Handling" />
                     <DeliveryItem label="Shopify Live Inventory Node" />
                     <DeliveryItem label="n8n Workflow Automation" />
                     <DeliveryItem label="RBAC Security Perimeter" />
                  </div>
               </Section>
            </section>
          )}

          {activeManual === 'admin' && (
            <section className="space-y-12 animate-in slide-in-from-bottom duration-500">
               <Section title="Hub Management" icon={<Database />}>
                  <div className="space-y-6">
                    <WorkflowStep num="01" title="Node Monitoring" desc="View all active conversations in the global perimeter. Monitor staff latency." />
                    <WorkflowStep num="02" title="Catalog Sync" desc="Use the Products hub to verify SKU integrity between n8n and Shopify." />
                    <WorkflowStep num="03" title="Credential Security" desc="Manage API keys and authorized staff emails via the Admin Hub." />
                  </div>
               </Section>
            </section>
          )}

          {activeManual === 'staff' && (
             <section className="space-y-12 animate-in slide-in-from-bottom duration-500">
               <Section title="Agent Operations" icon={<Users />}>
                  <div className="p-8 bg-brand/5 border border-brand/20 rounded-[2.5rem] mb-10">
                     <p className="text-sm font-bold text-brand uppercase tracking-widest mb-4 flex items-center gap-2"><Smartphone size={16}/> Daily Signal Check</p>
                     <p className="text-slate-600 dark:text-slate-400 text-sm">Agents must clear all 'Priority Signals' in the Inbox before end-of-shift. Use 'AI Off' toggle for complex pricing negotiations.</p>
                  </div>
                  <div className="space-y-6">
                    <WorkflowStep num="01" title="Signal Detection" desc="New leads appear in Inbox with unread counts." />
                    <WorkflowStep num="02" title="Human Takeover" desc="Toggle AI Mode to OFF when a customer asks for custom discount logic." />
                    <WorkflowStep num="03" title="Voice Response" desc="Use the integrated Voice Node for a more personalized closure signal." />
                  </div>
               </Section>
             </section>
          )}
        </div>
        
        <div className="lg:col-span-1">
           <div className="sticky top-24 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><DollarSign size={14}/> Cost Breakdown</h4>
                 <div className="space-y-4">
                    <StatusItem label="Full System" val="$2,500" ok />
                    <StatusItem label="Initial Launch" val="$1,300" ok />
                    <StatusItem label="Social Addons" val="$400/ea" />
                 </div>
              </div>
              <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white">
                 <p className="text-[9px] font-black text-brand uppercase tracking-widest mb-2">NDA Compliance</p>
                 <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">All system architecture and Shopify credential logic are protected under the 2025 Locks 'N More Ownership Agreement.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }: any) => (
  <div className="space-y-8">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-brand text-white rounded-2xl shadow-lg">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h2 className="text-4xl font-bold font-outfit tracking-tighter uppercase">{title}</h2>
    </div>
    <div className="pl-0 md:pl-16">
      {children}
    </div>
  </div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-brand text-white shadow-xl scale-105' : 'text-slate-500 hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{icon} {label}</button>
);

const BenefitCard = ({ title, desc }: any) => (
  <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
    <p className="text-sm font-black text-brand uppercase tracking-widest mb-2">{title}</p>
    <p className="text-xs text-slate-500 font-bold leading-relaxed">{desc}</p>
  </div>
);

const TimelineItem = ({ day, title, desc, cost, active }: any) => (
  <div className="relative pb-10">
    <div className={`absolute -left-[50px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 shadow-md ${active ? 'bg-brand' : 'bg-slate-300'}`}></div>
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-brand uppercase tracking-widest">Day {day}</p>
        <span className="text-[10px] font-black text-slate-400">{cost}</span>
      </div>
      <h4 className="font-bold text-lg font-outfit uppercase tracking-tight text-slate-900 dark:text-white">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

const DeliveryItem = ({ label }: any) => (
  <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <CheckCircle size={16} className="text-emerald-500" />
    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{label}</span>
  </div>
);

const WorkflowStep = ({ num, title, desc }: any) => (
  <div className="flex gap-6 group">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand border border-brand/20 flex items-center justify-center font-black text-xs group-hover:bg-brand group-hover:text-white transition-all shadow-sm">{num}</div>
      <div className="flex-1 w-px bg-slate-100 dark:bg-slate-800 my-2"></div>
    </div>
    <div className="pb-8">
      <h4 className="text-lg font-bold font-outfit uppercase tracking-tight">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{desc}</p>
    </div>
  </div>
);

const StatusItem = ({ label, val, ok }: any) => (
  <div className="flex items-center justify-between text-[10px] font-bold">
    <span className="text-slate-500 uppercase tracking-tighter">{label}</span>
    <span className={ok ? 'text-brand' : 'text-slate-400'}>{val}</span>
  </div>
);

export default Documentation;

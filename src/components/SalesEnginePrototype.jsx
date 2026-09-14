import React, { useState } from 'react';
import { Sparkles, MapPin, Sliders, CheckCircle2, Rocket, Phone, MessageSquare } from 'lucide-react';

/**
 * PROTOTYPE: Sales Engine V1.3 UI & State Machine Sandbox
 * Purpose: Answers the design question: "Does the real-time polling state machine and CRM pipeline layout feel intuitive and responsive for non-technical sales users?"
 */
export default function SalesEnginePrototype() {
  const [step, setStep] = useState('idle'); // 'idle' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [leads, setLeads] = useState([]);

  const startSimulation = () => {
    setStep('processing');
    setProgress(0);
    setLeads([]);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setStep('completed');
        setLeads([
          { business_name: 'Clínica Sorriso Perfeito', niche: 'Clínicas Odontológicas', city: 'São Paulo', phone: '5511998877665', phone_type: 'celular', has_website: false, rating: 4.8, reviews_count: 42, address: 'Av. Paulista, 1000 - São Paulo' },
          { business_name: 'Restaurante Sabor Mineiro', niche: 'Restaurantes', city: 'São Paulo', phone: '5511987654321', phone_type: 'celular', has_website: false, rating: 4.6, reviews_count: 88, address: 'Rua Augusta, 500 - São Paulo' },
        ]);
      }
      setProgress(current);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Prototype Header */}
        <div className="bg-gradient-to-r from-violet-900/40 via-slate-900 to-indigo-900/40 p-6 rounded-2xl border border-violet-500/30 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
              Interactive UI Prototype v1.3
            </span>
            <h1 className="text-2xl font-black mt-2 text-white">Sales Engine Sandbox</h1>
            <p className="text-sm text-slate-400 mt-1">Testing state machine transitions and polling progress feedback.</p>
          </div>
          <button 
            onClick={startSimulation}
            disabled={step === 'processing'}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2"
          >
            <Rocket size={18} />
            <span>{step === 'processing' ? 'Simulando Extração...' : 'Simular Nova Busca'}</span>
          </button>
        </div>

        {/* State Machine Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-bold">Estado Atual</span>
            <div className="text-lg font-mono font-bold text-violet-400 mt-1 uppercase">{step}</div>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-bold">Progresso do Job</span>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-1">{progress}%</div>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-bold">Leads Encontrados</span>
            <div className="text-lg font-mono font-bold text-indigo-400 mt-1">{leads.length} Leads</div>
          </div>
        </div>

        {/* Progress Bar Demo */}
        {step === 'processing' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Extraindo estabelecimentos no Google Maps...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
              <div className="bg-violet-500 h-3 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Leads Result Preview */}
        {leads.length > 0 && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-200">Leads Simulados (Sem Site)</h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Sucesso</span>
            </div>
            <div className="divide-y divide-slate-800">
              {leads.map((lead, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-850/50">
                  <div>
                    <h4 className="font-bold text-slate-100">{lead.business_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{lead.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-violet-500/10 text-violet-300 px-3 py-1 rounded-lg border border-violet-500/20 font-mono">
                      {lead.phone} ({lead.phone_type})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

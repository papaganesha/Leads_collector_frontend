import React, { useState, useEffect } from 'react';
import SkeletonLoader from './components/SkeletonLoader.jsx';
import LeadTable from './components/LeadTable.jsx';
import SavedLeads from './components/SavedLeads.jsx';
import { supabase } from './libs/supabase.js';

const NICHES = [
  'Mecânicas', 'Clínicas Odontológicas', 'Restaurantes', 'Pet Shops',
  'Salões de Beleza', 'Barbearias', 'Imobiliárias', 'Academias',
  'Escolas de Idiomas', 'Contabilidades', 'Advogados', 'Farmácias',
  'Lanchonetes', 'Pizzarias', 'Lava-Rápido', 'Lojas de Roupa',
  'Óticas', 'Marmorarias', 'Serralherias', 'Desentupidoras'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [niche, setNiche] = useState(NICHES[0]);
  const [city, setCity] = useState('');
  const [siteFilter, setSiteFilter] = useState('no_website');
  
  const [loading, setLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [leads, setLeads] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    } else {
      setTimeElapsed(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) return alert('Por favor, informe a cidade.');

    setLoading(true);
    setLeads([]);

    try {
      const API_URL = import.meta.env.VITE_SCRAPER_API_URL || 'http://localhost:3001';
      
      const res = await fetch(`${API_URL}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, city, siteFilter })
      });

      const data = await res.json();
      if (res.ok) {
        setLeads(data.leads || []);
      } else {
        alert(data.error || 'Erro na busca de leads.');
      }
    } catch (err) {
      alert('Falha ao conectar com o servidor scraper.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToSupabase = async (selectedLeads) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('leads').upsert(
        selectedLeads.map(l => ({
          business_name: l.business_name,
          niche: l.niche,
          city: l.city,
          phone: l.phone,
          has_website: l.has_website,
          website_url: l.website_url,
          address: l.address,
          whatsapp_template: l.whatsapp_template
        })),
        { onConflict: 'phone', ignoreDuplicates: true }
      );

      if (error) throw error;
      alert('Leads salvos com sucesso no Supabase!');
    } catch (err) {
      alert('Erro ao salvar no Supabase: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col items-center justify-center text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
            <span>🎯</span> Jpas Tech Solutions — Sales Engine V1.1
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prospecção B2B</h1>
        </header>

        {/* Barra de Navegação de Abas */}
        <div className="flex justify-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`w-1/2 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'search' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎯 Extrair Leads
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`w-1/2 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'saved' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📁 Leads Salvos
          </button>
        </div>

        {/* Aba 1: Scraper */}
        {activeTab === 'search' && (
          <>
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nicho</label>
                  <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm">
                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    placeholder="Ex: Capão da Canoa - RS"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Filtro de Site</label>
                  <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm">
                    <option value="no_website">🎯 Apenas SEM site</option>
                    <option value="has_website">🌐 Apenas COM site</option>
                    <option value="all">🔍 Todos os Leads</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {loading ? 'Minerando Google Maps...' : '🚀 Buscar 50 Leads'}
              </button>
            </form>

            {loading && <SkeletonLoader timeElapsed={timeElapsed} />}
            {!loading && leads.length > 0 && <LeadTable leads={leads} onSave={handleSaveToSupabase} isSaving={isSaving} />}
          </>
        )}

        {/* Aba 2: Leads Salvos no Supabase */}
        {activeTab === 'saved' && <SavedLeads />}
      </div>
    </div>
  );
}

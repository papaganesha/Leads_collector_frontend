import React, { useState, useEffect } from 'react';
import SkeletonLoader from './components/SkeletonLoader.jsx';
import LeadTable from './components/LeadTable.jsx';
import { supabase } from './lib/supabase';

const NICHES = [
  'Mecânicas', 'Clínicas Odontológicas', 'Restaurantes', 'Pet Shops',
  'Salões de Beleza', 'Barbearias', 'Imobiliárias', 'Academias',
  'Escolas de Idiomas', 'Contabilidades', 'Advogados', 'Farmácias',
  'Lanchonetes', 'Pizzarias', 'Lava-Rápido', 'Lojas de Roupa',
  'Óticas', 'Marmorarias', 'Serralherias', 'Desentupidoras'
];

export default function App() {
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
      alert('Falha ao conectar com o servidor scraper. Verifique se a API no Railway/Local está online.');
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
      alert('Leads selecionados salvos com sucesso no Supabase!');
    } catch (err) {
      alert('Erro ao salvar no Supabase: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho da Aplicação */}
        <header className="flex flex-col items-center justify-center text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-indigo-200">
            <span>🎯</span> Jpas Tech Solutions — Sales Engine V1
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Prospecção de Leads B2B
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg">
            Minerador automático do Google Maps focado em capturar empresas sem site e gerar abordagens de alta conversão.
          </p>
        </header>

        {/* Formulário Principal */}
        <form onSubmit={handleSearch} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200/80 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Nicho do Cliente</label>
              <select 
                value={niche} 
                onChange={(e) => setNiche(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Cidade / UF</label>
              <input
                type="text"
                placeholder="Ex: Capão da Canoa - RS"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Filtro do Google Maps</label>
              <select 
                value={siteFilter} 
                onChange={(e) => setSiteFilter(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="no_website">🎯 Apenas SEM site (Recomendado)</option>
                <option value="has_website">🌐 Apenas COM site</option>
                <option value="all">🔍 Todos os Leads</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Processando raspagem...</span>
            ) : (
              <>
                <span>🚀</span>
                <span>Extrair 50 Leads do Google Maps</span>
              </>
            )}
          </button>
        </form>

        {/* Área de Resultados / Carregamento */}
        {loading && <SkeletonLoader timeElapsed={timeElapsed} />}
        {!loading && leads.length > 0 && (
          <LeadTable leads={leads} onSave={handleSaveToSupabase} isSaving={isSaving} />
        )}
      </div>
    </div>
  );
}

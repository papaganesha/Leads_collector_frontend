import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import LeadTable from './components/LeadTable.jsx';
import SavedLeads from './components/SavedLeads.jsx';
import { supabase } from './libs/supabase.js';
import { sanitizeCityInput } from './utils/sanitize.js';

const NICHES = [
  'Mecânicas', 'Clínicas Odontológicas', 'Restaurantes', 'Pet Shops',
  'Salões de Beleza', 'Barbearias', 'Imobiliárias', 'Academias',
  'Escolas de Idiomas', 'Contabilidades', 'Advogados', 'Farmácias',
  'Lanchonetes', 'Pizzarias', 'Lava-Rápido', 'Lojas de Roupa',
  'Óticas', 'Marmorarias', 'Serralherias', 'Desentupidoras'
];

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all hover:scale-105"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [niche, setNiche] = useState(NICHES[0]);
  const [city, setCity] = useState('');
  const [siteFilter, setSiteFilter] = useState('no_website');
  const [maxResults, setMaxResults] = useState(50);
  const [apiStatus, setApiStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [leads, setLeads] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_SCRAPER_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_URL}/`, { method: 'GET' });
        if (res.ok) setApiStatus('online');
        else setApiStatus('offline');
      } catch (err) {
        setApiStatus('offline');
      }
    };
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 20000);
    return () => clearInterval(interval);
  }, []);

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
    const finalMaxResults = Math.min(125, Math.max(25, Number(maxResults) || 25));
    const sanitizedCity = sanitizeCityInput(city);
    setLoading(true);
    setLeads([]);
    setProgressStep('Criando tarefa no servidor...');
    setCurrentProgress(0);
    try {
      const API_URL = import.meta.env.VITE_SCRAPER_API_URL || 'http://localhost:3001';
      const startRes = await fetch(`${API_URL}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, city: sanitizedCity, siteFilter, maxResults: finalMaxResults })
      });
      const startData = await startRes.json();
      if (!startRes.ok || !startData.jobId) throw new Error(startData.error || 'Falha ao iniciar tarefa.');
      const jobId = startData.jobId;
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_URL}/api/scrape/status/${jobId}`);
          const statusData = await statusRes.json();
          if (statusRes.ok) {
            setProgressStep(statusData.message || 'Processando...');
            setCurrentProgress(statusData.current || 0);
            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              setLeads(statusData.leads || []);
              setLoading(false);
            } else if (statusData.status === 'error') {
              clearInterval(pollInterval);
              setLoading(false);
              alert('Atenção: ' + statusData.error);
            }
          }
        } catch (err) { console.error('Erro no polling:', err); }
      }, 2500);
    } catch (err) {
      alert('Erro de conexão: ' + err.message);
      setLoading(false);
    }
  };

  const handleClearList = () => setLeads([]);

  const handleSaveToSupabase = async (selectedLeads) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('leads').upsert(
        selectedLeads.map(l => ({
          business_name: l.business_name,
          niche: l.niche,
          city: l.city,
          phone: l.phone,
          phone_type: l.phone_type || 'desconhecido',
          status: l.status || 'novo',
          has_website: l.has_website,
          website_url: l.website_url,
          instagram_url: l.instagram_url,
          facebook_url: l.facebook_url,
          image_url: l.image_url,
          photos: l.photos,
          address: l.address,
          rating: l.rating,
          reviews_count: l.reviews_count,
          whatsapp_template: l.whatsapp_template
        })),
        { onConflict: 'phone', ignoreDuplicates: true }
      );
      if (error) throw error;
      alert('Leads salvos com sucesso!');
    } catch (err) { alert('Erro ao salvar no Supabase: ' + err.message); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-[1700px] w-full mx-auto p-4 sm:p-8 space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Jpas Tech Solutions</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sales Engine V1.3</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex justify-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`w-1/2 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'search' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            🎯 Extrair Leads
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`w-1/2 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'saved' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            📁 Leads Salvos (CRM)
          </button>
        </div>

        {activeTab === 'search' && (
          <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Nicho</label>
                  <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm">
                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Cidade / UF</label>
                  <input type="text" placeholder="Ex: Capão da Canoa - RS" value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Filtro de Site</label>
                  <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm">
                    <option value="no_website">Sem site</option>
                    <option value="all">Todos os Leads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Qtd. Leads (25-125)</label>
                  <input type="number" min={25} max={125} value={maxResults} onChange={(e) => setMaxResults(e.target.value)} className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg disabled:opacity-50">
                {loading ? 'Minerando...' : 'Buscar Leads'}
              </button>
          </form>
        )}

        {loading && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
             <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
               <span>{progressStep}</span>
               <span>{timeElapsed}s</span>
             </div>
             <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
               <div className="bg-indigo-600 h-3 rounded-full transition-all duration-300" style={{ width: `${Math.min(Math.round((currentProgress / maxResults) * 100), 100)}%` }}></div>
             </div>
          </div>
        )}

        {!loading && leads.length > 0 && <LeadTable leads={leads} onSave={handleSaveToSupabase} onClear={handleClearList} isSaving={isSaving} />}
        {activeTab === 'saved' && <SavedLeads />}
      </div>
    </div>
  );
}
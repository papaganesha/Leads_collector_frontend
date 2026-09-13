import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import LeadTable from './components/LeadTable.jsx';
import SavedLeads from './components/SavedLeads.jsx';
import CopyTemplates from './components/CopyTemplates.jsx';
import { supabase } from './libs/supabase.js';
import { sanitizeCityInput } from './utils/sanitize.js';
import { 
  Search, 
  MapPin, 
  Sliders, 
  Layers, 
  Rocket, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const NICHES = [
  'Mecânicas', 'Clínicas Odontológicas', 'Restaurantes', 'Pet Shops',
  'Salões de Beleza', 'Barbearias', 'Imobiliárias', 'Academias',
  'Escolas de Idiomas', 'Contabilidades', 'Advogados', 'Farmácias',
  'Lanchonetes', 'Pizzarias', 'Lava-Rápido', 'Lojas de Roupa',
  'Óticas', 'Marmorarias', 'Serralherias', 'Desentupidoras'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Formulário de Mineração
  const [niche, setNiche] = useState(NICHES[0]);
  const [city, setCity] = useState('');
  const [siteFilter, setSiteFilter] = useState('no_website');
  const [maxResults, setMaxResults] = useState(50);
  
  // Status da API em Tempo Real ('online' | 'offline' | 'checking')
  const [apiStatus, setApiStatus] = useState('checking');

  // Estados de execução e barra de progresso
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const [leads, setLeads] = useState(() => {
    try {
      const stored = sessionStorage.getItem('jpas_mined_leads_v1.3');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Salva no sessionStorage para persistir no F5/Refresh mas limpar ao fechar a aba/navegador
  useEffect(() => {
    try {
      sessionStorage.setItem('jpas_mined_leads_v1.3', JSON.stringify(leads));
    } catch (e) {
      console.error(e);
    }
  }, [leads]);
  const [isSaving, setIsSaving] = useState(false);

  // Healthcheck do Servidor Backend a cada 20 segundos
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_SCRAPER_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_URL}/`, { method: 'GET' });
        if (res.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (err) {
        setApiStatus('offline');
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  // Cronômetro do loader
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
        body: JSON.stringify({ niche, city: sanitizedCity, siteFilter, maxResults })
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.jobId) {
        throw new Error(startData.error || 'Falha ao iniciar tarefa no servidor.');
      }

      const jobId = startData.jobId;

      let pollErrors = 0;
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_URL}/api/scrape/status/${jobId}`);
          if (!statusRes.ok) {
            pollErrors++;
            if (pollErrors >= 5) {
              clearInterval(pollInterval);
              setLoading(false);
              alert('Erro de conexão consecutiva com o servidor. A tarefa de mineração pode ter falhado ou expirado.');
            }
            return;
          }

          pollErrors = 0;
          const statusData = await statusRes.json();

          setProgressStep(statusData.message || statusData.step || 'Minerando empresas...');
          setCurrentProgress(statusData.current || statusData.progress || 0);

          if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            setLoading(false);
            const finalLeads = statusData.leads || statusData.result || [];
            setLeads(finalLeads);
            if (finalLeads.length === 0) {
              alert('Nenhum lead encontrado para os critérios selecionados.');
            }
          } else if (statusData.status === 'error' || statusData.status === 'failed') {
            clearInterval(pollInterval);
            setLoading(false);
            alert(`Erro na mineração: ${statusData.error || 'Falha desconhecida.'}`);
          }
        } catch (pollErr) {
          console.error('Erro de polling:', pollErr);
          pollErrors++;
          if (pollErrors >= 5) {
            clearInterval(pollInterval);
            setLoading(false);
            alert('Conexão perdida com o servidor de mineração.');
          }
        }
      }, 2000);

    } catch (err) {
      setLoading(false);
      alert(err.message || 'Erro de conexão com o servidor scraper.');
    }
  };

  const handleSaveToSupabase = async (selectedLeadsToSave) => {
    if (!selectedLeadsToSave.length) return alert('Selecione ao menos um lead para salvar.');
    setIsSaving(true);

    try {
      const payload = selectedLeadsToSave.map(l => ({
        business_name: l.business_name,
        niche: l.niche,
        city: l.city,
        phone: l.phone,
        phone_type: l.phone_type,
        has_website: l.has_website,
        website_url: l.website_url,
        instagram_url: l.instagram_url,
        facebook_url: l.facebook_url,
        image_url: l.image_url,
        photos: l.photos,
        rating: l.rating,
        reviews_count: l.reviews_count,
        address: l.address,
        whatsapp_template: l.whatsapp_template,
        status: 'novo'
      }));

      const { data, error } = await supabase
        .from('leads')
        .upsert(payload, { onConflict: 'phone', ignoreDuplicates: true });

      if (error) throw error;

      alert(`Sucesso! ${selectedLeadsToSave.length} lead(s) salvo(s) ou atualizado(s) no Supabase.`);
    } catch (err) {
      alert('Erro ao salvar no banco: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearList = () => {
    setLeads([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      
      {/* Sidebar Retrátil (Dark SaaS) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        apiStatus={apiStatus}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1700px] mx-auto w-full space-y-8">
        
        {/* Banner de Aviso Backend Offline se aplicável */}
        {apiStatus === 'offline' && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-400" />
              <span><b>Servidor API Offline:</b> O serviço de mineração no Railway está indisponível ou inicializando. Tente novamente em instantes.</span>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg font-bold flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Rechecar
            </button>
          </div>
        )}

        {/* Conteúdo da Aba 1: Mineração de Leads */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            
            {/* Header da Seção */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Encontrar leads</span>
                  <Sparkles size={20} className="text-violet-400" />
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Encontre empresas locais de alta avaliação que convertam em oportunidades de clientes.
                </p>
              </div>
            </div>

            {/* Painel do Formulário de Mineração (Dark SaaS Card) */}
            <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              
              {/* Primeira Linha: Barra de Busca de Cidade com o Botão de Iniciar Busca Embutido */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin size={14} className="text-violet-400" />
                  <span>Cidade / Estado (UF)</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Ex: Capão da Canoa - RS"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-4 pr-36 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition-colors shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={loading || apiStatus === 'offline'}
                    className="absolute right-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold py-2.5 px-5 rounded-lg transition-all text-xs flex items-center gap-2 shadow-md shadow-violet-600/30 disabled:opacity-50"
                  >
                    <Rocket size={14} />
                    <span>{loading ? 'Buscando...' : 'Iniciar busca'}</span>
                  </button>
                </div>
              </div>

              {/* Linhas Abaixo: Nicho, Filtro de Website e Slider de Quantidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nicho */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers size={14} className="text-violet-400" />
                    <span>Nicho / Segmento</span>
                  </label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-violet-500 transition-colors"
                  >
                    {NICHES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro de Site */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sliders size={14} className="text-violet-400" />
                    <span>Filtro de Website</span>
                  </label>
                  <select
                    value={siteFilter}
                    onChange={(e) => setSiteFilter(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="no_website">Apenas sem site (Recomendado)</option>
                    <option value="all">Todos os Leads</option>
                  </select>
                </div>

              </div>

              {/* Seletor de Quantidade via Input Range (25 a 125) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span>Quantidade Solicitada:</span>
                    <span className="text-sm font-black text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-lg border border-violet-500/20">
                      {maxResults} Leads
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Intervalo: 25 a 125</span>
                </div>

                <input
                  type="range"
                  min="25"
                  max="125"
                  step="5"
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="w-full accent-violet-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </form>

            {/* Cronômetro e Barra de Progresso durante Execução */}
            {loading && (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-ping" />
                    <span className="text-violet-300">{progressStep}</span>
                  </span>
                  <span className="font-mono text-slate-400">{timeElapsed}s decorridos</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 h-3 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                    style={{ width: `${Math.min(Math.round((currentProgress / maxResults) * 100), 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tabela de Resultados Minerados */}
            {!loading && leads.length > 0 && (
              <LeadTable 
                leads={leads} 
                onSave={handleSaveToSupabase} 
                onClear={handleClearList} 
                isSaving={isSaving} 
              />
            )}

          </div>
        )}

        {/* Conteúdo da Aba 2: CRM / Leads Salvos */}
        {activeTab === 'saved' && (
          <SavedLeads />
        )}

        {/* Conteúdo da Aba 3: Modelos de Copy */}
        {activeTab === 'templates' && (
          <CopyTemplates />
        )}

      </main>
    </div>
  );
}

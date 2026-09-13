import React from 'react';
import { 
  Search, 
  Database, 
  FileText,
  ChevronLeft, 
  ChevronRight, 
  Zap,
  Activity
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, apiStatus }) {
  const navItems = [
    {
      id: 'search',
      label: 'Mineração de Leads',
      shortLabel: 'Buscar',
      icon: Search
    },
    {
      id: 'saved',
      label: 'Leads Salvos',
      shortLabel: 'Leads',
      icon: Database
    },
    {
      id: 'templates',
      label: 'Modelos de CTA',
      shortLabel: 'CTA',
      icon: FileText
    }
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-slate-950 border-r border-slate-800/80 text-slate-100 transition-all duration-300 ease-in-out z-40 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Botão de Toggle da Sidebar (Borda Direita) */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-7 bg-slate-900 border border-slate-700 hover:border-violet-500 text-slate-300 hover:text-violet-400 p-1 rounded-full shadow-lg transition-all duration-200 z-50"
        title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Topo - Brand / Logo */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
        {isCollapsed ? (
          <div className="w-full flex justify-center py-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              J
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <Zap size={20} className="fill-current" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                JPAS <span className="text-violet-400">ENGINE</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">V1.3 • Dark SaaS</p>
            </div>
          </div>
        )}
      </div>

      {/* Menu Navegação */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                } ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                    : 'text-slate-400 border border-transparent hover:text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors ${
                    isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-violet-400'
                  }`}
                />
                
                {!isCollapsed && (
                  <span className="truncate tracking-wide">{item.label}</span>
                )}
              </button>

              {/* Tooltip flutuante exibido SOMENTE no modo recolhido */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 flex items-center gap-2">
                  <span>{item.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Rodapé - Status da API Backend */}
      <div className="p-3 border-t border-slate-800/60">
        {isCollapsed ? (
          <div className="relative group flex justify-center py-2">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                apiStatus === 'online'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : apiStatus === 'offline'
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              API Scraper: <span className="uppercase font-bold">{apiStatus}</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity size={16} className="text-slate-400" />
              <div className="text-xs">
                <p className="text-slate-400 font-medium">Scraper Engine</p>
                <p className="font-bold capitalize text-slate-200">{apiStatus}</p>
              </div>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                apiStatus === 'online'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : apiStatus === 'offline'
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

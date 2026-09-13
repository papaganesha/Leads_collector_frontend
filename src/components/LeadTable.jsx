import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Trash2, 
  Save, 
  Star, 
  Globe, 
  Instagram, 
  Facebook, 
  MessageSquare, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  X,
  MapPin,
  Building2,
  Database,
  ShieldCheck,
  ExternalLink,
  Phone
} from 'lucide-react';

export default function LeadTable({ leads, onSave, onClear, isSaving }) {
  const leadsArray = Array.isArray(leads) 
    ? leads 
    : (leads?.leads || leads?.result || leads?.data || (Array.isArray(leads?.data?.leads) ? leads.data.leads : []));

  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedCopy, setSelectedCopy] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCurrentPage(1);
    // Seleciona TODOS os leads por padrão globalmente ao carregar novos resultados
    setSelectedLeads(leadsArray.map((_, index) => index));
  }, [leads]);

  const filteredLeads = leadsArray.filter(lead => 
    (lead.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (lead.niche?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((_, index) => startIndex + index));
    }
  };

  const toggleSelect = (originalIndex, e) => {
    if (e) e.stopPropagation();
    if (selectedLeads.includes(originalIndex)) {
      setSelectedLeads(selectedLeads.filter(i => i !== originalIndex));
    } else {
      setSelectedLeads([...selectedLeads, originalIndex]);
    }
  };

  const exportSelectedToExcel = () => {
    if (!selectedLeads.length) {
      return alert('Selecione ao menos um lead para exportar.');
    }

    const leadsToExport = selectedLeads.map(i => leadsArray[i]).filter(Boolean);

    const headers = ['Empresa', 'Nicho', 'Cidade', 'Telefone', 'Tipo', 'Rating', 'Tem Site', 'Website', 'Instagram', 'Facebook', 'Endereco'];
    const rows = leadsToExport.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${l.phone_type || ''}"`,
      `"${l.rating || ''}"`,
      l.has_website ? 'Sim' : 'Não',
      `"${l.website_url || l.website || ''}"`,
      `"${l.instagram_url || l.instagram || ''}"`,
      `"${l.facebook_url || l.facebook || ''}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mined_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMined = leadsArray.length;
  const semSiteCount = leadsArray.filter(l => !l.has_website && !l.website_url).length;
  const comCelularCount = leadsArray.filter(l => l.phone_type === 'celular').length;

  return (
    <div className="w-full space-y-6 mt-6">
        {/* Cards de Métricas no Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Leads encontrados</span>
            <h3 className="text-2xl font-black text-white">{totalMined}</h3>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-2xl border border-violet-500/20">
            <Database size={22} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Potenciais (Sem Site)</span>
            <h3 className="text-2xl font-black text-emerald-400">{semSiteCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Globe size={22} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Com Celular (WhatsApp)</span>
            <h3 className="text-2xl font-black text-blue-400">{comCelularCount}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <MessageSquare size={22} />
          </div>
        </div>
      </div>
      
      {/* Topo da Seção de Resultados */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 w-full md:w-auto flex-1">
          <div className="flex items-center gap-2">
          </div>
        </div>



        {/* Ações em Massa */}
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-start">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Filtrar resultados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <button
              type="button"
              onClick={() => onSave(selectedLeads.map(i => leadsArray[i]).filter(Boolean))}
              disabled={isSaving || selectedLeads.length === 0}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-600/30 transition-all"
            >
              <Save size={16} />
              <span>{isSaving ? 'Salvando...' : `Salvar no CRM (${selectedLeads.length})`}</span>
            </button>

            <button
              type="button"
              onClick={exportSelectedToExcel}
              disabled={selectedLeads.length === 0}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-sm border border-emerald-500/30 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Download size={16} />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={onClear}
              className="px-4 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-sm border border-rose-500/30 flex items-center gap-2 transition-all"
            >
              <Trash2 size={16} />
              <span>Limpar</span>
            </button>
          </div>
        </div>
      </div>

     
      {/* Grid de Cards Estilo Dark SaaS para a Busca */}
      <div className="space-y-4">
        
        {/* Barra de Seleção Global */}
        <div className="flex items-center justify-between px-2 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={displayedLeads.length > 0 && selectedLeads.length === displayedLeads.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-500"
            />
            <span>Selecionar página atual ({displayedLeads.length} leads)</span>
          </div>
        </div>

        {displayedLeads.length === 0 ? (
          <div className="py-20 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
            <Building2 size={36} className="text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Nenhum lead encontrado na busca</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Realize uma nova busca para visualizar os resultados aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedLeads.map((lead, index) => {
              const originalIndex = startIndex + index;
              const isSelected = selectedLeads.includes(originalIndex);
              
              const mapsQuery = encodeURIComponent(`${lead.business_name} ${lead.address || lead.city || ''}`);
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

              return (
                <div
                  key={originalIndex}
                  className={`group relative bg-slate-900 hover:bg-slate-900/95 border rounded-3xl p-5 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:border-violet-500/50 ${
                    isSelected ? 'border-violet-500 bg-violet-950/10' : 'border-slate-800'
                  }`}
                >

                    <div>

                                          <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                  {/* Card Header */}
                  <div className="space-y-3">
                      {/* Checkbox de Seleção */}
                      <div className="p-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelect(originalIndex, e)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-500"
                        />
                      </div>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1">
                          {lead.niche || 'Geral'}
                        </span>
                        
                        {lead.rating && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            {lead.rating} {lead.reviews_count ? `(${lead.reviews_count})` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                                              <h3 className="text-lg font-black text-white tracking-tight group-hover:text-violet-300 transition-colors line-clamp-1">
                        {lead.business_name}
                      </h3>
                      {/* Endereço Clicável para Google Maps */}
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-400 hover:text-violet-400 flex items-center gap-1.5 mt-1 truncate transition-colors"
                        title="Abrir endereço exato no Google Maps"
                      >
                        <MapPin size={14} className="text-violet-400 flex-shrink-0" />
                        <span className="underline decoration-slate-700 hover:decoration-violet-400 truncate">
                          {lead.address || lead.city || 'Abrir no Google Maps'}
                        </span>
                        <ExternalLink size={11} className="flex-shrink-0 text-slate-500" />
                      </a>
                    </div>
                  </div>

                  {/* Card Body / Info */}
                  <div className="py-4 my-3 border-y border-slate-800/80 space-y-2.5 text-sm">
                    {/* Privacidade de Telefone (Sem exibir número completo antes de salvar) */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-500" />
                        Telefone:
                      </span>
                      <span className="font-bold">
                        {lead.phone_type === 'celular' ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                            Whats
                          </span>
                        ) : lead.phone_type === 'fixo' ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                            Fixo
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Indisponível</span>
                        )}
                      </span>
                    </div>

                    {/* Status de Site (Simplificado) */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Globe size={14} className="text-slate-500" />
                        Site:
                      </span>
                      {lead.has_website || lead.website_url ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-bold text-xs flex items-center gap-1">
                          Possui Site
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                          Sem site
                        </span>
                      )}
                    </div>

                    {/* Redes Sociais */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Instagram size={14} className="text-slate-500" />
                        Redes Sociais:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {lead.instagram_url ? (
                          <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-bold flex items-center gap-1">
                            <Instagram size={12} /> IG
                          </span>
                        ) : null}
                        {lead.facebook_url ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1">
                            <Facebook size={12} /> FB
                          </span>
                        ) : null}
                        {!lead.instagram_url && !lead.facebook_url && (
                          <span className="text-slate-500 text-xs">Nenhuma</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Controles de Paginação com Números (< 1 2 3 >) */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
            <span>
              Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(startIndex + ITEMS_PER_PAGE, filteredLeads.length)}</b> de <b>{filteredLeads.length}</b> minerados
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl font-bold disabled:opacity-40 hover:bg-slate-800 transition-all flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition-all flex items-center justify-center border ${
                      currentPage === pageNum
                        ? 'bg-violet-600 text-white border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl font-bold disabled:opacity-40 hover:bg-slate-800 transition-all flex items-center gap-1"
              >
                <span>Próxima</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Copy */}
      {selectedCopy && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-violet-400" />
                Template de Abordagem WhatsApp
              </h3>
              <button 
                type="button"
                onClick={() => setSelectedCopy(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-mono text-slate-200 outline-none leading-relaxed"
              value={selectedCopy}
            />
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedCopy);
                  alert('Copy copiada para a área de transferência!');
                }}
                className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-extrabold transition-colors shadow-md"
              >
                Copiar Texto
              </button>
              <button 
                type="button"
                onClick={() => setSelectedCopy(null)} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

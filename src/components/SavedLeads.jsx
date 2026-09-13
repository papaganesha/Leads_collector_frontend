import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';
import LeadCardModal from './LeadCardModal.jsx';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Star, 
  Globe, 
  Instagram, 
  Facebook, 
  MessageSquare, 
  Eye, 
  Copy, 
  Check, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  MapPin
} from 'lucide-react';

const CRM_STATUSES = {
  novo: { label: '🟡 Novo', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  contatado: { label: '🔵 Contatado', bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  em_negociacao: { label: '🟣 Em Negociação', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  fechado: { label: '🟢 Fechado', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  sem_interesse: { label: '🔴 Sem Interesse', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30' }
};

export default function SavedLeads() {
  const [savedLeads, setSavedLeads] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros de Status e Nicho
  const [statusFilter, setStatusFilter] = useState('all');
  const [nicheFilter, setNicheFilter] = useState('all');
  
  // Lead selecionado para o Modal Centralizado (LeadCardModal)
  const [selectedLead, setSelectedLead] = useState(null);

  // Paginação (Exatamente 6 por página conforme solicitado)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchSavedLeads();
  }, []);

  // Reseta para a primeira página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, nicheFilter]);

  const fetchSavedLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedLeads(data || []);
      setSelectedIds([]);
    } catch (err) {
      alert('Erro ao buscar leads do banco: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      // Atualiza localmente o lead na lista
      setSavedLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      
      // Se o modal estiver aberto com esse lead, atualiza o lead no modal também
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedLeads.length && displayedLeads.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedLeads.map(l => l.id));
    }
  };

  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return alert('Selecione ao menos um lead via checkbox para excluir.');
    if (!confirm(`Deseja realmente excluir ${selectedIds.length} lead(s) selecionado(s)?`)) return;

    try {
      const { error } = await supabase.from('leads').delete().in('id', selectedIds);
      if (error) throw error;
      setSavedLeads(savedLeads.filter(l => !selectedIds.includes(l.id)));
      setSelectedIds([]);
      alert('Leads excluídos com sucesso!');
    } catch (err) {
      alert('Erro ao excluir leads: ' + err.message);
    }
  };

  // Exportação CSV estritamente dos selecionados
  const exportSelectedCSV = () => {
    if (!selectedIds.length) return alert('Selecione ao menos um lead via checkbox para exportar o CSV.');
    
    const leadsToExport = savedLeads.filter(l => selectedIds.includes(l.id));
    const headers = ['Nome da Empresa', 'Nicho', 'Cidade', 'Telefone', 'Tipo Telefone', 'Rating', 'Website', 'Status', 'Instagram'];
    
    const csvRows = [
      headers.join(';'),
      ...leadsToExport.map(l => [
        `"${(l.business_name || '').replace(/"/g, '""')}"`,
        `"${(l.niche || '').replace(/"/g, '""')}"`,
        `"${(l.city || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.phone_type || '').replace(/"/g, '""')}"`,
        `"${(l.rating || '')}"`,
        `"${(l.website || '').replace(/"/g, '""')}"`,
        `"${(l.status || 'novo')}"`,
        `"${(l.instagram_url || '').replace(/"/g, '""')}"`
      ].join(';'))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_selecionados_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extrair nichos únicos para o filtro
  const uniqueNiches = [...new Set(savedLeads.map(l => l.niche).filter(Boolean))];

  // Filtragem
  const filteredLeads = savedLeads.filter(lead => {
    const matchesSearch = 
      (lead.business_name && lead.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.niche && lead.niche.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesNiche = nicheFilter === 'all' || lead.niche === nicheFilter;

    return matchesSearch && matchesStatus && matchesNiche;
  });

  // Paginação
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1.5">
              <Database size={13} />
              CRM Database V1.3
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Total de <b>{savedLeads.length}</b> leads salvos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Leads & Prospecção Ativa
          </h1>
          <p className="text-xs text-slate-400">
            Gerencie seus leads capturados do Google Maps, acompanhe o pipeline e dispare abordagens via WhatsApp.
          </p>
        </div>

        {/* Ações em Massa */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={exportSelectedCSV}
            disabled={selectedIds.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
            title="Exportar CSV estritamente dos leads selecionados"
          >
            <Download size={15} />
            Exportar Selecionados ({selectedIds.length})
          </button>

          <button
            type="button"
            onClick={deleteSelected}
            disabled={selectedIds.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Trash2 size={15} />
            Excluir Selecionados ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        
        {/* Pesquisa */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, cidade, nicho ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500 transition-all font-medium"
          />
        </div>

        {/* Filtro por Status */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-violet-500 font-bold cursor-pointer transition-all"
          >
            <option value="all">📂 Todos os Status</option>
            <option value="novo">🟡 Novo</option>
            <option value="contatado">🔵 Contatado</option>
            <option value="em_negociacao">🟣 Em Negociação</option>
            <option value="fechado">🟢 Fechado</option>
            <option value="sem_interesse">🔴 Sem Interesse</option>
          </select>
        </div>

        {/* Filtro por Nicho */}
        <div className="md:col-span-4">
          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-violet-500 font-bold cursor-pointer transition-all"
          >
            <option value="all">🏷️ Todos os Nichos</option>
            {uniqueNiches.map(niche => (
              <option key={niche} value={niche}>{niche}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Grid de Cards Estilo Dark SaaS (Slate-950/900 + Badges + Nota ⭐) */}
      <div className="space-y-4">
        
        {/* Barra de Seleção Global */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={displayedLeads.length > 0 && selectedIds.length === displayedLeads.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-500"
            />
            <span>Selecionar página atual ({displayedLeads.length} leads)</span>
          </div>

          <span>Exibindo Grid de Cards Dark SaaS</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold">Carregando base de leads...</p>
          </div>
        ) : displayedLeads.length === 0 ? (
          <div className="py-20 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
            <AlertCircle size={36} className="text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum lead encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tente ajustar sua busca ou realize uma nova extração no scraper do Google Maps.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedLeads.map(lead => {
              const isSelected = selectedIds.includes(lead.id);
              const isCelular = lead.phone_type === 'celular';
              const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
              const waUrl = isCelular && cleanPhone ? `https://wa.me/55${cleanPhone.startsWith('55') ? cleanPhone.slice(2) : cleanPhone}` : null;

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`group relative bg-slate-900 hover:bg-slate-900/95 border rounded-3xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:border-violet-500/50 ${
                    isSelected ? 'border-violet-500 bg-violet-950/10' : 'border-slate-800'
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1">
                          {lead.niche || 'Geral'}
                        </span>
                        
                        {lead.rating && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            {lead.rating} {lead.reviews_count ? `(${lead.reviews_count})` : ''}
                          </span>
                        )}
                      </div>

                      {/* Checkbox de Seleção */}
                      <div onClick={(e) => e.stopPropagation()} className="p-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelect(lead.id, e)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white tracking-tight group-hover:text-violet-300 transition-colors line-clamp-1">
                        {lead.business_name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={13} className="text-slate-500 flex-shrink-0" />
                        {lead.address || lead.city || 'Localização não informada'}
                      </p>
                    </div>
                  </div>

                  {/* Card Body / Info */}
                  <div className="py-4 my-3 border-y border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-500" />
                        Telefone:
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {lead.phone || 'Sem telefone'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Website:</span>
                      {lead.website ? (
                        <span className="text-violet-400 font-bold truncate max-w-[140px]">
                          {lead.website}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                          Sem site
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer / Status & Actions */}
                  <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Dropdown Inline de Status */}
                    <select
                      value={lead.status || 'novo'}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border outline-none cursor-pointer transition-all ${
                        CRM_STATUSES[lead.status]?.bg || CRM_STATUSES.novo.bg
                      }`}
                    >
                      <option value="novo">🟡 Novo</option>
                      <option value="contatado">🔵 Contatado</option>
                      <option value="em_negociacao">🟣 Em Negociação</option>
                      <option value="fechado">🟢 Fechado</option>
                      <option value="sem_interesse">🔴 Sem Interesse</option>
                    </select>

                    {/* Ações Rápidas (WhatsApp & Modal) */}
                    <div className="flex items-center gap-1.5">
                      {isCelular && waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare size={15} />
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/30 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Eye size={14} />
                        <span>Detalhes</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Controles de Paginação com Números (< 1 2 3 >) */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(startIndex + ITEMS_PER_PAGE, filteredLeads.length)}</b> de <b>{filteredLeads.length}</b> leads salvos
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

      {/* Modal Centralizado de Inspeção & Copy */}
      {selectedLead && (
        <LeadCardModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleStatusChange}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';
import LeadDrawer from './LeadDrawer.jsx';
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
  AlertCircle
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
  
  // Lead selecionado para a Gaveta Deslizante (LeadDrawer)
  const [selectedLead, setSelectedLead] = useState(null);

  // Paginação (Máximo 25 por página)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

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
      
      // Se a gaveta estiver aberta com esse lead, atualiza o lead na gaveta também
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
    e.stopPropagation();
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
      alert('Lead(s) removido(s) com sucesso!');
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  // Exportação Restrita EXCLUSIVAMENTE aos marcados via Checkbox
  const exportSelectedToExcel = () => {
    if (!selectedIds.length) {
      return alert('Selecione ao menos um lead via checkbox para exportar o arquivo.');
    }

    const leadsToExport = savedLeads.filter(l => selectedIds.includes(l.id));

    const headers = ['Empresa', 'Nicho', 'Cidade', 'Telefone', 'Tipo', 'Rating', 'Status', 'Tem Site', 'Website', 'Instagram', 'Facebook', 'Endereco', 'Copy WA'];
    
    const rows = leadsToExport.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${l.phone_type || ''}"`,
      `"${l.rating || ''}"`,
      `"${l.status || ''}"`,
      l.has_website ? 'Sim' : 'Não',
      `"${l.website_url || ''}"`,
      `"${l.instagram_url || ''}"`,
      `"${l.facebook_url || ''}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${(l.whatsapp_template || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtragem dos leads
  const filteredLeads = savedLeads.filter(lead => {
    const matchesSearch = 
      (lead.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.niche?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesNiche = nicheFilter === 'all' || lead.niche === nicheFilter;

    return matchesSearch && matchesStatus && matchesNiche;
  });

  // Lista única de nichos para o filtro dropdown
  const uniqueNiches = Array.from(new Set(savedLeads.map(l => l.niche).filter(Boolean)));

  // Paginação
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Estatísticas do Topo
  const totalLeads = savedLeads.length;
  const openLeads = savedLeads.filter(l => ['novo', 'contatado', 'em_negociacao'].includes(l.status)).length;
  const closedLeads = savedLeads.filter(l => l.status === 'fechado').length;

  return (
    <div className="w-full space-y-6">
      
      {/* Cards de Métricas (Dark SaaS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total na Base</p>
            <h3 className="text-2xl font-black text-white mt-1">{totalLeads}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Leads prospectados e salvos</p>
          </div>
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
            <Database size={24} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Em Aberto / Funil</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{openLeads}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Novos, contatados e em negociação</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes Fechados</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{closedLeads}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Vendas convertidas</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Tabela / Lista Principal */}
      <div className="w-full bg-slate-900 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
        
        {/* Barra de Busca e Filtros Superior */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="🔍 Buscar por empresa, cidade ou nicho..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs font-medium focus:border-violet-500 outline-none transition-colors"
              />
            </div>

            {/* Filtro Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 text-slate-300 border border-slate-800 py-2.5 px-3 rounded-xl text-xs font-medium focus:border-violet-500 outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="novo">🟡 Novo</option>
              <option value="contatado">🔵 Contatado</option>
              <option value="em_negociacao">🟣 Em Negociação</option>
              <option value="fechado">🟢 Fechado</option>
              <option value="sem_interesse">🔴 Sem Interesse</option>
            </select>

            {/* Filtro Nicho */}
            {uniqueNiches.length > 0 && (
              <select
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="bg-slate-950 text-slate-300 border border-slate-800 py-2.5 px-3 rounded-xl text-xs font-medium focus:border-violet-500 outline-none hidden lg:block"
              >
                <option value="all">Todos os Nichos</option>
                {uniqueNiches.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
          </div>

          {/* Botões de Ação Global (Exportar Checkbox / Excluir Checkbox) */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={exportSelectedToExcel}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                selectedIds.length > 0
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <Download size={15} />
              <span>Exportar Excel ({selectedIds.length})</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={deleteSelected}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Trash2 size={15} />
                <span>Excluir ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabela de Leads em Dark Mode */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
            <p>Carregando base de leads no Supabase...</p>
          </div>
        ) : displayedLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <AlertCircle size={32} className="mx-auto text-slate-600" />
            <p className="font-bold text-slate-300 text-sm">Nenhum lead encontrado.</p>
            <p className="text-xs">Tente ajustar seus termos de busca ou minerar novos estabelecimentos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 backdrop-blur-md z-10">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === displayedLeads.length && displayedLeads.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
                    />
                  </th>
                  <th className="p-4">Empresa / Local</th>
                  <th className="p-4">Nicho</th>
                  <th className="p-4">Redes & Site</th>
                  <th className="p-4">Contato / WhatsApp</th>
                  <th className="p-4">Status no Pipeline</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {displayedLeads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  const isCelular = lead.phone_type === 'celular';
                  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
                  const waUrl = isCelular && cleanPhone ? `https://wa.me/${cleanPhone}` : null;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`cursor-pointer transition-all duration-150 hover:bg-slate-800/50 ${
                        isSelected ? 'bg-violet-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelect(lead.id, e)}
                          className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
                        />
                      </td>

                      {/* Nome da Empresa + Cidade + Rating */}
                      <td className="p-4 space-y-1">
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                          <span>{lead.business_name}</span>
                          {lead.rating && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              <Star size={11} className="fill-amber-400" />
                              {lead.rating}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{lead.city}</p>
                      </td>

                      {/* Nicho */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                          {lead.niche || 'Geral'}
                        </span>
                      </td>

                      {/* Redes Sociais & Website */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {lead.has_website && lead.website_url ? (
                            <a
                              href={lead.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                              title="Website Institucional"
                            >
                              <Globe size={14} />
                            </a>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              SEM SITE
                            </span>
                          )}

                          {lead.instagram_url && (
                            <a
                              href={lead.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-colors"
                              title="Instagram"
                            >
                              <Instagram size={14} />
                            </a>
                          )}

                          {lead.facebook_url && (
                            <a
                              href={lead.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                              title="Facebook"
                            >
                              <Facebook size={14} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Telefone / Botão WhatsApp Inteligente */}
                      <td className="p-4 font-mono text-xs" onClick={(e) => e.stopPropagation()}>
                        {isCelular && waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-bold transition-all"
                          >
                            <MessageSquare size={13} />
                            <span>{lead.phone}</span>
                          </a>
                        ) : lead.phone ? (
                          <span className="text-slate-400 font-medium">
                            {lead.phone} <b className="text-amber-400 text-[10px] ml-1">(Fixo)</b>
                          </span>
                        ) : (
                          <span className="text-slate-500">Sem telefone</span>
                        )}
                      </td>

                      {/* Status no Pipeline (Dropdown Inline) */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status || 'novo'}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${
                            CRM_STATUSES[lead.status]?.bg || CRM_STATUSES.novo.bg
                          }`}
                        >
                          <option value="novo">🟡 Novo</option>
                          <option value="contatado">🔵 Contatado</option>
                          <option value="em_negociacao">🟣 Em Negociação</option>
                          <option value="fechado">🟢 Fechado</option>
                          <option value="sem_interesse">🔴 Sem Interesse</option>
                        </select>
                      </td>

                      {/* Ações (Olho 👁️ para abrir Gaveta) */}
                      <td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-lg border border-violet-500/30 transition-all"
                          title="Visualizar Lead e Copiar Copy"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(startIndex + ITEMS_PER_PAGE, filteredLeads.length)}</b> de <b>{filteredLeads.length}</b> leads salvos
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-800 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-bold text-slate-200 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-800 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Componente de Gaveta Lateral Deslizante */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleStatusChange}
        />
      )}
    </div>
  );
}

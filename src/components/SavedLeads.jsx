import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';

const CRM_STATUSES = {
  novo: { label: '🟡 Novo', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  contatado: { label: '🔵 Contatado', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  em_negociacao: { label: '🟣 Em Negociação', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  fechado: { label: '🟢 Fechado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  sem_interesse: { label: '🔴 Sem Interesse', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
};

export default function SavedLeads() {
  const [savedLeads, setSavedLeads] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros de Status e Nicho
  const [statusFilter, setStatusFilter] = useState('all');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [selectedCopy, setSelectedCopy] = useState(null);

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
      setSavedLeads(savedLeads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return alert('Selecione ao menos um lead para excluir.');
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

  const exportToExcel = (leadsToExport) => {
    if (!leadsToExport.length) return alert('Nenhum lead para exportar.');

    const headers = ['Empresa', 'Nicho', 'Cidade', 'Telefone', 'Tipo', 'Status CRM', 'Possui Site', 'Nota Google', 'Avaliações', 'Endereço', 'Data Cadastro'];
    
    const rows = leadsToExport.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      l.phone_type || 'desconhecido',
      l.status || 'novo',
      l.has_website ? 'Sim' : 'Não',
      l.rating || 'N/A',
      l.reviews_count || 0,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${new Date(l.created_at).toLocaleDateString('pt-BR')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `banco_leads_crm_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extrai lista única de nichos dinamicamente a partir dos leads do banco
  const availableNiches = Array.from(new Set(savedLeads.map(l => l.niche).filter(Boolean))).sort();

  // Aplicação dos Filtros de Texto, Status e Nicho
  const filteredLeads = savedLeads.filter(l => {
    const matchesSearch = 
      (l.business_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.niche || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.city || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || (l.status || 'novo') === statusFilter;
    const matchesNiche = nicheFilter === 'all' || l.niche === nicheFilter;

    return matchesSearch && matchesStatus && matchesNiche;
  });

  // Cálculo da Paginação
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      
      {/* Barra de Filtros do CRM */}
      <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Banco de Leads Salvos ({savedLeads.length})</h2>
          <p className="text-xs text-slate-400">Gerencie o pipeline de atendimento dos seus clientes</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-wrap">
          
          {/* Filtro Dinâmico por Nicho */}
          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs w-full sm:w-auto focus:outline-none"
          >
            <option value="all">🎯 Todos os Nichos</option>
            {availableNiches.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          {/* Filtro por Status CRM */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs w-full sm:w-auto focus:outline-none"
          >
            <option value="all">🔍 Todos os Status</option>
            <option value="novo">🟡 Novo</option>
            <option value="contatado">🔵 Contatado</option>
            <option value="em_negociacao">🟣 Em Negociação</option>
            <option value="fechado">🟢 Fechado</option>
            <option value="sem_interesse">🔴 Sem Interesse</option>
          </select>

          {/* Busca Textual */}
          <input
            type="text"
            placeholder="Buscar nome, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs w-full sm:w-48 focus:outline-none"
          />

          {/* Exclusão Lote */}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={deleteSelected}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap shadow-md"
            >
              🗑️ Excluir ({selectedIds.length})
            </button>
          )}

          {/* Exportar Excel */}
          <button
            type="button"
            onClick={() => exportToExcel(filteredLeads)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 whitespace-nowrap shadow-md"
          >
            <span>📊</span> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 animate-pulse">Carregando leads do Supabase...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center text-slate-500">Nenhum lead encontrado com os filtros selecionados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-4">Empresa / Cidade</th>
                <th className="p-4">Status CRM</th>
                <th className="p-4">CTA WhatsApp</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedLeads.map((lead) => {
                const currentStatus = lead.status || 'novo';
                const waLink = lead.phone
                  ? `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(lead.whatsapp_template || '')}`
                  : null;

                return (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{lead.business_name}</div>
                      <div className="text-xs text-slate-400">{lead.niche} • {lead.city}</div>
                    </td>

                    <td className="p-4">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-bold border rounded-lg px-2.5 py-1 focus:outline-none ${
                          CRM_STATUSES[currentStatus]?.bg || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <option value="novo">🟡 Novo</option>
                        <option value="contatado">🔵 Contatado</option>
                        <option value="em_negociacao">🟣 Em Negociação</option>
                        <option value="fechado">🟢 Fechado</option>
                        <option value="sem_interesse">🔴 Sem Interesse</option>
                      </select>
                    </td>

                    {/* Botão do CTA Direto Exclusivo dos Leads Salvos */}
                    <td className="p-4">
                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all shadow-sm"
                        >
                          <span>💬</span> +{lead.phone}
                          {lead.phone_type === 'fixo' && <span className="text-[10px] text-slate-400 font-normal">(Fixo)</span>}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">Sem número</span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCopy(lead.whatsapp_template)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        Ver Copy
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>
            Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(startIndex + ITEMS_PER_PAGE, filteredLeads.length)}</b> de <b>{filteredLeads.length}</b> leads salvos
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-100 transition-all"
            >
              ◀ Anterior
            </button>
            <span className="font-bold text-slate-800 px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-100 transition-all"
            >
              Próximo ▶
            </button>
          </div>
        </div>
      )}

      {/* Modal de Copy */}
      {selectedCopy && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Template WhatsApp</h3>
            <textarea
              readOnly
              className="w-full h-52 p-3 bg-slate-50 border rounded-xl text-xs font-mono"
              value={selectedCopy}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedCopy);
                  alert('Copy copiada!');
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Copiar
              </button>
              <button 
                type="button"
                onClick={() => setSelectedCopy(null)} 
                className="bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold"
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
                    

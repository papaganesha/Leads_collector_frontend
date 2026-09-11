import React, { useState, useEffect } from 'react';

export default function LeadTable({ leads, onSave, onClear, isSaving }) {
  const [selectedLeads, setSelectedLeads] = useState(leads.map((_, index) => index));
  const [selectedCopy, setSelectedCopy] = useState(null);

  // Estados de Paginação (Máximo 25 por página)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    setSelectedLeads(leads.map((_, index) => index));
    setCurrentPage(1);
  }, [leads]);

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((_, index) => index));
    }
  };

  const toggleSelectLead = (index) => {
    if (selectedLeads.includes(index)) {
      setSelectedLeads(selectedLeads.filter(i => i !== index));
    } else {
      setSelectedLeads([...selectedLeads, index]);
    }
  };

  const exportToExcel = () => {
    const leadsToExport = selectedLeads.map(i => leads[i]);
    if (!leadsToExport.length) return alert('Selecione ao menos um lead para exportar.');

    const headers = ['Empresa', 'Nicho', 'Cidade', 'Telefone', 'Tipo', 'Possui Site', 'Nota Google', 'Avaliações', 'Endereço'];
    const rows = leadsToExport.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      l.phone_type || 'desconhecido',
      l.has_website ? 'Sim' : 'Não',
      l.rating || 'N/A',
      l.reviews_count || 0,
      `"${(l.address || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_extraidos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cálculo da Paginação
  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedLeads = leads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      
      {/* Barra de Ações com Ordem Reorganizada */}
      <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* 1. Número de Selecionados */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-3 py-1.5 rounded-lg text-sm">
            {selectedLeads.length} de {leads.length} selecionados
          </span>
        </div>

        {/* Botões na ordem solicitada */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
          {/* 2. Salvar Leads */}
          <button
            type="button"
            onClick={() => onSave(selectedLeads.map(i => leads[i]))}
            disabled={selectedLeads.length === 0 || isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 text-xs flex items-center gap-2 shadow-sm"
          >
            {isSaving ? 'Salvando...' : '💾 Salvar no Supabase'}
          </button>

          {/* 3. Exportar Excel */}
          <button
            type="button"
            onClick={exportToExcel}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-700 flex items-center gap-2"
          >
            <span>📊</span> Exportar Excel
          </button>

          {/* 4. Limpar Lista */}
          <button
            type="button"
            onClick={onClear}
            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1"
          >
            🧹 Limpar Lista
          </button>
        </div>
      </div>

      {/* Tabela de Resultados sem Botões de Link no Telefone */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b">
            <tr>
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-4">Empresa</th>
              <th className="p-4">Nota Google</th>
              <th className="p-4">Telefone</th>
              <th className="p-4">Site</th>
              <th className="p-4 text-right">Abordagem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedLeads.map((lead, relativeIndex) => {
              const globalIndex = startIndex + relativeIndex;

              return (
                <tr key={globalIndex} className="hover:bg-slate-50">
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(globalIndex)}
                      onChange={() => toggleSelectLead(globalIndex)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{lead.business_name}</div>
                    <div className="text-xs text-slate-400">{lead.address}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold">
                    {lead.rating ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                        ⭐ {lead.rating} <span className="text-slate-400">({lead.reviews_count || 0})</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Sem nota</span>
                    )}
                  </td>

                  {/* Telefone Formatado como Texto Simples */}
                  <td className="p-4 font-mono text-xs font-semibold text-slate-700">
                    {lead.phone ? (
                      <span>
                        +{lead.phone}
                        {lead.phone_type === 'fixo' && <span className="ml-1.5 text-[10px] text-slate-400 font-normal">(Fixo)</span>}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">Não informado</span>
                    )}
                  </td>

                  <td className="p-4">
                    {lead.has_website ? (
                      <span className="text-amber-800 bg-amber-100 text-xs px-2.5 py-1 rounded-full font-bold">Com Site</span>
                    ) : (
                      <span className="text-emerald-800 bg-emerald-100 text-xs px-2.5 py-1 rounded-full font-bold">Sem Site 🎯</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCopy(lead.whatsapp_template)}
                      className="text-indigo-600 hover:underline text-xs font-bold"
                    >
                      Ver Copy WA
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>
            Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(startIndex + ITEMS_PER_PAGE, leads.length)}</b> de <b>{leads.length}</b> leads
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
              className="w-full h-48 p-3 bg-slate-50 border rounded-xl text-xs font-mono"
              value={selectedCopy}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedCopy);
                  alert('Copiado!');
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

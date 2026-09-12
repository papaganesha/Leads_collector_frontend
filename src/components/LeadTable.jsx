import React, { useState, useEffect } from 'react';

export default function LeadTable({ leads, onSave, onClear, isSaving }) {
  const [selectedLeads, setSelectedLeads] = useState(leads.map((_, index) => index));
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState(null);

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

    const headers = ['Empresa', 'Nicho', 'Cidade', 'Telefone', 'Tipo', 'Possui Site', 'Instagram', 'Facebook', 'Nota Google', 'Avaliações', 'Endereço'];
    const rows = leadsToExport.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      l.phone_type || 'desconhecido',
      l.has_website ? 'Sim' : 'Não',
      `"${(l.instagram_url || '').replace(/"/g, '""')}"`,
      `"${(l.facebook_url || '').replace(/"/g, '""')}"`,
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

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedLeads = leads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      
      {/* Barra de Ações Polida */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-medium text-slate-500">
            Selecionados: <span className="text-slate-900 font-semibold">{selectedLeads.length}</span> / {leads.length}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onSave(selectedLeads.map(i => leads[i]))}
            disabled={selectedLeads.length === 0 || isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 text-sm shadow-sm"
          >
            {isSaving ? 'Salvando…' : 'Salvar no CRM'}
          </button>

          <button
            type="button"
            onClick={exportToExcel}
            disabled={selectedLeads.length === 0}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 text-sm shadow-sm"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabela Polida */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0"
                />
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nicho</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {displayedLeads.map((lead, idx) => {
              const actualIndex = startIndex + idx;
              return (
                <tr key={actualIndex} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <input 
                      type="checkbox"
                      checked={selectedLeads.includes(actualIndex)}
                      onChange={() => toggleSelectLead(actualIndex)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{lead.business_name}</div>
                    <div className="text-xs text-slate-500">{lead.address || 'Sem endereço'}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{lead.niche}</td>
                  <td className="p-4 font-mono text-sm text-slate-700">{lead.phone}</td>
                  <td className="p-4">
                     <button
                       onClick={() => {
                         const copy = `Olá! Vi seu perfil no Google Maps e gostaria de oferecer...\n\nEmpresa: ${lead.business_name}`;
                         setSelectedCopy(copy);
                       }}
                       className="text-slate-500 hover:text-slate-900 font-medium text-sm"
                     >
                       Abordagem
                     </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-sm">
          <span className="text-slate-500">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

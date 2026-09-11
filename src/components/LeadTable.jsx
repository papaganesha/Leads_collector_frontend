import React, { useState } from 'react';

export default function LeadTable({ leads, onSave, onClear, isSaving }) {
  const [selectedLeads, setSelectedLeads] = useState(leads.map((_, index) => index));
  const [selectedCopy, setSelectedCopy] = useState(null);

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

    const headers = ['Empresa', 'Nicho', 'Cidade', 'Telefone', 'Possui Site', 'Nota Google', 'Avaliações', 'Endereço'];
    const rows = leadsToExport.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
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

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Barra de Ações */}
      <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-3 py-1 rounded-lg text-sm">
            {selectedLeads.length} de {leads.length} selecionados
          </span>
          <button
            type="button"
            onClick={onClear}
            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1"
          >
            🧹 Limpar Lista
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={exportToExcel}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-700 flex items-center gap-2"
          >
            <span>📊</span> Exportar Excel
          </button>

          <button
            type="button"
            onClick={() => onSave(selectedLeads.map(i => leads[i]))}
            disabled={selectedLeads.length === 0 || isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all disabled:opacity-50 text-xs flex items-center gap-2"
          >
            {isSaving ? 'Salvando...' : '💾 Salvar no Supabase'}
          </button>
        </div>
      </div>

      {/* Tabela */}
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
              <th className="p-4">WhatsApp (CTA Direto)</th>
              <th className="p-4">Site</th>
              <th className="p-4 text-right">Abordagem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead, index) => {
              const waLink = lead.phone 
                ? `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(lead.whatsapp_template)}`
                : null;

              return (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(index)}
                      onChange={() => toggleSelectLead(index)}
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
                  <td className="p-4">
                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all"
                      >
                        <span>💬</span> +{lead.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-mono text-xs">Não encontrado</span>
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

      {/* Modal Copy */}
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

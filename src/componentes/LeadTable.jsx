import React, { useState } from 'react';

export default function LeadTable({ leads, onSave, isSaving }) {
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

  const handleSaveSelected = () => {
    const leadsToSave = selectedLeads.map(index => leads[index]);
    onSave(leadsToSave);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden transition-all">
      {/* Barra de Ações Superior */}
      <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-3 py-1 rounded-lg text-sm">
            {selectedLeads.length} de {leads.length} selecionados
          </span>
          <span className="text-xs text-slate-400">Prontos para aprovação</span>
        </div>

        <button
          onClick={handleSaveSelected}
          disabled={selectedLeads.length === 0 || isSaving}
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {isSaving ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Aprovar & Salvar no Supabase</span>
            </>
          )}
        </button>
      </div>

      {/* Tabela de Leads */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
            <tr>
              <th className="p-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={selectedLeads.length === leads.length && leads.length > 0} 
                  onChange={toggleSelectAll} 
                />
              </th>
              <th className="p-4">Empresa</th>
              <th className="p-4">WhatsApp / Telefone</th>
              <th className="p-4">Status de Site</th>
              <th className="p-4 text-right">Abordagem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead, index) => (
              <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedLeads.includes(index)}
                    onChange={() => toggleSelectLead(index)}
                  />
                </td>
                <td className="p-4">
                  <div className="font-bold text-slate-900">{lead.business_name}</div>
                  <div className="text-xs text-slate-400">{lead.address}</div>
                </td>
                <td className="p-4 font-mono text-slate-700">
                  {lead.phone ? (
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold">{lead.phone}</span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Não identificado</span>
                  )}
                </td>
                <td className="p-4">
                  {lead.has_website ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/60 text-xs px-2.5 py-1 rounded-full font-bold">
                      <span>🌐</span> Com Site
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs px-2.5 py-1 rounded-full font-bold">
                      <span>🎯</span> Sem Site
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelectedCopy(lead.whatsapp_template)}
                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    <span>💬</span> Ver Copy WA
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal da Copy de Abordagem */}
      {selectedCopy && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <span>📲</span> Template WhatsApp (Jpas Tech)
              </h3>
              <button onClick={() => setSelectedCopy(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                &times;
              </button>
            </div>

            <textarea
              readOnly
              className="w-full h-52 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono leading-relaxed focus:outline-none"
              value={selectedCopy}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedCopy);
                  alert('Copy copiada para a área de transferência!');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>📋</span> Copiar Texto
              </button>
              <button 
                onClick={() => setSelectedCopy(null)} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
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

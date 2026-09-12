import React, { useState, useEffect } from 'react';

export default function LeadTable({ leads, onSave, onClear, isSaving }) {
  const [selectedLeads, setSelectedLeads] = useState(leads.map((_, index) => index));
  const [selectedCopy, setSelectedCopy] = useState(null);

  // Estados de Paginação (Máximo 25 por página)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [leads, searchTerm, itemsPerPage]);

  const filteredLeads = leads.filter(lead => 
    (lead.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (lead.niche?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className=\"w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden\">
      
      {/* Barra de Ações com Ordem Reorganizada */}
      <div className=\"p-5 bg-slate-900 text-white flex flex-col gap-4\">
        <div className=\"flex flex-wrap items-center gap-4 w-full\">
          <input
            type=\"text\"
            placeholder=\"🔍 Buscar empresa ou nicho...\"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=\"flex-1 p-2 rounded-lg text-slate-900 border-none outline-none focus:ring-2 focus:ring-indigo-500\"
          />
          <select 
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className=\"bg-slate-800 text-white p-2 rounded-lg border border-slate-700\"
          >
            {[20, 30, 40].map(val => <option key={val} value={val}>{val} por página</option>)}
          </select>
        </div>

        <div className=\"flex flex-col sm:flex-row justify-between items-center gap-4\">
          <div className=\"flex items-center gap-3 w-full sm:w-auto\">
            <span className=\"bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-3 py-1.5 rounded-lg text-sm\">
              {selectedLeads.length} de {filteredLeads.length} selecionados
            </span>
          </div>

          <div className=\"flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end\">
            <button
              type=\"button\"
              onClick={() => onSave(selectedLeads.map(i => leads[i]))}
              disabled={selectedLeads.length === 0 || isSaving}
              className=\"bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 text-xs flex items-center gap-2 shadow-sm\"
            >
              {isSaving ? 'Salvando...' : '💾 Salvar no Supabase'}
            </button>

            <button
              type=\"button\"
              onClick={exportToExcel}
              className=\"bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-700 flex items-center gap-2\"
            >
              <span>📊</span> Exportar Excel
            </button>

            <button
              type=\"button\"
              onClick={onClear}
              className=\"bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1\"
            >
              🧹 Limpar Lista
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Resultados sem Botões de Link no Telefone */}
      <div className=\"overflow-x-auto\">
        <table className=\"w-full text-left text-sm text-slate-600\">
          <thead className=\"bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b\">
            <tr>
              <th className=\"p-4 w-12 text-center\">
                <input
                  type=\"checkbox\"
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className=\"p-4\">Empresa</th>
              <th className=\"p-4\">Nota Google</th>
              <th className=\"p-4\">Telefone</th>
              <th className=\"p-4\">Site</th>
              <th className=\"p-4 text-right\">Abordagem</th>
            </tr>
          </thead>
          <tbody>
            {displayedLeads.map((lead, index) => {
              const originalIndex = leads.indexOf(lead);
              return (
                <tr key={originalIndex} className=\"border-b hover:bg-slate-50 transition-colors\">
                  <td className=\"p-4 text-center\">
                    <input
                      type=\"checkbox\"
                      checked={selectedLeads.includes(originalIndex)}
                      onChange={() => toggleLead(originalIndex)}
                    />
                  </td>
                  <td className=\"p-4 font-medium text-slate-900\">
                    {lead.business_name}
                    <div className=\"text-[10px] text-slate-400\">{lead.niche}</div>
                  </td>
                  <td className=\"p-4 font-bold text-amber-500\">
                    {lead.rating || 'N/A'}
                    <span className=\"text-slate-400 font-normal ml-1\">({lead.reviews || 0})</span>
                  </td>
                  <td className=\"p-4 font-medium\">
                    {lead.phone ? (
                      <span className=\"flex items-center\">
                        {lead.phone}
                        {lead.phone_type === 'fixo' && <span className=\"ml-1.5 text-[10px] text-slate-400 font-normal\">(Fixo)</span>}
                      </span>
                    ) : (
                      <span className=\"text-slate-400 font-normal\">Não informado</span>
                    )}
                  </td>

                  <td className=\"p-4\">
                    {lead.has_website ? (
                      <span className=\"text-amber-800 bg-amber-100 text-xs px-2.5 py-1 rounded-full font-bold\">Com Site</span>
                    ) : (
                      <span className=\"text-emerald-800 bg-emerald-100 text-xs px-2.5 py-1 rounded-full font-bold\">Sem Site 🎯</span>
                    )}
                  </td>
                  <td className=\"p-4 text-right\">
                    <button
                      type=\"button\"
                      onClick={() => setSelectedCopy(lead.whatsapp_template)}
                      className=\"text-indigo-600 hover:underline text-xs font-bold\"
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
        <div className=\"p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600\">
          <span>
            Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(startIndex + itemsPerPage, leads.length)}</b> de <b>{leads.length}</b> leads
          </span>
          <div className=\"flex items-center gap-2\">
            <button
              type=\"button\"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className=\"px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-100 transition-all\"
            >
              ◀ Anterior
            </button>
            <span className=\"font-bold text-slate-800 px-2\">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type=\"button\"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className=\"px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-100 transition-all\"
            >
              Próximo ▶
            </button>
          </div>
        </div>
      )}

      {/* Modal de Copy */}
      {selectedCopy && (
        <div className=\"fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50\">
          <div className=\"bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl\">
            <h3 className=\"font-bold text-lg text-slate-900\">Template WhatsApp</h3>
            <textarea
              readOnly
              className=\"w-full h-48 p-3 bg-slate-50 border rounded-xl text-xs font-mono\"
              value={selectedCopy}
            />
            <div className=\"flex justify-end gap-2\">
              <button
                type=\"button\"
                onClick={() => {
                  navigator.clipboard.writeText(selectedCopy);
                  alert('Copiado!');
                }}
                className=\"bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold\"
              >
                Copiar
              </button>
              <button
                type=\"button\"
                onClick={() => setSelectedCopy(null)}
                className=\"bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold\"
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

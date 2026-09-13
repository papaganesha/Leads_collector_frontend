import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  Sparkles, 
  MessageSquare, 
  Save, 
  X,
  AlertCircle
} from 'lucide-react';

// 3 Templates Iniciais Obrigatórios
export const INITIAL_DEFAULT_TEMPLATES = [
  {
    id: 'default',
    name: '🎯 Padrão de Prospecção (Personalizado)',
    text: 'Olá {empresa}, tudo bem? Soube que vocês são referência em {nicho} em {city}. Olhei o perfil de vocês no Google e notei que vocês ainda não possuem um site profissional otimizado para captar clientes na internet. Nós da Jpas Tech criamos máquinas de vendas automatizadas que colocam seu negócio no topo do Google. Faz sentido conversarmos 5 minutinhos esta semana?'
  },
  {
    id: 'sem_site',
    name: '🚀 Focado em Oportunidade (Sem Site)',
    text: 'Olá equipe da {empresa}, achei vocês aqui pelo Google Maps e vi que estão com excelentes avaliações ({rating} ⭐)! Uma pena que notei que vocês não têm site próprio. Hoje mais de 80% dos clientes buscam serviços no Google antes de decidir. Vocês estão perdendo clientes para a concorrência todos os dias. Posso te mostrar como resolver isso em 10 minutos?'
  },
  {
    id: 'curto',
    name: '⚡ Abordagem Curta & Direta',
    text: 'Oi {empresa}, tudo bem? Soube que vocês são destaque em {nicho} em {city}. Sou especialista em posicionar empresas no topo do Google e gerar novos clientes no automático. Tem 5 minutos hoje para eu te mostrar uma demonstração rápida?'
  }
];

export default function CopyTemplates() {
  const [templates, setTemplates] = useState(() => {
    try {
      const stored = localStorage.getItem('jpas_copy_templates_v1.3');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEFAULT_TEMPLATES;
  });

  const [editingId, setEditingId] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    localStorage.setItem('jpas_copy_templates_v1.3', JSON.stringify(templates));
  }, [templates]);

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setNameInput('');
    setTextInput('');
  };

  const handleStartEdit = (tpl) => {
    setIsCreating(false);
    setEditingId(tpl.id);
    setNameInput(tpl.name);
    setTextInput(tpl.text);
  };

  const handleSave = () => {
    if (!nameInput.trim() || !textInput.trim()) {
      alert('Preencha o nome e o texto do template.');
      return;
    }

    if (isCreating) {
      const newTpl = {
        id: 'tpl_' + Date.now(),
        name: nameInput.trim(),
        text: textInput.trim()
      };
      setTemplates([...templates, newTpl]);
    } else if (editingId) {
      setTemplates(templates.map(t => t.id === editingId ? { ...t, name: nameInput.trim(), text: textInput.trim() } : t));
    }

    setIsCreating(false);
    setEditingId(null);
    setNameInput('');
    setTextInput('');
  };

  const handleDelete = (id) => {
    if (templates.length <= 1) {
      alert('Você precisa manter ao menos um template de copy.');
      return;
    }
    if (!confirm('Deseja realmente excluir este template de copy?')) return;
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleResetDefaults = () => {
    if (!confirm('Deseja restaurar os templates padrão originais? Os personalizados serão mantidos.')) return;
    const existingIds = templates.map(t => t.id);
    const missing = INITIAL_DEFAULT_TEMPLATES.filter(d => !existingIds.includes(d.id));
    setTemplates([...templates, ...missing]);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1.5">
              <FileText size={13} />
              Gestão de Abordagem V1.3
            </span>
            <span className="text-sm text-slate-400 font-medium">
              Total de <b>{templates.length}</b> modelos cadastrados
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Modelos de Copy para WhatsApp
          </h1>
          <p className="text-sm text-slate-400">
            Cadastre, edite e organize suas mensagens de prospecção. Variáveis como <code className="text-violet-400 font-mono">{'{empresa}'}</code>, <code className="text-violet-400 font-mono">{'{nicho}'}</code>, <code className="text-violet-400 font-mono">{'{city}'}</code> e <code className="text-violet-400 font-mono">{'{rating}'}</code> são substituídas automaticamente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-all"
          >
            Restaurar Padrões
          </button>

          <button
            type="button"
            onClick={handleStartCreate}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
          >
            <Plus size={18} />
            Novo Template
          </button>
        </div>
      </div>

      {/* Caixa de Criação / Edição */}
      {(isCreating || editingId) && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-violet-500/40 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles size={18} className="text-violet-400" />
              {isCreating ? 'Criar Novo Template de Copy' : 'Editar Template'}
            </h3>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setEditingId(null); }}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Nome do Template
              </label>
              <input
                type="text"
                placeholder="Ex: 🎯 Abordagem Para Academias"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-violet-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Texto da Mensagem
              </label>
              <textarea
                rows={5}
                placeholder="Olá {empresa}, vi que vocês são destaque em {nicho} em {city}..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 focus:border-violet-500 outline-none leading-relaxed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Variáveis suportadas: <code className="text-violet-400">{'{empresa}'}</code>, <code className="text-violet-400">{'{nicho}'}</code>, <code className="text-violet-400">{'{city}'}</code>, <code className="text-violet-400">{'{rating}'}</code>.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setEditingId(null); }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-md"
              >
                <Save size={16} />
                Salvar Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-violet-400 flex-shrink-0" />
                  {tpl.name}
                </h3>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(tpl.text, tpl.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    title="Copiar texto"
                  >
                    {copiedId === tpl.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(tpl)}
                    className="p-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/30 transition-all"
                    title="Editar"
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(tpl.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <p className="text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {tpl.text}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
              <span>ID: {tpl.id}</span>
              <span className="text-violet-400 font-semibold">Pronto para uso no CRM</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { Turma } from '../types';
import { Plus, Trash2, Users } from 'lucide-react';

interface TurmasProps {
  turmas: Turma[];
  token: string | null;
  onDataChanged: () => void;
}

export function TurmasConfig({ turmas, token, onDataChanged }: TurmasProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    modalidade: 'Fundamental',
    turno: 'Matutino',
    curso: 'Regular',
    serie: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/turmas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      setIsAdding(false);
      setFormData({ nome: '', modalidade: 'Fundamental', turno: 'Matutino', curso: 'Regular', serie: '' });
      onDataChanged();
    } catch (err) {
      alert("Erro ao salvar turma");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta turma? Os alunos não serão excluídos, mas ficarão sem turma associada se remover a referência.")) {
      try {
        await fetch(`/api/turmas/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        onDataChanged();
      } catch (err) {
        alert("Erro ao excluir turma");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gerenciar Turmas</h2>
          <p className="text-sm text-slate-500">Cadastre e organize as turmas da escola.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Adicionar Nova Turma</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Turma (Ex: 6º Ano A)</label>
              <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modalidade</label>
              <select value={formData.modalidade} onChange={e => setFormData({...formData, modalidade: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                <option value="Fundamental">Ensino Fundamental</option>
                <option value="Médio">Ensino Médio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Série / Ano</label>
              <input required type="text" placeholder="Ex: 6º Ano" value={formData.serie} onChange={e => setFormData({...formData, serie: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
              <select value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
                <option value="Integral">Integral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
              <input type="text" placeholder="Ex: Regular" value={formData.curso} onChange={e => setFormData({...formData, curso: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            
            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition">Salvar Turma</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
            Nenhuma turma cadastrada. Adicione uma turma para começar.
          </div>
        )}
        {turmas.map(turma => (
          <div key={turma.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col relative group">
            <button 
              onClick={() => handleDelete(turma.id)} 
              className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded transition opacity-0 group-hover:opacity-100"
              title="Excluir Turma"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">{turma.nome}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {turma.modalidade}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600 mb-4 flex-grow">
              <div className="flex justify-between">
                <span className="text-slate-400">Série:</span>
                <span className="font-medium text-slate-800">{turma.serie}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Turno:</span>
                <span className="font-medium text-slate-800">{turma.turno}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Curso:</span>
                <span className="font-medium text-slate-800">{turma.curso || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Plus, Trash2, Shield } from 'lucide-react';

interface CoordenadoresProps {
  token: string | null;
  currentUser: User | null;
}

export function Coordenadores({ token, currentUser }: CoordenadoresProps) {
  const [coordenadores, setCoordenadores] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });

  const fetchCoordenadores = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoordenadores(data);
      }
    } catch (err) {
      console.error("Erro ao carregar coordenadores", err);
    }
  };

  useEffect(() => {
    if (token) fetchCoordenadores();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsAdding(false);
        setFormData({ name: '', username: '', password: '' });
        fetchCoordenadores();
      } else {
        const errData = await res.json();
        alert("Erro: " + (errData.error || "Não foi possível cadastrar o coordenador."));
      }
    } catch (err) {
      alert("Erro ao salvar coordenador");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este coordenador? Ele perderá o acesso ao sistema imediatamente.")) {
      try {
        const res = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          fetchCoordenadores();
        } else {
          const errData = await res.json();
          alert("Erro: " + (errData.error || "Não foi possível excluir."));
        }
      } catch (err) {
        alert("Erro ao excluir coordenador");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Coordenadores</h2>
          <p className="text-sm text-slate-500">Gerencie quem tem acesso total ao sistema de Conselho de Classe.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Novo Coordenador
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Cadastrar Coordenador</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input 
                required 
                type="text" 
                placeholder="Ex: Ana Silva"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuário de Acesso</label>
              <input 
                required 
                type="text" 
                placeholder="Ex: ana.silva"
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input 
                required 
                type="password" 
                placeholder="********"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition">Salvar Coordenador</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coordenadores.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
            Carregando coordenadores...
          </div>
        )}
        
        {coordenadores.map(coord => {
          const isMe = currentUser?.id === coord.id;
          const isMainGestor = coord.username === 'GestaoFLC';
          
          return (
            <div key={coord.id} className={`bg-white rounded-lg border ${isMe ? 'border-indigo-300 ring-1 ring-indigo-50' : 'border-slate-200'} shadow-sm p-5 flex flex-col relative group`}>
              {!isMe && !isMainGestor && (
                <button 
                  onClick={() => handleDelete(coord.id)} 
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded transition opacity-0 group-hover:opacity-100"
                  title="Excluir Coordenador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {coord.name} {isMe && <span className="text-xs font-normal text-indigo-600 ml-1">(Você)</span>}
                  </h3>
                  <span className="text-sm font-medium text-slate-500">
                    @{coord.username}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

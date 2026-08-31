import React, { useState } from 'react';
import { Student, Turma, Classification, Observation, Forwarding } from '../types';
import { Plus, Upload, Trash2, Search, FileText } from 'lucide-react';
import { StudentProfileModal } from './StudentProfileModal';

interface AlunosProps {
  students: Student[];
  turmas: Turma[];
  classifications: Classification[];
  observations: Observation[];
  forwardings: Forwarding[];
  token: string | null;
  onDataChanged: () => void;
}

export function Alunos({ students, turmas, classifications, observations, forwardings, token, onDataChanged }: AlunosProps) {
  const [selectedProfile, setSelectedProfile] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    cod: '',
    nome: '',
    paed: 'NAO',
    turma: '',
    turno: 'Matutino',
    serie: '',
    curso: 'Fundamental',
    modalidade: 'Regular'
  });
  
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const filtered = students.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cod.includes(searchTerm) ||
    s.turma.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          paed: formData.paed === 'SIM'
        })
      });
      setIsAdding(false);
      setFormData({ cod: '', nome: '', paed: 'NAO', turma: '', turno: 'Matutino', serie: '', curso: 'Fundamental', modalidade: 'Regular' });
      onDataChanged();
    } catch (err) {
      alert("Erro ao salvar aluno");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        await fetch(`/api/students/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        onDataChanged();
      } catch (err) {
        alert("Erro ao excluir aluno");
      }
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importText);
      if (!Array.isArray(data)) {
        alert("O formato deve ser um array JSON de alunos.");
        return;
      }
      
      let count = 0;
      for (const student of data) {
        // Removendo id pra deixar o banco gerar
        const { id, ...studentData } = student;
        await fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...studentData,
            paed: studentData.paed === 'SIM' || studentData.paed === true
          })
        });
        count++;
      }
      alert(`${count} alunos importados com sucesso!`);
      setIsImporting(false);
      setImportText('');
      onDataChanged();
    } catch (e) {
      alert("Erro ao importar: " + (e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, código ou turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImporting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 font-medium transition"
          >
            <Upload className="w-4 h-4" />
            Importar JSON
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Novo Aluno
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Adicionar Novo Aluno</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RA / Código</label>
              <input required type="text" value={formData.cod} onChange={e => setFormData({...formData, cod: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Turma</label>
              <select 
                required 
                value={formData.turma} 
                onChange={e => {
                  const selectedTurma = turmas.find(t => t.nome === e.target.value);
                  if (selectedTurma) {
                    setFormData({
                      ...formData, 
                      turma: selectedTurma.nome,
                      serie: selectedTurma.serie,
                      curso: selectedTurma.curso,
                      turno: selectedTurma.turno,
                      modalidade: selectedTurma.modalidade
                    });
                  } else {
                    setFormData({...formData, turma: e.target.value});
                  }
                }} 
                className="w-full p-2 border border-slate-300 rounded-md bg-white"
              >
                <option value="" disabled>Selecione uma turma...</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.nome}>{t.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAED (Público Alvo Ed. Especial)</label>
              <select value={formData.paed} onChange={e => setFormData({...formData, paed: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md">
                <option value="NAO">NÃO</option>
                <option value="SIM">SIM</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">Salvar Aluno</button>
            </div>
          </form>
        </div>
      )}

      {isImporting && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Importar Alunos (JSON)</h3>
          <p className="text-sm text-slate-500 mb-4">
            Cole aqui o array JSON contendo os alunos. Exemplo: 
            <code className="block mt-2 p-2 bg-slate-100 text-xs text-slate-700 rounded">[ {`{"cod":"123","nome":"João"...}`} ]</code>
          </p>
          <textarea 
            value={importText} 
            onChange={e => setImportText(e.target.value)} 
            rows={6}
            className="w-full p-3 border border-slate-300 rounded-md font-mono text-sm mb-4"
            placeholder="Cole o array JSON aqui..."
          ></textarea>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsImporting(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium">Cancelar</button>
            <button type="button" onClick={handleImport} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium">Processar Importação</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-3 font-semibold">RA / Código</th>
              <th className="px-6 py-3 font-semibold">Nome</th>
              <th className="px-6 py-3 font-semibold">Turma</th>
              <th className="px-6 py-3 font-semibold">Turno</th>
              <th className="px-6 py-3 font-semibold">PAED</th>
              <th className="px-6 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(student => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 text-slate-500 font-mono text-xs">{student.cod}</td>
                <td className="px-6 py-3 font-medium text-slate-800">{student.nome}</td>
                <td className="px-6 py-3 text-slate-600">{student.turma}</td>
                <td className="px-6 py-3 text-slate-600">{student.turno}</td>
                <td className="px-6 py-3">
                  {student.paed ? (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">SIM</span>
                  ) : (
                    <span className="text-slate-400 text-xs">NÃO</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => setSelectedProfile(student)} className="text-indigo-500 hover:text-indigo-700 p-1 rounded-md hover:bg-indigo-50 transition" title="Ficha do Aluno">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition" title="Excluir Aluno">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProfile && (
        <StudentProfileModal 
          student={selectedProfile}
          classifications={classifications}
          observations={observations}
          forwardings={forwardings}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

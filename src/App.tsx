import React, { useState, useEffect, useCallback } from 'react';
import { Student, Classification, Observation, Forwarding } from './types';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { TurmaList } from './components/TurmaList';
import { Alunos } from './components/Alunos';
import { Relatorios } from './components/Relatorios';
import { TurmasConfig } from './components/Turmas';
import { Turma } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [forwardings, setForwardings] = useState<Forwarding[]>([]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashFilter, setDashFilter] = useState<{modalidade: string, filter: string} | null>(null);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setTurmas(data.turmas || []);
        setStudents(data.students);
        setClassifications(data.classifications);
        setObservations(data.observations);
        setForwardings(data.forwardings);
      } else {
        setToken(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleClass = async (studentId: number, classId: string) => {
    await fetch(`/api/students/${studentId}/classifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ classId })
    });
    fetchData();
  };

  const [promptModal, setPromptModal] = useState<{isOpen: boolean, type: 'obs' | 'enc', studentId: number | null}>({ isOpen: false, type: 'obs', studentId: null });
  const [promptText, setPromptText] = useState('');

  const handleAddObs = (studentId: number) => {
    setPromptModal({ isOpen: true, type: 'obs', studentId });
    setPromptText('');
  };

  const handleAddEnc = (studentId: number) => {
    setPromptModal({ isOpen: true, type: 'enc', studentId });
    setPromptText('');
  };

  const submitPrompt = async () => {
    if (!promptText.trim() || !promptModal.studentId) return;
    
    const endpoint = promptModal.type === 'obs' ? 'observacoes' : 'encaminhamentos';
    
    await fetch(`/api/students/${promptModal.studentId}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ texto: promptText })
    });
    
    setPromptModal({ isOpen: false, type: 'obs', studentId: null });
    setPromptText('');
    fetchData();
  };

  const handleDeleteStudent = async (studentId: number) => {
    await fetch(`/api/students/${studentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const handleDashboardFilter = (modalidade: string, filter: string) => {
    setDashFilter({ modalidade, filter });
    if (modalidade === 'Médio') setActiveTab('medio');
    else if (modalidade === 'Fundamental') setActiveTab('fundamental');
    else setActiveTab('fundamental');
  };

  if (!token) {
    return <Login onLogin={(t, u) => { setToken(t); setUser(u); }} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans text-slate-800 overflow-hidden">
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">E</div>
          <span className="text-white font-semibold text-lg tracking-tight">EduConselho</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'fundamental', label: 'Ens. Fundamental' },
            { id: 'medio', label: 'Ens. Médio' },
            { id: 'turmas', label: 'Turmas (Classes)' },
            { id: 'alunos', label: 'Alunos (Cadastro)' },
            { id: 'relatorios', label: 'Relatórios' }
          ].map(t => {
            const isActive = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setDashFilter(null); }} className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${isActive ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-slate-400 hover:bg-slate-800'}`}>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div className="text-xs text-slate-500 font-mono">Status: Online</div>
            </div>
            <button onClick={() => setToken(null)} className="text-xs text-slate-400 hover:text-white transition">Sair</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {activeTab === 'dashboard' ? 'Dashboard Geral' : activeTab === 'fundamental' ? 'Ensino Fundamental' : activeTab === 'medio' ? 'Ensino Médio' : activeTab === 'turmas' ? 'Gerenciamento de Turmas' : activeTab === 'alunos' ? 'Cadastro de Alunos' : 'Relatórios Finais'}
            </h1>
            <p className="text-xs text-slate-500">EE PROF. FERNANDO LEITE DE CAMPOS</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold">{user?.name || user?.username}</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded uppercase font-bold text-slate-600 tracking-wider">Administrador</span>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              students={students} 
              classifications={classifications} 
              observations={observations} 
              forwardings={forwardings} 
              onFilterClick={handleDashboardFilter}
            />
          )}
          {activeTab === 'fundamental' && (
            <TurmaList 
              modalidade="Fundamental" 
              students={students} 
              turmas={turmas}
              classifications={classifications} 
              observations={observations} 
              forwardings={forwardings}
              initialFilter={dashFilter?.filter}
              onToggleClass={handleToggleClass}
              onAddObs={handleAddObs}
              onAddEnc={handleAddEnc}
              onDeleteStudent={handleDeleteStudent}
            />
          )}
          {activeTab === 'medio' && (
            <TurmaList 
              modalidade="Médio" 
              students={students}
              turmas={turmas} 
              classifications={classifications} 
              observations={observations} 
              forwardings={forwardings}
              initialFilter={dashFilter?.filter}
              onToggleClass={handleToggleClass}
              onAddObs={handleAddObs}
              onAddEnc={handleAddEnc}
              onDeleteStudent={handleDeleteStudent}
            />
          )}
          {activeTab === 'alunos' && (
            <Alunos 
              students={students}
              turmas={turmas}
              classifications={classifications}
              observations={observations}
              forwardings={forwardings}
              token={token} 
              onDataChanged={fetchData} 
            />
          )}
          {activeTab === 'turmas' && (
            <TurmasConfig 
              turmas={turmas}
              token={token}
              onDataChanged={fetchData}
            />
          )}
          {activeTab === 'relatorios' && (
            <Relatorios 
              students={students} 
              classifications={classifications} 
              observations={observations} 
              forwardings={forwardings} 
            />
          )}
        </div>
      </main>

      {promptModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {promptModal.type === 'obs' ? 'Adicionar Observação' : 'Adicionar Encaminhamento'}
            </h3>
            <textarea
              autoFocus
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
              placeholder={promptModal.type === 'obs' ? 'Digite a observação...' : 'Digite o encaminhamento...'}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setPromptModal({ isOpen: false, type: 'obs', studentId: null })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={submitPrompt}
                disabled={!promptText.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

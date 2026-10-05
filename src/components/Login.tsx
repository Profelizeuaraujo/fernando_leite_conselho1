import React, { useState } from 'react';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        onLogin(data.token, data.user);
      } else {
        setError(data?.error || `Erro (${res.status}): ${res.statusText || 'Falha ao processar'}`);
      }
    } catch (err: any) {
      setError(`Falha de conexão com o servidor: ${err?.message || 'Sem resposta'}`);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 items-center justify-center font-sans text-slate-800">
      <div className="bg-white p-8 rounded-xl w-full max-w-sm text-center shadow-sm border border-slate-200">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">E</div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">EduConselho</h2>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-6">EE PROF. FERNANDO LEITE DE CAMPOS</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-800"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-800"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
          <button type="submit" className="w-full p-3 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition">
            Entrar no Sistema
          </button>
        </form>
        <div className="mt-6 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          NAPP • DME • SEDUC-MT
        </div>
      </div>
    </div>
  );
}

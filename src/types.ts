export interface User {
  id: number;
  username: string;
  name: string;
}

export interface Turma {
  id: number;
  nome: string;
  modalidade: string;
  turno: string;
  curso: string;
  serie: string;
}

export interface Student {
  id: number;
  cod: string;
  nome: string;
  paed: boolean;
  turma: string;
  turno: string;
  serie: string;
  curso: string;
  modalidade: string;
}

export interface Classification {
  id: number;
  studentId: number;
  classId: string;
}

export interface Observation {
  id: number;
  studentId: number;
  texto: string;
  createdAt: string;
}

export interface Forwarding {
  id: number;
  studentId: number;
  texto: string;
  createdAt: string;
}

export const CLASS_TYPES = [
  { id: 'faltoso', emoji: '🔴', label: 'Faltoso', color: 'var(--c-faltoso)' },
  { id: 'abaixo', emoji: '🟠', label: 'Abaixo do Básico', color: 'var(--c-abaixo)' },
  { id: 'acompanhamento', emoji: '🟡', label: 'Necessita Acompanhamento', color: 'var(--c-acompanhamento)' },
  { id: 'media', emoji: '🟢', label: 'Na Média', color: 'var(--c-media)' },
  { id: 'destaque', emoji: '🔵', label: 'Destaque Acadêmico', color: 'var(--c-destaque)' },
  { id: 'socioemocional', emoji: '🟣', label: 'Questões Socioemocionais', color: 'var(--c-socioemocional)' },
  { id: 'paedaee', emoji: '⚫', label: 'PAED / AEE', color: 'var(--c-paedaee)' },
  { id: 'evasao', emoji: '🟤', label: 'Risco de Evasão', color: 'var(--c-evasao)' },
];

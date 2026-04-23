// ─── Mock User ────────────────────────────────────────────────────────────────
export const MOCK_USER = {
  id: 1,
  name: 'Ema Botelho',
  email: 'ema@retromanager.com',
  role: 1, // Manager
  initials: 'EB',
}

// ─── Team Members ─────────────────────────────────────────────────────────────
export const MOCK_MEMBERS = [
  { id: 1, name: 'Rui Teixeira',   initials: 'RT', color: '#14b8a6' },
  { id: 2, name: 'Luís Mendes',    initials: 'LM', color: '#f97316' },
  { id: 3, name: 'Ana Martins',    initials: 'AM', color: '#ec4899' },
  { id: 4, name: 'João Ferreira',  initials: 'JF', color: '#8b5cf6' },
  { id: 5, name: 'Ema Botelho',    initials: 'EB', color: '#4f46e5' },
  { id: 6, name: 'Olga Dias',      initials: 'OD', color: '#ef4444' },
  { id: 7, name: 'Pedro Santos',   initials: 'PS', color: '#22c55e' },
  { id: 8, name: 'Sofia Costa',    initials: 'SC', color: '#0ea5e9' },
  { id: 9, name: 'Miguel Rocha',   initials: 'MR', color: '#a855f7' },
]

// ─── Retrospective Boards ─────────────────────────────────────────────────────
const RETRO_BOARDS = {
  1: {
    positives: [
      { id: 101, text: 'O deploy automatizado funcionou perfeitamente sem downtime na produção.', votes: 4 },
      { id: 102, text: 'Comunicação muito fluida com a equipa de design nesta sprint.', votes: 2 },
    ],
    improvements: [
      { id: 201, text: 'A API de pagamentos teve timeouts frequentes no ambiente de dev.', votes: 3 },
      { id: 202, text: 'As reuniões diárias (dailies) estão a demorar mais de 30 minutos ultimamente.', votes: 5 },
    ],
    actions: [
      { id: 301, text: 'Investigar e otimizar os timeouts na API de pagamentos.', assignee: MOCK_MEMBERS[0], status: 'EM PROGRESSO' },
      { id: 302, text: 'Definir um timebox rígido de 15 min para as reuniões diárias.', assignee: MOCK_MEMBERS[5], status: 'PENDENTE' },
    ],
  },
  2: {
    positives: [
      { id: 103, text: 'Boa colaboração entre frontend e backend esta sprint.', votes: 6 },
      { id: 104, text: 'Todas as histórias de utilizador entregues dentro do prazo.', votes: 3 },
    ],
    improvements: [
      { id: 203, text: 'Faltou documentação nos novos endpoints de autenticação.', votes: 2 },
      { id: 204, text: 'Testes de integração demoraram muito a configurar.', votes: 4 },
    ],
    actions: [
      { id: 303, text: 'Criar template de documentação para novos endpoints.', assignee: MOCK_MEMBERS[3], status: 'PENDENTE' },
      { id: 304, text: 'Configurar pipeline de testes de integração automatizados.', assignee: MOCK_MEMBERS[1], status: 'CONCLUÍDO' },
      { id: 305, text: 'Revisão do processo de code review.', assignee: MOCK_MEMBERS[2], status: 'EM PROGRESSO' },
    ],
  },
  3: {
    positives: [
      { id: 105, text: 'Refatoração do módulo de autenticação correu sem problemas.', votes: 8 },
      { id: 106, text: 'Zero bugs reportados em produção nesta sprint.', votes: 5 },
    ],
    improvements: [
      { id: 205, text: 'Estimativas de tempo foram demasiado otimistas.', votes: 3 },
    ],
    actions: [
      { id: 306, text: 'Implementar planning poker nas próximas estimativas.', assignee: MOCK_MEMBERS[4], status: 'CONCLUÍDO' },
      { id: 307, text: 'Criar guia de boas práticas de estimação.', assignee: MOCK_MEMBERS[0], status: 'CONCLUÍDO' },
    ],
  },
  4: {
    positives: [
      { id: 107, text: 'Integração com API externa concluída dentro do prazo.', votes: 7 },
    ],
    improvements: [
      { id: 206, text: 'Comunicação com stakeholders externos precisa de melhorar.', votes: 4 },
      { id: 207, text: 'Rate limiting da API causou bloqueios inesperados.', votes: 6 },
    ],
    actions: [
      { id: 308, text: 'Criar canal dedicado para comunicação com parceiros externos.', assignee: MOCK_MEMBERS[5], status: 'PENDENTE' },
      { id: 309, text: 'Implementar retry logic para chamadas à API externa.', assignee: MOCK_MEMBERS[1], status: 'PENDENTE' },
    ],
  },
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'Aplicação Mobile',
    description: 'Equipa de desenvolvimento da nova app para iOS e Android.',
    status: 'Ativo',
    icon: 'mobile',
    startDate: '2025-01-15',
    members: [MOCK_MEMBERS[3], MOCK_MEMBERS[2], MOCK_MEMBERS[0], MOCK_MEMBERS[1], MOCK_MEMBERS[4]],
    totalMembers: 7,
    totalSessions: 12,
    generatedActions: 45,
    completedActions: 40,
    pendingActions: 5,
    retrospectives: [
      {
        id: 1,
        title: 'Q4 Planning - Retrospectiva Geral',
        date: '2025-11-24',
        status: 'Em curso',
        thumbsUp: 12,
        pendingCount: 5,
        actionsTotal: 4,
        actionsResolved: 1,
        board: RETRO_BOARDS[1],
      },
      {
        id: 2,
        title: 'Sprint 13 - Setup Módulo Pagamentos',
        date: '2025-11-10',
        status: 'Concluída',
        thumbsUp: 8,
        pendingCount: 7,
        actionsTotal: 6,
        actionsResolved: 3,
        board: RETRO_BOARDS[2],
      },
      {
        id: 3,
        title: 'Sprint 12 - Refatoração API Core',
        date: '2025-10-25',
        status: 'Concluída',
        thumbsUp: 15,
        pendingCount: 2,
        actionsTotal: 5,
        actionsResolved: 5,
        board: RETRO_BOARDS[3],
      },
    ],
  },
  {
    id: 2,
    name: 'Aplicação Web',
    description: 'Desenvolvimento de uma nova aplicação web para parceiros. Para o funcionamento da empresa dos mesmos.',
    status: 'Ativo',
    icon: 'web',
    startDate: '2024-09-01',
    members: [MOCK_MEMBERS[0], MOCK_MEMBERS[1], MOCK_MEMBERS[2], MOCK_MEMBERS[4]],
    totalMembers: 12,
    totalSessions: 24,
    generatedActions: 145,
    completedActions: 139,
    pendingActions: 6,
    retrospectives: [
      {
        id: 4,
        title: 'Sprint 26 - Lançamento',
        date: '2026-03-15',
        status: 'Em curso',
        thumbsUp: 5,
        pendingCount: 3,
        actionsTotal: 2,
        actionsResolved: 0,
        board: RETRO_BOARDS[4],
      },
    ],
  },
  {
    id: 3,
    name: 'API de Integrações',
    description: 'Desenvolvimento dos endpoints B2B para parceiros externos.',
    status: 'Em Pausa',
    icon: 'api',
    startDate: '2025-03-10',
    members: [MOCK_MEMBERS[5], MOCK_MEMBERS[8]],
    totalMembers: 4,
    totalSessions: 3,
    generatedActions: 12,
    completedActions: 10,
    pendingActions: 2,
    retrospectives: [],
  },
]

// ─── Flat lookup helpers ───────────────────────────────────────────────────────
export function getProjectById(id) {
  return MOCK_PROJECTS.find(p => p.id === parseInt(id)) ?? null
}

export function getRetrospectiveById(retroId) {
  for (const project of MOCK_PROJECTS) {
    const retro = project.retrospectives.find(r => r.id === parseInt(retroId))
    if (retro) return { retro, project }
  }
  return null
}

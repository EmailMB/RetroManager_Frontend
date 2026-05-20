import api from './api'

export const ActionStatus = {
  Pending: 1,
  InProgress: 2,
  Complete: 3,
}

export const ActionStatusLabel = {
  [ActionStatus.Pending]:    'Pendente',
  [ActionStatus.InProgress]: 'Em Progresso',
  [ActionStatus.Complete]:   'Concluído',
}

export async function getActionsByRetroId(retroId) {
  const response = await api.get(`/retrospectives/${retroId}/actions`)
  return response.data
}

export async function getAllActions(filters = {}) {
  const response = await api.get('/actions', { params: filters })
  return response.data
}

export async function createAction(retroId, description, responsibleUserId = null, expectedCompletionDate = null) {
  const response = await api.post(`/retrospectives/${retroId}/actions`, {
    description,
    responsibleUserId,
    expectedCompletionDate,
  })
  return response.data
}

export async function updateActionStatus(actionId, status, notes = null) {
  const response = await api.put(`/actions/${actionId}/status`, { status, notes })
  return response.data
}

export async function deleteAction(actionId) {
  await api.delete(`/actions/${actionId}`)
}

import api from './api'

export async function getColumnsByRetroId(retroId) {
  const response = await api.get(`/retrospectives/${retroId}/columns`)
  return response.data
}

export async function createColumn(retroId, name, color) {
  const response = await api.post(`/retrospectives/${retroId}/columns`, { name, color })
  return response.data
}

export async function updateColumn(columnId, data) {
  const response = await api.put(`/columns/${columnId}`, data)
  return response.data
}

export async function deleteColumn(columnId) {
  await api.delete(`/columns/${columnId}`)
}

export async function lockColumn(columnId) {
  const response = await api.put(`/columns/${columnId}/lock`)
  return response.data
}

export async function unlockColumn(columnId) {
  const response = await api.put(`/columns/${columnId}/unlock`)
  return response.data
}

export async function startColumnTimer(columnId, durationSeconds) {
  const response = await api.post(`/columns/${columnId}/timer/start`, { durationSeconds })
  return response.data
}

export async function stopColumnTimer(columnId) {
  const response = await api.post(`/columns/${columnId}/timer/stop`)
  return response.data
}

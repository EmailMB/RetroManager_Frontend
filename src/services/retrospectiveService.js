import api from './api'

export async function getRetrospectiveById(retroId) {
  const response = await api.get(`/retrospectives/${retroId}`)
  return response.data
}

export async function createRetrospective(projectId, data) {
  const response = await api.post(`/projects/${projectId}/retrospectives`, data)
  return response.data
}

export async function updateRetrospective(retroId, data) {
  const response = await api.put(`/retrospectives/${retroId}`, data)
  return response.data
}

export async function closeRetrospective(retroId) {
  const response = await api.put(`/retrospectives/${retroId}/close`)
  return response.data
}

export async function reopenRetrospective(retroId) {
  const response = await api.put(`/retrospectives/${retroId}/reopen`)
  return response.data
}

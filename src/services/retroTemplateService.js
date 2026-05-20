import api from './api'

export async function getAccessibleTemplates() {
  const response = await api.get('/retro-templates')
  return response.data
}

export async function getTemplate(id) {
  const response = await api.get(`/retro-templates/${id}`)
  return response.data
}

export async function createTemplate(data) {
  const response = await api.post('/retro-templates', data)
  return response.data
}

export async function updateTemplate(id, data) {
  const response = await api.put(`/retro-templates/${id}`, data)
  return response.data
}

export async function deleteTemplate(id) {
  await api.delete(`/retro-templates/${id}`)
}

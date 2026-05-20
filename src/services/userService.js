import api from './api'

export async function getAllUsers() {
  const response = await api.get('/users')
  return response.data
}

export async function updateUserRole(userId, role) {
  await api.put(`/users/${userId}/role`, { role })
}

export async function searchUsers(query) {
  const response = await api.get(`/users/search/${encodeURIComponent(query)}`)
  return response.data
}

export async function updateProfile(data) {
  const response = await api.put('/users/profile', data)
  return response.data
}

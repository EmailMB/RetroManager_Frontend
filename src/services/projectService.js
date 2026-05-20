import api from './api'

export async function getAllProjects() {
    const response = await api.get('/projects')
    return response.data
}

export async function getProjectById(projectId) {
    const response = await api.get(`/projects/${projectId}`)
    return response.data
}

export async function createProject(data) {
    const response = await api.post('/projects', data)
    return response.data
}

export async function updateProject(projectId, data) {
    const response = await api.put(`/projects/${projectId}`, data)
    return response.data
}

export async function addProjectMember(projectId, userId) {
    const response = await api.post(`/projects/${projectId}/members/${userId}`)
    return response.data
}

export async function removeProjectMember(projectId, userId) {
    await api.delete(`/projects/${projectId}/members/${userId}`)
}

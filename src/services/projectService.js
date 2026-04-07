import api from './api'

// GET /api/projects
// Returns all projects visible to the current user.
// Normal users only see projects they are a member of.
export async function getAllProjects() {
    const response = await api.get('/projects')
    return response.data
}

// GET /api/projects/:id
// Returns a single project with its member list and retrospective summaries.
// The retrospective list (id, title, date) lives inside response.retrospectives.
export async function getProjectById(projectId) {
    const response = await api.get(`/projects/${projectId}`)
    return response.data
}

// POST /api/projects
// Creates a new project. Manager and Admin only.
// body: { name, description }
export async function createProject(data) {
    const response = await api.post('/projects', data)
    return response.data
}

// PUT /api/projects/:id
// Updates a project's name and/or description. Manager and Admin only.
// body: { name, description }
export async function updateProject(projectId, data) {
    const response = await api.put(`/projects/${projectId}`, data)
    return response.data
}

// POST /api/projects/:id/members/:userId
// Adds a user as a member of the project. Manager and Admin only.
export async function addProjectMember(projectId, userId) {
    const response = await api.post(`/projects/${projectId}/members/${userId}`)
    return response.data
}
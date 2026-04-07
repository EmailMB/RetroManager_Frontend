import api from './api'

// GET /api/retrospectives/:id
// Returns the full retrospective detail.
// ManagerNotes is null in the response for Normal-role users.
export async function getRetrospectiveById(retroId) {
    const response = await api.get(`/retrospectives/${retroId}`)
    return response.data
}

// POST /api/projects/:projectId/retrospectives
// Creates a new retrospective under the given project. Manager and Admin only.
// body: { title, date } — date must be an ISO 8601 string (e.g. "2026-04-07T00:00:00")
export async function createRetrospective(projectId, data) {
    const response = await api.post(`/projects/${projectId}/retrospectives`, data)
    return response.data
}

export async function updateRetrospective(retroId, data) {
    const response = await api.put(`/retrospectives/${retroId}`, data)
    return response.data
}
import api from './api'

// GET /api/retrospectives/:retroId/attendances
// Returns the attendance list for a retrospective.
// Each record: { retrospectiveId, userId, userName, isPresent, updatedBy, updatedAt }
export async function getAttendances(retroId) {
    const response = await api.get(`/retrospectives/${retroId}/attendances`)
    return response.data
}

// PUT /api/retrospectives/:retroId/attendances/:userId
// Marks or updates the presence of a specific user. Manager and Admin only.
// body: { isPresent: true | false }
export async function updateAttendance(retroId, userId, isPresent) {
    const response = await api.put(
        `/retrospectives/${retroId}/attendances/${userId}`,
        { isPresent }
    )
    return response.data
}
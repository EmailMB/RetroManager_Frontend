import api from './api'

export async function getAttendances(retroId) {
    const response = await api.get(`/retrospectives/${retroId}/attendances`)
    return response.data
}

export async function updateAttendance(retroId, userId, isPresent) {
    const response = await api.put(
        `/retrospectives/${retroId}/attendances/${userId}`,
        { isPresent }
    )
    return response.data
}

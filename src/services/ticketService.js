import api from './api'

export async function getTicketsByRetroId(retroId) {
  const response = await api.get(`/retrospectives/${retroId}/tickets`)
  return response.data
}

export async function createTicket(retroId, content, retroColumnId) {
  const response = await api.post(`/retrospectives/${retroId}/tickets`, {
    content,
    retroColumnId,
  })
  return response.data
}

export async function updateTicket(ticketId, content, retroColumnId) {
  const response = await api.put(`/tickets/${ticketId}`, {
    content,
    retroColumnId,
  })
  return response.data
}

export async function deleteTicket(ticketId) {
  await api.delete(`/tickets/${ticketId}`)
}

export async function toggleVote(ticketId) {
  const response = await api.post(`/tickets/${ticketId}/vote`)
  return response.data
}

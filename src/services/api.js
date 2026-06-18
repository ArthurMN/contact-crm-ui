const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const { token, body, method = 'GET' } = options
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP ${response.status}`)
  }

  if (response.status === 204) return null
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export function signIn(body) {
  return request('/auth/sign-in', { method: 'POST', body })
}

export function signUp(body) {
  return request('/auth/sign-up', { method: 'POST', body })
}

export function getProfile({ token }) {
  return request('/user/profile', { token })
}

export function getDashboard({ token }) {
  return request('/dashboard', { token })
}

export function listContacts({ token }, text = '') {
  const search = text ? `?text=${encodeURIComponent(text)}` : ''
  return request(`/contact/list${search}`, { token })
}

export function createContact({ token }, body) {
  return request('/contact', { method: 'POST', token, body })
}

export function updateContact({ token }, contactId, body) {
  return request(`/contact/${contactId}`, { method: 'PUT', token, body })
}

export function deleteContact({ token }, contactId) {
  return request(`/contact/${contactId}`, { method: 'DELETE', token })
}

export function listInteractions({ token }, contactId) {
  return request(`/contact/${contactId}/interactions`, { token })
}

export function createInteraction({ token }, contactId, body) {
  return request(`/contact/${contactId}/interactions`, { method: 'POST', token, body })
}

export function deleteInteraction({ token }, interactionId) {
  return request(`/contact/interactions/${interactionId}`, { method: 'DELETE', token })
}

export function listOpportunities({ token }) {
  return request('/opportunities', { token })
}

export function createOpportunity({ token }, body) {
  return request('/opportunities', { method: 'POST', token, body })
}

export function updateOpportunity({ token }, opportunityId, body) {
  return request(`/opportunities/${opportunityId}`, { method: 'PUT', token, body })
}

export function deleteOpportunity({ token }, opportunityId) {
  return request(`/opportunities/${opportunityId}`, { method: 'DELETE', token })
}

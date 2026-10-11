const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function getRole() {
  return localStorage.getItem('careline_role') || 'admin'
}

async function request(path, { method = 'GET', body, role } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    role: role || getRole(),
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  const text = await res.text()
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: text }
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`)
  }

  return data
}

export const queryKeys = {
  doctors: ['doctors'],
  availability: (doctorId = '') => ['availability', doctorId],
  patient: (phone) => ['patient', phone],
}

export const api = {
  getDoctors: () => request('/api/doctors'),
  createDoctor: (payload) =>
    request('/api/doctors', { method: 'POST', body: payload }),

  getAvailability: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v),
    ).toString()
    return request(`/api/availability${qs ? `?${qs}` : ''}`)
  },
  createAvailability: (payload) =>
    request('/api/availability', { method: 'POST', body: payload }),
  createBulkAvailability: (payload) =>
    request('/api/availability/bulk', { method: 'POST', body: payload }),

  bookFromText: (payload) =>
    request('/api/book', { method: 'POST', body: payload }),
  extractIntent: (payload) =>
    request('/api/intent', { method: 'POST', body: payload }),

  createPatient: (payload) =>
    request('/api/patients', { method: 'POST', body: payload }),
  getPatient: (phone) =>
    request(`/api/patients/${encodeURIComponent(phone)}`),
}

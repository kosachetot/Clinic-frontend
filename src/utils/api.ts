import axios from 'axios'

// Base URL of the Laravel API (change this when the backend moves to a server)
export const API_URL = 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
})

// Tell the backend who is performing the action (used by the audit trail)
api.interceptors.request.use(config => {
  try {
    const user = JSON.parse(localStorage.getItem('user') ?? 'null')

    if (user) {
      config.headers['X-Actor-Emp-Id'] = String(user.emp_id ?? user.id ?? '')
      config.headers['X-Actor-Username'] = user.username ?? ''
      config.headers['X-Actor-Name'] = encodeURIComponent(user.full_name ?? user.name ?? user.username ?? '')
    }
  }
  catch {
    // Ignore a corrupted or missing user entry
  }

  return config
})

import axios from 'axios'

// Base URL of the Laravel API (change this when the backend moves to a server)
export const API_URL = 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
})

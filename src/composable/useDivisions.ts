import { ref } from 'vue'
import { api } from '@/utils/api'

export type Division = { id: number; code: string; name: string }

// Divisions come from the HRIS and are loaded once, then shared by every form and filter
const divisions = ref<Division[]>([])
let request: Promise<void> | null = null

export function useDivisions() {
  if (!divisions.value.length && !request) {
    request = api.get<Division[]>('/divisions')
      .then(({ data }) => { divisions.value = data })
      .catch(() => {})
      .finally(() => { request = null })
  }

  return { divisions }
}

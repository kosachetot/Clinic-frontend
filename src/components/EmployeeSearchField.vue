<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import type { Employee } from '@/data/clinicForms'
import { api } from '@/utils/api'

// Searchable dropdown of regular employees (from the HRIS).
// Used for both "Employee no." and "Name", so either one can be typed in.
const props = defineProps<{
  modelValue: Employee | null
  mode: 'id' | 'name'
  label: string
  errorMessages?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Employee | null): void
}>()

const items = ref<Employee[]>([])
const query = ref('')
const isSearching = ref(false)

const selected = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const titleOf = (employee: Employee) =>
  (props.mode === 'id' ? String(employee.emp_id) : employee.name)

// The selected employee must stay in the list so the box can show it
function withSelected(list: Employee[]) {
  const current = props.modelValue

  if (current && !list.some(employee => employee.emp_id === current.emp_id))
    return [current, ...list]

  return list
}

async function search(term: string) {
  isSearching.value = true

  try {
    const { data } = await api.get<Employee[]>('/employees', {
      params: { search: term || undefined },
    })

    items.value = withSelected(data)
  }
  catch {
    items.value = withSelected([])
  }
  finally {
    isSearching.value = false
  }
}

const debouncedSearch = useDebounceFn(search, 300)

watch(query, term => {
  // After a pick the box shows the selected employee: no need to search again
  if (selected.value && term === titleOf(selected.value))
    return

  debouncedSearch(term)
})

watch(() => props.modelValue, () => {
  items.value = withSelected(items.value)
}, { immediate: true })

function onFocused(focused: boolean) {
  if (focused && items.value.length <= 1)
    search('')
}
</script>

<template>
  <VAutocomplete
    v-model="selected"
    v-model:search="query"
    :items="items"
    :item-title="titleOf"
    item-value="emp_id"
    return-object
    no-filter
    clearable
    :label="label"
    :loading="isSearching"
    :error-messages="errorMessages"
    :rules="[(v: unknown) => !!v || 'Select an employee']"
    :no-data-text="isSearching ? 'Searching...' : 'No regular employee found'"
    @update:focused="onFocused"
  >
  </VAutocomplete>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { api } from '@/utils/api'

const ENTITY_LABELS: Record<string, string> = {
  PhilpenAssessment: 'PhilPEN Assessment',
  AnnualMedicalExam: 'Annual Medical Exam',
}

const ACTION_COLORS: Record<string, string> = {
  create: 'success',
  update: 'warning',
  delete: 'error',
}

const entityItems = Object.entries(ENTITY_LABELS).map(([value, title]) => ({ title, value }))

const actionItems = [
  { title: 'Add', value: 'create' },
  { title: 'Edit', value: 'update' },
  { title: 'Delete', value: 'delete' },
]

const items = ref<Record<string, any>[]>([])
const total = ref(0)
const page = ref(1)
const itemsPerPage = ref(15)
const search = ref('')
const actionFilter = ref<string | null>(null)
const entityFilter = ref<string | null>(null)
const dateFrom = ref<string | null>(null)
const dateTo = ref<string | null>(null)
const isLoading = ref(false)
const loadError = ref('')

const headers = [
  { title: 'Date & time', key: 'created_at', sortable: false },
  { title: 'Action', key: 'action', sortable: false },
  { title: 'Record', key: 'entity', sortable: false },
  { title: 'Employee', key: 'employee_name', sortable: false },
  { title: 'Year', key: 'year', sortable: false },
  { title: 'Done by', key: 'actor_name', sortable: false },
]

async function loadItems() {
  isLoading.value = true
  loadError.value = ''

  try {
    const { data } = await api.get('/audit-logs', {
      params: {
        page: page.value,
        per_page: itemsPerPage.value,
        search: search.value || undefined,
        action: actionFilter.value || undefined,
        entity: entityFilter.value || undefined,
        date_from: dateFrom.value || undefined,
        date_to: dateTo.value || undefined,
      },
    })

    items.value = data.data
    total.value = data.total
  }
  catch {
    loadError.value = 'Cannot load the audit trail. Please make sure the server is running.'
  }
  finally {
    isLoading.value = false
  }
}

function reloadFromFirstPage() {
  if (page.value === 1)
    loadItems()
  else
    page.value = 1
}

watch([page, itemsPerPage], loadItems)
watch([actionFilter, entityFilter, dateFrom, dateTo], reloadFromFirstPage)

const debouncedSearch = useDebounceFn(reloadFromFirstPage, 350)

watch(search, () => debouncedSearch())

onMounted(loadItems)

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h4 class="text-h4 font-weight-bold text-primary">
        Audit Trail
      </h4>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Who added, edited, or deleted PhilPEN assessments and annual medical exams
      </p>
    </div>

    <VCard>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="3"
          >
            <VTextField
              v-model="search"
              label="Search employee or user"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              hide-details
              clearable
            />
          </VCol>
          <VCol
            cols="6"
            md="2"
          >
            <VSelect
              v-model="actionFilter"
              :items="actionItems"
              label="Action"
              density="compact"
              hide-details
              clearable
            />
          </VCol>
          <VCol
            cols="6"
            md="3"
          >
            <VSelect
              v-model="entityFilter"
              :items="entityItems"
              label="Record"
              density="compact"
              hide-details
              clearable
            />
          </VCol>
          <VCol
            cols="6"
            md="2"
          >
            <VTextField
              v-model="dateFrom"
              type="date"
              label="From"
              density="compact"
              hide-details
              clearable
            />
          </VCol>
          <VCol
            cols="6"
            md="2"
          >
            <VTextField
              v-model="dateTo"
              type="date"
              label="To"
              density="compact"
              hide-details
              clearable
            />
          </VCol>
        </VRow>

        <VAlert
          v-if="loadError"
          type="error"
          variant="tonal"
          class="mt-4"
        >
          {{ loadError }}
        </VAlert>
      </VCardText>

      <VDataTableServer
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="items"
        :items-length="total"
        :items-per-page-options="[10, 15, 25, 50]"
        :loading="isLoading"
      >
        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.action="{ item }">
          <VChip
            size="small"
            variant="tonal"
            :color="ACTION_COLORS[item.action] ?? 'default'"
          >
            {{ actionItems.find(a => a.value === item.action)?.title ?? item.action }}
          </VChip>
        </template>

        <template #item.entity="{ item }">
          {{ ENTITY_LABELS[item.entity] ?? item.entity }}
        </template>

        <template #item.actor_name="{ item }">
          <div>{{ item.actor_name || item.actor_username || 'Unknown' }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.actor_emp_id }}
          </div>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>

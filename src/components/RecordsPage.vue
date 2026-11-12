<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import RecordFormDialog from '@/components/RecordFormDialog.vue'
import { useDivisions } from '@/composable/useDivisions'
import type { RecordsConfig } from '@/data/clinicForms'
import { api } from '@/utils/api'

const props = defineProps<{ config: RecordsConfig }>()

const items = ref<Record<string, any>[]>([])
const total = ref(0)
const page = ref(1)
const itemsPerPage = ref(15)
const search = ref('')
const yearFilter = ref<number | null>(null)
const divisionFilter = ref<number | null>(null)
const isLoading = ref(false)
const loadError = ref('')

// Years come from the records that exist, not from a fixed list
const yearItems = ref<number[]>([])

async function loadYears() {
  try {
    const { data } = await api.get<number[]>(`${props.config.endpoint}/years`)

    yearItems.value = data

    // The selected year may no longer exist (for example after deleting its last record)
    if (yearFilter.value && !data.includes(yearFilter.value))
      yearFilter.value = null
  }
  catch {
    yearItems.value = []
  }
}

const { divisions } = useDivisions()
const divisionItems = computed(() => divisions.value.map(d => ({ title: d.code, value: d.id })))

const headers = computed(() => [
  { title: 'Employee', key: 'employee_name', sortable: false },
  { title: 'Emp. no.', key: 'emp_id', sortable: false },
  { title: 'Division', key: 'division', sortable: false },
  { title: 'Date', key: props.config.dateField, sortable: false },
  ...props.config.extraColumns.map(column => ({ ...column, sortable: false })),
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
])

async function loadItems() {
  isLoading.value = true
  loadError.value = ''

  try {
    const { data } = await api.get(props.config.endpoint, {
      params: {
        page: page.value,
        per_page: itemsPerPage.value,
        search: search.value || undefined,
        year: yearFilter.value || undefined,
        division_id: divisionFilter.value || undefined,
      },
    })

    items.value = data.data
    total.value = data.total
  }
  catch {
    loadError.value = 'Cannot load the records. Please make sure the server is running.'
  }
  finally {
    isLoading.value = false
  }
}

// Filters always start again from the first page
function reloadFromFirstPage() {
  if (page.value === 1)
    loadItems()
  else
    page.value = 1
}

watch([page, itemsPerPage], loadItems)
watch([yearFilter, divisionFilter], reloadFromFirstPage)

const debouncedSearch = useDebounceFn(reloadFromFirstPage, 350)

watch(search, () => debouncedSearch())

onMounted(() => {
  loadItems()
  loadYears()
})

// ---------- Add / edit ----------
const isFormOpen = ref(false)
const editing = ref<Record<string, any> | null>(null)

function openAdd() {
  editing.value = null
  isFormOpen.value = true
}

function openEdit(item: Record<string, any>) {
  editing.value = item
  isFormOpen.value = true
}

// ---------- Delete ----------
const deleting = ref<Record<string, any> | null>(null)
const isDeleting = ref(false)

const isDeleteOpen = computed({
  get: () => !!deleting.value,
  set: value => {
    if (!value)
      deleting.value = null
  },
})

async function confirmDelete() {
  if (!deleting.value)
    return

  isDeleting.value = true

  try {
    await api.delete(`${props.config.endpoint}/${deleting.value.id}`)
    deleting.value = null
    notify('Record deleted.')
    await loadItems()
    await loadYears()
  }
  catch {
    notify('Could not delete the record.', 'error')
  }
  finally {
    isDeleting.value = false
  }
}

// ---------- Messages ----------
const snackbar = ref({ show: false, text: '', color: 'success' })

function notify(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}

function onSaved(message: string) {
  notify(message)
  loadItems()
  loadYears()
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-6">
      <div>
        <h4 class="text-h4 font-weight-bold text-primary">
          {{ config.title }}
        </h4>
        <p class="text-body-1 text-medium-emphasis mb-0">
          {{ config.subtitle }}
        </p>
      </div>

      <VBtn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="openAdd"
      >
        Add {{ config.singular }}
      </VBtn>
    </div>

    <VCard>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="5"
          >
            <VTextField
              v-model="search"
              label="Search name, employee no., or designation"
              prepend-inner-icon="mdi-magnify"
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
              v-model="yearFilter"
              :items="yearItems"
              label="Year"
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
              v-model="divisionFilter"
              :items="divisionItems"
              label="Division"
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
        class="text-capitalize"
      >
        <template #item.actions="{ item }">
          <VBtn
            icon="mdi-pencil-outline"
            variant="text"
            size="small"
            @click="openEdit(item)"
          />
          <VBtn
            icon="mdi-delete-outline"
            variant="text"
            size="small"
            color="error"
            @click="deleting = item"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <RecordFormDialog
      v-model="isFormOpen"
      :config="config"
      :record="editing"
      @saved="onSaved"
    />

    <VDialog
      v-model="isDeleteOpen"
      max-width="420"
    >
      <VCard title="Delete record">
        <VCardText>
          Delete the {{ config.singular }} of
          <strong>{{ deleting?.employee_name }}</strong>
          ({{ deleting?.year }})? This cannot be undone.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            :disabled="isDeleting"
            @click="deleting = null"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            variant="flat"
            :loading="isDeleting"
            @click="confirmDelete"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
    >
      {{ snackbar.text }}
    </VSnackbar>
  </div>
</template>

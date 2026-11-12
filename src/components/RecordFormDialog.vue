<script setup lang="ts">
import axios from 'axios'
import { computed, ref, watch } from 'vue'
import { VForm } from 'vuetify/components/VForm'
import EmployeeSearchField from '@/components/EmployeeSearchField.vue'
import { useDivisions } from '@/composable/useDivisions'
import { type Employee, type FieldDef, type RecordsConfig, YES_NO, todayLocal } from '@/data/clinicForms'
import { api } from '@/utils/api'

const props = defineProps<{
  modelValue: boolean
  config: RecordsConfig
  record: Record<string, any> | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', message: string): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.record?.id)
const allFields = computed(() => props.config.groups.flatMap(group => group.fields))

const { divisions } = useDivisions()
const divisionItems = computed(() => divisions.value.map(d => ({ title: d.code, value: d.id })))

const formRef = ref<InstanceType<typeof VForm>>()
const form = ref<Record<string, any>>({})
const selectedEmployee = ref<Employee | null>(null)
const isSaving = ref(false)
const formError = ref('')
const fieldErrors = ref<Record<string, string[]>>({})

const required = (v: unknown) => (v !== '' && v !== null && v !== undefined) || 'This field is required'
const labelOf = (field: FieldDef) => (field.required ? `${field.label} *` : field.label)

function initForm() {
  const base: Record<string, any> = {}

  for (const field of allFields.value)
    base[field.key] = field.type === 'select' || field.type === 'bool' || field.type === 'division' ? null : ''

  base[props.config.dateField] = todayLocal()

  selectedEmployee.value = null

  if (props.record) {
    for (const field of allFields.value) {
      const value = props.record[field.key]
      if (value === undefined || value === null)
        continue

      // Yes/No fields are stored as true/false in the database
      base[field.key] = field.type === 'bool' ? (value ? 'yes' : 'no') : value
    }

    selectedEmployee.value = {
      emp_id: props.record.emp_id,
      name: props.record.employee_name,
      designation: props.record.designation ?? null,
      division_id: props.record.division_id ?? null,
      division: props.record.division ?? null,
      sex: props.record.sex ?? null,
      age: props.record.age ?? null,
    }
  }

  form.value = base
  formError.value = ''
  fieldErrors.value = {}
  formRef.value?.resetValidation()
}

watch(() => props.modelValue, open => {
  if (open)
    initForm()
})

// Picking an employee (by number or by name) fills in the employee details
function onEmployeeSelected(employee: Employee | null) {
  selectedEmployee.value = employee

  if (!employee) {
    form.value.emp_id = ''
    form.value.employee_name = ''

    return
  }

  form.value.emp_id = employee.emp_id
  form.value.employee_name = employee.name
  form.value.designation = employee.designation ?? ''
  form.value.division_id = employee.division_id ?? null
  form.value.sex = employee.sex ?? null
  form.value.age = employee.age ?? ''
}

// Empty values are sent as null, Yes/No choices as true/false
function buildPayload() {
  const payload: Record<string, any> = {}

  for (const field of allFields.value) {
    const value = form.value[field.key]

    if (value === '' || value === null || value === undefined)
      payload[field.key] = null
    else if (field.type === 'bool')
      payload[field.key] = value === 'yes'
    else
      payload[field.key] = value
  }

  return payload
}

function parseError(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data

    return {
      message: data?.message ?? 'Could not save the record.',
      fields: (data?.errors ?? {}) as Record<string, string[]>,
    }
  }

  return { message: 'Cannot reach the server. Please try again later.', fields: {} }
}

async function submit() {
  const result = await formRef.value?.validate()
  if (!result?.valid)
    return

  isSaving.value = true
  formError.value = ''
  fieldErrors.value = {}

  try {
    const payload = buildPayload()

    if (isEdit.value)
      await api.put(`${props.config.endpoint}/${props.record!.id}`, payload)
    else
      await api.post(props.config.endpoint, payload)

    emit('saved', isEdit.value ? 'Record updated.' : 'Record saved.')
    isOpen.value = false
  }
  catch (error) {
    const parsed = parseError(error)

    formError.value = parsed.message
    fieldErrors.value = parsed.fields
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="960"
    persistent
    scrollable
  >
    <VCard>
      <VCardItem class="pb-0">
        <VCardTitle class="text-capitalize">
          {{ isEdit ? 'Edit' : 'Add' }} {{ config.singular }}
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VAlert
          v-if="formError"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ formError }}
        </VAlert>

        <VForm
          ref="formRef"
          @submit.prevent="submit"
        >
          <template
            v-for="group in config.groups"
            :key="group.title"
          >
            <h6 class="text-h6 mt-4 mb-1">
              {{ group.title }}
            </h6>
            <p
              v-if="group.note"
              class="text-caption text-medium-emphasis mb-2"
            >
              {{ group.note }}
            </p>

            <VRow>
              <VCol
                v-for="field in group.fields"
                :key="field.key"
                cols="12"
                sm="6"
                :md="field.md ?? 4"
              >
                <EmployeeSearchField
                  v-if="field.type === 'employee'"
                  :model-value="selectedEmployee"
                  :mode="field.key === 'emp_id' ? 'id' : 'name'"
                  :label="labelOf(field)"
                  :error-messages="fieldErrors[field.key]"
                  @update:model-value="onEmployeeSelected"
                />

                <VSelect
                  v-else-if="field.type === 'division'"
                  v-model="form[field.key]"
                  :items="divisionItems"
                  :label="labelOf(field)"
                  :error-messages="fieldErrors[field.key]"
                  clearable
                />

                <VSelect
                  v-else-if="field.type === 'select' || field.type === 'bool'"
                  v-model="form[field.key]"
                  :items="field.type === 'bool' ? YES_NO : field.items"
                  :label="labelOf(field)"
                  :rules="field.required ? [required] : []"
                  :error-messages="fieldErrors[field.key]"
                  :clearable="!field.required"
                />

                <VTextarea
                  v-else-if="field.type === 'textarea'"
                  v-model="form[field.key]"
                  :label="labelOf(field)"
                  :error-messages="fieldErrors[field.key]"
                  rows="2"
                  auto-grow
                />

                <VTextField
                  v-else-if="field.type === 'number'"
                  v-model.number="form[field.key]"
                  type="number"
                  :step="field.step ?? 1"
                  :label="labelOf(field)"
                  :rules="field.required ? [required] : []"
                  :error-messages="fieldErrors[field.key]"
                />

                <VTextField
                  v-else
                  v-model="form[field.key]"
                  :type="field.type === 'date' ? 'date' : 'text'"
                  :label="labelOf(field)"
                  :rules="field.required ? [required] : []"
                  :error-messages="fieldErrors[field.key]"
                />
              </VCol>
            </VRow>
          </template>
        </VForm>
      </VCardText>

      <VCardActions class="px-6 pb-4">
        <VSpacer />
        <VBtn
          variant="text"
          :disabled="isSaving"
          @click="isOpen = false"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          :loading="isSaving"
          @click="submit"
        >
          Save
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

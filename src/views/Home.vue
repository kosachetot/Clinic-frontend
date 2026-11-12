<script setup lang="ts">
import { useEventListener, useFullscreen } from '@vueuse/core'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import WellbeingChart from '@/components/WellbeingChart.vue'
import {
  type ChartDef,
  type Stat,
  type WellbeingStats,
  buildSections,
  buildSummary,
} from '@/data/wellbeing'
import { api } from '@/utils/api'
import dohLogo from '@images/logos/doh-logo.png'
import doh12Logo from '@images/logos/doh12-logo.png'

type Slide =
  | { kind: 'title' }
  | { kind: 'summary' }
  | { kind: 'chart'; section: string; chart: ChartDef }
  | { kind: 'stats'; section: string; stats: Stat[] }

// ---------- Live data ----------
const stats = ref<WellbeingStats | null>(null)
const selectedYear = ref<number | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const summary = computed(() => (stats.value ? buildSummary(stats.value) : null))
const sections = computed(() => (stats.value ? buildSections(stats.value) : []))

const hasData = computed(
  () => !!stats.value && (stats.value.philpen.total > 0 || stats.value.ame.total > 0),
)

async function loadStats(year?: number | null) {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data } = await api.get<WellbeingStats>('/dashboard/stats', {
      params: year ? { year } : {},
    })

    stats.value = data
    selectedYear.value = data.year
  }
  catch {
    errorMessage.value = 'Cannot load the dashboard data. Please make sure the server is running.'
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => loadStats())

// ---------- Presentation mode ----------
// Order: title, summary, then every section's charts (and stats)
const slides = computed<Slide[]>(() => {
  const list: Slide[] = [{ kind: 'title' }, { kind: 'summary' }]

  sections.value.forEach(section => {
    section.charts.forEach(chart => list.push({ kind: 'chart', section: section.title, chart }))
    if (section.stats)
      list.push({ kind: 'stats', section: section.title, stats: section.stats })
  })

  return list
})

const stage = ref<HTMLElement | null>(null)
const { isFullscreen, enter, exit } = useFullscreen(stage)
const isPresenting = ref(false)
const current = ref(0)
const currentSlide = computed(() => slides.value[current.value])

async function startPresentation() {
  current.value = 0
  isPresenting.value = true
  await nextTick()
  await enter()
}

function stopPresentation() {
  isPresenting.value = false
  if (isFullscreen.value)
    exit()
}

const next = () => { current.value = Math.min(current.value + 1, slides.value.length - 1) }
const prev = () => { current.value = Math.max(current.value - 1, 0) }

// Pressing Esc exits fullscreen in the browser: stop the presentation too
watch(isFullscreen, value => {
  if (!value && isPresenting.value)
    isPresenting.value = false
})

useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (!isPresenting.value)
    return

  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
    e.preventDefault()
    next()
  }
  else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
    e.preventDefault()
    prev()
  }
  else if (e.key === 'Home') {
    current.value = 0
  }
  else if (e.key === 'End') {
    current.value = slides.value.length - 1
  }
  else if (e.key === 'Escape') {
    stopPresentation()
  }
})

// Big numbers shown next to a chart in presentation mode
function keyFigures(chart: ChartDef) {
  const colors = chart.colors ?? []

  if (chart.series) {
    return chart.series.map((s, i) => ({
      label: s.name,
      value: s.values.reduce((a, b) => a + b, 0),
      color: colors[i],
      pct: '',
    }))
  }

  const values = chart.values ?? []
  const total = values.reduce((a, b) => a + b, 0)

  return chart.labels.map((label, i) => ({
    label,
    value: values[i],
    color: colors[i] ?? colors[0],
    pct: chart.type === 'pie' && total ? ` (${Math.round((values[i] / total) * 100)}%)` : '',
  }))
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-6">
      <div>
        <h4 class="text-h4 font-weight-bold text-primary">
          Regular Employees Wellbeing Report
        </h4>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Health status of regular employees
        </p>
      </div>

      <div class="d-flex align-center gap-3">
        <VSelect
          v-if="stats && stats.available_years.length"
          v-model="selectedYear"
          :items="stats.available_years"
          label="Year"
          density="compact"
          hide-details
          style="inline-size: 120px;"
          @update:model-value="loadStats"
        />

        <VBtn
          icon="mdi-refresh"
          variant="tonal"
          :loading="isLoading"
          @click="loadStats(selectedYear)"
        />

        <VBtn
          color="primary"
          size="large"
          prepend-icon="mdi-presentation-play"
          :disabled="!hasData"
          @click="startPresentation"
        >
          Present
        </VBtn>
      </div>
    </div>

    <VProgressLinear
      v-if="isLoading && !stats"
      indeterminate
      class="mb-4"
    />

    <VAlert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ errorMessage }}
      <template #append>
        <VBtn
          variant="text"
          @click="loadStats(selectedYear)"
        >
          Retry
        </VBtn>
      </template>
    </VAlert>

    <template v-if="stats && summary">
      <!-- Summary cards -->
      <VRow class="mb-4">
        <VCol
          cols="12"
          sm="6"
          md
        >
          <VCard
            color="primary"
            variant="flat"
          >
            <VCardText>
              <p class="text-body-2 mb-1">
                Regular employees
              </p>
              <h3 class="text-h3 font-weight-bold">
                {{ summary.totalRegular }}
              </h3>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          v-for="division in summary.divisions"
          :key="division.code"
          cols="12"
          sm="6"
          md
        >
          <VCard>
            <VCardText>
              <p class="text-body-2 text-medium-emphasis mb-1">
                {{ division.code }}
              </p>
              <h3 class="text-h3 font-weight-bold">
                {{ division.count }}
              </h3>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VAlert
        v-if="!hasData"
        type="info"
        variant="tonal"
        class="mb-6"
      >
        No assessments or medical exams are recorded for {{ summary.year }} yet.
      </VAlert>

      <!-- Sections -->
      <section
        v-for="section in sections"
        :key="section.id"
        class="mb-8"
      >
        <div class="d-flex align-center gap-2 mb-4">
          <VIcon
            :icon="section.icon"
            color="primary"
          />
          <h5 class="text-h5 font-weight-semibold">
            {{ section.title }}
          </h5>
        </div>

        <VRow
          v-if="section.stats"
          class="mb-2"
        >
          <VCol
            v-for="stat in section.stats"
            :key="stat.label"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard>
              <VCardText class="d-flex align-center gap-4">
                <h3
                  class="text-h3 font-weight-bold"
                  :style="{ color: stat.color }"
                >
                  {{ stat.value }}
                </h3>
                <span class="text-body-1">{{ stat.label }}</span>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <VRow>
          <VCol
            v-for="chart in section.charts"
            :key="chart.id"
            cols="12"
            md="6"
            xl="4"
          >
            <VCard :title="chart.title">
              <VCardText>
                <WellbeingChart
                  :chart="chart"
                  :height="280"
                />
                <p
                  v-if="chart.note"
                  class="text-caption text-medium-emphasis mt-2 mb-0"
                >
                  {{ chart.note }}
                </p>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </section>

      <p class="text-caption text-medium-emphasis">
        Live data from the clinic database ({{ summary.year }}).
      </p>
    </template>

    <!-- Presentation mode -->
    <div
      v-if="isPresenting && summary"
      ref="stage"
      class="stage"
    >
      <div class="stage-top">
        <span class="text-body-1 text-medium-emphasis">
          {{ currentSlide.kind === 'chart' || currentSlide.kind === 'stats' ? currentSlide.section : summary.title }}
        </span>
        <div class="d-flex align-center gap-4">
          <span class="text-body-1">{{ current + 1 }} / {{ slides.length }}</span>
          <VBtn
            icon="mdi-close"
            variant="text"
            @click="stopPresentation"
          />
        </div>
      </div>

      <div class="stage-body">
        <!-- Title slide -->
        <div
          v-if="currentSlide.kind === 'title'"
          class="text-center"
        >
          <div class="d-flex justify-center gap-6 mb-8">
            <img
              :src="dohLogo"
              alt="DOH logo"
              height="120"
            >
            <img
              :src="doh12Logo"
              alt="DOH XII logo"
              height="120"
            >
          </div>
          <h1 class="text-h2 font-weight-bold text-primary mb-2">
            {{ summary.title }}
          </h1>
          <h2 class="text-h3 text-medium-emphasis">
            {{ summary.year }}
          </h2>
        </div>

        <!-- Summary slide -->
        <div
          v-else-if="currentSlide.kind === 'summary'"
          class="w-100"
        >
          <h2 class="text-h3 font-weight-bold text-primary text-center mb-8">
            Total regular employees: {{ summary.totalRegular }}
          </h2>
          <VRow justify="center">
            <VCol
              v-for="division in summary.divisions"
              :key="division.code"
              cols="12"
              sm="6"
              md="3"
            >
              <VCard class="text-center pa-4">
                <h3 class="text-h2 font-weight-bold">
                  {{ division.count }}
                </h3>
                <p class="text-h6 mb-1">
                  {{ division.code }}
                </p>
              </VCard>
            </VCol>
          </VRow>
        </div>

        <!-- Stats slide -->
        <div
          v-else-if="currentSlide.kind === 'stats'"
          class="w-100"
        >
          <VRow justify="center">
            <VCol
              v-for="stat in currentSlide.stats"
              :key="stat.label"
              cols="12"
              md="4"
            >
              <VCard class="text-center pa-6">
                <h3
                  class="text-h1 font-weight-bold"
                  :style="{ color: stat.color }"
                >
                  {{ stat.value }}
                </h3>
                <p class="text-h5 mb-0">
                  {{ stat.label }}
                </p>
              </VCard>
            </VCol>
          </VRow>
        </div>

        <!-- Chart slide -->
        <VRow
          v-else
          class="w-100 align-center"
        >
          <VCol
            cols="12"
            md="7"
          >
            <WellbeingChart
              :key="current"
              :chart="currentSlide.chart"
              :height="520"
              large
            />
          </VCol>
          <VCol
            cols="12"
            md="5"
          >
            <h2 class="text-h4 font-weight-bold mb-6">
              {{ currentSlide.chart.title }}
            </h2>
            <div
              v-for="figure in keyFigures(currentSlide.chart)"
              :key="figure.label"
              class="d-flex align-center gap-3 mb-3"
            >
              <span
                class="dot"
                :style="{ background: figure.color }"
              />
              <span class="text-h5">{{ figure.label }}: <strong>{{ figure.value }}</strong>{{ figure.pct }}</span>
            </div>
            <p
              v-if="currentSlide.chart.note"
              class="text-body-1 text-medium-emphasis mt-6"
            >
              {{ currentSlide.chart.note }}
            </p>
          </VCol>
        </VRow>
      </div>

      <div class="stage-bottom">
        <VBtn
          variant="tonal"
          prepend-icon="mdi-chevron-left"
          :disabled="current === 0"
          @click="prev"
        >
          Previous
        </VBtn>
        <span class="text-caption text-medium-emphasis">Arrow keys to navigate, Esc to exit</span>
        <VBtn
          variant="tonal"
          append-icon="mdi-chevron-right"
          :disabled="current === slides.length - 1"
          @click="next"
        >
          Next
        </VBtn>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stage {
  position: fixed;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  inset: 0;
  padding-block: 24px;
  padding-inline: 40px;
}

.stage-top,
.stage-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage-body {
  display: flex;
  overflow: auto;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.dot {
  flex-shrink: 0;
  border-radius: 50%;
  block-size: 18px;
  inline-size: 18px;
}
</style>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'
import type { ChartDef } from '@/data/wellbeing2025'

const props = withDefaults(defineProps<{
  chart: ChartDef
  height?: number
  large?: boolean
}>(), {
  height: 300,
  large: false,
})

const theme = useTheme()
const isDark = computed(() => theme.current.value.dark)
const fontSize = computed(() => (props.large ? '18px' : '12px'))
const textColor = computed(() => (isDark.value ? '#e0e0e0' : '#37474f'))
const isBar = computed(() => props.chart.type === 'bar')

const colors = computed(
  () => props.chart.colors ?? ['#0a7ea4', '#12a58a', '#f9a825', '#e53935', '#7e57c2'],
)

const series = computed<ApexOptions['series']>(() => {
  if (!isBar.value)
    return props.chart.values ?? []

  if (props.chart.series)
    return props.chart.series.map(s => ({ name: s.name, data: s.values }))

  return [{ name: props.chart.title, data: props.chart.values ?? [] }]
})

const options = computed<ApexOptions>(() => {
  const base: ApexOptions = {
    chart: {
      type: isBar.value ? 'bar' : 'pie',
      stacked: !!props.chart.stacked,
      toolbar: { show: false },
      fontFamily: 'inherit',
      foreColor: textColor.value,
      background: 'transparent',
    },
    colors: colors.value,
    theme: { mode: isDark.value ? 'dark' : 'light' },
    tooltip: { y: { formatter: (v: number) => `${v} employees` } },
  }

  if (isBar.value) {
    return {
      ...base,
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '55%',
          distributed: !!props.chart.distributed,
        },
      },
      dataLabels: { enabled: true, style: { fontSize: fontSize.value } },
      xaxis: {
        categories: props.chart.labels,
        labels: { style: { fontSize: fontSize.value } },
      },
      yaxis: {
        labels: {
          style: { fontSize: fontSize.value },
          formatter: (v: number) => `${Math.round(v)}`,
        },
      },
      grid: { strokeDashArray: 4 },
      legend: { show: !!props.chart.series, position: 'bottom', fontSize: fontSize.value },
    }
  }

  return {
    ...base,
    labels: props.chart.labels,
    stroke: { width: 2, colors: [isDark.value ? '#1e1e1e' : '#ffffff'] },
    plotOptions: { pie: { expandOnClick: false } },
    // Show the real count inside each slice instead of a percentage
    dataLabels: {
      enabled: true,
      formatter: (_val: number | string | number[], opts?: any) =>
        String(opts.w.config.series[opts.seriesIndex]),
      style: { fontSize: props.large ? '24px' : '14px', fontWeight: 700 },
      dropShadow: { enabled: false },
    },
    legend: { position: 'bottom', fontSize: fontSize.value },
  }
})
</script>

<template>
  <VueApexCharts
    :type="isBar ? 'bar' : 'pie'"
    :height="height"
    :options="options"
    :series="series"
  />
</template>

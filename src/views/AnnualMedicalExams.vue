<script setup lang="ts">
import RecordsPage from '@/components/RecordsPage.vue'
import { ameConfig } from '@/data/clinicForms'
</script>

<template>
  <RecordsPage :config="ameConfig" />
</template>

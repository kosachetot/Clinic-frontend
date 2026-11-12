<script setup lang="ts">
import RecordsPage from '@/components/RecordsPage.vue'
import { philpenConfig } from '@/data/clinicForms'
</script>

<template>
  <RecordsPage :config="philpenConfig" />
</template>

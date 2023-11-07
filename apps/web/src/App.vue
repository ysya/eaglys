<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { RouterView } from 'vue-router'
const envTitle = import.meta.env.V_APP_NAME
useHead({
  titleTemplate: (title?: string) =>
    title ? `${envTitle} | ${title}` : envTitle,
})
</script>

<template>
  <RouterView />
</template>

<style scoped></style>

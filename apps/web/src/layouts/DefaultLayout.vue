<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'
const { y } = useWindowScroll()
const shouldShowBackToTop = computed(() => y.value > 500)
const backToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <q-layout view="lHh LpR lff">
    <q-header
      reveal
      elevated
      class="h-60px flex justify-center bg-white md:h-70px md:!bg-white/[0.7]"
    >
      <div
        class="relative h-full flex items-center px-2 text-3xl font-medium text-black container"
      >
        Sql Parser
      </div>
    </q-header>
    <q-page-container>
      <RouterView />
      <q-page-sticky position="bottom-right" :offset="[10, 10]" class="z-10">
        <q-btn
          v-if="shouldShowBackToTop"
          fab
          padding="10px"
          outline
          class="bg-white"
          @click="backToTop()"
        >
          <q-icon name="expand_less"></q-icon>
        </q-btn>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped></style>

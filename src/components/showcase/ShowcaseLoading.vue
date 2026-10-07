<template>
  <Showcase3DLoader
    :title="`INITIALIZING ${sectionMeta.label} EXPERIENCE`"
    :subtitle="`${sectionMeta.tagline} · SECTION ${sectionMeta.number}`"
    badge-text="COMPUTING 3D ASSETS"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { currentSection } from '@/composables/useShowcase'
import { getSectionMeta } from '@/composables/useShowcaseNavigation'
import Showcase3DLoader from './Showcase3DLoader.vue'

const sectionMeta = computed(() => getSectionMeta(currentSection.value))
</script>


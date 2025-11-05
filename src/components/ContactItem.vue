<template>
  <li class="group first:pt-0 pt-2" v-reveal="revealDelay != null ? { delay: revealDelay } : undefined">
    <a
      :href="href"
      :target="href?.startsWith('mailto:') ? undefined : '_blank'"
      rel="noopener"
      class="flex items-center justify-between rounded px-2 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
    >
      <div class="flex items-center gap-3">
        <!-- Icon -->
        <span aria-hidden="true">
          <!-- Email icon -->
          <svg v-if="type === 'email'" width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="16" height="16" rx="2" fill="currentColor" />
            <rect x="3" y="4.5" width="10" height="7" rx="1" class="fill-white dark:fill-black" />
            <path d="M3.5 5.5 L8 8.5 L12.5 5.5" class="stroke-current" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <!-- LinkedIn icon -->
          <svg v-else-if="type === 'linkedin'" width="18" height="18" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146z" />
            <path class="fill-white dark:fill-black" d="M4.943 13.5V6H2.542v7.5h2.401zm-1.2-8.574c.837 0 1.356-.554 1.356-1.248-.015-.709-.52-1.248-1.341-1.248-.822 0-1.356.54-1.356 1.248 0 .694.519 1.248 1.326 1.248h.015zM13.458 13.5V9.359c0-2.211-1.18-3.243-2.753-3.243-1.27 0-1.845.7-2.164 1.194h-.015V6H6.155c.03.677 0 7.5 0 7.5h2.401v-4.192c0-.224.016-.448.082-.608.181-.447.593-.912 1.284-.912.906 0 1.27.688 1.27 1.697V13.5h2.266z" />
          </svg>
          <!-- GitHub icon -->
          <svg v-else-if="type === 'github'" width="18" height="18" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8a8.01 8.01 0 0 0 5.47 7.59c.4.08.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
        </span>

        <div>
          <div class="text-sm font-medium">{{ label }}</div>
          <div class="text-sm opacity-70">{{ value }}</div>
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
        <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </a>
  </li>
</template>

<script setup lang="ts">
import type { ContactType } from '@/types'

defineProps<{
  type: ContactType
  label: string
  value: string
  href: string
  revealDelay?: number
}>()
</script>

<style scoped>
</style>


<template>
  <header
    class="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-black/10 dark:border-white/10 supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/70 transition-colors"
  >
    <nav class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <a
        href="#hero"
        class="font-semibold tracking-wide rounded px-2 py-1 -mx-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
      >
        <span class="letter" style="animation-delay: 0s">T</span>
        <span class="letter" style="animation-delay: 0.1s">e</span>
        <span class="letter" style="animation-delay: 0.2s">g</span>
        <span class="letter" style="animation-delay: 0.3s">a</span>
        <span class="letter" style="animation-delay: 0.4s">r</span>
        <span class="letter" style="animation-delay: 0.5s">.</span>
      </a>
      <ul class="hidden sm:flex gap-8 text-sm">
        <li v-for="item in items" :key="item.href">
          <a
            :href="item.href"
            class="relative inline-block py-1 px-1 -mx-1 transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white after:content-[''] after:absolute after:left-1 after:right-1 after:bottom-0 after:h-px after:bg-current after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
      <div class="flex items-center gap-3">
        <button
          @click="toggleTheme"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
          class="h-9 w-9 grid place-items-center rounded-full border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
        >
          <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 4v2M12 18v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          class="sm:hidden h-9 w-9 grid place-items-center rounded border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          @click="open = !open"
          :aria-label="open ? 'Close navigation' : 'Open navigation'"
          :aria-expanded="open"
        >
          <span class="relative block h-[14px] w-5">
            <span
              class="absolute left-0 top-0 h-px w-full bg-current transition-all duration-200"
              :class="open ? 'top-[6px] rotate-45' : ''"
            />
            <span
              class="absolute left-0 top-[6px] h-px w-full bg-current transition-all duration-200"
              :class="open ? 'opacity-0' : 'opacity-100'"
            />
            <span
              class="absolute left-0 top-[12px] h-px w-full bg-current transition-all duration-200"
              :class="open ? 'top-[6px] -rotate-45' : ''"
            />
          </span>
        </button>
      </div>
    </nav>
    <div
      v-if="open"
      class="sm:hidden absolute inset-x-0 top-full z-40 bg-white/90 dark:bg-black/90 backdrop-blur border-t border-b border-black/10 dark:border-white/10"
    >
      <ul class="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-2">
        <li v-for="item in items" :key="item.href" @click="open = false">
          <a
            :href="item.href"
            class="block py-2 px-2 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const items = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
] as const

const open = ref(false)
const { get, toggle } = useTheme()
const theme = ref<'light' | 'dark'>(get())

function toggleTheme() {
  theme.value = toggle()
}

onMounted(() => {
  theme.value = get()
})
</script>

<style scoped>
.letter {
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out forwards;
  display: inline-block;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>

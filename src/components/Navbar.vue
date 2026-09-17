<template>
  <header
    class="graphite-navbar sticky top-0 z-50"
    @keydown.esc="closeMenu"
  >
    <nav class="nav-inner mx-auto flex items-center justify-between">
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
      <ul class="nav-links hidden md:flex gap-8 text-sm">
        <li v-for="item in items" :key="item.href">
          <a
            :href="item.href"
            :class="{ 'nav-active': active === item.href }"
            :aria-current="active === item.href ? 'location' : undefined"
            class="nav-link relative inline-block py-1 px-1 -mx-1"
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
          class="md:hidden h-9 w-9 grid place-items-center rounded border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          ref="menuButton"
          aria-controls="mobile-navigation"
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
      id="mobile-navigation"
      v-if="open"
      class="mobile-navigation md:hidden absolute inset-x-0 top-full z-40"
    >
      <ul class="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-2">
        <li v-for="item in items" :key="item.href" @click="open = false">
          <a
            :href="item.href"
            :class="{ 'nav-active': active === item.href }"
            :aria-current="active === item.href ? 'location' : undefined"
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from '@/composables/useTheme'

const items = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
] as const

const open = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
function closeMenu() { open.value = false; menuButton.value?.focus() }
function onResize() { if (window.innerWidth >= 768) open.value = false }
const active = ref('#hero')
function updateActive() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
  active.value = '#' + (sections.reverse().find(section => section.getBoundingClientRect().top <= window.innerHeight * 0.4)?.id ?? 'hero')
}
const { get, toggle } = useTheme()
const theme = ref<'light' | 'dark'>(get())

function toggleTheme() {
  theme.value = toggle()
}

onMounted(() => {
  theme.value = get()
  updateActive()
  window.addEventListener('scroll', updateActive, { passive: true })
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => { window.removeEventListener('scroll', updateActive); window.removeEventListener('resize', onResize) })
</script>

<style scoped>
@media (max-width: 767px), (pointer: coarse) {
  .nav-inner button { min-width: 44px; min-height: 44px; }
  .mobile-navigation { max-height: calc(100svh - 80px); overflow-y: auto; padding-bottom: env(safe-area-inset-bottom); }
  .mobile-navigation a { display: flex; align-items: center; min-height: 44px; border-top: 1px solid var(--border); }
}

.letter {
  opacity: 1;
  display: inline-block;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>

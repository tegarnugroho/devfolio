<template>
  <header
    class="graphite-navbar sticky top-0 z-50"
    @keydown.esc="closeMenu"
  >
    <nav ref="navElement" class="nav-inner relative mx-auto flex items-center justify-between">
      <a
        href="#hero"
        @pointerenter="launchPlane"
        class="font-semibold tracking-wide rounded px-2 py-1 -mx-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
      >
        <span class="letter" style="animation-delay: 0s">T</span>
        <span class="letter" style="animation-delay: 0.1s">e</span>
        <span class="letter" style="animation-delay: 0.2s">g</span>
        <span class="letter" style="animation-delay: 0.3s">a</span>
        <span class="letter" style="animation-delay: 0.4s">r</span>
        <span ref="brandPeriod" class="letter" style="animation-delay: 0.5s">.</span>
      </a>
      <div v-if="planeFlying" class="brand-flight" :style="flightStyle" aria-hidden="true">
        <svg class="flight-trail" width="100%" height="100%" fill="none">
          <defs><mask id="brand-trail-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><path class="trail-reveal" :d="flightPath" pathLength="1" stroke="white" stroke-width="4" stroke-dasharray="1" stroke-dashoffset="1" /></mask></defs>
          <path :d="flightPath" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 5" stroke-linecap="round" mask="url(#brand-trail-mask)" />
        </svg>
        <svg class="paper-plane" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="m3 10 18-7-7 18-3-8-8-3Zm8 3 10-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </div>
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
          ref="themeButton"
          :aria-disabled="transitioning"
          :class="[theme === 'light' ? 'sky-day' : 'sky-night', direction, { 'sky-changing': transitioning }]"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
          class="theme-sky h-9 w-9 grid place-items-center rounded-full border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
        >
          <span class="sky-horizon" aria-hidden="true"></span>
          <svg class="sky-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 4v2M12 18v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <svg class="sky-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from '@/composables/useTheme'

const items = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
] as const

const navElement = ref<HTMLElement | null>(null)
const brandPeriod = ref<HTMLElement | null>(null)
const planeFlying = ref(false)
const flightPath = ref('')
const flightStyle = ref<Record<string, string>>({})
let flightTimer: ReturnType<typeof setTimeout> | undefined
function launchPlane(event: PointerEvent) {
  if (planeFlying.value || event.pointerType !== 'mouse' ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const nav = navElement.value, period = brandPeriod.value
  if (!nav || !period) return
  const bounds = nav.getBoundingClientRect(), dot = period.getBoundingClientRect()
  const origin = dot.left + dot.width / 2 - bounds.left
  const links = nav.querySelector('.nav-links')?.getBoundingClientRect()
  const distance = Math.min(400, (links?.left ?? bounds.right - 80) - bounds.left - origin - 24)
  if (distance < 40) return
  const brand = period.parentElement!.getBoundingClientRect()
  const left = Math.max(14 - bounds.left, brand.left - bounds.left - 40)
  const start = origin - left, center = dot.top + dot.height / 2 - bounds.top
  const end = start + distance
  const radiusX = (start - 16) / 2
  const radiusY = Math.max(12, Math.min(center - 14, bounds.height - center - 14))
  const middle = start - radiusX
  const bend = 0.5522847498 // Cubic approximation of each ellipse quadrant.
  const lower = center + radiusY, upper = center - radiusY
  const base = start + Math.min(32, distance * .12)
  const scale = Math.min(.58, (end - base - 16) / 244, (bounds.height - 32) / 100)
  const writingTop = (bounds.height - 82 * scale) / 2
  const point = (horizontal: number, vertical: number) => `${base + horizontal * scale} ${writingTop + vertical * scale}`
  // Draw the same connected Dev lettering as the hero, sized to the navbar gap.
  flightPath.value = `M ${start} ${center}
    C ${start} ${center + bend * radiusY}, ${middle + bend * radiusX} ${lower}, ${middle} ${lower}
    C ${middle - bend * radiusX} ${lower}, 16 ${center + bend * radiusY}, 16 ${center}
    C 16 ${center - bend * radiusY}, ${middle - bend * radiusX} ${upper}, ${middle} ${upper}
    C ${middle + radiusX} ${upper}, ${point(-30, 95)}, ${point(0, 80)}
    C ${point(4, 60)}, ${point(-4, 18)}, ${point(12, 0)}
    C ${point(82, -12)}, ${point(94, 80)}, ${point(4, 80)}
    C ${point(24, 94)}, ${point(70, 74)}, ${point(96, 48)}
    C ${point(120, 22)}, ${point(152, 38)}, ${point(128, 54)}
    C ${point(106, 66)}, ${point(88, 45)}, ${point(100, 62)}
    C ${point(116, 87)}, ${point(143, 82)}, ${point(159, 47)}
    C ${point(167, 31)}, ${point(163, 72)}, ${point(179, 82)}
    C ${point(194, 95)}, ${point(212, 35)}, ${point(231, 42)}
    C ${point(244, 46)}, ${end - 16} ${writingTop + 60 * scale}, ${end} ${writingTop + 32 * scale}`.replace(/\s+/g, ' ').trim()
  flightStyle.value = {
    left: `${left}px`, top: '0px', height: `${bounds.height}px`,
    width: `${end + 20}px`, maxWidth: `calc(100% - ${left}px)`,
    '--flight-path': `path("${flightPath.value}")`,
  }
  planeFlying.value = true
  flightTimer = setTimeout(() => { planeFlying.value = false }, 4500)
}
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
const transitioning = ref(false)
const direction = ref('')
const themeButton = ref<HTMLButtonElement | null>(null)
type ThemeViewTransition = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void>; skipTransition(): void }
let activeTransition: ThemeViewTransition | undefined
let commitTimer: ReturnType<typeof setTimeout> | undefined
let settleTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false
function settleTheme() {
  transitioning.value = false
  direction.value = ''
  const root = document.documentElement
  root.classList.remove('theme-radial', 'theme-fallback')
  for (const property of ['--theme-x', '--theme-y', '--theme-radius']) root.style.removeProperty(property)
  activeTransition = undefined
}
function toggleTheme() {
  if (transitioning.value) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.documentElement
  const start = (document as Document & { startViewTransition?: (update: () => Promise<void>) => ThemeViewTransition }).startViewTransition
  transitioning.value = true
  direction.value = theme.value === 'dark' ? 'sky-sunrise' : 'sky-sunset'
  if (reduced || !start || !themeButton.value) {
    root.classList.add('theme-fallback')
    commitTimer = setTimeout(() => { theme.value = toggle() }, reduced ? 0 : 100)
    settleTimer = setTimeout(settleTheme, reduced ? 120 : 820)
    return
  }
  const rect = themeButton.value.getBoundingClientRect()
  const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-radius', `${Math.ceil(radius)}px`)
  root.classList.add('theme-radial')
  commitTimer = setTimeout(async () => {
    let committed = false
    try {
      activeTransition = start.call(document, async () => {
        if (disposed) return
        theme.value = toggle()
        committed = true
        await nextTick()
      })
      // A skipped capture still applies its update callback; never toggle twice.
      void activeTransition.ready.catch(() => {})
      await activeTransition.updateCallbackDone
      await activeTransition.finished
    } catch {
      if (!committed && !disposed) theme.value = toggle()
    } finally { if (!disposed) settleTheme() }
  }, 100)
}

onMounted(() => {
  theme.value = get()
  updateActive()
  window.addEventListener('scroll', updateActive, { passive: true })
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => { disposed = true; clearTimeout(flightTimer); clearTimeout(commitTimer); clearTimeout(settleTimer); activeTransition?.skipTransition(); settleTheme(); window.removeEventListener('scroll', updateActive); window.removeEventListener('resize', onResize) })
</script>

<style scoped>
.brand-flight { position: absolute; overflow: hidden; pointer-events: none; color: var(--primary); z-index: 1; }
.flight-trail { position: absolute; inset: 0; opacity: 0; animation: brand-trail 4500ms linear both; }
.paper-plane { position: absolute; left: 0; top: 0; offset-path: var(--flight-path); offset-rotate: auto 45deg; opacity: 0; animation: flight-travel 3600ms cubic-bezier(.55,0,.85,.45) both, brand-plane 4500ms linear both; }
@keyframes flight-travel { from { offset-distance: 0%; } to { offset-distance: 100%; } }
@keyframes brand-plane {
  0% { opacity: 0; transform: scale(.65); }
  12% { opacity: .85; transform: scale(1); }
  86% { opacity: .85; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}
.trail-reveal { animation: trail-draw 3600ms cubic-bezier(.55,0,.85,.45) both; }
@keyframes trail-draw { to { stroke-dashoffset: 0; } }
@keyframes brand-trail {
  0% { opacity: 0; }
  12% { opacity: .32; }
  86% { opacity: .32; }
  100% { opacity: 0; }
}
@media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) { .brand-flight { display: none; } }

.theme-sky { position: relative; overflow: hidden; isolation: isolate; }
.theme-sky svg { position: absolute; transition: none; }
.sky-sun, .sky-moon { opacity: 0; transform: translateY(30px); }
.sky-day .sky-sun, .sky-night .sky-moon { opacity: 1; transform: translateY(0); }
.sky-horizon { position: absolute; inset: 72% 16% auto; height: 1px; background: currentColor; opacity: 0; }
.theme-sky::before { content: ''; position: absolute; inset: 0; z-index: -1; opacity: 0; background: linear-gradient(to bottom,transparent,var(--surface)); }
.sky-changing { animation: sky-press 120ms ease-out; }
.sky-changing::before, .sky-changing .sky-horizon { animation: sky-horizon 800ms ease; }
.sky-sunset .sky-sun, .sky-sunrise .sky-moon { animation: celestial-set 360ms cubic-bezier(.4,0,.7,1) both; }
.sky-sunset .sky-moon, .sky-sunrise .sky-sun { animation: celestial-rise 440ms 220ms cubic-bezier(.22,1,.36,1) both; }
@keyframes celestial-set { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(30px); } }
@keyframes celestial-rise { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sky-horizon { 0%,100% { opacity: 0; } 40%,65% { opacity: .16; } }
@keyframes sky-press { 50% { transform: scale(.94); } }
@media (prefers-reduced-motion: reduce) {
  .theme-sky svg { transform: none; transition: opacity 100ms !important; }
  .sky-changing, .sky-changing svg, .sky-changing::before, .sky-changing .sky-horizon { animation: none !important; }
}

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

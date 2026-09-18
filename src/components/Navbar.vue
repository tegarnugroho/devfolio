<template>
  <header
    class="graphite-navbar sticky top-0 z-[60]"
    @keydown.esc="closeMenu"
  >
    <nav data-blueprint="NAVIGATION" ref="navElement" class="nav-inner relative mx-auto flex items-center justify-between">
      <a
        :href="portfolioContent.navigation.homeTarget"
        @pointerenter="launchPlane" @click="launchPlane"
        class="font-semibold tracking-wide rounded px-2 py-1 -mx-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
      >
        <span v-for="(letter, index) in portfolioContent.site.name" :key="index" class="letter" :style="{ animationDelay: `${index / 10}s` }">{{ letter }}</span>
        <span ref="brandPeriod" class="letter" :style="{ animationDelay: `${portfolioContent.site.name.length / 10}s` }">{{ portfolioContent.site.brandPeriod }}</span>
      </a>
      <div v-if="planeFlying" class="brand-flight" :style="flightStyle" aria-hidden="true">
        <svg class="flight-trail" width="100%" height="100%" fill="none">
          <defs><mask id="brand-trail-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><path class="trail-reveal" :d="flightPath" pathLength="1" stroke="white" stroke-width="4" stroke-dasharray="1" stroke-dashoffset="1" /></mask></defs>
          <path :d="flightPath" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 5" stroke-linecap="round" mask="url(#brand-trail-mask)" />
        </svg>
        <svg class="paper-plane" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="m3 10 18-7-7 18-3-8-8-3Zm8 3 10-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </div>
      <ul ref="desktopLinks" class="nav-links relative hidden md:flex gap-8 text-sm">
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
        <li class="nav-travel-indicator" aria-hidden="true" :style="desktopIndicator"><span></span></li>
      </ul>
      <div class="flex items-center gap-3">
        <button
          @click="onThemeClick" @pointerdown="startHold" @pointermove="moveHold" @pointerup="cancelHold" @pointercancel="cancelHold" @pointerleave="cancelHold" @contextmenu.prevent
          ref="themeButton"
          :aria-disabled="transitioning"
          :class="[theme === 'light' ? 'sky-day' : 'sky-night', direction, { 'sky-changing': transitioning }]"
          :aria-label="portfolioContent.navigation.themeLabel(theme === 'dark' ? 'light' : 'dark')"
          class="theme-sky h-9 w-9 grid place-items-center rounded-full border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
        >
          <svg v-if="progressVisible" class="blueprint-hold-ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" /></svg>
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
          :aria-label="open ? portfolioContent.navigation.closeLabel : portfolioContent.navigation.openLabel"
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
    <Transition name="mobile-menu">
      <div id="mobile-navigation" v-if="open" :inert="!open" :aria-hidden="!open" class="mobile-navigation md:hidden absolute top-full z-40">
        <div class="mobile-menu-heading"><span>{{ portfolioContent.navigation.menuHeading }}</span><span>{{ String(Math.max(0, items.findIndex(item => item.href === active)) + 1).padStart(2, '0') }} / {{ String(items.length).padStart(2, '0') }}</span></div>
        <ul ref="mobileLinks" class="mobile-menu-sections">
          <li v-for="(item, index) in items" :key="item.href" :style="{ '--row-index': index }" class="mobile-menu-row">
            <a :href="item.href" @click="open = false" :class="{ selected: active === item.href }" :aria-current="active === item.href ? 'location' : undefined">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="menuIcons[item.href]" /></svg>
              <span>{{ item.label }}</span><span class="mobile-menu-number">{{ String(index + 1).padStart(2, '0') }}</span>
            </a>
          </li>
          <li class="mobile-travel-indicator" aria-hidden="true" :style="mobileIndicator"><span></span></li>
        </ul>
        <div class="mobile-menu-social">
          <p>{{ portfolioContent.navigation.connectHeading }}</p>
          <ul><li v-for="(contact, index) in menuContacts" :key="contact.type" class="mobile-menu-row" :style="{ '--row-index': index + items.length }">
            <a :href="contact.href" :target="contact.type === 'email' ? undefined : '_blank'" rel="noopener noreferrer" @click="open = false">
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="contact.type === 'email' ? 'none' : 'currentColor'" aria-hidden="true"><path :d="socialIcons[contact.type]" :stroke="contact.type === 'email' ? 'currentColor' : undefined" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <span>{{ contact.label }}</span><span class="mobile-social-arrow" aria-hidden="true">↗</span>
            </a>
          </li></ul>
        </div>
        <div class="mobile-menu-motto mobile-menu-row" :style="{ '--row-index': items.length + menuContacts.length }"><svg class="mobile-menu-dots" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle v-for="dot in 9" :key="dot" :cx="4 + ((dot - 1) % 3) * 8" :cy="4 + Math.floor((dot - 1) / 3) * 8" r="1.6" /></svg><span>{{ portfolioContent.navigation.menuMotto }}</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 10 18-7-7 18-3-8-8-3Zm8 3 10-10" stroke-linecap="round" stroke-linejoin="round" /></svg></div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { useFirstVisibleFlight } from '@/composables/useFirstVisibleFlight'
import { useBlueprintHold } from '@/composables/useBlueprint'
import { portfolioContent } from '@/content/portfolioContent'
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { themeRevealFallback } from '@/composables/themeRevealFallback'

const { progressVisible, startHold, moveHold, cancelHold, allowThemeClick } = useBlueprintHold()

const items = portfolioContent.navigation.items
const menuContacts = [...portfolioContent.contact.items].sort((a, b) => ['github', 'linkedin', 'email'].indexOf(a.type) - ['github', 'linkedin', 'email'].indexOf(b.type))
const menuIcons: Record<string, string> = {
  '#about': 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9',
  '#skills': 'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2Z',
  '#projects': 'M3 7V4h7l3 3h8v14H3ZM3 10h18',
  '#writing': 'M4 3h7a3 3 0 0 1 3 3v15a4 4 0 0 0-4-2H4ZM20 3h-3a3 3 0 0 0-3 3v15a4 4 0 0 1 4-2h2Z',
  '#contact': 'M3 5h18v14H3Zm0 0 9 7 9-7',
}
const socialIcons = {
  github: 'M12 1a11 11 0 0 0-3.48 21.44c.55.1.75-.24.75-.53v-2.04c-3.07.67-3.72-1.3-3.72-1.3-.5-1.28-1.22-1.62-1.22-1.62-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.58 1.19 3.21.91.1-.71.38-1.19.7-1.46-2.45-.28-5.03-1.23-5.03-5.45 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.03 1.13A10.53 10.53 0 0 1 12 5.31c.93 0 1.86.13 2.74.37 2.1-1.43 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.17-5.04 5.45.4.34.75 1.01.75 2.04v4.01c0 .29.2.64.76.53A11 11 0 0 0 12 1Z',
  linkedin: 'M3 2h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm3 7v10h3V9Zm1.5-5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM11 9v10h3v-5c0-3 3-3 3 0v5h3v-6c0-5-5-5-6-3V9Z',
  email: 'M3 5h18v14H3Zm0 0 9 7 9-7',
}

const navElement = ref<HTMLElement | null>(null)
const brandPeriod = ref<HTMLElement | null>(null)
const planeFlying = ref(false)
const flightPath = ref('')
const flightStyle = ref<Record<string, string>>({})
useFirstVisibleFlight(navElement, () => launchPlane())
let flightTimer: ReturnType<typeof setTimeout> | undefined
function launchPlane(event?: PointerEvent | MouseEvent) {
  const touchLayout = window.matchMedia('(hover: none), (pointer: coarse)').matches
  if (planeFlying.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (event && (event.type === 'click' ? !touchLayout : touchLayout || !('pointerType' in event) || event.pointerType !== 'mouse')) return
  const nav = navElement.value, period = brandPeriod.value
  if (!nav || !period) return
  const bounds = nav.getBoundingClientRect(), dot = period.getBoundingClientRect()
  const origin = dot.left + dot.width / 2 - bounds.left
  const links = nav.querySelector('.nav-links')?.getBoundingClientRect()
  const destination = links?.width ? links.left : themeButton.value?.getBoundingClientRect().left ?? bounds.right - 80
  const distance = Math.min(400, destination - bounds.left - origin - 24)
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
function onOutsidePointer(event: PointerEvent) { if (open.value && !navElement.value?.parentElement?.contains(event.target as Node)) open.value = false }
function onResize() { if (window.innerWidth >= 768) open.value = false; void nextTick(measureIndicators) }
const active = ref('#hero')
const desktopLinks = ref<HTMLElement | null>(null)
const mobileLinks = ref<HTMLElement | null>(null)
const desktopIndicator = ref({ transform: 'translate(0px, 0px)', width: '4px', opacity: 0 })
const mobileIndicator = ref({ transform: 'translateY(0px)', height: '4px', opacity: 0 })
let indicatorObserver: ResizeObserver | undefined
function measureIndicators() {
  const desktop = desktopLinks.value
  const link = desktop?.querySelector<HTMLAnchorElement>('a[aria-current="location"]')
  if (desktop && link && desktop.getClientRects().length) {
    const container = desktop.getBoundingClientRect()
    const range = document.createRange()
    range.selectNodeContents(link)
    const label = range.getBoundingClientRect()
    desktopIndicator.value = { transform: `translate(${label.left - container.left + label.width / 2 - 2}px, ${label.bottom - container.top + 8}px)`, width: '4px', opacity: 1 }
  } else desktopIndicator.value = { ...desktopIndicator.value, width: '4px', opacity: 0 }
  const mobileLink = mobileLinks.value?.querySelector<HTMLAnchorElement>('a[aria-current="location"]')
  if (mobileLink) {
    const row = mobileLink.parentElement!
    mobileIndicator.value = { transform: `translateY(${row.offsetTop + mobileLink.offsetHeight / 2 - 2}px)`, height: '4px', opacity: 1 }
  } else mobileIndicator.value = { ...mobileIndicator.value, height: '4px', opacity: 0 }
}
let dotAnimations: Animation[] = []
function launchDot() {
  dotAnimations.forEach(animation => animation.cancel())
  dotAnimations = []
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (const [container, vertical] of [[desktopLinks.value, false], [mobileLinks.value, true]] as const) {
    const dot = container?.querySelector<HTMLElement>(vertical ? '.mobile-travel-indicator span' : '.nav-travel-indicator span')
    if (!dot || !container?.getClientRects().length) continue
    dotAnimations.push(dot.animate([
      { transform: 'translate(0,0) scale(1)', borderRadius: '50%', offset: 0 },
      { transform: vertical ? 'translateX(-2px) scale(.65,2.8)' : 'translateY(3px) scale(2.8,.65)', borderRadius: '60% 40% 60% 40%', offset: .25 },
      { transform: vertical ? 'translateX(-1px) scale(.8,1.6)' : 'translateY(1px) scale(1.6,.8)', borderRadius: '50%', offset: .6 },
      { transform: 'translate(0,0) scale(1)', borderRadius: '50%', offset: 1 },
    ], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' }))
  }
}
watch([active, open], async ([current], [previous]) => {
  await nextTick()
  measureIndicators()
  if (current !== previous) launchDot()
})
watch([desktopLinks, mobileLinks], (elements, previous) => {
  previous?.forEach(element => { if (element) indicatorObserver?.unobserve(element) })
  elements.forEach(element => { if (element) indicatorObserver?.observe(element) })
  measureIndicators()
}, { flush: 'post' })
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
let fallbackReveal: ReturnType<typeof themeRevealFallback> | undefined
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
  fallbackReveal?.cancel()
  fallbackReveal = undefined
}
function onThemeClick() { if (allowThemeClick()) toggleTheme() }
function toggleTheme() {
  if (transitioning.value) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.documentElement
  const start = (document as Document & { startViewTransition?: (update: () => Promise<void>) => ThemeViewTransition }).startViewTransition
  transitioning.value = true
  direction.value = theme.value === 'dark' ? 'sky-sunrise' : 'sky-sunset'
  if (reduced || !themeButton.value) {
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
  if (!start) {
    fallbackReveal = themeRevealFallback(x, y, radius)
    commitTimer = setTimeout(async () => {
      theme.value = toggle()
      await nextTick()
      try { await fallbackReveal?.reveal() }
      catch { /* Cancellation still leaves the committed theme active. */ }
      finally { if (!disposed) settleTheme() }
    }, 100)
    return
  }
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
  indicatorObserver = new ResizeObserver(measureIndicators)
  if (desktopLinks.value) indicatorObserver.observe(desktopLinks.value)
  if (mobileLinks.value) indicatorObserver.observe(mobileLinks.value)
  void document.fonts.ready.then(() => { if (!disposed) measureIndicators() })
  theme.value = get()
  updateActive()
  window.addEventListener('scroll', updateActive, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('pointerdown', onOutsidePointer)
})
onBeforeUnmount(() => { indicatorObserver?.disconnect(); dotAnimations.forEach(animation => animation.cancel()); disposed = true; clearTimeout(flightTimer); clearTimeout(commitTimer); clearTimeout(settleTimer); activeTransition?.skipTransition(); settleTheme(); window.removeEventListener('scroll', updateActive); window.removeEventListener('resize', onResize); window.removeEventListener('pointerdown', onOutsidePointer) })
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
@media (prefers-reduced-motion: reduce) { .brand-flight { display: none; } }

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

.mobile-navigation { inset-inline: 12px; margin-top: 8px; padding: 22px 16px 16px; border: 1px solid var(--strong-border); border-radius: 18px; background: linear-gradient(145deg,var(--secondary-background),var(--background)); box-shadow: 0 20px 65px #0005,inset 0 1px 0 var(--border); max-height: calc(100svh - 96px - env(safe-area-inset-bottom)); overflow-y: auto; overscroll-behavior: contain; transform-origin: top right; }
.mobile-menu-heading { display: flex; justify-content: space-between; padding: 8px 10px 18px; font: 10px ui-monospace,monospace; text-transform: uppercase; letter-spacing: .14em; color: var(--label); }
.mobile-menu-sections a { display: flex; align-items: center; gap: 20px; padding: 16px; border-radius: 13px; color: var(--primary); font-size: 17px; font-weight: 500; min-height: 58px; }
.mobile-menu-sections a { color: var(--secondary); transition: color 250ms; }
.mobile-menu-sections a.selected { color: var(--primary); }
.mobile-navigation svg { flex-shrink: 0; }
.mobile-menu-number { margin-left: auto; font: 12px ui-monospace,monospace; color: var(--label); }
.mobile-menu-social { margin: 22px 6px 24px; padding-top: 24px; border-top: 1px solid var(--border); }
.mobile-menu-social p { padding-inline: 4px; margin-bottom: 18px; text-transform: uppercase; font: 10px ui-monospace,monospace; letter-spacing: .16em; color: var(--label); }
.mobile-menu-social a { display: flex; align-items: center; gap: 18px; min-height: 46px; padding: 10px 10px; font-size: 15px; color: var(--secondary); border-radius: 10px; }
.mobile-social-arrow { margin-left: auto; }
.mobile-menu-motto { display: flex; align-items: center; gap: 18px; padding: 16px; border-radius: 14px; border: 1px solid var(--border); background: linear-gradient(120deg,var(--surface),transparent); color: var(--secondary); font-size: 12px; min-height: 66px; }
.mobile-menu-motto svg { margin-left: auto; }
.mobile-menu-dots { font-size: 30px; line-height: 1; }
.mobile-navigation a:focus-visible { outline: 2px solid var(--secondary); outline-offset: -2px; }
.mobile-menu-enter-active { transition: opacity 280ms ease,transform 420ms cubic-bezier(.16,1,.3,1),filter 320ms ease; }
.mobile-menu-leave-active { transition: opacity 220ms ease,transform 280ms cubic-bezier(.4,0,1,1),filter 220ms ease; pointer-events: none; }
.mobile-menu-enter-from,.mobile-menu-leave-to { opacity: 0; transform: translateY(-14px) scale(.94); filter: blur(7px); }
.mobile-menu-enter-active .mobile-menu-row { animation: menu-row-in 420ms cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--row-index) * 35ms + 55ms); }
.mobile-menu-leave-active .mobile-menu-row { transition: opacity 140ms ease,transform 180ms ease; opacity: 0; transform: translateY(-6px); }
@keyframes menu-row-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .mobile-menu-enter-active,.mobile-menu-leave-active,.mobile-menu-row { transition: none !important; animation: none !important; } .mobile-menu-enter-from,.mobile-menu-leave-to { transform: none; filter: none; } }

.theme-sky .blueprint-hold-ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; opacity: .45; }
.blueprint-hold-ring circle { fill: none; stroke: currentColor; stroke-width: 1; stroke-dasharray: 113.1; stroke-dashoffset: 113.1; animation: blueprint-hold 400ms linear forwards; }
@keyframes blueprint-hold { to { stroke-dashoffset: 0; } }
.nav-travel-indicator,.mobile-travel-indicator { position: absolute; top: 0; left: 0; width: 4px; height: 4px; pointer-events: none; transition: transform 480ms cubic-bezier(.22,1,.36,1),opacity 180ms; }
.nav-travel-indicator span,.mobile-travel-indicator span { display: block; width: 4px; height: 4px; border-radius: 50%; background: var(--primary); }
.mobile-menu-sections { position: relative; }
.mobile-travel-indicator { left: 4px; }
@media (prefers-reduced-motion: reduce) { .nav-travel-indicator,.mobile-travel-indicator { transition: none; } }
</style>

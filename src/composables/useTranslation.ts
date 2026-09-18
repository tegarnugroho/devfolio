import { nextTick, onBeforeUnmount, onMounted, readonly, ref } from 'vue'
import { applyTranslations, portfolioContent } from '@/content/portfolioContent'
import { en } from '@/locales/en'
import { id } from '@/locales/id'

export type Locale = 'en' | 'id'
export const locales = { en, id }
const language = ref<Locale>('en')
const sectionIds = ['hero', 'about', 'skills', 'projects', 'writing', 'contact']

export function parseLocalePath(path: string) {
  const parts = path.split('/').filter(Boolean)
  const locale: Locale = parts[0] === 'id' ? 'id' : 'en'
  const candidate = parts[0] === 'en' || parts[0] === 'id' ? parts[1] : parts[0]
  return { locale, section: sectionIds.includes(candidate) ? candidate : 'hero' }
}

export function sectionHref(section: string, locale: Locale = language.value) {
  return `/${locale}${section && section !== 'hero' ? `/${section}` : ''}`
}

function metadata(section: string) {
  const site = portfolioContent.site
  document.documentElement.lang = language.value
  const label = portfolioContent.navigation.items.find(item => item.href === `#${section}`)?.label
  document.title = label ? `${label} | ${site.title}` : site.title
  const values = [['meta[name="description"]', site.description], ['meta[property="og:title"]', document.title],
    ['meta[property="og:description"]', site.socialDescription], ['meta[property="og:site_name"]', site.portfolioName],
    ['meta[name="application-name"]', site.portfolioName]]
  values.forEach(([selector, value]) => document.querySelector(selector)?.setAttribute('content', value))
  for (const locale of ['en', 'id', 'x-default'] as const) {
    let link = document.querySelector<HTMLLinkElement>(`link[hreflang="${locale}"]`)
    if (!link) { link = document.createElement('link'); link.rel = 'alternate'; link.hreflang = locale; document.head.append(link) }
    link.href = new URL(sectionHref(section, locale === 'x-default' ? 'en' : locale), location.origin).href
  }
}

export function updateSectionUrl(section: string, mode: 'push' | 'replace' = 'replace') {
  const path = sectionHref(section) + location.search
  if (location.pathname + location.search + location.hash !== path) {
    if (mode === 'push') history.pushState(null, '', path)
    else history.replaceState(null, '', path)
  }
  metadata(section)
}

export function initializeLocalization() {
  const route = parseLocalePath(location.pathname)
  const hash = location.hash.slice(1)
  if (sectionIds.includes(hash)) route.section = hash
  language.value = route.locale
  applyTranslations(locales[route.locale])
  updateSectionUrl(route.section)
  history.scrollRestoration = 'manual'
}

function currentSection() {
  const link = document.querySelector<HTMLAnchorElement>('.hero-markers a[aria-current]')
  return parseLocalePath(link ? new URL(link.href).pathname : location.pathname).section
}

async function setLocale(locale: Locale) {
  if (locale === language.value) return
  window.dispatchEvent(new Event('locale-changing'))
  const section = currentSection()
  const element = document.getElementById(section)
  const position = window.scrollY
  const relative = element?.getBoundingClientRect().top
  language.value = locale
  applyTranslations(locales[locale])
  updateSectionUrl(section, 'push')
  await nextTick()
  // Preserve the section's viewport position when translated copy changes its height.
  window.scrollTo({ top: element && relative !== undefined ? window.scrollY + element.getBoundingClientRect().top - relative : position, behavior: 'instant' })
  window.dispatchEvent(new Event('blueprint-layout'))
  window.dispatchEvent(new Event('scroll'))
}

export function useTranslation() {
  return { t: portfolioContent, locale: readonly(language), setLocale, sectionHref }
}

export function useLocaleRouting() {
  async function restoreRoute() {
    window.dispatchEvent(new Event('locale-changing'))
    const route = parseLocalePath(location.pathname)
    language.value = route.locale
    applyTranslations(locales[route.locale])
    metadata(route.section)
    await nextTick()
    const element = document.getElementById(route.section)
    if (!element) return
    const margin = Math.max(parseFloat(getComputedStyle(element).scrollMarginTop) || 0,
      document.querySelector('.graphite-navbar')?.getBoundingClientRect().height ?? 0)
    window.scrollTo({ top: route.section === 'hero' ? 0 : element.getBoundingClientRect().top + window.scrollY - margin, behavior: 'instant' })
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('blueprint-layout'))
  }
  onMounted(() => { void restoreRoute(); window.addEventListener('popstate', restoreRoute) })
  onBeforeUnmount(() => window.removeEventListener('popstate', restoreRoute))
}

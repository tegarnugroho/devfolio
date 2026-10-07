import { computed } from 'vue'
import type { ShowcaseSection, ShowcaseSectionMeta } from '@/types/showcase'
import { activeScrollSection } from './useScrollHash'
import { navigationTarget } from './useSectionNavigation'

export const SHOWCASE_SECTIONS: ShowcaseSectionMeta[] = [
  {
    id: 'hero',
    number: '01',
    label: 'HERO',
    actionLabel: 'ENTER EXPERIENCE',
    tagline: 'Orbital Space Observatory',
    icon: 'orbit',
  },
  {
    id: 'about',
    number: '02',
    label: 'ABOUT',
    actionLabel: 'EXPLORE JOURNEY',
    tagline: 'Interactive Journey Timeline',
    icon: 'timeline',
  },
  {
    id: 'skills',
    number: '03',
    label: 'SKILLS',
    actionLabel: 'EXPLORE SKILLS',
    tagline: 'Technology Tree & Constellation',
    icon: 'tree',
  },
  {
    id: 'projects',
    number: '04',
    label: 'PROJECTS',
    actionLabel: 'START SHOWCASE',
    tagline: 'Global Project Deployments',
    icon: 'globe',
  },
  {
    id: 'writing',
    number: '05',
    label: 'WRITING',
    actionLabel: 'EXPLORE FIELD',
    tagline: 'Spatial Knowledge Field',
    icon: 'archive',
  },
  {
    id: 'contact',
    number: '06',
    label: 'CONTACT',
    actionLabel: 'CONNECT NOW',
    tagline: 'Communication Field',
    icon: 'uplink',
  },
]

export const sectionIds: ShowcaseSection[] = SHOWCASE_SECTIONS.map(s => s.id)

export function getSectionMeta(section: ShowcaseSection): ShowcaseSectionMeta {
  return SHOWCASE_SECTIONS.find(s => s.id === section) || SHOWCASE_SECTIONS[0]
}

export function isValidShowcaseSection(val: unknown): val is ShowcaseSection {
  return typeof val === 'string' && sectionIds.includes(val as ShowcaseSection)
}

/**
 * Actively checks the current viewport position across all section elements
 * to guarantee the exact active section is returned even during/after programmatic scrolling.
 */
export function detectCurrentPageSection(): ShowcaseSection {
  // If actively navigating to a target section, return that target immediately
  if (navigationTarget.value && isValidShowcaseSection(navigationTarget.value)) {
    return navigationTarget.value
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const scrollY = window.scrollY || window.pageYOffset || 0
    const innerH = window.innerHeight || 800
    const docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    )

    if (scrollY <= 50) return 'hero'
    if (scrollY + innerH >= docH - 50) return 'contact'

    const elements = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
    if (elements.length > 0) {
      // Find the section intersecting the upper-middle of viewport
      const probeY = innerH * 0.45
      const reversed = [...elements].reverse()
      const found = reversed.find((el) => {
        const rect = el.getBoundingClientRect()
        return rect.top <= probeY
      })
      if (found && isValidShowcaseSection(found.id)) {
        return found.id
      }
    }
  }

  const current = activeScrollSection.value
  if (current && isValidShowcaseSection(current)) {
    return current
  }
  return 'hero'
}

/**
 * Returns current active section on the page (matching page scroll),
 * falls back to real-time viewport detection and 'hero'.
 */
export const activePageShowcaseSection = computed<ShowcaseSection>(() => {
  const current = activeScrollSection.value
  if (current && isValidShowcaseSection(current)) {
    return current
  }
  return detectCurrentPageSection()
})


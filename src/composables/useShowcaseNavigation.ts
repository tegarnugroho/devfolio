import { computed } from 'vue'
import type { ShowcaseSection, ShowcaseSectionMeta } from '@/types/showcase'
import { activeScrollSection } from './useScrollHash'

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
 * Returns current active section on the page (matching page scroll),
 * falls back to 'hero' if outside sections.
 */
export const activePageShowcaseSection = computed<ShowcaseSection>(() => {
  const current = activeScrollSection.value
  if (current && isValidShowcaseSection(current)) {
    return current
  }
  return 'hero'
})


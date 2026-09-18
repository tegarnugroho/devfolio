import { reactive } from 'vue'
import { en } from '../locales/en'

export type { NavItemContent, SkillGroupContent } from './contentModels'

function clone<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clone) as T
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)])) as T
  return value
}

// Keep section and array references stable when translations change.
export const portfolioContent = reactive(clone(en))

export function applyTranslations(dictionary: typeof en) {
  function sync(target: Record<string, unknown>, source: Record<string, unknown>) {
    for (const [key, value] of Object.entries(source)) {
      const current = target[key]
      if (value && typeof value === 'object' && current && typeof current === 'object') {
        sync(current as Record<string, unknown>, value as Record<string, unknown>)
      } else target[key] = value
    }
    if (Array.isArray(target) && Array.isArray(source)) target.length = source.length
  }
  sync(portfolioContent, dictionary)
}

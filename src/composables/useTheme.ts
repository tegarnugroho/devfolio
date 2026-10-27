import { ref, computed } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

export interface DayAccentPalette {
  dayIndex: number
  dayName: string
  dayNameId: string
  mood: string
  light: string
  dark: string
}

/**
 * 7-Day Dynamic Accent Palette System
 * Each day of the week brings a unique energy and accent tone to the portfolio.
 */
export const DAILY_ACCENT_PALETTES: Record<number, DayAccentPalette> = {
  // 0 = Sunday / Minggu
  0: {
    dayIndex: 0,
    dayName: 'Sunday',
    dayNameId: 'Minggu',
    mood: 'Solar Amber',
    light: '#d97706',
    dark: '#f59e0b',
  },
  // 1 = Monday / Senin
  1: {
    dayIndex: 1,
    dayName: 'Monday',
    dayNameId: 'Senin',
    mood: 'Fresh Emerald',
    light: '#16a34a',
    dark: '#22c55e',
  },
  // 2 = Tuesday / Selasa
  2: {
    dayIndex: 2,
    dayName: 'Tuesday',
    dayNameId: 'Selasa',
    mood: 'Cyber Cyan',
    light: '#0891b2',
    dark: '#06b6d4',
  },
  // 3 = Wednesday / Rabu
  3: {
    dayIndex: 3,
    dayName: 'Wednesday',
    dayNameId: 'Rabu',
    mood: 'Electric Sky',
    light: '#0284c7',
    dark: '#38bdf8',
  },
  // 4 = Thursday / Kamis
  4: {
    dayIndex: 4,
    dayName: 'Thursday',
    dayNameId: 'Kamis',
    mood: 'Deep Indigo',
    light: '#4f46e5',
    dark: '#818cf8',
  },
  // 5 = Friday / Jumat
  5: {
    dayIndex: 5,
    dayName: 'Friday',
    dayNameId: 'Jumat',
    mood: 'Creative Violet',
    light: '#7c3aed',
    dark: '#a855f7',
  },
  // 6 = Saturday / Sabtu
  6: {
    dayIndex: 6,
    dayName: 'Saturday',
    dayNameId: 'Sabtu',
    mood: 'Sunset Rose',
    light: '#e11d48',
    dark: '#fb7185',
  },
}

export const isDark = ref<boolean>(
  typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true
)

/**
 * Returns today's active accent palette metadata and computed active hex code.
 */
export const currentDailyAccent = computed(() => {
  const dayIndex = new Date().getDay()
  const palette = DAILY_ACCENT_PALETTES[dayIndex] || DAILY_ACCENT_PALETTES[1]
  const isDarkMode = isDark.value
  return {
    ...palette,
    color: isDarkMode ? palette.dark : palette.light,
  }
})

/**
 * Applies the day-of-the-week accent color directly to CSS custom properties on <html>
 */
export function applyDailyAccent(theme?: Theme) {
  if (typeof document === 'undefined') return

  const currentTheme =
    theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  const dayIndex = new Date().getDay()
  const palette = DAILY_ACCENT_PALETTES[dayIndex] || DAILY_ACCENT_PALETTES[1]
  const accentColor = currentTheme === 'dark' ? palette.dark : palette.light

  const root = document.documentElement
  root.style.setProperty('--label', accentColor)
  root.style.setProperty('--accent', accentColor)
}

if (typeof window !== 'undefined') {
  const observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
    applyDailyAccent()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

export function initializeTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const theme: Theme = stored === 'light' ? 'light' : 'dark'
    applyTheme(theme)
    applyDailyAccent(theme)
  } catch {
    // no-op in non-DOM contexts
  }
}

export function useTheme() {
  const get = (): Theme =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  const toggle = (): Theme => {
    const next: Theme = get() === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    return next
  }
  const set = (theme: Theme) => applyTheme(theme)
  return { get, toggle, set, isDark, currentDailyAccent }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  isDark.value = theme === 'dark'
  applyDailyAccent(theme)

  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore storage errors
  }
}

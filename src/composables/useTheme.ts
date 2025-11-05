export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

export function initializeTheme() {
  try {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null)
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme: Theme = stored ?? (prefersDark ? 'dark' : 'light')
    applyTheme(theme)
  } catch {
    // no-op in non-DOM contexts
  }
}

export function useTheme() {
  const get = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  const toggle = (): Theme => {
    const next: Theme = get() === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    return next
  }
  const set = (theme: Theme) => applyTheme(theme)
  return { get, toggle, set }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore storage errors
  }
}


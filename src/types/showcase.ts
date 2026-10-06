export type ShowcaseSection =
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'writing'
  | 'contact'

export type ShowcaseTransitionState = 'idle' | 'entering' | 'active' | 'exiting'

export interface ShowcaseSectionMeta {
  id: ShowcaseSection
  number: string
  label: string
  actionLabel: string
  tagline: string
  icon: string
}

export interface ShowcaseState {
  isOpen: boolean
  currentSection: ShowcaseSection
  previousScrollY: number
  transitionState: ShowcaseTransitionState
  isLoading: boolean
  isError: boolean
}


export interface NavItemContent { href: string; label: string }

export interface SkillGroupContent {
  label: string
  description: string
  icon: 'platforms' | 'frameworks' | 'networking' | 'storage' | 'tooling'
  items: string[]
}

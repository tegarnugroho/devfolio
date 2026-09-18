import type { Project } from '../types'

export interface NavItemContent { href: string; label: string }

export interface SkillGroupContent {
  label: string
  description: string
  icon: 'platforms' | 'frameworks' | 'networking' | 'storage' | 'tooling'
  items: string[]
}

export type ProjectStatus = 'published' | 'hidden'

export type ProjectContent = Omit<Project, 'id'> & {
  status: ProjectStatus
  featured?: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  link?: string
  repo?: string
  image?: string
}

export interface Skill {
  name: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}

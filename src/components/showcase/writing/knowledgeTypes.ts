export interface KnowledgeArticle {
  id: string
  title: string
  shortTitle: string
  category: string
  date: string
  year: string
  excerpt: string
  tags: string[]
  url: string
}

export type CategoryFilter = string

export interface SpatialNodeState {
  article: KnowledgeArticle
  index: number
  targetPosition: [number, number, number]
  targetRotation: [number, number, number]
  targetScale: number
  targetOpacity: number
  isSelected: boolean
  isHovered: boolean
  isVisible: boolean
}

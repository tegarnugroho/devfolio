export interface KnowledgeArticle {
  id: string
  title: string
  shortTitle: string
  category: 'Flutter' | 'Dart' | 'Architecture' | 'Tools' | 'Productivity'
  date: string
  year: string
  excerpt: string
  keyInsights: string[]
  url: string
}

export type CategoryFilter = 'ALL' | 'Flutter' | 'Dart' | 'Architecture' | 'Tools'

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

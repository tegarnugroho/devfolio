import type { KnowledgeArticle, CategoryFilter } from './knowledgeTypes'

export interface NodeTransform {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  opacity: number
  visible: boolean
}

// Predefined deterministic spatial anchor slots for inactive articles in 3D field
const DESKTOP_ANCHORS: Array<{
  pos: [number, number, number]
  rot: [number, number, number]
}> = [
  // 0: Upper-Left (leaves room for header)
  { pos: [-2.8, 1.85, -1.1], rot: [0.06, 0.22, 0.02] },
  // 1: Upper-Right
  { pos: [3.5, 1.95, -0.9], rot: [-0.04, -0.24, -0.02] },
  // 2: Right-Flank
  { pos: [4.1, -0.25, -1.6], rot: [0.03, -0.32, 0.01] },
  // 3: Lower-Right (above editorial preview)
  { pos: [3.1, -2.05, -1.2], rot: [-0.05, -0.18, -0.02] },
  // 4: Lower-Left
  { pos: [-3.3, -1.85, -1.4], rot: [0.06, 0.26, 0.03] },
  // 5: Far-Left
  { pos: [-4.4, 0.15, -2.2], rot: [-0.04, 0.35, -0.01] },
  // 6: Deep-Top
  { pos: [-0.2, 2.45, -2.4], rot: [0.08, 0.06, 0.0] },
  // 7: Deep-Bottom
  { pos: [-0.7, -2.45, -2.5], rot: [-0.08, -0.06, 0.0] },
]

const MOBILE_ANCHORS: Array<{
  pos: [number, number, number]
  rot: [number, number, number]
}> = [
  { pos: [-1.4, 1.8, -1.2], rot: [0.04, 0.15, 0.01] },
  { pos: [1.4, 1.8, -1.2], rot: [-0.04, -0.15, -0.01] },
  { pos: [-1.6, -1.6, -1.4], rot: [0.04, 0.18, 0.01] },
  { pos: [1.6, -1.6, -1.4], rot: [-0.04, -0.18, -0.01] },
  { pos: [0.0, 2.4, -2.0], rot: [0.06, 0.0, 0.0] },
  { pos: [0.0, -2.4, -2.0], rot: [-0.06, 0.0, 0.0] },
]

/**
 * Computes deterministic target 3D transform for an article based on selection & filter.
 */
export function calculateNodeTransform(
  article: KnowledgeArticle,
  allArticles: KnowledgeArticle[],
  selectedId: string,
  categoryFilter: CategoryFilter,
  isMobile: boolean
): NodeTransform {
  // Check if article matches category
  const matchesFilter = categoryFilter === 'ALL' || article.category === categoryFilter

  if (!matchesFilter) {
    return {
      position: [0, 0, -6.0],
      rotation: [0, 0, 0],
      scale: 0.001,
      opacity: 0.0,
      visible: false,
    }
  }

  // If this is the active selected article:
  if (article.id === selectedId) {
    if (isMobile) {
      return {
        position: [0.0, -0.2, 0.6],
        rotation: [0.0, 0.0, 0.0],
        scale: 0.92,
        opacity: 1.0,
        visible: true,
      }
    }
    // Desktop: focal position slightly to the right to balance left header
    return {
      position: [0.85, 0.05, 1.35],
      rotation: [0.0, 0.0, 0.0],
      scale: 1.0,
      opacity: 1.0,
      visible: true,
    }
  }

  // For inactive articles:
  // Determine index among inactive visible articles for stable deterministic placement
  const visibleInactive = allArticles.filter(
    a => a.id !== selectedId && (categoryFilter === 'ALL' || a.category === categoryFilter)
  )
  const inactiveIndex = visibleInactive.findIndex(a => a.id === article.id)

  const anchors = isMobile ? MOBILE_ANCHORS : DESKTOP_ANCHORS
  const anchor = anchors[inactiveIndex % anchors.length]

  return {
    position: [...anchor.pos],
    rotation: [...anchor.rot],
    scale: isMobile ? 0.72 : 0.78,
    opacity: 0.38,
    visible: true,
  }
}

/**
 * Builds pair indices of articles that have conceptual connections (same category).
 */
export function buildRelationshipPairs(
  articles: KnowledgeArticle[],
  categoryFilter: CategoryFilter
): Array<[number, number]> {
  const pairs: Array<[number, number]> = []
  const visibleIndices: number[] = []

  articles.forEach((a, i) => {
    if (categoryFilter === 'ALL' || a.category === categoryFilter) {
      visibleIndices.push(i)
    }
  })

  // Connect consecutive articles in the same category
  const categoryGroups = new Map<string, number[]>()
  for (const idx of visibleIndices) {
    const cat = articles[idx].category
    if (!categoryGroups.has(cat)) {
      categoryGroups.set(cat, [])
    }
    categoryGroups.get(cat)!.push(idx)
  }

  for (const group of categoryGroups.values()) {
    for (let i = 0; i < group.length - 1; i++) {
      pairs.push([group[i], group[i + 1]])
    }
  }

  return pairs
}


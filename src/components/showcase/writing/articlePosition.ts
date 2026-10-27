/**
 * Visual styling and spatial layout helpers for the 3D Editorial Article Archive.
 */

/**
 * Returns a restrained, high-contrast aerospace neon accent color
 * based on article category and tags.
 */
export function getCategoryAccentColor(category: string, tags: string[] = []): string {
  const combined = [category, ...tags].join(' ').toLowerCase()

  if (combined.includes('flutter') || combined.includes('mobile')) {
    return '#38bdf8' // Sky Cyan (SpaceX Dragon telemetry style)
  }
  if (combined.includes('data') || combined.includes('excel') || combined.includes('csv') || combined.includes('parser')) {
    return '#10b981' // Emerald
  }
  if (combined.includes('arch') || combined.includes('clean') || combined.includes('domain') || combined.includes('pattern')) {
    return '#8b5cf6' // Muted Violet
  }
  if (combined.includes('state') || combined.includes('riverpod') || combined.includes('reactive')) {
    return '#06b6d4' // Deep Teal
  }
  if (combined.includes('tool') || combined.includes('devops') || combined.includes('cli') || combined.includes('config') || combined.includes('security')) {
    return '#f59e0b' // Amber
  }
  if (combined.includes('multiplatform') || combined.includes('desktop') || combined.includes('web')) {
    return '#3b82f6' // Radiant Blue
  }
  if (combined.includes('performance') || combined.includes('benchmark') || combined.includes('isolate')) {
    return '#f43f5e' // Crimson / Rose
  }

  return '#38bdf8' // Default Sky
}

/**
 * Calculates estimated reading time string from text or excerpt.
 */
export function calculateReadingTime(text: string): string {
  if (!text || text.trim().length === 0) return '3 MIN READ'
  const words = text.trim().split(/\s+/).length
  const estimatedTotalWords = Math.max(700, words * 8)
  const minutes = Math.max(2, Math.round(estimatedTotalWords / 200))
  return `${minutes} MIN READ`
}

import type { CSSProperties } from 'vue'

export type CardSpatialStyle = CSSProperties

/**
 * Computes CSS 3D perspective transforms for an article card in the spatial deck.
 */
export function getCardSpatialStyle(
  index: number,
  selectedIndex: number,
  total: number,
  isMobile: boolean
): CardSpatialStyle {
  const diff = index - selectedIndex

  // Selected Featured Card in foreground
  if (diff === 0) {
    return {
      transform: isMobile
        ? 'translate3d(0, 0, 40px) rotateY(0deg) scale(1)'
        : 'translate3d(0, 0, 80px) rotateY(0deg) scale(1)',
      opacity: 1,
      zIndex: 30,
      pointerEvents: 'auto',
      visibility: 'visible',
    }
  }

  // 1 step to the right
  if (diff === 1) {
    return {
      transform: isMobile
        ? 'translate3d(75%, 0, -50px) rotateY(-14deg) scale(0.86)'
        : 'translate3d(340px, 0, -60px) rotateY(-18deg) scale(0.88)',
      opacity: isMobile ? 0.35 : 0.65,
      zIndex: 20,
      pointerEvents: 'auto',
      visibility: 'visible',
    }
  }

  // 1 step to the left
  if (diff === -1) {
    return {
      transform: isMobile
        ? 'translate3d(-75%, 0, -50px) rotateY(14deg) scale(0.86)'
        : 'translate3d(-340px, 0, -60px) rotateY(18deg) scale(0.88)',
      opacity: isMobile ? 0.35 : 0.65,
      zIndex: 20,
      pointerEvents: 'auto',
      visibility: 'visible',
    }
  }

  // 2 steps to the right
  if (diff === 2 && !isMobile) {
    return {
      transform: 'translate3d(620px, 0, -180px) rotateY(-26deg) scale(0.76)',
      opacity: 0.3,
      zIndex: 10,
      pointerEvents: 'auto',
      visibility: 'visible',
    }
  }

  // 2 steps to the left
  if (diff === -2 && !isMobile) {
    return {
      transform: 'translate3d(-620px, 0, -180px) rotateY(26deg) scale(0.76)',
      opacity: 0.3,
      zIndex: 10,
      pointerEvents: 'auto',
      visibility: 'visible',
    }
  }

  // Beyond view
  const sign = Math.sign(diff)
  return {
    transform: `translate3d(${sign * (isMobile ? 120 : 900)}px, 0, -300px) scale(0.6)`,
    opacity: 0,
    zIndex: 1,
    pointerEvents: 'none',
    visibility: 'hidden',
  }
}

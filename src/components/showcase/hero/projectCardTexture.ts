import * as THREE from 'three'
import type { HeroProjectItem } from './heroTypes'

/**
 * Creates high-DPI canvas texture for a floating miniature 3D project preview card.
 */
export function createProjectCardTexture(
  project: HeroProjectItem,
  isHovered: boolean
): THREE.CanvasTexture {
  const width = 512
  const height = 360
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  // 1. Base Dark Graphite Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  if (isHovered) {
    bgGrad.addColorStop(0, '#151c27')
    bgGrad.addColorStop(0.5, '#0e131d')
    bgGrad.addColorStop(1, '#080c12')
  } else {
    bgGrad.addColorStop(0, '#10141c')
    bgGrad.addColorStop(0.5, '#0a0d13')
    bgGrad.addColorStop(1, '#06080b')
  }
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 2. Technical Subtle Grid
  ctx.strokeStyle = isHovered ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.03)'
  ctx.lineWidth = 1
  for (let x = 32; x < width; x += 48) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 32; y < height; y += 48) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 3. Hairline Border & Corner Brackets
  ctx.strokeStyle = isHovered ? 'rgba(56, 189, 248, 0.65)' : 'rgba(255, 255, 255, 0.14)'
  ctx.lineWidth = isHovered ? 2 : 1
  ctx.strokeRect(16, 16, width - 32, height - 32)

  if (isHovered) {
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2.5
    const len = 16
    // Top-left
    ctx.beginPath(); ctx.moveTo(16, 16 + len); ctx.lineTo(16, 16); ctx.lineTo(16 + len, 16); ctx.stroke()
    // Top-right
    ctx.beginPath(); ctx.moveTo(width - 16 - len, 16); ctx.lineTo(width - 16, 16); ctx.lineTo(width - 16, 16 + len); ctx.stroke()
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(16, height - 16 - len); ctx.lineTo(16, height - 16); ctx.lineTo(16 + len, height - 16); ctx.stroke()
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(width - 16 - len, height - 16); ctx.lineTo(width - 16, height - 16); ctx.lineTo(width - 16, height - 16 - len); ctx.stroke()
  }

  // 4. Header Tag
  ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.fillStyle = isHovered ? '#38bdf8' : '#71717a'
  ctx.textAlign = 'left'
  ctx.fillText('FEATURED SYSTEM // 01', 36, 52)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#a1a1aa'
  ctx.fillText('PRODUCTION', width - 36, 52)

  // Separator
  ctx.strokeStyle = isHovered ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(36, 70)
  ctx.lineTo(width - 36, 70)
  ctx.stroke()

  // 5. Title
  ctx.fillStyle = isHovered ? '#ffffff' : '#f1f5f9'
  ctx.font = '700 28px -apple-system, BlinkMacSystemFont, "Inter", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(project.title, 36, 120)

  // 6. Subtitle / Description
  ctx.fillStyle = isHovered ? '#cbd5e1' : '#94a3b8'
  ctx.font = '400 15px -apple-system, BlinkMacSystemFont, "Inter", sans-serif'
  const desc = project.subtitle || ''
  ctx.fillText(desc.length > 48 ? desc.slice(0, 46) + '...' : desc, 36, 160)

  // 7. Tech Stack Chips
  ctx.fillStyle = isHovered ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.06)'
  ctx.fillRect(36, 195, width - 72, 38)
  ctx.strokeStyle = isHovered ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.1)'
  ctx.strokeRect(36, 195, width - 72, 38)

  ctx.fillStyle = isHovered ? '#38bdf8' : '#cbd5e1'
  ctx.font = '500 12px ui-monospace, SFMono-Regular, monospace'
  ctx.fillText(project.tech, 48, 219)

  // 8. Footer Action
  const footerY = height - 42
  ctx.fillStyle = isHovered ? '#38bdf8' : '#a1a1aa'
  ctx.font = '600 12px ui-monospace, SFMono-Regular, monospace'
  ctx.textAlign = 'left'
  ctx.fillText('STATUS: ONLINE', 36, footerY)

  ctx.textAlign = 'right'
  ctx.fillStyle = isHovered ? '#ffffff' : '#e2e8f0'
  ctx.fillText(isHovered ? 'VIEW PROJECT →' : 'INSPECT →', width - 36, footerY)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true

  return texture
}

/**
 * Creates high-DPI canvas texture for an engineering domain label plane.
 */
export function createDomainBadgeTexture(
  label: string,
  code: string,
  isHovered: boolean
): THREE.CanvasTexture {
  const width = 280
  const height = 90
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.fillStyle = isHovered ? 'rgba(15, 23, 42, 0.95)' : 'rgba(8, 12, 18, 0.88)'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = isHovered ? 'rgba(56, 189, 248, 0.7)' : 'rgba(255, 255, 255, 0.15)'
  ctx.lineWidth = isHovered ? 2 : 1
  ctx.strokeRect(6, 6, width - 12, height - 12)

  ctx.font = '600 11px ui-monospace, monospace'
  ctx.fillStyle = isHovered ? '#38bdf8' : '#64748b'
  ctx.textAlign = 'left'
  ctx.fillText(`SYS // ${code}`, 18, 28)

  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Inter", sans-serif'
  ctx.fillStyle = isHovered ? '#ffffff' : '#f1f5f9'
  ctx.fillText(label, 18, 58)

  ctx.font = '500 10px ui-monospace, monospace'
  ctx.fillStyle = isHovered ? '#38bdf8' : '#71717a'
  ctx.textAlign = 'right'
  ctx.fillText('ACTIVE ●', width - 18, 58)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true

  return texture
}


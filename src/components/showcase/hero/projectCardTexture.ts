import * as THREE from 'three'
import type { HeroProjectItem } from './heroTypes'

export type CardVisualState = 'default' | 'hover' | 'active'

/**
 * Creates high-DPI canvas texture for a floating miniature 3D project preview card
 * formatted in the SpaceX Mission Control / aerospace telemetry HUD aesthetic.
 */
export function createProjectCardTexture(
  project: HeroProjectItem,
  state: CardVisualState = 'default',
  index: number = 0
): THREE.CanvasTexture {
  const width = 512
  const height = 300
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  const isHover = state === 'hover'
  const isActive = state === 'active'

  // 1. Deep Space Charcoal / Obsidian Surface (Integrated with Space)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  if (isActive) {
    bgGrad.addColorStop(0, '#0a121f')
    bgGrad.addColorStop(1, '#050a12')
  } else if (isHover) {
    bgGrad.addColorStop(0, '#080d16')
    bgGrad.addColorStop(1, '#04070c')
  } else {
    bgGrad.addColorStop(0, '#06090e')
    bgGrad.addColorStop(1, '#030508')
  }
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 2. Subtle Precision Telemetry Grid (Restrained aerospace HUD)
  ctx.strokeStyle = (isHover || isActive)
    ? 'rgba(56, 189, 248, 0.05)'
    : 'rgba(255, 255, 255, 0.02)'
  ctx.lineWidth = 1
  const gridSize = 32
  for (let x = gridSize; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = gridSize; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 3. Ultra-thin, Low-opacity Neutral Border
  const pad = 10
  const cardW = width - pad * 2
  const cardH = height - pad * 2

  ctx.strokeStyle = isActive
    ? 'rgba(56, 189, 248, 0.55)'
    : isHover
      ? 'rgba(56, 189, 248, 0.35)'
      : 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.strokeRect(pad, pad, cardW, cardH)

  // 4. Subtle Corner Alignment Reticles (Small precision marks, length 8px)
  const retLen = 8
  ctx.strokeStyle = (isHover || isActive)
    ? '#38bdf8'
    : 'rgba(255, 255, 255, 0.22)'
  ctx.lineWidth = (isHover || isActive) ? 1.5 : 1

  // TL
  ctx.beginPath(); ctx.moveTo(pad, pad + retLen); ctx.lineTo(pad, pad); ctx.lineTo(pad + retLen, pad); ctx.stroke()
  // TR
  ctx.beginPath(); ctx.moveTo(pad + cardW - retLen, pad); ctx.lineTo(pad + cardW, pad); ctx.lineTo(pad + cardW, pad + retLen); ctx.stroke()
  // BL
  ctx.beginPath(); ctx.moveTo(pad, pad + cardH - retLen); ctx.lineTo(pad, pad + cardH); ctx.lineTo(pad + retLen, pad + cardH); ctx.stroke()
  // BR
  ctx.beginPath(); ctx.moveTo(pad + cardW - retLen, pad + cardH); ctx.lineTo(pad + cardW, pad + cardH); ctx.lineTo(pad + cardW, pad + cardH - retLen); ctx.stroke()

  // 5. Header Metadata Telemetry (Unified hierarchy: SYS // CODE)
  const leftX = pad + 20
  const rightX = pad + cardW - 20
  const headerY = pad + 28

  ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.textAlign = 'left'

  // Small status dot
  ctx.fillStyle = (isHover || isActive) ? '#38bdf8' : 'rgba(56, 189, 248, 0.6)'
  ctx.beginPath()
  ctx.arc(leftX, headerY - 3.5, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Label: SYS // PRJ 01
  ctx.fillStyle = (isHover || isActive) ? '#38bdf8' : '#64748b'
  ctx.fillText(`SYS // PRJ 0${index + 1}`, leftX + 10, headerY)

  // Right telemetry status: ACTIVE · 01
  ctx.textAlign = 'right'
  ctx.fillStyle = (isHover || isActive) ? '#94a3b8' : '#475569'
  ctx.font = '500 10.5px ui-monospace, SFMono-Regular, monospace'
  ctx.fillText(isActive ? 'SELECTED · 01' : (isHover ? 'INSPECT · 01' : 'ACTIVE · 01'), rightX, headerY)

  // Separator hairline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(leftX, headerY + 12)
  ctx.lineTo(rightX, headerY + 12)
  ctx.stroke()

  // 6. Primary Title (Consistent aerospace typography)
  const titleY = headerY + 46
  ctx.textAlign = 'left'
  ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Inter", sans-serif'
  ctx.fillStyle = (isHover || isActive) ? '#ffffff' : '#f1f5f9'
  ctx.fillText(project.title, leftX, titleY)

  // 7. Subtitle / Description (Clean line height, subtle text)
  const descY = titleY + 28
  ctx.font = '400 12.5px -apple-system, BlinkMacSystemFont, "Inter", sans-serif'
  ctx.fillStyle = (isHover || isActive) ? '#cbd5e1' : '#94a3b8'
  const desc = project.subtitle || ''
  const maxLen = 54
  const formattedDesc = desc.length > maxLen ? desc.slice(0, maxLen - 2) + '...' : desc
  ctx.fillText(formattedDesc, leftX, descY)

  // 8. Tech Stack Specification Chips (Restrained)
  const techY = descY + 26
  const techTokens = project.tech.split('·').map(t => t.trim()).slice(0, 3)
  let curX = leftX
  ctx.font = '500 10px ui-monospace, SFMono-Regular, monospace'
  techTokens.forEach(token => {
    const textWidth = ctx.measureText(token).width
    const chipW = textWidth + 14
    const chipH = 20

    ctx.fillStyle = (isHover || isActive)
      ? 'rgba(56, 189, 248, 0.08)'
      : 'rgba(255, 255, 255, 0.03)'
    ctx.fillRect(curX, techY, chipW, chipH)

    ctx.strokeStyle = (isHover || isActive)
      ? 'rgba(56, 189, 248, 0.25)'
      : 'rgba(255, 255, 255, 0.06)'
    ctx.strokeRect(curX, techY, chipW, chipH)

    ctx.fillStyle = (isHover || isActive) ? '#38bdf8' : '#94a3b8'
    ctx.fillText(token, curX + 7, techY + 14)

    curX += chipW + 6
  })

  // 9. Footer Action Telemetry
  const footerY = pad + cardH - 18
  ctx.font = '500 10px ui-monospace, SFMono-Regular, monospace'
  ctx.textAlign = 'left'
  ctx.fillStyle = (isHover || isActive) ? '#38bdf8' : '#475569'
  ctx.fillText('ORBIT // LEO-400', leftX, footerY)

  ctx.textAlign = 'right'
  ctx.fillStyle = (isHover || isActive) ? '#ffffff' : '#64748b'
  ctx.fillText(isHover ? 'OPEN EXPERIENCE ↗' : 'VIEW NODE ↗', rightX, footerY)

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
  description: string,
  state: CardVisualState = 'default',
  index: number = 0
): THREE.CanvasTexture {
  const width = 320
  const height = 100
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const isHover = state === 'hover'
  const isActive = state === 'active'

  // Deep obsidian background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  if (isHover || isActive) {
    bgGrad.addColorStop(0, '#080d16')
    bgGrad.addColorStop(1, '#04070c')
  } else {
    bgGrad.addColorStop(0, '#05070c')
    bgGrad.addColorStop(1, '#020407')
  }
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // Micro grid
  ctx.strokeStyle = (isHover || isActive)
    ? 'rgba(56, 189, 248, 0.04)'
    : 'rgba(255, 255, 255, 0.015)'
  ctx.lineWidth = 1
  for (let x = 20; x < width; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = 20; y < height; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }

  // Border
  const pad = 6
  const cardW = width - pad * 2
  const cardH = height - pad * 2

  ctx.strokeStyle = (isHover || isActive)
    ? 'rgba(56, 189, 248, 0.35)'
    : 'rgba(255, 255, 255, 0.07)'
  ctx.lineWidth = 1
  ctx.strokeRect(pad, pad, cardW, cardH)

  // Corner marks
  const retLen = 6
  ctx.strokeStyle = (isHover || isActive) ? '#38bdf8' : 'rgba(255, 255, 255, 0.18)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(pad, pad + retLen); ctx.lineTo(pad, pad); ctx.lineTo(pad + retLen, pad); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(pad + cardW - retLen, pad); ctx.lineTo(pad + cardW, pad); ctx.lineTo(pad + cardW, pad + retLen); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(pad, pad + cardH - retLen); ctx.lineTo(pad, pad + cardH); ctx.lineTo(pad + retLen, pad + cardH); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(pad + cardW - retLen, pad + cardH); ctx.lineTo(pad + cardW, pad + cardH); ctx.lineTo(pad + cardW, pad + cardH - retLen); ctx.stroke()

  // 1. Header Metadata: SYS // CODE & ACTIVE · 01
  const leftX = pad + 14
  const rightX = pad + cardW - 14
  const headerY = pad + 20

  ctx.font = '600 9.5px ui-monospace, SFMono-Regular, monospace'
  ctx.textAlign = 'left'

  // Dot
  ctx.fillStyle = (isHover || isActive) ? '#38bdf8' : 'rgba(56, 189, 248, 0.5)'
  ctx.beginPath()
  ctx.arc(leftX, headerY - 3, 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = (isHover || isActive) ? '#38bdf8' : '#64748b'
  ctx.fillText(`SYS // ${code}`, leftX + 8, headerY)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#475569'
  ctx.fillText(`ACTIVE · 0${index + 1}`, rightX, headerY)

  // 2. Title
  const titleY = headerY + 24
  ctx.textAlign = 'left'
  ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Inter", sans-serif'
  ctx.fillStyle = (isHover || isActive) ? '#ffffff' : '#f1f5f9'
  ctx.fillText(label, leftX, titleY)

  // 3. Subtitle / Description
  const descY = titleY + 18
  ctx.font = '400 10.5px -apple-system, BlinkMacSystemFont, "Inter", sans-serif'
  ctx.fillStyle = (isHover || isActive) ? '#cbd5e1' : '#64748b'
  const maxDesc = 44
  const shortDesc = description.length > maxDesc ? description.slice(0, maxDesc - 2) + '...' : description
  ctx.fillText(shortDesc, leftX, descY)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true

  return texture
}

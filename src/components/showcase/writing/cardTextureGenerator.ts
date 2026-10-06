import * as THREE from 'three'
import type { KnowledgeArticle } from './knowledgeTypes'

/**
 * Generates an ultra-crisp document slab texture for a 3D knowledge node.
 */
export function createCardTexture(
  article: KnowledgeArticle,
  index: number,
  isSelected: boolean
): THREE.CanvasTexture {
  const width = 512
  const height = 660
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const fallbackTexture = new THREE.CanvasTexture(canvas)
    return fallbackTexture
  }

  // 1. Base Graphite Slab Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  if (isSelected) {
    bgGrad.addColorStop(0, '#151921')
    bgGrad.addColorStop(0.5, '#0f1217')
    bgGrad.addColorStop(1, '#0a0c10')
  } else {
    bgGrad.addColorStop(0, '#11141a')
    bgGrad.addColorStop(0.5, '#0b0d11')
    bgGrad.addColorStop(1, '#07090c')
  }
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 2. Subtle Technical Grid / Watermark Texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)'
  ctx.lineWidth = 1
  for (let x = 32; x < width; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 32; y < height; y += 64) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 3. Document Slab Border & Corner Brackets
  ctx.strokeStyle = isSelected ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = isSelected ? 2 : 1
  ctx.strokeRect(16, 16, width - 32, height - 32)

  if (isSelected) {
    // Subtle inner corner brackets for architectural feel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.lineWidth = 2
    const bLen = 14
    // Top-left
    ctx.beginPath(); ctx.moveTo(16, 16 + bLen); ctx.lineTo(16, 16); ctx.lineTo(16 + bLen, 16); ctx.stroke()
    // Top-right
    ctx.beginPath(); ctx.moveTo(width - 16 - bLen, 16); ctx.lineTo(width - 16, 16); ctx.lineTo(width - 16, 16 + bLen); ctx.stroke()
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(16, height - 16 - bLen); ctx.lineTo(16, height - 16); ctx.lineTo(16 + bLen, height - 16); ctx.stroke()
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(width - 16 - bLen, height - 16); ctx.lineTo(width - 16, height - 16); ctx.lineTo(width - 16, height - 16 - bLen); ctx.stroke()
  }

  // 4. Header Section: Document Code + Category Badge
  ctx.font = '600 13px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.fillStyle = isSelected ? '#a1a1aa' : '#71717a'
  ctx.textAlign = 'left'
  ctx.fillText(`DOC // ${String(index + 1).padStart(2, '0')}`, 36, 52)

  // Category Tag Badge
  ctx.textAlign = 'right'
  ctx.fillStyle = isSelected ? '#e2e8f0' : '#94a3b8'
  ctx.fillText(`[ ${article.category.toUpperCase()} ]`, width - 36, 52)

  // Separator Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(36, 72)
  ctx.lineTo(width - 36, 72)
  ctx.stroke()

  // 5. Title (Clean, High-Readability Editorial Hierarchy)
  ctx.fillStyle = isSelected ? '#ffffff' : '#f1f5f9'
  ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif'
  ctx.textAlign = 'left'

  const maxTitleWidth = width - 72
  const words = article.title.split(' ')
  let line = ''
  let y = 120
  const lineHeight = 38
  const maxLines = 4
  let lineCount = 0

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxTitleWidth && n > 0) {
      ctx.fillText(line.trim(), 36, y)
      line = words[n] + ' '
      y += lineHeight
      lineCount++
      if (lineCount >= maxLines - 1 && n < words.length - 1) {
        // Append ellipsis
        let rest = line
        while (n + 1 < words.length) {
          n++
          rest += words[n] + ' '
        }
        while (ctx.measureText(rest + '...').width > maxTitleWidth && rest.length > 0) {
          rest = rest.slice(0, -1)
        }
        line = rest.trim() + '...'
        break
      }
    } else {
      line = testLine
    }
  }
  ctx.fillText(line.trim(), 36, y)

  // 6. Article Excerpt (Editorial Body)
  y += 36
  ctx.fillStyle = isSelected ? '#a1a1aa' : '#71717a'
  ctx.font = '400 15px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif'
  const excerptWords = (article.excerpt || '').split(' ')
  let excerptLine = ''
  const excerptLineHeight = 24
  let excerptCount = 0
  const maxExcerptLines = 3

  for (let n = 0; n < excerptWords.length; n++) {
    const testLine = excerptLine + excerptWords[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxTitleWidth && n > 0) {
      ctx.fillText(excerptLine.trim(), 36, y)
      excerptLine = excerptWords[n] + ' '
      y += excerptLineHeight
      excerptCount++
      if (excerptCount >= maxExcerptLines) break
    } else {
      excerptLine = testLine
    }
  }
  if (excerptCount < maxExcerptLines && excerptLine) {
    ctx.fillText(excerptLine.trim(), 36, y)
  }

  // 7. Footer Divider & Micro Metadata
  const footerY = height - 52
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(36, footerY - 18)
  ctx.lineTo(width - 36, footerY - 18)
  ctx.stroke()

  ctx.font = '500 12.5px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.fillStyle = isSelected ? '#cbd5e1' : '#64748b'
  ctx.textAlign = 'left'
  ctx.fillText(article.date || article.year, 36, footerY)

  ctx.textAlign = 'right'
  ctx.fillStyle = isSelected ? '#ffffff' : '#71717a'
  ctx.fillText(isSelected ? 'ACTIVE FOCUS ↗' : 'DISPATCH ↗', width - 36, footerY)

  // Create & configure Three.js CanvasTexture
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true

  return texture
}

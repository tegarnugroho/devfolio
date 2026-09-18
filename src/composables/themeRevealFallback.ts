// Keep an inert copy of the previous theme while the live page changes underneath.
export function themeRevealFallback(x: number, y: number, radius: number) {
  const snapshot = document.createElement('div')
  const oldBody = document.body.cloneNode(true) as HTMLElement
  const styles = getComputedStyle(document.documentElement)
  for (const property of styles) {
    if (property.startsWith('--')) snapshot.style.setProperty(property, styles.getPropertyValue(property))
  }
  snapshot.className = document.documentElement.classList.contains('dark') ? 'dark' : ''
  snapshot.setAttribute('aria-hidden', 'true')
  snapshot.inert = true
  snapshot.style.cssText += ';position:fixed;inset:0;z-index:2147483646;pointer-events:none;overflow:hidden;'
  snapshot.style.backgroundColor = getComputedStyle(document.body).backgroundColor
  oldBody.style.cssText += `;position:absolute;top:${-window.scrollY}px;left:${-window.scrollX}px;width:${document.body.clientWidth}px;margin:0;`
  const originals = [document.body, ...document.body.querySelectorAll<HTMLElement>('*')]
  const copies = [oldBody, ...oldBody.querySelectorAll<HTMLElement>('*')]
  originals.forEach((original, index) => {
    const copy = copies[index]
    copy.removeAttribute('id')
    copy.removeAttribute('data-blueprint')
    const computed = getComputedStyle(original)
    if (computed.position === 'fixed') {
      const rect = original.getBoundingClientRect()
      Object.assign(copy.style, {
        position: 'absolute', top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`, right: 'auto', bottom: 'auto',
        width: `${rect.width}px`, height: `${rect.height}px`,
      })
    }
  })
  oldBody.querySelectorAll('script, .theme-sky').forEach(element => {
    // Leave the live toggle visible so its sun/moon animation stays continuous.
    if (element.matches('.theme-sky')) (element as HTMLElement).style.visibility = 'hidden'
    else element.remove()
  })
  // Isolate the old theme from the live html.dark selector in either direction.
  const shadow = snapshot.attachShadow({ mode: 'open' })
  const stylesheet = document.createElement('style')
  stylesheet.textContent = Array.from(document.styleSheets).map(sheet => {
    try { return Array.from(sheet.cssRules, rule => rule.cssText).join('\n') }
    catch { return '' }
  }).join('\n')
  const oldRoot = document.createElement('html')
  oldRoot.className = snapshot.className
  oldRoot.append(oldBody)
  shadow.append(stylesheet, oldRoot)
  document.body.append(snapshot)
  const width = window.innerWidth, height = window.innerHeight
  const boundary = (size: number) => {
    const points = Array.from({ length: 64 }, (_, index) => {
      const angle = -index / 64 * Math.PI * 2
      return `${x + Math.cos(angle) * size}px ${y + Math.sin(angle) * size}px`
    })
    return `polygon(evenodd, 0px 0px, ${width}px 0px, ${width}px ${height}px, 0px ${height}px, 0px 0px, ${points.join(', ')}, ${points[0]})`
  }
  snapshot.style.clipPath = boundary(26)
  let animation: Animation | undefined
  return {
    async reveal() {
      animation = snapshot.animate([{ clipPath: boundary(26) }, { clipPath: boundary(radius + 4) }], {
        duration: 740, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards',
      })
      try { await animation.finished } finally { snapshot.remove() }
    },
    cancel() { animation?.cancel(); snapshot.remove() },
  }
}

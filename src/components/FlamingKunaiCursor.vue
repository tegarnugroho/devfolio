<template>
  <teleport to="body">
    <div ref="cursor" class="flaming-kunai-cursor" aria-hidden="true">
      <img
        :src="cursorSrc"
        alt=""
        width="32"
        height="32"
        class="kunai-cursor-img"
        draggable="false"
        @error="onImgError"
      />
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    active?: boolean
    target: HTMLElement | null
  }>(),
  {
    active: true,
  }
)

const cursor = ref<HTMLElement | null>(null)
const cursorSrc = ref('/assets/cursors/madara-kunai-anim.webp')

function onImgError() {
  cursorSrc.value = 'https://cdn.cursors-4u.net/previews/sizenwse-72fe4e9c-preview-32.webp'
}

onMounted(() => {
  // Preload animated cursor image
  const img = new Image()
  img.src = cursorSrc.value
})

watch(() => props.target, (target, _, cleanup) => {
  if (!target) return
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let bounds: DOMRect | null = null
  let inside = false
  let x = 0, y = 0, frame = 0

  function render() {
    frame = 0
    const visible = inside && props.active && finePointer.matches && !reducedMotion.matches
    target!.classList.toggle('flame-cursor-active', visible)
    if (cursor.value) {
      cursor.value.style.display = visible ? 'block' : 'none'
      // 16 15 hotspot for standard 32px cursor
      cursor.value.style.transform = `translate3d(${x - 16}px, ${y - 15}px, 0)`
    }
  }

  function move(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    x = event.clientX
    y = event.clientY
    inside = !!bounds && x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom
    if (!frame) frame = requestAnimationFrame(render)
  }

  function enter(event: PointerEvent) {
    bounds = target!.getBoundingClientRect()
    move(event)
  }

  function hide() {
    inside = false
    cancelAnimationFrame(frame)
    render()
  }

  const stop = watch(() => props.active, render, { flush: 'post' })
  target.addEventListener('pointerenter', enter)
  target.addEventListener('pointermove', move)
  target.addEventListener('pointerleave', hide)
  window.addEventListener('scroll', hide, true)
  window.addEventListener('resize', hide)
  window.addEventListener('blur', hide)
  finePointer.addEventListener('change', hide)
  reducedMotion.addEventListener('change', hide)

  cleanup(() => {
    stop()
    hide()
    target.classList.remove('flame-cursor-active')
    target.removeEventListener('pointerenter', enter)
    target.removeEventListener('pointermove', move)
    target.removeEventListener('pointerleave', hide)
    window.removeEventListener('scroll', hide, true)
    window.removeEventListener('resize', hide)
    window.removeEventListener('blur', hide)
    finePointer.removeEventListener('change', hide)
    reducedMotion.removeEventListener('change', hide)
  })
}, { flush: 'post' })
</script>

<style scoped>
.flaming-kunai-cursor {
  position: fixed;
  top: 0;
  left: 0;
  display: none;
  width: 32px;
  height: 32px;
  z-index: 150;
  pointer-events: none;
  will-change: transform;
}

.kunai-cursor-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

@media (prefers-reduced-motion: reduce), (hover: none), (pointer: coarse) {
  .flaming-kunai-cursor {
    display: none !important;
  }
}
</style>

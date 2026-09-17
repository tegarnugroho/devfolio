<template>
  <teleport to="body">
    <div ref="cursor" class="flaming-kunai-cursor" aria-hidden="true">
      <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
        <g class="kunai-fire outer-fire"><path d="M11 3c6 1 8 5 8 9 3-2 3-5 2-8 8 6 11 14 5 20-4 3-9 1-13-2 5-1 5-5 3-8-1 3-3 4-5 4 3-5 2-11 0-15Z" fill="#168fae" /></g>
        <g class="kunai-fire inner-fire"><path d="M17 8c4 3 3 6 2 8 4-1 4-4 4-5 5 7 2 12-3 13 2-4 0-6-2-7 1-3 1-5-1-9Z" fill="#70e4ff" /><path d="M22 15c3 4 2 7-1 8 1-4 0-5-1-6Z" fill="#e4fcff" /></g>
        <g class="kunai-spark spark-one"><path d="m25 9 1-3 1 3-1 2Z" fill="#8aeeff" /></g>
        <g class="kunai-spark spark-two"><path d="m11 22 1-3 1 3-1 2Z" fill="#ffc26c" /></g>
        <g class="kunai-spark spark-three"><circle cx="28" cy="19" r=".8" fill="#baf5ff" /></g>
        <path d="m4 2 11 4 5 10-5 4-9-7Z" fill="#20272d" stroke="#eef5f7" stroke-width="1.2" stroke-linejoin="round" />
        <path d="m4 2 11 13 5 1-5-10Z" fill="#a4bdc6" />
        <path d="m17 18 7 7" stroke="#101315" stroke-width="5" /><path d="m17 18 7 7" stroke="#d0e0e6" stroke-width="2.5" /><path d="m19 19 2-2m0 4 2-2" stroke="#26343d" stroke-width="1.2" />
        <circle cx="27" cy="28" r="2.7" fill="#111315" stroke="#e7f4f7" stroke-width="1.2" />
      </svg>
    </div>
  </teleport>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ active: boolean; target: HTMLElement | null }>()
const cursor = ref<HTMLElement | null>(null)
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
      cursor.value.style.transform = `translate3d(${x - 5.5}px, ${y - 2.75}px, 0)`
    }
  }
  function move(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    x = event.clientX; y = event.clientY
    inside = !!bounds && x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom
    if (!frame) frame = requestAnimationFrame(render)
  }
  function enter(event: PointerEvent) { bounds = target!.getBoundingClientRect(); move(event) }
  function hide() { inside = false; cancelAnimationFrame(frame); render() }
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
    stop(); hide(); target.classList.remove('flame-cursor-active')
    target.removeEventListener('pointerenter', enter); target.removeEventListener('pointermove', move); target.removeEventListener('pointerleave', hide)
    window.removeEventListener('scroll', hide, true); window.removeEventListener('resize', hide); window.removeEventListener('blur', hide)
    finePointer.removeEventListener('change', hide); reducedMotion.removeEventListener('change', hide)
  })
}, { flush: 'post' })
</script>
<style scoped>
.flaming-kunai-cursor { position: fixed; top: 0; left: 0; display: none; width: 44px; height: 44px; z-index: 150; pointer-events: none; }
.flaming-kunai-cursor svg { overflow: visible; }
.kunai-fire { transform-box: fill-box; transform-origin: bottom center; }
.outer-fire { animation: flame-wave 650ms ease-in-out infinite alternate; }
.inner-fire { animation: flame-wave 430ms ease-in-out -200ms infinite alternate-reverse; }
.kunai-spark { animation: ember-rise 1100ms ease-out infinite; }
.spark-two { animation-delay: -400ms; }
.spark-three { animation-delay: -800ms; }
@keyframes flame-wave { from { transform: skewX(-6deg) scale(.92, .9); opacity: .75; } to { transform: skewX(7deg) scale(1.05, 1.12); opacity: 1; } }
@keyframes ember-rise { 0% { transform: translate(0,3px); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(3px,-8px); opacity: 0; } }
@media (prefers-reduced-motion: reduce), (hover: none), (pointer: coarse) { .flaming-kunai-cursor { display: none !important; } .kunai-fire, .kunai-spark { animation: none; } }
</style>

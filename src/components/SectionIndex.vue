<template>
  <nav class="hero-markers" aria-label="Section shortcuts">
    <a v-for="(section, index) in sections" :key="section.id" :href="`#${section.id}`"
      :aria-label="section.label" :aria-current="active === section.id ? 'location' : undefined">
      {{ String(index + 1).padStart(2, '0') }}
      <span aria-hidden="true"></span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]
const active = ref('hero')
let elements: HTMLElement[] = []
let frame = 0

function updateActive() {
  frame = 0
  const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
  active.value = atBottom ? 'contact' : [...elements].reverse().find(section => section.getBoundingClientRect().top <= window.innerHeight * 0.4)?.id ?? 'hero'
}
function scheduleUpdate() {
  if (!frame) frame = window.requestAnimationFrame(updateActive)
}
onMounted(() => {
  elements = sections.map(section => document.getElementById(section.id)).filter((element): element is HTMLElement => element !== null)
  updateActive()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
})
onBeforeUnmount(() => {
  window.cancelAnimationFrame(frame)
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
})
</script>

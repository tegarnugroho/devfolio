<template>
  <div>
    <Navbar />
    <main class="max-w-5xl mx-auto px-4">
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <WritingSection />
      <ContactSection />
    </main>
    <SectionIndex />
    <ScrollNavigator />
    <BlueprintOverlay />
    <footer data-blueprint="FOOTER" class="portfolio-footer max-w-5xl mx-auto px-4">
      <p>&copy; {{ year }} {{ portfolioContent.footer.owner }}</p>
      <p class="footer-clue">{{ portfolioContent.footer.clue }}</p>
    </footer>
  </div>
  
</template>

<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'
import BlueprintOverlay from './components/BlueprintOverlay.vue'
import Navbar from './components/Navbar.vue'
import HeroSection from './sections/HeroSection.vue'
import AboutSection from './sections/AboutSection.vue'
import SkillsSection from './sections/SkillsSection.vue'
import WritingSection from './sections/WritingSection.vue'
import ProjectsSection from './sections/ProjectsSection.vue'
import ContactSection from './sections/ContactSection.vue'
import { useScrollHash } from '@/composables/useScrollHash'
import ScrollNavigator from './components/ScrollNavigator.vue'
import SectionIndex from './components/SectionIndex.vue'

useScrollHash('main section[id]')
const year = new Date().getFullYear()
</script>

<style scoped>
.portfolio-footer { border-top: 1px solid var(--border); padding-block: 22px; color: var(--secondary); font-family: ui-monospace,monospace; font-size: 11px; }
@media (max-width: 639px) { .portfolio-footer { padding-bottom: calc(24px + env(safe-area-inset-bottom)); } .portfolio-footer p { padding-right: 48px; } }
.footer-clue { margin-top: 6px; font-size: 9px; opacity: .4; transition: opacity 200ms; }
.footer-clue:hover { opacity: .65; }
</style>


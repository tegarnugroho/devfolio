<template>
  <div class="portfolio-shell" :class="{ 'portfolio-dimmed': isShowcaseOpen }">
    <Navbar />
    <main class="max-w-5xl mx-auto px-4">
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <GlobeSection />
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

  <ProjectShowcaseOverlay />
</template>

<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'
import BlueprintOverlay from './components/BlueprintOverlay.vue'
import Navbar from './components/Navbar.vue'
import HeroSection from './sections/HeroSection.vue'
import AboutSection from './sections/AboutSection.vue'
import SkillsSection from './sections/SkillsSection.vue'
import GlobeSection from './sections/GlobeSection.vue'
import WritingSection from './sections/WritingSection.vue'
import ProjectsSection from './sections/ProjectsSection.vue'
import ContactSection from './sections/ContactSection.vue'
import ProjectShowcaseOverlay from './components/globe/ProjectShowcaseOverlay.vue'
import { isShowcaseOpen } from '@/composables/useShowcase'
import { useLocaleRouting } from '@/composables/useTranslation'
import { useSectionNavigation } from '@/composables/useSectionNavigation'
import { useScrollHash } from '@/composables/useScrollHash'
import ScrollNavigator from './components/ScrollNavigator.vue'
import SectionIndex from './components/SectionIndex.vue'

useLocaleRouting()
useSectionNavigation()
useScrollHash('main section[id]')
const year = new Date().getFullYear()
</script>

<style scoped>
/* Clip viewport-wide decoration without creating another scroll container. */
.portfolio-shell {
  overflow-x: clip;
  transition: opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.portfolio-shell.portfolio-dimmed {
  opacity: 0;
  transform: scale(0.98);
  pointer-events: none;
  user-select: none;
}

.portfolio-footer {
  border-top: 1px solid var(--border);
  padding-block: 22px;
  color: var(--secondary);
  font-family: ui-monospace, monospace;
  font-size: 11px;
}

@media (max-width: 639px) {
  .portfolio-footer {
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }
  .portfolio-footer p {
    padding-right: 48px;
  }
}

.footer-clue {
  margin-top: 6px;
  font-size: 9px;
  opacity: 0.4;
  transition: opacity 200ms;
}

.footer-clue:hover {
  opacity: 0.65;
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-shell {
    transition: opacity 200ms ease !important;
    transform: none !important;
  }
}
</style>

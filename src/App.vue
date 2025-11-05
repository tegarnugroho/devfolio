<template>
  <div>
    <Navbar />
    <main class="max-w-5xl mx-auto px-4">
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
    </main>
    <footer class="max-w-5xl mx-auto px-4 py-8 text-sm opacity-60">
      <p>&copy; {{ year }} Tegar.</p>
    </footer>
  </div>
  
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import HeroSection from './sections/HeroSection.vue'
import AboutSection from './sections/AboutSection.vue'
import SkillsSection from './sections/SkillsSection.vue'
import ProjectsSection from './sections/ProjectsSection.vue'
import ContactSection from './sections/ContactSection.vue'

const year = new Date().getFullYear()
</script>

<style scoped>
</style>


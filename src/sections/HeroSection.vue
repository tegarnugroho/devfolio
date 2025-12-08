<template>
  <section id="hero" class="relative min-h-[calc(100vh-130px)] flex items-center">
    <div class="absolute inset-0 -z-10 pointer-events-none">
      <div class="absolute inset-0 opacity-[0.10] dark:opacity-[0.12] bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.6),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.6),_transparent_55%)]" />
      <div class="absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:28px_28px] animate-grid-pan" />
    </div>
    <div class="w-full">
      <h1 v-reveal class="text-5xl sm:text-7xl font-extrabold leading-[1.05] tracking-tight">
        <span class="letter" style="animation-delay: 0s">T</span>
        <span class="letter" style="animation-delay: 0.1s">e</span>
        <span class="letter" style="animation-delay: 0.2s">g</span>
        <span class="letter" style="animation-delay: 0.3s">a</span>
        <span class="letter" style="animation-delay: 0.4s">r</span>
        <span class="letter" style="animation-delay: 0.5s">.</span>
        <span class="block text-base sm:text-lg font-normal mt-3 opacity-70">Flutter Developer</span>
      </h1>
      <p v-reveal="{delay: 120}" class="mt-5 text-lg sm:text-xl max-w-2xl opacity-85">
        I build reliable cross-platform experiences focused on performance, intuitive UI, and maintainable architecture.
      </p>
      <div v-reveal="{delay: 220}" class="mt-8 flex gap-3">
        <a href="#projects" class="btn btn-ghost">
          <span>View Projects</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform group-hover:translate-x-0.5">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <a href="#contact" class="btn btn-solid">
          <span>Contact</span>
        </a>
      </div>
      
    </div>

    
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.letter {
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out forwards;
  display: inline-block;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>

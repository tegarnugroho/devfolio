<template>
  <section id="about" class="mt-10 sm:mt-12 md:mt-14 scroll-mt-12 sm:scroll-mt-16 md:scroll-mt-16 pt-24 md:pt-28 pb-20 border-t border-black/10 dark:border-white/10">
    <h2 v-reveal class="text-2xl font-semibold tracking-tight">About</h2>

    <div class="mt-8 grid gap-6 sm:grid-cols-[220px_1fr] sm:items-start">
      <div class="flex flex-col items-center sm:items-start">
        <div v-reveal="{ delay: 80 }" class="avatar-container rounded-2xl border border-black/10 dark:border-white/10 p-1 relative">
          <div class="rounded-xl overflow-hidden relative">
            <img
              class="normal-img transition-opacity duration-300 w-36 h-36 sm:w-48 sm:h-48 object-cover select-none"
              src="/assets/user.png"
              alt="Tegar Nugroho"
              decoding="async"
              loading="lazy"
              draggable="false"
              @dragstart.prevent
              @contextmenu.prevent
              style="-webkit-user-drag: none; user-drag: none;"
            />
            <img
              class="hover-img absolute inset-0 transition-all duration-300 opacity-0 w-36 h-36 sm:w-48 sm:h-48 object-cover select-none"
              src="/assets/user-cute.png"
              alt="Tegar Nugroho Hover"
              decoding="async"
              loading="lazy"
              draggable="false"
              @dragstart.prevent
              @contextmenu.prevent
              style="-webkit-user-drag: none; user-drag: none;"
            />
            <span class="absolute inset-0" @contextmenu.prevent @dragstart.prevent aria-hidden="true"></span>
          </div>
        </div>
        <div class="badge mt-3 relative inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1.5 text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="opacity-80">
            <path d="M3 8h18M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2m-7 5h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span class="normal-text font-medium">Flutter Developer</span>
          <span class="normal-text opacity-60">•</span>
          <span class="normal-text">Wolkk</span>
          <span class="hover-text absolute inset-0 flex items-center justify-center font-medium">Started in 2023</span>
        </div>
      </div>

      <div v-reveal="{ delay: 120 }">
        <h3 class="text-lg font-semibold tracking-tight">Hi, I’m Tegar Nugroho</h3>

        <p class="mt-4 leading-relaxed opacity-85">
          I’m a Flutter developer focused on building accessible, high‑performance applications.
        </p>
        <p class="mt-3 leading-relaxed opacity-85">
          I favor clean architecture and maintainable code so every product feels smooth, consistent, and easy to evolve.
        </p>
        <p class="mt-3 leading-relaxed opacity-85">
          I’ve shipped mobile, web, and desktop projects with a strong emphasis on performance, consistency, and scalability.
        </p>
        <p class="mt-3 leading-relaxed opacity-85">
          At Wolkk (remote), I build cross‑platform solutions that combine clear design with robust engineering.
        </p>
      </div>
    </div>
  </section>
  
</template>

<script setup lang="ts">
// No script needed
</script>

<style scoped>
.badge {
  min-width: 140px;
}

.normal-text {
  transition: opacity 0.3s;
}

.hover-text {
  opacity: 0;
  transition: opacity 0.3s;
}

.badge:hover .normal-text {
  opacity: 0;
}

.badge:hover .hover-text {
  opacity: 1;
}

.avatar-container:hover .normal-img {
  opacity: 0;
}

.avatar-container:hover .hover-img {
  opacity: 1;
  transform: scale(1.05);
  filter: brightness(1.1);
}
</style>

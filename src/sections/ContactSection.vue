<template>
  <section id="contact" class="py-20 border-t border-black/10 dark:border-white/10">
    <h2 v-reveal class="text-2xl font-semibold tracking-tight">Contact</h2>
    <div class="mt-6 space-y-3">
      <a v-reveal href="mailto:you@example.com" class="inline-flex items-center gap-2 hover:opacity-85">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 5h18v14H3z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>you@example.com</span>
      </a>
      <a v-reveal="{delay: 80}" href="#" class="inline-flex items-center gap-2 hover:opacity-85">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M7 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>linkedin.com/in/yourname</span>
      </a>
      <a v-reveal="{delay: 160}" href="#" class="inline-flex items-center gap-2 hover:opacity-85">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M9 19c-7 2 1-11 6-14l1 1c-4 5-10 12-7 13z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>github.com/yourname</span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
</style>

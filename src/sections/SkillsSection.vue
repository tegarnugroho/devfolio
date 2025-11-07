<template>
  <section id="skills" class="scroll-mt-12 sm:scroll-mt-16 md:scroll-mt-16 pt-24 md:pt-28 pb-20 border-t border-black/10 dark:border-white/10">
    <div class="mb-8">
      <span v-reveal class="text-[11px] tracking-[0.18em] uppercase opacity-60">Skills</span>
      <h2 v-reveal="{ delay: 60 }" class="mt-1 text-2xl font-semibold tracking-tight">What I Use</h2>
      <p v-reveal="{ delay: 120 }" class="mt-3 opacity-75">Tools and technologies built for high-performance cross-platform apps with clean, sustainable architecture.</p>
    </div>
    <ul class="border-t border-black/10 dark:border-white/10 divide-y divide-black/10 dark:divide-white/10">
      <li
        v-for="(row, i) in matrix"
        :key="row.label"
        v-reveal="{ delay: i * 80 }"
        class="py-4 md:grid md:grid-cols-12 md:gap-6"
      >
        <div class="md:col-span-3 text-xs font-medium tracking-[0.18em] uppercase opacity-70 mb-2 md:mb-0">
          {{ row.label }}
        </div>
        <ul class="md:col-span-9 flex flex-wrap gap-2">
          <li v-for="name in row.items" :key="name" class="chip chip-m">{{ name }}</li>
        </ul>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface MatrixRow { label: string; items: string[] }

const matrix: MatrixRow[] = [
  {
    label: 'Languages & Platforms',
    items: ['Flutter', 'Dart', 'Android', 'iOS', 'Flutter Web', 'Flutter Desktop'],
  },
  {
    label: 'Frameworks & State',
    items: ['Riverpod', 'BLoC', 'Cubit', 'Clean Architecture', 'GetIt/Injectable'],
  },
  {
    label: 'Networking',
    items: ['Dio', 'HTTP', 'WebSocket'],
  },
  {
    label: 'Data & Storage',
    items: ['SQLite (sqflite)', 'Hive', 'Shared Preferences', 'Local Caching'],
  },
  {
    label: 'Tooling',
    items: ['Git', 'CI/CD', 'Android SDK', 'VS Code', 'Jira', 'Trello'],
  },
]
</script>

<style scoped>
/* keep your existing styles; .chip assumed available globally */
</style>

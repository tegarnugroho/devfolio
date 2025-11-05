<template>
  <section id="skills" class="py-20 border-t border-black/10 dark:border-white/10">
    <div class="grid gap-8 lg:grid-cols-3">
      <div>
        <span v-reveal class="text-[11px] tracking-[0.18em] uppercase opacity-60">Skills</span>
        <h2 v-reveal="{delay: 60}" class="mt-1 text-2xl font-semibold tracking-tight">What I Use</h2>
        <p v-reveal="{delay: 120}" class="mt-3 opacity-75">
          A tight, modern stack focused on clarity and performance.
        </p>
      </div>
      <div class="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(group, gi) in groups"
          :key="group.title"
          v-reveal="{delay: gi * 80}"
          class="relative"
        >
          <h3 class="text-sm font-medium tracking-wide uppercase opacity-70">{{ group.title }}</h3>
          <ul class="mt-3 flex flex-wrap gap-2">
            <li
              v-for="(name, i) in group.items"
              :key="name"
              class="chip"
              :style="{ transitionDelay: `${i * 15}ms` }"
            >
              {{ name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const groups = [
  {
    title: 'Flutter & Mobile',
    items: ['Flutter', 'Dart', 'Android', 'iOS', 'Flutter Web', 'Flutter Desktop'],
  },
  {
    title: 'Architecture & State',
    items: ['Clean Architecture', 'BLoC', 'Cubit', 'Riverpod', 'GetIt/Injectable', 'Freezed'],
  },
  {
    title: 'Networking & Realtime',
    items: ['Dio', 'HTTP', 'WebSocket', 'Interceptors', 'Logging'],
  },
  {
    title: 'Hardware & Integration',
    items: ['Bluetooth (Classic/LE)', 'HID Barcode Scanners', 'Platform Channels'],
  },
  {
    title: 'Data & Storage',
    items: ['SQLite (sqflite)', 'Hive', 'Shared Preferences', 'Local Caching'],
  },
  {
    title: 'Tooling & DevOps',
    items: ['Git', 'CI/CD', 'Android SDK', 'VS Code', 'Jira', 'Trello'],
  },
  {
    title: 'Testing',
    items: ['Flutter Test', 'bloc_test', 'Mockito'],
  },
]
</script>

<style scoped>
/* keep your existing styles; .chip assumed available globally */
</style>

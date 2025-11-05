<template>
  <section id="contact" class="py-20 border-t border-black/10 dark:border-white/10">
    <div class="grid gap-8 lg:grid-cols-3">
      <div>
        <span v-reveal class="text-[11px] tracking-[0.18em] uppercase opacity-60">Contact</span>
        <h2 v-reveal="{ delay: 60 }" class="mt-1 text-2xl font-semibold tracking-tight">Let's Connect</h2>
        <p v-reveal="{ delay: 120 }" class="mt-3 opacity-75">Open for open-source projects and community collaboration.</p>
      </div>
      <div class="lg:col-span-2">
        <div class="card p-5">
          <ul class="divide-y divide-black/10 dark:divide-white/10">
            <ContactItem
              v-for="(c, i) in contacts"
              :key="c.type"
              v-bind="c"
              :revealDelay="i * 80"
            />
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ContactItem from '@/components/ContactItem.vue'
import type { Contact } from '@/types'

const contacts: Contact[] = [
  { type: 'email', label: 'Email', value: 'tegar@wolkk.com', href: 'mailto:tegar@wolkk.com' },
  { type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/tegaranugroho', href: 'https://linkedin.com/in/tegaranugroho' },
  { type: 'github', label: 'GitHub', value: 'github.com/tegarnugroho', href: 'https://github.com/tegarnugroho' },
]
</script>

<style scoped>
</style>


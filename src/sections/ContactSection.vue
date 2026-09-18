<template>
  <section id="contact" class="scroll-mt-12 sm:scroll-mt-16 md:scroll-mt-16 pt-24 md:pt-28 pb-20 border-t border-black/10 dark:border-white/10">
    <div class="contact-layout">
      <div>
        <span v-reveal class="text-[11px] tracking-[0.18em] uppercase opacity-60">{{ content.eyebrow }}</span>
        <h2 v-reveal="{ delay: 60 }" class="contact-heading">{{ content.title }}</h2>
        <p v-reveal="{ delay: 120 }" class="mt-3 opacity-75">{{ content.description }}</p>
      </div>
      <div data-blueprint="CONTACT_LINKS" class="contact-links">
        <div class="contact-list">
          <ul class="contact-rows">
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
import { portfolioContent } from '@/content/portfolioContent'
import ContactItem from '@/components/ContactItem.vue'

const content = portfolioContent.contact


const contacts = content.items
</script>

<style scoped>
#contact { padding-top: 80px; padding-bottom: 56px; }
.contact-layout { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.9fr); align-items: start; gap: 48px; }
.contact-layout > div { min-width: 0; }
.contact-layout > div > span { font-family: ui-monospace,monospace; font-size: 10px; color: var(--label); opacity: 1; }
.contact-heading { font-size: clamp(32px,3.2vw,46px); font-weight: 600; line-height: 1.15; letter-spacing: -.04em; margin-top: 14px; }
.contact-layout p { max-width: 280px; color: var(--secondary); opacity: 1; line-height: 1.65; font-size: 14px; margin-top: 20px; }
.contact-list { border-top: 0; }
@media (max-width: 1000px) { .contact-layout { grid-template-columns: 1fr; gap: 32px; } .contact-layout p { max-width: 390px; } }
@media (max-width: 639px) { #contact { padding-top: 56px; padding-bottom: 48px; } .contact-layout { gap: 28px; } }
</style>


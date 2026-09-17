<template>
  <section id="hero" class="graphite-hero">
    <div class="hero-atmosphere" aria-hidden="true"></div>

    <div class="hero-copy">
      <p v-reveal class="hero-eyebrow">Flutter Developer</p>
      <h1 v-reveal="{ delay: 60 }">Tegar<span>.</span></h1>
      <p v-reveal="{ delay: 120 }" class="hero-intro">I build reliable cross-platform experiences focused on performance, intuitive UI, and maintainable architecture.</p>
      <div v-reveal="{ delay: 180 }" class="hero-actions"><a href="#projects" class="btn hero-primary">View Projects <span aria-hidden="true">→</span></a><a href="#contact" class="hero-contact">Contact</a></div>
    </div>
    <p class="hero-motto" aria-hidden="true">Build<br />Better<br />Things</p>
    <p class="hero-location">Jakarta,<br />Indonesia</p>
  </section>
</template>

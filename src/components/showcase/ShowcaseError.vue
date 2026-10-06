<template>
  <div class="showcase-error absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center select-none">
    <div class="max-w-md flex flex-col items-center gap-4">
      <div class="w-12 h-12 rounded-full border border-red-500/30 flex items-center justify-center bg-red-500/10 text-red-400 font-mono text-xs">
        !
      </div>
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.2em] text-zinc-300">
          SHOWCASE UNAVAILABLE
        </p>
        <p class="font-mono text-[11px] text-zinc-500 mt-1 max-w-xs leading-relaxed">
          WebGL acceleration could not be initialized or timed out on this device.
        </p>
      </div>

      <button
        type="button"
        @click="closeShowcase"
        class="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
      >
        <span>[ RETURN ]</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { closeShowcase } from '@/composables/useShowcase'
</script>


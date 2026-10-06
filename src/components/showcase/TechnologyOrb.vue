<template>
  <div
    ref="container"
    class="technology-orb-wrapper relative w-full h-full flex items-center justify-center select-none pointer-events-none"
    :class="{ 'orb-hovered': isHovered, 'orb-active': isClicking }"
  >
    <canvas ref="canvas" class="w-full h-full block rounded-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const props = withDefaults(
  defineProps<{
    isHovered?: boolean
    isClicking?: boolean
  }>(),
  {
    isHovered: false,
    isClicking: false,
  }
)

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let isVisible = true
let observer: IntersectionObserver | null = null

let orbMaterial: THREE.ShaderMaterial | null = null
let mesh: THREE.Mesh | null = null

// Spring scale on click
let currentScale = 1.0
let targetScale = 1.0

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uHover;
  uniform float uClick;
  varying vec2 vUv;

  void main() {
    // Normalized centered coords [-1, 1]
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);

    // Antialiased circular sphere edge
    float circleAlpha = smoothstep(1.0, 0.96, r);
    if (circleAlpha <= 0.0) {
      discard;
    }

    // 3D Sphere Normal Vector
    float z = sqrt(max(0.0, 1.0 - r * r));
    vec3 N = vec3(p, z);

    // Light direction (specular glass highlight from upper-right)
    vec3 lightDir = normalize(vec3(0.4, 0.65, 0.85));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(lightDir + viewDir);

    // Glass Specular Highlight (The iconic Apple gloss at top)
    float spec = pow(max(0.0, dot(N, halfVec)), 28.0);
    float specRim = pow(max(0.0, dot(N, normalize(vec3(-0.35, -0.5, 0.6)))), 14.0);

    // Fresnel edge factor
    float fresnel = pow(1.0 - z, 2.2);

    // Time variable modulated by speed
    float t = uTime * uSpeed;

    // Refract internal coords slightly through curved glass
    vec2 rp = p * (0.86 + 0.14 * z);

    // -------------------------------------------------------------
    // SIRI WAVEFORM ENERGY FIELDS (Tuned to Portfolio Dark Graphite & Titanium Palette)
    // -------------------------------------------------------------

    // Wave 1: Luminous Incandescent White / Platinum Ribbon (Main loop)
    float w1 = rp.y - 0.42 * sin(rp.x * 2.5 + t * 1.3) * cos(rp.x * 1.3 - t * 0.7) - 0.16 * cos(rp.x * 3.8 + t);
    float int1 = 0.048 / (w1 * w1 + 0.014);
    vec3 col1 = vec3(0.96, 0.98, 1.00); // Luminous Platinum White (#f8fafc)

    // Wave 2: Cool Brushed Titanium / Silver Ribbon (Lower curve)
    float w2 = rp.y + 0.40 * cos(rp.x * 2.3 - t * 1.1) * sin(rp.x * 1.6 + t * 0.85) + 0.14 * sin(rp.x * 3.2 - t * 1.4);
    float int2 = 0.048 / (w2 * w2 + 0.014);
    vec3 col2 = vec3(0.68, 0.74, 0.84); // Frosted Titanium Silver (#cbd5e1)

    // Wave 3: Subtle Cold Ice Slate Ribbon (Restrained editorial cool tint)
    float w3 = (rp.x * 0.72 + rp.y * 0.68) - 0.36 * sin(rp.x * 2.8 + t * 1.4) - 0.12 * cos(t * 0.85);
    float int3 = 0.042 / (w3 * w3 + 0.018);
    vec3 col3 = vec3(0.50, 0.66, 0.82); // Cold Steel / Ice Slate

    // Wave 4: Deep Charcoal Graphite Flow (Structural contrast)
    float w4 = (rp.x * 0.55 - rp.y * 0.82) - 0.42 * cos(rp.y * 2.6 - t * 1.2) + 0.14;
    float int4 = 0.042 / (w4 * w4 + 0.018);
    vec3 col4 = vec3(0.42, 0.48, 0.56); // Deep Charcoal Slate (#64748b)

    // Falloff towards glass perimeter
    float innerMask = smoothstep(0.94, 0.35, r);

    // Sum colored volumetric energy ribbons
    vec3 energy = vec3(0.0);
    energy += col1 * int1 * 0.85;
    energy += col2 * int2 * 0.80;
    energy += col3 * int3 * 0.70;
    energy += col4 * int4 * 0.65;

    // Glowing Pure White Center Nexus (where waveforms intersect)
    float overlap = (int1 * int2 + int2 * int3 + int1 * int3 + int1 * int4);
    float whiteNexus = smoothstep(0.65, 3.6, overlap) * (1.0 - r * 0.75);
    energy += vec3(1.0, 1.0, 1.0) * whiteNexus * 2.4;

    // Abstract micro tech data nodes orbiting inside the crystal sphere
    float techNodes = 0.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float nodeAngle = t * (0.7 + fi * 0.12) + fi * 1.047;
      float nodeRadius = 0.55 + 0.15 * sin(t * 0.4 + fi * 1.6);
      vec2 nodePos = vec2(cos(nodeAngle) * nodeRadius, sin(nodeAngle) * nodeRadius * 0.48);
      float distNode = length(rp - nodePos);
      techNodes += 0.0032 / (distNode * distNode + 0.0012);
    }
    energy += vec3(1.0, 1.0, 1.0) * techNodes * innerMask * 0.4;

    // Deep graphite obsidian base matching dark portfolio (#0b0c0d / #16181a)
    vec3 baseGlass = mix(vec3(0.05, 0.055, 0.065), vec3(0.02, 0.025, 0.03), r);

    // Internal composition
    vec3 finalColor = baseGlass + energy * innerMask * (1.0 + uHover * 0.35 + uClick * 0.9);

    // Dark glass perimeter vignette (crystal glass ball aesthetic)
    finalColor *= (1.0 - fresnel * 0.45);

    // Subtle titanium / silver rim glow on glass edge
    finalColor += vec3(0.85, 0.90, 0.98) * fresnel * 0.42;

    // Apple-grade specular gloss reflection on top surface
    finalColor += vec3(1.0, 1.0, 1.0) * spec * 0.92;
    finalColor += vec3(0.7, 0.8, 0.9) * specRim * 0.35;

    gl_FragColor = vec4(finalColor, circleAlpha);
  }
`

function initThree() {
  if (!container.value || !canvas.value) return

  const size = 44
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5)

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(size, size, false)
  renderer.setPixelRatio(dpr)

  orbMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 1.0 },
      uHover: { value: 0.0 },
      uClick: { value: 0.0 },
    },
  })

  // Full-screen quad for shader
  const geometry = new THREE.PlaneGeometry(2, 2)
  mesh = new THREE.Mesh(geometry, orbMaterial)
  scene.add(mesh)

  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    if (!isVisible) return

    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Smooth hover & click uniform transition
    const targetHover = props.isHovered ? 1.0 : 0.0
    const targetClick = props.isClicking ? 1.0 : 0.0
    const targetSpeed = props.isHovered ? 1.8 : 1.0

    if (orbMaterial) {
      orbMaterial.uniforms.uTime.value += delta
      orbMaterial.uniforms.uSpeed.value = THREE.MathUtils.lerp(orbMaterial.uniforms.uSpeed.value, targetSpeed, 0.1)
      orbMaterial.uniforms.uHover.value = THREE.MathUtils.lerp(orbMaterial.uniforms.uHover.value, targetHover, 0.15)
      orbMaterial.uniforms.uClick.value = THREE.MathUtils.lerp(orbMaterial.uniforms.uClick.value, targetClick, 0.25)
    }

    // Spring scale
    targetScale = props.isClicking ? 0.91 : props.isHovered ? 1.05 : 1.0
    currentScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.16)

    if (container.value) {
      container.value.style.transform = `scale(${currentScale})`
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)
}

onMounted(() => {
  initThree()

  if (container.value) {
    observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    observer.observe(container.value)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (animFrameId) cancelAnimationFrame(animFrameId)

  if (mesh) {
    mesh.geometry.dispose()
    if (orbMaterial) orbMaterial.dispose()
  }

  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
})
</script>

<style scoped>
.technology-orb-wrapper {
  transition: filter 300ms cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.16));
}

.technology-orb-wrapper.orb-hovered {
  filter: drop-shadow(0 6px 22px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 18px rgba(255, 255, 255, 0.32));
}

.technology-orb-wrapper.orb-active {
  filter: drop-shadow(0 8px 26px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 24px rgba(255, 255, 255, 0.5));
}
</style>

import * as THREE from 'three'

export interface ConstellationCategory {
  id: string
  name: string
  code: string
  color: string
  hex: number
  description: string
  cameraPos: [number, number, number]
  cameraTarget: [number, number, number]
}

export interface SkillStarNode {
  id: string
  name: string
  categoryId: string
  categoryName: string
  tagline: string
  desc: string
  pos: [number, number, number]
  magnitude: number // 1.25 = anchor, 0.95 = major star, 0.8 = satellite star
  connections: string[]
}

export const CONSTELLATION_CATEGORIES: ConstellationCategory[] = [
  {
    id: 'mobile',
    name: 'Mobile Core & Platforms',
    code: 'MOBILE',
    color: '#38bdf8',
    hex: 0x38bdf8,
    description: 'Natively compiled cross-platform client architectures for iOS, Android, Web & Desktop.',
    cameraPos: [-1.2, 0.4, 4.0],
    cameraTarget: [-1.2, 0.4, 1.1],
  },
  {
    id: 'architecture',
    name: 'Architecture & State',
    code: 'ARCH',
    color: '#a78bfa',
    hex: 0xa78bfa,
    description: 'Decoupled domain use-cases, reactive stream management, and clean dependency graphs.',
    cameraPos: [0.6, 2.2, 2.6],
    cameraTarget: [0.6, 2.2, -0.6],
  },
  {
    id: 'backend',
    name: 'Backend & Cloud',
    code: 'CLOUD',
    color: '#60a5fa',
    hex: 0x60a5fa,
    description: 'Full-duplex real-time synchronization, edge microservices, and serverless infrastructure.',
    cameraPos: [2.8, 0.5, 3.8],
    cameraTarget: [2.8, 0.5, 0.7],
  },
  {
    id: 'data',
    name: 'Data & Storage',
    code: 'DATA',
    color: '#2dd4bf',
    hex: 0x2dd4bf,
    description: 'ACID relational databases, encrypted binary box storage, and offline-first cache tiers.',
    cameraPos: [1.8, -1.8, 2.2],
    cameraTarget: [1.8, -1.8, -0.9],
  },
  {
    id: 'tooling',
    name: 'Tooling & DevOps',
    code: 'TOOLS',
    color: '#94a3b8',
    hex: 0x94a3b8,
    description: 'Automated CI/CD workflows, analysis servers, performance profiling, and release orchestration.',
    cameraPos: [-2.6, 1.8, 2.0],
    cameraTarget: [-2.6, 1.8, -1.2],
  },
]

export const CONSTELLATION_STARS: SkillStarNode[] = [
  // -------------------------------------------------------------
  // 1. MOBILE CORE CONSTELLATION (Cygnus / Cross Pattern - Foreground Left)
  // -------------------------------------------------------------
  {
    id: 'flutter',
    name: 'Flutter',
    categoryId: 'mobile',
    categoryName: 'Mobile Core & Platforms',
    tagline: 'Primary multi-target UI framework',
    desc: 'Primary framework for crafting pixel-perfect, 60/120 FPS natively compiled applications with shared reactive logic across iOS, Android, Web, and Desktop.',
    pos: [-1.2, 0.35, 1.15],
    magnitude: 1.3,
    connections: ['dart', 'android', 'ios', 'flutter-web', 'architecture', 'dio'],
  },
  {
    id: 'dart',
    name: 'Dart',
    categoryId: 'mobile',
    categoryName: 'Mobile Core & Platforms',
    tagline: 'Client-optimized type-safe language',
    desc: 'High-velocity object-oriented language featuring sound null safety, pattern matching, AOT native compilation, and sub-second stateful hot reload.',
    pos: [-2.05, 1.15, 1.45],
    magnitude: 1.0,
    connections: ['flutter', 'android', 'architecture'],
  },
  {
    id: 'android',
    name: 'Android',
    categoryId: 'mobile',
    categoryName: 'Mobile Core & Platforms',
    tagline: 'Platform channels & Gradle orchestration',
    desc: 'Native Android SDK integration, Kotlin/Java MethodChannels, Gradle build pipeline optimization, background isolates, and Google Play releases.',
    pos: [-2.35, -0.35, 0.85],
    magnitude: 0.9,
    connections: ['flutter', 'ios', 'android-sdk'],
  },
  {
    id: 'ios',
    name: 'iOS',
    categoryId: 'mobile',
    categoryName: 'Mobile Core & Platforms',
    tagline: 'Apple ecosystem & Cupertino fidelity',
    desc: 'Xcode workspace configuration, CocoaPods integration, Swift/Objective-C interop, iOS provisioning profiles, and App Store Connect releases.',
    pos: [-1.75, -1.05, 0.65],
    magnitude: 0.9,
    connections: ['flutter', 'android'],
  },
  {
    id: 'flutter-web',
    name: 'Web & Desktop',
    categoryId: 'mobile',
    categoryName: 'Mobile Core & Platforms',
    tagline: 'Wasm & CanvasKit responsive rendering',
    desc: 'Compiling Flutter to browser WebAssembly/CanvasKit and desktop targets (macOS/Windows) with responsive multi-window layouts and keyboard shortcuts.',
    pos: [-0.45, 1.05, 0.95],
    magnitude: 0.85,
    connections: ['flutter', 'dart'],
  },

  // -------------------------------------------------------------
  // 2. ARCHITECTURE CONSTELLATION (Corona Crown Pattern - Upper Center)
  // -------------------------------------------------------------
  {
    id: 'architecture',
    name: 'Clean Architecture',
    categoryId: 'architecture',
    categoryName: 'Architecture & State',
    tagline: 'Decoupled domain, data & presentation layers',
    desc: 'Strict separation of concerns establishing independent domain use-cases, reactive repository interfaces, and resilient test-driven software architecture.',
    pos: [0.6, 2.15, -0.65],
    magnitude: 1.2,
    connections: ['bloc', 'riverpod', 'flutter', 'getit'],
  },
  {
    id: 'bloc',
    name: 'BLoC & Cubit',
    categoryId: 'architecture',
    categoryName: 'Architecture & State',
    tagline: 'Event-driven stream state management',
    desc: 'Predictable unidirectional reactive data flow separating business logic components from widget hierarchies using Dart async streams.',
    pos: [-0.25, 2.75, -0.95],
    magnitude: 0.95,
    connections: ['architecture', 'riverpod', 'getit'],
  },
  {
    id: 'riverpod',
    name: 'Riverpod',
    categoryId: 'architecture',
    categoryName: 'Architecture & State',
    tagline: 'Compile-safe reactive dependency graph',
    desc: 'Declarative provider scoping, async state caching, auto-dispose listeners, and seamless unit testing without BuildContext coupling.',
    pos: [1.45, 2.65, -0.85],
    magnitude: 0.9,
    connections: ['architecture', 'bloc'],
  },
  {
    id: 'getit',
    name: 'GetIt & Injectable',
    categoryId: 'architecture',
    categoryName: 'Architecture & State',
    tagline: 'Service locator & code-generated DI',
    desc: 'Compile-time dependency injection registering singletons, lazy factories, and environment-specific mock dependencies for rapid unit testing.',
    pos: [1.05, 1.65, -0.45],
    magnitude: 0.8,
    connections: ['architecture', 'bloc'],
  },

  // -------------------------------------------------------------
  // 3. BACKEND & CLOUD CONSTELLATION (Triangulum Arrow - Midground Right)
  // -------------------------------------------------------------
  {
    id: 'firebase',
    name: 'Firebase',
    categoryId: 'backend',
    categoryName: 'Backend & Cloud',
    tagline: 'Realtime cloud persistence & serverless',
    desc: 'Cloud Firestore synchronization, Firebase Auth, Cloud Messaging (FCM), Crashlytics telemetry, and real-time remote configuration.',
    pos: [2.75, 0.45, 0.75],
    magnitude: 1.15,
    connections: ['dio', 'websocket', 'flutter'],
  },
  {
    id: 'dio',
    name: 'Dio & Networking',
    categoryId: 'backend',
    categoryName: 'Backend & Cloud',
    tagline: 'Interceptors, retry policies & token refreshes',
    desc: 'Feature-complete HTTP client configured with automated auth interceptors, certificate pinning, request cancellation tokens, and multipart streaming.',
    pos: [2.15, -0.25, 1.05],
    magnitude: 0.95,
    connections: ['firebase', 'websocket', 'flutter', 'sqlite'],
  },
  {
    id: 'websocket',
    name: 'WebSocket',
    categoryId: 'backend',
    categoryName: 'Backend & Cloud',
    tagline: 'Bi-directional low-latency socket streams',
    desc: 'Full-duplex real-time packet exchange for live order tracking, chat protocols, telemetry monitoring, and reactive collaborative state.',
    pos: [3.55, -0.15, 0.45],
    magnitude: 0.85,
    connections: ['dio', 'firebase', 'nodejs'],
  },
  {
    id: 'nodejs',
    name: 'Node.js & Edge APIs',
    categoryId: 'backend',
    categoryName: 'Backend & Cloud',
    tagline: 'REST microservices & Cloudflare Workers',
    desc: 'Lightweight backend microservices, Cloudflare Workers serverless edge execution, JSON schema validation, and webhooks automation.',
    pos: [3.35, 1.25, 0.25],
    magnitude: 0.85,
    connections: ['firebase', 'websocket'],
  },

  // -------------------------------------------------------------
  // 4. DATA & LOCAL PERSISTENCE CONSTELLATION (Delphinus Diamond - Lower Right)
  // -------------------------------------------------------------
  {
    id: 'sqlite',
    name: 'SQLite (sqflite)',
    categoryId: 'data',
    categoryName: 'Data & Storage',
    tagline: 'Relational ACID local persistence',
    desc: 'Structured relational offline caching, database schema migration scripts, transactional queries, and high-volume local tables.',
    pos: [1.75, -1.75, -0.95],
    magnitude: 1.05,
    connections: ['hive', 'caching', 'dio'],
  },
  {
    id: 'hive',
    name: 'Hive NoSQL',
    categoryId: 'data',
    categoryName: 'Data & Storage',
    tagline: 'Ultra-fast binary key-value storage',
    desc: 'Zero-native-dependency encrypted binary box storage with microsecond lookup speeds for local settings, offline tokens, and state snapshots.',
    pos: [2.55, -2.15, -0.75],
    magnitude: 0.9,
    connections: ['sqlite', 'shared-prefs'],
  },
  {
    id: 'shared-prefs',
    name: 'Shared Preferences',
    categoryId: 'data',
    categoryName: 'Data & Storage',
    tagline: 'Lightweight platform key-value store',
    desc: 'Synchronous key-value pair storage backed by NSUserDefaults on iOS and SharedPreferences on Android for user preferences.',
    pos: [2.85, -1.35, -0.55],
    magnitude: 0.8,
    connections: ['hive', 'caching'],
  },
  {
    id: 'caching',
    name: 'Local Caching Strategy',
    categoryId: 'data',
    categoryName: 'Data & Storage',
    tagline: 'Offline-first stale-while-revalidate',
    desc: 'Multi-tiered storage strategy coordinating in-memory isolate stores, persistent disk cache, and background network revalidation.',
    pos: [1.05, -2.35, -1.15],
    magnitude: 0.85,
    connections: ['sqlite', 'shared-prefs'],
  },

  // -------------------------------------------------------------
  // 5. TOOLING & DEVOPS CONSTELLATION (Lyra Pattern - Background Left)
  // -------------------------------------------------------------
  {
    id: 'cicd',
    name: 'CI/CD & GitHub Actions',
    categoryId: 'tooling',
    categoryName: 'Tooling & DevOps',
    tagline: 'Automated test & multi-platform build pipelines',
    desc: 'Continuous integration workflows automating flutter analyze, test execution, iOS certificate signing, Android app bundles, and Firebase releases.',
    pos: [-2.75, 1.75, -1.15],
    magnitude: 1.05,
    connections: ['git', 'android-sdk', 'flutter'],
  },
  {
    id: 'git',
    name: 'Git & Version Control',
    categoryId: 'tooling',
    categoryName: 'Tooling & DevOps',
    tagline: 'Branching strategies & collaborative releases',
    desc: 'Gitflow branching strategies, semantic versioning, interactive rebasing, merge conflict resolution, and collaborative pull requests.',
    pos: [-2.05, 2.35, -1.45],
    magnitude: 0.9,
    connections: ['cicd', 'vscode'],
  },
  {
    id: 'android-sdk',
    name: 'Android SDK & Gradle',
    categoryId: 'tooling',
    categoryName: 'Tooling & DevOps',
    tagline: 'Build toolchains, ProGuard & NDK',
    desc: 'Android build toolchains, R8/ProGuard code shrinking, native symbols desugaring, and Android Virtual Device debugging.',
    pos: [-3.35, 1.05, -0.85],
    magnitude: 0.85,
    connections: ['cicd', 'android'],
  },
  {
    id: 'vscode',
    name: 'VS Code & DevTools',
    categoryId: 'tooling',
    categoryName: 'Tooling & DevOps',
    tagline: 'Dart Analysis Server & CPU flamegraphs',
    desc: 'Deep integration with Dart DevTools memory profilers, CPU flamegraphs, network traffic inspector, and custom automated lint rules.',
    pos: [-1.35, 2.75, -1.55],
    magnitude: 0.8,
    connections: ['git', 'cicd'],
  },
]

export const CONSTELLATION_EDGES: [string, string][] = [
  // Mobile Core (Cygnus Cross)
  ['flutter', 'dart'],
  ['flutter', 'android'],
  ['flutter', 'ios'],
  ['flutter', 'flutter-web'],
  ['dart', 'android'],
  ['android', 'ios'],

  // Architecture (Crown Pattern)
  ['architecture', 'bloc'],
  ['architecture', 'riverpod'],
  ['architecture', 'getit'],
  ['bloc', 'getit'],
  ['bloc', 'riverpod'],

  // Backend & Cloud (Arrow Pattern)
  ['firebase', 'dio'],
  ['dio', 'websocket'],
  ['firebase', 'nodejs'],
  ['websocket', 'nodejs'],

  // Data & Storage (Diamond Pattern)
  ['sqlite', 'hive'],
  ['hive', 'shared-prefs'],
  ['shared-prefs', 'caching'],
  ['caching', 'sqlite'],

  // Tooling (Quadrilateral Pattern)
  ['cicd', 'git'],
  ['git', 'vscode'],
  ['cicd', 'android-sdk'],
  ['android-sdk', 'git'],

  // Major Inter-Constellation Bridges (Faint Galactic Tethers)
  ['flutter', 'architecture'],
  ['flutter', 'dio'],
  ['android', 'android-sdk'],
  ['dio', 'sqlite'],
]

/**
 * Creates a high-DPI star sprite texture with sharp core and radiant diffraction spikes.
 */
export function createStarSpriteTexture(colorHex: string = '#ffffff'): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const center = size / 2

  // 1. Soft Outer Atmospheric Corona Glow
  const outerGrad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.95)
  outerGrad.addColorStop(0, colorHex + 'cc')
  outerGrad.addColorStop(0.25, colorHex + '44')
  outerGrad.addColorStop(0.6, colorHex + '11')
  outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = outerGrad
  ctx.fillRect(0, 0, size, size)

  // 2. Astronomical Diffraction Spikes (4-point cross)
  ctx.strokeStyle = colorHex + '66'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(center - size * 0.45, center)
  ctx.lineTo(center + size * 0.45, center)
  ctx.moveTo(center, center - size * 0.45)
  ctx.lineTo(center, center + size * 0.45)
  ctx.stroke()

  // 3. Inner Brilliant Core Nucleus
  const coreGrad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.28)
  coreGrad.addColorStop(0, '#ffffff')
  coreGrad.addColorStop(0.4, '#f8fafc')
  coreGrad.addColorStop(0.7, colorHex)
  coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(center, center, center * 0.28, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

/**
 * Creates procedural texture for the distant Ringed Gas Giant.
 */
export function createGasGiantTexture(): THREE.CanvasTexture {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0.00, '#0f172a')
  grad.addColorStop(0.15, '#1e293b')
  grad.addColorStop(0.30, '#0c4a6e')
  grad.addColorStop(0.45, '#1e3a8a')
  grad.addColorStop(0.55, '#0284c7')
  grad.addColorStop(0.70, '#1e293b')
  grad.addColorStop(0.85, '#0f172a')
  grad.addColorStop(1.00, '#080d1a')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Horizontal Atmospheric Bands
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * height
    const h = 2 + Math.random() * 8
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.15)'
    ctx.fillRect(0, y, width, h)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  return texture
}

/**
 * Creates procedural texture for a cratered celestial moon.
 */
export function createMoonTexture(): THREE.CanvasTexture {
  const width = 256
  const height = 128
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, width, height)

  // Subtle crater stippling
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const r = 1 + Math.random() * 4
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(15, 23, 42, 0.4)' : 'rgba(51, 65, 85, 0.3)'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  return texture
}

import { computed } from 'vue'
import { portfolioContent } from '@/content/portfolioContent'

export interface GlobeMarker {
  id: string
  title: string
  fullTitle: string
  subtitle: string
  category: string
  description: string
  tech: string[]
  lat: number
  lng: number
  accentColor: string
  link?: string
  repo?: string
  image?: string
  images?: string[]
}

export interface GlobeArc {
  fromId: string
  toId: string
  fromLatLng: [number, number]
  toLatLng: [number, number]
  color?: string
}

interface ProjectGeoMetadata {
  matchKey: string
  shortTitle: string
  subtitle: string
  category: string
  lat: number
  lng: number
  accentColor: string
}

const geoMetadata: ProjectGeoMetadata[] = [
  {
    matchKey: 'Table Parser',
    shortTitle: 'Table Parser',
    subtitle: 'Flutter Package',
    category: 'Open Source Package',
    lat: 35.6762,
    lng: 139.6503, // Tokyo / East Asia
    accentColor: '#06b6d4',
  },
  {
    matchKey: 'VSCode Clone',
    shortTitle: 'VSCode Web',
    subtitle: 'Web Experience',
    category: 'Personal Portfolio',
    lat: -33.8688,
    lng: 151.2093, // Sydney
    accentColor: '#38bdf8',
  },
  {
    matchKey: 'Excel Translator',
    shortTitle: 'Excel Translator',
    subtitle: 'Localization Tool',
    category: 'Flutter Package',
    lat: 51.5074,
    lng: -0.1278, // London
    accentColor: '#10b981',
  },
  {
    matchKey: 'Danafix',
    shortTitle: 'Danafix',
    subtitle: 'Online Loan App',
    category: 'Fintech Application',
    lat: -6.9175,
    lng: 107.6191, // Bandung
    accentColor: '#6366f1',
  },
  {
    matchKey: 'Tribelio',
    shortTitle: 'Tribelio',
    subtitle: 'Creator Platform',
    category: 'Community & Commerce',
    lat: -6.2088,
    lng: 106.8456, // Jakarta (Home Base)
    accentColor: '#a855f7',
  },
  {
    matchKey: 'Cicle',
    shortTitle: 'Cicle',
    subtitle: 'Remote Team Tool',
    category: 'Team Collaboration',
    lat: -7.7956,
    lng: 110.3695, // Yogyakarta
    accentColor: '#f59e0b',
  },
  {
    matchKey: 'IZILOH',
    shortTitle: 'IZILOH',
    subtitle: 'Innovative Laundry',
    category: 'On-Demand Service',
    lat: -6.1783,
    lng: 106.6319, // Tangerang
    accentColor: '#3b82f6',
  },
  {
    matchKey: 'Waroong Retjeh',
    shortTitle: 'Waroong Retjeh',
    subtitle: 'Restaurant App',
    category: 'F&B POS Platform',
    lat: -7.2575,
    lng: 112.7521, // Surabaya
    accentColor: '#ef4444',
  },
  {
    matchKey: 'Flambe',
    shortTitle: 'Flambe',
    subtitle: 'Food Delivery App',
    category: 'Food Delivery Platform',
    lat: -8.6705,
    lng: 115.2126, // Denpasar / Bali
    accentColor: '#f97316',
  },
  {
    matchKey: 'NU Card',
    shortTitle: 'NU Card',
    subtitle: 'Digital Wallet App',
    category: 'Fintech / E-Wallet',
    lat: -6.9667,
    lng: 110.4167, // Semarang
    accentColor: '#14b8a6',
  },
  {
    matchKey: 'ValtHub',
    shortTitle: 'ValtHub',
    subtitle: 'Secrets Manager',
    category: 'Developer Tooling',
    lat: 37.7749,
    lng: -122.4194, // San Francisco
    accentColor: '#ec4899',
  },
  {
    matchKey: 'Codeary',
    shortTitle: 'Codeary',
    subtitle: 'Developer Platform',
    category: 'Tech Publication',
    lat: 1.3521,
    lng: 103.8198, // Singapore
    accentColor: '#10b981',
  },
  {
    matchKey: 'flutter_v_keyboard',
    shortTitle: 'Virtual Keyboard',
    subtitle: 'Flutter Package',
    category: 'Open Source Package',
    lat: 52.5200,
    lng: 13.4050, // Berlin
    accentColor: '#8b5cf6',
  },
]

/**
 * Derives globe markers directly from the portfolio's published projects.
 * Kept reactively in sync with the current active locale and content updates.
 */
export const globeMarkers = computed<GlobeMarker[]>(() => {
  const published = portfolioContent.projects.items.filter(p => p.status === 'published')

  return published.map((proj, index) => {
    const meta = geoMetadata.find(m => proj.title.includes(m.matchKey)) || {
      matchKey: proj.title,
      shortTitle: proj.title.split(' - ')[0] || proj.title,
      subtitle: proj.tech[0] || 'Project',
      category: 'Software Application',
      lat: -6.2088 + (index * 4.5),
      lng: 106.8456 + (index * 7.5),
      accentColor: '#3b82f6',
    }

    const slug = proj.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    return {
      id: `${slug}-${index}`,
      title: meta.shortTitle,
      fullTitle: proj.title,
      subtitle: meta.subtitle,
      category: meta.category,
      description: proj.description,
      tech: proj.tech,
      lat: meta.lat,
      lng: meta.lng,
      accentColor: meta.accentColor,
      link: proj.link,
      repo: proj.repo,
      image: proj.image,
      images: proj.images,
    }
  })
})

/**
 * Geographic connection arcs radiating from Jakarta (home base) to destinations worldwide.
 */
export const globeArcs = computed<GlobeArc[]>(() => {
  const markers = globeMarkers.value
  const homeMarker = markers.find(m => m.title === 'Tribelio') || markers[0]
  if (!homeMarker) return []

  const arcs: GlobeArc[] = []
  for (const m of markers) {
    if (m.id === homeMarker.id) continue
    arcs.push({
      fromId: homeMarker.id,
      toId: m.id,
      fromLatLng: [homeMarker.lat, homeMarker.lng],
      toLatLng: [m.lat, m.lng],
      color: '#94a3b8',
    })
  }

  return arcs
})

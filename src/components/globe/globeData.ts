import { computed } from 'vue'
import { portfolioContent } from '@/content/portfolioContent'

export interface GlobeMarker {
  id: string
  clusterId: string
  clusterName: string
  title: string
  fullTitle: string
  subtitle: string
  category: string
  description: string
  tech: string[]
  lat: number
  lng: number
  satelliteAngle: number
  satelliteRadius: number
  accentColor: string
  link?: string
  repo?: string
  image?: string
  images?: string[]
}

export interface GlobeCluster {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  accentColor: string
  projectCount: number
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
  clusterId: string
  clusterName: string
  shortTitle: string
  subtitle: string
  category: string
  lat: number
  lng: number
  accentColor: string
}

const geoMetadata: ProjectGeoMetadata[] = [
  // Indonesia Hub (Multi-project cluster)
  {
    matchKey: 'Tribelio',
    clusterId: 'cluster-id',
    clusterName: 'Indonesia Hub',
    shortTitle: 'Tribelio',
    subtitle: 'Creator Platform',
    category: 'Community & Commerce',
    lat: -6.2088,
    lng: 106.8456, // Jakarta (Central Hub)
    accentColor: '#a855f7',
  },
  {
    matchKey: 'Waroong Retjeh',
    clusterId: 'cluster-id',
    clusterName: 'Indonesia Hub',
    shortTitle: 'Waroong Retjeh',
    subtitle: 'Restaurant App',
    category: 'F&B POS Platform',
    lat: -7.2575,
    lng: 112.7521, // Surabaya
    accentColor: '#ef4444',
  },
  {
    matchKey: 'Danafix',
    clusterId: 'cluster-id',
    clusterName: 'Indonesia Hub',
    shortTitle: 'Danafix',
    subtitle: 'Online Loan App',
    category: 'Fintech Application',
    lat: -6.9175,
    lng: 107.6191, // Bandung
    accentColor: '#6366f1',
  },
  {
    matchKey: 'Cicle',
    clusterId: 'cluster-id',
    clusterName: 'Indonesia Hub',
    shortTitle: 'Cicle',
    subtitle: 'Remote Team Tool',
    category: 'Team Collaboration',
    lat: -7.7956,
    lng: 110.3695, // Yogyakarta
    accentColor: '#f59e0b',
  },
  {
    matchKey: 'IZILOH',
    clusterId: 'cluster-id',
    clusterName: 'Indonesia Hub',
    shortTitle: 'IZILOH',
    subtitle: 'Innovative Laundry',
    category: 'On-Demand Service',
    lat: -6.1783,
    lng: 106.6319, // Tangerang
    accentColor: '#3b82f6',
  },
  {
    matchKey: 'NU Card',
    clusterId: 'cluster-id',
    clusterName: 'Indonesia Hub',
    shortTitle: 'NU Card',
    subtitle: 'Digital Wallet App',
    category: 'Fintech / E-Wallet',
    lat: -6.9667,
    lng: 110.4167, // Semarang
    accentColor: '#14b8a6',
  },
  {
    matchKey: 'Flambe',
    clusterId: 'cluster-id',
    clusterName: 'Indonesia Hub',
    shortTitle: 'Flambe',
    subtitle: 'Food Delivery App',
    category: 'Food Delivery Platform',
    lat: -8.6705,
    lng: 115.2126, // Denpasar / Bali
    accentColor: '#f97316',
  },

  // Europe Hub (Multi-project cluster)
  {
    matchKey: 'Excel Translator',
    clusterId: 'cluster-eu',
    clusterName: 'Europe Hub',
    shortTitle: 'Excel Translator',
    subtitle: 'Localization Tool',
    category: 'Flutter Package',
    lat: 51.5074,
    lng: -0.1278, // London
    accentColor: '#10b981',
  },
  {
    matchKey: 'flutter_v_keyboard',
    clusterId: 'cluster-eu',
    clusterName: 'Europe Hub',
    shortTitle: 'Virtual Keyboard',
    subtitle: 'Flutter Package',
    category: 'Open Source Package',
    lat: 52.5200,
    lng: 13.4050, // Berlin
    accentColor: '#8b5cf6',
  },

  // East Asia Hub
  {
    matchKey: 'Table Parser',
    clusterId: 'cluster-ea',
    clusterName: 'East Asia Hub',
    shortTitle: 'Table Parser',
    subtitle: 'Flutter Package',
    category: 'Open Source Package',
    lat: 35.6762,
    lng: 139.6503, // Tokyo
    accentColor: '#06b6d4',
  },

  // Americas Hub
  {
    matchKey: 'ValtHub',
    clusterId: 'cluster-us',
    clusterName: 'Americas Hub',
    shortTitle: 'ValtHub',
    subtitle: 'Secrets Manager',
    category: 'Developer Tooling',
    lat: 37.7749,
    lng: -122.4194, // San Francisco
    accentColor: '#ec4899',
  },

  // Singapore Hub
  {
    matchKey: 'Codeary',
    clusterId: 'cluster-sg',
    clusterName: 'Singapore Hub',
    shortTitle: 'Codeary',
    subtitle: 'Developer Platform',
    category: 'Tech Publication',
    lat: 1.3521,
    lng: 103.8198, // Singapore
    accentColor: '#10b981',
  },

  // Oceania Hub
  {
    matchKey: 'VSCode Clone',
    clusterId: 'cluster-oc',
    clusterName: 'Oceania Hub',
    shortTitle: 'VSCode Web',
    subtitle: 'Web Experience',
    category: 'Personal Portfolio',
    lat: -33.8688,
    lng: 151.2093, // Sydney
    accentColor: '#38bdf8',
  },
]

/**
 * Derives globe markers directly from publishedProjects.
 * Groups co-located projects into clusters with satellite orbit parameters for zoom inspection.
 */
export const globeMarkers = computed<GlobeMarker[]>(() => {
  const published = portfolioContent.projects.items.filter(p => p.status === 'published')

  // Count items per cluster to compute angular satellite offsets
  const clusterCounts: Record<string, number> = {}
  const clusterIndices: Record<string, number> = {}

  for (const proj of published) {
    const meta = geoMetadata.find(m => proj.title.includes(m.matchKey))
    const cId = meta?.clusterId || 'cluster-default'
    clusterCounts[cId] = (clusterCounts[cId] || 0) + 1
  }

  return published.map((proj, index) => {
    const meta = geoMetadata.find(m => proj.title.includes(m.matchKey)) || {
      matchKey: proj.title,
      clusterId: 'cluster-id',
      clusterName: 'Indonesia Hub',
      shortTitle: proj.title.split(' - ')[0] || proj.title,
      subtitle: proj.tech[0] || 'Project',
      category: 'Software Application',
      lat: -6.2088,
      lng: 106.8456,
      accentColor: '#3b82f6',
    }

    const cId = meta.clusterId
    const countInCluster = clusterCounts[cId] || 1
    const idxInCluster = clusterIndices[cId] || 0
    clusterIndices[cId] = idxInCluster + 1

    // Compute satellite angle and radius
    const satelliteRadius = countInCluster > 1 ? 0.32 : 0
    const satelliteAngle = countInCluster > 1 ? (idxInCluster * 2 * Math.PI) / countInCluster : 0

    const slug = proj.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    return {
      id: `${slug}-${index}`,
      clusterId: meta.clusterId,
      clusterName: meta.clusterName,
      title: meta.shortTitle,
      fullTitle: proj.title,
      subtitle: meta.subtitle,
      category: meta.category,
      description: proj.description,
      tech: proj.tech,
      lat: meta.lat,
      lng: meta.lng,
      satelliteAngle,
      satelliteRadius,
      accentColor: meta.accentColor,
      link: proj.link,
      repo: proj.repo,
      image: proj.image,
      images: proj.images,
    }
  })
})

/**
 * Returns distinct cluster hubs with their aggregated project counts.
 */
export const globeClusters = computed<GlobeCluster[]>(() => {
  const markers = globeMarkers.value
  const map = new Map<string, GlobeCluster>()

  for (const m of markers) {
    if (!map.has(m.clusterId)) {
      map.set(m.clusterId, {
        id: m.clusterId,
        name: m.clusterName,
        region: m.category,
        lat: m.lat,
        lng: m.lng,
        accentColor: m.accentColor,
        projectCount: 1,
      })
    } else {
      const existing = map.get(m.clusterId)!
      existing.projectCount += 1
    }
  }

  return Array.from(map.values())
})

/**
 * Connection arcs radiating from home base (Jakarta) to destinations worldwide.
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

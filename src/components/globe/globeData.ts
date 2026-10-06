export interface GlobeMarker {
  id: string
  title: string
  subtitle: string
  lat: number
  lng: number
  accentColor: string
  projectMatch?: string // Match keyword in published projects
  url?: string
}

export interface GlobeArc {
  fromId: string
  toId: string
  fromLatLng: [number, number]
  toLatLng: [number, number]
  color?: string
}

/**
 * Projects featured on the 3D globe.
 * Locations represent real deployment platforms, user bases, or project headquarters.
 */
export const globeMarkers: GlobeMarker[] = [
  {
    id: 'creator-app',
    title: 'Creator App',
    subtitle: 'Creator Platform',
    lat: -6.2088,
    lng: 106.8456, // Jakarta, Indonesia
    accentColor: '#a855f7',
    projectMatch: 'Tribelio',
    url: 'https://tribelio.com/',
  },
  {
    id: 'bilang-pos',
    title: 'BilangPOS',
    subtitle: 'Voice-first POS',
    lat: -7.2575,
    lng: 112.7521, // Surabaya, Indonesia
    accentColor: '#3b82f6',
    projectMatch: 'Waroong Retjeh',
    url: 'http://waroongretjeh.dev.ittron.co.id/',
  },
  {
    id: 'engelhorn',
    title: 'Engelhorn',
    subtitle: 'POS System',
    lat: 49.4875,
    lng: 8.466, // Mannheim, Germany
    accentColor: '#f59e0b',
    projectMatch: 'Engelhorn',
  },
  {
    id: 'codeary',
    title: 'Codeary',
    subtitle: 'Tech Blog',
    lat: 1.3521,
    lng: 103.8198, // Singapore Edge
    accentColor: '#10b981',
    projectMatch: 'Codeary',
    url: 'https://codeary.xyz',
  },
  {
    id: 'valthub',
    title: 'ValtHub',
    subtitle: 'Secrets Manager',
    lat: 37.7749,
    lng: -122.4194, // San Francisco, USA
    accentColor: '#ec4899',
    projectMatch: 'ValtHub',
  },
  {
    id: 'flutter-pkg',
    title: 'Table Parser',
    subtitle: 'Flutter Package',
    lat: 35.6762,
    lng: 139.6503, // Tokyo / East Asia
    accentColor: '#06b6d4',
    projectMatch: 'Table Parser',
    url: 'https://pub.dev/packages/table_parser',
  },
]

/**
 * Geographic connection arcs radiating from home base (Jakarta) to project destinations.
 */
export const globeArcs: GlobeArc[] = [
  {
    fromId: 'creator-app',
    toId: 'engelhorn',
    fromLatLng: [-6.2088, 106.8456],
    toLatLng: [49.4875, 8.466],
    color: '#94a3b8',
  },
  {
    fromId: 'creator-app',
    toId: 'valthub',
    fromLatLng: [-6.2088, 106.8456],
    toLatLng: [37.7749, -122.4194],
    color: '#94a3b8',
  },
  {
    fromId: 'creator-app',
    toId: 'codeary',
    fromLatLng: [-6.2088, 106.8456],
    toLatLng: [1.3521, 103.8198],
    color: '#94a3b8',
  },
  {
    fromId: 'creator-app',
    toId: 'flutter-pkg',
    fromLatLng: [-6.2088, 106.8456],
    toLatLng: [35.6762, 139.6503],
    color: '#94a3b8',
  },
  {
    fromId: 'creator-app',
    toId: 'bilang-pos',
    fromLatLng: [-6.2088, 106.8456],
    toLatLng: [-7.2575, 112.7521],
    color: '#94a3b8',
  },
]


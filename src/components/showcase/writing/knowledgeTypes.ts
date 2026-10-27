import type * as THREE from 'three'

export interface KnowledgeArticle {
  id: string
  title: string
  shortTitle: string
  category: string
  date: string
  year: string
  excerpt: string
  tags: string[]
  url: string
  lat?: number
  lng?: number
  accentColor?: string
  readingTime?: string
}

export type CategoryFilter = string

export interface KnowledgeMarkerNode {
  article: KnowledgeArticle
  index: number
  lat: number
  lng: number
  accentColor: string
  readingTime: string
  dotMesh: THREE.Mesh
  hitMesh: THREE.Mesh
  beaconMesh: THREE.Mesh
  ringMesh: THREE.Mesh
  gemMesh: THREE.Mesh
  normalVec: THREE.Vector3
  pos: THREE.Vector3
}

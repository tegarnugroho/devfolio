export interface EngineeringDomain {
  id: string
  label: string
  code: string
  description: string
  offset: [number, number, number]
  normal: [number, number, number]
}

export interface HeroProjectItem {
  id: string
  title: string
  subtitle: string
  tech: string
  link: string
  image?: string
  offset: [number, number, number]
  rotation: [number, number, number]
}

export type InspectionMode = 'assembled' | 'expanded'


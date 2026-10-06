import * as THREE from 'three'
import { landPoints, coastlineLines } from './worldData'

/**
 * Converts latitude and longitude in degrees to a 3D Cartesian position on a sphere.
 * North is +Y, Equator is Y=0, Greenwich is along +X, East is +Z.
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

/**
 * Generates procedural latitude and longitude grid lines as a single LineSegments BufferGeometry.
 */
export function createGridLines(radius: number): THREE.BufferGeometry {
  const positions: number[] = []
  const segments = 64

  // Latitude circles
  const latitudes = [-60, -30, 0, 30, 60]
  for (const lat of latitudes) {
    for (let i = 0; i < segments; i++) {
      const lng1 = (i / segments) * 360 - 180
      const lng2 = ((i + 1) / segments) * 360 - 180
      const p1 = latLngToVector3(lat, lng1, radius)
      const p2 = latLngToVector3(lat, lng2, radius)
      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
    }
  }

  // Longitude meridians
  const longitudes = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180]
  for (const lng of longitudes) {
    for (let i = 0; i < segments; i++) {
      const lat1 = (i / segments) * 180 - 90
      const lat2 = ((i + 1) / segments) * 180 - 90
      const p1 = latLngToVector3(lat1, lng, radius)
      const p2 = latLngToVector3(lat2, lng, radius)
      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

/**
 * Generates the continent coastlines as LineSegments BufferGeometry.
 */
export function createCoastlineGeometry(radius: number): THREE.BufferGeometry {
  const positions: number[] = []

  for (const line of coastlineLines) {
    for (let i = 0; i < line.length - 1; i++) {
      const p1 = latLngToVector3(line[i][0], line[i][1], radius)
      const p2 = latLngToVector3(line[i + 1][0], line[i + 1][1], radius)
      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

/**
 * Generates the land points cloud geometry.
 */
export function createLandPointsGeometry(radius: number): THREE.BufferGeometry {
  const positions = new Float32Array(landPoints.length * 3)

  for (let i = 0; i < landPoints.length; i++) {
    const p = latLngToVector3(landPoints[i][0], landPoints[i][1], radius)
    positions[i * 3] = p.x
    positions[i * 3 + 1] = p.y
    positions[i * 3 + 2] = p.z
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

/**
 * Creates a subtle curved 3D arc between two points that arches above the globe.
 */
export function createArcPoints(
  startVec: THREE.Vector3,
  endVec: THREE.Vector3,
  radius: number,
  segments = 40
): THREE.Vector3[] {
  const angle = startVec.angleTo(endVec)
  const mid = startVec.clone().add(endVec).multiplyScalar(0.5)
  const midLen = mid.length()

  if (midLen < 0.001) {
    return [startVec.clone(), endVec.clone()]
  }

  // Elevate control point based on angular distance
  const elevation = radius + Math.sin(angle / 2) * 0.45 + 0.05
  const control = mid.normalize().multiplyScalar(elevation)

  const curve = new THREE.QuadraticBezierCurve3(startVec, control, endVec)
  return curve.getPoints(segments)
}

/**
 * Checks whether WebGL is supported by the client browser.
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}


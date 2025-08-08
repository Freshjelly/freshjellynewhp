import React, { useMemo, useRef, useEffect } from 'react'
import { useAppState } from '../state/useAppState'
import SafeGlassBottle from './objects/SafeGlassBottle'
import SafeTreasureChest from './objects/SafeTreasureChest'
import SafeFloatRing from './objects/SafeFloatRing'

/**
 * Seeded Random Number Generator for consistent layouts
 */
class SeededRandom {
  private seed: number
  
  constructor(seed: number) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }
  
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return this.seed
  }
  
  float(): number {
    return (this.next() - 1) / 2147483646
  }
  
  range(min: number, max: number): number {
    return min + this.float() * (max - min)
  }
  
  choice<T>(array: T[]): T {
    return array[Math.floor(this.float() * array.length)]
  }
}

/**
 * Generate positions using Poisson Disk Sampling for non-overlapping placement
 */
function generatePositions(
  count: number,
  bounds: { minX: number, maxX: number, minZ: number, maxZ: number },
  minDistance: number,
  rng: SeededRandom
): Array<{ x: number, z: number }> {
  const positions: Array<{ x: number, z: number }> = []
  const maxAttempts = 30
  
  for (let i = 0; i < count; i++) {
    let placed = false
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = {
        x: rng.range(bounds.minX, bounds.maxX),
        z: rng.range(bounds.minZ, bounds.maxZ)
      }
      
      // Check if position is far enough from existing positions
      let valid = true
      for (const pos of positions) {
        const dx = candidate.x - pos.x
        const dz = candidate.z - pos.z
        const distance = Math.sqrt(dx * dx + dz * dz)
        
        if (distance < minDistance) {
          valid = false
          break
        }
      }
      
      if (valid) {
        positions.push(candidate)
        placed = true
        break
      }
    }
    
    // If we couldn't place after max attempts, place randomly (fallback)
    if (!placed && import.meta.env.DEV) {
      console.warn(`[OBJECTS] Failed to place object ${i} with minimum distance`)
      positions.push({
        x: rng.range(bounds.minX, bounds.maxX),
        z: rng.range(bounds.minZ, bounds.maxZ)
      })
    }
  }
  
  return positions
}

interface ObjectLayout {
  mainObjects: Array<{
    id: string
    type: 'floatRing' | 'treasureChest' | 'glassBottle'
    position: [number, number, number]
    scale: number
  }>
  decorativeObjects: Array<{
    id: string
    type: string
    position: [number, number, number]
    scale: number
    color: number
  }>
}

/**
 * Safe Objects Cluster Component with GLTF fallback
 * Manages procedural placement of interactive objects with Safe Mode considerations
 */
const SafeObjectsCluster: React.FC<{
  onObjectHover: (object: any, position: any) => void
  onObjectLeave: () => void
}> = ({ onObjectHover, onObjectLeave }) => {
  const initGuardRef = useRef<boolean>(false)
  const { 
    seed, 
    objectsVisible, 
    isMobile, 
    lowPowerMode, 
    safeMode 
  } = useAppState()
  
  // Generate object layout based on current seed with Safe Mode adjustments
  const objectLayout = useMemo<ObjectLayout>(() => {
    if (initGuardRef.current && import.meta.env.DEV) {
      console.info('[OBJECTS] Regenerating layout due to seed change:', seed)
    }
    
    const rng = new SeededRandom(seed)
    
    // Adjust counts based on performance settings and Safe Mode
    const mainObjectCount = safeMode ? 2 : (lowPowerMode ? 2 : (isMobile ? 3 : 3))
    const decorativeCount = safeMode ? 3 : (lowPowerMode ? 5 : (isMobile ? 8 : 12))
    
    const bounds = { minX: -8, maxX: 8, minZ: -8, maxZ: 8 }
    const minDistance = 2.0
    
    // Generate main interactive objects
    const mainPositions = generatePositions(mainObjectCount, bounds, minDistance, rng)
    const objectTypes = ['floatRing', 'treasureChest', 'glassBottle'] as const
    
    const mainObjects = mainPositions.map((pos, index) => ({
      id: `main-${index}`,
      type: objectTypes[index % objectTypes.length],
      position: [pos.x, rng.range(-3, -1), pos.z] as [number, number, number],
      scale: rng.range(0.8, 1.2)
    }))
    
    // Generate decorative objects (rocks, coral, etc.)
    const decorativePositions = generatePositions(
      decorativeCount, 
      bounds, 
      1.0, // Smaller minimum distance for decorative items
      rng
    )
    
    const decorativeTypes = [
      'rock', 'smallRock', 'coral', 'seaweed', 'shell'
    ]
    
    const decorativeObjects = decorativePositions.map((pos, index) => ({
      id: `decorative-${index}`,
      type: rng.choice(decorativeTypes),
      position: [pos.x, rng.range(-4.5, -2), pos.z] as [number, number, number],
      scale: rng.range(0.5, 1.5),
      color: rng.choice([0x8d6e63, 0x5d4037, 0x3e2723, 0x6d4c41])
    }))
    
    if (import.meta.env.DEV) {
      console.info('[OBJECTS] Generated layout:', {
        mainObjects: mainObjects.length,
        decorativeObjects: decorativeObjects.length,
        safeMode,
        seed
      })
    }
    
    return { mainObjects, decorativeObjects }
  }, [seed, isMobile, lowPowerMode, safeMode])
  
  // StrictMode initialization guard
  useEffect(() => {
    if (initGuardRef.current) return
    initGuardRef.current = true
    
    if (import.meta.env.DEV) {
      console.info('[OBJECTS] ObjectsCluster initialized')
    }
  }, [])
  
  if (!objectsVisible) {
    return null
  }
  
  return (
    <group name="SafeObjectsCluster">
      {/* Main Interactive Objects with Safe GLTF Loading */}
      {objectLayout.mainObjects.map((obj) => {
        const commonProps = {
          key: obj.id,
          position: obj.position,
          scale: obj.scale,
          onHover: onObjectHover,
          onLeave: onObjectLeave
        }
        
        switch (obj.type) {
          case 'floatRing':
            return <SafeFloatRing {...commonProps} />
          case 'treasureChest':
            return <SafeTreasureChest {...commonProps} />
          case 'glassBottle':
            return <SafeGlassBottle {...commonProps} />
          default:
            return null
        }
      })}
      
      {/* Decorative Objects (Always Procedural) */}
      {!safeMode && objectLayout.decorativeObjects.map((obj) => (
        <DecorativeObject
          key={obj.id}
          type={obj.type}
          position={obj.position}
          scale={obj.scale}
          color={obj.color}
        />
      ))}
    </group>
  )
}

/**
 * Simple Decorative Object Component
 */
const DecorativeObject: React.FC<{
  type: string
  position: [number, number, number]
  scale: number
  color: number
}> = ({ type, position, scale, color }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position)
      meshRef.current.scale.setScalar(scale)
    }
  }, [position, scale])
  
  const getGeometry = () => {
    switch (type) {
      case 'rock':
        return <dodecahedronGeometry args={[1, 0]} />
      case 'smallRock':
        return <octahedronGeometry args={[0.5, 0]} />
      case 'coral':
        return <coneGeometry args={[0.5, 2, 6]} />
      case 'seaweed':
        return <cylinderGeometry args={[0.1, 0.3, 3, 8]} />
      case 'shell':
        return <sphereGeometry args={[0.8, 8, 6]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }
  
  return (
    <mesh ref={meshRef}>
      {getGeometry()}
      <meshLambertMaterial color={color} />
    </mesh>
  )
}

export default SafeObjectsCluster
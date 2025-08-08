import React, { useMemo } from 'react'
import { useAppState } from '../state/useAppState'
import FloatRing from './objects/FloatRing'
import TreasureChest from './objects/TreasureChest'
import GlassBottle from './objects/GlassBottle'

/**
 * Seeded Random Number Generator
 * Provides consistent random numbers based on seed
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
  
  range(min, max) {
    return min + (max - min) * this.next()
  }
  
  choice(array) {
    return array[Math.floor(this.next() * array.length)]
  }
}

/**
 * Distance calculation helper
 */
const distance2D = (a, b) => {
  const dx = a.x - b.x
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dz * dz)
}

/**
 * Generate non-overlapping positions using Poisson disk sampling
 */
const generatePositions = (count, bounds, minDistance, rng, maxAttempts = 30) => {
  const positions = []
  const { minX, maxX, minZ, maxZ } = bounds
  
  for (let i = 0; i < count; i++) {
    let attempts = 0
    let validPosition = null
    
    while (attempts < maxAttempts && !validPosition) {
      const candidate = {
        x: rng.range(minX, maxX),
        z: rng.range(minZ, maxZ)
      }
      
      // Check distance from all existing positions
      let valid = true
      for (const pos of positions) {
        if (distance2D(candidate, pos) < minDistance) {
          valid = false
          break
        }
      }
      
      if (valid) {
        validPosition = candidate
      }
      attempts++
    }
    
    // If we couldn't find a valid position, place it anyway (fallback)
    if (!validPosition) {
      validPosition = {
        x: rng.range(minX, maxX),
        z: rng.range(minZ, maxZ)
      }
    }
    
    positions.push(validPosition)
  }
  
  return positions
}

/**
 * Objects Cluster Component
 * Manages procedural placement of interactive objects
 */
const ObjectsCluster = ({ onObjectHover, onObjectLeave }) => {
  const { seed, objectsVisible, isMobile, lowPowerMode } = useAppState()
  
  // Generate object layout based on current seed
  const objectLayout = useMemo(() => {
    const rng = new SeededRandom(seed)
    
    // Adjust counts based on performance settings
    const mainObjectCount = lowPowerMode ? 2 : (isMobile ? 3 : 3)
    const decorativeCount = lowPowerMode ? 5 : (isMobile ? 8 : 15)
    
    const bounds = { minX: -8, maxX: 8, minZ: -8, maxZ: 8 }
    const minDistance = 2.0
    
    // Generate main interactive objects
    const mainPositions = generatePositions(mainObjectCount, bounds, minDistance, rng)
    const objectTypes = ['floatRing', 'treasureChest', 'glassBottle']
    
    const mainObjects = mainPositions.map((pos, index) => ({
      id: `main-${index}`,
      type: objectTypes[index % objectTypes.length],
      position: [pos.x, rng.range(-3, -1), pos.z],
      scale: rng.range(0.8, 1.2)
    }))
    
    // Generate decorative objects (rocks, coral, seaweed)
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
      position: [pos.x, rng.range(-4.5, -2), pos.z],
      scale: rng.range(0.3, 0.8),
      rotation: [0, rng.range(0, Math.PI * 2), 0],
      color: rng.choice([0x8d6e63, 0x5d4037, 0x3e2723, 0x6d4c41])
    }))
    
    return { mainObjects, decorativeObjects }
  }, [seed, isMobile, lowPowerMode])
  
  if (!objectsVisible) {
    return null
  }

  return (
    <group>
      {/* Main Interactive Objects */}
      {objectLayout.mainObjects.map((obj) => {
        const commonProps = {
          key: obj.id,
          position: obj.position,
          onHover: onObjectHover,
          onLeave: onObjectLeave
        }
        
        switch (obj.type) {
          case 'floatRing':
            return <FloatRing {...commonProps} />
          case 'treasureChest':
            return <TreasureChest {...commonProps} />
          case 'glassBottle':
            return <GlassBottle {...commonProps} />
          default:
            return null
        }
      })}
      
      {/* Decorative Objects */}
      {objectLayout.decorativeObjects.map((obj) => (
        <DecorativeObject key={obj.id} {...obj} />
      ))}
      
      {/* Ocean Floor */}
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial 
          color={0x1565c0}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}

/**
 * Decorative Object Component
 * Simple non-interactive objects for atmosphere
 */
const DecorativeObject = ({ type, position, scale, rotation, color }) => {
  const renderObject = () => {
    switch (type) {
      case 'rock':
        return (
          <mesh castShadow>
            <sphereGeometry args={[0.5, 8, 6]} />
            <meshLambertMaterial color={color} />
          </mesh>
        )
      case 'smallRock':
        return (
          <mesh castShadow>
            <dodecahedronGeometry args={[0.3]} />
            <meshLambertMaterial color={color} />
          </mesh>
        )
      case 'coral':
        return (
          <group>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 6, 4]} />
              <meshLambertMaterial color={0xff7043} />
            </mesh>
            <mesh position={[0.1, 0.3, 0.1]} castShadow>
              <sphereGeometry args={[0.15, 6, 4]} />
              <meshLambertMaterial color={0xff5722} />
            </mesh>
            <mesh position={[-0.15, 0.2, -0.05]} castShadow>
              <sphereGeometry args={[0.1, 6, 4]} />
              <meshLambertMaterial color={0xd84315} />
            </mesh>
          </group>
        )
      case 'seaweed':
        return (
          <mesh rotation={[0, 0, Math.PI / 12]} castShadow>
            <cylinderGeometry args={[0.02, 0.05, 1, 6]} />
            <meshLambertMaterial color={0x2e7d32} />
          </mesh>
        )
      case 'shell':
        return (
          <mesh castShadow>
            <coneGeometry args={[0.15, 0.08, 8]} />
            <meshLambertMaterial color={0xffd54f} />
          </mesh>
        )
      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshLambertMaterial color={color} />
          </mesh>
        )
    }
  }

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {renderObject()}
    </group>
  )
}

export default ObjectsCluster
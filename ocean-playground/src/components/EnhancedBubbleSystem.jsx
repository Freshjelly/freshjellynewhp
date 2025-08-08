import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAppState } from '../state/useAppState'
import * as THREE from 'three'

/**
 * Enhanced Bubble System with InstancedMesh
 * High-performance bubble system with realistic physics and interactions
 */
const EnhancedBubbleSystem = () => {
  const meshRef = useRef()
  const materialRef = useRef()
  const { camera } = useThree()
  
  const { 
    bubbleRate, 
    isMobile, 
    lowPowerMode,
    depth 
  } = useAppState()

  // Determine bubble count based on device capabilities
  const bubbleCount = useMemo(() => {
    if (lowPowerMode) return 30
    return isMobile ? 60 : 150
  }, [isMobile, lowPowerMode])

  // Bubble data arrays for instanced rendering
  const bubbleData = useMemo(() => {
    const positions = new Float32Array(bubbleCount * 3)
    const velocities = new Float32Array(bubbleCount * 3)
    const scales = new Float32Array(bubbleCount)
    const lifetimes = new Float32Array(bubbleCount)
    const phases = new Float32Array(bubbleCount) // For wave motion
    
    // Initialize each bubble
    for (let i = 0; i < bubbleCount; i++) {
      const i3 = i * 3
      
      // Random position on ocean floor
      positions[i3] = (Math.random() - 0.5) * 25     // x
      positions[i3 + 1] = -4 + Math.random() * 2     // y (ocean floor area)
      positions[i3 + 2] = (Math.random() - 0.5) * 25 // z
      
      // Random upward velocity with slight horizontal drift
      velocities[i3] = (Math.random() - 0.5) * 0.1     // x drift
      velocities[i3 + 1] = 0.5 + Math.random() * 1.0   // y upward
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1 // z drift
      
      // Random scale
      scales[i] = 0.03 + Math.random() * 0.07
      
      // Random lifetime/phase
      lifetimes[i] = Math.random() * 20
      phases[i] = Math.random() * Math.PI * 2
    }
    
    return { positions, velocities, scales, lifetimes, phases }
  }, [bubbleCount])

  // Create instanced mesh with bubble geometry
  const [geometry, material] = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 8, 6) // Low-poly for performance
    
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.4,
      transmission: 0.8,
      thickness: 0.1,
      ior: 1.33,
      roughness: 0.1,
      metalness: 0.0
    })
    
    return [geo, mat]
  }, [])

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime
    const deltaTime = state.clock.getDelta()
    const instanceMatrix = meshRef.current.instanceMatrix
    
    // Update each bubble instance
    for (let i = 0; i < bubbleCount; i++) {
      const i3 = i * 3
      
      // Current position
      let x = bubbleData.positions[i3]
      let y = bubbleData.positions[i3 + 1]
      let z = bubbleData.positions[i3 + 2]
      
      // Current velocity
      const vx = bubbleData.velocities[i3]
      const vy = bubbleData.velocities[i3 + 1] * bubbleRate
      const vz = bubbleData.velocities[i3 + 2]
      
      // Apply wave motion for realistic underwater movement
      const phase = bubbleData.phases[i]
      const waveX = Math.sin(time * 0.5 + phase) * 0.02
      const waveZ = Math.cos(time * 0.3 + phase + 1) * 0.02
      
      // Update position
      x += (vx + waveX) * deltaTime
      y += vy * deltaTime
      z += (vz + waveZ) * deltaTime
      
      // Reset bubble when it reaches surface or goes too far
      if (y > 10 || Math.abs(x) > 30 || Math.abs(z) > 30) {
        x = (Math.random() - 0.5) * 25
        y = -4 + Math.random() * 2
        z = (Math.random() - 0.5) * 25
        
        // Randomize velocity again
        bubbleData.velocities[i3] = (Math.random() - 0.5) * 0.1
        bubbleData.velocities[i3 + 1] = 0.5 + Math.random() * 1.0
        bubbleData.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1
      }
      
      // Store updated position
      bubbleData.positions[i3] = x
      bubbleData.positions[i3 + 1] = y
      bubbleData.positions[i3 + 2] = z
      
      // Update lifetime for opacity variation
      bubbleData.lifetimes[i] += deltaTime
      
      // Create transformation matrix for this instance
      const scale = bubbleData.scales[i] * (1 + Math.sin(bubbleData.lifetimes[i]) * 0.1)
      const matrix = new THREE.Matrix4()
      matrix.compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion(),
        new THREE.Vector3(scale, scale, scale)
      )
      
      // Set instance matrix
      meshRef.current.setMatrixAt(i, matrix)
    }
    
    // Mark instance matrix as needing update
    instanceMatrix.needsUpdate = true
    
    // Update material opacity based on depth
    if (materialRef.current) {
      materialRef.current.opacity = 0.3 + (depth * 0.2)
    }
  })

  // Burst effect on click
  useEffect(() => {
    const handleClick = (event) => {
      if (!meshRef.current) return
      
      // Find nearest object and create bubble burst
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      )
      
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)
      
      // Create a few extra bubbles near the click point
      const burstCount = Math.min(5, bubbleCount / 10)
      for (let i = 0; i < burstCount; i++) {
        const bubbleIndex = Math.floor(Math.random() * bubbleCount)
        const i3 = bubbleIndex * 3
        
        // Position near camera ray intersection
        const intersectionPoint = raycaster.ray.origin.clone()
        intersectionPoint.add(raycaster.ray.direction.clone().multiplyScalar(10))
        
        bubbleData.positions[i3] = intersectionPoint.x + (Math.random() - 0.5) * 2
        bubbleData.positions[i3 + 1] = intersectionPoint.y + (Math.random() - 0.5) * 2
        bubbleData.positions[i3 + 2] = intersectionPoint.z + (Math.random() - 0.5) * 2
        
        // Give burst bubbles extra upward velocity
        bubbleData.velocities[i3 + 1] = 2 + Math.random() * 2
      }
    }
    
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [camera, bubbleCount])

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, bubbleCount]}
      frustumCulled={false}
    >
      <primitive object={geometry} attach="geometry" />
      <primitive ref={materialRef} object={material} attach="material" />
    </instancedMesh>
  )
}

export default EnhancedBubbleSystem
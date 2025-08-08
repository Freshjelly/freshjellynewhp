import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SharkPatrolProps {
  count?: number
  patrolRadius?: number
  speed?: number
  jellyfishPositions?: THREE.Vector3[]
  playerPosition?: THREE.Vector3
}

/**
 * Procedural shark geometry (simplified)
 */
const createSharkGeometry = () => {
  const geometry = new THREE.BufferGeometry()
  
  // Simple shark-like shape using vertices
  const vertices = new Float32Array([
    // Body (elongated ellipsoid)
    0, 0, 3,     // nose
    -0.5, 0.5, 1,  // top left
    0.5, 0.5, 1,   // top right
    -0.5, -0.5, 1, // bottom left  
    0.5, -0.5, 1,  // bottom right
    -1, 0, -1,     // left mid
    1, 0, -1,      // right mid
    -0.5, 0.8, -1, // dorsal fin left
    0.5, 0.8, -1,  // dorsal fin right
    0, 0, -3,      // tail start
    0, 1, -4,      // tail top
    0, -0.5, -4    // tail bottom
  ])
  
  const indices = [
    // Body triangles
    0, 1, 2,  // nose top
    0, 3, 1,  // nose left
    0, 2, 4,  // nose right
    0, 4, 3,  // nose bottom
    1, 5, 6,  1, 6, 2,  // body top
    3, 4, 6,  3, 6, 5,  // body bottom
    1, 3, 5,  // left side
    2, 6, 4,  // right side
    // Dorsal fin
    5, 7, 8,  5, 8, 6,
    // Tail
    5, 9, 10, 5, 10, 7,
    6, 11, 9, 6, 9, 8,
    9, 10, 11
  ]
  
  geometry.setIndex(indices)
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  
  return geometry
}

/**
 * Individual shark instance data
 */
interface SharkInstance {
  position: THREE.Vector3
  targetPosition: THREE.Vector3
  velocity: THREE.Vector3
  pathProgress: number
  pathSpeed: number
  avoidanceVelocity: THREE.Vector3
  scale: number
}

export const SharkPatrol: React.FC<SharkPatrolProps> = ({
  count = 2,
  patrolRadius = 30,
  speed = 0.5,
  jellyfishPositions = [],
  playerPosition = new THREE.Vector3(0, 0, 10)
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const instancesRef = useRef<SharkInstance[]>([])
  const pathCurve = useRef<THREE.CatmullRomCurve3>()
  
  // Create patrol path (spline)
  const patrolPath = useMemo(() => {
    const points = []
    const numPoints = 8
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2
      const radius = patrolRadius + Math.sin(i * 0.5) * 5 // Vary radius
      const height = Math.sin(i * 0.3) * 8 - 5 // Vary height
      
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ))
    }
    
    // Close the loop
    points.push(points[0].clone())
    
    const curve = new THREE.CatmullRomCurve3(points, true)
    pathCurve.current = curve
    return curve
  }, [patrolRadius])
  
  // Shark geometry and material
  const sharkGeometry = useMemo(() => createSharkGeometry(), [])
  const sharkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a5568',
    metalness: 0.2,
    roughness: 0.8,
    emissive: '#1a1a2e',
    emissiveIntensity: 0.05
  }), [])
  
  // Initialize shark instances
  useEffect(() => {
    if (!groupRef.current || !patrolPath) return
    
    const instances: SharkInstance[] = []
    
    // Clear existing sharks
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0])
    }
    
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(sharkGeometry, sharkMaterial.clone())
      
      // Stagger sharks along the path
      const pathProgress = (i / count) + Math.random() * 0.1
      const position = patrolPath.getPointAt(pathProgress % 1)
      
      const instance: SharkInstance = {
        position: position.clone(),
        targetPosition: position.clone(),
        velocity: new THREE.Vector3(),
        pathProgress,
        pathSpeed: speed * (0.8 + Math.random() * 0.4), // Vary speed
        avoidanceVelocity: new THREE.Vector3(),
        scale: 0.8 + Math.random() * 0.4
      }
      
      instances.push(instance)
      
      mesh.position.copy(position)
      mesh.scale.setScalar(instance.scale)
      mesh.userData = { index: i }
      
      groupRef.current.add(mesh)
    }
    
    instancesRef.current = instances
  }, [count, patrolPath, sharkGeometry, sharkMaterial, speed])
  
  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current || !patrolPath) return
    
    const instances = instancesRef.current
    const avoidanceRadius = 8
    const jellyfishAvoidanceRadius = 12
    const playerAvoidanceRadius = 15
    
    instances.forEach((instance, index) => {
      const mesh = groupRef.current!.children[index] as THREE.Mesh
      
      // Update path progress
      instance.pathProgress += instance.pathSpeed * delta * 0.1
      if (instance.pathProgress > 1) instance.pathProgress -= 1
      
      // Get target position from spline
      const splinePoint = patrolPath.getPointAt(instance.pathProgress)
      const nextPoint = patrolPath.getPointAt((instance.pathProgress + 0.01) % 1)
      
      // Calculate forward direction for rotation
      const forward = nextPoint.clone().sub(splinePoint).normalize()
      
      // Reset avoidance velocity
      instance.avoidanceVelocity.set(0, 0, 0)
      
      // Jellyfish avoidance (simple boids-like behavior)
      jellyfishPositions.forEach(jellyfishPos => {
        const distance = instance.position.distanceTo(jellyfishPos)
        if (distance < jellyfishAvoidanceRadius) {
          const avoidDirection = instance.position.clone().sub(jellyfishPos).normalize()
          const strength = (jellyfishAvoidanceRadius - distance) / jellyfishAvoidanceRadius
          instance.avoidanceVelocity.add(avoidDirection.multiplyScalar(strength * 0.3))
        }
      })
      
      // Player avoidance
      const playerDistance = instance.position.distanceTo(playerPosition)
      if (playerDistance < playerAvoidanceRadius) {
        const avoidDirection = instance.position.clone().sub(playerPosition).normalize()
        const strength = (playerAvoidanceRadius - playerDistance) / playerAvoidanceRadius
        instance.avoidanceVelocity.add(avoidDirection.multiplyScalar(strength * 0.5))
        
        // Also move to different altitude
        instance.avoidanceVelocity.y += (Math.random() - 0.5) * strength * 0.3
      }
      
      // Combine spline following with avoidance
      instance.targetPosition.copy(splinePoint).add(instance.avoidanceVelocity)
      
      // Smooth movement towards target
      instance.velocity.add(
        instance.targetPosition.clone().sub(instance.position).multiplyScalar(2 * delta)
      )
      
      // Damping
      instance.velocity.multiplyScalar(0.95)
      
      // Apply movement
      instance.position.add(instance.velocity)
      
      // Update mesh
      mesh.position.copy(instance.position)
      
      // Rotate to face movement direction
      if (instance.velocity.length() > 0.01) {
        const lookDirection = forward.clone().add(instance.velocity.clone().normalize().multiplyScalar(0.3))
        mesh.lookAt(instance.position.clone().add(lookDirection))
      }
      
      // Add subtle swimming animation
      const swimOffset = Math.sin(state.clock.elapsedTime * 3 + index) * 0.1
      mesh.rotation.z = swimOffset
      mesh.position.y += Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * 0.2
    })
  })
  
  return (
    <group ref={groupRef}>
      {/* Optional: Debug path visualization (remove in production) */}
      {import.meta.env.DEV && (
        <mesh>
          <tubeGeometry args={[patrolPath, 100, 0.1, 8, false]} />
          <meshBasicMaterial color="red" opacity={0.3} transparent />
        </mesh>
      )}
    </group>
  )
}
import React, { Suspense, useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Fog, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useOceanStore } from '../../stores/oceanStore'

// Simple shark geometry as fallback
function SharkMesh({ position, scale = 1, speed = 1, pathRadius = 20 }: {
  position: [number, number, number]
  scale?: number
  speed?: number
  pathRadius?: number
}) {
  const meshRef = useRef<THREE.Group>(null)
  const timeRef = useRef(Math.random() * Math.PI * 2) // Randomize starting position
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    timeRef.current += delta * speed * 0.3
    
    // Circular patrol path with some vertical movement
    const x = Math.cos(timeRef.current) * pathRadius
    const z = Math.sin(timeRef.current) * pathRadius
    const y = Math.sin(timeRef.current * 0.5) * 2 // Gentle up/down movement
    
    meshRef.current.position.set(
      position[0] + x,
      position[1] + y,
      position[2] + z
    )
    
    // Face movement direction
    const direction = new THREE.Vector3(
      -Math.sin(timeRef.current),
      Math.cos(timeRef.current * 0.5) * 0.1,
      Math.cos(timeRef.current)
    )
    meshRef.current.lookAt(
      meshRef.current.position.x + direction.x,
      meshRef.current.position.y + direction.y,
      meshRef.current.position.z + direction.z
    )
  })
  
  return (
    <group ref={meshRef} scale={scale}>
      {/* Shark body - main ellipsoid */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial 
          color="#2c3e50"
          metalness={0.1}
          roughness={0.8}
        />
        <mesh position={[0, 0, -1.2]} scale={[0.6, 0.6, 1.5]}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshStandardMaterial 
            color="#34495e"
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      </mesh>
      
      {/* Dorsal fin */}
      <mesh position={[0, 0.8, -0.3]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 1.2, 3]} />
        <meshStandardMaterial 
          color="#1a252f"
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      
      {/* Pectoral fins */}
      <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <coneGeometry args={[0.15, 0.8, 3]} />
        <meshStandardMaterial 
          color="#1a252f"
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      
      <mesh position={[-0.6, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <coneGeometry args={[0.15, 0.8, 3]} />
        <meshStandardMaterial 
          color="#1a252f"
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      
      {/* Tail fin */}
      <mesh position={[0, 0.2, -2.5]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.4, 1, 4]} />
        <meshStandardMaterial 
          color="#1a252f"
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      
      <mesh position={[0, -0.3, -2.5]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 0.6, 4]} />
        <meshStandardMaterial 
          color="#1a252f"
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.3, 0.3, 0.8]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      <mesh position={[-0.3, 0.3, 0.8]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  )
}

// Ocean surface effect component
function OceanSurface() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime
    
    // Gentle wave motion
    meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.02
    meshRef.current.position.y = Math.sin(time * 0.3) * 0.5
  })
  
  const waterMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: '#006994',
      metalness: 0.7,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    }), []
  )
  
  return (
    <mesh
      ref={meshRef}
      position={[0, 8, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={waterMaterial}
    >
      <planeGeometry args={[100, 100, 32, 32]} />
    </mesh>
  )
}

// Ambient sea life particles
function SeaParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = useMemo(() => {
    const positions = new Float32Array(200 * 3)
    
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80
    }
    
    return positions
  }, [])
  
  useFrame((state) => {
    if (!particlesRef.current) return
    
    const time = state.clock.elapsedTime
    particlesRef.current.rotation.y = time * 0.01
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4fc3f7"
        size={0.05}
        transparent
        opacity={0.6}
      />
    </points>
  )
}

// Main shark scene component
function SharkScene() {
  const { sharkCount, reducedMotion } = useOceanStore()
  
  const sharks = useMemo(() => {
    if (reducedMotion) return []
    
    const sharkPositions: Array<{
      position: [number, number, number]
      scale: number
      speed: number
      pathRadius: number
    }> = []
    
    for (let i = 0; i < Math.min(sharkCount, 3); i++) {
      sharkPositions.push({
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20 - 5,
          (Math.random() - 0.5) * 40
        ],
        scale: 1.5 + Math.random() * 1,
        speed: 0.8 + Math.random() * 0.6,
        pathRadius: 15 + Math.random() * 10
      })
    }
    
    return sharkPositions
  }, [sharkCount, reducedMotion])
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.1} color="#001144" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.3}
        color="#4fc3f7"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Volumetric light effect */}
      <pointLight
        position={[0, 5, 0]}
        intensity={0.5}
        color="#87ceeb"
        distance={50}
        decay={2}
      />
      
      {/* Ocean surface */}
      <OceanSurface />
      
      {/* Sea particles for ambiance */}
      <SeaParticles />
      
      {/* Sharks */}
      {sharks.map((shark, index) => (
        <SharkMesh
          key={index}
          position={shark.position}
          scale={shark.scale}
          speed={shark.speed}
          pathRadius={shark.pathRadius}
        />
      ))}
      
      {/* Environment and fog */}
      <Environment preset="dawn" background={false} />
      <Fog attach="fog" args={['#001122', 1, 50]} />
    </>
  )
}

// Loading fallback
function SceneLoading() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#4fc3f7',
      fontSize: '1rem',
      fontWeight: '300',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '1rem' }}>🦈</div>
      <div>Loading Deep Sea...</div>
    </div>
  )
}

export const DeepSharkScene: React.FC = () => {
  const { reducedMotion, effectsEnabled } = useOceanStore()
  const [isVisible, setIsVisible] = React.useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Intersection Observer for performance
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Start loading before entering viewport
      }
    )
    
    observer.observe(container)
    
    return () => observer.disconnect()
  }, [])
  
  if (reducedMotion || !effectsEnabled) {
    return (
      <div 
        ref={containerRef}
        className="deep-sea-section"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #000080 0%, #000033 50%, #000011 100%)'
        }}
      >
        <div style={{ 
          textAlign: 'center', 
          color: '#4fc3f7',
          fontSize: '1.5rem',
          fontWeight: '300'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌊</div>
          <div>Deep Ocean Depths</div>
          <div style={{ 
            fontSize: '0.9rem', 
            opacity: 0.7, 
            marginTop: '0.5rem' 
          }}>
            Enable effects to see the sharks
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div ref={containerRef} className="deep-sea-section">
      {isVisible && (
        <Canvas
          camera={{
            position: [0, 0, 20],
            fov: 60,
            near: 0.1,
            far: 100
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
          }}
          shadows
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, #000080 0%, #000033 50%, #000011 100%)'
          }}
        >
          <Suspense fallback={<SceneLoading />}>
            <SharkScene />
          </Suspense>
        </Canvas>
      )}
      
      {!isVisible && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#4fc3f7',
          fontSize: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🦈</div>
          <div>Deep Sea Loading...</div>
        </div>
      )}
    </div>
  )
}
import React, { Suspense, useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Interactive Ocean Surface with movement
 */
function InteractiveOcean() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime()
      meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.1
      meshRef.current.position.y = Math.sin(time * 0.2) * 0.5
    }
  })
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[200, 200, 64, 64]} />
      <meshStandardMaterial
        color="#1e88e5"
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.8}
        wireframe={false}
      />
    </mesh>
  )
}

/**
 * Enhanced Bubble System with various sizes
 */
function EnhancedBubbles() {
  const bubblesRef = useRef<THREE.Group>(null)
  const bubbleCount = 50
  
  useFrame(({ clock }) => {
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((bubble, i) => {
        if (bubble instanceof THREE.Mesh) {
          bubble.position.y += 0.01 + (i % 3) * 0.005
          if (bubble.position.y > 20) {
            bubble.position.y = -20
          }
          bubble.rotation.x += 0.01
          bubble.rotation.y += 0.005
        }
      })
    }
  })
  
  return (
    <group ref={bubblesRef}>
      {Array.from({ length: bubbleCount }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 50,
            Math.random() * 40 - 20,
            (Math.random() - 0.5) * 50
          ]}
        >
          <sphereGeometry args={[0.1 + Math.random() * 0.3, 8, 8]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.4 + Math.random() * 0.4}
            roughness={0}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Interactive Objects (Treasure, Coral, etc.)
 */
function InteractiveObjects() {
  const objectsRef = useRef<THREE.Group>(null)
  
  const objects = [
    { type: 'treasure', position: [-10, -5, -8], color: '#ffd700', size: 1 },
    { type: 'coral', position: [15, -3, -12], color: '#ff6b6b', size: 0.8 },
    { type: 'bottle', position: [-5, 2, -15], color: '#4ecdc4', size: 0.6 },
    { type: 'shell', position: [8, -8, -5], color: '#f8c291', size: 0.7 }
  ]
  
  useFrame(({ clock }) => {
    if (objectsRef.current) {
      objectsRef.current.children.forEach((obj, i) => {
        if (obj instanceof THREE.Mesh) {
          obj.rotation.y = Math.sin(clock.getElapsedTime() + i) * 0.3
          obj.position.y += Math.sin(clock.getElapsedTime() * 2 + i) * 0.002
        }
      })
    }
  })
  
  return (
    <group ref={objectsRef}>
      {objects.map((obj, i) => (
        <mesh
          key={i}
          position={obj.position}
          scale={[obj.size, obj.size, obj.size]}
          onClick={() => console.log(`Clicked ${obj.type}!`)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={obj.color}
            metalness={0.3}
            roughness={0.7}
            emissive={obj.color}
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Underwater Particles
 */
function UnderwaterParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 200
  
  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001
      particlesRef.current.rotation.x += 0.0005
    }
  })
  
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100
  }
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4fc3f7"
        size={0.1}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

/**
 * Camera Controller with smooth movement
 */
function CameraController() {
  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime()
    camera.position.x = Math.sin(time * 0.1) * 2
    camera.position.z = Math.cos(time * 0.1) * 2 + 10
  })
  
  return null
}

/**
 * Enhanced Scene for Explore page
 */
export default function ExploreScene() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading Ocean...
      </div>
    )
  }
  
  return (
    <Canvas
      camera={{
        position: [0, 5, 10],
        fov: 60,
        near: 0.1,
        far: 1000
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        color="#87ceeb"
        castShadow
      />
      <pointLight
        position={[0, 10, 0]}
        intensity={0.8}
        color="#4fc3f7"
        distance={30}
      />
      
      {/* Camera Controls */}
      <CameraController />
      
      {/* Main Scene Elements */}
      <Suspense fallback={null}>
        <InteractiveOcean />
        <EnhancedBubbles />
        <InteractiveObjects />
        <UnderwaterParticles />
      </Suspense>
      
      {/* Fog for depth effect */}
      <fog attach="fog" args={['#191970', 10, 50]} />
    </Canvas>
  )
}
import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAppState } from '../../state/useAppState'
import * as THREE from 'three'
import gsap from 'gsap'
import { safePreloadGLTF, useSafeGLTF } from './safeLoadGLTF'

// GLTF Float Ring Component
const GLTFFloatRing: React.FC<{ position: [number, number, number], scale: number, onHover: any, onLeave: any }> = ({ 
  position, scale, onHover, onLeave 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const gltf = useSafeGLTF('/models/ring.glb', false)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2
      meshRef.current.rotation.y += 0.01
    }
  })
  
  if (!gltf) return null
  
  return (
    <primitive 
      ref={meshRef}
      object={gltf.scene}
      position={position}
      scale={[scale, scale, scale]}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover({
          nameEn: 'Swim Ring',
          nameJp: '浮き輪',
          descEn: 'A colorful swim ring drifting in the ocean currents.',
          descJp: '海流に漂うカラフルな浮き輪。'
        }, e.point)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onLeave()
      }}
    />
  )
}

// Procedural Float Ring (fallback)
const ProceduralFloatRing: React.FC<{ position: [number, number, number], scale: number, onHover: any, onLeave: any }> = ({ 
  position, scale, onHover, onLeave 
}) => {
  const ringRef = useRef<THREE.Mesh>(null)
  const { depth } = useAppState()
  
  // Create striped pattern material
  const ringMaterial = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    
    // Create rainbow stripes
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a55eea']
    const stripeWidth = canvas.width / colors.length
    
    colors.forEach((color, i) => {
      ctx.fillStyle = color
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height)
    })
    
    // Add highlight stripe
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(0, 0, canvas.width, canvas.height / 3)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
    
    return new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9
    })
  }, [])
  
  // Inner tube material
  const innerMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.8
    })
  }, [])
  
  useFrame((state) => {
    if (ringRef.current) {
      // Floating motion with ocean waves
      ringRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2
      ringRef.current.rotation.y += 0.005
      ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.1
    }
  })
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh
        ref={ringRef}
        material={ringMaterial}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (ringRef.current) {
            gsap.to(ringRef.current.scale, { duration: 0.3, x: 1.2, y: 1.2, z: 1.2 })
          }
          onHover({
            nameEn: 'Swim Ring',
            nameJp: '浮き輪',
            descEn: 'A colorful swim ring drifting in the ocean currents.',
            descJp: '海流に漂うカラフルな浮き輪。'
          }, e.point)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          if (ringRef.current) {
            gsap.to(ringRef.current.scale, { duration: 0.3, x: 1, y: 1, z: 1 })
          }
          onLeave()
        }}
      >
        <torusGeometry args={[2, 0.6, 8, 16]} />
      </mesh>
      
      {/* Inner tube detail */}
      <mesh material={innerMaterial}>
        <torusGeometry args={[2, 0.3, 8, 16]} />
      </mesh>
      
      {/* Safety rope */}
      <mesh material={innerMaterial} position={[0, 0, 0]}>
        <torusGeometry args={[2.4, 0.05, 4, 16]} />
      </mesh>
      
      {/* Valve */}
      <mesh material={innerMaterial} position={[2.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
      </mesh>
      
      {/* Surface reflection effect */}
      {depth < 0.3 && (
        <pointLight 
          color={0xffffff} 
          intensity={0.5 * (1 - depth)} 
          distance={5} 
          position={[0, 1, 0]} 
        />
      )}
      
      {/* Underwater glow effect */}
      {depth > 0.5 && (
        <pointLight 
          color={0x44aaff} 
          intensity={0.3 * depth} 
          distance={4} 
          position={[0, 0, 0]} 
        />
      )}
    </group>
  )
}

/**
 * Safe Float Ring - GLTF with Procedural Fallback
 */
const SafeFloatRing: React.FC<{ 
  position: [number, number, number]
  scale: number
  onHover: (object: any, position: any) => void
  onLeave: () => void
}> = ({ position, scale, onHover, onLeave }) => {
  const [useProcedural, setUseProcedural] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    const { safeMode } = useAppState.getState()
    
    if (safeMode) {
      setUseProcedural(true)
      setIsChecking(false)
      return
    }
    
    safePreloadGLTF('/models/ring.glb', 5000)
      .then((success) => {
        setUseProcedural(!success)
        setIsChecking(false)
      })
      .catch(() => {
        setUseProcedural(true)
        setIsChecking(false)
      })
  }, [])
  
  if (isChecking) {
    return null
  }
  
  return useProcedural ? (
    <ProceduralFloatRing 
      position={position} 
      scale={scale} 
      onHover={onHover} 
      onLeave={onLeave} 
    />
  ) : (
    <GLTFFloatRing 
      position={position} 
      scale={scale} 
      onHover={onHover} 
      onLeave={onLeave} 
    />
  )
}

export default SafeFloatRing
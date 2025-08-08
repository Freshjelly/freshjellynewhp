import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useAppState } from '../../state/useAppState'
import * as THREE from 'three'
import gsap from 'gsap'
import { safePreloadGLTF, useSafeGLTF } from './safeLoadGLTF'

// GLTF Glass Bottle Component (tries to load GLTF first)
const GLTFGlassBottle: React.FC<{ position: [number, number, number], scale: number, onHover: any, onLeave: any }> = ({ 
  position, scale, onHover, onLeave 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const gltf = useSafeGLTF('/models/bottle.glb', false) // Don't auto-fallback to Safe Mode
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.rotation.y += 0.005
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
          nameEn: 'Message in a Bottle',
          nameJp: 'ボトルメッセージ',
          descEn: 'An old glass bottle containing a mysterious message from the depths.',
          descJp: '海の深淵からの神秘的なメッセージが入った古いガラス瓶。'
        }, e.point)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onLeave()
      }}
    />
  )
}

// Procedural Glass Bottle (fallback implementation)
const ProceduralGlassBottle: React.FC<{ position: [number, number, number], scale: number, onHover: any, onLeave: any }> = ({ 
  position, scale, onHover, onLeave 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const messageRef = useRef<THREE.Mesh>(null)
  const { depth } = useAppState()
  
  // Glass material with realistic refraction
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0xaaffaa,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.9,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      ior: 1.5,
      thickness: 0.01,
    })
  }, [])
  
  // Message paper material
  const paperMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: 0xf5f5dc,
      transparent: true,
      opacity: 0.9
    })
  }, [])
  
  // Cork material
  const corkMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: 0x8b4513,
      roughness: 0.8
    })
  }, [])
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating with ocean current effect
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.15
      meshRef.current.rotation.y += 0.003
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.05
    }
    
    if (messageRef.current) {
      // Message slightly moves inside bottle
      messageRef.current.rotation.y += 0.001
    }
  })
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Bottle Body */}
      <mesh
        ref={meshRef}
        material={glassMaterial}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (meshRef.current) {
            gsap.to(meshRef.current.scale, { duration: 0.3, x: 1.1, y: 1.1, z: 1.1 })
          }
          onHover({
            nameEn: 'Message in a Bottle',
            nameJp: 'ボトルメッセージ',
            descEn: 'An old glass bottle containing a mysterious message from the depths.',
            descJp: '海の深淵からの神秘的なメッセージが入った古いガラス瓶。'
          }, e.point)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          if (meshRef.current) {
            gsap.to(meshRef.current.scale, { duration: 0.3, x: 1, y: 1, z: 1 })
          }
          onLeave()
        }}
      >
        <cylinderGeometry args={[0.8, 1.2, 4, 16]} />
      </mesh>
      
      {/* Bottle Neck */}
      <mesh material={glassMaterial} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 1, 12]} />
      </mesh>
      
      {/* Cork */}
      <mesh material={corkMaterial} position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.6, 12]} />
      </mesh>
      
      {/* Message Paper Inside */}
      <mesh 
        ref={messageRef}
        material={paperMaterial} 
        position={[0, -0.5, 0]}
        rotation={[0.2, 0.3, 0.1]}
      >
        <planeGeometry args={[1.5, 2]} />
      </mesh>
      
      {/* Message Text (visible when close) */}
      <mesh material={paperMaterial} position={[0, 0.3, 0]} rotation={[0.1, -0.2, 0]}>
        <planeGeometry args={[1.2, 0.8]} />
      </mesh>
      
      {/* Depth-based glow effect */}
      {depth > 0.5 && (
        <pointLight 
          color={0x66ccff} 
          intensity={0.3 * depth} 
          distance={5} 
          position={[0, 0, 0]} 
        />
      )}
    </group>
  )
}

/**
 * Safe Glass Bottle - GLTF with Procedural Fallback
 * Tries GLTF first, falls back to procedural if loading fails
 */
const SafeGlassBottle: React.FC<{ 
  position: [number, number, number]
  scale: number
  onHover: (object: any, position: any) => void
  onLeave: () => void
}> = ({ position, scale, onHover, onLeave }) => {
  const [useProcedural, setUseProcedural] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // Check if we should use procedural (Safe Mode or GLTF load failure)
    const { safeMode } = useAppState.getState()
    
    if (safeMode) {
      setUseProcedural(true)
      setIsChecking(false)
      return
    }
    
    // Try to preload GLTF
    safePreloadGLTF('/models/bottle.glb', 5000)
      .then((success) => {
        setUseProcedural(!success)
        setIsChecking(false)
      })
      .catch(() => {
        setUseProcedural(true)
        setIsChecking(false)
      })
  }, [])
  
  // Show nothing while checking
  if (isChecking) {
    return null
  }
  
  // Return appropriate component
  return useProcedural ? (
    <ProceduralGlassBottle 
      position={position} 
      scale={scale} 
      onHover={onHover} 
      onLeave={onLeave} 
    />
  ) : (
    <GLTFGlassBottle 
      position={position} 
      scale={scale} 
      onHover={onHover} 
      onLeave={onLeave} 
    />
  )
}

export default SafeGlassBottle
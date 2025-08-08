import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAppState } from '../../state/useAppState'
import * as THREE from 'three'
import gsap from 'gsap'
import { safePreloadGLTF, useSafeGLTF } from './safeLoadGLTF'

// GLTF Treasure Chest Component
const GLTFTreasureChest: React.FC<{ position: [number, number, number], scale: number, onHover: any, onLeave: any }> = ({ 
  position, scale, onHover, onLeave 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const gltf = useSafeGLTF('/models/chest.glb', false)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.05
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
          nameEn: 'Sunken Treasure Chest',
          nameJp: '沈没した宝箱',
          descEn: 'An ancient chest filled with mysterious treasures from a lost civilization.',
          descJp: '失われた文明の神秘的な宝物で満たされた古代の宝箱。'
        }, e.point)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onLeave()
      }}
    />
  )
}

// Procedural Treasure Chest (fallback)
const ProceduralTreasureChest: React.FC<{ position: [number, number, number], scale: number, onHover: any, onLeave: any }> = ({ 
  position, scale, onHover, onLeave 
}) => {
  const chestRef = useRef<THREE.Group>(null)
  const lidRef = useRef<THREE.Mesh>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { depth } = useAppState()
  
  // Wood material for chest body
  const woodMaterial = useMemo(() => {
    const texture = new THREE.CanvasTexture(createWoodTexture())
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 1)
    
    return new THREE.MeshLambertMaterial({
      map: texture,
      color: 0x8b4513
    })
  }, [])
  
  // Metal material for hardware
  const metalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2
    })
  }, [])
  
  // Gold material for treasure
  const goldMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 1,
      roughness: 0.1,
      emissive: 0x221100,
      emissiveIntensity: 0.1
    })
  }, [])
  
  // Create wood texture
  function createWoodTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    
    // Wood grain pattern
    const gradient = ctx.createLinearGradient(0, 0, 0, 128)
    gradient.addColorStop(0, '#8B4513')
    gradient.addColorStop(0.3, '#A0522D')
    gradient.addColorStop(0.6, '#8B4513')
    gradient.addColorStop(1, '#654321')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 128)
    
    // Add wood lines
    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(0, 20 + i * 20)
      ctx.lineTo(256, 25 + i * 20)
      ctx.stroke()
    }
    
    return canvas
  }
  
  useFrame((state) => {
    if (chestRef.current) {
      // Gentle floating with slight rotation
      chestRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.08
      chestRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.02
    }
  })
  
  const handleInteraction = (e: any, isHover: boolean) => {
    e.stopPropagation()
    
    if (isHover) {
      // Scale up on hover
      if (chestRef.current) {
        gsap.to(chestRef.current.scale, { duration: 0.3, x: 1.1, y: 1.1, z: 1.1 })
      }
      
      // Open chest slightly
      if (lidRef.current && !isOpen) {
        gsap.to(lidRef.current.rotation, { duration: 0.5, x: -0.3 })
        setIsOpen(true)
      }
      
      onHover({
        nameEn: 'Sunken Treasure Chest',
        nameJp: '沈没した宝箱',
        descEn: 'An ancient chest filled with mysterious treasures from a lost civilization.',
        descJp: '失われた文明の神秘的な宝物で満たされた古代の宝箱。'
      }, e.point)
    } else {
      // Scale back down
      if (chestRef.current) {
        gsap.to(chestRef.current.scale, { duration: 0.3, x: 1, y: 1, z: 1 })
      }
      
      // Close chest
      if (lidRef.current && isOpen) {
        gsap.to(lidRef.current.rotation, { duration: 0.5, x: 0 })
        setIsOpen(false)
      }
      
      onLeave()
    }
  }
  
  return (
    <group 
      ref={chestRef} 
      position={position} 
      scale={[scale, scale, scale]}
      onPointerOver={(e) => handleInteraction(e, true)}
      onPointerOut={(e) => handleInteraction(e, false)}
    >
      {/* Chest Body */}
      <mesh material={woodMaterial} position={[0, 0, 0]}>
        <boxGeometry args={[3, 1.5, 2]} />
      </mesh>
      
      {/* Chest Lid */}
      <mesh 
        ref={lidRef}
        material={woodMaterial} 
        position={[0, 0.75, -1]}
      >
        <boxGeometry args={[3, 0.3, 2]} />
      </mesh>
      
      {/* Metal Corners */}
      {[[-1.4, 0, -0.9], [1.4, 0, -0.9], [-1.4, 0, 0.9], [1.4, 0, 0.9]].map((pos, i) => (
        <mesh key={i} material={metalMaterial} position={pos as [number, number, number]}>
          <boxGeometry args={[0.2, 1.8, 0.2]} />
        </mesh>
      ))}
      
      {/* Lock */}
      <mesh material={metalMaterial} position={[0, 0.2, 1.1]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 8]} />
      </mesh>
      
      {/* Treasure inside (visible when open) */}
      {isOpen && (
        <>
          <mesh material={goldMaterial} position={[-0.5, -0.3, 0]}>
            <sphereGeometry args={[0.2, 8, 6]} />
          </mesh>
          <mesh material={goldMaterial} position={[0.3, -0.4, 0.2]}>
            <boxGeometry args={[0.3, 0.2, 0.3]} />
          </mesh>
          <mesh material={goldMaterial} position={[0, -0.2, -0.3]}>
            <coneGeometry args={[0.15, 0.4, 6]} />
          </mesh>
        </>
      )}
      
      {/* Magical glow when deep underwater */}
      {depth > 0.6 && (
        <pointLight 
          color={0xffd700} 
          intensity={0.8 * depth} 
          distance={8} 
          position={[0, 1, 0]} 
        />
      )}
      
      {/* Particle effect when open and deep */}
      {isOpen && depth > 0.4 && (
        <pointLight 
          color={0x66ffff} 
          intensity={0.5} 
          distance={3} 
          position={[0, 0.5, 0]} 
        />
      )}
    </group>
  )
}

/**
 * Safe Treasure Chest - GLTF with Procedural Fallback
 */
const SafeTreasureChest: React.FC<{ 
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
    
    safePreloadGLTF('/models/chest.glb', 5000)
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
    <ProceduralTreasureChest 
      position={position} 
      scale={scale} 
      onHover={onHover} 
      onLeave={onLeave} 
    />
  ) : (
    <GLTFTreasureChest 
      position={position} 
      scale={scale} 
      onHover={onHover} 
      onLeave={onLeave} 
    />
  )
}

export default SafeTreasureChest
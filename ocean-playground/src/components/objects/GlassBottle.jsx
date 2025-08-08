import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useAppState } from '../../state/useAppState'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * Procedural Glass Bottle with Message
 * A realistic glass bottle with refractive properties and internal message
 */
const GlassBottle = ({ position, onHover, onLeave }) => {
  const groupRef = useRef()
  const bottleRef = useRef()
  const messageRef = useRef()
  const bubbleRef = useRef()
  const htmlRef = useRef()
  const baseY = position[1]
  
  const { depth } = useAppState()

  // Create bottle shape using LatheGeometry
  const bottleGeometry = useMemo(() => {
    const points = []
    // Define bottle profile points (x, y)
    const profile = [
      [0, 0],      // bottom center
      [0.3, 0],    // bottom edge
      [0.35, 0.1], // bottom curve
      [0.35, 1.0], // body
      [0.32, 1.1], // neck start
      [0.15, 1.1], // neck
      [0.15, 1.4], // neck top
      [0.18, 1.45], // lip
      [0.15, 1.5], // mouth
      [0, 1.5]     // center top
    ]
    
    profile.forEach(([x, y]) => {
      points.push(new THREE.Vector2(x, y))
    })
    
    return new THREE.LatheGeometry(points, 16)
  }, [])

  // Glass material with realistic refraction
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      transmission: 1,
      thickness: 0.3,
      ior: 1.5,
      roughness: 0.1,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    })
  }, [])

  // Message paper material
  const paperMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: 0xf5f5dc, // Beige paper color
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })
  }, [])

  // Bubble material
  const bubbleMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
      transmission: 0.9,
      thickness: 0.1,
      ior: 1.33
    })
  }, [])

  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      
      // Gentle floating motion
      groupRef.current.position.y = baseY + Math.sin(time * 0.7) * 0.12
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.08
      
      // Animate internal message (slight rotation)
      if (messageRef.current) {
        messageRef.current.rotation.y = Math.sin(time * 0.3) * 0.2
      }
      
      // Animate bubble inside bottle
      if (bubbleRef.current) {
        const bubbleTime = time * 1.5
        bubbleRef.current.position.y = 0.3 + Math.sin(bubbleTime) * 0.4
        bubbleRef.current.position.x = Math.sin(bubbleTime * 0.7) * 0.1
        
        // Reset bubble position when it reaches top
        if (bubbleRef.current.position.y > 1.2) {
          bubbleRef.current.position.y = 0.1
        }
      }
    }
  })

  const handlePointerOver = (event) => {
    event.stopPropagation()
    onHover?.({
      title: 'Glass Bottle',
      titleJp: 'ガラス瓶',
      description: 'A glass bottle with a faint note inside, blurred by the sea. The message is unreadable now.',
      descriptionJp: '中にかすかな手紙が入ったガラス瓶。海に溶けて、もう文字は読めない。'
    }, event.point)
    
    // Animate scale and add shimmer effect
    gsap.to(groupRef.current.scale, {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const handlePointerOut = () => {
    onLeave?.()
    
    gsap.to(groupRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Main bottle */}
      <mesh
        ref={bottleRef}
        geometry={bottleGeometry}
        material={glassMaterial}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      />

      {/* Cork/stopper */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.2, 8]} />
        <meshLambertMaterial color={0x8b4513} />
      </mesh>

      {/* Message inside bottle */}
      <mesh
        ref={messageRef}
        position={[0, 0.6, 0]}
        rotation={[0, 0, Math.PI / 6]}
      >
        <planeGeometry args={[0.4, 0.3]} />
        <primitive object={paperMaterial} attach="material" />
      </mesh>

      {/* Faded text on message (using a simple texture approach) */}
      <mesh
        position={[0, 0.65, 0.01]}
        rotation={[0, 0, Math.PI / 6]}
      >
        <planeGeometry args={[0.35, 0.25]} />
        <meshBasicMaterial
          color={0x666666}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Animated bubble inside */}
      <mesh
        ref={bubbleRef}
        position={[0.1, 0.3, 0]}
        material={bubbleMaterial}
      >
        <sphereGeometry args={[0.03, 8, 6]} />
      </mesh>

      {/* Seaweed wrapped around base */}
      <mesh position={[0.2, 0.1, 0.2]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.01, 0.02, 0.4, 6]} />
        <meshLambertMaterial color={0x2e7d32} />
      </mesh>
      
      {/* Proximity label - only show when underwater */}
      {depth >= 0.25 && (
        <Html
          ref={htmlRef}
          position={[0, 2, 0]}
          center
          distanceFactor={10}
          occlude
          pointerEvents="none"
          style={{
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none'
          }}
        >
          <div className="object-label" style={{ 
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.8rem',
            maxWidth: '200px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Message Bottle</h4>
            <p style={{ margin: 0, opacity: 0.8 }}>ガラス瓶 - Lost words in the tide</p>
          </div>
        </Html>
      )}
    </group>
  )
}

export default GlassBottle
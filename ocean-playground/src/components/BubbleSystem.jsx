import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * Individual Bubble Component
 */
const Bubble = ({ position, scale, speed, delay }) => {
  const bubbleRef = useRef()
  const initialY = position[1]
  
  useFrame((state) => {
    if (bubbleRef.current) {
      // Floating animation
      const time = state.clock.elapsedTime + delay
      const floatY = initialY + Math.sin(time * speed) * 0.5 + time * 0.1
      const floatX = position[0] + Math.sin(time * 0.7) * 0.3
      const floatZ = position[2] + Math.cos(time * 0.5) * 0.2
      
      bubbleRef.current.position.set(floatX, floatY, floatZ)
      
      // Reset bubble when it reaches the surface
      if (floatY > 15) {
        bubbleRef.current.position.y = initialY - 20
      }
      
      // Subtle rotation
      bubbleRef.current.rotation.x = time * 0.2
      bubbleRef.current.rotation.y = time * 0.3
    }
  })

  return (
    <mesh ref={bubbleRef} position={position} scale={scale}>
      <sphereGeometry args={[0.1, 8, 6]} />
      <meshPhysicalMaterial
        color={0x87ceeb}
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.1}
        transmission={0.9}
        thickness={0.1}
      />
    </mesh>
  )
}

/**
 * Bubble System Component
 * Creates and manages multiple floating bubbles
 */
const BubbleSystem = ({ count = 30 }) => {
  const bubbles = useMemo(() => {
    const bubbleArray = []
    
    for (let i = 0; i < count; i++) {
      bubbleArray.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 40, // x: spread across ocean floor
          Math.random() * -10 - 5,    // y: start from ocean floor
          (Math.random() - 0.5) * 40  // z: spread across ocean floor
        ],
        scale: Math.random() * 0.5 + 0.3, // Random size
        speed: Math.random() * 0.5 + 0.5,  // Random float speed
        delay: Math.random() * 10           // Random start delay
      })
    }
    
    return bubbleArray
  }, [count])

  return (
    <group>
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          position={bubble.position}
          scale={bubble.scale}
          speed={bubble.speed}
          delay={bubble.delay}
        />
      ))}
      
      {/* Particle System for smaller bubbles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={Math.floor(count / 2)}
            array={new Float32Array(
              Array.from({ length: Math.floor(count / 2) * 3 }, () => 
                (Math.random() - 0.5) * 50
              )
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={0x87ceeb}
          transparent
          opacity={0.4}
          sizeAttenuation={true}
        />
      </points>
    </group>
  )
}

export default BubbleSystem
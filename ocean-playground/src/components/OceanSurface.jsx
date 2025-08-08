import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Water } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Ocean Surface Component
 * Creates animated water surface with realistic wave effects
 */
const OceanSurface = ({ isMobile }) => {
  const waterRef = useRef()
  
  // Water configuration
  const waterConfig = useMemo(() => ({
    textureWidth: isMobile ? 256 : 512,
    textureHeight: isMobile ? 256 : 512,
    waterNormals: new THREE.TextureLoader().load(
      'https://threejs.org/examples/textures/waternormals.jpg',
      (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      }
    ),
    alpha: 0.8,
    sunDirection: new THREE.Vector3(0.7, 0.7, 0),
    sunColor: 0x87ceeb,
    waterColor: 0x006994,
    distortionScale: isMobile ? 10 : 20,
    fog: true
  }), [isMobile])

  // Animation loop for water
  useFrame((state) => {
    if (waterRef.current) {
      const water = waterRef.current
      if (water.material && water.material.uniforms) {
        water.material.uniforms.time.value = state.clock.elapsedTime * 0.5
      }
    }
  })

  return (
    <group>
      {/* Main Water Surface */}
      <Water
        ref={waterRef}
        args={[new THREE.PlaneGeometry(100, 100, 1, 1)]}
        position={[0, 8, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        {...waterConfig}
      />
      
      {/* Additional translucent water layers for depth */}
      <mesh position={[0, 6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshPhysicalMaterial
          color={0x4fc3f7}
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>
      
      <mesh position={[0, 4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshPhysicalMaterial
          color={0x29b6f6}
          transparent
          opacity={0.2}
          roughness={0.2}
          metalness={0.1}
          transmission={0.8}
          thickness={0.3}
        />
      </mesh>
    </group>
  )
}

export default OceanSurface
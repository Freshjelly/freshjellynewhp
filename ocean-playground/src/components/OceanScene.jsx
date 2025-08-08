import React, { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

/**
 * Main Ocean Scene Component
 * Handles lighting, fog, and camera intro animation
 */
const OceanScene = ({ onLoaded, isMobile }) => {
  const { camera, scene } = useThree()
  const lightRef = useRef()
  const ambientRef = useRef()
  
  useEffect(() => {
    // Set up ocean fog for depth
    scene.fog = new THREE.Fog(0x006994, 10, 100)
    
    // Set camera initial position for intro animation
    camera.position.set(0, 50, 20)
    camera.lookAt(0, 0, 0)
    
    // Camera intro animation - diving into the ocean
    const tl = gsap.timeline({
      onComplete: () => {
        onLoaded(true)
      }
    })
    
    tl.to(camera.position, {
      duration: 3,
      y: 8,
      z: 12,
      ease: "power2.inOut"
    })
    .to(camera.rotation, {
      duration: 3,
      x: -0.3,
      ease: "power2.inOut"
    }, 0)

    // Animate sunlight intensity
    if (lightRef.current) {
      gsap.fromTo(lightRef.current, 
        { intensity: 0 },
        { intensity: isMobile ? 1 : 1.5, duration: 2, delay: 1 }
      )
    }

    return () => {
      tl.kill()
    }
  }, [camera, scene, onLoaded, isMobile])

  return (
    <>
      {/* Ambient Ocean Light */}
      <ambientLight 
        ref={ambientRef}
        intensity={isMobile ? 0.3 : 0.4} 
        color={0x4fc3f7} 
      />
      
      {/* Main Directional Light (Sun through water) */}
      <directionalLight
        ref={lightRef}
        position={[10, 20, 5]}
        intensity={isMobile ? 1 : 1.5}
        color={0x87ceeb}
        castShadow={!isMobile} // Disable shadows on mobile for performance
        shadow-mapSize-width={isMobile ? 512 : 2048}
        shadow-mapSize-height={isMobile ? 512 : 2048}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Volumetric Light Effect */}
      <pointLight 
        position={[0, 15, -10]} 
        intensity={isMobile ? 0.3 : 0.5}
        color={0xffffff}
        distance={30}
        decay={2}
      />

      {/* Additional fill lights for underwater ambience */}
      <pointLight 
        position={[-15, 5, -15]} 
        intensity={0.2}
        color={0x29b6f6}
        distance={25}
      />
      
      <pointLight 
        position={[15, 5, 15]} 
        intensity={0.2}
        color={0x4fc3f7}
        distance={25}
      />

      {/* Ocean Floor Light */}
      <spotLight
        position={[0, 10, 0]}
        target-position={[0, -5, 0]}
        intensity={isMobile ? 0.3 : 0.5}
        angle={Math.PI / 3}
        penumbra={0.5}
        color={0x81d4fa}
        castShadow={!isMobile}
      />
    </>
  )
}

export default OceanScene
import React, { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useAppState } from '../state/useAppState'
import gsap from 'gsap'

/**
 * Dive Animation System
 * Controls camera movement from surface to underwater with smooth transitions
 */
const DiveSystem = () => {
  const { camera, scene } = useThree()
  const timelineRef = useRef()
  const isInitialized = useRef(false)
  
  const {
    depth,
    isDiving,
    prefersReducedMotion,
    isBooting,
    setDepth,
    setDiving,
    setCanResurface,
    setWelcomeMessageShown
  } = useAppState()

  // Initialize camera position
  useEffect(() => {
    if (!isInitialized.current) {
      // Set initial camera position (above water)
      camera.position.set(0, 6.5, 9)
      camera.lookAt(0, 0, 0)
      camera.fov = 45
      camera.updateProjectionMatrix()
      isInitialized.current = true
    }
  }, [camera])

  // Create dive animation timeline
  useEffect(() => {
    // Only start dive animation when boot is complete
    if (!isDiving || isBooting) return

    const duration = prefersReducedMotion ? 1.2 : 3.2
    
    // Kill existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    // Create new timeline
    const tl = gsap.timeline({
      ease: "power2.inOut",
      onUpdate: () => {
        // Update depth based on camera Y position
        const currentY = camera.position.y
        const normalizedDepth = Math.max(0, Math.min(1, (6.5 - currentY) / 7.8))
        setDepth(normalizedDepth)
      },
      onComplete: () => {
        setDiving(false)
        setCanResurface(true)
        
        // Show welcome message if deep enough
        if (depth > 0.6) {
          setWelcomeMessageShown(true)
          setTimeout(() => setWelcomeMessageShown(false), 2000)
        }
      }
    })

    // Camera Y position keyframes: 6.5 → 2.8 → 1.9 → 0.2 → -1.3
    tl.to(camera.position, {
      y: 2.8, // Above water surface
      duration: duration * 0.3
    })
    .to(camera.position, {
      y: 1.9, // Just about to break surface
      duration: duration * 0.2
    })
    .to(camera.position, {
      y: 0.2, // Just underwater
      duration: duration * 0.2
    })
    .to(camera.position, {
      y: -1.3, // Deep underwater
      duration: duration * 0.3
    })

    // FOV animation
    tl.to(camera, {
      fov: 55,
      duration: duration,
      onUpdate: () => {
        camera.updateProjectionMatrix()
      }
    }, 0)

    timelineRef.current = tl

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [isDiving, prefersReducedMotion, camera, setDepth, setDiving, setCanResurface, setWelcomeMessageShown])

  // Surface animation (reverse of dive)
  const surface = () => {
    const duration = prefersReducedMotion ? 1.2 : 3.2
    
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    const tl = gsap.timeline({
      ease: "power2.inOut",
      onUpdate: () => {
        const currentY = camera.position.y
        const normalizedDepth = Math.max(0, Math.min(1, (6.5 - currentY) / 7.8))
        setDepth(normalizedDepth)
      },
      onComplete: () => {
        setDiving(false)
        setCanResurface(false)
      }
    })

    // Reverse the dive animation
    tl.to(camera.position, {
      y: 6.5,
      duration: duration
    })

    tl.to(camera, {
      fov: 45,
      duration: duration,
      onUpdate: () => {
        camera.updateProjectionMatrix()
      }
    }, 0)

    timelineRef.current = tl
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.info('[DIVE] Animation started', { 
        duration, 
        prefersReducedMotion,
        bootComplete: !isBooting
      })
    }
  }

  // Expose surface function globally
  useEffect(() => {
    window.oceanPlayground = { surface }
  }, [])

  // Handle scroll to dive
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isDiving && depth < 0.1) {
        useAppState.getState().handleFirstScroll()
      }
    }

    window.addEventListener('wheel', handleWheel, { once: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isDiving, depth])

  // Update scene fog based on depth
  useFrame(() => {
    if (scene.fog) {
      const fogDensity = useAppState.getState().fogDensity
      scene.fog.density = fogDensity
      
      // Update fog color based on depth (lighter blue to darker blue)
      const lightColor = 0x87ceeb // Light blue
      const darkColor = 0x1e3a8a  // Dark blue
      
      const r1 = (lightColor >> 16) & 255
      const g1 = (lightColor >> 8) & 255
      const b1 = lightColor & 255
      
      const r2 = (darkColor >> 16) & 255
      const g2 = (darkColor >> 8) & 255
      const b2 = darkColor & 255
      
      const r = Math.floor(r1 + (r2 - r1) * depth)
      const g = Math.floor(g1 + (g2 - g1) * depth)
      const b = Math.floor(b1 + (b2 - b1) * depth)
      
      scene.fog.color.setRGB(r / 255, g / 255, b / 255)
    }
  })

  return null // This component doesn't render anything visible
}

export default DiveSystem
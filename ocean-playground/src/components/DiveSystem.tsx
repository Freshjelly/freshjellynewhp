import React, { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useAppState } from '../state/useAppState'
import gsap from 'gsap'

/**
 * Enhanced Dive Animation System with StrictMode Protection
 * Controls camera movement from surface to underwater with smooth transitions
 * Includes initialization guards to prevent double execution in React StrictMode
 */
const DiveSystem: React.FC = () => {
  const { camera, scene } = useThree()
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const isInitializedRef = useRef<boolean>(false)
  const strictModeGuardRef = useRef<boolean>(false)
  
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

  // StrictMode-safe initialization guard
  useEffect(() => {
    if (strictModeGuardRef.current) {
      if (import.meta.env.DEV) {
        console.warn('[DIVE] StrictMode double initialization prevented')
      }
      return
    }
    strictModeGuardRef.current = true
    
    // Initialize camera position only once
    if (!isInitializedRef.current) {
      camera.position.set(0, 6.5, 9)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
      isInitializedRef.current = true
      
      if (import.meta.env.DEV) {
        console.info('[DIVE] Camera initialized to surface position')
      }
    }
    
    return () => {
      // Cleanup timeline on unmount
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
    }
  }, [camera])

  // Create dive animation timeline with boot dependency and StrictMode protection
  useEffect(() => {
    // Only start dive animation when boot is complete and not already diving
    if (!isDiving || isBooting) return
    
    // Prevent double timeline creation in StrictMode
    if (timelineRef.current) {
      if (import.meta.env.DEV) {
        console.warn('[DIVE] Timeline already exists, skipping creation')
      }
      return
    }

    const duration = prefersReducedMotion ? 1.2 : 3.2
    
    if (import.meta.env.DEV) {
      console.info('[DIVE] Starting dive animation', { 
        duration, 
        prefersReducedMotion,
        bootComplete: !isBooting,
        cameraY: camera.position.y
      })
    }

    // Create new GSAP timeline with proper cleanup
    const tl = gsap.timeline({
      ease: \"power2.inOut\",
      onUpdate: () => {
        // Update depth based on camera Y position
        const currentY = camera.position.y
        const normalizedDepth = Math.max(0, Math.min(1, (6.5 - currentY) / 7.8))
        setDepth(normalizedDepth)
      },
      onComplete: () => {
        setDiving(false)
        setCanResurface(true)
        setWelcomeMessageShown(true)
        
        if (import.meta.env.DEV) {
          console.info('[DIVE] Animation completed')
        }
      },
      onInterrupt: () => {
        if (import.meta.env.DEV) {
          console.info('[DIVE] Animation interrupted')
        }
      }
    })

    // Define camera movement keyframes
    // Surface (6.5) → Above water (2.8) → Water level (1.9) → Shallow (0.2) → Deep (-1.3)
    tl.to(camera.position, {
      y: 2.8,
      duration: duration * 0.2,
      ease: \"power2.out\"
    })
    .to(camera.position, {
      y: 1.9,
      duration: duration * 0.15,
      ease: \"power1.inOut\"
    })
    .to(camera.position, {
      y: 0.2,
      duration: duration * 0.35,
      ease: \"power2.inOut\"
    })
    .to(camera.position, {
      y: -1.3,
      duration: duration * 0.3,
      ease: \"power2.in\"
    })

    // Store timeline reference
    timelineRef.current = tl

    // Cleanup function
    return () => {
      if (tl) {
        tl.kill()
      }
    }
  }, [isDiving, isBooting, prefersReducedMotion, camera, setDepth, setDiving, setCanResurface, setWelcomeMessageShown])

  // Surface animation function with StrictMode protection
  const surface = () => {
    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }

    if (!camera) return

    const duration = prefersReducedMotion ? 1.0 : 2.0
    
    if (import.meta.env.DEV) {
      console.info('[DIVE] Starting surface animation', { duration })
    }

    const tl = gsap.timeline({
      ease: \"power2.inOut\",
      onUpdate: () => {
        const currentY = camera.position.y
        const normalizedDepth = Math.max(0, Math.min(1, (6.5 - currentY) / 7.8))
        setDepth(normalizedDepth)
      },
      onComplete: () => {
        setCanResurface(false)
        setDepth(0)
        
        if (import.meta.env.DEV) {
          console.info('[DIVE] Surface animation completed')
        }
      }
    })

    // Animate back to surface
    tl.to(camera.position, {
      y: 6.5,
      duration: duration,
      ease: \"power2.out\"
    })

    // Update camera projection matrix
    setTimeout(() => {
      if (camera && camera.updateProjectionMatrix) {
        camera.updateProjectionMatrix()
      }
    }, 0)

    timelineRef.current = tl
  }

  // Expose surface function globally (with StrictMode guard)
  useEffect(() => {
    if (!window.oceanPlayground) {
      window.oceanPlayground = { surface }
    } else {
      window.oceanPlayground.surface = surface
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
    }
  }, [])

  return null
}

export default DiveSystem
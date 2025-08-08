import React, { Suspense, useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Simple Camera Controller
 */
function CameraController() {
  const ref = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })
  
  return <group ref={ref} />
}

/**
 * Lightweight Ocean Surface Component
 */
function OceanSurface() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100, 128, 128]} />
      <meshStandardMaterial
        color="#4fc3f7"
        metalness={0.3}
        roughness={0.4}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

/**
 * Simple Bubble System
 */
function BubbleSystem() {
  const bubbleCount = 30 // Reduced for performance
  
  return (
    <>
      {Array.from({ length: bubbleCount }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 10 - 5,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[0.1 + Math.random() * 0.2, 8, 8]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.6}
            roughness={0}
            metalness={0.1}
            clearcoat={1}
          />
        </mesh>
      ))}
    </>
  )
}

/**
 * Simple Loading indicator with 6-second failopen
 */
function LoadingProgress() {
  const [visible, setVisible] = useState(true)
  const [timedOut, setTimedOut] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true)
      setVisible(false)
    }, 6000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!visible || timedOut) {
    return null
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '25px',
      backdropFilter: 'blur(10px)',
      fontSize: '0.9rem'
    }}>
      Loading 3D Ocean...
    </div>
  )
}

/**
 * Main 3D Scene Component with Progressive Enhancement
 */
export default function Scene() {
  const [mounted, setMounted] = useState(false)
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium')
  
  useEffect(() => {
    setMounted(true)
    
    // Detect performance capabilities
    const isMobile = window.innerWidth < 768
    const hasGoodGPU = navigator.hardwareConcurrency > 4
    
    if (isMobile) {
      setQuality('low')
    } else if (hasGoodGPU) {
      setQuality('high')
    }
  }, [])
  
  if (!mounted) {
    return null
  }
  
  return (
    <>
      <LoadingProgress />
      <Canvas
        camera={{
          position: [0, 5, 10],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: quality !== 'low',
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false
        }}
        dpr={quality === 'low' ? [1, 1] : quality === 'medium' ? [1, 1.5] : [1, 2]}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2
        }}
      >
        {/* Simple Camera Controls */}
        <CameraController />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1.2}
          color="#87ceeb"
        />
        
        {/* Main Scene Content */}
        <Suspense fallback={null}>
          <OceanSurface />
          <BubbleSystem />
        </Suspense>
      </Canvas>
    </>
  )
}
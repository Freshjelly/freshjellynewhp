import React, { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

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
 * Progress Loader with 6-second failopen
 */
function LoadingProgress() {
  const { progress } = useProgress()
  const [timedOut, setTimedOut] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true)
    }, 6000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (progress === 100 || timedOut) {
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
      Loading 3D Ocean: {Math.round(progress)}%
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
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.2}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1.2}
          color="#87ceeb"
          castShadow={quality === 'high'}
        />
        
        {/* Main Scene Content */}
        <Suspense fallback={null}>
          <OceanSurface />
          <BubbleSystem />
          <Environment preset="sunset" background={false} />
        </Suspense>
        
        {/* Post-processing (only on high quality) */}
        {quality === 'high' && (
          <Suspense fallback={null}>
            <EffectComposer>
              <Bloom
                intensity={0.3}
                luminanceThreshold={0.8}
                luminanceSmoothing={0.9}
              />
              <Vignette
                offset={0.3}
                darkness={0.1}
              />
            </EffectComposer>
          </Suspense>
        )}
      </Canvas>
    </>
  )
}
import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useAppState } from '../state/useAppState'

// Enhanced Components
import DiveSystem from './DiveSystem'
import EnhancedOceanSurface from './EnhancedOceanSurface'
import EnhancedBubbleSystem from './EnhancedBubbleSystem'
import SafeObjectsCluster from './SafeObjectsCluster'
import PostProcessingEffects from './PostProcessingEffects'

/**
 * Boot Mark Component - Marks boot completion on first frame
 * This is a safety net to ensure boot completion is detected
 */
const BootMark: React.FC = () => {
  const bootMarkRef = useRef<boolean>(false)
  const { setBooting } = useAppState()
  
  // Mark boot completion on first useFrame call
  React.useEffect(() => {
    if (!bootMarkRef.current) {
      bootMarkRef.current = true
      // Small delay to ensure everything is ready
      setTimeout(() => {
        setBooting(false)
        if (import.meta.env.DEV) {
          console.info('[BOOT] BootMark completed initialization')
        }
      }, 100)
    }
  }, [setBooting])
  
  return null
}

/**
 * Enhanced Ocean Scene with robust initialization
 * Features watchdog timer, WebGL failure detection, and Safe Mode fallback
 */
const Scene: React.FC = () => {
  const watchdogRef = useRef<NodeJS.Timeout | null>(null)
  const initGuardRef = useRef<boolean>(false)
  
  const {
    activePanel,
    depth,
    isMobile,
    lowPowerMode,
    safeMode,
    prefersReducedMotion,
    setBooting,
    setError,
    setSafe,
    setHoveredObject,
    cameraFov
  } = useAppState()

  // 8-second Watchdog Timer - MUST complete within 8 seconds
  useEffect(() => {
    if (initGuardRef.current) return
    initGuardRef.current = true
    
    if (import.meta.env.DEV) {
      console.info('[BOOT] Starting 8-second watchdog timer')
    }
    
    watchdogRef.current = setTimeout(() => {
      const { isBooting } = useAppState.getState()
      if (isBooting) {
        if (import.meta.env.DEV) {
          console.warn('[BOOT] Watchdog timeout - forcing Safe Mode')
        }
        setSafe(true)
        setError('BOOT_TIMEOUT')
        setBooting(false)
      }
    }, 8000)
    
    // Cleanup watchdog on unmount
    return () => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
    }
  }, [setSafe, setError, setBooting])

  // Clear watchdog when boot completes
  useEffect(() => {
    const unsubscribe = useAppState.subscribe(
      (state) => state.isBooting,
      (isBooting) => {
        if (!isBooting && watchdogRef.current) {
          clearTimeout(watchdogRef.current)
          watchdogRef.current = null
          if (import.meta.env.DEV) {
            console.info('[BOOT] Watchdog cleared - boot completed successfully')
          }
        }
      }
    )
    
    return unsubscribe
  }, [])

  // Handle Canvas creation with WebGL validation
  const handleCanvasCreated = ({ gl, camera }: any) => {
    try {
      // Test WebGL context and capabilities
      if (!gl || !gl.getContext) {
        throw new Error('No WebGL context available')
      }
      
      const context = gl.getContext()
      if (!context) {
        throw new Error('Failed to get WebGL context')
      }
      
      // Test basic WebGL operations
      context.clearColor(0, 0, 0, 1)
      context.clear(context.COLOR_BUFFER_BIT)
      
      // Check for essential extensions (optional but helpful)
      const extension = context.getExtension('WEBGL_debug_renderer_info')
      if (import.meta.env.DEV && extension) {
        const renderer = context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
        console.info('[BOOT] WebGL Renderer:', renderer)
      }
      
      // Validate camera
      if (!camera || typeof camera.updateProjectionMatrix !== 'function') {
        throw new Error('Camera initialization failed')
      }
      
      // Boot completed successfully
      setBooting(false)
      
      if (import.meta.env.DEV) {
        console.info('[BOOT] Canvas initialized successfully')
      }
      
    } catch (error) {
      console.error('[BOOT] WebGL initialization failed:', error)
      setSafe(true)
      setError('WEBGL_FAIL')
      setBooting(false)
    }
  }

  // Handle object interactions
  const handleObjectHover = (object: any, position: any) => {
    if (depth >= 0.25) { // Only show labels when underwater
      setHoveredObject(object, position)
    }
  }

  const handleObjectLeave = () => {
    setHoveredObject(null)
  }

  // Determine rendering quality based on performance settings and Safe Mode
  const canvasProps = {
    shadows: !lowPowerMode && !isMobile && !safeMode,
    dpr: (lowPowerMode || safeMode) ? [1, 1] : (isMobile ? [1, 1.5] : [1, 2]),
    gl: {
      antialias: !isMobile && !lowPowerMode && !safeMode,
      alpha: false,
      powerPreference: 'high-performance' as const,
      stencil: false,
      depth: true,
    },
    camera: {
      position: [0, 6.5, 9] as [number, number, number],
      fov: cameraFov(),
      near: 0.1,
      far: 1000,
    },
    performance: {
      min: lowPowerMode || safeMode ? 0.2 : 0.5,
      max: 1,
      debounce: 200,
    },
    onCreated: handleCanvasCreated,
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Enhanced 3D Ocean Scene */}
      <Canvas {...canvasProps}>
        <Suspense fallback={null}>
          {/* Boot Mark - Safety net for boot completion */}
          <BootMark />
          
          {/* Enhanced Camera Controls with Safe Mode considerations */}
          <OrbitControls
            enablePan={false}
            enableZoom={!prefersReducedMotion && !safeMode}
            enableRotate={true}
            minDistance={3}
            maxDistance={25}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8}
            maxAzimuthAngle={Math.PI}
            minAzimuthAngle={-Math.PI}
            autoRotate={false}
            autoRotateSpeed={0.2}
            enableDamping={!prefersReducedMotion}
            dampingFactor={0.05}
            rotateSpeed={prefersReducedMotion ? 0.3 : 0.5}
            zoomSpeed={prefersReducedMotion ? 0.3 : 0.8}
          />

          {/* Dive Animation System with StrictMode guard */}
          <DiveSystem />
          
          {/* Enhanced Ocean Surface with depth effects */}
          <EnhancedOceanSurface />
          
          {/* Enhanced Bubble System with Safe Mode count reduction */}
          <EnhancedBubbleSystem />
          
          {/* Safe Objects Cluster with GLTF fallback */}
          <SafeObjectsCluster 
            onObjectHover={handleObjectHover}
            onObjectLeave={handleObjectLeave}
          />

          {/* Environment and Lighting with Safe Mode considerations */}
          <Environment 
            preset="sunset" 
            background={false}
            blur={lowPowerMode || safeMode ? 0.8 : 0.5}
          />
          
          {/* Ambient ocean lighting */}
          <ambientLight 
            intensity={depth > 0.5 ? 0.2 : 0.4} 
            color={depth > 0.5 ? 0x1e3a8a : 0x4fc3f7} 
          />
          
          {/* Main directional light (sun through water) */}
          <directionalLight
            position={[10, 20, 5]}
            intensity={1.5 - (depth * 0.8)}
            color={0x87ceeb}
            castShadow={!lowPowerMode && !isMobile && !safeMode}
            shadow-mapSize-width={isMobile || safeMode ? 512 : 2048}
            shadow-mapSize-height={isMobile || safeMode ? 512 : 2048}
            shadow-camera-near={0.5}
            shadow-camera-far={500}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            shadow-bias={-0.0005}
          />

          {/* Underwater mood lighting */}
          {depth > 0.3 && !safeMode && (
            <>
              <pointLight 
                position={[0, 15, -10]} 
                intensity={0.3 * (1 - depth)}
                color={0xffffff}
                distance={30}
                decay={2}
              />
              
              <pointLight 
                position={[-15, 5, -15]} 
                intensity={0.2}
                color={0x29b6f6}
                distance={25}
                decay={2}
              />
              
              <pointLight 
                position={[15, 5, 15]} 
                intensity={0.2}
                color={0x4fc3f7}
                distance={25}
                decay={2}
              />
            </>
          )}

          {/* Post-processing Effects - Disabled in Safe Mode */}
          {!safeMode && <PostProcessingEffects />}
        </Suspense>
      </Canvas>

      {/* Panel Background Overlay */}
      {activePanel && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 999
          }}
          onClick={() => useAppState.getState().setActivePanel(null)}
        />
      )}
    </div>
  )
}

export default Scene
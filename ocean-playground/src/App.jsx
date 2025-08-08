import React, { Suspense, useEffect, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useAppState } from './state/useAppState'

// Critical Components (loaded immediately)
import DiveSystem from './components/DiveSystem'
import Loading from './components/Loading'
import BootLoader from './components/ui/BootLoader'

// Heavy 3D Components (lazy loaded)
const EnhancedOceanSurface = lazy(() => import('./components/EnhancedOceanSurface'))
const EnhancedBubbleSystem = lazy(() => import('./components/EnhancedBubbleSystem'))
const ObjectsCluster = lazy(() => import('./components/ObjectsCluster'))
const PostProcessingEffects = lazy(() => import('./components/PostProcessingEffects'))

// UI Components (lazy loaded)
const Overlay = lazy(() => import('./components/ui/Overlay'))
const AboutPanel = lazy(() => import('./components/ui/panels/AboutPanel'))
const WorksPanel = lazy(() => import('./components/ui/panels/WorksPanel'))
const ContactPanel = lazy(() => import('./components/ui/panels/ContactPanel'))

/**
 * Enhanced Ocean Playground App
 * Features dive animations, procedural objects, enhanced performance
 */
function App() {
  const {
    activePanel,
    depth,
    isMobile,
    lowPowerMode,
    prefersReducedMotion,
    setHoveredObject,
    cameraFov
  } = useAppState()

  // Performance optimization: Tab visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Pause expensive operations when tab is not visible
      if (document.hidden) {
        // Reduce GSAP ticker frequency when tab is inactive
        if (window.gsap) {
          window.gsap.ticker.fps(10)
        }
      } else {
        // Restore normal ticker frequency
        if (window.gsap) {
          window.gsap.ticker.fps(60)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Handle object interactions
  const handleObjectHover = (object, position) => {
    if (depth >= 0.25) { // Only show labels when underwater
      setHoveredObject(object, position)
    }
  }

  const handleObjectLeave = () => {
    setHoveredObject(null)
  }

  // Handle Canvas creation and boot completion
  const handleCanvasCreated = ({ gl }) => {
    try {
      // Test WebGL context
      const extension = gl.getExtension('WEBGL_debug_renderer_info')
      if (import.meta.env.DEV && extension) {
        const renderer = gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)
        console.info('[BOOT] WebGL Renderer:', renderer)
      }
      
      // Boot completed successfully
      useAppState.getState().setBoot(false)
    } catch (error) {
      console.error('[BOOT] WebGL initialization failed:', error)
      useAppState.getState().setBoot(false, 'WEBGL_FAIL', true)
    }
  }

  // Determine rendering quality based on performance settings
  const canvasProps = {
    shadows: !lowPowerMode && !isMobile && !useAppState.getState().safeMode,
    dpr: (lowPowerMode || useAppState.getState().safeMode) ? [1, 1] : (isMobile ? [1, 1.5] : [1, 2]),
    gl: {
      antialias: !isMobile && !lowPowerMode && !useAppState.getState().safeMode,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    },
    camera: {
      position: [0, 6.5, 9],
      fov: cameraFov,
      near: 0.1,
      far: 1000
    },
    performance: {
      min: lowPowerMode ? 0.2 : 0.5,
      max: 1,
      debounce: 200
    },
    onCreated: handleCanvasCreated
  }

  return (
    <div id="app" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Enhanced 3D Ocean Scene */}
      <Canvas {...canvasProps}>
        {/* Critical components loaded first */}
        <OrbitControls
          enablePan={false}
          enableZoom={!prefersReducedMotion}
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

        {/* Dive Animation System - loaded immediately */}
        <DiveSystem />
        
        {/* Core lighting - loaded immediately */}
        <ambientLight 
          intensity={depth > 0.5 ? 0.2 : 0.4} 
          color={depth > 0.5 ? 0x1e3a8a : 0x4fc3f7} 
        />
        
        <directionalLight
          position={[10, 20, 5]}
          intensity={1.5 - (depth * 0.8)}
          color={0x87ceeb}
          castShadow={!lowPowerMode && !isMobile}
          shadow-mapSize-width={isMobile ? 512 : 2048}
          shadow-mapSize-height={isMobile ? 512 : 2048}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-bias={-0.0005}
        />

        {/* Primary ocean components - loaded second */}
        <Suspense fallback={null}>
          <EnhancedOceanSurface />
          <Environment 
            preset="sunset" 
            background={false}
            blur={lowPowerMode ? 0.8 : 0.5}
          />
        </Suspense>
        
        {/* Secondary effects - loaded third */}
        <Suspense fallback={null}>
          <EnhancedBubbleSystem />
          
          {/* Underwater mood lighting */}
          {depth > 0.3 && (
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
        </Suspense>
        
        {/* Interactive elements - loaded fourth */}
        <Suspense fallback={null}>
          <ObjectsCluster 
            onObjectHover={handleObjectHover}
            onObjectLeave={handleObjectLeave}
          />
        </Suspense>

        {/* Heavy post-processing - loaded last */}
        <Suspense fallback={null}>
          <PostProcessingEffects />
        </Suspense>
      </Canvas>

      {/* Enhanced UI Overlay */}
      <Suspense fallback={<div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        color: 'white', 
        fontSize: '14px',
        opacity: 0.7 
      }}>
        Loading UI...
      </div>}>
        <Overlay />
      </Suspense>

      {/* Modal Panels */}
      <Suspense fallback={null}>
        {activePanel === 'about' && <AboutPanel />}
        {activePanel === 'works' && <WorksPanel />}
        {activePanel === 'contact' && <ContactPanel />}
      </Suspense>

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

      {/* Loading Screen */}
      <Loading />
      
      {/* Boot Loader with SafeMode and Protocol Warning */}
      <BootLoader />
    </div>
  )
}

export default App
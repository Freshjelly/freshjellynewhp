import React, { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useAppState } from './state/useAppState'

// Enhanced Components
import DiveSystem from './components/DiveSystem'
import EnhancedOceanSurface from './components/EnhancedOceanSurface'
import EnhancedBubbleSystem from './components/EnhancedBubbleSystem'
import ObjectsCluster from './components/ObjectsCluster'
import PostProcessingEffects from './components/PostProcessingEffects'

// UI Components
import Overlay from './components/ui/Overlay'
import AboutPanel from './components/ui/panels/AboutPanel'
import WorksPanel from './components/ui/panels/WorksPanel'
import ContactPanel from './components/ui/panels/ContactPanel'
import Loading from './components/Loading'

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

  // Determine rendering quality based on performance settings
  const canvasProps = {
    shadows: !lowPowerMode && !isMobile,
    dpr: lowPowerMode ? [1, 1] : (isMobile ? [1, 1.5] : [1, 2]),
    gl: {
      antialias: !isMobile && !lowPowerMode,
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
    }
  }

  return (
    <div id="app" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Enhanced 3D Ocean Scene */}
      <Canvas {...canvasProps}>
        <Suspense fallback={null}>
          {/* Performance Monitor - automatically adjusts quality */}
          {/* <AdaptivePerformance /> */}
          
          {/* Enhanced Camera Controls */}
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

          {/* Dive Animation System */}
          <DiveSystem />
          
          {/* Enhanced Ocean Surface with Depth Effects */}
          <EnhancedOceanSurface />
          
          {/* Enhanced Bubble System with InstancedMesh */}
          <EnhancedBubbleSystem />
          
          {/* Procedural Objects Cluster with Seeded Layout */}
          <ObjectsCluster 
            onObjectHover={handleObjectHover}
            onObjectLeave={handleObjectLeave}
          />

          {/* Environment and Lighting */}
          <Environment 
            preset="sunset" 
            background={false}
            blur={lowPowerMode ? 0.8 : 0.5}
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

          {/* Post-processing Effects */}
          <PostProcessingEffects />
        </Suspense>
      </Canvas>

      {/* Enhanced UI Overlay */}
      <Overlay />

      {/* Modal Panels */}
      {activePanel === 'about' && <AboutPanel />}
      {activePanel === 'works' && <WorksPanel />}
      {activePanel === 'contact' && <ContactPanel />}

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
    </div>
  )
}

export default App
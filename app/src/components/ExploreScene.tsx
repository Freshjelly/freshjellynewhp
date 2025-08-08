import React, { Suspense, useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Sea } from './scene/Sea'
import { JellySwarm } from './scene/JellySwarm'
import { SharkPatrol } from './scene/SharkPatrol'
import { Hud, type SceneSettings, getDensityCounts } from './ui/Hud'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'
import { PerformanceMonitor } from './PerformanceMonitor'

/**
 * Player camera controller with smooth movement
 */
function PlayerController() {
  const playerPositionRef = useRef(new THREE.Vector3(0, 5, 10))
  
  useFrame(({ camera, mouse, clock }) => {
    // Smooth mouse-based camera movement
    const targetX = mouse.x * 3
    const targetY = mouse.y * 2 + 5
    
    camera.position.lerp(
      new THREE.Vector3(targetX, targetY, 10 + Math.sin(clock.elapsedTime * 0.2) * 2),
      0.02
    )
    
    // Look slightly ahead
    camera.lookAt(targetX * 0.5, targetY * 0.5, 0)
    
    // Update player position for other components
    playerPositionRef.current.copy(camera.position)
  })
  
  return null
}

/**
 * Enhanced Scene for Explore page with jellyfish and sharks
 */
export default function ExploreScene() {
  const [mounted, setMounted] = useState(false)
  const [jellyfishPositions, setJellyfishPositions] = useState<THREE.Vector3[]>([])
  const playerPositionRef = useRef(new THREE.Vector3(0, 5, 10))
  
  // Scene settings with URL persistence
  const [sceneSettings, setSceneSettings] = useState<SceneSettings>({
    jellyfish: true,
    sharks: true,
    density: 'medium',
    enableCaustics: true,
    enableFog: true
  })
  
  // Performance monitoring with adaptive LOD
  const { metrics, adaptiveSettings, setAdaptiveSettings, handleMetricsUpdate, handleOptimize } = usePerformanceMonitor({
    targetFps: 45,
    jellyfishCount: getDensityCounts(sceneSettings.density).jellyfish,
    sharkCount: getDensityCounts(sceneSettings.density).sharks,
    enablePostProcessing: true,
    shadowQuality: 'medium',
    enableCaustics: sceneSettings.enableCaustics,
    enableVolumetricFog: sceneSettings.enableFog
  })
  
  // Calculate actual counts based on settings and adaptive optimization
  const densityCounts = getDensityCounts(sceneSettings.density)
  const actualJellyfishCount = sceneSettings.jellyfish ? 
    Math.min(densityCounts.jellyfish, adaptiveSettings.jellyfishCount) : 0
  const actualSharkCount = sceneSettings.sharks ? 
    Math.min(densityCounts.sharks, adaptiveSettings.sharkCount) : 0
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Update adaptive settings when scene settings change
  useEffect(() => {
    setAdaptiveSettings(prev => ({
      ...prev,
      jellyfishCount: densityCounts.jellyfish,
      sharkCount: densityCounts.sharks,
      enableCaustics: sceneSettings.enableCaustics,
      enableVolumetricFog: sceneSettings.enableFog
    }))
  }, [sceneSettings, densityCounts, setAdaptiveSettings])
  
  if (!mounted) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '1.2rem',
        textAlign: 'center'
      }}>
        <div>🌊 Loading Ocean Ecosystem...</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
          Preparing jellyfish swarm and shark patrol
        </div>
      </div>
    )
  }
  
  return (
    <>
      <Canvas
        camera={{
          position: [0, 5, 10],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: !adaptiveSettings.shadowQuality || adaptiveSettings.shadowQuality !== 'off',
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: true, // Better depth precision for large scenes
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace
        }}
        shadows={adaptiveSettings.shadowQuality !== 'off'}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        {/* Performance Monitor */}
        <PerformanceMonitor
          onMetricsUpdate={handleMetricsUpdate}
          adaptiveSettings={adaptiveSettings}
          onOptimize={handleOptimize}
        />
        
        {/* Player Camera Controller */}
        <PlayerController />
        
        {/* Enhanced Lighting System */}
        <ambientLight intensity={0.3} color="#4fc3f7" />
        <directionalLight
          position={[20, 20, 10]}
          intensity={1.2}
          color="#87ceeb"
          castShadow={adaptiveSettings.shadowQuality !== 'off'}
          shadow-mapSize-width={adaptiveSettings.shadowQuality === 'high' ? 2048 : 1024}
          shadow-mapSize-height={adaptiveSettings.shadowQuality === 'high' ? 2048 : 1024}
          shadow-camera-near={1}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-bias={-0.001}
        />
        
        {/* Main Scene Components */}
        <Suspense fallback={null}>
          {/* Ocean Environment */}
          <Sea
            waveHeight={0.8}
            fogDensity={sceneSettings.enableFog ? 0.4 : 0.1}
            enableCaustics={adaptiveSettings.enableCaustics}
          />
          
          {/* Jellyfish Swarm */}
          {sceneSettings.jellyfish && actualJellyfishCount > 0 && (
            <JellySwarm
              count={actualJellyfishCount}
              radius={35}
              speedRange={[0.2, 0.6]}
              playerPosition={playerPositionRef.current}
            />
          )}
          
          {/* Shark Patrol */}
          {sceneSettings.sharks && actualSharkCount > 0 && (
            <SharkPatrol
              count={actualSharkCount}
              patrolRadius={40}
              speed={0.8}
              jellyfishPositions={jellyfishPositions}
              playerPosition={playerPositionRef.current}
            />
          )}
        </Suspense>
        
        {/* Post-processing effects */}
        {adaptiveSettings.enablePostProcessing && (
          <Suspense fallback={null}>
            {/* Minimal bloom effect */}
            <pointLight
              position={[0, 15, 0]}
              intensity={0.1}
              color="#4fc3f7"
              distance={60}
              decay={1.5}
            />
          </Suspense>
        )}
      </Canvas>
      
      {/* HUD Overlay */}
      <Hud
        settings={sceneSettings}
        onSettingsChange={setSceneSettings}
        performanceInfo={{
          fps: metrics.fps,
          jellyfishCount: actualJellyfishCount,
          sharkCount: actualSharkCount
        }}
      />
      
      {/* Performance Info (Dev only) */}
      {import.meta.env.DEV && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <div>FPS: {metrics.fps.toFixed(1)}</div>
          <div>Frame: {metrics.frameTime.toFixed(1)}ms</div>
          {metrics.memoryUsage && <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>}
          <div>Jellyfish: {actualJellyfishCount}</div>
          <div>Sharks: {actualSharkCount}</div>
        </div>
      )}
    </>
  )
}
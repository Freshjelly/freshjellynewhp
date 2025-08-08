import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

export interface PerformanceMetrics {
  fps: number
  averageFps: number
  frameTime: number
  memoryUsage?: number
  gpuTime?: number
}

export interface AdaptiveSettings {
  targetFps: number
  jellyfishCount: number
  sharkCount: number
  enablePostProcessing: boolean
  shadowQuality: 'off' | 'low' | 'medium' | 'high'
  enableCaustics: boolean
  enableVolumetricFog: boolean
}

/**
 * Performance monitoring hook with adaptive LOD
 */
export const usePerformanceMonitor = (initialSettings: AdaptiveSettings) => {
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const fpsHistoryRef = useRef<number[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    averageFps: 60,
    frameTime: 16.67,
  })
  const [adaptiveSettings, setAdaptiveSettings] = useState(initialSettings)
  const performanceCheckRef = useRef(0)
  
  // GPU timing (if available)
  const gpuTimerRef = useRef<{
    ext?: any
    query?: WebGLQuery
    measuring: boolean
  }>({ measuring: false })
  
  /**
   * Initialize GPU timing if available
   */
  const initGPUTiming = useCallback((gl: WebGL2RenderingContext) => {
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2')
    if (ext) {
      gpuTimerRef.current.ext = ext
      gpuTimerRef.current.query = gl.createQuery()
    }
  }, [])
  
  /**
   * Start GPU timing measurement
   */
  const startGPUTiming = useCallback((gl: WebGL2RenderingContext) => {
    const { ext, query } = gpuTimerRef.current
    if (ext && query && !gpuTimerRef.current.measuring) {
      gl.beginQuery(ext.TIME_ELAPSED_EXT, query)
      gpuTimerRef.current.measuring = true
    }
  }, [])
  
  /**
   * End GPU timing measurement and get result
   */
  const endGPUTiming = useCallback((gl: WebGL2RenderingContext) => {
    const { ext, query } = gpuTimerRef.current
    if (ext && query && gpuTimerRef.current.measuring) {
      gl.endQuery(ext.TIME_ELAPSED_EXT)
      gpuTimerRef.current.measuring = false
      
      // Check if result is available (async)
      setTimeout(() => {
        if (gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
          const gpuTime = gl.getQueryParameter(query, gl.QUERY_RESULT) / 1000000 // Convert to milliseconds
          setMetrics(prev => ({ ...prev, gpuTime }))
        }
      }, 1)
    }
  }, [])
  
  /**
   * Adaptive optimization based on performance
   */
  const optimizeForPerformance = useCallback((currentFps: number, targetFps: number) => {
    if (currentFps < targetFps * 0.8) { // 80% of target FPS
      setAdaptiveSettings(prev => {
        const newSettings = { ...prev }
        
        // Step 1: Reduce jellyfish count
        if (newSettings.jellyfishCount > 60) {
          newSettings.jellyfishCount = Math.max(60, newSettings.jellyfishCount * 0.7)
        }
        // Step 2: Reduce shark count
        else if (newSettings.sharkCount > 1) {
          newSettings.sharkCount = Math.max(1, newSettings.sharkCount - 1)
        }
        // Step 3: Disable post-processing
        else if (newSettings.enablePostProcessing) {
          newSettings.enablePostProcessing = false
        }
        // Step 4: Reduce shadow quality
        else if (newSettings.shadowQuality !== 'off') {
          const qualities = ['high', 'medium', 'low', 'off']
          const currentIndex = qualities.indexOf(newSettings.shadowQuality)
          newSettings.shadowQuality = qualities[Math.min(currentIndex + 1, 3)] as any
        }
        // Step 5: Disable caustics
        else if (newSettings.enableCaustics) {
          newSettings.enableCaustics = false
        }
        // Step 6: Disable volumetric fog
        else if (newSettings.enableVolumetricFog) {
          newSettings.enableVolumetricFog = false
        }
        
        return newSettings
      })
    }
    // Gradually improve quality if performance allows
    else if (currentFps > targetFps * 1.2) { // 120% of target FPS
      setAdaptiveSettings(prev => {
        const newSettings = { ...prev }
        
        // Reverse optimization steps gradually
        if (!newSettings.enableVolumetricFog && prev.enableVolumetricFog) {
          newSettings.enableVolumetricFog = true
        } else if (!newSettings.enableCaustics) {
          newSettings.enableCaustics = true
        } else if (newSettings.shadowQuality === 'off') {
          newSettings.shadowQuality = 'low'
        } else if (!newSettings.enablePostProcessing) {
          newSettings.enablePostProcessing = true
        } else if (newSettings.sharkCount < initialSettings.sharkCount) {
          newSettings.sharkCount += 1
        } else if (newSettings.jellyfishCount < initialSettings.jellyfishCount) {
          newSettings.jellyfishCount = Math.min(
            initialSettings.jellyfishCount,
            newSettings.jellyfishCount * 1.2
          )
        }
        
        return newSettings
      })
    }
  }, [initialSettings])
  
  /**
   * Main performance monitoring loop
   */
  useFrame((state) => {
    const now = performance.now()
    const deltaTime = now - lastTimeRef.current
    
    frameCountRef.current++
    
    // Calculate FPS every 60 frames or 1 second
    if (frameCountRef.current >= 60 || deltaTime >= 1000) {
      const fps = (frameCountRef.current * 1000) / deltaTime
      const frameTime = deltaTime / frameCountRef.current
      
      // Update FPS history for averaging
      fpsHistoryRef.current.push(fps)
      if (fpsHistoryRef.current.length > 30) { // Keep last 30 samples
        fpsHistoryRef.current.shift()
      }
      
      const averageFps = fpsHistoryRef.current.reduce((sum, f) => sum + f, 0) / fpsHistoryRef.current.length
      
      // Get memory usage if available
      let memoryUsage: number | undefined
      if ('memory' in performance && (performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
      }
      
      setMetrics({
        fps,
        averageFps,
        frameTime,
        memoryUsage,
        gpuTime: gpuTimerRef.current.ext ? metrics.gpuTime : undefined
      })
      
      // Perform adaptive optimization every 5 seconds
      performanceCheckRef.current++
      if (performanceCheckRef.current >= 5) {
        optimizeForPerformance(averageFps, adaptiveSettings.targetFps)
        performanceCheckRef.current = 0
      }
      
      // Reset counters
      frameCountRef.current = 0
      lastTimeRef.current = now
    }
    
    // GPU timing
    const gl = state.gl as WebGL2RenderingContext
    if (!gpuTimerRef.current.ext) {
      initGPUTiming(gl)
    }
    
    // Start GPU timing at beginning of frame
    startGPUTiming(gl)
  })
  
  // End GPU timing after render (use effect cleanup)
  const endFrame = useCallback((gl: WebGL2RenderingContext) => {
    endGPUTiming(gl)
  }, [endGPUTiming])
  
  return {
    metrics,
    adaptiveSettings,
    setAdaptiveSettings,
    endFrame
  }
}
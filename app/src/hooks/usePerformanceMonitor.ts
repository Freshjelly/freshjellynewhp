import { useState, useCallback } from 'react'

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage?: number
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
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
  })
  const [adaptiveSettings, setAdaptiveSettings] = useState(initialSettings)
  
  
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
  
  const handleMetricsUpdate = useCallback((newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics)
  }, [])

  const handleOptimize = useCallback((currentFps: number, targetFps: number) => {
    optimizeForPerformance(currentFps, targetFps)
  }, [optimizeForPerformance])
  
  return {
    metrics,
    adaptiveSettings,
    setAdaptiveSettings,
    handleMetricsUpdate,
    handleOptimize
  }
}
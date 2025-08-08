import React, { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import type { AdaptiveSettings } from '../hooks/usePerformanceMonitor'

interface PerformanceMonitorProps {
  onMetricsUpdate: (metrics: {
    fps: number
    frameTime: number
    memoryUsage?: number
  }) => void
  adaptiveSettings: AdaptiveSettings
  onOptimize: (fps: number, targetFps: number) => void
}

/**
 * Canvas-internal performance monitor component
 */
export function PerformanceMonitor({ 
  onMetricsUpdate, 
  adaptiveSettings, 
  onOptimize 
}: PerformanceMonitorProps) {
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const performanceCheckRef = useRef(0)
  const fpsHistoryRef = useRef<number[]>([])

  useFrame(() => {
    const now = performance.now()
    const deltaTime = now - lastTimeRef.current
    
    frameCountRef.current++
    
    // Calculate FPS every 60 frames or 1 second
    if (frameCountRef.current >= 60 || deltaTime >= 1000) {
      const fps = (frameCountRef.current * 1000) / deltaTime
      const frameTime = deltaTime / frameCountRef.current
      
      // Update FPS history for averaging
      fpsHistoryRef.current.push(fps)
      if (fpsHistoryRef.current.length > 30) {
        fpsHistoryRef.current.shift()
      }
      
      const averageFps = fpsHistoryRef.current.reduce((sum, f) => sum + f, 0) / fpsHistoryRef.current.length
      
      // Get memory usage if available
      let memoryUsage: number | undefined
      if ('memory' in performance && (performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024
      }
      
      onMetricsUpdate({
        fps,
        frameTime,
        memoryUsage
      })
      
      // Perform adaptive optimization every 5 seconds
      performanceCheckRef.current++
      if (performanceCheckRef.current >= 5) {
        onOptimize(averageFps, adaptiveSettings.targetFps)
        performanceCheckRef.current = 0
      }
      
      // Reset counters
      frameCountRef.current = 0
      lastTimeRef.current = now
    }
  })

  return null
}
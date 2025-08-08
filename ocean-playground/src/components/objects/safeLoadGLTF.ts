import { useGLTF } from '@react-three/drei'
import { withTimeout } from '../../utils/withTimeout'
import { useAppState } from '../../state/useAppState'

/**
 * Safe GLTF Preloader with timeout and fallback
 * Attempts to load GLTF within timeout, falls back to procedural on failure
 */
export async function safePreloadGLTF(path: string, timeoutMs: number = 5000): Promise<boolean> {
  try {
    if (import.meta.env.DEV) {
      console.info(`[GLTF] Attempting to preload: ${path}`)
    }
    
    // Create a promise wrapper around useGLTF.preload
    const preloadPromise = new Promise<void>((resolve, reject) => {
      try {
        useGLTF.preload(path)
        // GLTF preload is synchronous but may fail silently
        // We'll resolve immediately and catch errors during actual usage
        resolve()
      } catch (error) {
        reject(error)
      }
    })
    
    // Add timeout to the preload operation
    await withTimeout(preloadPromise, timeoutMs, 'ASSET_TIMEOUT')
    
    if (import.meta.env.DEV) {
      console.info(`[GLTF] Successfully preloaded: ${path}`)
    }
    
    return true
    
  } catch (error: any) {
    const state = useAppState.getState()
    
    if (import.meta.env.DEV) {
      console.warn(`[GLTF] Failed to preload ${path}:`, error)
    }
    
    // Determine error type and update state
    if (error?.message === 'ASSET_TIMEOUT') {
      state.setError('ASSET_TIMEOUT')
    } else {
      state.setError('INIT_ERROR')
    }
    
    // Switch to Safe Mode for this session
    state.setSafe(true)
    
    return false
  }
}

/**
 * Safe GLTF Hook with automatic fallback
 * Returns loaded GLTF or null if failed (caller should use procedural)
 */
export function useSafeGLTF(path: string, fallback: boolean = true) {
  try {
    const gltf = useGLTF(path)
    return gltf
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[GLTF] Runtime load failed for ${path}:`, error)
    }
    
    if (fallback) {
      const state = useAppState.getState()
      state.setSafe(true)
      state.setError('INIT_ERROR')
    }
    
    return null
  }
}

/**
 * Batch preload multiple GLTF files with individual timeout
 */
export async function batchPreloadGLTF(
  paths: string[], 
  individualTimeout: number = 5000,
  allowPartialFailure: boolean = true
): Promise<{ success: string[], failed: string[] }> {
  const results = await Promise.allSettled(
    paths.map(path => safePreloadGLTF(path, individualTimeout))
  )
  
  const success: string[] = []
  const failed: string[] = []
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      success.push(paths[index])
    } else {
      failed.push(paths[index])
    }
  })
  
  if (import.meta.env.DEV) {
    console.info(`[GLTF] Batch preload complete:`, { success, failed })
  }
  
  // If no files loaded and partial failure is not allowed, go to Safe Mode
  if (success.length === 0 && !allowPartialFailure) {
    const state = useAppState.getState()
    state.setSafe(true)
    state.setError('ASSET_TIMEOUT')
  }
  
  return { success, failed }
}

/**
 * Check if GLTF file exists (basic URL check)
 */
export async function checkGLTFExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Smart GLTF loader that checks existence before loading
 */
export async function smartPreloadGLTF(path: string, timeoutMs: number = 5000): Promise<boolean> {
  // First check if file exists
  const exists = await checkGLTFExists(path)
  if (!exists) {
    if (import.meta.env.DEV) {
      console.warn(`[GLTF] File does not exist: ${path}`)
    }
    return false
  }
  
  // File exists, proceed with safe preload
  return safePreloadGLTF(path, timeoutMs)
}
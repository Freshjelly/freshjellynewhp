/**
 * Timeout utility for adding timeout to any Promise
 * Prevents infinite waiting for GLTF loading or other async operations
 */
export function withTimeout<T>(
  promise: Promise<T>, 
  ms: number = 6000, 
  label: string = 'TIMEOUT'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Create timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(label))
    }, ms)
    
    // Handle promise resolution/rejection
    promise
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

/**
 * Utility to create a delay promise (for testing or staged loading)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a promise with exponential backoff
 */
export async function withRetry<T>(
  promiseFactory: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await promiseFactory()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff
      const delayMs = baseDelay * Math.pow(2, attempt)
      await delay(delayMs)
      
      if (import.meta.env.DEV) {
        console.warn(`[RETRY] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`, error)
      }
    }
  }
  
  throw lastError!
}

/**
 * Race between multiple promises with timeout
 */
export function raceWithTimeout<T>(
  promises: Promise<T>[],
  timeoutMs: number = 6000,
  label: string = 'RACE_TIMEOUT'
): Promise<T> {
  return Promise.race([
    ...promises,
    withTimeout(new Promise<never>(() => {}), timeoutMs, label)
  ])
}
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Boot error types
export type BootError = null | 'BOOT_TIMEOUT' | 'WEBGL_FAIL' | 'ASSET_TIMEOUT' | 'INIT_ERROR'

// App state interface
export interface AppState {
  // Boot System
  isBooting: boolean
  bootError: BootError
  safeMode: boolean
  protocolWarning: boolean
  
  // Diving System
  depth: number // 0 = surface, 1 = deep underwater
  isDiving: boolean
  canResurface: boolean
  
  // UI State
  activePanel: 'about' | 'works' | 'contact' | null
  hoveredObject: any
  showUI: boolean
  welcomeMessageShown: boolean
  
  // Performance & Accessibility
  lowPowerMode: boolean
  prefersReducedMotion: boolean
  isMobile: boolean
  
  // Layout & Objects
  seed: number
  objectsVisible: boolean
  
  // Theme
  theme: 'default' | 'dark' | 'light'
  
  // Boot Actions
  setBooting: (booting: boolean) => void
  setError: (error: BootError) => void
  setSafe: (safe: boolean) => void
  setProtocolWarning: (warning: boolean) => void
  retryBoot: () => void
  
  // Actions
  setDepth: (depth: number) => void
  setDiving: (isDiving: boolean) => void
  setCanResurface: (canResurface: boolean) => void
  setActivePanel: (panel: 'about' | 'works' | 'contact' | null) => void
  setHoveredObject: (object: any, position?: any) => void
  toggleUI: () => void
  setWelcomeMessageShown: (shown: boolean) => void
  toggleLowPowerMode: () => void
  regenerateLayout: () => void
  toggleObjectsVisible: () => void
  setTheme: (theme: 'default' | 'dark' | 'light') => void
  
  // Computed values
  fogDensity: () => number
  causticsIntensity: () => number
  bubbleRate: () => number
  waterOpacity: () => number
  cameraFov: () => number
  bloomStrength: () => number
  vignetteStrength: () => number
  
  // Initialize methods
  initializePreferences: () => void
  initializeBoot: () => void
  handleFirstScroll: () => void
}

/**
 * Ocean Playground App State Store (TypeScript)
 * Manages boot system, diving depth, UI state, performance settings
 */
export const useAppState = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Boot System - Start in booting state
    isBooting: true,
    bootError: null,
    safeMode: false,
    protocolWarning: false,
    
    // Diving System
    depth: 0,
    isDiving: false,
    canResurface: false,
    
    // UI State
    activePanel: null,
    hoveredObject: null,
    showUI: true,
    welcomeMessageShown: false,
    
    // Performance & Accessibility
    lowPowerMode: false,
    prefersReducedMotion: false,
    isMobile: false,
    
    // Layout & Objects
    seed: Math.floor(Math.random() * 10000),
    objectsVisible: true,
    
    // Theme
    theme: 'default',
    
    // Boot Actions
    setBooting: (booting: boolean) => {
      set({ isBooting: booting })
      if (import.meta.env.DEV) {
        console.info('[BOOT] setBooting:', booting)
      }
    },
    
    setError: (error: BootError) => {
      set({ bootError: error })
      if (import.meta.env.DEV) {
        console.warn('[BOOT] setError:', error)
      }
    },
    
    setSafe: (safe: boolean) => {
      set({ safeMode: safe })
      if (import.meta.env.DEV) {
        console.info('[BOOT] setSafe:', safe)
      }
    },
    
    setProtocolWarning: (warning: boolean) => {
      set({ protocolWarning: warning })
      if (import.meta.env.DEV) {
        console.info('[BOOT] setProtocolWarning:', warning)
      }
    },
    
    retryBoot: () => {
      set({ 
        isBooting: true, 
        bootError: null, 
        safeMode: false 
      })
      if (import.meta.env.DEV) {
        console.info('[BOOT] Retrying boot...')
      }
      // Re-initialize boot process
      get().initializeBoot()
    },
    
    // Actions
    setDepth: (depth: number) => set({ depth: Math.max(0, Math.min(1, depth)) }),
    setDiving: (isDiving: boolean) => set({ isDiving }),
    setCanResurface: (canResurface: boolean) => set({ canResurface }),
    setActivePanel: (panel) => set({ activePanel: panel }),
    setHoveredObject: (object, position) => set({ 
      hoveredObject: object ? { object, position } : null 
    }),
    toggleUI: () => set((state) => ({ showUI: !state.showUI })),
    setWelcomeMessageShown: (shown: boolean) => set({ welcomeMessageShown: shown }),
    toggleLowPowerMode: () => set((state) => ({ lowPowerMode: !state.lowPowerMode })),
    regenerateLayout: () => set({ seed: Math.floor(Math.random() * 10000) }),
    toggleObjectsVisible: () => set((state) => ({ objectsVisible: !state.objectsVisible })),
    setTheme: (theme) => set({ theme }),
    
    // Computed values
    fogDensity: () => {
      const { depth } = get()
      return 0.02 * depth
    },
    
    causticsIntensity: () => {
      const { depth } = get()
      return Math.pow(depth, 0.7) * 0.8
    },
    
    bubbleRate: () => {
      const { depth } = get()
      return 1 + (0.7 * depth)
    },
    
    waterOpacity: () => {
      const { depth } = get()
      return Math.min(0.8, 0.3 + (depth * 0.5))
    },
    
    cameraFov: () => {
      const { depth } = get()
      return 45 + (depth * 10)
    },
    
    bloomStrength: () => {
      const { depth, lowPowerMode, safeMode } = get()
      return (lowPowerMode || safeMode) ? 0 : depth * 0.35
    },
    
    vignetteStrength: () => {
      const { depth } = get()
      return 0.05 + (depth * 0.09)
    },
    
    // Initialize reduced motion preference and mobile detection
    initializePreferences: () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isMobile = window.innerWidth < 768
      
      set({ 
        prefersReducedMotion,
        isMobile,
        lowPowerMode: isMobile // Auto-enable low power on mobile
      })
      
      // Listen for changes
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQuery.addEventListener('change', (e) => {
        set({ prefersReducedMotion: e.matches })
      })
      
      window.addEventListener('resize', () => {
        const newIsMobile = window.innerWidth < 768
        set({ isMobile: newIsMobile })
      })
    },
    
    // Boot initialization with protocol check and watchdog
    initializeBoot: () => {
      // Check if opened via file:// protocol
      if (window.location.protocol === 'file:') {
        set({ protocolWarning: true })
      }
      
      if (import.meta.env.DEV) {
        const { safeMode, bootError } = get()
        console.info('[BOOT]', { 
          protocol: location.protocol, 
          safeMode, 
          error: bootError,
          timestamp: Date.now()
        })
      }
    },
    
    // Auto-dive on scroll (first wheel event) - only when boot complete
    handleFirstScroll: () => {
      const { isDiving, prefersReducedMotion, isBooting } = get()
      
      // Only allow dive when boot is complete
      if (!isDiving && !isBooting) {
        if (prefersReducedMotion) {
          // Skip animation, go directly to shallow depth
          set({ depth: 0.4, isDiving: false, canResurface: true })
        } else {
          // Trigger dive animation
          set({ isDiving: true })
        }
      }
    }
  }))
)

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
  const state = useAppState.getState()
  
  switch (e.key.toLowerCase()) {
    case 'r':
      // Regenerate layout
      state.regenerateLayout()
      break
    case 'h':
      // Toggle UI
      state.toggleUI()
      break
    case 'l':
      // Toggle low power mode
      state.toggleLowPowerMode()
      break
    case 'escape':
      // Close panels
      if (state.activePanel) {
        state.setActivePanel(null)
      }
      break
  }
})

// Initialize preferences and boot on first load
if (typeof window !== 'undefined') {
  useAppState.getState().initializePreferences()
  useAppState.getState().initializeBoot()
}
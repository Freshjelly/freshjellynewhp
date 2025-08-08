import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

/**
 * Ocean Playground App State Store
 * Manages diving depth, UI state, performance settings, and more
 */
export const useAppState = create(
  subscribeWithSelector((set, get) => ({
    // Boot System
    isBooting: true,
    bootError: null, // string | null
    safeMode: false,
    protocolWarning: false,
    
    // Diving System
    depth: 0, // 0 = surface, 1 = deep underwater
    isDiving: false,
    canResurface: false,
    
    // UI State
    activePanel: null, // 'about' | 'works' | 'contact' | null
    hoveredObject: null,
    showUI: true,
    welcomeMessageShown: false,
    
    // Performance & Accessibility
    lowPowerMode: false,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isMobile: window.innerWidth < 768,
    
    // Layout & Objects
    seed: Math.floor(Math.random() * 10000),
    objectsVisible: true,
    
    // Theme
    theme: 'default', // 'default' | 'dark' | 'light'
    
    // Actions
    setBoot: (isBooting, bootError = null, safeMode = null) => set((state) => ({ 
      isBooting, 
      bootError,
      safeMode: safeMode !== null ? safeMode : state.safeMode 
    })),
    
    // Fix for missing methods in safeLoadGLTF
    setError: (errorType) => set({ bootError: errorType }),
    setSafe: (safeMode) => set({ safeMode }),
    
    setProtocolWarning: (protocolWarning) => set({ protocolWarning }),
    
    retryBoot: () => set({ isBooting: true, bootError: null, safeMode: false }),
    
    setDepth: (depth) => set({ depth: Math.max(0, Math.min(1, depth)) }),
    
    setDiving: (isDiving) => set({ isDiving }),
    
    setCanResurface: (canResurface) => set({ canResurface }),
    
    setActivePanel: (panel) => set({ activePanel: panel }),
    
    setHoveredObject: (object, position) => set({ 
      hoveredObject: object ? { object, position } : null 
    }),
    
    toggleUI: () => set((state) => ({ showUI: !state.showUI })),
    
    setWelcomeMessageShown: (shown) => set({ welcomeMessageShown: shown }),
    
    toggleLowPowerMode: () => set((state) => ({ lowPowerMode: !state.lowPowerMode })),
    
    regenerateLayout: () => set({ seed: Math.floor(Math.random() * 10000) }),
    
    toggleObjectsVisible: () => set((state) => ({ objectsVisible: !state.objectsVisible })),
    
    setTheme: (theme) => set({ theme }),
    
    // Computed values
    get fogDensity() {
      const { depth } = get()
      return 0.02 * depth
    },
    
    get causticsIntensity() {
      const { depth } = get()
      // Ease out curve for natural lighting
      return Math.pow(depth, 0.7) * 0.8
    },
    
    get bubbleRate() {
      const { depth } = get()
      return 1 + (0.7 * depth)
    },
    
    get waterOpacity() {
      const { depth } = get()
      return Math.min(0.8, 0.3 + (depth * 0.5))
    },
    
    get cameraFov() {
      const { depth } = get()
      return 45 + (depth * 10) // 45deg to 55deg
    },
    
    get bloomStrength() {
      const { depth, lowPowerMode } = get()
      return lowPowerMode ? 0 : depth * 0.35
    },
    
    get vignetteStrength() {
      const { depth } = get()
      return 0.05 + (depth * 0.09) // 0.05 to 0.14
    },
    
    // Initialize reduced motion preference
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
    
    // Auto-dive on scroll (first wheel event)
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
    },
    
    // Boot initialization with protocol check and watchdog
    initializeBoot: () => {
      // Check if opened via file:// protocol
      if (window.location.protocol === 'file:') {
        set({ protocolWarning: true })
      }
      
      // 8-second watchdog timer
      const watchdogTimer = setTimeout(() => {
        const { isBooting } = get()
        if (isBooting) {
          if (import.meta.env.DEV) {
            console.warn('[BOOT] Watchdog timeout - switching to SafeMode')
          }
          set({ 
            safeMode: true, 
            bootError: 'BOOT_TIMEOUT', 
            isBooting: false 
          })
        }
      }, 8000)
      
      // Clear timer when boot completes
      const unsubscribe = useAppState.subscribe(
        (state) => state.isBooting,
        (isBooting) => {
          if (!isBooting) {
            clearTimeout(watchdogTimer)
            unsubscribe()
          }
        }
      )
      
      if (import.meta.env.DEV) {
        console.info('[BOOT]', { 
          protocol: location.protocol, 
          safeMode: get().safeMode, 
          bootError: get().bootError 
        })
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
useAppState.getState().initializePreferences()
useAppState.getState().initializeBoot()
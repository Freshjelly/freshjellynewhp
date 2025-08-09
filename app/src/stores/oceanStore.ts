import { create } from 'zustand'

export interface OceanState {
  // Scroll progress (0-1)
  scrollProgress: number
  isScrolling: boolean
  
  // Density settings
  density: 'low' | 'medium' | 'high'
  effectsEnabled: boolean
  
  // Performance tracking
  fps: number
  performanceLevel: 'high' | 'medium' | 'low'
  
  // Dynamic counts based on scroll and performance
  fishCount: number
  bubbleCount: number
  sharkCount: number
  
  // Reduced motion preference
  reducedMotion: boolean
  
  // Actions
  setScrollProgress: (progress: number) => void
  setIsScrolling: (scrolling: boolean) => void
  setDensity: (density: 'low' | 'medium' | 'high') => void
  setEffectsEnabled: (enabled: boolean) => void
  setFPS: (fps: number) => void
  updateCounts: () => void
  setReducedMotion: (reduced: boolean) => void
}

// Density presets
const DENSITY_PRESETS = {
  low: { fish: 20, bubbles: 15, sharks: 1 },
  medium: { fish: 60, bubbles: 40, sharks: 2 },
  high: { fish: 120, bubbles: 80, sharks: 3 }
}

// Performance scaling factors
const PERFORMANCE_SCALING = {
  high: 1.0,
  medium: 0.7,
  low: 0.4
}

export const useOceanStore = create<OceanState>((set, get) => ({
  scrollProgress: 0,
  isScrolling: false,
  density: 'medium',
  effectsEnabled: true,
  fps: 60,
  performanceLevel: 'high',
  fishCount: 60,
  bubbleCount: 40,
  sharkCount: 2,
  reducedMotion: false,
  
  setScrollProgress: (progress) => {
    set({ scrollProgress: Math.max(0, Math.min(1, progress)) })
    get().updateCounts()
  },
  
  setIsScrolling: (scrolling) => set({ isScrolling: scrolling }),
  
  setDensity: (density) => {
    set({ density })
    get().updateCounts()
    
    // Update URL params
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('density', density)
      window.history.replaceState({}, '', url.toString())
    }
  },
  
  setEffectsEnabled: (enabled) => {
    set({ effectsEnabled: enabled })
    get().updateCounts()
  },
  
  setFPS: (fps) => {
    set({ fps })
    
    // Update performance level based on FPS
    let performanceLevel: 'high' | 'medium' | 'low' = 'high'
    if (fps < 30) performanceLevel = 'low'
    else if (fps < 45) performanceLevel = 'medium'
    
    set({ performanceLevel })
    get().updateCounts()
  },
  
  updateCounts: () => {
    const state = get()
    const { density, scrollProgress, effectsEnabled, performanceLevel, reducedMotion } = state
    
    // Base counts from density preset
    const preset = DENSITY_PRESETS[density]
    const perfScale = PERFORMANCE_SCALING[performanceLevel]
    
    // Apply scroll progress scaling (starts from 0.2, grows to 1.0)
    const scrollScale = 0.2 + (scrollProgress * 0.8)
    
    // Apply reduced motion scaling
    const motionScale = reducedMotion ? 0.3 : 1.0
    
    // Calculate final counts
    let fishCount = Math.round(preset.fish * perfScale * scrollScale * motionScale)
    let bubbleCount = Math.round(preset.bubbles * perfScale * scrollScale * motionScale)
    let sharkCount = Math.round(preset.sharks * perfScale * motionScale)
    
    // Apply effects toggle
    if (!effectsEnabled) {
      fishCount = Math.round(fishCount * 0.5)
      bubbleCount = Math.round(bubbleCount * 0.3)
    }
    
    // Ensure minimum values
    fishCount = Math.max(reducedMotion ? 5 : 10, fishCount)
    bubbleCount = Math.max(reducedMotion ? 3 : 8, bubbleCount)
    sharkCount = Math.max(reducedMotion ? 0 : 1, sharkCount)
    
    set({ fishCount, bubbleCount, sharkCount })
  },
  
  setReducedMotion: (reduced) => {
    set({ reducedMotion: reduced })
    get().updateCounts()
  }
}))

// Initialize from URL params and media query
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search)
  const densityParam = urlParams.get('density')
  
  if (densityParam && ['low', 'medium', 'high'].includes(densityParam)) {
    useOceanStore.getState().setDensity(densityParam as 'low' | 'medium' | 'high')
  }
  
  // Check for reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  useOceanStore.getState().setReducedMotion(mediaQuery.matches)
  
  mediaQuery.addListener((e) => {
    useOceanStore.getState().setReducedMotion(e.matches)
  })
}
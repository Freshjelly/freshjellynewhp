import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useOceanStore } from '../stores/oceanStore'

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Scroll tracking state
let scrollTimeout: number | null = null
let isInitialized = false

/**
 * Initialize scroll animations and tracking
 */
export function initializeScrollAnimations() {
  if (isInitialized || typeof window === 'undefined') return
  
  const store = useOceanStore.getState()
  
  // Track overall scroll progress
  ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const progress = self.progress
      store.setScrollProgress(progress)
      
      // Set scrolling flag
      store.setIsScrolling(true)
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      
      // Set timeout to clear scrolling flag
      scrollTimeout = window.setTimeout(() => {
        store.setIsScrolling(false)
      }, 150) // Stop scrolling detection after 150ms of inactivity
    }
  })
  
  // Beach header parallax
  const beachElements = [
    { selector: '.sun', speed: 0.5, yPercent: -20 },
    { selector: '.cloud-1', speed: 0.3, yPercent: -30 },
    { selector: '.cloud-2', speed: 0.4, yPercent: -25 },
    { selector: '.distant-waves', speed: 0.6, yPercent: -10 }
  ]
  
  beachElements.forEach(({ selector, speed, yPercent }) => {
    const elements = document.querySelectorAll(selector)
    if (elements.length > 0) {
      ScrollTrigger.create({
        trigger: "#beach-hero",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress
          const y = progress * yPercent * speed
          
          elements.forEach(el => {
            gsap.set(el, { yPercent: y })
          })
        }
      })
    }
  })
  
  // Fade out beach header as we scroll
  ScrollTrigger.create({
    trigger: "#beach-hero",
    start: "top top",
    end: "bottom top",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress
      const opacity = Math.max(0, 1 - progress * 1.5)
      const scale = Math.max(0.8, 1 - progress * 0.2)
      
      gsap.set("#beach-hero .hero-content", {
        opacity: opacity,
        scale: scale
      })
    }
  })
  
  // Ocean section entrance
  ScrollTrigger.create({
    trigger: "#ocean",
    start: "top bottom",
    end: "top center",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress
      const y = (1 - progress) * 100
      
      gsap.set("#ocean", {
        yPercent: y,
        opacity: progress
      })
    }
  })
  
  // Deep sea section parallax
  ScrollTrigger.create({
    trigger: "#deep-sea",
    start: "top bottom",
    end: "bottom top",
    scrub: 2,
    onUpdate: (self) => {
      const progress = self.progress
      const y = progress * -30
      
      // Parallax effect for deep sea content
      gsap.set("#deep-sea canvas", {
        yPercent: y
      })
    }
  })
  
  // Deep sea fog intensity based on scroll
  ScrollTrigger.create({
    trigger: "#deep-sea",
    start: "top center",
    end: "bottom center",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress
      // This would be used by the 3D scene to adjust fog density
      // The 3D scene can listen to scroll progress via the store
      
      // Darker background as we go deeper
      const darkness = 0.2 + (progress * 0.6)
      gsap.set("#deep-sea", {
        filter: `brightness(${1 - darkness})`
      })
    }
  })
  
  // Smooth scroll behavior for navigation
  const scrollLinks = document.querySelectorAll('a[href^="#"]')
  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const href = link.getAttribute('href')
      if (!href) return
      
      const target = document.querySelector(href)
      if (target) {
        gsap.to(window, {
          duration: 1.5,
          scrollTo: {
            y: target,
            offsetY: 0
          },
          ease: "power2.inOut"
        })
      }
    })
  })
  
  // Mouse parallax for hero section
  const hero = document.getElementById('beach-hero')
  if (hero) {
    let mouseX = 0
    let mouseY = 0
    let isMouseActive = false
    
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect()
      mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width
      mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height
      isMouseActive = true
      
      // Apply mouse parallax to hero elements
      gsap.to('.sun', {
        duration: 2,
        x: mouseX * 20,
        y: mouseY * 10,
        ease: "power2.out"
      })
      
      gsap.to('.cloud-1', {
        duration: 3,
        x: mouseX * 15,
        y: mouseY * 8,
        ease: "power2.out"
      })
      
      gsap.to('.cloud-2', {
        duration: 2.5,
        x: mouseX * -10,
        y: mouseY * 5,
        ease: "power2.out"
      })
    })
    
    hero.addEventListener('mouseleave', () => {
      isMouseActive = false
      
      // Return elements to original positions
      gsap.to(['.sun', '.cloud-1', '.cloud-2'], {
        duration: 1.5,
        x: 0,
        y: 0,
        ease: "power2.out"
      })
    })
  }
  
  // Performance monitoring
  let fps = 60
  let lastTime = performance.now()
  let frameCount = 0
  
  const monitorPerformance = () => {
    const now = performance.now()
    frameCount++
    
    if (now - lastTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (now - lastTime))
      frameCount = 0
      lastTime = now
      
      // Update store with current FPS
      store.setFPS(fps)
      
      // Adjust ScrollTrigger refresh rate based on performance
      if (fps < 30) {
        ScrollTrigger.refresh()
      }
    }
    
    requestAnimationFrame(monitorPerformance)
  }
  
  monitorPerformance()
  
  // Refresh ScrollTrigger on resize
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh()
  })
  
  isInitialized = true
}

/**
 * Clean up scroll animations
 */
export function cleanupScrollAnimations() {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
    scrollTimeout = null
  }
  
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  isInitialized = false
}

/**
 * Manually trigger scroll to section
 */
export function scrollToSection(sectionId: string, duration: number = 1.5) {
  const target = document.getElementById(sectionId)
  if (!target) return
  
  gsap.to(window, {
    duration,
    scrollTo: {
      y: target,
      offsetY: 0
    },
    ease: "power2.inOut"
  })
}

/**
 * Create entrance animation for elements
 */
export function createEntranceAnimation(
  selector: string, 
  options: {
    delay?: number
    duration?: number
    from?: gsap.TweenVars
    to?: gsap.TweenVars
  } = {}
) {
  const {
    delay = 0,
    duration = 1,
    from = { opacity: 0, y: 50 },
    to = { opacity: 1, y: 0 }
  } = options
  
  const elements = document.querySelectorAll(selector)
  if (elements.length === 0) return
  
  gsap.fromTo(elements, from, {
    ...to,
    duration,
    delay,
    ease: "power2.out",
    stagger: 0.1
  })
}

/**
 * Create stagger animation for lists of elements
 */
export function createStaggerAnimation(
  selector: string,
  options: {
    trigger?: string
    from?: gsap.TweenVars
    to?: gsap.TweenVars
    stagger?: number
    duration?: number
  } = {}
) {
  const {
    trigger = selector,
    from = { opacity: 0, y: 30 },
    to = { opacity: 1, y: 0 },
    stagger = 0.1,
    duration = 0.8
  } = options
  
  ScrollTrigger.create({
    trigger,
    start: "top 80%",
    end: "bottom 20%",
    once: true,
    onEnter: () => {
      gsap.fromTo(selector, from, {
        ...to,
        duration,
        stagger,
        ease: "power2.out"
      })
    }
  })
}

/**
 * Get current scroll progress
 */
export function getScrollProgress(): number {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  return Math.min(1, Math.max(0, scrollTop / scrollHeight))
}

/**
 * Reduced motion check and setup
 */
export function setupReducedMotion() {
  if (typeof window === 'undefined') return
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  
  const handleReducedMotion = (e: MediaQueryListEvent | MediaQueryList) => {
    const store = useOceanStore.getState()
    store.setReducedMotion(e.matches)
    
    if (e.matches) {
      // Disable complex animations
      gsap.set("*", { clearProps: "all" })
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.animation) {
          trigger.animation.progress(1).kill()
        }
      })
    }
  }
  
  // Initial check
  handleReducedMotion(mediaQuery)
  
  // Listen for changes
  mediaQuery.addListener(handleReducedMotion)
  
  return () => mediaQuery.removeListener(handleReducedMotion)
}
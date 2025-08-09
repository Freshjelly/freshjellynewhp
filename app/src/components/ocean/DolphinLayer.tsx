import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useOceanStore } from '../../stores/oceanStore'

interface Dolphin {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  angle: number
  jumpPhase: number
  jumpHeight: number
  isJumping: boolean
  pathProgress: number
  pathIndex: number
}

// Bezier curve helper for smooth dolphin paths
const bezierCurve = (t: number, p0: number, p1: number, p2: number, p3: number): number => {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

export const DolphinLayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isVisible, setIsVisible] = useState(false)
  
  const dolphinsRef = useRef<Dolphin[]>([])
  const lastGroupEventRef = useRef<number>(0)
  
  const {
    scrollProgress,
    effectsEnabled,
    reducedMotion
  } = useOceanStore()

  // Predefined paths for dolphin movement
  const jumpPaths = [
    // Surface jump path
    { 
      startX: -100, endX: window.innerWidth + 100,
      startY: 0.2, endY: 0.15, // Relative to canvas height
      controlY1: 0.05, controlY2: 0.1,
      duration: 8000 
    },
    // Mid-depth crossing
    { 
      startX: window.innerWidth + 100, endX: -100,
      startY: 0.4, endY: 0.45,
      controlY1: 0.3, controlY2: 0.35,
      duration: 10000 
    },
    // Deep water path
    { 
      startX: -100, endX: window.innerWidth + 100,
      startY: 0.7, endY: 0.6,
      controlY1: 0.5, controlY2: 0.65,
      duration: 12000 
    }
  ]

  // Create a new dolphin
  const createDolphin = useCallback((pathIndex: number = 0): Dolphin => {
    const path = jumpPaths[pathIndex]
    const canvas = canvasRef.current
    if (!canvas) return {} as Dolphin
    
    return {
      x: path.startX,
      y: canvas.height * path.startY,
      vx: 0,
      vy: 0,
      size: 12 + Math.random() * 8,
      angle: 0,
      jumpPhase: 0,
      jumpHeight: 0,
      isJumping: false,
      pathProgress: 0,
      pathIndex
    }
  }, [])

  // Update dolphin along path
  const updateDolphin = useCallback((dolphin: Dolphin, deltaTime: number, canvas: HTMLCanvasElement) => {
    const path = jumpPaths[dolphin.pathIndex]
    if (!path) return
    
    // Update path progress
    dolphin.pathProgress += deltaTime / path.duration
    
    if (dolphin.pathProgress > 1) {
      // Reset for another cycle or remove
      dolphin.pathProgress = 0
      dolphin.x = path.startX
    }
    
    const t = dolphin.pathProgress
    
    // Calculate position along bezier curve
    const newX = bezierCurve(
      t,
      path.startX,
      path.startX + (path.endX - path.startX) * 0.3,
      path.startX + (path.endX - path.startX) * 0.7,
      path.endX
    )
    
    const newY = bezierCurve(
      t,
      canvas.height * path.startY,
      canvas.height * path.controlY1,
      canvas.height * path.controlY2,
      canvas.height * path.endY
    )
    
    // Calculate velocity for angle
    dolphin.vx = newX - dolphin.x
    dolphin.vy = newY - dolphin.y
    dolphin.angle = Math.atan2(dolphin.vy, dolphin.vx)
    
    // Update position
    dolphin.x = newX
    dolphin.y = newY
    
    // Jump effect for surface dolphins
    if (dolphin.pathIndex === 0 && t > 0.3 && t < 0.7) {
      const jumpT = (t - 0.3) / 0.4
      dolphin.jumpHeight = Math.sin(jumpT * Math.PI) * 40
      dolphin.isJumping = true
    } else {
      dolphin.jumpHeight = 0
      dolphin.isJumping = false
    }
  }, [])

  // Render dolphin silhouette
  const renderDolphin = useCallback((ctx: CanvasRenderingContext2D, dolphin: Dolphin) => {
    ctx.save()
    ctx.translate(dolphin.x, dolphin.y - dolphin.jumpHeight)
    ctx.rotate(dolphin.angle)
    
    const size = dolphin.size
    
    // Dolphin silhouette
    const gradient = ctx.createLinearGradient(-size, -size * 0.5, size, size * 0.5)
    gradient.addColorStop(0, 'rgba(64, 64, 64, 0.9)')
    gradient.addColorStop(0.5, 'rgba(96, 96, 96, 0.8)')
    gradient.addColorStop(1, 'rgba(128, 128, 128, 0.7)')
    
    ctx.fillStyle = gradient
    
    // Main body (ellipse)
    ctx.beginPath()
    ctx.ellipse(0, 0, size, size * 0.4, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Dorsal fin
    ctx.beginPath()
    ctx.moveTo(-size * 0.2, -size * 0.4)
    ctx.lineTo(-size * 0.1, -size * 0.8)
    ctx.lineTo(size * 0.1, -size * 0.6)
    ctx.closePath()
    ctx.fill()
    
    // Tail
    ctx.beginPath()
    ctx.moveTo(-size, 0)
    ctx.lineTo(-size * 1.3, -size * 0.3)
    ctx.lineTo(-size * 1.5, 0)
    ctx.lineTo(-size * 1.3, size * 0.3)
    ctx.closePath()
    ctx.fill()
    
    // Pectoral fin
    ctx.beginPath()
    ctx.moveTo(size * 0.2, size * 0.4)
    ctx.lineTo(size * 0.6, size * 0.8)
    ctx.lineTo(size * 0.4, size * 0.3)
    ctx.closePath()
    ctx.fill()
    
    // Beak/rostrum
    ctx.beginPath()
    ctx.ellipse(size * 0.8, 0, size * 0.3, size * 0.15, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Splash effect when jumping
    if (dolphin.isJumping && dolphin.jumpHeight > 20) {
      ctx.restore()
      ctx.save()
      ctx.translate(dolphin.x, dolphin.y)
      
      // Water droplets
      for (let i = 0; i < 5; i++) {
        const dropletX = (Math.random() - 0.5) * size * 2
        const dropletY = Math.random() * 20
        const dropletSize = Math.random() * 3 + 1
        
        ctx.fillStyle = 'rgba(135, 206, 235, 0.6)'
        ctx.beginPath()
        ctx.arc(dropletX, dropletY, dropletSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    ctx.restore()
  }, [])

  // Trigger dolphin group events based on scroll progress
  const triggerGroupEvent = useCallback(() => {
    if (reducedMotion) return
    
    const now = Date.now()
    const timeSinceLastEvent = now - lastGroupEventRef.current
    
    // Trigger events at specific scroll thresholds with cooldown
    const shouldTrigger = (
      (scrollProgress > 0.3 && scrollProgress < 0.35) ||
      (scrollProgress > 0.6 && scrollProgress < 0.65) ||
      (scrollProgress > 0.85 && scrollProgress < 0.9)
    ) && timeSinceLastEvent > 10000 // 10 second cooldown
    
    if (shouldTrigger) {
      lastGroupEventRef.current = now
      
      // Add 2-3 dolphins with different paths
      const numDolphins = 2 + Math.floor(Math.random() * 2)
      const dolphins = dolphinsRef.current
      
      for (let i = 0; i < numDolphins; i++) {
        const pathIndex = Math.floor(Math.random() * jumpPaths.length)
        const delay = i * 500 // Stagger the dolphins
        
        setTimeout(() => {
          dolphins.push(createDolphin(pathIndex))
        }, delay)
      }
    }
  }, [scrollProgress, reducedMotion, createDolphin])

  // Main animation loop
  const animate = useCallback((currentTime: number) => {
    if (!isVisible || reducedMotion) return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    
    if (!canvas || !ctx) return
    
    const deltaTime = Math.min(currentTime - (animationRef.current || currentTime), 50)
    
    // Clear canvas (transparent for overlay)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Update dolphins
    const dolphins = dolphinsRef.current
    for (let i = dolphins.length - 1; i >= 0; i--) {
      const dolphin = dolphins[i]
      updateDolphin(dolphin, deltaTime, canvas)
      
      // Remove dolphins that are off screen and completed their path
      if (dolphin.pathProgress > 1 && 
          (dolphin.x < -200 || dolphin.x > canvas.width + 200)) {
        dolphins.splice(i, 1)
        continue
      }
      
      // Render dolphin
      renderDolphin(ctx, dolphin)
    }
    
    // Check for group events
    triggerGroupEvent()
    
    // Maintain a minimum number of dolphins for ambiance
    if (effectsEnabled && dolphins.length < 1 && Math.random() < 0.005) {
      const pathIndex = Math.floor(Math.random() * jumpPaths.length)
      dolphins.push(createDolphin(pathIndex))
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [isVisible, reducedMotion, updateDolphin, renderDolphin, triggerGroupEvent, effectsEnabled, createDolphin])

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Intersection Observer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    
    observer.observe(canvas)
    
    return () => observer.disconnect()
  }, [])

  // Start animation
  useEffect(() => {
    if (isVisible && !reducedMotion) {
      const cleanup = initCanvas()
      animationRef.current = requestAnimationFrame(animate)
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        cleanup?.()
      }
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isVisible, reducedMotion, animate, initCanvas])

  return (
    <canvas
      ref={canvasRef}
      className="dolphin-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2
      }}
      aria-hidden="true"
    />
  )
}
import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useOceanStore } from '../../stores/oceanStore'

// Particle types
interface Bubble {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  life: number
  maxLife: number
}

interface Fish {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  angle: number
  flockX: number
  flockY: number
  species: 'small' | 'medium'
}

// Simple 2D vector operations
const vec2 = {
  add: (a: {x: number, y: number}, b: {x: number, y: number}) => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a: {x: number, y: number}, b: {x: number, y: number}) => ({ x: a.x - b.x, y: a.y - b.y }),
  mul: (a: {x: number, y: number}, s: number) => ({ x: a.x * s, y: a.y * s }),
  length: (a: {x: number, y: number}) => Math.sqrt(a.x * a.x + a.y * a.y),
  normalize: (a: {x: number, y: number}) => {
    const len = vec2.length(a)
    return len > 0 ? { x: a.x / len, y: a.y / len } : { x: 0, y: 0 }
  },
  distance: (a: {x: number, y: number}, b: {x: number, y: number}) => vec2.length(vec2.sub(a, b))
}

export const Ocean2DCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isVisible, setIsVisible] = useState(false)
  
  // Performance tracking
  const fpsRef = useRef({ 
    frames: 0, 
    lastTime: performance.now(),
    fps: 60
  })
  
  // Particle arrays
  const bubblesRef = useRef<Bubble[]>([])
  const fishRef = useRef<Fish[]>([])
  
  // Ocean store
  const {
    scrollProgress,
    isScrolling,
    fishCount,
    bubbleCount,
    effectsEnabled,
    reducedMotion,
    setFPS
  } = useOceanStore()

  // Noise function for natural movement
  const noise = useCallback((x: number, y: number) => {
    return Math.sin(x * 0.01 + Date.now() * 0.001) * 
           Math.cos(y * 0.015 + Date.now() * 0.0008) * 0.5
  }, [])

  // Initialize bubbles
  const createBubble = useCallback((x?: number, y?: number): Bubble => {
    const canvas = canvasRef.current
    if (!canvas) return {} as Bubble
    
    return {
      x: x ?? Math.random() * canvas.width,
      y: y ?? canvas.height + 50,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(Math.random() * 2 + 1),
      radius: Math.random() * 3 + 2,
      alpha: Math.random() * 0.6 + 0.4,
      life: 0,
      maxLife: Math.random() * 300 + 200
    }
  }, [])

  // Initialize fish
  const createFish = useCallback((species: 'small' | 'medium' = 'small'): Fish => {
    const canvas = canvasRef.current
    if (!canvas) return {} as Fish
    
    const size = species === 'small' ? Math.random() * 4 + 3 : Math.random() * 6 + 8
    
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.8 + canvas.height * 0.1,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 1,
      size,
      hue: species === 'small' ? Math.random() * 60 + 180 : Math.random() * 40 + 20,
      angle: Math.random() * Math.PI * 2,
      flockX: 0,
      flockY: 0,
      species
    }
  }, [])

  // Bubble physics update
  const updateBubbles = useCallback((ctx: CanvasRenderingContext2D, deltaTime: number) => {
    const canvas = ctx.canvas
    const bubbles = bubblesRef.current
    
    // Update existing bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const bubble = bubbles[i]
      
      // Age and movement
      bubble.life += deltaTime
      bubble.x += bubble.vx * deltaTime * 0.1
      bubble.y += bubble.vy * deltaTime * 0.1
      
      // Add noise for natural movement
      bubble.vx += noise(bubble.x, bubble.y) * 0.01
      
      // Scroll effect - faster bubbles when scrolling
      const scrollMultiplier = isScrolling ? 2.5 : 1.0
      bubble.vy *= scrollMultiplier
      
      // Remove old or off-screen bubbles
      if (bubble.life > bubble.maxLife || bubble.y < -50 || bubble.x < -50 || bubble.x > canvas.width + 50) {
        bubbles.splice(i, 1)
        continue
      }
      
      // Alpha fade near end of life
      if (bubble.life > bubble.maxLife * 0.8) {
        bubble.alpha *= 0.98
      }
    }
    
    // Emit new bubbles based on settings
    const targetBubbles = effectsEnabled ? bubbleCount : Math.floor(bubbleCount * 0.3)
    const emissionRate = isScrolling ? 0.3 : 0.1
    
    if (bubbles.length < targetBubbles && Math.random() < emissionRate) {
      // Emit from bottom or random positions during intense scrolling
      const emitX = isScrolling ? Math.random() * canvas.width : Math.random() * canvas.width
      const emitY = isScrolling ? canvas.height + Math.random() * 100 : canvas.height + 20
      
      bubbles.push(createBubble(emitX, emitY))
    }
  }, [bubbleCount, effectsEnabled, isScrolling, noise, createBubble])

  // Simple flocking behavior for fish
  const updateFish = useCallback((ctx: CanvasRenderingContext2D, deltaTime: number) => {
    const canvas = ctx.canvas
    const fish = fishRef.current
    const time = Date.now() * 0.001
    
    // Calculate flocking forces
    fish.forEach((fishA, i) => {
      let separateX = 0, separateY = 0
      let alignX = 0, alignY = 0
      let cohereX = 0, cohereY = 0
      let neighbors = 0
      
      // Check nearby fish
      fish.forEach((fishB, j) => {
        if (i === j) return
        
        const dist = vec2.distance(fishA, fishB)
        const maxDist = fishA.species === 'small' ? 50 : 80
        
        if (dist < maxDist && dist > 0) {
          neighbors++
          
          // Separation (avoid crowding)
          if (dist < 30) {
            const factor = 1 / dist
            separateX += (fishA.x - fishB.x) * factor
            separateY += (fishA.y - fishB.y) * factor
          }
          
          // Alignment (steer towards average heading)
          alignX += fishB.vx
          alignY += fishB.vy
          
          // Cohesion (steer towards center of mass)
          cohereX += fishB.x
          cohereY += fishB.y
        }
      })
      
      // Apply flocking rules
      if (neighbors > 0) {
        // Normalize forces
        alignX /= neighbors
        alignY /= neighbors
        cohereX = cohereX / neighbors - fishA.x
        cohereY = cohereY / neighbors - fishA.y
        
        // Apply with different weights
        fishA.flockX = separateX * 0.3 + alignX * 0.1 + cohereX * 0.05
        fishA.flockY = separateY * 0.3 + alignY * 0.1 + cohereY * 0.05
      }
      
      // Add some noise and current
      const noiseForce = noise(fishA.x + time * 100, fishA.y + time * 80)
      fishA.flockX += noiseForce * 0.2
      fishA.flockY += Math.sin(time + fishA.x * 0.01) * 0.1
      
      // Update velocity
      fishA.vx += fishA.flockX * 0.02
      fishA.vy += fishA.flockY * 0.02
      
      // Limit speed
      const maxSpeed = fishA.species === 'small' ? 1.5 : 1.0
      const speed = Math.sqrt(fishA.vx * fishA.vx + fishA.vy * fishA.vy)
      if (speed > maxSpeed) {
        fishA.vx = (fishA.vx / speed) * maxSpeed
        fishA.vy = (fishA.vy / speed) * maxSpeed
      }
      
      // Update position
      fishA.x += fishA.vx * deltaTime * 0.1
      fishA.y += fishA.vy * deltaTime * 0.1
      
      // Update angle for rendering
      fishA.angle = Math.atan2(fishA.vy, fishA.vx)
      
      // Wrap around screen
      if (fishA.x < -20) fishA.x = canvas.width + 20
      if (fishA.x > canvas.width + 20) fishA.x = -20
      if (fishA.y < -20) fishA.y = canvas.height + 20
      if (fishA.y > canvas.height + 20) fishA.y = -20
    })
    
    // Add/remove fish based on target count
    const targetFish = effectsEnabled ? fishCount : Math.floor(fishCount * 0.5)
    
    while (fish.length < targetFish) {
      const species = Math.random() < 0.8 ? 'small' : 'medium'
      fish.push(createFish(species))
    }
    
    while (fish.length > targetFish) {
      fish.pop()
    }
  }, [fishCount, effectsEnabled, noise, createFish])

  // Render bubbles
  const renderBubbles = useCallback((ctx: CanvasRenderingContext2D) => {
    const bubbles = bubblesRef.current
    
    bubbles.forEach(bubble => {
      ctx.save()
      ctx.globalAlpha = bubble.alpha
      
      // Gradient bubble
      const gradient = ctx.createRadialGradient(
        bubble.x, bubble.y, 0,
        bubble.x, bubble.y, bubble.radius
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(0.7, 'rgba(173, 216, 230, 0.4)')
      gradient.addColorStop(1, 'rgba(135, 206, 235, 0.1)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2)
      ctx.fill()
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.beginPath()
      ctx.arc(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, bubble.radius * 0.2, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })
  }, [])

  // Render fish
  const renderFish = useCallback((ctx: CanvasRenderingContext2D) => {
    const fish = fishRef.current
    
    fish.forEach(fishObj => {
      ctx.save()
      ctx.translate(fishObj.x, fishObj.y)
      ctx.rotate(fishObj.angle)
      
      const size = fishObj.size
      const hue = fishObj.hue
      
      // Fish body
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
      ctx.beginPath()
      ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Fish tail
      ctx.fillStyle = `hsl(${hue}, 60%, 50%)`
      ctx.beginPath()
      ctx.moveTo(-size, 0)
      ctx.lineTo(-size * 1.5, -size * 0.4)
      ctx.lineTo(-size * 1.2, 0)
      ctx.lineTo(-size * 1.5, size * 0.4)
      ctx.closePath()
      ctx.fill()
      
      // Eye (only for medium fish)
      if (fishObj.species === 'medium') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.beginPath()
        ctx.arc(size * 0.3, -size * 0.1, size * 0.15, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.beginPath()
        ctx.arc(size * 0.35, -size * 0.1, size * 0.08, 0, Math.PI * 2)
        ctx.fill()
      }
      
      ctx.restore()
    })
  }, [])

  // Main render function
  const render = useCallback((ctx: CanvasRenderingContext2D, deltaTime: number) => {
    const canvas = ctx.canvas
    
    // Clear with ocean gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#87CEEB')    // Sky blue at top
    gradient.addColorStop(0.3, '#4682B4')  // Steel blue
    gradient.addColorStop(0.6, '#191970')  // Midnight blue
    gradient.addColorStop(1, '#000080')    // Navy blue at bottom
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add subtle noise texture for water effect
    if (effectsEnabled && !reducedMotion) {
      const time = Date.now() * 0.001
      ctx.save()
      ctx.globalAlpha = 0.05
      ctx.fillStyle = `hsl(200, 50%, ${50 + Math.sin(time) * 10}%)`
      
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        ctx.fillRect(x, y, 1, 1)
      }
      ctx.restore()
    }
    
    // Update and render particles
    if (!reducedMotion) {
      updateBubbles(ctx, deltaTime)
      updateFish(ctx, deltaTime)
    }
    
    renderBubbles(ctx)
    renderFish(ctx)
    
    // Update FPS
    fpsRef.current.frames++
    if (performance.now() - fpsRef.current.lastTime > 1000) {
      fpsRef.current.fps = fpsRef.current.frames
      fpsRef.current.frames = 0
      fpsRef.current.lastTime = performance.now()
      setFPS(fpsRef.current.fps)
    }
  }, [effectsEnabled, reducedMotion, updateBubbles, updateFish, renderBubbles, renderFish, setFPS])

  // Animation loop
  const animate = useCallback((currentTime: number) => {
    if (!isVisible) return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    
    if (!canvas || !ctx) return
    
    const deltaTime = Math.min(currentTime - (animationRef.current || currentTime), 50) // Cap at 50ms
    
    render(ctx, deltaTime)
    
    animationRef.current = requestAnimationFrame(animate)
  }, [isVisible, render])

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      // Adjust resolution based on performance and device
      const performanceScale = fpsRef.current.fps < 30 ? 0.5 : fpsRef.current.fps < 45 ? 0.75 : 1
      const finalDpr = Math.min(dpr * performanceScale, 2)
      
      canvas.width = rect.width * finalDpr
      canvas.height = rect.height * finalDpr
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(finalDpr, finalDpr)
      }
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Intersection Observer for visibility
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

  // Start animation when visible
  useEffect(() => {
    if (isVisible) {
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
  }, [isVisible, animate, initCanvas])

  return (
    <div className="ocean-canvas-container">
      <canvas
        ref={canvasRef}
        className="ocean-canvas"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
        aria-hidden="true"
      />
    </div>
  )
}
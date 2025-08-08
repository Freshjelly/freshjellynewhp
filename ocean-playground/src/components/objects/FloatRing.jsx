import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useAppState } from '../../state/useAppState'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * Procedural Float Ring with Stripe Pattern
 * A colorful swimming ring with animated stripes
 */
const FloatRing = ({ position, onHover, onLeave }) => {
  const meshRef = useRef()
  const materialRef = useRef()
  const htmlRef = useRef()
  const baseY = position[1]
  
  const { depth } = useAppState()

  // Create custom stripe shader material
  const stripeMaterial = useMemo(() => {
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // Add slight vertex displacement for organic feel
        vec3 pos = position;
        float wave = sin(pos.x * 20.0 + pos.z * 15.0) * 0.003;
        pos += normal * wave;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `
    
    const fragmentShader = `
      uniform float uTime;
      uniform float uStripeCount;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        // Create rotating stripes around the ring
        float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
        float normalizedAngle = (angle + 3.14159) / (2.0 * 3.14159);
        
        float stripe = sin(normalizedAngle * uStripeCount * 2.0 * 3.14159 + uTime * 2.0);
        float stripePattern = smoothstep(-0.3, 0.3, stripe);
        
        vec3 color = mix(uColor1, uColor2, stripePattern);
        
        // Add subtle fresnel effect
        float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        color += fresnel * 0.2;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
    
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uStripeCount: { value: 8 },
        uColor1: { value: new THREE.Color(0xff6b6b) }, // Coral red
        uColor2: { value: new THREE.Color(0xffd93d) }, // Yellow
      }
    })
  }, [])

  // Floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      
      // Gentle floating motion
      meshRef.current.position.y = baseY + Math.sin(time * 0.8) * 0.15
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.1
      
      // Update shader time
      if (stripeMaterial.uniforms) {
        stripeMaterial.uniforms.uTime.value = time * 0.5
      }
    }
  })

  const handlePointerOver = (event) => {
    event.stopPropagation()
    onHover?.({
      title: 'Float Ring',
      titleJp: '浮き輪',
      description: 'A faded float ring, drifting gently in the currents. It once carried summer laughter.',
      descriptionJp: '潮にゆられて漂う色あせた浮き輪。かつては夏の笑い声を運んでいた。'
    }, event.point)
    
    // Animate scale on hover
    gsap.to(meshRef.current.scale, {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const handlePointerOut = () => {
    onLeave?.()
    
    // Return to normal scale
    gsap.to(meshRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <torusGeometry args={[0.6, 0.18, 16, 64]} />
        <primitive object={stripeMaterial} attach="material" />
      </mesh>
      
      {/* Proximity label - only show when underwater */}
      {depth >= 0.25 && (
        <Html
          ref={htmlRef}
          position={[0, 0.8, 0]}
          center
          distanceFactor={10}
          occlude
          pointerEvents="none"
          style={{
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none'
          }}
        >
          <div className="object-label" style={{ 
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.8rem',
            maxWidth: '200px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Float Ring</h4>
            <p style={{ margin: 0, opacity: 0.8 }}>浮き輪 - A summer memory adrift</p>
          </div>
        </Html>
      )}
    </group>
  )
}

export default FloatRing
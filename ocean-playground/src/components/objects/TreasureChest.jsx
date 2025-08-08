import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useAppState } from '../../state/useAppState'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * Procedural Treasure Chest
 * A wooden chest with metal hardware and subtle weathering
 */
const TreasureChest = ({ position, onHover, onLeave }) => {
  const groupRef = useRef()
  const chestRef = useRef()
  const lidRef = useRef()
  const htmlRef = useRef()
  const baseY = position[1]
  
  const { depth } = useAppState()

  // Wood texture material with subtle color variation
  const woodMaterial = useMemo(() => {
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    
    const fragmentShader = `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      // Simple noise function
      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        // Base wood color
        vec3 woodColor = vec3(0.4, 0.25, 0.15); // Dark brown
        
        // Add wood grain pattern
        float grain = noise(vUv * 20.0) * 0.3;
        float rings = sin(vUv.y * 30.0) * 0.1;
        
        woodColor += grain + rings;
        
        // Weathering effect
        float weathering = noise(vUv * 5.0) * 0.2;
        woodColor = mix(woodColor, vec3(0.3, 0.2, 0.1), weathering);
        
        // Simple lighting
        float NdotL = max(0.3, dot(vNormal, normalize(vec3(1.0, 1.0, 0.5))));
        woodColor *= NdotL;
        
        gl_FragColor = vec4(woodColor, 1.0);
      }
    `
    
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      }
    })
  }, [])

  // Metal hardware material
  const metalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x221100,
      emissiveIntensity: 0.1
    })
  }, [])

  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      
      // Gentle rocking motion
      groupRef.current.position.y = baseY + Math.sin(time * 0.6) * 0.08
      groupRef.current.rotation.z = Math.sin(time * 0.4) * 0.05
      groupRef.current.rotation.x = Math.cos(time * 0.7) * 0.03
      
      // Subtle lid movement (as if slightly loose)
      if (lidRef.current) {
        lidRef.current.rotation.x = Math.sin(time * 2.0) * 0.01
      }
      
      // Update shader time
      if (woodMaterial.uniforms) {
        woodMaterial.uniforms.uTime.value = time
      }
    }
  })

  const handlePointerOver = (event) => {
    event.stopPropagation()
    onHover?.({
      title: 'Treasure Chest',
      titleJp: '宝箱',
      description: 'An old chest, sealed tight. What\'s inside? Coins, jewels… or maybe just seashells.',
      descriptionJp: 'しっかり閉ざされた古い宝箱。中身は金貨や宝石か、それともただの貝殻か。'
    }, event.point)
    
    // Animate scale and add subtle glow
    gsap.to(groupRef.current.scale, {
      x: 1.05,
      y: 1.05,
      z: 1.05,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const handlePointerOut = () => {
    onLeave?.()
    
    gsap.to(groupRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Main chest body */}
      <mesh
        ref={chestRef}
        position={[0, 0, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.2, 0.6, 0.8]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>

      {/* Chest lid (curved) */}
      <mesh
        ref={lidRef}
        position={[0, 0.5, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.4, 0.4, 1.2, 16, 1, false, 0, Math.PI]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>

      {/* Metal bands */}
      <mesh position={[0, 0, -0.42]} castShadow>
        <boxGeometry args={[1.25, 0.05, 0.05]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.42]} castShadow>
        <boxGeometry args={[1.25, 0.05, 0.05]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* Lock mechanism */}
      <group position={[0, 0.1, 0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.15, 0.2, 0.1]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.08]} castShadow>
          <torusGeometry args={[0.06, 0.02, 8, 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
      </group>

      {/* Corner reinforcements */}
      {[-0.5, 0.5].map((x, i) => 
        [-0.35, 0.35].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0, z]} castShadow>
            <boxGeometry args={[0.08, 0.65, 0.08]} />
            <primitive object={metalMaterial} attach="material" />
          </mesh>
        ))
      )}
      
      {/* Proximity label - only show when underwater */}
      {depth >= 0.25 && (
        <Html
          ref={htmlRef}
          position={[0, 1.2, 0]}
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
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Treasure Chest</h4>
            <p style={{ margin: 0, opacity: 0.8 }}>宝箱 - Secrets of the deep</p>
          </div>
        </Html>
      )}
    </group>
  )
}

export default TreasureChest
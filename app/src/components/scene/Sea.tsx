import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Custom ocean shader material with Gerstner waves
 */
const OceanMaterial = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uWaveHeight: { value: 0.5 },
    uWaveFrequency: { value: 0.5 },
    uWaveSpeed: { value: 1.0 },
    uDeepColor: { value: new THREE.Color('#0a192f') },
    uSurfaceColor: { value: new THREE.Color('#4fc3f7') },
    uOpacity: { value: 0.8 }
  }), [])
  
  const vertexShader = `
    uniform float uTime;
    uniform float uWaveHeight;
    uniform float uWaveFrequency;
    uniform float uWaveSpeed;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vElevation;
    
    // Gerstner wave function
    vec3 gerstnerWave(vec2 position, vec2 direction, float amplitude, float wavelength, float speed) {
      float frequency = 2.0 * 3.14159 / wavelength;
      float phase = speed * frequency;
      float qa = frequency * amplitude;
      
      float x = direction.x;
      float z = direction.y;
      float dot = dot(direction, position);
      float c = cos(frequency * dot + phase * uTime);
      float s = sin(frequency * dot + phase * uTime);
      
      return vec3(
        qa * x * c,
        amplitude * s,
        qa * z * c
      );
    }
    
    void main() {
      vec3 pos = position;
      vec2 worldPos = pos.xz;
      
      // Multiple wave components for realistic ocean
      vec3 wave1 = gerstnerWave(worldPos, vec2(1.0, 0.0), uWaveHeight * 0.8, 12.0, uWaveSpeed);
      vec3 wave2 = gerstnerWave(worldPos, vec2(-0.7, 0.7), uWaveHeight * 0.5, 8.0, uWaveSpeed * 1.2);
      vec3 wave3 = gerstnerWave(worldPos, vec2(0.3, 0.9), uWaveHeight * 0.3, 5.0, uWaveSpeed * 0.8);
      
      vec3 waveSum = wave1 + wave2 + wave3;
      pos.y += waveSum.y;
      pos.x += waveSum.x * 0.1;
      pos.z += waveSum.z * 0.1;
      
      vPosition = pos;
      vElevation = waveSum.y;
      
      // Calculate normal for lighting
      vec3 tangent = vec3(1.0, waveSum.x, 0.0);
      vec3 bitangent = vec3(0.0, waveSum.z, 1.0);
      vNormal = normalize(cross(tangent, bitangent));
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `
  
  const fragmentShader = `
    uniform vec3 uDeepColor;
    uniform vec3 uSurfaceColor;
    uniform float uOpacity;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vElevation;
    
    void main() {
      // Depth-based color mixing
      float depthFactor = smoothstep(-50.0, 0.0, vPosition.y);
      vec3 color = mix(uDeepColor, uSurfaceColor, depthFactor + vElevation * 0.2);
      
      // Add foam/highlights on wave peaks
      float foam = smoothstep(0.3, 0.8, vElevation);
      color = mix(color, vec3(1.0), foam * 0.2);
      
      // Fresnel effect for surface reflections
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDirection)), 2.0);
      color = mix(color, uSurfaceColor * 1.2, fresnel * 0.3);
      
      gl_FragColor = vec4(color, uOpacity);
    }
  `
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })
  
  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      transparent
      side={THREE.DoubleSide}
    />
  )
}

/**
 * Volumetric fog simulation using particles
 */
const VolumetricFog = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const particleCount = 200
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100
      pos[i * 3 + 1] = Math.random() * 30 - 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100
    }
    return pos
  }, [])
  
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.01
      // Subtle vertical movement
      const time = clock.elapsedTime
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.001
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4fc3f7"
        size={0.5}
        transparent
        opacity={0.1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/**
 * Main Sea environment component
 */
export const Sea: React.FC<{
  waveHeight?: number
  fogDensity?: number
  enableCaustics?: boolean
}> = ({ 
  waveHeight = 0.5, 
  fogDensity = 0.3,
  enableCaustics = true 
}) => {
  return (
    <group>
      {/* Ocean surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[200, 200, 128, 128]} />
        <OceanMaterial />
      </mesh>
      
      {/* Volumetric fog effect */}
      <VolumetricFog />
      
      {/* Underwater ambient lighting */}
      <pointLight 
        position={[0, 15, 0]} 
        intensity={0.3} 
        color="#87ceeb"
        distance={40}
        decay={2}
      />
      
      {/* Caustics simulation (simplified) */}
      {enableCaustics && (
        <pointLight
          position={[10, 8, -5]}
          intensity={0.2}
          color="#4fc3f7"
          distance={25}
          decay={1.5}
        />
      )}
      
      {/* Three.js fog for depth */}
      <fog attach="fog" args={['#0a192f', 20, 80]} />
    </group>
  )
}
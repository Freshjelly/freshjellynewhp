import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface JellySwarmProps {
  count?: number
  radius?: number
  speedRange?: [number, number]
  playerPosition?: THREE.Vector3
}

/**
 * Jellyfish shader material with pulsing and translucency
 */
const createJellyfishMaterial = () => {
  const uniforms = {
    uTime: { value: 0 },
    uPulseAmplitude: { value: 0.2 },
    uPulseSpeed: { value: 2.0 },
    uTranslucency: { value: 0.7 },
    uEmissiveStrength: { value: 0.3 },
    uBaseColor: { value: new THREE.Color('#ff6b9d') },
    uEmissiveColor: { value: new THREE.Color('#c06c84') }
  }
  
  const vertexShader = `
    uniform float uTime;
    uniform float uPulseAmplitude;
    uniform float uPulseSpeed;
    
    attribute float instancePhase;
    attribute float instanceScale;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vPulse;
    varying float vDistanceFromCenter;
    
    void main() {
      vUv = uv;
      
      // Individual pulse timing based on instance
      float pulse = sin(uTime * uPulseSpeed + instancePhase) * 0.5 + 0.5;
      vPulse = pulse;
      
      // Distance from center of jellyfish bell (0 = center, 1 = edge)
      vDistanceFromCenter = length(uv - 0.5) * 2.0;
      
      // Apply pulsing deformation - stronger at the edges
      vec3 pos = position;
      float pulseEffect = pulse * uPulseAmplitude * vDistanceFromCenter;
      pos *= (1.0 + pulseEffect) * instanceScale;
      
      // Vertical oscillation
      pos.y += sin(uTime * 0.8 + instancePhase) * 0.3;
      
      vPosition = (instanceMatrix * vec4(pos, 1.0)).xyz;
      vNormal = normalize((instanceMatrix * vec4(normal, 0.0)).xyz);
      
      gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(pos, 1.0);
    }
  `
  
  const fragmentShader = `
    uniform float uTime;
    uniform float uTranslucency;
    uniform float uEmissiveStrength;
    uniform vec3 uBaseColor;
    uniform vec3 uEmissiveColor;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vPulse;
    varying float vDistanceFromCenter;
    
    void main() {
      // Fake subsurface scattering
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.0);
      
      // Pulsing glow effect
      float glowIntensity = vPulse * uEmissiveStrength;
      vec3 emissive = uEmissiveColor * glowIntensity;
      
      // Translucency effect - brighter at edges
      float edgeGlow = smoothstep(0.3, 1.0, vDistanceFromCenter) * uTranslucency;
      
      // Base color with translucency
      vec3 baseColor = mix(uBaseColor, uBaseColor * 1.5, edgeGlow);
      
      // Combine all effects
      vec3 finalColor = baseColor + emissive + fresnel * 0.2;
      
      // Alpha based on distance from center and pulse
      float alpha = (0.4 + edgeGlow * 0.4 + vPulse * 0.2) * uTranslucency;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
  
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })
}

/**
 * Individual jellyfish instance data
 */
interface JellyfishInstance {
  position: THREE.Vector3
  velocity: THREE.Vector3
  phase: number
  scale: number
  angle: number
  centerOffset: THREE.Vector3
}

export const JellySwarm: React.FC<JellySwarmProps> = ({
  count = 150,
  radius = 25,
  speedRange = [0.3, 0.8],
  playerPosition = new THREE.Vector3(0, 0, 10)
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const instancesRef = useRef<JellyfishInstance[]>([])
  
  // Create jellyfish geometry (simple sphere modified for bell shape)
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 16, 12)
    // Flatten the bottom for jellyfish bell shape
    const positions = geo.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1]
      if (y < 0) {
        positions[i + 1] = y * 0.3 // Flatten bottom
      }
    }
    geo.attributes.position.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])
  
  // Create material
  const material = useMemo(() => createJellyfishMaterial(), [])
  
  // Initialize instances
  const { matrices, phases, scales } = useMemo(() => {
    const matrices = new Float32Array(count * 16)
    const phases = new Float32Array(count)
    const scales = new Float32Array(count)
    const instances: JellyfishInstance[] = []
    
    const dummy = new THREE.Object3D()
    
    for (let i = 0; i < count; i++) {
      // Random position in donut shape
      const angle = Math.random() * Math.PI * 2
      const distFromCenter = radius * (0.5 + Math.random() * 0.5)
      const height = (Math.random() - 0.5) * 20
      
      const position = new THREE.Vector3(
        Math.cos(angle) * distFromCenter,
        height,
        Math.sin(angle) * distFromCenter
      )
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.02
      )
      
      const instance: JellyfishInstance = {
        position,
        velocity,
        phase: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 0.8,
        angle,
        centerOffset: new THREE.Vector3()
      }
      
      instances.push(instance)
      
      // Set initial matrix
      dummy.position.copy(position)
      dummy.scale.setScalar(instance.scale)
      dummy.updateMatrix()
      dummy.matrix.toArray(matrices, i * 16)
      
      phases[i] = instance.phase
      scales[i] = instance.scale
    }
    
    instancesRef.current = instances
    return { matrices, phases, scales }
  }, [count, radius])
  
  // Setup instanced attributes
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.setAttribute(
        'instancePhase',
        new THREE.InstancedBufferAttribute(phases, 1)
      )
      meshRef.current.geometry.setAttribute(
        'instanceScale', 
        new THREE.InstancedBufferAttribute(scales, 1)
      )
    }
  }, [phases, scales])
  
  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return
    
    // Update shader time
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    
    const instances = instancesRef.current
    const dummy = new THREE.Object3D()
    const avoidanceRadius = 5
    const avoidanceStrength = 0.02
    
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i]
      
      // Gentle circular motion around center
      instance.angle += (speedRange[0] + Math.random() * (speedRange[1] - speedRange[0])) * delta
      const centerRadius = radius * 0.7
      const targetX = Math.cos(instance.angle) * centerRadius
      const targetZ = Math.sin(instance.angle) * centerRadius
      
      // Smooth movement towards target position
      const targetPos = new THREE.Vector3(targetX, instance.position.y, targetZ)
      instance.velocity.add(
        targetPos.sub(instance.position).multiplyScalar(0.3 * delta)
      )
      
      // Player avoidance
      const distToPlayer = instance.position.distanceTo(playerPosition)
      if (distToPlayer < avoidanceRadius) {
        const avoidDirection = instance.position.clone().sub(playerPosition).normalize()
        instance.velocity.add(avoidDirection.multiplyScalar(avoidanceStrength))
      }
      
      // Damping
      instance.velocity.multiplyScalar(0.98)
      
      // Apply velocity
      instance.position.add(instance.velocity)
      
      // Vertical oscillation
      instance.position.y += Math.sin(state.clock.elapsedTime * 0.5 + instance.phase) * 0.002
      
      // Keep within bounds
      if (instance.position.length() > radius * 1.5) {
        instance.position.normalize().multiplyScalar(radius * 1.3)
      }
      
      // Update matrix
      dummy.position.copy(instance.position)
      dummy.scale.setScalar(instance.scale)
      dummy.lookAt(instance.position.clone().add(instance.velocity))
      dummy.updateMatrix()
      
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  
  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      material={material}
    >
      <primitive object={material} ref={materialRef} />
    </instancedMesh>
  )
}
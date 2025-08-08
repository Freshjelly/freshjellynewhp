import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAppState } from '../state/useAppState'
import * as THREE from 'three'

/**
 * Enhanced Ocean Surface with Depth-Based Effects
 * Dynamic water surface that responds to diving depth and environment
 */
const EnhancedOceanSurface = () => {
  const meshRef = useRef()
  const materialRef = useRef()
  
  const { 
    depth, 
    waterOpacity, 
    prefersReducedMotion,
    lowPowerMode 
  } = useAppState()

  // Custom ocean shader material
  const oceanMaterial = useMemo(() => {
    const vertexShader = `
      uniform float uTime;
      uniform float uWaveAmp;
      uniform float uWaveFreq;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vElevation;
      
      // Improved noise function
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
      }
      
      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      
      float snoise(vec3 v) {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0);
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 =   v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute( permute( permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                      dot(p2,x2), dot(p3,x3) ) );
      }
      
      void main() {
        vUv = uv;
        
        vec3 pos = position;
        
        // Multi-octave wave generation
        float elevation = 0.0;
        elevation += snoise(vec3(pos.x * uWaveFreq * 0.5, pos.z * uWaveFreq * 0.5, uTime * 0.5)) * uWaveAmp * 0.5;
        elevation += snoise(vec3(pos.x * uWaveFreq * 1.0, pos.z * uWaveFreq * 1.0, uTime * 0.8)) * uWaveAmp * 0.3;
        elevation += snoise(vec3(pos.x * uWaveFreq * 2.0, pos.z * uWaveFreq * 2.0, uTime * 1.2)) * uWaveAmp * 0.2;
        
        pos.y += elevation;
        vElevation = elevation;
        
        // Calculate normal for lighting
        float dx = snoise(vec3((pos.x + 0.1) * uWaveFreq, pos.z * uWaveFreq, uTime)) - snoise(vec3((pos.x - 0.1) * uWaveFreq, pos.z * uWaveFreq, uTime));
        float dz = snoise(vec3(pos.x * uWaveFreq, (pos.z + 0.1) * uWaveFreq, uTime)) - snoise(vec3(pos.x * uWaveFreq, (pos.z - 0.1) * uWaveFreq, uTime));
        
        vNormal = normalize(vec3(-dx * 5.0, 1.0, -dz * 5.0));
        vPosition = pos;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `
    
    const fragmentShader = `
      uniform float uTime;
      uniform float uDepth;
      uniform vec3 uColorShallow;
      uniform vec3 uColorDeep;
      uniform float uOpacity;
      uniform float uRefractionStrength;
      uniform sampler2D uNormalMap;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vElevation;
      
      void main() {
        // Base water colors based on depth
        vec3 waterColor = mix(uColorShallow, uColorDeep, uDepth);
        
        // Add foam to wave crests
        float foam = smoothstep(0.0, 0.02, vElevation);
        waterColor = mix(waterColor, vec3(0.9, 0.95, 1.0), foam * 0.3);
        
        // Fresnel effect for realistic water reflection
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDirection)), 2.0);
        
        // Apply fresnel to blend reflection and transparency
        float finalOpacity = mix(uOpacity * 0.3, uOpacity, fresnel);
        
        // Add subtle caustics pattern
        vec2 causticsUv = vUv * 4.0 + uTime * 0.1;
        float caustics1 = sin(causticsUv.x * 6.28) * sin(causticsUv.y * 6.28);
        float caustics2 = sin((causticsUv.x + causticsUv.y) * 4.0 + uTime);
        float caustics = (caustics1 + caustics2) * 0.1 + 0.9;
        
        waterColor *= caustics;
        
        // Add depth-based color shift
        float depthFactor = smoothstep(0.0, 1.0, uDepth);
        waterColor = mix(waterColor, uColorDeep * 0.7, depthFactor * 0.5);
        
        // Sparkle effect on surface
        float sparkle = sin(vUv.x * 100.0 + uTime * 3.0) * sin(vUv.y * 100.0 + uTime * 2.5);
        sparkle = smoothstep(0.95, 1.0, sparkle) * (1.0 - uDepth);
        waterColor += sparkle * vec3(0.3, 0.4, 0.5);
        
        gl_FragColor = vec4(waterColor, finalOpacity);
      }
    `
    
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDepth: { value: 0 },
        uWaveAmp: { value: prefersReducedMotion ? 0.01 : 0.02 },
        uWaveFreq: { value: 0.3 },
        uColorShallow: { value: new THREE.Color(0x4fc3f7) }, // Light blue
        uColorDeep: { value: new THREE.Color(0x1976d2) },    // Deep blue
        uOpacity: { value: 0.7 },
        uRefractionStrength: { value: 0.2 }
      },
      transparent: true,
      side: THREE.DoubleSide
    })
  }, [prefersReducedMotion])

  // Animation loop
  useFrame((state) => {
    if (materialRef.current) {
      const material = materialRef.current
      
      // Update uniforms
      material.uniforms.uTime.value = state.clock.elapsedTime
      material.uniforms.uDepth.value = depth
      material.uniforms.uOpacity.value = waterOpacity
      
      // Reduce wave amplitude in low power mode or reduced motion
      const targetWaveAmp = (lowPowerMode || prefersReducedMotion) ? 0.005 : 0.02
      material.uniforms.uWaveAmp.value = THREE.MathUtils.lerp(
        material.uniforms.uWaveAmp.value,
        targetWaveAmp,
        0.1
      )
      
      // Adjust reflection/transmission based on depth
      const reflectionStrength = depth * 0.5
      const transmissionStrength = Math.max(0.3, 1.0 - depth * 0.7)
      
      // Update colors based on depth
      const shallowColor = new THREE.Color().setHSL(0.55, 0.6 - depth * 0.2, 0.7)
      const deepColor = new THREE.Color().setHSL(0.6, 0.8 - depth * 0.3, 0.3 + depth * 0.2)
      
      material.uniforms.uColorShallow.value.copy(shallowColor)
      material.uniforms.uColorDeep.value.copy(deepColor)
    }
  })

  return (
    <>
      {/* Main water surface */}
      <mesh
        ref={meshRef}
        position={[0, 2.4, 0]} // Water surface level
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100, 64, 64]} />
        <primitive ref={materialRef} object={oceanMaterial} attach="material" />
      </mesh>
      
      {/* Underwater caustics plane (optional visual enhancement) */}
      {depth > 0.1 && (
        <mesh
          position={[0, 1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[80, 80]} />
          <meshBasicMaterial
            color={0x4fc3f7}
            transparent
            opacity={0.1 * depth}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </>
  )
}

export default EnhancedOceanSurface
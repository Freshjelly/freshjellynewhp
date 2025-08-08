import React from 'react'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useAppState } from '../state/useAppState'
import * as THREE from 'three'

/**
 * Post-processing Effects for Ocean Environment
 * Bloom, vignette, and chromatic aberration based on dive depth
 */
const PostProcessingEffects = () => {
  const { 
    bloomStrength, 
    vignetteStrength, 
    depth,
    lowPowerMode,
    isMobile 
  } = useAppState()

  // Skip post-processing on low-power devices or when explicitly disabled
  if (lowPowerMode) {
    return null
  }

  return (
    <EffectComposer multisampling={isMobile ? 0 : 4}>
      {/* Bloom Effect - Increases underwater glow */}
      {!isMobile && (
        <Bloom
          blendFunction={BlendFunction.ADD}
          intensity={bloomStrength}
          width={300}
          height={300}
          kernelSize={5}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.025}
        />
      )}
      
      {/* Vignette Effect - Darkens edges for underwater tunnel vision */}
      <Vignette
        offset={0.15}
        darkness={vignetteStrength}
        blendFunction={BlendFunction.NORMAL}
      />
      
      {/* Chromatic Aberration - Subtle lens distortion underwater */}
      {!isMobile && depth > 0.3 && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005 * depth, 0.0003 * depth)}
        />
      )}
    </EffectComposer>
  )
}

export default PostProcessingEffects
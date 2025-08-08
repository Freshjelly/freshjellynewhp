import React, { Suspense } from 'react'
import Scene from './components/Scene'
import Overlay from './components/ui/Overlay'

/**
 * Enhanced Ocean Playground App v3.0
 * Features robust boot system, Safe Mode fallback, and GLTF timeout handling
 */
function App() {
  return (
    <div id="app" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Main 3D Scene with robust initialization */}
      <Scene />
      
      {/* Enhanced UI Overlay with boot system */}
      <Overlay />
    </div>
  )
}

export default App
import React, { useState, useEffect } from 'react'

export interface SceneSettings {
  jellyfish: boolean
  sharks: boolean
  density: 'low' | 'medium' | 'high'
  enableCaustics: boolean
  enableFog: boolean
}

interface HudProps {
  settings: SceneSettings
  onSettingsChange: (settings: SceneSettings) => void
  performanceInfo?: {
    fps: number
    jellyfishCount: number
    sharkCount: number
  }
}

/**
 * Get density counts based on setting
 */
export const getDensityCounts = (density: SceneSettings['density']) => {
  switch (density) {
    case 'low':
      return { jellyfish: 60, sharks: 1 }
    case 'medium':
      return { jellyfish: 150, sharks: 2 }
    case 'high':
      return { jellyfish: 300, sharks: 3 }
    default:
      return { jellyfish: 150, sharks: 2 }
  }
}

/**
 * Parse URL query parameters for settings
 */
const parseUrlSettings = (): Partial<SceneSettings> => {
  if (typeof window === 'undefined') return {}
  
  const params = new URLSearchParams(window.location.search)
  const settings: Partial<SceneSettings> = {}
  
  const density = params.get('density') as SceneSettings['density']
  if (['low', 'medium', 'high'].includes(density)) {
    settings.density = density
  }
  
  if (params.get('jellyfish') === 'false') settings.jellyfish = false
  if (params.get('sharks') === 'false') settings.sharks = false
  if (params.get('caustics') === 'false') settings.enableCaustics = false
  if (params.get('fog') === 'false') settings.enableFog = false
  
  return settings
}

/**
 * Update URL with current settings
 */
const updateUrlSettings = (settings: SceneSettings) => {
  if (typeof window === 'undefined') return
  
  const params = new URLSearchParams()
  
  if (settings.density !== 'medium') params.set('density', settings.density)
  if (!settings.jellyfish) params.set('jellyfish', 'false')
  if (!settings.sharks) params.set('sharks', 'false')
  if (!settings.enableCaustics) params.set('caustics', 'false')
  if (!settings.enableFog) params.set('fog', 'false')
  
  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
  window.history.replaceState({}, '', newUrl)
}

export const Hud: React.FC<HudProps> = ({
  settings,
  onSettingsChange,
  performanceInfo
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [autoOptimize, setAutoOptimize] = useState(true)
  
  // Auto-optimization based on performance
  useEffect(() => {
    if (!autoOptimize || !performanceInfo) return
    
    const { fps } = performanceInfo
    
    // Auto-reduce density if FPS is low
    if (fps < 30 && settings.density === 'high') {
      onSettingsChange({ ...settings, density: 'medium' })
    } else if (fps < 20 && settings.density === 'medium') {
      onSettingsChange({ ...settings, density: 'low' })
    }
    // Auto-disable effects on very low FPS
    else if (fps < 15) {
      onSettingsChange({
        ...settings,
        enableCaustics: false,
        enableFog: false,
        sharks: false
      })
    }
  }, [performanceInfo, autoOptimize, settings, onSettingsChange])
  
  // Load settings from URL on mount
  useEffect(() => {
    const urlSettings = parseUrlSettings()
    if (Object.keys(urlSettings).length > 0) {
      onSettingsChange({ ...settings, ...urlSettings })
    }
  }, [])
  
  // Update URL when settings change
  useEffect(() => {
    updateUrlSettings(settings)
  }, [settings])
  
  const densityCounts = getDensityCounts(settings.density)
  
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 50,
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
        }}
        title="Scene Settings"
      >
        ⚙️
      </button>
      
      {/* Settings Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '5rem',
          right: '1rem',
          zIndex: 50,
          width: '20rem',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1rem',
          color: 'white',
          fontSize: '0.875rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Ocean Settings</h3>
            
            {/* Performance Info */}
            {performanceInfo && (
              <div style={{
                marginBottom: '0.75rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}>
                <div>FPS: {performanceInfo.fps.toFixed(1)}</div>
                <div>Jellyfish: {performanceInfo.jellyfishCount}</div>
                <div>Sharks: {performanceInfo.sharkCount}</div>
              </div>
            )}
            
            {/* Auto Optimize */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={autoOptimize}
                  onChange={(e) => setAutoOptimize(e.target.checked)}
                  style={{ borderRadius: '0.25rem' }}
                />
                <span>Auto-optimize for performance</span>
              </label>
            </div>
            
            {/* Density Setting */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Density ({densityCounts.jellyfish} jellyfish, {densityCounts.sharks} sharks)
              </label>
              <select
                value={settings.density}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  density: e.target.value as SceneSettings['density']
                })}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  border: 'none',
                  color: 'white'
                }}
              >
                <option value="low" style={{ color: 'black' }}>Low (60fps target)</option>
                <option value="medium" style={{ color: 'black' }}>Medium (45fps target)</option>
                <option value="high" style={{ color: 'black' }}>High (30fps target)</option>
              </select>
            </div>
            
            {/* Feature Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.jellyfish}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    jellyfish: e.target.checked
                  })}
                  style={{ borderRadius: '0.25rem' }}
                />
                <span>🪼 Jellyfish Swarm</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.sharks}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    sharks: e.target.checked
                  })}
                  style={{ borderRadius: '0.25rem' }}
                />
                <span>🦈 Shark Patrol</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.enableCaustics}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    enableCaustics: e.target.checked
                  })}
                  style={{ borderRadius: '0.25rem' }}
                />
                <span>✨ Caustics Lighting</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.enableFog}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    enableFog: e.target.checked
                  })}
                  style={{ borderRadius: '0.25rem' }}
                />
                <span>🌫️ Volumetric Fog</span>
              </label>
            </div>
            
            {/* Performance Tips */}
            {performanceInfo && performanceInfo.fps < 30 && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}>
                <strong>Performance tip:</strong> Try reducing density or disabling effects for better FPS.
              </div>
            )}
          </div>
          
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Settings are saved in URL for sharing
          </div>
        </div>
      )}
    </>
  )
}
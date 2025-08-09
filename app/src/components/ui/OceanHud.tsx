import React, { useState, useEffect } from 'react'
import { useOceanStore } from '../../stores/oceanStore'

export const OceanHud: React.FC = () => {
  const {
    density,
    effectsEnabled,
    fps,
    fishCount,
    bubbleCount,
    sharkCount,
    scrollProgress,
    setDensity,
    setEffectsEnabled
  } = useOceanStore()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  
  // Auto-collapse after inactivity
  useEffect(() => {
    if (!isExpanded) return
    
    const timer = setTimeout(() => {
      setIsExpanded(false)
    }, 10000) // Auto-collapse after 10 seconds
    
    return () => clearTimeout(timer)
  }, [isExpanded])
  
  // Performance color based on FPS
  const getPerformanceColor = (currentFps: number) => {
    if (currentFps >= 55) return '#4fc3f7'
    if (currentFps >= 40) return '#ffa726'
    return '#ef5350'
  }
  
  return (
    <div className="ocean-hud">
      {/* Main HUD toggle button */}
      <button
        className={`hud-toggle-btn ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse ocean controls' : 'Expand ocean controls'}
        title={isExpanded ? 'Collapse controls' : 'Ocean Controls'}
      >
        <div className="hud-icon">
          {isExpanded ? '×' : '⚙️'}
        </div>
        {!isExpanded && (
          <div className="hud-preview">
            <div className="density-indicator">
              {density.charAt(0).toUpperCase()}
            </div>
            <div className={`effects-indicator ${effectsEnabled ? 'on' : 'off'}`}>
              {effectsEnabled ? '●' : '○'}
            </div>
          </div>
        )}
      </button>
      
      {/* Expanded controls */}
      {isExpanded && (
        <div className="hud-panel">
          {/* Density Control */}
          <div className="hud-control">
            <label className="hud-label">Density</label>
            <div className="hud-buttons">
              <button
                className={`hud-button ${density === 'low' ? 'active' : ''}`}
                onClick={() => setDensity('low')}
                aria-label="Set density to low"
              >
                Low
              </button>
              <button
                className={`hud-button ${density === 'medium' ? 'active' : ''}`}
                onClick={() => setDensity('medium')}
                aria-label="Set density to medium"
              >
                Med
              </button>
              <button
                className={`hud-button ${density === 'high' ? 'active' : ''}`}
                onClick={() => setDensity('high')}
                aria-label="Set density to high"
              >
                High
              </button>
            </div>
          </div>
          
          {/* Effects Toggle */}
          <div className="hud-control">
            <label 
              className="hud-toggle"
              onClick={() => setEffectsEnabled(!effectsEnabled)}
            >
              <div className={`hud-checkbox ${effectsEnabled ? 'checked' : ''}`} />
              <span>Effects</span>
            </label>
          </div>
          
          {/* Performance Info Toggle */}
          <div className="hud-control">
            <label 
              className="hud-toggle"
              onClick={() => setShowPerformance(!showPerformance)}
            >
              <div className={`hud-checkbox ${showPerformance ? 'checked' : ''}`} />
              <span>Performance Info</span>
            </label>
          </div>
          
          {/* Current Status */}
          <div className="hud-status">
            <div className="status-item">
              <span>Progress:</span>
              <span>{Math.round(scrollProgress * 100)}%</span>
            </div>
            <div className="status-item">
              <span>Fish:</span>
              <span>{fishCount}</span>
            </div>
            <div className="status-item">
              <span>Bubbles:</span>
              <span>{bubbleCount}</span>
            </div>
            <div className="status-item">
              <span>Sharks:</span>
              <span>{sharkCount}</span>
            </div>
          </div>
          
          {/* Performance Details */}
          {showPerformance && (
            <div className="performance-info">
              <div className="perf-item">
                <span>FPS:</span>
                <span style={{ color: getPerformanceColor(fps) }}>
                  {fps.toFixed(1)}
                </span>
              </div>
              <div className="perf-item">
                <span>Status:</span>
                <span style={{ color: getPerformanceColor(fps) }}>
                  {fps >= 55 ? 'Excellent' : fps >= 40 ? 'Good' : 'Limited'}
                </span>
              </div>
              {typeof window !== 'undefined' && 'memory' in performance && (
                <div className="perf-item">
                  <span>Memory:</span>
                  <span>
                    {((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Help Text */}
          <div className="hud-help">
            <div className="help-text">
              Scroll to increase sea life density. 
              Lower settings improve performance.
            </div>
          </div>
        </div>
      )}
      
      {/* Accessibility improvements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Ocean density: {density}, Effects: {effectsEnabled ? 'enabled' : 'disabled'}, 
        Current sea life: {fishCount} fish, {bubbleCount} bubbles, {sharkCount} sharks
      </div>
    </div>
  )
}

// Add these styles to the existing animations.css or create inline styles
const styles = `
.ocean-hud {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  user-select: none;
}

.hud-toggle-btn {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
  justify-content: center;
}

.hud-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: #4fc3f7;
  transform: translateY(-2px);
}

.hud-toggle-btn.expanded {
  border-radius: 12px 12px 0 0;
  min-width: auto;
}

.hud-icon {
  font-size: 18px;
  margin-right: 8px;
}

.hud-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.density-indicator {
  background: #4fc3f7;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.effects-indicator {
  font-size: 14px;
}

.effects-indicator.on {
  color: #4fc3f7;
}

.effects-indicator.off {
  color: #666;
}

.hud-panel {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-top: none;
  border-radius: 0 0 12px 12px;
  padding: 16px;
  color: white;
  min-width: 250px;
  margin-top: -1px;
}

.hud-control {
  margin-bottom: 16px;
}

.hud-control:last-child {
  margin-bottom: 0;
}

.hud-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #b0c4de;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hud-buttons {
  display: flex;
  gap: 4px;
}

.hud-button {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.hud-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.hud-button.active {
  background: #4fc3f7;
  border-color: #4fc3f7;
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.3);
}

.hud-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  font-weight: 500;
}

.hud-toggle:hover {
  color: #4fc3f7;
}

.hud-checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  margin-right: 10px;
  background: transparent;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.hud-checkbox.checked {
  background: #4fc3f7;
  border-color: #4fc3f7;
}

.hud-checkbox.checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: white;
  font-weight: bold;
}

.hud-status {
  margin: 16px 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-item span:first-child {
  color: #87ceeb;
}

.status-item span:last-child {
  font-weight: 500;
  color: white;
}

.performance-info {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.perf-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 11px;
}

.perf-item:last-child {
  margin-bottom: 0;
}

.perf-item span:first-child {
  color: #87ceeb;
  font-weight: 400;
}

.perf-item span:last-child {
  font-weight: 500;
}

.hud-help {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.help-text {
  font-size: 10px;
  color: #87ceeb;
  line-height: 1.4;
  opacity: 0.8;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ocean-hud {
    bottom: 10px;
    right: 10px;
  }
  
  .hud-panel {
    min-width: 200px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .hud-toggle-btn,
  .hud-button,
  .hud-checkbox {
    transition: none !important;
  }
  
  .hud-toggle-btn:hover,
  .hud-button:hover {
    transform: none !important;
  }
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
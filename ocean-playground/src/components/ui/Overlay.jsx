import React, { useEffect, useRef, useState } from 'react'
import { useAppState } from '../../state/useAppState'
import gsap from 'gsap'

/**
 * Enhanced UI Overlay with Accessibility and Dive Controls
 */
const Overlay = () => {
  const overlayRef = useRef()
  const welcomeRef = useRef()
  const [isVisible, setIsVisible] = useState(true)
  
  const {
    showUI,
    depth,
    isDiving,
    canResurface,
    welcomeMessageShown,
    lowPowerMode,
    setDiving,
    toggleLowPowerMode,
    toggleUI,
    regenerateLayout,
    setActivePanel
  } = useAppState()

  // Initialize overlay animation
  useEffect(() => {
    if (overlayRef.current) {
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 2 }
      )
    }
  }, [])

  // Welcome message animation
  useEffect(() => {
    if (welcomeMessageShown && welcomeRef.current) {
      const tl = gsap.timeline()
      
      tl.fromTo(welcomeRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
      .to(welcomeRef.current,
        { opacity: 0, y: -20, duration: 0.5, delay: 1.5, ease: "power2.in" }
      )
    }
  }, [welcomeMessageShown])

  const handleDive = () => {
    setDiving(true)
  }

  const handleSurface = () => {
    if (window.oceanPlayground?.surface) {
      window.oceanPlayground.surface()
    }
  }

  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  if (!showUI) return null

  return (
    <>
      <div ref={overlayRef} className="ui-overlay">
        {/* Logo */}
        <div className="logo">
          <h1 style={{ 
            margin: 0, 
            fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
            fontWeight: 300,
            letterSpacing: '0.5px'
          }}>
            Freshjelly's Ocean Playground
          </h1>
        </div>

        {/* Control Buttons */}
        <nav 
          className="controls"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'flex-end'
          }}
          role="navigation"
          aria-label="Ocean controls"
        >
          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row'
          }}>
            <ControlButton
              onClick={() => setActivePanel('about')}
              onKeyDown={(e) => handleKeyDown(e, () => setActivePanel('about'))}
              aria-label="Open About panel"
              title="About"
            >
              About
            </ControlButton>
            
            <ControlButton
              onClick={() => setActivePanel('works')}
              onKeyDown={(e) => handleKeyDown(e, () => setActivePanel('works'))}
              aria-label="Open Works panel"
              title="Works"
            >
              Works
            </ControlButton>
            
            <ControlButton
              onClick={() => setActivePanel('contact')}
              onKeyDown={(e) => handleKeyDown(e, () => setActivePanel('contact'))}
              aria-label="Open Contact panel"
              title="Contact"
            >
              Contact
            </ControlButton>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row'
          }}>
            <ControlButton
              onClick={toggleLowPowerMode}
              onKeyDown={(e) => handleKeyDown(e, toggleLowPowerMode)}
              aria-label={`${lowPowerMode ? 'Disable' : 'Enable'} low power mode`}
              title={`${lowPowerMode ? 'Disable' : 'Enable'} Low Power Mode`}
              className={lowPowerMode ? 'active' : ''}
            >
              ⚡ {lowPowerMode ? 'High' : 'Low'}
            </ControlButton>

            <ControlButton
              onClick={regenerateLayout}
              onKeyDown={(e) => handleKeyDown(e, regenerateLayout)}
              aria-label="Regenerate object layout (R key)"
              title="Regenerate Layout (R key)"
            >
              🎲 Reset
            </ControlButton>

            <ControlButton
              onClick={toggleUI}
              onKeyDown={(e) => handleKeyDown(e, toggleUI)}
              aria-label="Hide UI (H key)"
              title="Hide UI (H key)"
            >
              👁️ Hide
            </ControlButton>
          </div>

          {/* Dive/Surface Button */}
          <div style={{ marginTop: '0.5rem' }}>
            {!canResurface ? (
              <DiveButton
                onClick={handleDive}
                onKeyDown={(e) => handleKeyDown(e, handleDive)}
                disabled={isDiving}
                aria-label="Dive underwater"
                title="Dive underwater (or scroll)"
              >
                🌊 {isDiving ? 'Diving...' : 'Dive'}
              </DiveButton>
            ) : (
              <DiveButton
                onClick={handleSurface}
                onKeyDown={(e) => handleKeyDown(e, handleSurface)}
                aria-label="Surface from underwater"
                title="Return to surface"
              >
                ⬆️ Surface
              </DiveButton>
            )}
          </div>
        </nav>

        {/* Instructions */}
        <div 
          className="instructions"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '300px',
            lineHeight: '1.4'
          }}
          role="complementary"
          aria-label="Controls help"
        >
          <p style={{ margin: 0 }}>
            Scroll or press 'Dive' to descend. 'Surface' to go up.<br/>
            <kbd style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '0.1rem 0.3rem', 
              borderRadius: '3px',
              fontSize: '0.8rem'
            }}>R</kbd>=reset, <kbd style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '0.1rem 0.3rem', 
              borderRadius: '3px',
              fontSize: '0.8rem'
            }}>H</kbd>=hide UI, <kbd style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '0.1rem 0.3rem', 
              borderRadius: '3px',
              fontSize: '0.8rem'
            }}>L</kbd>=low power
          </p>
        </div>

        {/* Depth Indicator */}
        {depth > 0.1 && (
          <div
            className="depth-indicator"
            style={{
              position: 'fixed',
              top: '50%',
              left: '2rem',
              transform: 'translateY(-50%)',
              writing: 'vertical-lr',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.8rem',
              fontWeight: '300'
            }}
            role="status"
            aria-live="polite"
            aria-label={`Depth: ${Math.round(depth * 100)}%`}
          >
            DEPTH: {Math.round(depth * 100)}%
          </div>
        )}
      </div>

      {/* Welcome Message */}
      {welcomeMessageShown && (
        <div
          ref={welcomeRef}
          className="welcome-message"
          style={{
            position: 'fixed',
            bottom: '6rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '10px',
            fontSize: '1.1rem',
            textAlign: 'center',
            zIndex: 1000,
            opacity: 0
          }}
          role="status"
          aria-live="polite"
        >
          Welcome underwater. 🌊<br/>
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            海中へようこそ
          </span>
        </div>
      )}
    </>
  )
}

/**
 * Control Button Component with Accessibility
 */
const ControlButton = ({ children, className = '', ...props }) => (
  <button
    className={`nav-button ${className}`}
    style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '25px',
      padding: '0.7rem 1.2rem',
      color: 'white',
      fontSize: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      whiteSpace: 'nowrap'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = 'rgba(255, 255, 255, 0.2)'
      e.target.style.transform = 'translateY(-2px)'
      e.target.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)'
    }}
    onMouseLeave={(e) => {
      e.target.style.background = 'rgba(255, 255, 255, 0.1)'
      e.target.style.transform = 'translateY(0)'
      e.target.style.boxShadow = 'none'
    }}
    onFocus={(e) => {
      e.target.style.outline = '2px solid rgba(135, 206, 235, 0.8)'
      e.target.style.outlineOffset = '2px'
    }}
    onBlur={(e) => {
      e.target.style.outline = 'none'
    }}
    {...props}
  >
    {children}
  </button>
)

/**
 * Dive Button Component (Special styling)
 */
const DiveButton = ({ children, disabled, ...props }) => (
  <button
    style={{
      background: disabled 
        ? 'rgba(128, 128, 128, 0.3)' 
        : 'linear-gradient(135deg, rgba(30, 144, 255, 0.4), rgba(0, 100, 200, 0.6))',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(135, 206, 235, 0.4)',
      borderRadius: '30px',
      padding: '1rem 1.5rem',
      color: disabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      minWidth: '120px'
    }}
    disabled={disabled}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.target.style.transform = 'translateY(-3px) scale(1.05)'
        e.target.style.boxShadow = '0 8px 25px rgba(30, 144, 255, 0.3)'
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.target.style.transform = 'translateY(0) scale(1)'
        e.target.style.boxShadow = 'none'
      }
    }}
    onFocus={(e) => {
      e.target.style.outline = '2px solid rgba(135, 206, 235, 0.8)'
      e.target.style.outlineOffset = '2px'
    }}
    onBlur={(e) => {
      e.target.style.outline = 'none'
    }}
    {...props}
  >
    {children}
  </button>
)

export default Overlay
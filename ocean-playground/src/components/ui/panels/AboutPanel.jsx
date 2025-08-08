import React, { useEffect, useRef } from 'react'
import { useAppState } from '../../../state/useAppState'
import gsap from 'gsap'

const AboutPanel = () => {
  const panelRef = useRef()
  const { setActivePanel } = useAppState()

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current, 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      )
    }
  }, [])

  const handleClose = () => {
    setActivePanel(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div 
      ref={panelRef} 
      className="ui-panel"
      role="dialog"
      aria-labelledby="about-title"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '85vh',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '2rem',
        color: 'white',
        overflow: 'auto',
        zIndex: 1000
      }}
    >
      <button 
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.3)'
          e.target.style.transform = 'rotate(90deg)'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)'
          e.target.style.transform = 'rotate(0deg)'
        }}
        onFocus={(e) => {
          e.target.style.outline = '2px solid rgba(135, 206, 235, 0.8)'
          e.target.style.outlineOffset = '2px'
        }}
        onBlur={(e) => {
          e.target.style.outline = 'none'
        }}
        aria-label="Close about panel"
      >
        ×
      </button>
      
      <h2 id="about-title" style={{
        fontSize: '2rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontWeight: '300',
        background: 'linear-gradient(135deg, #87CEEB, #4682B4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        About
      </h2>
      
      <div style={{ lineHeight: '1.6' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.3rem',
            margin: '1.5rem 0 0.8rem 0',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            🌊 Who am I?
          </h3>
          <p style={{ marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.8)' }} lang="en">
            Hi! I'm <strong style={{ color: '#87CEEB' }}>Freshjelly</strong>, a creative developer who loves diving deep into the ocean of possibilities that web technologies offer. 
            I create interactive experiences that blend art, code, and imagination.
          </p>
          <p style={{ 
            fontStyle: 'italic', 
            fontSize: '0.9rem', 
            opacity: 0.8,
            marginBottom: '1rem',
            borderLeft: '3px solid rgba(135, 206, 235, 0.5)',
            paddingLeft: '1rem'
          }} lang="ja">
            こんにちは！<strong style={{ color: '#87CEEB' }}>Freshjelly</strong>です。Webテクノロジーが提供する可能性の海に深く潜るのが大好きなクリエイティブデベロッパーです。
            アート、コード、そして想像力を融合したインタラクティブな体験を創り出しています。
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.3rem',
            margin: '1.5rem 0 0.8rem 0',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            💫 What drives me?
          </h3>
          <p style={{ marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.8)' }} lang="en">
            Every bubble floating in this digital ocean represents an idea, a dream, or a solution waiting to surface. 
            I believe in creating experiences that not only function beautifully but also inspire wonder and curiosity.
          </p>
          <p style={{ 
            fontStyle: 'italic', 
            fontSize: '0.9rem', 
            opacity: 0.8,
            marginBottom: '1rem',
            borderLeft: '3px solid rgba(135, 206, 235, 0.5)',
            paddingLeft: '1rem'
          }} lang="ja">
            このデジタルオーシャンに浮かぶ一つ一つの泡は、アイデア、夢、そして表面化を待っている解決策を表しています。
            美しく機能するだけでなく、驚きと好奇心を与える体験を創造することを信じています。
          </p>
        </section>

        <section>
          <h3 style={{
            fontSize: '1.3rem',
            margin: '1.5rem 0 0.8rem 0',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            🛠️ My Ocean of Skills
          </h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ 
              marginBottom: '0.5rem',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.95rem',
              lineHeight: '1.8'
            }}>
              <strong style={{ color: '#4fc3f7' }}>🌊 Frontend:</strong> React, Three.js, WebGL, GSAP<br/>
              <strong style={{ color: '#29b6f6' }}>🐠 Backend:</strong> Node.js, Python, databases<br/>
              <strong style={{ color: '#81d4fa' }}>🌿 Design:</strong> UI/UX, 3D modeling, creative coding<br/>
              <strong style={{ color: '#b3e5fc' }}>🪸 Tools:</strong> Blender, Figma, creative experimentation
            </p>
          </div>
          
          <p style={{
            fontSize: '0.85rem',
            textAlign: 'center',
            marginTop: '1rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontStyle: 'italic'
          }}>
            <span lang="en">Mostly self-taught, always learning, forever curious about the depths of possibility.</span><br/>
            <span lang="ja">ほぼ独学、常に学び続け、可能性の深さに対して永遠に好奇心を持っています。</span>
          </p>
        </section>
      </div>
    </div>
  )
}

export default AboutPanel
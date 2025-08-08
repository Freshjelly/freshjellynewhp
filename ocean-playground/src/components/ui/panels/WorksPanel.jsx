import React, { useEffect, useRef } from 'react'
import { useAppState } from '../../../state/useAppState'
import gsap from 'gsap'

const WorksPanel = () => {
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

  const works = [
    {
      icon: '🤖',
      title: 'PR TIMES Automation',
      titleJp: 'PR TIMES 自動化',
      description: 'Automated data collection system that logs in, searches, and extracts contact information to Google Sheets.',
      descriptionJp: '自動でログイン・検索・連絡先抽出を行い、Googleスプレッドシートに出力するシステム。',
      tech: ['Python', 'Playwright', 'Google Sheets API', 'RegEx'],
      impact: 'Saves 8+ hours weekly'
    },
    {
      icon: '🌊',
      title: 'Ocean Playground',
      titleJp: 'オーシャンプレイグラウンド',
      description: 'This immersive WebGL ocean experience you\'re currently exploring! Built with React Three Fiber.',
      descriptionJp: '今まさに体験しているWebGL海中世界！React Three Fiberで制作。',
      tech: ['React', 'Three.js', 'WebGL', 'GSAP'],
      impact: 'Interactive art meets code'
    },
    {
      icon: '🎨',
      title: 'UI Component Library',
      titleJp: 'UIコンポーネントライブラリ',
      description: 'Reusable component library with accessibility-first design and smooth micro-interactions.',
      descriptionJp: 'アクセシビリティファーストでスムーズなマイクロインタラクションを備えた再利用可能なコンポーネントライブラリ。',
      tech: ['React', 'TypeScript', 'Storybook', 'Framer Motion'],
      impact: '40% faster development'
    },
    {
      icon: '🏢',
      title: 'Corporate Websites',
      titleJp: 'コーポレートサイト',
      description: 'Fast, accessible, and maintainable corporate websites built with modern JAMstack architecture.',
      descriptionJp: '高速でアクセシブル、保守性の高いモダンなJAMstackアーキテクチャのコーポレートサイト。',
      tech: ['Astro', 'Tailwind', 'CMS Integration'],
      impact: '95+ Lighthouse scores'
    },
    {
      icon: '⚡',
      title: 'Performance Optimizer',
      titleJp: 'パフォーマンス最適化ツール',
      description: 'Automated tool for analyzing and optimizing web performance, reducing bundle sizes and improving Core Web Vitals.',
      descriptionJp: 'Webパフォーマンスを分析・最適化し、バンドルサイズを削減してCore Web Vitalsを改善する自動ツール。',
      tech: ['Webpack', 'Lighthouse CI', 'Bundle Analysis'],
      impact: '60% faster load times'
    },
    {
      icon: '📱',
      title: 'Mobile-First Experiences',
      titleJp: 'モバイルファースト体験',
      description: 'Progressive Web Apps with offline capabilities, push notifications, and native-like performance.',
      descriptionJp: 'オフライン機能、プッシュ通知、ネイティブライクなパフォーマンスを備えたプログレッシブWebアプリ。',
      tech: ['PWA', 'Service Workers', 'IndexedDB'],
      impact: '80% mobile engagement'
    }
  ]

  return (
    <div 
      ref={panelRef} 
      className="ui-panel"
      role="dialog"
      aria-labelledby="works-title"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '700px',
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
        aria-label="Close works panel"
      >
        ×
      </button>
      
      <h2 id="works-title" style={{
        fontSize: '2rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontWeight: '300',
        background: 'linear-gradient(135deg, #87CEEB, #4682B4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Works
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 600 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {works.map((work, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)'
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              {work.icon}
            </div>
            
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.25rem',
              color: 'white',
              textAlign: 'center'
            }}>
              {work.title}
            </h3>
            
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              marginBottom: '0.75rem',
              fontStyle: 'italic'
            }} lang="ja">
              {work.titleJp}
            </p>
            
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.4',
              marginBottom: '0.5rem'
            }} lang="en">
              {work.description}
            </p>
            
            <p style={{
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.3',
              marginBottom: '1rem',
              borderLeft: '2px solid rgba(135, 206, 235, 0.3)',
              paddingLeft: '0.5rem',
              fontStyle: 'italic'
            }} lang="ja">
              {work.descriptionJp}
            </p>
            
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.25rem',
                marginBottom: '0.5rem'
              }}>
                {work.tech.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(135, 206, 235, 0.2)',
                      color: '#87CEEB',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(135, 206, 235, 0.3)'
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{
              fontSize: '0.8rem',
              color: '#4fc3f7',
              fontWeight: '500',
              textAlign: 'center',
              background: 'rgba(79, 195, 247, 0.1)',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(79, 195, 247, 0.2)'
            }}>
              💫 {work.impact}
            </div>
          </div>
        ))}
      </div>
      
      <section style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          marginBottom: '1rem',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          🚀 Current Focus
        </h3>
        <p style={{
          marginBottom: '1rem',
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: '1.5'
        }} lang="en">
          Currently diving deeper into <strong style={{ color: '#87CEEB' }}>WebXR</strong>, 
          advanced <strong style={{ color: '#4fc3f7' }}>shader programming</strong>, and 
          <strong style={{ color: '#29b6f6' }}> AI-assisted creative coding</strong>. 
          Always exploring new ways to push the boundaries of web-based experiences.
        </p>
        <p style={{ 
          fontStyle: 'italic', 
          fontSize: '0.9rem', 
          opacity: 0.8,
          color: 'rgba(255, 255, 255, 0.7)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '1rem'
        }} lang="ja">
          現在は<strong style={{ color: '#87CEEB' }}>WebXR</strong>、
          高度な<strong style={{ color: '#4fc3f7' }}>シェーダープログラミング</strong>、
          <strong style={{ color: '#29b6f6' }}>AI支援クリエイティブコーディング</strong>に深く取り組んでいます。
          Webベースの体験の境界を押し広げる新しい方法を常に探求しています。
        </p>
      </section>
    </div>
  )
}

export default WorksPanel
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * About Panel Component
 */
const AboutPanel = ({ onClose, isMobile }) => {
  const panelRef = useRef()

  useEffect(() => {
    gsap.fromTo(panelRef.current, 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
    )
  }, [])

  return (
    <div ref={panelRef} className="ui-panel">
      <button className="close-button" onClick={onClose}>×</button>
      <h2>About</h2>
      
      <h3>Who am I?</h3>
      <p>
        Hi! I'm Freshjelly, a creative developer who loves diving deep into the ocean of possibilities that web technologies offer. 
        I create interactive experiences that blend art, code, and imagination.
      </p>
      <p style={{ fontStyle: 'italic', fontSize: '0.9rem', opacity: 0.8 }}>
        こんにちは！Freshjellyです。Webテクノロジーが提供する可能性の海に深く潜るのが大好きなクリエイティブデベロッパーです。
        アート、コード、そして想像力を融合したインタラクティブな体験を創り出しています。
      </p>
      
      <h3>What drives me?</h3>
      <p>
        Every bubble floating in this digital ocean represents an idea, a dream, or a solution waiting to surface. 
        I believe in creating experiences that not only function beautifully but also inspire wonder.
      </p>
      <p style={{ fontStyle: 'italic', fontSize: '0.9rem', opacity: 0.8 }}>
        このデジタルオーシャンに浮かぶ一つ一つの泡は、アイデア、夢、そして表面化を待っている解決策を表しています。
        美しく機能するだけでなく、驚きを与える体験を創造することを信じています。
      </p>

      <h3>My Ocean of Skills</h3>
      <p>
        🌊 Frontend: React, Three.js, WebGL, GSAP<br/>
        🐠 Backend: Node.js, Python, databases<br/>
        🌿 Design: UI/UX, 3D modeling, creative coding<br/>
        🪸 Tools: Blender, Figma, creative experimentation
      </p>
    </div>
  )
}

/**
 * Works Panel Component
 */
const WorksPanel = ({ onClose, isMobile }) => {
  const panelRef = useRef()

  useEffect(() => {
    gsap.fromTo(panelRef.current, 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
    )
  }, [])

  return (
    <div ref={panelRef} className="ui-panel">
      <button className="close-button" onClick={onClose}>×</button>
      <h2>Works</h2>
      
      <div className="works-grid">
        <div className="work-item">
          <h4>🤖 PR TIMES Automation</h4>
          <p>Automated data collection system saving hours of manual work weekly.</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>毎週数時間の手作業を節約する自動化システム</p>
        </div>
        
        <div className="work-item">
          <h4>🌊 Ocean Playground</h4>
          <p>This immersive WebGL experience you're currently exploring!</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>今まさに体験しているWebGL作品</p>
        </div>
        
        <div className="work-item">
          <h4>🎨 Creative Experiments</h4>
          <p>Various interactive installations and artistic code experiments.</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>インタラクティブアートとコード実験</p>
        </div>
        
        <div className="work-item">
          <h4>🏢 Corporate Sites</h4>
          <p>Clean, fast, and maintainable websites built with modern tech stacks.</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>モダンな技術で構築された企業サイト</p>
        </div>
      </div>
      
      <h3>Current Focus</h3>
      <p>
        Currently diving deeper into WebXR, advanced shaders, and AI-assisted creative coding. 
        Always exploring new ways to push the boundaries of web-based experiences.
      </p>
      <p style={{ fontStyle: 'italic', fontSize: '0.9rem', opacity: 0.8 }}>
        現在はWebXR、高度なシェーダー、AI支援クリエイティブコーディングに深く取り組んでいます。
        Webベースの体験の境界を押し広げる新しい方法を常に探求しています。
      </p>
    </div>
  )
}

/**
 * Contact Panel Component
 */
const ContactPanel = ({ onClose, isMobile }) => {
  const panelRef = useRef()

  useEffect(() => {
    gsap.fromTo(panelRef.current, 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
    )
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate form submission
    alert('Message sent! 🌊 Thanks for reaching out! メッセージを送信しました！')
    onClose()
  }

  return (
    <div ref={panelRef} className="ui-panel">
      <button className="close-button" onClick={onClose}>×</button>
      <h2>Contact</h2>
      
      <p>
        Ready to dive into a new project together? Whether it's building something amazing 
        or just wanting to chat about the endless possibilities of creative coding, I'd love to hear from you!
      </p>
      <p style={{ fontStyle: 'italic', fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
        一緒に新しいプロジェクトに取り組みませんか？何か素晴らしいものを作ったり、
        クリエイティブコーディングの無限の可能性について話したり、お気軽にご連絡ください！
      </p>
      
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name / お名前</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="Your name..."
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email / メールアドレス</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="your.email@example.com"
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message / メッセージ</label>
          <textarea 
            id="message" 
            name="message" 
            rows="4"
            placeholder="Tell me about your project, ideas, or just say hello..."
            required
          ></textarea>
        </div>
        
        <button type="submit" className="submit-button">
          Send Message / メッセージを送信
        </button>
      </form>
    </div>
  )
}

/**
 * Object Label Component
 */
const ObjectLabel = ({ object, position }) => {
  const labelRef = useRef()

  useEffect(() => {
    if (labelRef.current && position) {
      gsap.fromTo(labelRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      )
    }
  }, [position])

  if (!object || !position) return null

  return (
    <div 
      ref={labelRef}
      className="object-label"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y - 50}px`,
      }}
    >
      <h3>{object.title}</h3>
      <p>{object.description}</p>
      <p className="jp">{object.titleJp} - {object.descriptionJp}</p>
    </div>
  )
}

/**
 * Main UI Overlay Component
 */
const UIOverlay = ({ 
  activePanel, 
  hoveredObject, 
  onOpenPanel, 
  onClosePanel, 
  isMobile 
}) => {
  const overlayRef = useRef()

  useEffect(() => {
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 2 }
    )
  }, [])

  const renderPanel = () => {
    switch (activePanel) {
      case 'about':
        return <AboutPanel onClose={onClosePanel} isMobile={isMobile} />
      case 'works':
        return <WorksPanel onClose={onClosePanel} isMobile={isMobile} />
      case 'contact':
        return <ContactPanel onClose={onClosePanel} isMobile={isMobile} />
      default:
        return null
    }
  }

  return (
    <div ref={overlayRef} className="ui-overlay">
      {/* Logo */}
      <div className="logo">
        Freshjelly's Ocean Playground
      </div>
      
      {/* Navigation */}
      <nav className="nav">
        <button 
          className="nav-button"
          onClick={() => onOpenPanel('about')}
        >
          About
        </button>
        <button 
          className="nav-button"
          onClick={() => onOpenPanel('works')}
        >
          Works
        </button>
        <button 
          className="nav-button"
          onClick={() => onOpenPanel('contact')}
        >
          Contact
        </button>
      </nav>
      
      {/* Object Label */}
      {hoveredObject && (
        <ObjectLabel 
          object={hoveredObject.object} 
          position={hoveredObject.position} 
        />
      )}
      
      {/* Active Panel */}
      {activePanel && renderPanel()}
      
      {/* Panel Background Overlay */}
      {activePanel && (
        <div 
          className="panel-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: -1
          }}
          onClick={onClosePanel}
        />
      )}
    </div>
  )
}

export default UIOverlay
import React, { useEffect, useRef, useState } from 'react'
import { useAppState } from '../../../state/useAppState'
import gsap from 'gsap'

const ContactPanel = () => {
  const panelRef = useRef()
  const { setActivePanel } = useAppState()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // Simulate form submission (replace with actual endpoint)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, always succeed
      // In real implementation, replace with:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      setSubmitStatus('success')
      setFormData({ name: '', email: '', message: '' })
      
      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
      
    } catch (error) {
      setSubmitStatus('error')
      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: '0.75rem',
    color: 'white',
    fontSize: '1rem',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500'
  }

  return (
    <div 
      ref={panelRef} 
      className="ui-panel"
      role="dialog"
      aria-labelledby="contact-title"
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
        aria-label="Close contact panel"
      >
        ×
      </button>
      
      <h2 id="contact-title" style={{
        fontSize: '2rem',
        marginBottom: '1rem',
        textAlign: 'center',
        fontWeight: '300',
        background: 'linear-gradient(135deg, #87CEEB, #4682B4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Contact
      </h2>
      
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{
          marginBottom: '0.5rem',
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: '1.5'
        }} lang="en">
          Ready to dive into a new project together? Whether it's building something amazing 
          or just wanting to chat about the endless possibilities of creative coding, I'd love to hear from you! 🌊
        </p>
        <p style={{ 
          fontStyle: 'italic', 
          fontSize: '0.9rem', 
          opacity: 0.7,
          color: 'rgba(255, 255, 255, 0.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '0.75rem',
          marginTop: '0.75rem'
        }} lang="ja">
          一緒に新しいプロジェクトに取り組みませんか？何か素晴らしいものを作ったり、
          クリエイティブコーディングの無限の可能性について話したり、お気軽にご連絡ください！
        </p>
      </div>
      
      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.2)',
          border: '1px solid rgba(76, 175, 80, 0.5)',
          color: '#81c784',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          ✅ Message sent successfully! I'll get back to you soon.<br/>
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>メッセージを送信しました！すぐにお返事します。</span>
        </div>
      )}

      {submitStatus === 'error' && (
        <div style={{
          background: 'rgba(244, 67, 54, 0.2)',
          border: '1px solid rgba(244, 67, 54, 0.5)',
          color: '#e57373',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          ❌ Failed to send message. Please try again.<br/>
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>メッセージの送信に失敗しました。もう一度お試しください。</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor="contact-name" style={labelStyle}>
            Name / お名前 <span style={{ color: '#ff6b6b' }}>*</span>
          </label>
          <input 
            type="text" 
            id="contact-name"
            name="name" 
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name..."
            required 
            disabled={isSubmitting}
            style={{
              ...inputStyle,
              opacity: isSubmitting ? 0.7 : 1
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(135, 206, 235, 0.6)'
              e.target.style.background = 'rgba(255, 255, 255, 0.15)'
              e.target.style.outline = '2px solid rgba(135, 206, 235, 0.3)'
              e.target.style.outlineOffset = '2px'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              e.target.style.outline = 'none'
            }}
          />
        </div>
        
        <div>
          <label htmlFor="contact-email" style={labelStyle}>
            Email / メールアドレス <span style={{ color: '#ff6b6b' }}>*</span>
          </label>
          <input 
            type="email" 
            id="contact-email"
            name="email" 
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required 
            disabled={isSubmitting}
            style={{
              ...inputStyle,
              opacity: isSubmitting ? 0.7 : 1
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(135, 206, 235, 0.6)'
              e.target.style.background = 'rgba(255, 255, 255, 0.15)'
              e.target.style.outline = '2px solid rgba(135, 206, 235, 0.3)'
              e.target.style.outlineOffset = '2px'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              e.target.style.outline = 'none'
            }}
          />
        </div>
        
        <div>
          <label htmlFor="contact-message" style={labelStyle}>
            Message / メッセージ <span style={{ color: '#ff6b6b' }}>*</span>
          </label>
          <textarea 
            id="contact-message"
            name="message" 
            rows="5"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell me about your project, ideas, or just say hello..."
            required
            disabled={isSubmitting}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '120px',
              opacity: isSubmitting ? 0.7 : 1
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(135, 206, 235, 0.6)'
              e.target.style.background = 'rgba(255, 255, 255, 0.15)'
              e.target.style.outline = '2px solid rgba(135, 206, 235, 0.3)'
              e.target.style.outlineOffset = '2px'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              e.target.style.outline = 'none'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: isSubmitting 
              ? 'rgba(128, 128, 128, 0.3)' 
              : 'linear-gradient(135deg, rgba(135, 206, 235, 0.4), rgba(79, 195, 247, 0.6))',
            border: '1px solid rgba(135, 206, 235, 0.4)',
            borderRadius: '10px',
            padding: '1rem',
            color: isSubmitting ? 'rgba(255, 255, 255, 0.5)' : 'white',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 25px rgba(135, 206, 235, 0.3)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = 'translateY(0)'
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
        >
          {isSubmitting ? (
            <>🌊 Sending... / 送信中...</>
          ) : (
            <>🚀 Send Message / メッセージを送信</>
          )}
        </button>
        
        <p style={{
          fontSize: '0.8rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontStyle: 'italic'
        }}>
          <span lang="en">Your message will be sent securely. I typically respond within 24 hours.</span><br/>
          <span lang="ja">メッセージは安全に送信されます。通常24時間以内に返信いたします。</span>
        </p>
      </form>
    </div>
  )
}

export default ContactPanel
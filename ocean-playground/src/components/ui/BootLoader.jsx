import React, { useEffect } from 'react'
import { useAppState } from '../../state/useAppState'

/**
 * Boot Loader with SafeMode handling and protocol warning
 */
const BootLoader = () => {
  const { 
    isBooting, 
    bootError, 
    safeMode, 
    protocolWarning, 
    retryBoot 
  } = useAppState()

  // Hide loader when boot is complete
  useEffect(() => {
    if (!isBooting) {
      const loadingElement = document.getElementById('loading')
      if (loadingElement) {
        setTimeout(() => {
          loadingElement.classList.add('hidden')
          // Dispatch a custom event to signal app is ready
          window.dispatchEvent(new CustomEvent('ocean-playground-ready'))
        }, 500)
      }
    }
  }, [isBooting])
  
  // 🚨 ADDITIONAL FALLBACK: Force hide loading after 10 seconds regardless
  useEffect(() => {
    const emergencyTimer = setTimeout(() => {
      console.warn('[BOOT] Emergency fallback - hiding loading screen after 10s')
      const loadingElement = document.getElementById('loading')
      if (loadingElement) {
        loadingElement.classList.add('hidden')
        window.dispatchEvent(new CustomEvent('ocean-playground-ready'))
      }
    }, 10000)
    
    return () => clearTimeout(emergencyTimer)
  }, [])

  if (!isBooting && !bootError && !protocolWarning) {
    return null
  }

  return (
    <>
      {/* Protocol Warning Banner */}
      {protocolWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.9), rgba(255, 193, 7, 0.9))',
          color: 'white',
          padding: '1rem',
          textAlign: 'center',
          zIndex: 2500,
          fontSize: '0.9rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
            ⚠️ File Protocol Detected
          </div>
          <div lang="en" style={{ marginBottom: '0.25rem' }}>
            You opened this via file:// — modules will fail. Run <code style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>npm run dev</code> and open http://localhost:5173
          </div>
          <div lang="ja" style={{ fontSize: '0.8rem', opacity: 0.9, fontStyle: 'italic' }}>
            file:// で開かれています。<code style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>npm run dev</code> でローカルサーバーから開いてください。
          </div>
        </div>
      )}

      {/* Boot Error / SafeMode Panel */}
      {bootError && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '500px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '2rem',
          color: 'white',
          textAlign: 'center',
          zIndex: 2000
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            {safeMode ? '🛡️' : '⚠️'}
          </div>
          
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '1rem',
            color: safeMode ? '#87CEEB' : '#ffb74d'
          }}>
            {safeMode ? 'Safe Mode Active' : 'Initialization Error'}
          </h2>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ 
              marginBottom: '0.75rem',
              lineHeight: '1.5'
            }} lang="en">
              {bootError === 'BOOT_TIMEOUT' && "Couldn't initialize advanced effects within 8 seconds."}
              {bootError === 'WEBGL_FAIL' && "WebGL context creation failed."}
              {safeMode && " Switched to Safe Mode with reduced effects."}
            </p>
            
            <p style={{
              fontSize: '0.9rem',
              opacity: 0.8,
              fontStyle: 'italic',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '0.75rem'
            }} lang="ja">
              {bootError === 'BOOT_TIMEOUT' && "8秒以内に高度なエフェクトを初期化できませんでした。"}
              {bootError === 'WEBGL_FAIL' && "WebGLコンテキストの作成に失敗しました。"}
              {safeMode && "エフェクトを削減したセーフモードに切り替えました。"}
            </p>
            
            {safeMode && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(135, 206, 235, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(135, 206, 235, 0.2)'
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  opacity: 0.9
                }}>
                  <strong style={{ color: '#87CEEB' }}>Safe Mode Features:</strong>
                  <ul style={{
                    textAlign: 'left',
                    marginTop: '0.5rem',
                    paddingLeft: '1rem'
                  }}>
                    <li>Post-processing effects disabled</li>
                    <li>Reduced bubble count ({typeof window !== 'undefined' && window.innerWidth < 768 ? '30' : '60'})</li>
                    <li>Simplified object count</li>
                    <li>Fixed pixel ratio (dpr=1)</li>
                    <li>Procedural objects only</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={retryBoot}
              style={{
                background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.4), rgba(79, 195, 247, 0.6))',
                border: '1px solid rgba(135, 206, 235, 0.4)',
                borderRadius: '10px',
                padding: '0.75rem 1.5rem',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 25px rgba(135, 206, 235, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              🔄 Retry / 再試行
            </button>
            
            {safeMode && (
              <button
                onClick={() => useAppState.getState().setBoot(false, null, false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 1.5rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                ✅ Continue in Safe Mode / セーフモードで続行
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default BootLoader
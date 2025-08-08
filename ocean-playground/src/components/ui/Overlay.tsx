import React, { useEffect, useRef } from 'react'
import { useAppState } from '../../state/useAppState'
import AboutPanel from './panels/AboutPanel'
import WorksPanel from './panels/WorksPanel'
import ContactPanel from './panels/ContactPanel'

/**
 * Protocol Warning Banner - Shows when opened via file://
 */
const ProtocolWarning: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.95), rgba(255, 193, 7, 0.95))',
      color: 'white',
      padding: '1rem',
      textAlign: 'center',
      zIndex: 3000,
      fontSize: '0.9rem',
      boxShadow: '0 2px 15px rgba(255, 152, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      borderBottom: '2px solid rgba(255, 255, 255, 0.3)'
    }}>
      <div style={{ 
        fontWeight: '700', 
        marginBottom: '0.5rem', 
        fontSize: '1rem',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
      }}>
        ⚠️ File Protocol Detected / ファイルプロトコルが検出されました
      </div>
      
      <div lang=\"en\" style={{ marginBottom: '0.5rem', lineHeight: '1.4' }}>
        You opened this via <strong>file://</strong>. Please run{' '}
        <code style={{
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          fontFamily: 'Monaco, Consolas, monospace',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>npm run dev</code>{' '}
        and open <strong>http://localhost:5173</strong>
      </div>
      
      <div lang=\"ja\" style={{ 
        fontSize: '0.8rem', 
        opacity: 0.9, 
        fontStyle: 'italic',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        paddingTop: '0.5rem'
      }}>
        <strong>file://</strong> で開かれています。{' '}
        <code style={{
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '0.2rem 0.4rem',
          borderRadius: '4px',
          fontFamily: 'Monaco, Consolas, monospace'
        }}>npm run dev</code>{' '}
        でローカルサーバーから開いてください。
      </div>
    </div>
  )
}

/**
 * Boot Error Banner - Shows initialization errors and Safe Mode
 */
const BootErrorBanner: React.FC = () => {
  const { bootError, safeMode, retryBoot } = useAppState()
  
  if (!bootError) return null
  
  const getErrorMessage = () => {
    switch (bootError) {
      case 'BOOT_TIMEOUT':
        return {
          en: \"Couldn't initialize advanced effects within 8 seconds.\",
          jp: \"8秒以内に高度なエフェクトを初期化できませんでした。\"
        }
      case 'WEBGL_FAIL':
        return {
          en: \"WebGL context creation failed.\",
          jp: \"WebGLコンテキストの作成に失敗しました。\"
        }
      case 'ASSET_TIMEOUT':
        return {
          en: \"3D model loading timed out.\",
          jp: \"3Dモデルの読み込みがタイムアウトしました。\"
        }
      case 'INIT_ERROR':
        return {
          en: \"General initialization error occurred.\",
          jp: \"一般的な初期化エラーが発生しました。\"
        }
      default:
        return {
          en: \"Unknown initialization error.\",
          jp: \"不明な初期化エラー。\"
        }
    }
  }
  
  const errorMsg = getErrorMessage()
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '600px',
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(20px)',
      border: safeMode ? '2px solid rgba(135, 206, 235, 0.6)' : '2px solid rgba(255, 107, 107, 0.6)',
      borderRadius: '20px',
      padding: '2.5rem',
      color: 'white',
      textAlign: 'center',
      zIndex: 2500,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '1.5rem',
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
      }}>
        {safeMode ? '🛡️' : '⚠️'}
      </div>
      
      <h2 style={{
        fontSize: '1.8rem',
        marginBottom: '1.5rem',
        color: safeMode ? '#87CEEB' : '#ff6b6b',
        fontWeight: '300',
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      }}>
        {safeMode ? 'Safe Mode Active' : 'Initialization Error'}
      </h2>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(5px)'
      }}>
        <p style={{ 
          marginBottom: '1rem',
          lineHeight: '1.6',
          fontSize: '1rem'
        }} lang=\"en\">
          {errorMsg.en}
          {safeMode && \" Switched to Safe Mode with reduced effects.\"}
        </p>
        
        <p style={{
          fontSize: '0.9rem',
          opacity: 0.8,
          fontStyle: 'italic',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          paddingTop: '1rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }} lang=\"ja\">
          {errorMsg.jp}
          {safeMode && \"エフェクトを削減したセーフモードに切り替えました。\"}
        </p>
        
        {safeMode && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: 'rgba(135, 206, 235, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(135, 206, 235, 0.3)'
          }}>
            <div style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              <div style={{ 
                color: '#87CEEB', 
                fontWeight: '600', 
                marginBottom: '0.75rem',
                fontSize: '1rem'
              }}>
                🛡️ Safe Mode Features:
              </div>
              <ul style={{
                textAlign: 'left',
                margin: 0,
                paddingLeft: '1.5rem',
                lineHeight: '1.5'
              }}>
                <li>Post-processing effects disabled</li>
                <li>Reduced bubble count (60 instead of 150)</li>
                <li>Simplified object count (2-3 instead of 15)</li>
                <li>Fixed pixel ratio (dpr=1)</li>
                <li>Procedural objects only (no GLTF loading)</li>
                <li>Reduced lighting and shadow complexity</li>
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
            background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.8), rgba(79, 195, 247, 0.9))',
            border: '2px solid rgba(135, 206, 235, 0.6)',
            borderRadius: '12px',
            padding: '0.875rem 2rem',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            boxShadow: '0 4px 15px rgba(135, 206, 235, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(135, 206, 235, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(135, 206, 235, 0.2)'
          }}
        >
          🔄 Retry / 再試行
        </button>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '0.875rem 2rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          🔄 Reload Page / ページを再読み込み
        </button>
      </div>
      
      <p style={{
        marginTop: '1.5rem',
        fontSize: '0.8rem',
        opacity: 0.6,
        fontStyle: 'italic',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        Error: <code style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '0.2rem 0.4rem', 
          borderRadius: '4px',
          fontFamily: 'Monaco, Consolas, monospace'
        }}>{bootError}</code>
      </p>
    </div>
  )
}

/**
 * Enhanced Loading Screen
 */
const LoadingScreen: React.FC = () => {
  const { isBooting } = useAppState()
  const loadingRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isBooting && loadingRef.current) {
      // Hide loading screen with animation
      loadingRef.current.style.opacity = '0'
      loadingRef.current.style.visibility = 'hidden'
      setTimeout(() => {
        if (loadingRef.current) {
          loadingRef.current.style.display = 'none'
        }
      }, 800)
    }
  }, [isBooting])
  
  if (!isBooting) return null
  
  return (
    <div 
      ref={loadingRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #87CEEB 0%, #4682B4 50%, #191970 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        color: 'white',
        fontSize: '1.5rem',
        textAlign: 'center',
        transition: 'opacity 0.8s ease-out, visibility 0.8s ease-out'
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        animation: 'loadingPulse 2s ease-in-out infinite alternate'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '4px solid rgba(255, 255, 255, 0.2)',
          borderTop: '4px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          animation: 'spin 2s linear infinite',
          filter: 'drop-shadow(0 0 20px rgba(135, 206, 235, 0.6))'
        }} />
        
        <div>
          <div style={{
            fontSize: '1.6rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            letterSpacing: '0.5px',
            textShadow: '0 2px 15px rgba(0, 0, 0, 0.3)'
          }}>
            Diving into the Ocean...
          </div>
          <div style={{
            fontSize: '1.1rem',
            opacity: 0.8,
            fontStyle: 'italic'
          }}>
            海の世界へ潜っています...
          </div>
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: '4rem',
          fontSize: '0.9rem',
          opacity: 0.7,
          textAlign: 'center',
          maxWidth: '80%',
          lineHeight: '1.4'
        }}>
          ✨ Enhanced v3.0 • Safe Boot System • GLTF Fallback • 8s Watchdog
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          fontSize: '0.8rem',
          opacity: 0.5,
          fontWeight: '300'
        }}>
          Powered by React Three Fiber + GSAP + Zustand
        </div>
      </div>
      
      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes loadingPulse {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(1.02); opacity: 1; }
        }
        `}
      </style>
    </div>
  )
}

/**
 * Main Overlay Component with all UI elements
 */
const Overlay: React.FC = () => {
  const { 
    activePanel, 
    showUI, 
    protocolWarning,
    bootError,
    isBooting,
    depth,
    isDiving,
    canResurface,
    safeMode,
    setActivePanel,
    setDiving,
    handleFirstScroll
  } = useAppState()
  
  return (
    <>
      {/* Protocol Warning - Highest priority */}
      {protocolWarning && <ProtocolWarning />}
      
      {/* Loading Screen */}
      {isBooting && <LoadingScreen />}
      
      {/* Boot Error Banner */}
      {bootError && <BootErrorBanner />}
      
      {/* Main UI - Only show when not booting and UI is enabled */}
      {!isBooting && showUI && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000
        }}>
          {/* Safe Mode Indicator */}
          {safeMode && (
            <div style={{
              position: 'fixed',
              top: protocolWarning ? '6rem' : '1rem',
              right: '1rem',
              background: 'rgba(135, 206, 235, 0.9)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              pointerEvents: 'auto',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 15px rgba(135, 206, 235, 0.3)'
            }}>
              🛡️ Safe Mode
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div style={{
            position: 'fixed',
            top: protocolWarning ? '6rem' : (safeMode ? '4rem' : '2rem'),
            left: '2rem',
            display: 'flex',
            gap: '1rem',
            pointerEvents: 'auto'
          }}>
            {['About', 'Works', 'Contact'].map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel.toLowerCase() as any)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {panel}
              </button>
            ))}
          </div>
          
          {/* Dive Controls */}
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            pointerEvents: 'auto'
          }}>
            {!isDiving && depth < 0.1 && (
              <button
                onClick={() => {
                  setDiving(true)
                  handleFirstScroll()
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.8), rgba(41, 182, 246, 0.9))',
                  border: '2px solid rgba(79, 195, 247, 0.6)',
                  borderRadius: '50px',
                  padding: '1rem 2rem',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(79, 195, 247, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(79, 195, 247, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 195, 247, 0.3)'
                }}
              >
                🌊 Dive / ダイブ
              </button>
            )}
            
            {canResurface && depth > 0.3 && (
              <button
                onClick={() => {
                  // Surface logic would go here
                  if (import.meta.env.DEV) {
                    console.info('[UI] Surface button clicked')
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.8), rgba(173, 216, 230, 0.9))',
                  border: '2px solid rgba(135, 206, 235, 0.6)',
                  borderRadius: '50px',
                  padding: '1rem 2rem',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(135, 206, 235, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(135, 206, 235, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(135, 206, 235, 0.3)'
                }}
              >
                🏄 Surface / 浮上
              </button>
            )}
          </div>
          
          {/* Depth Indicator */}
          {depth > 0.1 && (
            <div style={{
              position: 'fixed',
              bottom: '2rem',
              left: '2rem',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              pointerEvents: 'auto',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              🌊 Depth: {Math.round(depth * 100)}% / 深度: {Math.round(depth * 100)}%
            </div>
          )}
        </div>
      )}
      
      {/* Modal Panels */}
      {activePanel === 'about' && <AboutPanel />}
      {activePanel === 'works' && <WorksPanel />}
      {activePanel === 'contact' && <ContactPanel />}
    </>
  )
}

export default Overlay
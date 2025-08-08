import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Lazy load non-critical CSS
const loadCSS = (href) => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  link.onload = () => {
    link.onload = null
    link.media = 'all'
  }
  link.media = 'print'
  document.head.appendChild(link)
}

// Load components CSS after critical render
setTimeout(() => {
  loadCSS('./src/styles/components.css')
}, 100)

// Load animations CSS after user interaction or 2s delay
const loadAnimations = () => {
  loadCSS('./src/styles/animations.css')
  document.removeEventListener('touchstart', loadAnimations)
  document.removeEventListener('mousedown', loadAnimations)
  document.removeEventListener('keydown', loadAnimations)
}

document.addEventListener('touchstart', loadAnimations, { passive: true })
document.addEventListener('mousedown', loadAnimations, { passive: true })
document.addEventListener('keydown', loadAnimations, { passive: true })
setTimeout(loadAnimations, 2000)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
import React from 'react'

const Loading = () => {
  return (
    <div className="loading" id="loading">
      <div>
        <div className="loading-spinner"></div>
        <div>Diving into the Ocean...</div>
        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
          海の世界へ潜っています...
        </div>
      </div>
    </div>
  )
}

export default Loading
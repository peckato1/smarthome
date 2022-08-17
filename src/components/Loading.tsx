import React from 'react'

export function LoadingSpinner({ visible }: { visible: boolean }) {
  if (!visible)
    return <React.Fragment />

  return (
    <div className="d-flex justify-content-center">
      <div className="spinner-grow text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}



import React from 'react'

export function ErrorAlert({ error }: { error?: Error }) {
  if (!error)
    return <React.Fragment />

  return (
    <div className="alert alert-danger" role="alert">
      {error.message}
    </div>
  )
}


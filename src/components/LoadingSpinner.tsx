export default function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center">
      <div className="spinner-grow text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}

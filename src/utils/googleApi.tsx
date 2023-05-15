import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import { useGoogleApiContext } from 'hooks/GoogleApiContext'

export function Auth() {
  const { ready, login, tokens } = useGoogleApiContext()

  if (ready) {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => alert(tokens?.username)}>
        <FontAwesomeIcon icon={solid("user")} />
      </button>
    )
  }

  return (
    <button type="button" className="btn btn-info" onClick={login}>
      Sign in with Google 🚀{' '}
    </button>
  )
}



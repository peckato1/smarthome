import { createContext, useContext, useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import jwt_decode from "jwt-decode"
import dayjs from 'dayjs'
import axios from 'axios'

import { getStorage, setStorage } from 'utils/storage'

const BACKEND_TOKEN = 'https://app.pecka.me/auth/google'
const BACKEND_REFRESH_TOKEN = 'https://app.pecka.me/auth/google/refresh-token'

interface TokenResponse {
  access_token: string
  id_token: string
  refresh_token: string
  expiry_date: number
}

interface TokenResponseWithUserInfo extends TokenResponse {
  username: string
}

export interface GoogleApiContext {
  ready: boolean
  tokens?: TokenResponseWithUserInfo
  fetchData: (url: string, opts?: FetchOptions) => Promise<any>
  login: () => void
}

type ObjMap<V> = {
  [key: string]: V
}

interface FetchOptions {
  params?: ObjMap<string|number>
  headers?: ObjMap<string>
}

const dummyFetchData = (url: string, opts: FetchOptions = {}): Promise<any> => { return new Promise<any>(undefined as any) }

const Context = createContext({ready: false, fetchData: dummyFetchData, tokens: undefined} as GoogleApiContext)

function GoogleApiContextProvider({ children, scopes }: { children: React.ReactNode, scopes: string[] }) {
  const [tokenResponse, setTokenResponse] = useState<TokenResponseWithUserInfo>(getStorage('_auth.GoogleApi'))

  const renewState = (data: TokenResponseWithUserInfo) => {
      const jwtDecoded = jwt_decode(data.id_token) as any
      const state: TokenResponseWithUserInfo = {...data, 'username': jwtDecoded.email}
      setTokenResponse(() => state)
      setStorage('_auth.GoogleApi', state)
  }

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      const tokens = await axios.post(BACKEND_TOKEN, { code: code })
      renewState(tokens.data)
    },
    scope: scopes.join(' ')
  })

  const fetchData = async (url: string, opts: FetchOptions = {}) => {
    if (tokenResponse.expiry_date <= +dayjs().add(5, 'second')) {
      const tokens = await axios.post(BACKEND_REFRESH_TOKEN, { refreshToken: tokenResponse.refresh_token })
      renewState(tokens.data)
    }

    return axios.get(url, {
      headers: { ...opts.headers, Authorization: `Bearer ${tokenResponse.access_token}` },
      params: opts.params,
    })
  }

  const value = {
    ready: tokenResponse !== undefined,
    tokens: tokenResponse,
    fetchData: tokenResponse === undefined ? dummyFetchData : fetchData,
    login: login,
  }

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}

export default GoogleApiContextProvider
export const useGoogleApiContext = () => useContext(Context);

import { createContext, useContext } from 'react'
import axios from 'axios'

export interface GolemioApiContext {
  fetchData: (urlEndpoint: string, opts: FetchOptions) => Promise<any>
}

type ObjMap<V> = {
  [key: string]: V
}

interface FetchOptions {
  params?: ObjMap<string|number>
  headers?: ObjMap<string>
}

const BASE_URL = 'https://api.golemio.cz/v2/pid/'

const Context = createContext({} as GolemioApiContext)

function GolemioApiContextProvider({ children, apiKey, params = {}}: { children: React.ReactNode, apiKey: string, params?: any }) {
  const fetchData = async (urlEndpoint: string, opts: FetchOptions) => {
    return axios.get(`${BASE_URL}${urlEndpoint}`, {
      headers: {
        ...opts.headers,
        'x-access-token': apiKey,
        'Content-Type': 'application/json; charset=utf-8'
      },
      params: { ...params, ...opts.params },
    })
  }

  return (
    <Context.Provider value={{fetchData: fetchData}}>
      {children}
    </Context.Provider>
  )
}

export default GolemioApiContextProvider
export const useGolemioApiContext = () => useContext(Context);


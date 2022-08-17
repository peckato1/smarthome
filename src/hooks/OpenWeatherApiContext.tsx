import { createContext, useContext } from 'react'
import axios from 'axios'

export interface OpenWeatherApiContext {
  fetchData: (urlEndpoint: string, opts: FetchOptions) => Promise<any>
}

type ObjMap<V> = {
  [key: string]: V
}

interface FetchOptions {
  params?: ObjMap<string|number>
  headers?: ObjMap<string>
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5/'

const Context = createContext({} as OpenWeatherApiContext)

function OpenWeatherApiContextProvider({ children, apiKey, params = {}}: { children: React.ReactNode, apiKey: string, params?: any }) {
  const fetchData = async (urlEndpoint: string, opts: FetchOptions) => {
    return axios.get(`${BASE_URL}${urlEndpoint}`, {
      headers: { ...opts.headers },
      params: { ...params, appid: apiKey, ...opts.params },
    })
  }

  return (
    <Context.Provider value={{fetchData: fetchData}}>
      {children}
    </Context.Provider>
  )
}

export default OpenWeatherApiContextProvider
export const useOpenWeatherApiContext = () => useContext(Context);


import { useEffect, useState } from 'react'
import { useOpenWeatherApiContext } from 'hooks/OpenWeatherApiContext'

const REFRESH_INTERVAL_MS = 30 * 1000

const useWeatherData = (endpoint: string, params: { lat: number, lon: number }) => {
  const { fetchData } = useOpenWeatherApiContext()
  const [ data, setData ] = useState<any>()
  const [ error, setError ] = useState<Error|undefined>()

  useEffect(() => {
    const f = () => fetchData(endpoint, { params: { lat: params.lat, lon: params.lon } })
      .then((resp) => {
        setData(() => resp.data)
        setError(() => undefined)
      })
      .catch((error) => {
        setData(() => undefined)
        setError(() => error)
        console.log(error)
      })

    const interval = setInterval(f, REFRESH_INTERVAL_MS)
    f()

    return () => {
      clearInterval(interval);
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty dependency array, useEffect is called only at first mount

  return { data: data, error: error }
}

export default useWeatherData

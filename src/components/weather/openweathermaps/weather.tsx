import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'

import { useOpenWeatherApiContext } from 'hooks/OpenWeatherApiContext'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import { ErrorAlert } from 'components/Error'
import { LoadingSpinner } from 'components/Loading'

import { WeatherIcon } from './WeatherIcon'

const REFRESH_INTERVAL_MS = 30 * 1000

dayjs.extend(dayOfYear)

function WindDetail({ data }: { data: { speed: number, deg: number, gust: number } }) {
  return (
    <React.Fragment>
      <WeatherIcon icon={`wi-strong-wind`} /> { data.deg !== undefined && ( <WeatherIcon icon={`wi-wind from-${data.deg}-deg`} /> )}
      &nbsp;<span className="fw-bold">{data.speed}&nbsp;km/h</span>
      { data.gust && (
        <React.Fragment>
          &nbsp;({data.gust}&nbsp;km/h)
        </React.Fragment>
      )}

    </React.Fragment>
  )
}

function CloudDetail({ data }: { data: { all: number } }) {
  return (
    <React.Fragment>
      <WeatherIcon icon={`wi-cloudy`} /> {data.all}%
    </React.Fragment>
  )
}

function TemperatureDetail({ data, compact = false }: { data: { temp: number, feels_like: number, temp_min: number, temp_max: number }, compact?: boolean }) {
  return (
    <React.Fragment>
      <WeatherIcon icon="wi-thermometer" /> <span className="fw-bold">{data.temp} <WeatherIcon icon="wi-celsius" /></span>
      &nbsp;<small className="text-muted">(<FontAwesomeIcon icon={solid("person")} /> {data.feels_like} <WeatherIcon icon="wi-celsius" />)</small>

      { compact !== true && !(data.temp_min === data.temp && data.temp_min === data.temp_max) && (
        <React.Fragment>
          &nbsp;<small>({data.temp_min} <WeatherIcon icon="wi-celsius" /> - {data.temp_max} <WeatherIcon icon="wi-celsius" />)</small>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

function PressureDetail({ data }: { data: { pressure: number, sea_level: number, grnd_level: number } }) {
  return (
    <React.Fragment>
      <WeatherIcon icon="wi-barometer" /> {data.pressure} hPa
    </React.Fragment>
  )
}

function HumidityDetail({ data }: { data: { humidity: number } }) {
  return (
    <React.Fragment>
      <WeatherIcon icon="wi-humidity" /> {data.humidity}%
    </React.Fragment>
  )
}

function WeatherDetail({ data, compact = false }: { compact?: boolean, data: { id: number, main: string, icon: string, description: string }[] }) {
  return (
    <React.Fragment>
      {data.map(w => ( <WeatherIcon key={w.id} icon={`wi-owm-${w.id}`} /> ))}
      { compact !== true && ( <span className="fw-bold">{data.map(w => w.description).join(", ")}</span> )}
    </React.Fragment>
  )
}

function VisibilityDetail({ visibility }: { visibility: number }) {
  return (
    <React.Fragment>
      <FontAwesomeIcon icon={solid("eye")} /> {
        visibility === 10000 ?
          ( <FontAwesomeIcon icon={solid("infinity")} /> ) :
          visibility + " m"
      }
    </React.Fragment>
  )
}

function PrecipDetail({ pop, snow, rain }: { pop?: number, snow: { [key: string]: number }, rain: { [key: string]: number } }) {
  return (
    <React.Fragment>
	  <WeatherIcon icon="wi-umbrella" />
        &nbsp;{pop ? pop * 100 : 0}%
      {rain && (
        <React.Fragment>
          &nbsp;<WeatherIcon icon="wi-showers" /> { rain['3h'] } mm
        </React.Fragment>
      )}
      {snow && (
        <React.Fragment>
          &nbsp;<WeatherIcon icon="wi-snow" /> { snow['3h'] } mm
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

function SunriseDetail({ sunrise, sunset} : { sunrise: dayjs.Dayjs, sunset: dayjs.Dayjs }) {
  return (
    <React.Fragment>
	  <WeatherIcon icon="wi-sunrise" /> { sunrise.format('HH:mm') } <WeatherIcon icon="wi-sunset" /> { sunset.format('HH:mm') }
    </React.Fragment>
  )
}

const uniqueDays = (timestamps: number[]) => {
  let res: dayjs.Dayjs[] = []

  timestamps.forEach(ts => {
    let cts: dayjs.Dayjs = dayjs.unix(ts)
    if (res.length === 0 || res[res.length - 1].dayOfYear() !== cts.dayOfYear()) {
      res.push(cts)
    }
  })
  return res
}

function ForecastRow({ data, compact = false }: { data: any, compact?: boolean }) {
  return (
    <div className="d-flex flex-row flex-wrap">
      <div className="col-sm-1 me-3"><span className="fw-bold">{dayjs.unix(data.dt).format('H:mm')}</span></div>
      <div className="col-sm-1 me-3"><WeatherDetail data={data.weather} compact={compact} /></div>
      <div className="col-sm-2 me-3"><TemperatureDetail data={data.main} compact /></div>
      <div className="col-sm-2 me-3"><WindDetail data={data.wind} /></div>
      <div className="col-sm-1 me-3"><PrecipDetail rain={data.rain} snow={data.snow} /></div>
      {compact !== true && (
        <React.Fragment>
          <div className="col-sm-1 me-3"><PressureDetail data={data.main} /> </div>
          <div className="col-sm-1 me-3"><HumidityDetail data={data.main} /> </div>
          <div className="col-sm-1 me-3"><CloudDetail data={data.clouds} /> </div>
          <div className="col-sm-1 me-3"><VisibilityDetail visibility={data.visibility} /> </div>
        </React.Fragment>
      )}
    </div>
  )
}

function WeatherForecastTable({ data, compact = false, short = false }: { data: any, compact?: boolean, short?: boolean }) {
  const daysInForecast = data ? uniqueDays(data.list.map((e: any) => e.dt)) : []

  if (!data) {
    return null
  }

  return (
    <ul className="list-group">
      { data && daysInForecast.filter((e, i) => short === true ? i === 0 : true).map((day: dayjs.Dayjs) => (
        <React.Fragment>
        <li key={+day} className="list-group-item list-group-item-primary">
          {day.format('dddd DD. MM')}
        </li>
        {data.list.filter((d: any) => dayjs.unix(d.dt).dayOfYear() === day.dayOfYear()).map((d: any) => (
          <li key={+d.dt} className="list-group-item">
            <ForecastRow data={d} compact={compact} />
          </li>
        ))}
        </React.Fragment>
      ))}
    </ul>
  )
}

interface WeatherForecastProps {
  lat: number
  lon: number
  n?: number
  compact?: boolean
  short?: boolean
}
export function WeatherForecast(props: WeatherForecastProps) {
  const [ data, setData ] = useState<any>(undefined);
  const [ error, setError ] = useState<Error|undefined>(undefined);
  const { fetchData } = useOpenWeatherApiContext()

  useEffect(() => {
    const f = () => fetchData('forecast', { params: { lat: props.lat, lon: props.lon } })
      .then((resp) => setData(() => resp.data))
      .catch((error) => {
        setError(() => error)
        console.log(error)
      })

	const interval = setInterval(f, REFRESH_INTERVAL_MS)
	f()

	return () => { clearInterval(interval); };
  }, [props, fetchData]);

  return (
    <div className="p-1 bg-light border rounded-3">
      <LoadingSpinner visible={!data && !error} />
      <ErrorAlert error={error} />
      <WeatherForecastTable data={data} short={props.short} compact={props.compact} />
    </div>
  )
}

function CurrentWeatherImpl({ data, compact = false }: { data: any, compact?: boolean }) {
  if (!data) {
    return <React.Fragment />
  }

  return (
    <div className="">
      <h4>
        {data.name} <small className="text-muted float-end">{ dayjs.unix(data.dt).format('HH:mm:ss')}</small>
      </h4>

      <div className="d-flex flex-row flex-wrap">
        <div className="me-3 col-sm-1"><WeatherDetail data={data.weather} compact={compact} /> </div>
        <div className="me-3 col-sm-2"><TemperatureDetail data={data.main} compact={compact} /> </div>
        <div className="me-3 col-sm-2"><WindDetail data={data.wind} /> </div>
        <div className="me-3 col-sm-1"><PrecipDetail rain={data.rain} snow={data.snow} /> </div>
        { compact !== true && (
          <React.Fragment>
            <div className="me-3 col-sm-1"><PressureDetail data={data.main} /> </div>
            <div className="me-3 col-sm-1"><HumidityDetail data={data.main} /> </div>
            <div className="me-3 col-sm-1"><CloudDetail data={data.clouds} /> </div>
            <div className="me-3 col-sm-1"><VisibilityDetail visibility={data.visibility} /> </div>
            <div className="me-3 col-sm-1"><SunriseDetail sunrise={dayjs.unix(data.sys.sunrise)} sunset={dayjs.unix(data.sys.sunset)} /> </div>
          </React.Fragment>
        )}

      </div>
    </div>
  )
}

interface WeatherProps {
  lat: number
  lon: number
  compact?: boolean
}
export function CurrentWeather(props: WeatherProps) {
  const [ data, setData ] = useState<any>(undefined);
  const [ error, setError ] = useState<Error|undefined>(undefined);
  const { fetchData } = useOpenWeatherApiContext()

  useEffect(() => {
    const f = () => fetchData('weather', { params: { lat: props.lat, lon: props.lon } })
      .then((resp) => setData(() => resp.data))
      .catch((error) => {
        setError(() => error)
        console.log(error)
      })

	const interval = setInterval(f, REFRESH_INTERVAL_MS)
	f()

	return () => { clearInterval(interval); };
  }, [props, fetchData]);

  return (
    <div className="p-1 bg-light border rounded-3">
      <LoadingSpinner visible={!data && !error} />
      <ErrorAlert error={error} />
      <CurrentWeatherImpl data={data} compact={props.compact} />
    </div>
  )
}


export default function Weather({ lat, lon }: { lat: number, lon: number }) {
  return (
    <div className="container-fluid">
      <CurrentWeather lat={lat} lon={lon} />
      <WeatherForecast lat={lat} lon={lon} />
    </div>
  );
}


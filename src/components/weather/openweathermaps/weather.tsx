import React from 'react'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import { ErrorAlert } from 'components/Error'
import { LoadingSpinner } from 'components/Loading'
import useWeatherData from 'hooks/fetchOpenWeatherData'
import { WeatherIcon } from 'components/weather/openweathermaps/WeatherIcon'

dayjs.extend(dayOfYear)

interface LatLon {
  lat: number
  lon: number
}


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

function TemperatureDetail({ data, short }: { data: { temp: number, feels_like: number, temp_min: number, temp_max: number }, short?: boolean }) {
  return (
    <React.Fragment>
      <WeatherIcon icon="wi-thermometer" /> <span className="fw-bold">{data.temp} <WeatherIcon icon="wi-celsius" /></span> <small className="text-muted">(<FontAwesomeIcon icon={solid("person")} /> {data.feels_like} <WeatherIcon icon="wi-celsius" />)</small>

      { short !== true && !(data.temp_min === data.temp && data.temp_min === data.temp_max) && (
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
      {data.map(w => ( <WeatherIcon key={w.id} icon={`wi-owm-${w.id}`} /> ))} { compact !== true && ( <span className="fw-bold">{data.map(w => w.description).join(", ")}</span> )}
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

function ForecastRow({ data }: { data: any }) {
  return (
    <div className="d-flex flex-row">
      <div>
        <span className="fw-bold">{dayjs.unix(data.dt).format('H:mm')}</span>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-3 gs-1"><WeatherDetail data={data.weather} /></div>
          <div className="col-sm-5 gs-1"><TemperatureDetail data={data.main} /></div>
          <div className="col-sm-4 gs-1"><PrecipDetail pop={data.pop} rain={data.rain} snow={data.snow} /></div>
        </div>
        <div className="row">
          <div className="col-sm-3 gs-1"><PressureDetail data={data.main} /> </div>
          <div className="col-sm-2 gs-1"><CloudDetail data={data.clouds} /> </div>
          <div className="col-sm-2 gs-1"><HumidityDetail data={data.main} /> </div>
          <div className="col-sm-4 gs-1"><WindDetail data={data.wind} /></div>
        </div>
      </div>
    </div>
  )
}

function ForecastRowCompact({ data }: { data: any }) {
  return (
    <div className="d-flex flex-row">
      <div className="col-sm-1"><span className="fw-bold">{dayjs.unix(data.dt).format('H:mm')}</span></div>
      <div className="col-sm-1"><WeatherDetail data={data.weather} compact /></div>
      <div className="col-sm-3"><TemperatureDetail data={data.main} short /></div>
      <div className="col-sm-4"><WindDetail data={data.wind} /></div>
      <div className="col-sm-3"><PrecipDetail pop={data.pop} rain={data.rain} snow={data.snow} /></div>
    </div>
  )
}

export function WeatherForecast(props: LatLon) {
  const { data, error } = useWeatherData('forecast', { lat: props.lat, lon: props.lon })
  const daysInForecast = data ? uniqueDays(data.list.map((e: any) => e.dt)) : []

  return (
    <div className="p-1 bg-light border rounded-3">
      <LoadingSpinner visible={!data && !error} />
      <ErrorAlert error={error} />
      { data && (
        <ul className="list-group">
          { data && daysInForecast.map((day: dayjs.Dayjs) => (
            <React.Fragment key={+day}>
              <li className="list-group-item list-group-item-primary p-1">
                {day.format('dddd DD. MM')}
              </li>
              {data.list.filter((d: any) => dayjs.unix(d.dt).dayOfYear() === day.dayOfYear()).map((d: any) => (
                <li key={+d.dt} className="list-group-item p-1">
                  <ForecastRow data={d} />
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  )
}

export function WeatherForecastCompact(props: LatLon) {
  const { data, error } = useWeatherData('forecast', { lat: props.lat, lon: props.lon })

  return (
    <div className="p-1 bg-light border rounded-3">
      <LoadingSpinner visible={!data && !error} />
      <ErrorAlert error={error} />
      { data && (
        <ul className="list-group">
          { data && data.list.slice(0, 6).map((d: any) => (
            <li key={+d.dt} className="list-group-item p-1">
              <ForecastRowCompact data={d} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function CurrentWeatherCompact(props: LatLon) {
  const { data, error } = useWeatherData('weather', { lat: props.lat, lon: props.lon })

  return (
    <div className="p-1 bg-light border rounded-3">
      <LoadingSpinner visible={!data && !error} />
      <ErrorAlert error={error} />
      { data && (
        <div className="d-flex flex-row p-0">
          <span className="h4 mb-0 me-3">{data.name}</span>
          <div className="me-3"><WeatherDetail data={data.weather} /> </div>
          <div className="me-3"><TemperatureDetail data={data.main} short /> </div>
          <div className="me-3"><WindDetail data={data.wind} /> </div>
          <div className="me-3"><PrecipDetail rain={data.rain} snow={data.snow} /> </div>
        </div>
      )}
    </div>
  )
}

export function CurrentWeather(props: LatLon) {
  const { data, error } = useWeatherData('weather', { lat: props.lat, lon: props.lon })

  return (
    <div className="p-1 bg-light border rounded-3">
      <LoadingSpinner visible={!data && !error} />
      <ErrorAlert error={error} />
      { data && (
        <div>
          <h4>
            {data.name} <small className="text-muted float-end">@ { dayjs.unix(data.dt).format('HH:mm:ss')}</small>
          </h4>

          <div className="d-flex flex-row flex-wrap justify-content-around">
            <div className="me-3"><WeatherDetail data={data.weather} /> </div>
            <div className="me-3"><TemperatureDetail data={data.main} /> </div>
            <div className="me-3"><WindDetail data={data.wind} /> </div>
            <div className="me-3"><PrecipDetail rain={data.rain} snow={data.snow} /> </div>
          </div>
          <div className="d-flex flex-row flex-wrap justify-content-around">
            <div className="me-3"><PressureDetail data={data.main} /> </div>
            <div className="me-3"><HumidityDetail data={data.main} /> </div>
            <div className="me-3"><CloudDetail data={data.clouds} /> </div>
            <div className="me-3"><VisibilityDetail visibility={data.visibility} /> </div>
            <div className="me-3"><SunriseDetail sunrise={dayjs.unix(data.sys.sunrise)} sunset={dayjs.unix(data.sys.sunset)} /> </div>
          </div>
        </div>
    )}
    </div>
  )
}

export default function Weather({ lat, lon }: { lat: number, lon: number }) {
  return (
    <React.Fragment>
      <CurrentWeather lat={lat} lon={lon} />
      <WeatherForecast lat={lat} lon={lon} />
    </React.Fragment>
  );
}


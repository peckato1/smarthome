import React from 'react'
import { CurrentWeatherCompact, WeatherForecastCompact } from 'components/weather/openweathermaps/weather';

export default function DashboardRoute() {
  return (
    <>
      <CurrentWeatherCompact lat={50.0988144} lon={14.3607961} />
      <WeatherForecastCompact lat={50.0988144} lon={14.3607961} />
    </>
  )
}

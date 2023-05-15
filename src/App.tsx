import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleApiContextProvider from 'hooks/GoogleApiContext'
import { Auth as GoogleAuth } from 'utils/googleApi'

import OpenWeatherApiContextProvider from 'hooks/OpenWeatherApiContext'
import GolemioApiContextProvider from 'hooks/GolemioApiContext'

import CurrentDateTime from "components/CurrentDateTime";
import Calendar, { CalendarCompact} from 'components/calendar/calendar';
import { CreateFilterEventStartsWithin } from 'components/calendar/eventFilters'
import DepartureBoard from 'components/transport/pid/DepartureBoard';
import Weather, { CurrentWeatherCompact, WeatherForecastCompact } from 'components/weather/openweathermaps/weather';
import WeatherRadar from 'components/weather/radar/bourky';

const segments = [
  { path: "/smarthome/",          name: "/",         icon: ( <FontAwesomeIcon icon={solid("home")} /> ) },
  { path: "/smarthome/calendar",  name: "Calendar",  icon: ( <FontAwesomeIcon icon={solid("calendar")} /> ) },
  { path: "/smarthome/transport", name: "Transport", icon: ( <FontAwesomeIcon icon={solid("bus-simple")} /> ) },
  { path: "/smarthome/weather",   name: "Weather",   icon: ( <FontAwesomeIcon icon={solid("cloud-sun-rain")} /> ) },
  { path: "/smarthome/radar",     name: "Radar",     icon: ( <FontAwesomeIcon icon={solid("satellite-dish")} /> ) },
];

function AppReloadButton() {
  return (
    <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
      <FontAwesomeIcon icon={solid("refresh")} />
    </button>
  )
}

function Footer({ authElement }: { authElement: React.ReactNode }) {
  return (
    <div className="navbar fixed-bottom navbar-expand navbar-dark bg-dark border-top">
      <div className="container-fluid">
        <React.Fragment>
          <ul className="nav nav-pills">
            {segments.map(segm => (
              <li className="nav-item" key={segm.path}>
                <NavLink end to={segm.path} className="nav-link me-2" aria-current="page" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title={segm.name}>
                  {segm.icon}
                </NavLink>
              </li>
            ))}
          </ul>
          <div>
            <AppReloadButton />
            {authElement}
          </div>
        </React.Fragment>
      </div>
    </div>
  )
}

const ignoredCalendars = process.env.REACT_APP_IGNORE_GOOGLE_CALENDARS ? JSON.parse(process.env.REACT_APP_IGNORE_GOOGLE_CALENDARS) : []

function Dashboard() {
  return (
    <React.Fragment>
      <CurrentWeatherCompact lat={50.0988144} lon={14.3607961} />
      <WeatherForecastCompact lat={50.0988144} lon={14.3607961} />
      <div className="mb-2" />
      <CalendarCompact filter={CreateFilterEventStartsWithin(1, 'day')} ignoredCalendars={ignoredCalendars} nIfFilteredEmpty={3} />
    </React.Fragment>
  )
}

function App() {
  return (
    <div className="container-fluid" style={{paddingBottom: "75px"}}>
      <header className="row py-1 mb-1 bg-light border-bottom">
        <CurrentDateTime />
      </header>
      <main>
        <BrowserRouter>
          <Routes>
            <Route path="/smarthome/" element={<Dashboard />} />
            <Route path="/smarthome/calendar" element={<Calendar n={10} ignoredCalendars={ignoredCalendars} />} />
            <Route path="/smarthome/transport" element={<DepartureBoard />} />
            <Route path="/smarthome/weather" element={<Weather lat={50.0988144} lon={14.3607961} />} />
            <Route path="/smarthome/radar" element={<WeatherRadar lat={50.0988144} lon={14.3607961} />} />

            <Route path="*" element={<p>404</p>} />
          </Routes>
          <Footer authElement={( <GoogleAuth /> )} />
        </BrowserRouter>
      </main>
    </div>
  )
}

export default function AppWrapper() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <GoogleApiContextProvider scopes={['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events.readonly']}>
        <OpenWeatherApiContextProvider apiKey={process.env.REACT_APP_OPENWEATHER_APIKEY!} params={{units: 'metric'}}>
          <GolemioApiContextProvider apiKey={process.env.REACT_APP_GOLEMIO_APIKEY!}>
            <App />
          </GolemioApiContextProvider>
        </OpenWeatherApiContextProvider>
      </GoogleApiContextProvider>
    </GoogleOAuthProvider>
  )
}

import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleApiContextProvider from 'hooks/GoogleApiContext'
import { Auth as GoogleAuth } from 'utils/googleApi'

import OpenWeatherApiContextProvider from 'hooks/OpenWeatherApiContext'
import GolemioApiContextProvider from 'hooks/GolemioApiContext'

import { todayEvent } from 'utils/time'

import CurrentDateTime from "components/CurrentDateTime";
import Calendar from 'components/calendar/calendar';
import DepartureBoard from 'components/transport/pid/DepartureBoard';
import Weather, { CurrentWeather, WeatherForecast } from 'components/weather/openweathermaps/weather';

const segments = [
  { path: "/smarthome/",         name: "/",         icon: ( <FontAwesomeIcon icon={solid("home")} /> ) },
  { path: "/smarthome/calendar",  name: "Calendar",  icon: ( <FontAwesomeIcon icon={solid("calendar")} /> ) },
  { path: "/smarthome/transport", name: "Transport", icon: ( <FontAwesomeIcon icon={solid("bus-simple")} /> ) },
  { path: "/smarthome/weather",   name: "Weather",   icon: ( <FontAwesomeIcon icon={solid("cloud-sun-rain")} /> ) },
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

const calendars = process.env.REACT_APP_GOOGLE_CALENDARS ? JSON.parse(process.env.REACT_APP_GOOGLE_CALENDARS) : []


function Dashboard() {
  return (
    <div className="container-fluid">
       <div className="row mb-3">
         <CurrentWeather lat={50.0988144} lon={14.3607961} compact />
         <WeatherForecast lat={50.0988144} lon={14.3607961} compact short />
       </div>
       <div className="row mb-3">
         <Calendar calendars={[calendars[0]]} n={3} datefilter={todayEvent} />
       </div>
    </div>
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
            <Route path="/smarthome/calendar" element={<Calendar calendars={calendars} n={10} />} />
            <Route path="/smarthome/transport" element={<DepartureBoard />} />
            <Route path="/smarthome/weather" element={<Weather lat={50.0988144} lon={14.3607961} />} />

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

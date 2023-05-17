import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import CurrentDateTime from "components/CurrentDateTime";
import DepartureBoard from 'components/transport/pid/DepartureBoard';
import Weather, { CurrentWeatherCompact, WeatherForecastCompact } from 'components/weather/openweathermaps/weather';
import WeatherRadar from 'components/weather/radar/bourky';

const segments = [
  { path: "/smarthome/",              name: "/",         icon: ( <FontAwesomeIcon icon={solid("home")} /> ) },
  { path: "/smarthome/transport",     name: "Transport", icon: ( <FontAwesomeIcon icon={solid("bus-simple")} /> ) },
  { path: "/smarthome/weather",       name: "Weather",   icon: ( <FontAwesomeIcon icon={solid("cloud-sun-rain")} /> ) },
  { path: "/smarthome/weather/radar", name: "Radar",     icon: ( <FontAwesomeIcon icon={solid("satellite-dish")} /> ) },
];

function AppReloadButton() {
  return (
    <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
      <FontAwesomeIcon icon={solid("refresh")} />
    </button>
  )
}

function Footer() {
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
          </div>
        </React.Fragment>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <React.Fragment>
      <CurrentWeatherCompact lat={50.0988144} lon={14.3607961} />
      <WeatherForecastCompact lat={50.0988144} lon={14.3607961} />
      <div className="mb-2" />
    </React.Fragment>
  )
}

export default function App() {
  return (
    <div className="container-fluid" style={{paddingBottom: "75px"}}>
      <header className="row py-1 mb-1 bg-light border-bottom">
        <CurrentDateTime />
      </header>
      <main>
        <BrowserRouter>
          <Routes>
            <Route path="/smarthome/" element={<Dashboard />} />
            <Route path="/smarthome/transport" element={<DepartureBoard />} />
            <Route path="/smarthome/weather" element={<Weather lat={50.0988144} lon={14.3607961} />} />
            <Route path="/smarthome/weather/radar" element={<WeatherRadar lat={50.0988144} lon={14.3607961} />} />

            <Route path="*" element={<p>404</p>} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </main>
    </div>
  )
}

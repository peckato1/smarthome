import * as React from "react"
import {
  Outlet,
  NavLink,
} from "react-router-dom"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import CurrentDateTime from 'components/CurrentDateTime'

const segments = [
  { path: "/",              name: "/",         icon: ( <FontAwesomeIcon icon={solid("home")} /> ) },
  { path: "/transport",     name: "Transport", icon: ( <FontAwesomeIcon icon={solid("bus-simple")} /> ) },
  { path: "/weather",       name: "Weather",   icon: ( <FontAwesomeIcon icon={solid("cloud-sun-rain")} /> ) },
  { path: "/weather/radar", name: "Radar",     icon: ( <FontAwesomeIcon icon={solid("satellite-dish")} /> ) },
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

export default function Root() {
  return (
    <div className="container-fluid" style={{paddingBottom: "75px"}}>
      <header className="row py-1 mb-1 bg-light border-bottom">
        <CurrentDateTime />
      </header>
      <main>
        <Outlet />
        <Footer />
      </main>
    </div>
  )
}

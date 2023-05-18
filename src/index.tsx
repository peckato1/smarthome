import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import dayjs from 'dayjs'
import cs from 'dayjs/locale/cs'

import OpenWeatherApiContextProvider from 'hooks/OpenWeatherApiContext'
import GolemioApiContextProvider from 'hooks/GolemioApiContext'

import Root from 'routes/root'
import Dashboard from 'routes/dashboard'
import DepartureBoard from 'routes/transport'
import Weather from 'routes/weather'
import WeatherRadar from 'routes/weatherRadar'

dayjs.locale(cs)

const queryClient = new QueryClient()

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [{
      index: true,
      element: <Dashboard />
    }, {
      path: "transport",
      element: <DepartureBoard />,
    }, {
      path: "weather",
      children: [{
        index: true,
        element: <Weather />,
      }, {
        path: "radar",
        element: <WeatherRadar />,
      }],
    }]
  }
], { basename: '/smarthome'})

root.render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} position="top-right" />
    <OpenWeatherApiContextProvider apiKey={process.env.REACT_APP_OPENWEATHER_APIKEY!} params={{units: 'metric'}}>
      <GolemioApiContextProvider apiKey={process.env.REACT_APP_GOLEMIO_APIKEY!}>
        <RouterProvider router={routes} />
      </GolemioApiContextProvider>
    </OpenWeatherApiContextProvider>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

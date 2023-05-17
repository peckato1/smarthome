import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

import App from './App'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import dayjs from 'dayjs'
import cs from 'dayjs/locale/cs'

import OpenWeatherApiContextProvider from 'hooks/OpenWeatherApiContext'
import GolemioApiContextProvider from 'hooks/GolemioApiContext'

dayjs.locale(cs)

const queryClient = new QueryClient()

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <OpenWeatherApiContextProvider apiKey={process.env.REACT_APP_OPENWEATHER_APIKEY!} params={{units: 'metric'}}>
      <GolemioApiContextProvider apiKey={process.env.REACT_APP_GOLEMIO_APIKEY!}>
        <App />
      </GolemioApiContextProvider>
    </OpenWeatherApiContextProvider>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

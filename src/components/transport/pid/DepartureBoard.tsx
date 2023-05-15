import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'

import * as model from './model'
import RouteBadge from './RouteBadge'
import { useGolemioApiContext } from 'hooks/GolemioApiContext'

const REFRESH_INTERVAL_MS = 10 * 1000

interface PIDDepartureBoardProps {
	pidStopId: string
	count: number
}
const pad2 = (n: number) => { return (n < 10 ? '0' : '') + n }
const delayed = (d: model.Departure) => {
  if (d.delay.is_available && d.delay.seconds && parseInt(d.delay.seconds!) > 0) {
    let secs = parseInt(d.delay.seconds)
    let dm = Math.floor(secs / 60)
    let ds = secs % 60

    return pad2(dm) + ':' + pad2(ds)
  }
  return undefined
}

function Error({ error }: { error?: Error }) {
  if (!error)
    return <React.Fragment />

  console.error(error)

  return (
    <div className="alert alert-danger" role="alert">
      {error.message}
    </div>
  )
}

function Loading({ visible }: { visible: boolean }) {
  if (!visible)
    return <React.Fragment />

  return (
    <div className="d-flex justify-content-center">
      <div className="spinner-grow text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}

function Infotexts({ data }: { data?: model.Infotext[] }) {
  if (!data || data.length === 0)
    return <React.Fragment />

  return (
    <ul className="list-group">
      {data.map((text, i) => (
        <li key={i} className="list-group-item list-group-item-warning">
          <span className="fw-bold">{text.text}</span><br />
          <small>{ text.valid_from !== null && ( <span>Od: { text.valid_from }</span> ) }</small>
          <small>{ text.valid_to   !== null && ( <span>Do: { text.valid_to   }</span> ) }</small>
        </li>
        )
      )}
    </ul>
  )
}

function Departures({ departures }: { departures?: model.Departure[] }) {
  if (!departures)
    return <React.Fragment />

  return (
    <table className="table table-sm table-striped table-bordered mb-0">
      <tbody>
        {departures.map(d => (
          <tr key={d.stop.id + "/" + d.trip.id}>
            <td className="font-monospace p-0">
              <div className="d-inline-flex flex-row">
                {dayjs(d.departure_timestamp.scheduled).format('H:mm')}
                {delayed(d) && (<span className="ms-1 badge text-bg-warning">+&nbsp;{delayed(d)}</span>)}
              </div>
            </td>
            <td className="p-0">
              <div className="d-inline-flex flex-row">
                <RouteBadge type={d.route.type} name={d.route.short_name} />
                <div className="fw-bold ms-2">{d.trip.headsign}</div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PIDDepartureBoard(props: PIDDepartureBoardProps) {
  const [ time, setTime ] = useState<number>();
  const [ data, setData ] = useState<any>(undefined);
  const [ error, setError ] = useState<Error|undefined>(undefined);
  const { fetchData } = useGolemioApiContext()

  useEffect(() => {
    const getData = () => {
      fetchData('departureboards', { params: { names: props.pidStopId }})
        .then((resp) => {
          setTime(() => Date.now())
          setData(() => resp.data)
          setError(() => undefined)
        })
        .catch((error) => {
          setTime(() => Date.now())
          setData(() => undefined)
          setError(() => error)
          console.log(error)
        })
      }
	const interval = setInterval(getData, REFRESH_INTERVAL_MS)
	getData()
	return () => {
      clearInterval(interval);
	};
  // eslint-disable-next-line
  }, []);

  return (
    <div className="p-1 bg-light border rounded-3">
      <h4 className="mb-1">{props.pidStopId}</h4>
      <Error error={ error } />
      <Loading visible={ data === undefined } />
      <Infotexts data={ data ? ((data as any).infotexts as model.Infotext[]) : undefined } />
      <Departures departures={ data ? ((data as any).departures as model.Departure[]).slice(0, props.count) : undefined } />

      { time && ( <span><small>Last updated on { dayjs(time).format('HH:mm:ss') }</small></span> ) }
    </div>
  )
}

export default function DepartureBoard() {
  const boards = [
    { name: "Sídliště Červený Vrch", count: 7 },
    { name: "Bořislavka", count: 7 },
    { name: "Pučálka", count: 7 },
    { name: "Kosmonosy,nemocnice", count: 7 },
    { name: "Černý Most", count: 27 },
    { name: "Mladá Boleslav,aut.st.", count: 27 },
  ]

  return (
    <div className="row align-items-md-stretch">
      {boards.map(e => (
        <div className="col-sm-6 col-lg-6 col-xl-4 p-1" key={e.name}>
          <PIDDepartureBoard pidStopId={e.name} count={e.count} />
        </div>
      ))}
    </div>
  )

}

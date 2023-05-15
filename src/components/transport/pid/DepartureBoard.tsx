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
    <React.Fragment>
      {departures.map(d => (
        <tr key={d.stop.id + "/" + d.trip.id}>
          <td className="font-monospace p-0 ps-1">
              {dayjs(d.departure_timestamp.scheduled).format('HH:mm')}
          </td>
          <td className="font-monospace p-0 ps-1">
              {delayed(d) && (<span className="ms-1 badge text-bg-warning">+&nbsp;{delayed(d)}</span>)}
          </td>
          <td className="p-0 ps-1">
            <small className="">{dayjs(d.departure_timestamp.predicted).fromNow()}</small>
          </td>
          <td className="p-0 ps-1">
            <div className="d-inline-flex flex-row">
              <RouteBadge type={d.route.type} name={d.route.short_name} />
              <div className="fw-bold ms-2">{d.trip.headsign}</div>
            </div>
          </td>
        </tr>
      ))}
    </React.Fragment>
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
    }
  // eslint-disable-next-line
  }, []);

  return (
      <React.Fragment>
        <thead key={props.pidStopId}>
          <tr className="table-primary">
            <td colSpan={4}>
              {props.pidStopId}
              <span className="float-end text-muted"><small>{dayjs(time).format('HH:mm:ss')}</small></span>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr className={error ? "" : "visually-hidden"}>
            <td colSpan={4}>
              <Error error={ error } />
            </td>
          </tr>
          <tr className={!data ? "" : "visually-hidden"}>
            <td colSpan={4}>
              <Loading visible={ data === undefined } />
            </td>
          </tr>
          <tr className={data && (data as any).infotexts.length > 0 ? "" : "visually-hidden"}>
            <td colSpan={4}>
              <Infotexts data={ data ? ((data as any).infotexts as model.Infotext[]) : undefined } />
            </td>
          </tr>
          <Departures departures={ data ? ((data as any).departures as model.Departure[]).slice(0, props.count) : undefined } />
        </tbody>
      </React.Fragment>
  )
}

export default function DepartureBoard() {
  const boards = [
    { name: "Sídliště Červený Vrch", count: 6 },
    { name: "Bořislavka", count: 6 },
    { name: "Pučálka", count: 7 },
    { name: "Nádraží Veleslavín", count: 7 },
  ]

  return (
    <table className="table table-sm table-striped table-bordered">
      {boards.map(e => (
        <PIDDepartureBoard key={e.name} pidStopId={e.name} count={e.count} />
      ))}
    </table>
  )

}

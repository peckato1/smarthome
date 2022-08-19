import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'

import * as model from './model'
import { RouteBadge, FilterBadge } from './Badges'
import { useGolemioApiContext } from 'hooks/GolemioApiContext'

const REFRESH_INTERVAL_MS = 10 * 1000

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

interface Filter {
  icon: React.ReactElement
  func: (d: model.Departure) => boolean
  active?: boolean
}

function FilterIcon({ icon, active, onClick }: { icon: React.ReactElement, active: boolean, onClick: any}) {
  const styles = active ? undefined : { opacity: "0.5" }

  // eslint-disable-next-line
  return ( <a role="button" className="p-0 ps-1" style={styles} onClick={onClick}> {icon} </a> )
}

interface PIDDepartureBoardProps {
  pidStopId: string
  count: number
  filters: Filter[]
}
function PIDDepartureBoard(props: PIDDepartureBoardProps) {
  const [ time, setTime ] = useState<number>();
  const [ data, setData ] = useState<any>(undefined);
  const [ error, setError ] = useState<Error|undefined>(undefined);
  const { fetchData } = useGolemioApiContext()
  const [ activeFilters, setActiveFilters] = useState<number[]>(props.filters.filter(f => f.active === true).map((f, i) => i))

  useEffect(() => {
    const getData = () => {
      fetchData('departureboards', { params: { names: props.pidStopId, limit: 40 }})
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


  const filterDepartures = (departures: model.Departure[]) => {
    if (activeFilters.length === 0) {
      return departures
    }
    return departures.filter(dept => activeFilters.some(filterIndex => props.filters[filterIndex].func(dept)))
  }

  const toggleActiveFilter = (filterIndex: number) => {
    setActiveFilters((prevState: number[]) => {
      if (!prevState.includes(filterIndex)) {
        return [...prevState, filterIndex]
      } else {
        return prevState.filter((e) => e !== filterIndex)
      }
    })
  }

  return (
      <React.Fragment>
        <thead key={props.pidStopId}>
          <tr className="table-primary">
            <td colSpan={4}>
              <div className="d-flex flex-row justify-content-between">
                <span className="fw-bold">{props.pidStopId}</span>
                <div className="btn-group" role="group" aria-label="Filters">
                  { props.filters.map((filter, index) => (
                      <FilterIcon key={index} icon={filter.icon} active={activeFilters.length === 0 || activeFilters.includes(index)} onClick={() => toggleActiveFilter(index)} />
                  ))}
                  { props.filters.length > 0 && (
                    <button type="button" className="btn-close" aria-label="Clear filters" onClick={() => setActiveFilters(() => [])}></button>
                  )}
                </div>
                <span className="text-muted"><small>{dayjs(time).format('HH:mm:ss')}</small></span>
              </div>
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
          <Departures departures={data ? filterDepartures((data as any).departures as model.Departure[]).slice(0, props.count) : undefined} />
        </tbody>
      </React.Fragment>
  )
}

const boards = [
  { name: "Sídliště Červený Vrch", count: 6, filters: [
    { icon: <FilterBadge type="tram"  direction="down" />, func: (d: model.Departure) => +d.route.type === 0 && d.stop.platform_code === 'A', active: true},
    { icon: <FilterBadge type="tram"  direction="up"   />, func: (d: model.Departure) => +d.route.type === 0 && d.stop.platform_code === 'B'},
  ]},
  { name: "Bořislavka", count: 6, filters: [
    { icon: <FilterBadge type="metro" direction="down" />, func: (d: model.Departure) => +d.route.type === 1 && d.stop.platform_code === '1', active: true},
    { icon: <FilterBadge type="tram"  direction="down" />, func: (d: model.Departure) => +d.route.type === 0 && d.stop.platform_code === 'A', active: true},
    { icon: <FilterBadge type="bus"                    />, func: (d: model.Departure) => +d.route.type === 3},
    { icon: <FilterBadge type="metro" direction="up"   />, func: (d: model.Departure) => +d.route.type === 1 && d.stop.platform_code === '2'},
    { icon: <FilterBadge type="tram"  direction="up"   />, func: (d: model.Departure) => +d.route.type === 0 && d.stop.platform_code === 'B'},
  ]},
  { name: "Pučálka", count: 7, filters: [] },
  { name: "Nádraží Veleslavín", count: 7, filters: [] },
]

export default function DepartureBoard() {

  return (
    <table className="table table-sm table-striped table-bordered">
      {boards.map(e => (
        <PIDDepartureBoard key={e.name} pidStopId={e.name} count={e.count} filters={e.filters} />
      ))}
    </table>
  )

}
